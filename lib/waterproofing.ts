/**
 * The waterproofing film — the places water pushes in below ground,
 * and the system RPC puts there to stop it. The footage (Google Flow) is one
 * continuous camera move: trench → sump → basement → pool. Reveal frames and
 * times live in public/waterproof/manifest.json ("stops", "stopSeconds").
 */
export interface WaterproofStop {
  key: string;
  area: string;
  headline: string;
  system: string;
  points: string[];
}

export const waterproofIntro = {
  eyebrow: "Waterproofing",
  headline: "The protection you never see.",
  body: "Below ground, water never stops pushing — into the sump, against the basement, out of the pool. Scroll to see what we put there to stop it.",
};

export const waterproofStops: WaterproofStop[] = [
  {
    key: "sump",
    area: "Underground sump",
    headline: "Clean water in. Ground water out.",
    system: "Crystalline waterproofing",
    points: ["Crystals grow into the concrete pores", "PVC water-bar at construction joints", "Puddle flange on every pipe through the wall"],
  },
  {
    key: "basement",
    area: "Basement & retaining wall",
    headline: "We hold back the ground.",
    system: "Bituminous torch-on membrane",
    points: ["Outer face of the retaining wall", "Continuous under the raft slab", "Protection board and drainage mat against the soil"],
  },
  {
    key: "pool",
    area: "Swimming pool",
    headline: "Every litre, exactly where it belongs.",
    system: "Flexible cementitious coating",
    points: ["Under every mosaic tile", "Water-bars at the shell's joints", "Sealed puddle flanges on inlets and outlets"],
  },
];

export const waterproofOutro = {
  headline: "Dry buildings, for decades.",
  body: "Waterproofing is planned into every RPC drawing — not patched on after the first monsoon.",
};

