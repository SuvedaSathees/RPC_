"use client";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ElementSpec } from "@/lib/three/building";
import { frame } from "@/lib/three/choreography";
import { clamp, easeInOutCubic, easeOutCubic } from "@/lib/utils/math";

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const unitBox = new THREE.BoxGeometry(1, 1, 1);

/** Writes the instance transform for a spec at build progress b. */
function composeSpec(e: ElementSpec, b: number) {
  const [x, y, z] = e.pos;
  const [sx, sy, sz] = e.size;
  const raw = clamp((b - e.t0) / (e.t1 - e.t0));
  let px = x, py = y, pz = z, kx = sx, ky = sy, kz = sz;
  switch (e.anchor) {
    case "bottom": {
      const k = easeInOutCubic(raw);
      ky = sy * k;
      py = y - sy / 2 + ky / 2;
      break;
    }
    case "top": {
      const k = easeInOutCubic(raw);
      ky = sy * k;
      py = y + sy / 2 - ky / 2;
      break;
    }
    case "left": {
      const k = easeInOutCubic(raw);
      kx = sx * k;
      px = x - sx / 2 + kx / 2;
      break;
    }
    case "back": {
      const k = easeInOutCubic(raw);
      kz = sz * k;
      pz = z - sz / 2 + kz / 2;
      break;
    }
    case "rise": {
      const k = easeOutCubic(raw);
      py = y - (sy + 0.1) * (1 - k);
      if (raw <= 0) kx = ky = kz = 0;
      break;
    }
    case "lay": {
      const k = easeOutCubic(raw);
      py = y - sy * (1 - k);
      kx = sx * (0.6 + 0.4 * k);
      kz = sz * (0.6 + 0.4 * k);
      if (raw <= 0) kx = ky = kz = 0;
      break;
    }
    case "center": {
      const k = easeOutCubic(raw);
      kx = sx * k;
      ky = sy * k;
      kz = sz * k;
      py = y - (sy / 2) * (1 - k);
      break;
    }
    case "sink": {
      const a = e.appear ? easeInOutCubic(clamp((b - e.appear[0]) / (e.appear[1] - e.appear[0]))) : 1;
      ky = sy * a;
      py = y - sy / 2 + ky / 2 - sy * easeInOutCubic(raw);
      if (raw >= 1) kx = ky = kz = 0;
      break;
    }
  }
  _p.set(px, py, pz);
  _s.set(kx || 1e-5, ky || 1e-5, kz || 1e-5);
  if (kx === 0 || ky === 0 || kz === 0) _s.set(0, 0, 0);
  _m.compose(_p, _q, _s);
  return _m;
}

interface Props {
  specs: ElementSpec[];
  material: THREE.Material;
  geometry?: THREE.BufferGeometry;
  castShadow?: boolean;
  receiveShadow?: boolean;
  /** override build progress (e.g. studio renders) */
  getBuild?: () => number;
}

export function AnimatedBoxes({ specs, material, geometry, castShadow = true, receiveShadow = true, getBuild }: Props) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const last = useRef(-1);
  const geo = geometry ?? unitBox;
  const count = specs.length;
  const bounds = useMemo(() => {
    // static bounds of the final state — keeps frustum culling cheap & correct
    const box = new THREE.Box3();
    for (const s of specs) {
      box.expandByPoint(new THREE.Vector3(s.pos[0] - s.size[0], s.pos[1] - s.size[1] * 2, s.pos[2] - s.size[2]));
      box.expandByPoint(new THREE.Vector3(s.pos[0] + s.size[0], s.pos[1] + s.size[1], s.pos[2] + s.size[2]));
    }
    return box.getBoundingSphere(new THREE.Sphere());
  }, [specs]);

  const update = (b: number) => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) mesh.setMatrixAt(i, composeSpec(specs[i]!, b));
    mesh.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.boundingSphere = bounds;
    update(getBuild ? getBuild() : frame.build);
    last.current = -1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs, bounds]);

  useFrame(() => {
    const b = getBuild ? getBuild() : frame.build;
    if (Math.abs(b - last.current) < 1e-5) return;
    last.current = b;
    update(b);
  });

  if (count === 0) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[geo, material, count]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled
    />
  );
}
