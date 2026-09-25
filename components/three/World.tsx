"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { frame } from "@/lib/three/choreography";
import { hash, lerp } from "@/lib/utils/math";
import { palette } from "./materials";

const C = (h: string) => new THREE.Color(h);
/** Sky / fog / light palettes: day → dusk, with a blueprint override. */
const DAY = { top: C("#86a0bb"), horizon: C("#e7dfd1"), fog: C("#d9d3c7"), sun: C("#fff1de"), hemiSky: C("#dfe6ee"), hemiGround: C("#a39680") };
const DUSK = { top: C("#16223d"), horizon: C("#d99a74"), fog: C("#4f5260"), sun: C("#ff9f68"), hemiSky: C("#4a5878"), hemiGround: C("#3b3230") };
const BLUE = { top: C("#06142f"), horizon: C("#16386f"), fog: C("#0f2b58"), sun: C("#dbe7ff"), hemiSky: C("#8ea3c8"), hemiGround: C("#0c1f42") };

function mix3(out: THREE.Color, key: keyof typeof DAY, tod: number, bp: number) {
  out.copy(DAY[key]).lerp(DUSK[key], tod);
  return out.lerp(BLUE[key], bp);
}

const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize((modelMatrix * vec4(position, 0.0)).xyz);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww;
  }`;
const skyFrag = /* glsl */ `
  uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uGround;
  uniform vec3 uSunDir; uniform vec3 uSun; uniform float uSunAmt;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = mix(uHorizon, uTop, pow(smoothstep(-0.02, 0.42, h), 0.55));
    col = mix(col, uGround, smoothstep(0.0, -0.12, h));
    float s = max(dot(d, normalize(uSunDir)), 0.0);
    col += uSun * (pow(s, 8.0) * 0.25 + pow(s, 64.0) * 0.5) * uSunAmt;
    // soft film grain in the sky to avoid banding
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

export function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        fog: false,
        uniforms: {
          uTop: { value: new THREE.Color() },
          uHorizon: { value: new THREE.Color() },
          uGround: { value: new THREE.Color() },
          uSunDir: { value: new THREE.Vector3(0, 1, 0) },
          uSun: { value: new THREE.Color() },
          uSunAmt: { value: 1 },
        },
      }),
    [],
  );
  useFrame(() => {
    const u = mat.uniforms;
    mix3(u.uTop!.value, "top", frame.tod, frame.blueprint);
    mix3(u.uHorizon!.value, "horizon", frame.tod, frame.blueprint);
    mix3(u.uGround!.value, "fog", frame.tod, frame.blueprint);
    mix3(u.uSun!.value, "sun", frame.tod, frame.blueprint);
    u.uSunAmt!.value = (1 - frame.blueprint) * lerp(0.5, 1.2, frame.tod);
    u.uSunDir!.value.copy(sunPosition(frame.tod)).normalize();
  });
  return (
    <mesh material={mat} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[2000, 32, 16]} />
    </mesh>
  );
}

const _sunDay = new THREE.Vector3(-75, 48, 58);
const _sunDusk = new THREE.Vector3(90, 13, -40);
const _sun = new THREE.Vector3();
export function sunPosition(tod: number) {
  return _sun.copy(_sunDay).lerp(_sunDusk, tod);
}

export function Lighting({ shadowSize }: { shadowSize: number }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const { scene, gl } = useThree();
  const fog = useMemo(() => new THREE.Fog("#dcd8cf", 90, 520), []);
  scene.fog = fog;

  useFrame(() => {
    const t = frame.tod;
    const bp = frame.blueprint;
    mix3(fog.color, "fog", t, bp);
    fog.near = lerp(lerp(160, 80, t), 90, bp);
    fog.far = lerp(lerp(900, 520, t), 420, bp);
    if (sun.current) {
      sun.current.position.copy(sunPosition(t));
      mix3(sun.current.color, "sun", t, bp);
      sun.current.intensity = lerp(lerp(3.8, 1.2, t), 1.1, bp);
    }
    if (hemi.current) {
      mix3(hemi.current.color, "hemiSky", t, bp);
      mix3(hemi.current.groundColor, "hemiGround", t, bp);
      hemi.current.intensity = lerp(lerp(0.62, 0.5, t), 0.75, bp);
    }
    gl.toneMappingExposure = lerp(0.94, 1.1, t);
    scene.environmentIntensity = lerp(lerp(0.55, 0.22, t), 0.3, bp);
  });

  const s = 70;
  return (
    <>
      <hemisphereLight ref={hemi} args={["#dfe6ee", "#a39680", 1]} />
      <directionalLight
        ref={sun}
        castShadow={shadowSize > 0}
        shadow-mapSize={[shadowSize || 512, shadowSize || 512]}
        shadow-camera-left={-s}
        shadow-camera-right={s}
        shadow-camera-top={s}
        shadow-camera-bottom={-s}
        shadow-camera-near={1}
        shadow-camera-far={320}
        shadow-bias={-0.0003}
        shadow-normalBias={0.05}
        shadow-radius={3}
        shadow-blurSamples={12}
      />
    </>
  );
}

/** Ground: flat plot fading into gentle rolling terrain. */
export function Terrain() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: palette.earth.clone(), roughness: 1 }), []);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1600, 1600, 160, 160);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position!;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const d = Math.hypot(x, z);
      const k = THREE.MathUtils.smoothstep(d, 90, 320);
      const h = (Math.sin(x * 0.011) * Math.cos(z * 0.009) * 7 + Math.sin(x * 0.023 + z * 0.017) * 3) * k + k * 4;
      p.setY(i, h - 0.001);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useFrame(() => {
    mat.color.copy(palette.earth).lerp(palette.earthLandscaped, frame.landscape).lerp(palette.blueprint, frame.blueprint);
    mat.roughness = lerp(1, 0.85, frame.blueprint);
  });
  return <mesh geometry={geo} material={mat} receiveShadow />;
}

/** Distant context: low-rise city blocks & ridge line — atmosphere via fog. */
export function Context({ count = 140 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d8d4cc", roughness: 0.9 }), []);
  const matrices = useMemo(() => {
    const m = new THREE.Matrix4();
    const list: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i++) {
      const a = -Math.PI * 0.95 + hash(i) * Math.PI * 1.25; // behind & sides
      const r = 280 + hash(i + 50) * 320;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r - 40;
      if (z > 60 && Math.abs(x) < 200) continue;
      const w = 12 + hash(i + 7) * 26;
      const h = 5 + Math.pow(hash(i + 3), 3) * 42;
      const d = 12 + hash(i + 11) * 22;
      m.compose(new THREE.Vector3(x, h / 2 + THREE.MathUtils.smoothstep(r, 90, 320) * 4, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), hash(i + 19) * 0.6), new THREE.Vector3(w, h, d));
      list.push(m.clone());
    }
    return list;
  }, [count]);
  useFrame(() => {
    mat.color.set("#d8d4cc").lerp(C("#3a4152"), frame.tod * 0.8).lerp(palette.blueprint, frame.blueprint);
  });
  return (
    <instancedMesh
      ref={(r) => {
        (ref as React.MutableRefObject<THREE.InstancedMesh | null>).current = r;
        if (r) {
          matrices.forEach((m, i) => r.setMatrixAt(i, m));
          r.instanceMatrix.needsUpdate = true;
          r.computeBoundingSphere();
        }
      }}
      args={[new THREE.BoxGeometry(1, 1, 1), mat, matrices.length]}
      castShadow={false}
      receiveShadow
    />
  );
}
