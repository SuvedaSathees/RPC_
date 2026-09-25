/**
 * Mutable, non-reactive scene state shared between DOM scroll choreography
 * (GSAP ScrollTrigger) and the WebGL scene. Written by ScrollTriggers,
 * damped once per tick by `tickScene`, read inside useFrame / HUD tickers.
 * Deliberately NOT React state — nothing here should cause re-renders.
 */
import { damp } from "@/lib/utils/math";

export type SceneMode = "hero" | "exploded" | "finale";
export type Quality = "high" | "medium" | "low" | "static";
export type AnatomyLayer = "foundation" | "structure" | "walls" | "windows" | "interior" | "roof";

export const sceneState = {
  /** raw targets written by scroll */
  target: { hero: 0, exploded: 0, finale: 0 },
  /** damped values used for rendering (weighted, cinematic motion) */
  display: { hero: 0, exploded: 0, finale: 0 },
  pointer: { x: 0, y: 0 },
  pointerDamped: { x: 0, y: 0 },
  mode: "hero" as SceneMode,
  /** which 3D sections currently intersect the viewport */
  visible: new Set<SceneMode>(),
  /** set when the canvas was hidden: next visible frame snaps instead of damping */
  needsSnap: false,
  ready: false,
  /** 0..1 — fraction of the hero film frames decoded so far (drives the preloader) */
  filmLoaded: 0,
  heroFilmSeconds: 0,
  heroNavVisible: false,
  /**
   * Anatomy section interaction. `hover` is the layer under the pointer in the
   * checklist, `focus` the layer the visitor clicked (camera flies to it).
   * `focusAmt` is damped 0→1 so the camera glides rather than cuts.
   */
  anatomy: {
    hover: null as AnatomyLayer | null,
    focus: null as AnatomyLayer | null,
    focusAmt: 0,
    /** per-layer highlight weight, damped each tick (1 = lit, 0 = ghosted) */
    weights: { foundation: 1, structure: 1, walls: 1, windows: 1, interior: 1, roof: 1 } as Record<AnatomyLayer, number>,
  },
  /** smoothed Lenis scroll velocity (px/frame-ish), for velocity-reactive UI */
  scrollVelocity: 0,
};

export const anatomyLayers: AnatomyLayer[] = ["foundation", "structure", "walls", "windows", "interior", "roof"];

export const isSceneActive = () => sceneState.visible.size > 0;

const LAMBDA = 2.6; // lower = heavier camera

export function tickScene(dt: number) {
  const s = sceneState;
  const d = Math.min(dt, 0.1);
  if (s.needsSnap) {
    s.display.hero = s.target.hero;
    s.display.exploded = s.target.exploded;
    s.display.finale = s.target.finale;
    s.needsSnap = false;
  } else {
    s.display.hero = damp(s.display.hero, s.target.hero, LAMBDA, d);
    s.display.exploded = damp(s.display.exploded, s.target.exploded, LAMBDA, d);
    s.display.finale = damp(s.display.finale, s.target.finale, LAMBDA, d);
  }
  s.pointerDamped.x = damp(s.pointerDamped.x, s.pointer.x, 2, d);
  s.pointerDamped.y = damp(s.pointerDamped.y, s.pointer.y, 2, d);

  // anatomy highlight: the hovered/focused layer stays lit, the rest ghost out
  const a = s.anatomy;
  const active = a.hover ?? a.focus;
  for (const l of anatomyLayers) {
    const want = active === null ? 1 : l === active ? 1 : 0;
    a.weights[l] = damp(a.weights[l], want, 6, d);
  }
  a.focusAmt = damp(a.focusAmt, a.focus ? 1 : 0, 3.2, d);
}

export function setSectionVisible(mode: SceneMode, visible: boolean) {
  const wasActive = isSceneActive();
  if (visible) {
    sceneState.visible.add(mode);
    if (sceneState.mode !== mode) {
      // switching choreography while the canvas was covered → cut, don't glide
      if (!wasActive) sceneState.needsSnap = true;
      sceneState.mode = mode;
    }
  } else {
    sceneState.visible.delete(mode);
    const next = [...sceneState.visible].pop();
    if (next) sceneState.mode = next;
  }
  if (!wasActive && visible) sceneState.needsSnap = true;
  window.dispatchEvent(new CustomEvent("rpc:scene-visibility", { detail: isSceneActive() }));
}
