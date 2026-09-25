import { defaultBuilding, dims, type BuildingConfig } from "./building";
import type { V3 } from "./choreography";

/** Massing variants used to render placeholder project imagery from the same system. */
export const variants: Record<string, BuildingConfig> = {
  hero: defaultBuilding,
  residential: { ...defaultBuilding, floors: 12, bays: 3, bayW: 6.2, bayD: 8, balcony: 1.6, finSpacing: 1.05, seed: 4, litRatio: 0.55 },
  commercial: { ...defaultBuilding, floors: 6, bays: 6, bayW: 6.5, depthBays: 3, bayD: 7, balcony: 0.5, finSpacing: 2.1, penthouse: false, seed: 7, litRatio: 0.8 },
  villa: { ...defaultBuilding, floors: 2, groundH: 4.2, floorH: 3.9, bays: 3, bayW: 7, depthBays: 2, bayD: 6, balcony: 3.2, finSpacing: 0.55, penthouse: false, seed: 11, litRatio: 0.9 },
  industrial: { ...defaultBuilding, floors: 2, groundH: 7.5, floorH: 6.5, bays: 6, bayW: 8, depthBays: 3, bayD: 9, balcony: 0.2, finSpacing: 0, penthouse: false, seed: 3, litRatio: 0.4 },
  mixed: { ...defaultBuilding, floors: 9, bays: 5, bayW: 6, depthBays: 2, bayD: 7.5, balcony: 2, finSpacing: 1.5, seed: 21, litRatio: 0.6 },
};

export function presetCamera(c: BuildingConfig, preset: string): { pos: V3; target: V3; fov: number } {
  const { W, D, roof } = dims(c);
  const s = Math.max(W, roof * 1.25);
  switch (preset) {
    case "front":
      return { pos: [0, roof * 0.42, D / 2 + s * 3.1], target: [0, roof * 0.46, 0], fov: 22 };
    case "front-left":
      return { pos: [-s * 1.35, roof * 0.25 + 2, D / 2 + s * 2.2], target: [-s * 0.05, roof * 0.42, 0], fov: 30 };
    case "front-right":
      return { pos: [s * 1.4, roof * 0.3 + 3, D / 2 + s * 2.1], target: [s * 0.08, roof * 0.42, 0], fov: 30 };
    case "detail":
      return { pos: [W * 0.45, roof * 0.55, D / 2 + 9], target: [-W * 0.1, roof * 0.6, D / 2], fov: 34 };
    case "detail-low":
      return { pos: [-W * 0.55, 1.7, D / 2 + 13], target: [-W * 0.1, roof * 0.3, D / 2], fov: 36 };
    case "overhead":
      return { pos: [-6, 78, 40], target: [0, 0, 2], fov: 32 };
    case "low":
      return { pos: [-24, 9.5, 21], target: [1, 0.5, -1.5], fov: 34 };
    case "aerial":
      return { pos: [-s * 1.8, s * 1.4, D / 2 + s * 2.1], target: [0, roof * 0.25, 0], fov: 30 };
    default:
      return { pos: [-s * 1.35, roof * 0.3, D / 2 + s * 2.2], target: [0, roof * 0.45, 0], fov: 30 };
  }
}
