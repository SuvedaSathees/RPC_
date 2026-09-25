"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { dims, type BuildingConfig } from "@/lib/three/building";
import { frame } from "@/lib/three/choreography";
import { easeInOutCubic, range } from "@/lib/utils/math";

/** Lattice section of length L along +Y (mast) — chords, rings and diagonals. */
function lattice(L: number, w: number, step: number, t = 0.09) {
  const parts: THREE.BufferGeometry[] = [];
  const bar = (len: number) => new THREE.BoxGeometry(t, len, t);
  const h = w / 2;
  for (const [x, z] of [[-h, -h], [h, -h], [h, h], [-h, h]] as const) {
    const g = bar(L);
    g.translate(x, L / 2, z);
    parts.push(g);
  }
  const n = Math.floor(L / step);
  for (let i = 0; i <= n; i++) {
    const y = i * step;
    for (let k = 0; k < 4; k++) {
      const g = new THREE.BoxGeometry(w, t * 0.8, t * 0.8);
      g.rotateY((k * Math.PI) / 2);
      const off = [[0, -h], [h, 0], [0, h], [-h, 0]][k]!;
      g.translate(off[0]!, y, off[1]!);
      parts.push(g);
    }
    if (i < n) {
      const diag = Math.hypot(w, step);
      for (let k = 0; k < 4; k++) {
        const g = bar(diag);
        g.scale(0.7, 1, 0.7);
        g.rotateZ(((i + k) % 2 ? 1 : -1) * Math.atan2(w, step));
        g.rotateY((k * Math.PI) / 2);
        const off = [[0, -h], [h, 0], [0, h], [-h, 0]][k]!;
        g.translate(off[0]!, y + step / 2, off[1]!);
        parts.push(g);
      }
    }
  }
  return mergeGeometries(parts)!;
}

export function Crane({ config, material }: { config: BuildingConfig; material: THREE.Material }) {
  const { W, D, roof } = dims(config);
  const H = roof + 16;
  const jibL = 46;
  const mastGeo = useMemo(() => lattice(H, 1.7, 2.2), [H]);
  const jibGeo = useMemo(() => {
    const g = lattice(jibL, 1.3, 2.6, 0.07);
    g.rotateZ(-Math.PI / 2);
    return g;
  }, []);
  const cjGeo = useMemo(() => {
    const g = lattice(13, 1.3, 2.6, 0.07);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);

  const root = useRef<THREE.Group>(null);
  const mast = useRef<THREE.Group>(null);
  const slew = useRef<THREE.Group>(null);
  const jib = useRef<THREE.Group>(null);
  const hook = useRef<THREE.Group>(null);
  const cable = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const b = frame.build;
    const up = easeInOutCubic(range(b, 0.3, 0.37));
    const jibIn = easeInOutCubic(range(b, 0.355, 0.4));
    const jibOut = easeInOutCubic(range(b, 0.74, 0.78));
    const down = easeInOutCubic(range(b, 0.775, 0.82));
    if (!root.current || !mast.current || !slew.current || !jib.current || !hook.current || !cable.current) return;
    root.current.visible = up > 0.001 && down < 0.999;
    mast.current.scale.y = Math.max(0.001, up);
    slew.current.position.y = H * up - H * down;
    root.current.position.y = -H * down * 0.0;
    mast.current.position.y = -H * down;
    jib.current.scale.x = Math.max(0.001, jibIn * (1 - jibOut));
    // slewing is scroll-driven, never idle motion
    const a = -0.35 + Math.sin(b * 16) * 0.55;
    slew.current.rotation.y = a;
    const trolley = 14 + (Math.sin(b * 23) * 0.5 + 0.5) * 22;
    const drop = 6 + (Math.cos(b * 19) * 0.5 + 0.5) * (H - 18);
    hook.current.position.set(trolley * jib.current.scale.x, -drop, 0);
    cable.current.position.set(trolley * jib.current.scale.x, -drop / 2, 0);
    cable.current.scale.y = drop;
    hook.current.visible = cable.current.visible = jibIn > 0.95 && jibOut < 0.05;
  });

  return (
    <group ref={root} position={[-W / 2 - 6, 0, -D / 2 - 4]}>
      <group ref={mast}>
        <mesh geometry={mastGeo} material={material} castShadow />
      </group>
      <group ref={slew}>
        {/* slewing unit + cab */}
        <mesh material={material} position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[2.2, 1.2, 2.2]} />
        </mesh>
        <mesh position={[1.4, 0.4, 1.2]} castShadow>
          <boxGeometry args={[1.4, 1.6, 1.4]} />
          <meshStandardMaterial color="#e9e7e2" roughness={0.5} />
        </mesh>
        {/* apex */}
        <mesh material={material} position={[0, 3.2, 0]} castShadow>
          <boxGeometry args={[0.5, 5, 0.5]} />
        </mesh>
        <group ref={jib} position={[0, 1.3, 0]}>
          <mesh geometry={jibGeo} material={material} castShadow />
          <mesh geometry={cjGeo} material={material} castShadow />
          <mesh position={[-11.5, -0.6, 0]} castShadow>
            <boxGeometry args={[3, 2.2, 2]} />
            <meshStandardMaterial color="#9b9892" roughness={0.9} />
          </mesh>
          <mesh ref={cable}>
            <boxGeometry args={[0.03, 1, 0.03]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          <group ref={hook}>
            <mesh castShadow>
              <boxGeometry args={[0.6, 0.8, 0.4]} />
              <meshStandardMaterial color="#e0a526" roughness={0.6} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
