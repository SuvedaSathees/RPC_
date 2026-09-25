/**
 * Scroll → scene choreography. Pure functions, no three.js scene access, so
 * the same maths drives the live canvas and the offline still renders.
 */
import { clamp, easeInOutCubic, lerp, range, smooth, window4 } from "@/lib/utils/math";
import { defaultBuilding, dims } from "./building";
import { sceneState, type AnatomyLayer, type SceneMode } from "./store";

export type V3 = [number, number, number];
export interface CamKey {
  t: number;
  pos: V3;
  target: V3;
  fov: number;
}

/** Hero film: establishing → overhead plan → low foundation → rise → orbit → detail → pull back */
export const heroCams: CamKey[] = [
  { t: 0.0, pos: [-84, 15, 98], target: [6, 5, 0], fov: 28 },
  { t: 0.1, pos: [-54, 22, 68], target: [2, 2, 0], fov: 30 },
  { t: 0.2, pos: [-10, 70, 44], target: [0, 0, 3], fov: 32 },
  { t: 0.29, pos: [-4, 56, 36], target: [0, 0, 1], fov: 32 },
  { t: 0.38, pos: [-21, 4.2, 19], target: [2, 1.6, -1], fov: 36 },
  { t: 0.48, pos: [-25, 11, 24], target: [2, 9, 0], fov: 36 },
  { t: 0.58, pos: [-9, 28, 33], target: [0, 17, 0], fov: 36 },
  { t: 0.68, pos: [36, 19, 36], target: [0, 13, 2], fov: 34 },
  { t: 0.78, pos: [21, 7.5, 27], target: [3, 9, 6], fov: 34 },
  { t: 0.88, pos: [-24, 9, 52], target: [0, 10, 0], fov: 32 },
  { t: 1.0, pos: [-46, 5.5, 80], target: [-11, 11.5, 0], fov: 30 },
];

export const explodedCams: CamKey[] = [
  { t: 0, pos: [66, 24, 84], target: [-17, 15, 1], fov: 32 },
  { t: 0.5, pos: [84, 36, 60], target: [-18, 17, 1], fov: 32 },
  { t: 1, pos: [70, 24, 86], target: [-16, 14, 1], fov: 32 },
];

export const finaleCams: CamKey[] = [
  { t: 0, pos: [-30, 5, 50], target: [-6, 11, 0], fov: 32 },
  { t: 1, pos: [-86, 32, 142], target: [-16, 9, 0], fov: 30 },
];

function catmull(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

export function sampleCams(keys: CamKey[], t: number, outPos: V3, outTarget: V3): number {
  const x = clamp(t);
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1]!.t) i++;
  const k1 = keys[i]!;
  const k2 = keys[i + 1] ?? k1;
  const k0 = keys[i - 1] ?? k1;
  const k3 = keys[i + 2] ?? k2;
  const local = k2.t === k1.t ? 0 : (x - k1.t) / (k2.t - k1.t);
  // gentle ease inside each shot — the camera "settles" on every keyframe
  const u = local * 0.55 + easeInOutCubic(local) * 0.45;
  for (let a = 0; a < 3; a++) {
    outPos[a] = catmull(k0.pos[a]!, k1.pos[a]!, k2.pos[a]!, k3.pos[a]!, u);
    outTarget[a] = catmull(k0.target[a]!, k1.target[a]!, k2.target[a]!, k3.target[a]!, u);
  }
  return k1.fov + (k2.fov - k1.fov) * u;
}

export interface SceneOverride {
  mode?: SceneMode;
  hero?: number;
  exploded?: number;
  finale?: number;
  tod?: number;
  camera?: { pos: V3; target: V3; fov: number };
}

/** Per-frame derived values, recomputed once per frame by the Director. */
export const frame = {
  mode: "hero" as SceneMode,
  build: 0,
  blueprint: 0,
  planDraw: 0,
  ghostDraw: 0,
  planOpacity: 0,
  tod: 0,
  explode: 0,
  landscape: 0,
  heroReveal: 0,
  camPos: [0, 0, 0] as V3,
  camTarget: [0, 0, 0] as V3,
  fov: 30,
};

/** Viewport shape, written by the Director; portrait frames need a wider lens. */
export const viewport = { aspect: 16 / 9 };

/** Where each system sits (assembled), so the camera can fly to it when focused. */
const layerCentres: Record<AnatomyLayer, V3> = (() => {
  const { roof } = dims(defaultBuilding);
  return {
    foundation: [0, 0.2, 0],
    structure: [0, roof * 0.42, 0],
    interior: [0, roof * 0.45, 0],
    walls: [0, roof * 0.5, 0],
    windows: [0, roof * 0.5, 0],
    roof: [0, roof + 0.6, 0],
  };
})();

/** World-space centre of a layer at the current explode amount. */
export function layerCentre(layer: AnatomyLayer, explode: number, out: V3): V3 {
  const c = layerCentres[layer];
  const o = explodeOffsets[layer]!;
  out[0] = c[0] + o[0] * explode;
  out[1] = c[1] + o[1] * explode;
  out[2] = c[2] + o[2] * explode;
  return out;
}

const _focus: V3 = [0, 0, 0];
const _focusTarget: V3 = [0, 0, 0];
let _focusInit = false;
let _lastFocus: AnatomyLayer | null = null;
/** how close the camera gets to a focused system, per layer (roof is big) */
const focusDistance: Record<AnatomyLayer, number> = { foundation: 58, structure: 54, interior: 50, walls: 56, windows: 54, roof: 60 };

export function computeFrame(o?: SceneOverride) {
  const d = sceneState.display;
  const mode = o?.mode ?? sceneState.mode;
  const hero = o?.hero ?? d.hero;
  const ex = o?.exploded ?? d.exploded;
  const fi = o?.finale ?? d.finale;
  frame.mode = mode;

  if (mode === "hero") {
    frame.build = hero;
    frame.blueprint = smooth(window4(hero, 0.1, 0.165, 0.27, 0.335));
    frame.planDraw = range(hero, 0.11, 0.215);
    frame.ghostDraw = range(hero, 0.17, 0.27);
    frame.planOpacity = Math.max(frame.blueprint, 0.4 * window4(hero, 0.1, 0.16, 0.36, 0.44));
    frame.tod = smooth(range(hero, 0.8, 0.97));
    frame.explode = 0;
    frame.heroReveal = range(hero, 0.9, 1);
    frame.fov = sampleCams(heroCams, hero, frame.camPos, frame.camTarget);
  } else if (mode === "exploded") {
    frame.build = 1;
    frame.blueprint = 0;
    frame.planDraw = 0;
    frame.ghostDraw = 0;
    frame.planOpacity = 0;
    frame.tod = 0.12;
    frame.explode = smooth(window4(ex, 0.06, 0.42, 0.66, 0.96));
    frame.heroReveal = 0;
    frame.fov = sampleCams(explodedCams, ex, frame.camPos, frame.camTarget);

    // portrait / narrow frames: widen the lens and push the building right so
    // it clears the copy column instead of sitting behind it
    const narrow = clamp((1.55 - viewport.aspect) / 0.75);
    if (narrow > 0) {
      frame.fov *= 1 + narrow * 0.42;
      frame.camTarget[0] -= narrow * 6;
      frame.camTarget[1] -= narrow * 4;
    }

    // a focused system pulls the camera in — damped in the store so it glides
    const a = sceneState.anatomy;
    const focusLayer = a.focus ?? _lastFocus;
    if (a.focus) _lastFocus = a.focus;
    if (focusLayer && a.focusAmt > 0.001) {
      layerCentre(focusLayer, frame.explode, _focusTarget);
      if (!_focusInit) {
        _focus[0] = _focusTarget[0]; _focus[1] = _focusTarget[1]; _focus[2] = _focusTarget[2];
        _focusInit = true;
      }
      // ease the focus point itself so switching systems swings, not cuts
      for (let i = 0; i < 3; i++) _focus[i] = lerp(_focus[i]!, _focusTarget[i]!, 0.08);
      const k = smooth(a.focusAmt);
      const dx = frame.camPos[0] - _focus[0];
      const dy = frame.camPos[1] - _focus[1];
      const dz = frame.camPos[2] - _focus[2];
      const len = Math.hypot(dx, dy, dz) || 1;
      const dist = focusDistance[focusLayer] * (1 + narrow * 0.5);
      const px = _focus[0] + (dx / len) * dist;
      const py = Math.max(3, _focus[1] + (dy / len) * dist + 4);
      const pz = _focus[2] + (dz / len) * dist;
      frame.camPos[0] = lerp(frame.camPos[0], px, k);
      frame.camPos[1] = lerp(frame.camPos[1], py, k);
      frame.camPos[2] = lerp(frame.camPos[2], pz, k);
      frame.camTarget[0] = lerp(frame.camTarget[0], _focus[0], k);
      frame.camTarget[1] = lerp(frame.camTarget[1], _focus[1], k);
      frame.camTarget[2] = lerp(frame.camTarget[2], _focus[2], k);
      frame.fov = lerp(frame.fov, 26, k);
    } else {
      _focusInit = false;
    }
  } else {
    frame.build = 1;
    frame.blueprint = 0;
    frame.planDraw = 0;
    frame.ghostDraw = 0;
    frame.planOpacity = 0;
    frame.tod = 1;
    frame.explode = 0;
    frame.heroReveal = 0;
    frame.fov = sampleCams(finaleCams, easeInOutCubic(fi), frame.camPos, frame.camTarget);
  }
  if (o?.tod !== undefined) frame.tod = o.tod;
  frame.landscape = range(frame.build, 0.76, 0.92);
  if (o?.camera) {
    frame.camPos = [...o.camera.pos];
    frame.camTarget = [...o.camera.target];
    frame.fov = o.camera.fov;
  }
}

/** Layer offsets for the exploded axonometric (multiplied by frame.explode). */
export const explodeOffsets: Record<string, V3> = {
  foundation: [0, 0, 0],
  structure: [0, 5, 0],
  interior: [0, 7, 7],
  walls: [0, 11, -9],
  windows: [0, 9, 15],
  roof: [0, 24, 0],
  site: [0, 0, 0],
};
