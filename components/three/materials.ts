import * as THREE from "three";
import type { MatKey } from "@/lib/three/building";
import { frame } from "@/lib/three/choreography";
import { lerp, range } from "@/lib/utils/math";

/** Tiny procedural noise texture — breaks up large flat surfaces (no downloads). */
function noiseTexture(size = 256, strength = 22, seed = 1) {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < size * size; i++) {
    const v = 235 + (rnd() - 0.5) * strength;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // soft blotches
  for (let k = 0; k < 60; k++) {
    { const g = rnd() > 0.5 ? 255 : 110; ctx.fillStyle = `rgba(${g},${g},${g},0.035)`; }
    ctx.beginPath();
    ctx.arc(rnd() * size, rnd() * size, 10 + rnd() * 50, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const C = (hex: string) => new THREE.Color(hex);

export const palette = {
  concreteRaw: C("#8e8a83"),
  concreteFinish: C("#e4dfd6"),
  metalPrimer: C("#7a7c80"),
  metalBronze: C("#6b5440"),
  blueprint: C("#0f2c5e"),
  earth: C("#ab9d86"),
  earthLandscaped: C("#a9a391"),
};

const siteBase: Partial<Record<MatKey, THREE.Color>> = {
  foliage: C("#4a5e3f"),
  trunk: C("#4e3e30"),
  hoarding: C("#f1efea"),
  cabin: C("#e7e6e1"),
  wood: C("#7b634f"),
};
const bpTint = C("#1b3c74");

export type Materials = Record<MatKey, THREE.Material>;

export function createMaterials(): Materials {
  const tex = noiseTexture();
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(p);
  return {
    concrete: std({ color: palette.concreteRaw.clone(), roughness: 0.88, metalness: 0, map: tex }),
    stone: std({ color: "#cbbfae", roughness: 0.72, map: tex }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#2a3642",
      roughness: 0.06,
      metalness: 0.3,
      transparent: true,
      opacity: 0.62,
      envMapIntensity: 1.8,
      depthWrite: false,
    }),
    metal: std({ color: palette.metalPrimer.clone(), roughness: 0.38, metalness: 0.85, envMapIntensity: 1.2 }),
    wood: std({ color: "#7b634f", roughness: 0.66 }),
    interiorLit: std({ color: "#e9dccb", roughness: 0.9, emissive: C("#ffc88f"), emissiveIntensity: 0.2 }),
    interiorDark: std({ color: "#4a4744", roughness: 0.9 }),
    rebar: std({ color: "#4b3b31", roughness: 0.6, metalness: 0.7 }),
    paving: std({ color: "#d3cabb", roughness: 0.8, map: tex }),
    lawn: std({ color: "#586745", roughness: 0.9 }),
    water: new THREE.MeshPhysicalMaterial({ color: "#1b262d", roughness: 0.02, metalness: 0.2, clearcoat: 1, envMapIntensity: 2.2 }),
    foliage: std({ color: "#4a5e3f", roughness: 0.85 }),
    trunk: std({ color: "#4e3e30", roughness: 0.85 }),
    hoarding: std({ color: "#f1efea", roughness: 0.7 }),
    crane: std({ color: "#27559e", roughness: 0.45, metalness: 0.4 }),
    cabin: std({ color: "#e7e6e1", roughness: 0.7 }),
    light: std({ color: "#fff3e0", emissive: C("#ffd7a8"), emissiveIntensity: 0.4, roughness: 0.4 }),
  };
}

/** Called once per frame: materials evolve with the construction sequence + time of day. */
export function updateMaterials(m: Materials) {
  const finish = range(frame.build, 0.64, 0.8);
  (m.concrete as THREE.MeshStandardMaterial).color.copy(palette.concreteRaw).lerp(palette.concreteFinish, finish);
  (m.metal as THREE.MeshStandardMaterial).color.copy(palette.metalPrimer).lerp(palette.metalBronze, range(frame.build, 0.7, 0.82));
  // in the blueprint, context objects become part of the drawing
  for (const [k, base] of Object.entries(siteBase) as [MatKey, THREE.Color][]) {
    (m[k] as THREE.MeshStandardMaterial).color.copy(base).lerp(bpTint, frame.blueprint * 0.85);
  }
  const tod = frame.tod;
  (m.interiorLit as THREE.MeshStandardMaterial).emissiveIntensity = lerp(0.12, 2.4, tod);
  (m.light as THREE.MeshStandardMaterial).emissiveIntensity = lerp(0.3, 9, tod);
  (m.glass as THREE.MeshPhysicalMaterial).opacity = lerp(0.66, 0.5, tod);
  (m.glass as THREE.MeshPhysicalMaterial).envMapIntensity = lerp(1.8, 0.9, tod);
}
