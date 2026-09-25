"use client";
import { useEffect, type RefObject } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { sceneState, setSectionVisible, type SceneMode } from "@/lib/three/store";

/**
 * Connects a transparent page section to the shared WebGL canvas:
 * its scroll progress drives `sceneState.target[mode]`, and while it is on
 * screen the canvas renders that choreography.
 */
export function use3DSection(mode: Exclude<SceneMode, "hero">, ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const drive = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom bottom",
      onUpdate: (s) => (sceneState.target[mode] = s.progress),
    });
    const vis = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onToggle: (s) => setSectionVisible(mode, s.isActive),
    });
    return () => {
      drive.kill();
      vis.kill();
      setSectionVisible(mode, false);
    };
  }, [mode, ref, enabled]);
}
