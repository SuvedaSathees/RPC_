"use client";
import { useEffect, useState } from "react";
import type { Quality } from "@/lib/three/store";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Decide how much 3D a device gets. Resolved on the client only. */
export function detectQuality(): Quality {
  if (typeof window === "undefined") return "static";
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("quality");
  if (forced === "high" || forced === "medium" || forced === "low" || forced === "static") return forced;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  if (!hasWebGL()) return "static";
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (w < 768 || mem <= 2 || cores <= 2) return "low";
  if (coarse || w < 1200 || cores <= 4) return "medium";
  return "high";
}

export function useQuality() {
  const [q, setQ] = useState<Quality | null>(null);
  useEffect(() => {
    setQ(detectQuality());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setQ(detectQuality());
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return q;
}

export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(mq.matches);
    const on = () => setR(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return r;
}
