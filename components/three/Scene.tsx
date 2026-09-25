"use client";
import { Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { defaultBuilding, type BuildingConfig } from "@/lib/three/building";
import { computeFrame, frame, viewport, type SceneOverride } from "@/lib/three/choreography";
import { sceneState } from "@/lib/three/store";
import { Blueprint } from "./Blueprint";
import { Building } from "./Building";
import { Crane } from "./Crane";
import { createMaterials, updateMaterials } from "./materials";
import { Context, Lighting, Sky, Terrain } from "./World";

export type RenderQuality = "high" | "medium" | "low";

const _target = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();

/** Runs first every frame: derives scene values from scroll and drives the camera. */
function Director({ override, parallax }: { override?: SceneOverride; parallax: boolean }) {
  const { camera, size } = useThree();
  const frames = useRef(0);
  useEffect(() => {
    viewport.aspect = size.height > 0 ? size.width / size.height : 16 / 9;
  }, [size]);
  useFrame(() => {
    computeFrame(override);
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.set(...frame.camPos);
    _target.set(...frame.camTarget);
    if (parallax) {
      // subtle, weighted mouse parallax in camera space
      const { x, y } = sceneState.pointerDamped;
      cam.lookAt(_target);
      _right.setFromMatrixColumn(cam.matrixWorld, 0);
      _up.setFromMatrixColumn(cam.matrixWorld, 1);
      const k = frame.mode === "hero" ? 1 : 0.6;
      cam.position.addScaledVector(_right, x * 1.6 * k).addScaledVector(_up, -y * 0.8 * k);
    }
    cam.lookAt(_target);
    if (Math.abs(cam.fov - frame.fov) > 0.001) {
      cam.fov = frame.fov;
      cam.updateProjectionMatrix();
    }
    if (frames.current < 4 && ++frames.current === 4) {
      sceneState.ready = true;
      window.dispatchEvent(new Event("rpc:ready"));
      (window as unknown as { __RPC_READY?: boolean }).__RPC_READY = true;
    }
  }, -10);
  return null;
}

function Reflections() {
  // Procedural studio for glass/metal reflections — no HDR download needed.
  return (
    <Environment resolution={256} frames={1} background={false}>
      <color attach="background" args={["#bfc5cc"]} />
      <Lightformer form="rect" intensity={1.3} color="#fff6ea" position={[0, 12, -20]} scale={[40, 10, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#d9e4f2" position={[-30, 6, 10]} rotation-y={Math.PI / 2} scale={[40, 8, 1]} />
      <Lightformer form="rect" intensity={0.8} color="#ffe2c4" position={[30, 4, 10]} rotation-y={-Math.PI / 2} scale={[40, 6, 1]} />
      <mesh position={[0, -10, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#6e6558" />
      </mesh>
    </Environment>
  );
}

function Effects({ quality }: { quality: RenderQuality }) {
  if (quality === "low") return null;
  const high = quality === "high";
  return (
    <EffectComposer multisampling={high ? 4 : 0} enableNormalPass={false}>
      <N8AO aoRadius={2.4} distanceFalloff={1} intensity={high ? 2.4 : 1.8} halfRes={!high} quality={high ? "medium" : "performance"} />
      <Bloom mipmapBlur intensity={0.45} luminanceThreshold={1.6} luminanceSmoothing={0.2} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.28} darkness={0.5} />
      {!high ? <SMAA /> : <></>}
    </EffectComposer>
  );
}

function MaterialDriver({ materials }: { materials: ReturnType<typeof createMaterials> }) {
  useFrame(() => updateMaterials(materials), -5);
  return null;
}

export interface SceneProps {
  quality: RenderQuality;
  override?: SceneOverride;
  config?: BuildingConfig;
  showLabels?: boolean;
  parallax?: boolean;
}

export function Scene({ quality, override, config = defaultBuilding, showLabels = true, parallax = true }: SceneProps) {
  const materials = useMemo(() => createMaterials(), []);
  const { gl } = useThree();
  useEffect(() => {
    gl.shadowMap.type = THREE.PCFShadowMap;
    return () => Object.values(materials).forEach((m) => m.dispose());
  }, [gl, materials]);
  const shadowSize = quality === "high" ? 4096 : quality === "medium" ? 2048 : 1024;

  return (
    <>
      <Director override={override} parallax={parallax} />
      <MaterialDriver materials={materials} />
      <Sky />
      <Lighting shadowSize={shadowSize} />
      <Reflections />
      <Terrain />
      <Context count={quality === "low" ? 60 : 140} />
      <Blueprint config={config} />
      <Building config={config} materials={materials} quality={quality} showLabels={showLabels} />
      <Crane config={config} material={materials.crane} />
      <Effects quality={quality} />
    </>
  );
}
