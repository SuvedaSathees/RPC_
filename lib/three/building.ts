/**
 * Procedural, parametric building + construction schedule.
 *
 * Every element is an axis-aligned box with a schedule window [t0, t1] on the
 * hero timeline (0..1) and an anchor describing HOW it is built:
 *   bottom → grows upward from its base (columns, walls, pours)
 *   top    → unrolls downward (glazing lowered into place)
 *   left   → extends along +x (beams, slab pours, decking)
 *   back   → extends along +z
 *   rise   → full-size element translating up out of the ground (foundations)
 *   sink   → removed by translating down into the ground (temporary works)
 *   center → uniform scale (planting)
 * Nothing pops into existence — every element is built along a physical axis.
 */
import { hash } from "@/lib/utils/math";

export type Anchor = "bottom" | "top" | "left" | "back" | "rise" | "sink" | "center" | "lay";
export type MatKey =
  | "concrete"
  | "stone"
  | "glass"
  | "metal"
  | "wood"
  | "interiorLit"
  | "interiorDark"
  | "rebar"
  | "paving"
  | "lawn"
  | "water"
  | "foliage"
  | "trunk"
  | "hoarding"
  | "crane"
  | "cabin"
  | "light";
export type LayerKey = "foundation" | "structure" | "walls" | "windows" | "interior" | "roof" | "site";

export interface ElementSpec {
  layer: LayerKey;
  mat: MatKey;
  anchor: Anchor;
  pos: [number, number, number]; // final centre
  size: [number, number, number]; // final size
  t0: number;
  t1: number;
  /** for "sink" elements: [appearStart, appearEnd] before being removed at t0..t1 */
  appear?: [number, number];
}

export interface BuildingConfig {
  floors: number; // storeys including ground
  groundH: number;
  floorH: number;
  bays: number;
  bayW: number;
  depthBays: number;
  bayD: number;
  balcony: number;
  finSpacing: number;
  penthouse: boolean;
  litRatio: number;
  seed: number;
}

export const defaultBuilding: BuildingConfig = {
  floors: 7,
  groundH: 4.8,
  floorH: 3.5,
  bays: 4,
  bayW: 6.5,
  depthBays: 2,
  bayD: 7,
  balcony: 1.8,
  finSpacing: 1.3,
  penthouse: true,
  litRatio: 0.62,
  seed: 1,
};

/** Hero timeline windows (fraction of hero scroll). */
export const T = {
  site: [0, 0.12],
  blueprint: [0.1, 0.32],
  foundation: [0.28, 0.42],
  structure: [0.4, 0.6],
  shell: [0.58, 0.78],
  landscape: [0.76, 0.92],
  reveal: [0.88, 1],
} as const;

export const Y0 = 0.45; // top of raft / ground-floor level
const SLAB = 0.32;

export function dims(c: BuildingConfig) {
  const W = c.bays * c.bayW;
  const D = c.depthBays * c.bayD;
  const level = (i: number) => (i === 0 ? Y0 : Y0 + c.groundH + (i - 1) * c.floorH);
  const roof = level(c.floors);
  return { W, D, level, roof };
}

export function buildElements(c: BuildingConfig): ElementSpec[] {
  const out: ElementSpec[] = [];
  const { W, D, level, roof } = dims(c);
  const add = (e: ElementSpec) => out.push(e);
  const r = (n: number) => hash(n * 13.37 + c.seed * 101.3);
  const xs = Array.from({ length: c.bays + 1 }, (_, i) => -W / 2 + i * c.bayW);
  const zs = Array.from({ length: c.depthBays + 1 }, (_, i) => -D / 2 + i * c.bayD);
  const [f0, f1] = T.foundation;

  // ── FOUNDATION ────────────────────────────────────────────────────────
  // pile caps rise first, in a sweep across the grid
  xs.forEach((x, i) =>
    zs.forEach((z, j) => {
      const s = f0 + (i / xs.length) * 0.03 + j * 0.004;
      add({ layer: "foundation", mat: "concrete", anchor: "rise", pos: [x, -0.35, z], size: [2.2, 1.6, 2.2], t0: s, t1: s + 0.035 });
    }),
  );
  // raft poured in four sequential bays
  const pours = 4;
  const rw = (W + 2.4) / pours;
  for (let k = 0; k < pours; k++) {
    const s = f0 + 0.04 + k * 0.016;
    add({ layer: "foundation", mat: "concrete", anchor: "rise", pos: [-W / 2 - 1.2 + rw * (k + 0.5), (Y0 - 0.9) / 2, 0], size: [rw - 0.04, Y0 + 0.9, D + 2.4], t0: s, t1: s + 0.03 });
  }
  // starter bars at every column
  xs.forEach((x, i) =>
    zs.forEach((z, j) => {
      const s = f1 - 0.03 + (i + j) * 0.0015;
      for (let q = 0; q < 4; q++) {
        const ox = (q % 2 ? 1 : -1) * 0.16;
        const oz = (q < 2 ? 1 : -1) * 0.16;
        add({ layer: "foundation", mat: "rebar", anchor: "bottom", pos: [x + ox, Y0 + 0.7, z + oz], size: [0.045, 1.4, 0.045], t0: s, t1: s + 0.012 });
      }
    }),
  );

  // ── STRUCTURE ─────────────────────────────────────────────────────────
  const [s0, s1] = T.structure;
  const perFloor = (s1 - s0 - 0.02) / c.floors;
  // slip-formed core rises continuously ahead of the floors
  const coreW = 5.2;
  const coreD = 4.6;
  const coreZ = -D / 2 + coreD / 2 + 0.6;
  const coreTop = roof + 2.6;
  add({ layer: "structure", mat: "concrete", anchor: "bottom", pos: [0, (Y0 + coreTop) / 2, coreZ], size: [coreW, coreTop - Y0, coreD], t0: s0 - 0.01, t1: s1 - 0.03 });

  for (let f = 0; f < c.floors; f++) {
    const base = level(f);
    const top = level(f + 1);
    const h = top - base - SLAB;
    const tf = s0 + f * perFloor;
    // columns
    xs.forEach((x, i) =>
      zs.forEach((z, j) => {
        const s = tf + (i + j) * perFloor * 0.04;
        add({ layer: "structure", mat: "concrete", anchor: "bottom", pos: [x, base + h / 2, z], size: [0.55, h, 0.55], t0: s, t1: s + perFloor * 0.45 });
      }),
    );
    // beams along x on every grid line
    zs.forEach((z, j) =>
      xs.slice(0, -1).forEach((x, i) => {
        const s = tf + perFloor * (0.35 + i * 0.06 + j * 0.03);
        add({ layer: "structure", mat: "concrete", anchor: "left", pos: [x + c.bayW / 2, top - SLAB - 0.3, z], size: [c.bayW, 0.6, 0.45], t0: s, t1: s + perFloor * 0.3 });
      }),
    );
    // slab decked bay by bay (with balcony projection on the front)
    const bal = f + 1 < c.floors ? c.balcony : 0.4;
    const sd = D + 0.6 + bal;
    xs.slice(0, -1).forEach((x, i) => {
      const s = tf + perFloor * (0.55 + i * 0.1);
      add({ layer: "structure", mat: "concrete", anchor: "left", pos: [x + c.bayW / 2, top - SLAB / 2, bal / 2], size: [c.bayW + (i === 0 || i === c.bays - 1 ? 0.3 : 0), SLAB, sd], t0: s, t1: s + perFloor * 0.35 });
    });
  }

  // ── WALLS ─────────────────────────────────────────────────────────────
  const [w0] = T.shell;
  const wallPer = 0.12 / c.floors;
  for (let f = 0; f < c.floors; f++) {
    const base = level(f);
    const h = level(f + 1) - base - SLAB;
    const mat: MatKey = f === 0 ? "stone" : "concrete";
    const s = w0 + f * wallPer;
    for (const side of [-1, 1]) {
      add({ layer: "walls", mat, anchor: "bottom", pos: [side * (W / 2 + 0.05), base + h / 2, -0.6], size: [0.42, h, D - 1.2], t0: s, t1: s + wallPer * 1.4 });
    }
    // back wall bays
    xs.slice(0, -1).forEach((x, i) => {
      add({ layer: "walls", mat, anchor: "bottom", pos: [x + c.bayW / 2, base + h / 2, -D / 2 - 0.05], size: [c.bayW, h, 0.4], t0: s + i * 0.002, t1: s + wallPer * 1.4 + i * 0.002 });
    });
    // timber soffit under each balcony
    if (f > 0) {
      add({ layer: "walls", mat: "wood", anchor: "left", pos: [0, base - SLAB - 0.03, D / 2 + c.balcony / 2 - 0.1], size: [W + 0.2, 0.06, c.balcony + 0.4], t0: 0.68 + f * 0.006, t1: 0.7 + f * 0.006 });
    }
  }

  // ── WINDOWS / FACADE ─────────────────────────────────────────────────
  for (let f = 0; f < c.floors; f++) {
    const base = level(f);
    const h = level(f + 1) - base - SLAB;
    const gz = f === 0 ? D / 2 - 1.4 : D / 2 - 0.25;
    xs.slice(0, -1).forEach((x, i) => {
      const s = 0.61 + f * 0.013 + i * 0.002;
      add({ layer: "windows", mat: "glass", anchor: "top", pos: [x + c.bayW / 2, base + h / 2, gz], size: [c.bayW - 0.04, h, 0.08], t0: s, t1: s + 0.014 });
    });
    // side slot windows
    for (const side of [-1, 1]) {
      for (let k = 0; k < 2; k++) {
        const z = -D / 2 + D * (0.35 + k * 0.35);
        add({ layer: "windows", mat: "glass", anchor: "top", pos: [side * (W / 2 + 0.3), base + h / 2, z], size: [0.06, h * 0.82, 1.6], t0: 0.64 + f * 0.01, t1: 0.66 + f * 0.01 });
      }
    }
    // vertical bronze fins — offset every other floor for rhythm
    if (c.finSpacing > 0 && f > 0) {
      const n = Math.floor(W / c.finSpacing);
      const off = f % 2 ? c.finSpacing / 2 : 0;
      for (let k = 0; k <= n; k++) {
        const x = -W / 2 + off + k * c.finSpacing;
        if (x > W / 2 + 0.01) continue;
        const s = 0.655 + f * 0.011 + (k / n) * 0.01;
        add({ layer: "windows", mat: "metal", anchor: "bottom", pos: [x, base + h / 2, D / 2 + 0.05], size: [0.07, h, 0.45], t0: s, t1: s + 0.012 });
      }
      // glass balustrade at the balcony edge
      if (f < c.floors) {
        add({ layer: "windows", mat: "glass", anchor: "left", pos: [0, base + 0.55, D / 2 + c.balcony + 0.25], size: [W + 0.2, 1.1, 0.03], t0: 0.69 + f * 0.007, t1: 0.71 + f * 0.007 });
      }
    }
  }
  // ground-floor canopy line mullions
  xs.forEach((x, i) =>
    add({ layer: "windows", mat: "metal", anchor: "bottom", pos: [x, Y0 + (c.groundH - SLAB) / 2, D / 2 - 1.36], size: [0.12, c.groundH - SLAB, 0.14], t0: 0.6 + i * 0.002, t1: 0.615 + i * 0.002 }),
  );

  // ── INTERIOR (lit rooms behind glass) ───────────────────────────────
  for (let f = 0; f < c.floors; f++) {
    const base = level(f);
    const h = level(f + 1) - base - SLAB;
    xs.slice(0, -1).forEach((x, i) => {
      const lit = r(f * 17 + i * 3) < c.litRatio || f === 0;
      const s = 0.64 + f * 0.01;
      add({ layer: "interior", mat: lit ? "interiorLit" : "interiorDark", anchor: "bottom", pos: [x + c.bayW / 2, base + h / 2, D / 2 - 3.8 - (f === 0 ? 1 : 0)], size: [c.bayW - 0.6, h - 0.1, 0.12], t0: s, t1: s + 0.02 });
      // ceiling cove light
      add({ layer: "interior", mat: lit ? "interiorLit" : "interiorDark", anchor: "left", pos: [x + c.bayW / 2, base + h - 0.08, D / 2 - 1.6], size: [c.bayW - 1.2, 0.06, 0.35], t0: s, t1: s + 0.02 });
      // floor finish
      add({ layer: "interior", mat: "wood", anchor: "left", pos: [x + c.bayW / 2, base + 0.02, D / 2 - 2.4], size: [c.bayW - 0.5, 0.04, 4.2], t0: s, t1: s + 0.02 });
    });
  }

  // ── ROOF ──────────────────────────────────────────────────────────────
  const rs = 0.71;
  const px = W / 2;
  const pz = D / 2 + 0.3;
  add({ layer: "roof", mat: "concrete", anchor: "left", pos: [0, roof + 0.55, pz + 0.4], size: [W + 0.4, 1.1, 0.3], t0: rs, t1: rs + 0.02 });
  add({ layer: "roof", mat: "concrete", anchor: "left", pos: [0, roof + 0.55, -D / 2 - 0.1], size: [W + 0.4, 1.1, 0.3], t0: rs, t1: rs + 0.02 });
  for (const side of [-1, 1]) add({ layer: "roof", mat: "concrete", anchor: "back", pos: [side * (px + 0.1), roof + 0.55, 0.15], size: [0.3, 1.1, D + 0.8], t0: rs + 0.005, t1: rs + 0.025 });
  if (c.penthouse) {
    const ph = c.floorH - SLAB;
    const pw = W * 0.56;
    const pd = D * 0.62;
    const pzc = -D / 2 + pd / 2 + 0.2;
    add({ layer: "roof", mat: "concrete", anchor: "bottom", pos: [-W * 0.12, roof + ph / 2, pzc - 0.4], size: [pw, ph, pd - 0.8], t0: rs + 0.01, t1: rs + 0.03 });
    add({ layer: "roof", mat: "glass", anchor: "top", pos: [-W * 0.12, roof + ph / 2, pzc + pd / 2 - 0.42], size: [pw - 0.2, ph, 0.08], t0: rs + 0.025, t1: rs + 0.04 });
    add({ layer: "roof", mat: "interiorLit", anchor: "bottom", pos: [-W * 0.12, roof + ph / 2, pzc], size: [pw - 1, ph - 0.2, 0.1], t0: rs + 0.025, t1: rs + 0.04 });
    // cantilevered roof blade over the penthouse
    add({ layer: "roof", mat: "concrete", anchor: "left", pos: [-W * 0.08, roof + ph + 0.18, pzc + 1.2], size: [pw + 3.2, 0.36, pd + 2.8], t0: rs + 0.035, t1: rs + 0.055 });
    add({ layer: "roof", mat: "wood", anchor: "left", pos: [-W * 0.08, roof + ph - 0.02, pzc + 1.2], size: [pw + 3.1, 0.05, pd + 2.7], t0: rs + 0.04, t1: rs + 0.058 });
  }
  return out;
}

/** Temporary works, landscape and context — shares the same schedule system. */
export function buildSite(c: BuildingConfig, density = 1): ElementSpec[] {
  const out: ElementSpec[] = [];
  const add = (e: ElementSpec) => out.push(e);
  const { W, D } = dims(c);
  const r = (n: number) => hash(n * 7.13 + c.seed * 3.1);
  const [l0, l1] = T.landscape;

  // hoarding around the plot — removed at completion
  const hx = W / 2 + 16;
  const hz = D / 2 + 14;
  const panel = 3.2;
  const run = (x0: number, z0: number, x1: number, z1: number, id: number) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const n = Math.floor(len / panel);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const x = x0 + (x1 - x0) * t;
      const z = z0 + (z1 - z0) * t;
      const alongX = Math.abs(x1 - x0) > 0.1;
      // leave a gate open on the front
      if (id === 0 && Math.abs(x) < 7) continue;
      const s = l0 + 0.01 + r(id * 100 + k) * 0.03;
      add({ layer: "site", mat: "hoarding", anchor: "sink", pos: [x, 1.2, z], size: alongX ? [len / n - 0.05, 2.4, 0.08] : [0.08, 2.4, len / n - 0.05], t0: s, t1: s + 0.03, appear: [0.3 + t * 0.03, 0.33 + t * 0.03] });
    }
  };
  run(-hx, hz, hx, hz, 0);
  run(-hx, -hz, hx, -hz, 1);
  run(-hx, -hz, -hx, hz, 2);
  run(hx, -hz, hx, hz, 3);

  // site cabins (stacked) back-right
  for (let k = 0; k < 3; k++) {
    add({ layer: "site", mat: "cabin", anchor: "sink", pos: [hx - 5, 1.35 + (k === 2 ? 2.7 : 0), -hz + 4 + (k === 2 ? 0 : k * 3.2)], size: [8, 2.6, 2.9], t0: l0 + 0.02, t1: l0 + 0.05, appear: [0.3 + k * 0.01, 0.32 + k * 0.01] });
  }
  // material stacks near the gate (foreground depth for the opening shot)
  for (let k = 0; k < 6; k++) {
    const x = -hx + 6 + (k % 3) * 3.1;
    const z = hz - 5 - Math.floor(k / 3) * 2.6;
    const h = 0.8 + r(k + 40) * 0.9;
    add({ layer: "site", mat: k % 3 === 1 ? "wood" : "concrete", anchor: "sink", pos: [x, h / 2, z], size: [2.4, h, 1.6], t0: l0, t1: l0 + 0.03, appear: [0.31 + k * 0.006, 0.33 + k * 0.006] });
  }
  // survey pegs at the building corners
  for (const [x, z] of [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]] as const) {
    add({ layer: "site", mat: "crane", anchor: "sink", pos: [x, 0.5, z], size: [0.08, 1, 0.08], t0: T.foundation[0], t1: T.foundation[0] + 0.02 });
  }

  // ── landscape ──
  // paving laid outward from the building
  const tile = 4;
  const px = Math.ceil((W + 22) / tile);
  const pz = Math.ceil((D + 18) / tile);
  for (let i = 0; i < px; i++)
    for (let j = 0; j < pz; j++) {
      const x = -((px - 1) * tile) / 2 + i * tile;
      const z = -((pz - 1) * tile) / 2 + j * tile + 3;
      if (Math.abs(x) < W / 2 - 1 && Math.abs(z) < D / 2 - 1) continue;
      const dist = Math.hypot(x / (W / 2 + 11), z / (D / 2 + 9));
      const s = l0 + 0.01 + dist * 0.05;
      const isLawn = z > D / 2 + 5 && Math.abs(x) > 8;
      add({ layer: "site", mat: isLawn ? "lawn" : "paving", anchor: "lay", pos: [x, isLawn ? 0.09 : 0.06, z], size: [tile - 0.06, isLawn ? 0.18 : 0.12, tile - 0.06], t0: s, t1: s + 0.03 });
    }
  // reflecting pool in front of the entrance
  add({ layer: "site", mat: "water", anchor: "lay", pos: [0, 0.14, D / 2 + 8.5], size: [12, 0.06, 5.5], t0: l0 + 0.05, t1: l0 + 0.08 });
  add({ layer: "site", mat: "stone", anchor: "lay", pos: [0, 0.1, D / 2 + 8.5], size: [12.8, 0.14, 6.3], t0: l0 + 0.04, t1: l0 + 0.07 });

  // trees — planted last, grown gently
  const trees: [number, number][] = [];
  const nT = Math.round(20 * density);
  for (let k = 0; k < nT; k++) {
    const side = k % 2 ? 1 : -1;
    const x = side * (W / 2 + 6 + r(k) * 10);
    const z = -D / 2 - 4 + r(k + 9) * (D + 20);
    trees.push([x, z]);
  }
  for (let k = 0; k < Math.round(8 * density); k++) {
    const x = -W / 2 - 6 + k * ((W + 12) / 7);
    if (Math.abs(x) < 10) continue; // keep the entrance axis open
    trees.push([x, D / 2 + 15 + r(k + 77) * 2]);
  }
  trees.forEach(([x, z], k) => {
    const s = l0 + 0.06 + r(k + 200) * 0.08;
    const h = 5 + r(k + 300) * 4;
    const cr = 1.6 + r(k + 400) * 1.2;
    add({ layer: "site", mat: "trunk", anchor: "bottom", pos: [x, h * 0.35, z], size: [0.22, h * 0.7, 0.22], t0: s, t1: s + 0.03 });
    add({ layer: "site", mat: "foliage", anchor: "center", pos: [x, h * 0.72, z], size: [cr * 2, cr * 2.3, cr * 2], t0: s + 0.01, t1: Math.min(l1 + 0.04, s + 0.06) });
  });
  // mature trees retained on site — present from the first frame, give scale
  for (let k = 0; k < Math.round(7 * density); k++) {
    // two loose clusters behind the plot
    const cl = k < 4 ? [-W / 2 - 22, -D / 2 - 26] : [W / 2 + 24, -D / 2 - 30];
    const x = cl[0]! + (r(k + 600) - 0.5) * 16;
    const z = cl[1]! + (r(k + 610) - 0.5) * 12;
    const h = 8 + r(k + 620) * 5;
    const cr = 2.6 + r(k + 630) * 1.4;
    add({ layer: "site", mat: "trunk", anchor: "bottom", pos: [x, h * 0.35, z], size: [0.35, h * 0.7, 0.35], t0: -1, t1: -0.5 });
    add({ layer: "site", mat: "foliage", anchor: "center", pos: [x, h * 0.72, z], size: [cr * 2, cr * 2.1, cr * 2], t0: -1, t1: -0.5 });
  }
  // bollard lights along the approach
  for (let k = 0; k < 10; k++) {
    const side = k % 2 ? 1 : -1;
    const z = D / 2 + 4 + Math.floor(k / 2) * 3.4;
    add({ layer: "site", mat: "light", anchor: "bottom", pos: [side * 7.2, 0.45, z], size: [0.16, 0.9, 0.16], t0: l1 - 0.02 + k * 0.002, t1: l1 + k * 0.002 });
  }
  return out;
}
