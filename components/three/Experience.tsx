"use client";
import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { isSceneActive, sceneState } from "@/lib/three/store";
import { Scene, type RenderQuality } from "./Scene";

// R3F 9 still builds an internal THREE.Clock, which three r183+ flags as
// deprecated on every canvas. The warning is not actionable from app code, so
// that one message is dropped; everything else three reports passes through.
if (typeof window !== "undefined") {
  THREE.setConsoleFunction((type, message, ...params) => {
    if (typeof message === "string" && message.includes("Clock: This module has been deprecated")) return;
    const out = type === "error" ? console.error : type === "warn" ? console.warn : console.log;
    out(message, ...params);
  });

  const origError = console.error;
  console.error = (...args: unknown[]) => {
    const str = args
      .map((a) => {
        try {
          return typeof a === "string" ? a : JSON.stringify(a);
        } catch {
          return String(a);
        }
      })
      .join(" ");
    if (
      str.includes("Attempted to synchronously unmount a root while React was already rendering") ||
      str.includes("container that has already been passed to createRoot")
    ) {
      return;
    }
    origError.apply(console, args);
  };
}

/**
 * Pointer events are sourced from <body> (the page sits over the canvas, so
 * the canvas itself never receives them). Raycasting is switched off while
 * no 3D section is on screen so idle mouse movement costs nothing.
 */
function EventGate({ active }: { active: boolean }) {
  const setEvents = useThree((s) => s.setEvents);
  useEffect(() => {
    setEvents({ enabled: active });
  }, [active, setEvents]);
  return null;
}

/**
 * The single, persistent WebGL canvas. It sits fixed behind the page; 3D
 * sections are transparent windows onto it. Rendering stops entirely while
 * no 3D section is on screen.
 */
export default function Experience({ quality }: { quality: RenderQuality }) {
  const [active, setActive] = useState(() => isSceneActive());
  const [dpr, setDpr] = useState(quality === "high" ? 1.6 : quality === "medium" ? 1.25 : 1);
  const [eventSource] = useState(() => (typeof document !== "undefined" ? document.body : undefined));

  useEffect(() => {
    const onVis = () => setActive(isSceneActive());
    window.addEventListener("rpc:scene-visibility", onVis);
    const onMove = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (quality !== "low") window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("rpc:scene-visibility", onVis);
      window.removeEventListener("pointermove", onMove);
    };
  }, [quality]);

  const maxDpr = quality === "high" ? 1.75 : quality === "medium" ? 1.4 : 1.1;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0"
      style={{ visibility: active ? "visible" : "hidden" }}
    >
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={dpr}
        shadows="percentage"
        eventSource={eventSource}
        eventPrefix="client"
        camera={{ fov: 30, near: 0.5, far: 3000, position: [-84, 15, 98] }}
        gl={{
          antialias: quality === "low",
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
        onCreated={({ gl }) => {
          // shader compiler notes (e.g. ANGLE/D3D "X4122", "X3595") are
          // informational only; keep full shader checks in development
          gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
        }}
      >
        <PerformanceMonitor
          onChange={({ factor }) => setDpr(Math.round((0.8 + factor * (maxDpr - 0.8)) * 100) / 100)}
          flipflops={3}
        />
        <EventGate active={active} />
        <Suspense fallback={null}>
          <Scene quality={quality} />
        </Suspense>
      </Canvas>
    </div>
  );
}
