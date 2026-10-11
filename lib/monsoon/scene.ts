/**
 * The monsoon house: a cut-away of a two-storey Tamil Nadu home in heavy
 * rain, drawn as one SVG string so the server renders it and it stays sharp
 * at every zoom.
 *
 * World units are about 1.5 cm (the house is 680 across, about 10 m). The
 * house is cut front to back. Each storey is a lit room box in one-point
 * perspective with its own eye level (the usual doll's-house cheat, so every
 * room shows a strip of ceiling and of floor); the cut walls and slabs lie
 * flat on the front plane over them; the sky, trees and neighbours are flat.
 *
 * Four leaks are drawn in, each tagged with its zone so the page can seal
 * them one at a time: `lk lk-<zone>` is the leak (stains, drips, seepage),
 * `fx fx-<zone>` the fix (membranes and coats), hidden until that zone is
 * sealed by a class on the <svg>: `is-<zone>`.
 */

export type Pt = readonly [number, number];
export type ZoneKey = "terrace" | "bathroom" | "walls" | "sump";
export const ZONE_KEYS: readonly ZoneKey[] = ["terrace", "bathroom", "walls", "sump"];

/* ------------------------------------------------------------ numbers */

/** the house, on the front (cut) plane */
export const H = {
  ground: 700,
  xW: 560,
  xE: 1240,
  xWi: 576,
  xEi: 1224,
  coping: 162,
  parTop: 168,
  terrace: 228,
  roofTop: 238,
  ffCeil: 250,
  ffFloor: 454,
  gfCeil: 466,
  sunkTop: 474,
  sunkBot: 486,
  gfFloor: 670,
  /** the bathroom upstairs and the wall between it and the bedroom */
  ffWall: [1032, 1042] as const,
  /** the wall between the living room and the kitchen */
  gfWall: [896, 906] as const,
  /** the underground sump beside the house: outside faces, then inside */
  sump: { x0: 330, x1: 470, xi0: 344, xi1: 456, top: 692, yi0: 704, yi1: 882, bot: 896, water: 772 },
  groundwater: 812,
  /** rainwater outlet through the east parapet and its downpipe */
  pipeX: [1250, 1258] as const,
} as const;

interface Eye {
  vx: number;
  vy: number;
  /** how much smaller the back wall is than the front opening */
  k: number;
}
const EYE_TERRACE: Eye = { vx: 900, vy: 116, k: 0.64 };
const EYE_FF: Eye = { vx: 900, vy: 390, k: 0.64 };
const EYE_GF: Eye = { vx: 900, vy: 600, k: 0.64 };
const EYE_SUMP: Eye = { vx: 400, vy: 752, k: 0.62 };

interface Room {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  eye: Eye;
}
const BED: Room = { x0: H.xWi, x1: H.ffWall[0], y0: H.ffCeil, y1: H.ffFloor, eye: EYE_FF };
const BATH: Room = { x0: H.ffWall[1], x1: H.xEi, y0: H.ffCeil, y1: H.ffFloor, eye: EYE_FF };
const LIVING: Room = { x0: H.xWi, x1: H.gfWall[0], y0: H.gfCeil, y1: H.gfFloor, eye: EYE_GF };
const KITCHEN: Room = { x0: H.gfWall[1], x1: H.xEi, y0: H.gfCeil, y1: H.gfFloor, eye: EYE_GF };
const TERRACE: Room = { x0: 572, x1: 1228, y0: H.parTop, y1: H.terrace, eye: EYE_TERRACE };
const SUMP: Room = { x0: H.sump.xi0, x1: H.sump.xi1, y0: H.sump.yi0, y1: H.sump.yi1, eye: EYE_SUMP };

/* ------------------------------------------------------------ helpers */

const r1 = (n: number) => Math.round(n * 10) / 10;
const P = (p: Pt) => `${r1(p[0])} ${r1(p[1])}`;
const poly = (ps: readonly Pt[]) => `M${ps.map(P).join("L")}Z`;
const line = (ps: readonly Pt[]) => `M${ps.map(P).join("L")}`;
const path = (d: string, fill: string, extra = "") => `<path d="${d}" fill="${fill}"${extra ? " " + extra : ""}/>`;
const rect = (x: number, y: number, w: number, h: number, fill: string, extra = "") =>
  `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}"${extra ? " " + extra : ""}/>`;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i]! - v) * t).toString(16).padStart(2, "0")).join("");
}
const shade = (c: string, t: number) => mix(c, "#1a1008", t);
const tint = (c: string, t: number) => mix(c, "#ffffff", t);

const depth = (e: Eye, z: number) => 1 / (1 + z * (1 / e.k - 1));
/** a point inside a room: x and y on the front plane, z from 0 (front) to 1 (back wall) */
const pj = (e: Eye, x: number, y: number, z: number): Pt => {
  const s = depth(e, z);
  return [e.vx + (x - e.vx) * s, e.vy + (y - e.vy) * s];
};

type Map2 = (u: number, v: number) => Pt;
const onCeil = (rm: Room): Map2 => (x, z) => pj(rm.eye, x, rm.y0, z);
const onFloor = (rm: Room): Map2 => (x, z) => pj(rm.eye, x, rm.y1, z);
const onLeft = (rm: Room): Map2 => (z, y) => pj(rm.eye, rm.x0, y, z);
const onRight = (rm: Room): Map2 => (z, y) => pj(rm.eye, rm.x1, y, z);
const onBack = (rm: Room): Map2 => (x, y) => pj(rm.eye, x, y, 1);

/** a closed, smooth path through points (Catmull-Rom as cubic Béziers) */
function smooth(p: readonly Pt[]) {
  const n = p.length;
  let d = `M${P(p[0]!)}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n]!, p1 = p[i]!, p2 = p[(i + 1) % n]!, p3 = p[(i + 2) % n]!;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d + "Z";
}

/** an irregular round shape on a plane, centre (cu, cv), radii (ru, rv) in that plane's own units */
function blob(map: Map2, cu: number, cv: number, ru: number, rv: number, seed: number, wob = 0.22, n = 22) {
  const rand = rng(seed);
  const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + wob * (0.5 * Math.sin(2 * a + ph[0]!) + 0.3 * Math.sin(3 * a + ph[1]!) + 0.2 * Math.sin(5 * a + ph[2]!) + 0.12 * Math.sin(7 * a + ph[3]!));
    pts.push(map(cu + Math.cos(a) * ru * k, cv + Math.sin(a) * rv * k));
  }
  return smooth(pts);
}

/** a water stain with tide marks: the rings a leak leaves each time it dries */
function stain(map: Map2, cu: number, cv: number, ru: number, rv: number, seed: number) {
  return (
    path(blob(map, cu, cv, ru * 1.08, rv * 1.08, seed, 0.26), "#9a7a55", `fill-opacity=".16"`) +
    path(blob(map, cu, cv, ru, rv, seed, 0.24), "none", `stroke="#6e4f31" stroke-opacity=".62" stroke-width="1"`) +
    path(blob(map, cu, cv, ru * 0.74, rv * 0.74, seed + 1, 0.28), "#8a6a46", `fill-opacity=".2" stroke="#6e4f31" stroke-opacity=".45" stroke-width=".8"`) +
    path(blob(map, cu, cv, ru * 0.5, rv * 0.5, seed + 2, 0.3), "#6a4a2c", `fill-opacity=".26" stroke="#5a3d22" stroke-opacity=".35" stroke-width=".6"`) +
    path(blob(map, cu, cv, ru * 0.26, rv * 0.26, seed + 3, 0.34), "#4c331d", `fill-opacity=".32"`)
  );
}

interface B3 {
  x0: number;
  x1: number;
  yT: number;
  yB: number;
  z0: number;
  z1: number;
}
/** a box in a room: the faces the eye can see, the front one last */
function box(e: Eye, b: B3, fill: string, extra = "") {
  const Q = (x: number, y: number, z: number) => pj(e, x, y, z);
  let s = "";
  if (b.yT > e.vy) s += path(poly([Q(b.x0, b.yT, b.z0), Q(b.x1, b.yT, b.z0), Q(b.x1, b.yT, b.z1), Q(b.x0, b.yT, b.z1)]), tint(fill, 0.16), extra);
  if (b.yB < e.vy) s += path(poly([Q(b.x0, b.yB, b.z0), Q(b.x1, b.yB, b.z0), Q(b.x1, b.yB, b.z1), Q(b.x0, b.yB, b.z1)]), shade(fill, 0.2), extra);
  if (b.x0 > e.vx) s += path(poly([Q(b.x0, b.yT, b.z0), Q(b.x0, b.yT, b.z1), Q(b.x0, b.yB, b.z1), Q(b.x0, b.yB, b.z0)]), shade(fill, 0.14), extra);
  if (b.x1 < e.vx) s += path(poly([Q(b.x1, b.yT, b.z0), Q(b.x1, b.yT, b.z1), Q(b.x1, b.yB, b.z1), Q(b.x1, b.yB, b.z0)]), shade(fill, 0.14), extra);
  s += path(poly([Q(b.x0, b.yT, b.z0), Q(b.x1, b.yT, b.z0), Q(b.x1, b.yB, b.z0), Q(b.x0, b.yB, b.z0)]), fill, extra);
  return s;
}
const quad = (map: Map2, u0: number, v0: number, u1: number, v1: number) => poly([map(u0, v0), map(u1, v0), map(u1, v1), map(u0, v1)]);

/** a soft contact shadow on a floor */
function floorShadow(rm: Room, x0: number, x1: number, z0: number, z1: number, o = 0.28) {
  const f = onFloor(rm);
  return path(blob(f, (x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2 + 6, (z1 - z0) / 2 + 0.03, 5, 0.04, 16), "url(#mh-shadow)", `opacity="${o}"`);
}

/** the five faces of a room, with its colours */
function roomShell(rm: Room, c: { back: string; left: string; right: string; ceil: string; floor: string }) {
  const { x0, x1, y0, y1, eye: e } = rm;
  const b = (x: number, y: number) => pj(e, x, y, 1);
  let s = path(poly([b(x0, y0), b(x1, y0), b(x1, y1), b(x0, y1)]), c.back);
  if (y0 < e.vy) s += path(poly([[x0, y0], [x1, y0], b(x1, y0), b(x0, y0)]), c.ceil);
  if (y1 > e.vy) s += path(poly([[x0, y1], [x1, y1], b(x1, y1), b(x0, y1)]), c.floor);
  if (x0 < e.vx) s += path(poly([[x0, y0], b(x0, y0), b(x0, y1), [x0, y1]]), c.left);
  if (x1 > e.vx) s += path(poly([[x1, y0], b(x1, y0), b(x1, y1), [x1, y1]]), c.right);
  // the corners of the room, drawn in a fine line so the box reads
  const k = `fill="none" stroke="#5b4630" stroke-opacity=".22" stroke-width=".6"`;
  s += `<path d="${poly([b(x0, y0), b(x1, y0), b(x1, y1), b(x0, y1)])}" ${k}/>`;
  s += `<path d="${line([[x0, y0], b(x0, y0)])}${line([[x1, y0], b(x1, y0)])}${line([[x0, y1], b(x0, y1)])}${line([[x1, y1], b(x1, y1)])}" ${k}/>`;
  return s;
}

/** lines of tiles on a plane: rows along v, columns along u */
function tiles(map: Map2, u0: number, u1: number, v0: number, v1: number, du: number, dv: number, stroke: string, w = 0.5) {
  let d = "";
  for (let u = u0 + du; u < u1 - du * 0.2; u += du) d += line([map(u, v0), map(u, v1)]);
  for (let v = v0 + dv; v < v1 - dv * 0.2; v += dv) d += line([map(u0, v), map(u1, v)]);
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}"/>`;
}

/** a window seen in the back wall at night: glass, a few streaks of rain and its frame */
function nightWindow(rm: Room, x0: number, x1: number, y0: number, y1: number, opts: { grill?: boolean; curtain?: boolean } = {}) {
  const b = onBack(rm);
  let s = path(quad(b, x0 - 3, y0 - 3, x1 + 3, y1 + 3), "#6b5440");
  s += path(quad(b, x0, y0, x1, y1), "url(#mh-glass)");
  const rand = rng(Math.round(x0 * 7 + y0));
  let d = "";
  for (let i = 0; i < 9; i++) {
    const x = x0 + 4 + rand() * (x1 - x0 - 8);
    const y = y0 + 4 + rand() * (y1 - y0 - 24);
    d += line([b(x, y), b(x + 2.5, y + 12 + rand() * 10)]);
  }
  s += `<path d="${d}" stroke="#8fb5c4" stroke-opacity=".35" stroke-width=".6"/>`;
  const mid = (x0 + x1) / 2;
  s += `<path d="${line([b(mid, y0), b(mid, y1)])}${line([b(x0, (y0 + y1) / 2), b(x1, (y0 + y1) / 2)])}" stroke="#6b5440" stroke-width="1.6"/>`;
  if (opts.grill) {
    let g = "";
    for (let x = x0 + 9; x < x1 - 4; x += 9) g += line([b(x, y0), b(x, y1)]);
    s += `<path d="${g}" stroke="#2c2622" stroke-opacity=".7" stroke-width=".9"/>`;
  }
  if (opts.curtain) {
    s += path(poly([b(x0 - 8, y0 - 8), b(x0 + 22, y0 - 8), b(x0 + 16, y1 + 4), b(x0 + 24, y1 + 14), b(x0 - 8, y1 + 14)]), "#c9b38a");
    s += `<path d="${line([b(x0 - 1, y0 - 6), b(x0 - 2, y1 + 12)])}${line([b(x0 + 7, y0 - 6), b(x0 + 8, y1 + 12)])}" stroke="#a8916a" stroke-width=".8"/>`;
  }
  return s;
}

/** a glowing pool of lamp light */
const glow = (c: Pt, r: number, o = 0.6, id = "mh-lamp") => `<circle cx="${r1(c[0])}" cy="${r1(c[1])}" r="${r}" fill="url(#${id})" opacity="${o}"/>`;

/* ------------------------------------------------------------ defs */

const DEFS = `<defs>
<linearGradient id="mh-sky" x1="0" y1="-900" x2="0" y2="700" gradientUnits="userSpaceOnUse">
  <stop offset="0" stop-color="#050d14"/><stop offset=".55" stop-color="#0b1c28"/><stop offset=".86" stop-color="#14303e"/><stop offset="1" stop-color="#1d3d4b"/>
</linearGradient>
<radialGradient id="mh-cloud"><stop offset="0" stop-color="#2b4655" stop-opacity=".55"/><stop offset="1" stop-color="#2b4655" stop-opacity="0"/></radialGradient>
<radialGradient id="mh-lamp"><stop offset="0" stop-color="#ffe2a6" stop-opacity=".95"/><stop offset=".35" stop-color="#ffcf7c" stop-opacity=".42"/><stop offset="1" stop-color="#ffc56b" stop-opacity="0"/></radialGradient>
<radialGradient id="mh-street"><stop offset="0" stop-color="#ffd590" stop-opacity=".7"/><stop offset=".3" stop-color="#ffc874" stop-opacity=".22"/><stop offset="1" stop-color="#ffc874" stop-opacity="0"/></radialGradient>
<radialGradient id="mh-window"><stop offset="0" stop-color="#ffd48a" stop-opacity=".5"/><stop offset="1" stop-color="#ffd48a" stop-opacity="0"/></radialGradient>
<radialGradient id="mh-shadow"><stop offset="0" stop-color="#2a1a0c" stop-opacity=".9"/><stop offset="1" stop-color="#2a1a0c" stop-opacity="0"/></radialGradient>
<radialGradient id="mh-vignette" cx=".5" cy=".42" r=".75"><stop offset=".45" stop-color="#2a1a0c" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0c" stop-opacity=".42"/></radialGradient>
<linearGradient id="mh-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1f2b"/><stop offset="1" stop-color="#1b3442"/></linearGradient>
<linearGradient id="mh-yard" x1="0" y1="664" x2="0" y2="700" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#101c20"/><stop offset="1" stop-color="#1f2f31"/></linearGradient>
<linearGradient id="mh-gw" x1="0" y1="812" x2="0" y2="1000" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#2a6f82" stop-opacity=".26"/><stop offset="1" stop-color="#173f4d" stop-opacity=".42"/></linearGradient>
<linearGradient id="mh-tank" x1="0" x2="1"><stop offset="0" stop-color="#202428"/><stop offset=".38" stop-color="#4a5157"/><stop offset=".55" stop-color="#3a4046"/><stop offset="1" stop-color="#16191c"/></linearGradient>
<linearGradient id="mh-pipe" x1="0" x2="1"><stop offset="0" stop-color="#6d7a80"/><stop offset=".45" stop-color="#a9b5ba"/><stop offset="1" stop-color="#5d696f"/></linearGradient>
<linearGradient id="mh-steel" x1="0" x2="1"><stop offset="0" stop-color="#7d888d"/><stop offset=".35" stop-color="#d9e0e2"/><stop offset=".6" stop-color="#a3adb1"/><stop offset="1" stop-color="#626d72"/></linearGradient>
<linearGradient id="mh-trunk" x1="0" x2="1"><stop offset="0" stop-color="#151b19"/><stop offset=".6" stop-color="#26302c"/><stop offset="1" stop-color="#131816"/></linearGradient>
<pattern id="mh-conc" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#c4c9c8"/><circle cx="3" cy="4" r=".7" fill="#8f9898"/><circle cx="10" cy="2" r=".5" fill="#9aa3a3"/><circle cx="7" cy="10" r=".8" fill="#a1a9a8"/><circle cx="12" cy="11" r=".45" fill="#8a9393"/><circle cx="1.5" cy="12" r=".5" fill="#e4e7e6"/><circle cx="9" cy="6.5" r=".45" fill="#e2e5e4"/></pattern>
<pattern id="mh-brick" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#c9c3bb"/><path d="M-1 8 8-1" stroke="#a49a8f" stroke-width=".6"/></pattern>
<pattern id="mh-coba" width="16" height="10" patternUnits="userSpaceOnUse"><rect width="16" height="10" fill="#b4a596"/><path d="M1 2h5l1 3H2zM9 1h5l-1 4H9zM3 6h4l1 3H3zM10 6h5v3h-5z" fill="#9c8a79"/></pattern>
<pattern id="mh-fill" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#a99c86"/><circle cx="2" cy="3" r=".7" fill="#8c7f6a"/><circle cx="7" cy="7" r=".6" fill="#8c7f6a"/><circle cx="8" cy="2" r=".4" fill="#c4b8a3"/></pattern>
<pattern id="mh-soil" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#2a211b"/><circle cx="4" cy="5" r="1" fill="#3a2e25"/><circle cx="15" cy="3" r=".7" fill="#433529"/><circle cx="10" cy="13" r="1.3" fill="#33281f"/><circle cx="19" cy="17" r=".8" fill="#3d3026"/><circle cx="3" cy="18" r=".6" fill="#45372b"/><ellipse cx="14" cy="9" rx="1.6" ry="1" fill="#30251d"/></pattern>
</defs>`;

/* ------------------------------------------------------------ outside */

function sky() {
  let s = rect(-2400, -1600, 6400, 2300, "url(#mh-sky)");
  // low rain clouds
  for (const [cx, cy, rx, ry] of [
    [180, 60, 520, 120],
    [900, -20, 640, 140],
    [1500, 90, 520, 110],
    [-500, 160, 520, 120],
    [2100, 40, 560, 120],
  ] as const)
    s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#mh-cloud)"/>`;
  return s;
}

/** neighbours across the road: flat blocks in the rain haze with a few lit windows */
function neighbours() {
  const far = "#183140";
  const near = "#112532";
  let s = "";
  const blocks: [number, number, number, string][] = [
    [-1500, -900, 520, near],
    [-900, -420, 450, far],
    [-420, -60, 500, near],
    [-60, 330, 446, far],
    [1290, 1520, 488, near],
    [1520, 1780, 420, far],
    [1780, 2100, 520, near],
    [2100, 2600, 460, far],
  ];
  const rand = rng(11);
  for (const [x0, x1, top, c] of blocks) {
    s += rect(x0, top, x1 - x0, 668 - top, c);
    s += rect(x0 - 2, top - 12, x1 - x0 + 4, 12, c);
    if (rand() > 0.4) {
      const tx = x0 + 20 + rand() * (x1 - x0 - 80);
      s += rect(tx, top - 40, 34, 28, "#0c1a24", `rx="4"`);
    }
    for (let y = top + 34; y < 640; y += 62)
      for (let x = x0 + 22; x < x1 - 40; x += 70) {
        const lit = rand();
        if (lit > 0.8) s += rect(x, y, 24, 28, "#f0c27a", `opacity="${(0.18 + rand() * 0.26).toFixed(2)}"`);
        else if (lit > 0.5) s += rect(x, y, 24, 28, "#0d1b25", `opacity=".7"`);
      }
  }
  return s;
}

/** a coconut palm: a curving trunk and a crown of fronds that moves in the wind */
function palm(bx: number, by: number, tx: number, ty: number, scale: number, seed: number, cls = ""): { trunk: string; crown: string } {
  const rand = rng(seed);
  // trunk: a tapering curve from the base to the crown
  const n = 14;
  const L: Pt[] = [];
  const R: Pt[] = [];
  let rings = "";
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = bx + (tx - bx) * t + Math.sin(t * Math.PI) * 26 * scale;
    const y = by + (ty - by) * t;
    const w = (9 - 4.5 * t) * scale;
    L.push([x - w, y]);
    R.push([x + w, y]);
    if (i > 0 && i < n) rings += line([[x - w, y], [x + w, y + 1.5 * scale]]);
  }
  let s = path(poly([...L, ...R.reverse()]), "url(#mh-trunk)");
  s += `<path d="${rings}" stroke="#0d1210" stroke-opacity=".7" stroke-width="${(1.1 * scale).toFixed(2)}"/>`;
  // crown
  let crown = "";
  const fronds = 13;
  for (let i = 0; i < fronds; i++) {
    const a = -Math.PI / 2 + (i / (fronds - 1) - 0.5) * Math.PI * 1.9 + (rand() - 0.5) * 0.2;
    const len = (120 + rand() * 50) * scale;
    const droop = (0.55 + rand() * 0.35) * len;
    const ex = tx + Math.cos(a) * len;
    const ey = ty + Math.sin(a) * len * 0.55 + droop * 0.6;
    const cx = tx + Math.cos(a) * len * 0.5;
    const cy = ty + Math.sin(a) * len * 0.5 - 18 * scale;
    // the midrib and its leaflets
    let leaf = "";
    for (let j = 1; j < 16; j++) {
      const t = j / 16;
      const x = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * cx + t * t * ex;
      const y = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * cy + t * t * ey;
      const dx = 2 * (1 - t) * (cx - tx) + 2 * t * (ex - cx);
      const dy = 2 * (1 - t) * (cy - ty) + 2 * t * (ey - cy);
      const m = Math.hypot(dx, dy) || 1;
      const nx = -dy / m;
      const ny = dx / m;
      const ll = (26 - 14 * t) * scale;
      leaf += line([[x, y], [x + nx * ll + (dx / m) * 8 * scale, y + ny * ll + 12 * scale]]);
      leaf += line([[x, y], [x - nx * ll + (dx / m) * 8 * scale, y - ny * ll + 12 * scale]]);
    }
    crown += `<path d="M${P([tx, ty])}Q${P([cx, cy])} ${P([ex, ey])}" fill="none" stroke="#0f1916" stroke-width="${(2.2 * scale).toFixed(2)}"/>`;
    crown += `<path d="${leaf}" stroke="#13201b" stroke-width="${(2 * scale).toFixed(2)}" stroke-linecap="round"/>`;
  }
  crown += `<circle cx="${tx - 6 * scale}" cy="${ty + 12 * scale}" r="${7 * scale}" fill="#1e2a1d"/><circle cx="${tx + 7 * scale}" cy="${ty + 14 * scale}" r="${6.5 * scale}" fill="#1a2519"/><circle cx="${tx}" cy="${ty + 20 * scale}" r="${6 * scale}" fill="#222f20"/>`;
  return { trunk: s, crown: `<g class="mh-crown ${cls}" style="transform-origin:${r1(tx)}px ${r1(ty)}px">${crown}</g>` };
}

/** a street light at the edge of the plot, its light catching the rain */
function streetLight(x: number) {
  return (
    `<circle cx="${LAMP.x}" cy="${LAMP.y}" r="${LAMP.r - 10}" fill="url(#mh-street)"/>` +
    rect(x - 4, 404, 8, 296, "#0e1519") +
    `<path d="M${x} 410q0-14 18-14h28" fill="none" stroke="#0e1519" stroke-width="5"/>` +
    rect(x + 34, 398, 26, 8, "#1a2328", `rx="3"`) +
    rect(x + 36, 405, 22, 3, "#ffe6b3")
  );
}

/** the ground beside the house, seen going back, wet and with puddles */
/** puddles in the yard: [cx, cy, rx, ry] */
export const YARD_PUDDLES: readonly (readonly [number, number, number, number])[] = [
  [236, 690, 62, 4.4],
  [-120, 684, 80, 5.6],
  [1330, 692, 52, 3.6],
  [1580, 682, 70, 4.9],
];
/** the street light, and how far its light reaches into the rain */
export const LAMP = { x: 56, y: 410, r: 250 };

function yard() {
  let s = rect(-2400, 664, 2960, 36, "url(#mh-yard)") + rect(H.xE, 664, 2400, 36, "url(#mh-yard)");
  for (const [cx, cy, rx, ry] of YARD_PUDDLES) s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#3c5a66" opacity=".5"/>`;
  return s;
}

/* ------------------------------------------------------------ rooms */

const C = {
  bedBack: "#eedcbc",
  bedLeft: "#e0c7a0",
  bedRight: "#e4cea9",
  bedCeil: "#d5bd96",
  bedFloor: "#b8946c",
  wood: "#7b5a3e",
  woodDark: "#5f442e",
  linen: "#f2ece1",
  ochre: "#c8963a",
  bathTile: "#d2dfe1",
  bathPaint: "#e9e3d6",
  bathFloor: "#bccbcf",
  livBack: "#efdcbd",
  livLeft: "#e2caa3",
  livCeil: "#d6be97",
  livFloor: "#c9aa81",
  sofa: "#3f5e4b",
  kitBack: "#f0e0c3",
  kitRight: "#e2cca7",
  kitCeil: "#d6c09b",
  kitFloor: "#c6a982",
  granite: "#2b2e32",
};

function bedroom() {
  const rm = BED;
  const e = rm.eye;
  let s = roomShell(rm, { back: C.bedBack, left: C.bedLeft, right: C.bedRight, ceil: C.bedCeil, floor: C.bedFloor });
  // floor boards
  s += tiles(onFloor(rm), rm.x0, rm.x1, 0, 1, 1000, 0.2, "#9c7a55", 0.5);
  // skirting
  s += path(quad(onBack(rm), rm.x0, 448, rm.x1, 454), "#c9b28d");
  s += nightWindow(rm, 646, 744, 300, 386, { curtain: true });
  // wardrobe against the west wall
  s += box(e, { x0: 576, x1: 614, yT: 296, yB: 454, z0: 0.5, z1: 0.88 }, "#8d6b4b");
  s += path(line([pj(e, 576, 300, 0.69), pj(e, 576, 452, 0.69)]), "none", `stroke="#6a4f37" stroke-width=".7"`);
  // ceiling fan: three blades seen from below
  const hub = { x: 880, y: 272, z: 0.5 };
  s += path(line([pj(e, hub.x, H.ffCeil, hub.z), pj(e, hub.x, hub.y - 2, hub.z)]), "none", `stroke="#8f8576" stroke-width="1.8"`);
  const DZ = 1 / 680;
  for (const deg of [24, 144, 264]) {
    const a = (deg * Math.PI) / 180;
    const at = (rr: number, w: number): Pt => pj(e, hub.x + Math.cos(a) * rr - Math.sin(a) * w, hub.y, hub.z + (Math.sin(a) * rr + Math.cos(a) * w) * DZ);
    s += path(poly([at(8, -4), at(66, -7), at(72, 0), at(66, 7), at(8, 4)]), "#eae3d5", `stroke="#b6ab98" stroke-width=".5"`);
  }
  const hm = pj(e, hub.x, hub.y, hub.z);
  s += `<ellipse cx="${r1(hm[0])}" cy="${r1(hm[1])}" rx="8" ry="4" fill="#d3c9b7" stroke="#a89c88" stroke-width=".5"/>`;
  // bed with its headboard to the back wall
  s += floorShadow(rm, 856, 1018, 0.36, 1, 0.35);
  s += box(e, { x0: 858, x1: 1016, yT: 362, yB: 454, z0: 0.975, z1: 1 }, "#6a4b33");
  s += box(e, { x0: 862, x1: 1012, yT: 428, yB: 454, z0: 0.38, z1: 0.975 }, C.wood);
  s += box(e, { x0: 866, x1: 1008, yT: 416, yB: 428, z0: 0.4, z1: 0.97 }, C.linen);
  s += box(e, { x0: 884, x1: 990, yT: 404, yB: 416, z0: 0.86, z1: 0.95 }, "#fbf8f2");
  s += box(e, { x0: 864, x1: 1010, yT: 413, yB: 433, z0: 0.4, z1: 0.74 }, C.ochre);
  s += path(quad((x, y) => pj(e, x, y, 0.4), 864, 420, 1010, 423), "#9b6e22", `opacity=".6"`);
  // side table and lamp
  s += box(e, { x0: 822, x1: 852, yT: 418, yB: 454, z0: 0.84, z1: 0.97 }, C.wood);
  const lb = pj(e, 837, 418, 0.9);
  s += glow(pj(e, 837, 398, 0.9), 120, 0.75);
  s += rect(lb[0] - 1.2, lb[1] - 12, 2.4, 12, "#6b5a45");
  s += path(poly([pj(e, 828, 389, 0.9), pj(e, 846, 389, 0.9), pj(e, 851, 404, 0.9), pj(e, 823, 404, 0.9)]), "#f7deab");
  return s;
}

/** the bucket under the ceiling leak (a leak), and the stain above it */
export const BUCKET = { x: 790, z: 0.21 };
function bedroomLeak() {
  const rm = BED;
  const e = rm.eye;
  let s = `<g class="lk lk-terrace">`;
  s += stain(onCeil(rm), BUCKET.x, BUCKET.z, 46, 0.12, 21);
  // the bucket
  const c = pj(e, BUCKET.x, H.ffFloor, BUCKET.z);
  const sc = depth(e, BUCKET.z);
  const h = 25 * sc;
  const rt = 16 * sc;
  const rb = 12.5 * sc;
  s += `<ellipse cx="${r1(c[0])}" cy="${r1(c[1])}" rx="${r1(rb + 6)}" ry="${r1(3.2)}" fill="#3b2a18" opacity=".3"/>`;
  s += path(`M${P([c[0] - rt, c[1] - h])}L${P([c[0] - rb, c[1]])}Q${P([c[0], c[1] + 3.5])} ${P([c[0] + rb, c[1]])}L${P([c[0] + rt, c[1] - h])}Z`, "url(#mh-steel)");
  s += `<ellipse cx="${r1(c[0])}" cy="${r1(c[1] - h)}" rx="${r1(rt)}" ry="${r1(rt * 0.28)}" fill="#59666b"/>`;
  s += `<ellipse cx="${r1(c[0])}" cy="${r1(c[1] - h + 1.2)}" rx="${r1(rt - 2)}" ry="${r1((rt - 2) * 0.26)}" fill="#7fb6c4"/>`;
  s += `<ellipse cx="${r1(c[0])}" cy="${r1(c[1] - h)}" rx="${r1(rt)}" ry="${r1(rt * 0.28)}" fill="none" stroke="#e1e7e9" stroke-width=".9"/>`;
  s += `<path d="M${P([c[0] - rt + 1, c[1] - h])}Q${P([c[0], c[1] - h - 13 * sc])} ${P([c[0] + rt - 1, c[1] - h])}" fill="none" stroke="#9aa5a9" stroke-width=".8"/>`;
  s += `</g>`;
  return s;
}

function bathroom() {
  const rm = BATH;
  const e = rm.eye;
  const tileTop = 312;
  let s = roomShell(rm, { back: C.bathPaint, left: C.bathPaint, right: "#e2dccd", ceil: "#d9d2c3", floor: C.bathFloor });
  const b = onBack(rm);
  const rgt = onRight(rm);
  s += path(quad(b, rm.x0, tileTop, rm.x1, rm.y1), C.bathTile);
  s += path(quad(rgt, 0, tileTop, 1, rm.y1), "#c4d3d6");
  s += tiles(b, rm.x0, rm.x1, tileTop, rm.y1, 18, 18, "#aebfc3", 0.5);
  s += tiles(rgt, 0, 1, tileTop, rm.y1, 0.1, 18, "#a6b8bc", 0.5);
  s += tiles(onFloor(rm), rm.x0, rm.x1, 0, 1, 18, 0.12, "#a3b4b9", 0.5);
  // ventilator high in the back wall
  s += path(quad(b, 1172, 266, 1216, 290), "#6b5440");
  s += path(quad(b, 1175, 269, 1213, 287), "url(#mh-glass)");
  s += `<path d="${line([b(1175, 274), b(1213, 274)])}${line([b(1175, 279), b(1213, 279)])}${line([b(1175, 284), b(1213, 284)])}" stroke="#8a7a66" stroke-width=".8"/>`;
  // a wall light
  s += glow(b(1146, 290), 70, 0.6);
  s += path(quad(b, 1137, 284, 1155, 290), "#fff1d2");
  // WC: cistern on the wall, bowl in front
  s += floorShadow(rm, 1144, 1176, 0.78, 0.96, 0.3);
  s += box(e, { x0: 1138, x1: 1182, yT: 350, yB: 378, z0: 0.95, z1: 1 }, "#f4f5f2");
  s += path(line([pj(e, 1160, 378, 0.97), pj(e, 1160, 424, 0.92)]), "none", `stroke="#d9dcd8" stroke-width="2"`);
  s += box(e, { x0: 1148, x1: 1172, yT: 430, yB: 454, z0: 0.78, z1: 0.95 }, "#eef0ec");
  s += box(e, { x0: 1145, x1: 1175, yT: 425, yB: 430, z0: 0.76, z1: 0.95 }, "#f8f9f6");
  // shower on the east wall
  const sh = (y: number, z = 0.56) => pj(e, H.xEi, y, z);
  s += path(line([sh(404), sh(322)]), "none", `stroke="#a8b2b6" stroke-width="1.6"`);
  s += rect(sh(404)[0] - 3, sh(404)[1] - 3, 5, 6, "#b9c3c7", `rx="1"`);
  const head = pj(e, H.xEi - 12, 322, 0.56);
  s += path(line([sh(322), head]), "none", `stroke="#a8b2b6" stroke-width="1.6"`);
  s += `<ellipse cx="${r1(head[0])}" cy="${r1(head[1] + 1)}" rx="5" ry="2" fill="#c7cfd2"/>`;
  // the floor trap
  const ft = pj(e, 1150, H.ffFloor, 0.3);
  s += `<ellipse cx="${r1(ft[0])}" cy="${r1(ft[1])}" rx="7" ry="2" fill="#8e9a9e" stroke="#6e7a7e" stroke-width=".6"/>`;
  return s;
}

/** water from the shower: a few falling lines and a wet sheen on the floor (not a leak) */
function showerSheen() {
  const floor = pj(BATH.eye, H.xEi - 12, H.ffFloor, 0.56);
  return `<ellipse cx="${r1(floor[0] - 6)}" cy="${r1(floor[1] + 1)}" rx="20" ry="3" fill="#9fc4cc" opacity=".55"/>`;
}
function showerFlow() {
  const e = BATH.eye;
  const head = pj(e, H.xEi - 12, 324, 0.56);
  const floor = pj(e, H.xEi - 12, H.ffFloor, 0.56);
  let d = "";
  for (const dx of [-4, -1.5, 1, 3.5]) d += line([[head[0] + dx * 0.5, head[1] + 2], [floor[0] + dx * 2.2, floor[1] - 1]]);
  return `<path class="mh-shower" d="${d}" stroke="#d6f1f6" stroke-opacity=".8" stroke-width=".9" stroke-dasharray="6 7"/>`;
}

function livingRoom() {
  const rm = LIVING;
  const e = rm.eye;
  let s = roomShell(rm, { back: C.livBack, left: C.livLeft, right: C.livLeft, ceil: C.livCeil, floor: C.livFloor });
  s += tiles(onFloor(rm), rm.x0, rm.x1, 0, 1, 46, 0.2, "#ad8e66", 0.5);
  s += path(quad(onBack(rm), rm.x0, 664, rm.x1, 670), "#c7ae86");
  s += path(quad(onLeft(rm), 0, 664, 1, 670), "#bfa47b");
  // rug
  s += path(quad(onFloor(rm), 664, 0.38, 846, 0.72), "#9a5b3e");
  s += path(quad(onFloor(rm), 672, 0.42, 838, 0.68), "none", `stroke="#d9a35c" stroke-width=".8"`);
  // a framed picture over the sofa
  const b = onBack(rm);
  s += path(quad(b, 706, 534, 790, 580), "#6b4f35");
  s += path(quad(b, 710, 538, 786, 576), "#d8b06a");
  s += path(poly([b(710, 576), b(736, 556), b(752, 566), b(772, 548), b(786, 562), b(786, 576)]), "#5d7a62");
  // floor lamp
  s += glow(pj(e, 616, 556, 0.9), 140, 0.7);
  const lb = pj(e, 616, 670, 0.9);
  const lt = pj(e, 616, 566, 0.9);
  s += path(line([lb, lt]), "none", `stroke="#9b8156" stroke-width="1.4"`);
  s += `<ellipse cx="${r1(lb[0])}" cy="${r1(lb[1])}" rx="7" ry="1.8" fill="#7a6342"/>`;
  s += path(poly([pj(e, 606, 544, 0.9), pj(e, 626, 544, 0.9), pj(e, 632, 566, 0.9), pj(e, 600, 566, 0.9)]), "#f6dda8");
  // sofa
  s += floorShadow(rm, 636, 846, 0.74, 0.99, 0.4);
  s += box(e, { x0: 640, x1: 840, yT: 596, yB: 634, z0: 0.92, z1: 0.985 }, "#36513f");
  s += box(e, { x0: 642, x1: 838, yT: 634, yB: 664, z0: 0.76, z1: 0.98 }, C.sofa);
  s += box(e, { x0: 656, x1: 824, yT: 624, yB: 636, z0: 0.78, z1: 0.93 }, "#4c6d58");
  s += box(e, { x0: 640, x1: 657, yT: 616, yB: 664, z0: 0.76, z1: 0.985 }, "#36513f");
  s += box(e, { x0: 823, x1: 840, yT: 616, yB: 664, z0: 0.76, z1: 0.985 }, "#36513f");
  s += box(e, { x0: 668, x1: 700, yT: 604, yB: 627, z0: 0.88, z1: 0.91 }, "#d1a24a");
  s += box(e, { x0: 792, x1: 822, yT: 605, yB: 627, z0: 0.88, z1: 0.91 }, "#b8673f");
  // coffee table
  s += floorShadow(rm, 700, 800, 0.46, 0.6, 0.3);
  s += box(e, { x0: 704, x1: 708, yT: 646, yB: 670, z0: 0.5, z1: 0.56 }, C.woodDark);
  s += box(e, { x0: 796, x1: 800, yT: 646, yB: 670, z0: 0.5, z1: 0.56 }, C.woodDark);
  s += box(e, { x0: 700, x1: 804, yT: 640, yB: 646, z0: 0.46, z1: 0.6 }, C.wood);
  const cup = pj(e, 760, 640, 0.52);
  s += rect(cup[0] - 3, cup[1] - 6, 6, 6, "#f2efe8", `rx="1"`);
  // a plant in the corner
  const pp = pj(e, 868, 670, 0.9);
  s += path(`M${P([pp[0] - 7, pp[1] - 14])}h14l-2 14h-10z`, "#9b5a3a");
  s += `<path d="M${P([pp[0], pp[1] - 14])}q-14-20-4-38M${P([pp[0], pp[1] - 14])}q10-22 16-30M${P([pp[0], pp[1] - 14])}q-2-26 6-44M${P([pp[0], pp[1] - 14])}q-20-8-22-22" fill="none" stroke="#4e6d45" stroke-width="3" stroke-linecap="round"/>`;
  return s;
}

/** the damp inside face of the west wall (a leak) */
export const DAMP = { z: 0.3, y: 590 };
function livingLeak() {
  const rm = LIVING;
  const L = onLeft(rm);
  let s = `<g class="lk lk-walls">`;
  s += path(blob(L, DAMP.z, DAMP.y + 6, 0.27, 62, 41, 0.22), "#7c6b52", `fill-opacity=".22"`);
  s += path(blob(L, DAMP.z, DAMP.y, 0.24, 55, 41, 0.22), "#5e4b33", `fill-opacity=".2" stroke="#6b5235" stroke-opacity=".5" stroke-width=".8"`);
  s += path(blob(L, DAMP.z + 0.02, DAMP.y + 16, 0.15, 34, 43, 0.3), "#4e3d29", `fill-opacity=".25"`);
  // mould
  const rand = rng(44);
  let m = "";
  for (let i = 0; i < 26; i++) {
    const p = L(DAMP.z - 0.16 + rand() * 0.3, DAMP.y - 40 + rand() * 60);
    m += `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="${(0.5 + rand() * 1.1).toFixed(1)}"/>`;
  }
  s += `<g fill="#2f3a2a" opacity=".55">${m}</g>`;
  // paint peeling and flaking near the bottom of the patch
  for (const [z, y, w] of [
    [0.22, 640, 0.07],
    [0.34, 646, 0.05],
    [0.29, 632, 0.04],
  ] as const) {
    s += path(poly([L(z, y), L(z + w, y - 3), L(z + w * 1.1, y + 6), L(z + 0.01, y + 8)]), "#efe3cb");
    s += path(line([L(z, y), L(z + w, y - 3)]), "none", `stroke="#8f7a5a" stroke-width=".6"`);
  }
  const fl = pj(rm.eye, 600, 670, 0.3);
  s += `<path d="M${P([fl[0] - 6, fl[1] - 1])}l4-2 3 2zM${P([fl[0] + 8, fl[1] - 2])}l3-1 2 2z" fill="#efe3cb"/>`;
  s += `</g>`;
  return s;
}

function kitchen() {
  const rm = KITCHEN;
  const e = rm.eye;
  let s = roomShell(rm, { back: C.kitBack, left: C.kitRight, right: C.kitRight, ceil: C.kitCeil, floor: C.kitFloor });
  const b = onBack(rm);
  s += tiles(onFloor(rm), rm.x0, rm.x1, 0, 1, 40, 0.2, "#a98b64", 0.5);
  // tube light
  s += glow(b(975, 492), 110, 0.6);
  s += path(quad(b, 942, 489, 1008, 493), "#fff6e2");
  // backsplash, and a window with a grill over the counter
  s += path(quad(b, 922, 568, 1208, 606), "#e8dfcd");
  s += tiles(b, 922, 1208, 568, 606, 20, 10, "#cfc3ab", 0.45);
  s += nightWindow(rm, 1102, 1190, 506, 562, { grill: true });
  // upper cabinets
  s += box(e, { x0: 930, x1: 1036, yT: 494, yB: 540, z0: 0.88, z1: 1 }, "#9a7a58");
  s += path(line([pj(e, 983, 496, 0.88), pj(e, 983, 538, 0.88)]), "none", `stroke="#6f5338" stroke-width=".7"`);
  // counter
  s += box(e, { x0: 924, x1: 1206, yT: 612, yB: 670, z0: 0.82, z1: 1 }, "#8a6a4a");
  let doors = "";
  for (const x of [970, 1018, 1066, 1114, 1162]) doors += line([pj(e, x, 616, 0.82), pj(e, x, 666, 0.82)]);
  s += `<path d="${doors}" stroke="#634a33" stroke-width=".8"/>`;
  s += box(e, { x0: 922, x1: 1208, yT: 606, yB: 612, z0: 0.8, z1: 1 }, C.granite);
  // stove and a pressure cooker
  s += box(e, { x0: 956, x1: 1018, yT: 602, yB: 606, z0: 0.85, z1: 0.96 }, "#1b1d20");
  const pc = pj(e, 985, 602, 0.9);
  s += path(`M${P([pc[0] - 11, pc[1]])}v-17q0-4 11-4t11 4v17z`, "url(#mh-steel)");
  s += rect(pc[0] - 2, pc[1] - 26, 4, 5, "#2a2a2a");
  s += path(line([[pc[0] + 8, pc[1] - 19], [pc[0] + 26, pc[1] - 21]]), "none", `stroke="#1e1e1e" stroke-width="2.4" stroke-linecap="round"`);
  // sink and tap
  const sk = pj(e, 1146, 606, 0.9);
  s += `<ellipse cx="${r1(sk[0])}" cy="${r1(sk[1])}" rx="17" ry="2.2" fill="#5d666a"/>`;
  s += `<path d="M${P(b(1146, 596))}q0-12 8-12t8 6" fill="none" stroke="#b9c3c7" stroke-width="1.5"/>`;
  // the bulge of the sunken bathroom slab above, along the ceiling
  s += box(e, { x0: H.ffWall[1], x1: H.xEi, yT: H.gfCeil, yB: H.sunkBot, z0: 0, z1: 1 }, "#d3bf9b");
  return s;
}

/** the stain under the bathroom (a leak) */
export const KSTAIN = { x: 1128, z: 0.3 };
function kitchenLeak() {
  const rm = KITCHEN;
  const e = rm.eye;
  const under: Map2 = (x, z) => pj(e, x, H.sunkBot, z);
  let s = `<g class="lk lk-bathroom">`;
  s += stain(under, KSTAIN.x, KSTAIN.z, 44, 0.16, 31);
  // a small puddle where it drips
  const f = pj(e, KSTAIN.x, H.gfFloor, KSTAIN.z);
  s += `<ellipse cx="${r1(f[0])}" cy="${r1(f[1])}" rx="14" ry="2.6" fill="#8fb3bc" opacity=".55"/>`;
  s += `</g>`;
  return s;
}

/* ------------------------------------------------------------ terrace */

export const PUDDLE = { x: 790, z: 0.22, rx: 92, rz: 0.2 };
/** the terrace floor as seen from above, between the parapets */
export const TERRACE_FLOOR = {
  front: H.terrace,
  back: pj(EYE_TERRACE, 0, H.terrace, 1)[1],
  x0: 572,
  x1: 1228,
  bx0: pj(EYE_TERRACE, 572, H.terrace, 1)[0],
  bx1: pj(EYE_TERRACE, 1228, H.terrace, 1)[0],
};
export const TANK = { x0: 622, x1: 698, top: 127, base: 202, z: 0.7 };
/** the tank and its platform as drawn: rain landing behind them lands on the tank instead */
export const TANK_SCREEN = {
  x0: pj(EYE_TERRACE, 610, TANK.base, 0.62)[0],
  x1: pj(EYE_TERRACE, 712, TANK.base, 0.62)[0],
  top: pj(EYE_TERRACE, TANK.x0, TANK.top, TANK.z)[1] + 2,
  base: pj(EYE_TERRACE, 610, H.terrace, 0.62)[1],
};
/** the standing water on the terrace as drawn, as an ellipse: rain makes rings in it */
export const PUDDLE_SCREEN = (() => {
  const c = pj(EYE_TERRACE, 790, H.terrace, 0.22);
  const back = pj(EYE_TERRACE, 790, H.terrace, 0.22 + 0.17)[1];
  const front = pj(EYE_TERRACE, 790, H.terrace, Math.max(0, 0.22 - 0.17))[1];
  return { cx: c[0], cy: (back + front) / 2, rx: 84 * depth(EYE_TERRACE, 0.22), ry: (front - back) / 2 };
})();

function terrace() {
  const rm = TERRACE;
  const e = rm.eye;
  const f = onFloor(rm);
  let s = "";
  // the terrace floor: brick-bat coba with tiles of the weathering course
  s += path(poly([f(rm.x0, 0), f(rm.x1, 0), f(rm.x1, 1), f(rm.x0, 1)]), "#4f5a5e");
  s += tiles(f, rm.x0, rm.x1, 0, 1, 30, 0.12, "#3f494d", 0.6);
  // back parapet and the inner faces of the side parapets
  s += box(e, { x0: 572, x1: 1228, yT: H.coping + 2, yB: H.terrace, z0: 1, z1: 1.06 }, "#5d6a6f");
  s += box(e, { x0: 560, x1: 572, yT: H.parTop, yB: H.terrace, z0: 0, z1: 1.06 }, "#56636a");
  s += box(e, { x0: 1228, x1: 1240, yT: H.parTop, yB: H.terrace, z0: 0, z1: 1.06 }, "#56636a");
  // the copings along the tops
  s += box(e, { x0: 557, x1: 575, yT: H.coping, yB: H.parTop, z0: 0, z1: 1.06 }, "#6d7a80");
  s += box(e, { x0: 1225, x1: 1243, yT: H.coping, yB: H.parTop, z0: 0, z1: 1.06 }, "#6d7a80");
  s += box(e, { x0: 557, x1: 1243, yT: H.coping - 1, yB: H.coping + 3, z0: 1.04, z1: 1.08 }, "#6d7a80");
  // water tank on its platform
  s += box(e, { x0: 610, x1: 712, yT: TANK.base, yB: H.terrace, z0: 0.62, z1: 0.82 }, "#717d82");
  const tl = pj(e, TANK.x0, TANK.top, TANK.z);
  const tr = pj(e, TANK.x1, TANK.base, TANK.z);
  const w = tr[0] - tl[0];
  const cx = (tl[0] + tr[0]) / 2;
  s += path(`M${P([tl[0], tr[1]])}V${r1(tl[1] + 6)}Q${r1(tl[0])} ${r1(tl[1])} ${r1(cx)} ${r1(tl[1])}T${r1(tr[0])} ${r1(tl[1] + 6)}V${r1(tr[1])}Q${r1(cx)} ${r1(tr[1] + 4)} ${r1(tl[0])} ${r1(tr[1])}Z`, "url(#mh-tank)");
  let ribs = "";
  for (let i = 1; i < 6; i++) {
    const y = tl[1] + 8 + ((tr[1] - tl[1] - 10) * i) / 6;
    ribs += `M${r1(tl[0])} ${r1(y)}Q${r1(cx)} ${r1(y + 3)} ${r1(tr[0])} ${r1(y)}`;
  }
  s += `<path d="${ribs}" fill="none" stroke="#0b0d0f" stroke-opacity=".55" stroke-width=".8"/>`;
  s += `<ellipse cx="${r1(cx)}" cy="${r1(tl[1] + 1)}" rx="${r1(w * 0.2)}" ry="2" fill="#2c3237"/>`;
  return s;
}

function terraceLeak() {
  const rm = TERRACE;
  const f = onFloor(rm);
  let s = `<g class="lk lk-terrace">`;
  // standing water where the slope never took it to the outlet
  s += path(blob(f, PUDDLE.x, PUDDLE.z, PUDDLE.rx, PUDDLE.rz, 61, 0.18), "#2c4f5d", `opacity=".95"`);
  s += path(blob(f, PUDDLE.x + 6, PUDDLE.z - 0.01, PUDDLE.rx * 0.82, PUDDLE.rz * 0.8, 62, 0.2), "#36606f", `opacity=".8"`);
  s += path(blob(f, PUDDLE.x - 30, PUDDLE.z - 0.07, 28, 0.03, 63, 0.2), "#7fa9b6", `opacity=".35"`);
  // the hairline crack it soaks into
  s += path(line([f(724, 0.36), f(742, 0.3), f(760, 0.27), f(776, 0.23), f(790, 0.21), f(808, 0.15), f(826, 0.12), f(846, 0.05)]), "none", `stroke="#16222a" stroke-width="1.3" stroke-linejoin="round"`);
  s += `</g>`;
  return s;
}

/* ------------------------------------------------------------ underground */

function sumpRoom() {
  const rm = SUMP;
  const e = rm.eye;
  let s = roomShell(rm, { back: "#56656b", left: "#4b5a60", right: "#4f5e64", ceil: "#3e4b50", floor: "#43535a" });
  // the water: its surface, seen from above, and the body through the cut
  const wf: Map2 = (x, z) => pj(e, x, H.sump.water, z);
  s += `<g class="mh-sumpwater">`;
  s += path(poly([wf(rm.x0, 0), wf(rm.x1, 0), wf(rm.x1, 1), wf(rm.x0, 1)]), "#3f7f8f", `opacity=".9"`);
  s += path(poly([wf(rm.x0, 1), wf(rm.x1, 1), pj(e, rm.x1, rm.y1, 1), pj(e, rm.x0, rm.y1, 1)]), "#2b6372", `opacity=".55"`);
  s += rect(rm.x0, H.sump.water, rm.x1 - rm.x0, rm.y1 - H.sump.water, "#2a6b7b", `opacity=".62"`);
  s += path(line([wf(rm.x0, 0), wf(rm.x1, 0)]), "none", `stroke="#9fd6e0" stroke-opacity=".7" stroke-width="1"`);
  s += `</g>`;
  // murky water before it is sealed (a leak)
  s += `<g class="lk lk-sump">`;
  s += path(poly([wf(rm.x0, 0), wf(rm.x1, 0), wf(rm.x1, 1), wf(rm.x0, 1)]), "#5f6a4a", `opacity=".55"`);
  s += rect(rm.x0, H.sump.water, rm.x1 - rm.x0, rm.y1 - H.sump.water, "#4c5a40", `opacity=".42"`);
  s += `</g>`;
  return s;
}

/* ------------------------------------------------------------ the cut */

function cut() {
  let o = "";
  // soil below ground, and ground water in the lower part of it
  o += rect(-2400, H.ground, 6400, 2400, "url(#mh-soil)");
  o += `<g class="mh-gw">${rect(-2400, H.groundwater, 6400, 2400, "url(#mh-gw)")}</g>`;
  return o;
}

/** walls, slabs, parapets and foundations, cut on the front plane */
function structure() {
  const s = H.sump;
  let o = "";
  const brick = "url(#mh-brick)";
  const conc = "url(#mh-conc)";
  const edge = `stroke="#6f7675" stroke-width=".7"`;
  // foundations under the walls: plinth beam, stepped footing, concrete bed
  for (const cx of [568, 1232]) {
    o += rect(cx - 12, 700, 24, 24, conc, edge);
    o += rect(cx - 20, 724, 40, 30, brick, edge);
    o += rect(cx - 30, 754, 60, 26, brick, edge);
    o += rect(cx - 38, 780, 76, 9, conc, edge);
  }
  o += rect(889, 690, 24, 34, conc, edge);
  o += rect(884, 724, 34, 30, brick, edge);
  o += rect(878, 754, 46, 8, conc, edge);
  // ground floor on its plinth fill
  o += rect(H.xWi, H.gfFloor, H.xEi - H.xWi, 10, conc, edge);
  o += rect(H.xWi, H.gfFloor + 10, H.xEi - H.xWi, H.ground - H.gfFloor - 10, "url(#mh-fill)", edge);
  // outer walls, full height, and the partitions
  o += rect(H.xW, H.ffCeil, H.xWi - H.xW, H.ground - H.ffCeil, brick, edge);
  o += rect(H.xEi, H.ffCeil, H.xE - H.xEi, H.ground - H.ffCeil, brick, edge);
  o += rect(H.ffWall[0], H.ffCeil, H.ffWall[1] - H.ffWall[0], H.ffFloor - H.ffCeil, brick, edge);
  o += rect(H.gfWall[0], H.gfCeil, H.gfWall[1] - H.gfWall[0], H.gfFloor - H.gfCeil, brick, edge);
  // parapets and copings
  o += rect(H.xW, H.parTop, 12, H.roofTop - H.parTop, brick, edge);
  o += rect(1228, H.parTop, 12, H.roofTop - H.parTop, brick, edge);
  o += rect(557, H.coping, 18, 6, conc, edge);
  o += rect(1225, H.coping, 18, 6, conc, edge);
  // roof slab and the weathering course of brick bats on it
  o += rect(H.xW, H.roofTop, H.xE - H.xW, H.ffCeil - H.roofTop, conc, edge);
  o += rect(572, H.terrace, 656, H.roofTop - H.terrace, "url(#mh-coba)", edge);
  // first floor slab; under the bathroom it drops to make room for the pipes
  o += rect(H.xW, H.ffFloor, H.ffWall[1] - H.xW, H.gfCeil - H.ffFloor, conc, edge);
  o += path(`M${H.ffWall[1] - 6} ${H.ffFloor}H${H.ffWall[1]}V${H.sunkTop}H${H.xE}V${H.sunkBot}H${H.ffWall[1] - 6}Z`, conc, edge);
  o += rect(H.ffWall[1], H.ffFloor, H.xEi - H.ffWall[1], H.sunkTop - H.ffFloor, "url(#mh-coba)", edge);
  // floor tiles over the filling, and the pipe through it
  o += rect(H.ffWall[1], H.ffFloor, H.xEi - H.ffWall[1], 2, "#c5d2d5");
  o += rect(1100, 462, 140, 5, "url(#mh-pipe)");
  // the sump: walls, floor, the slab over it and its manhole
  const mid = (s.x0 + s.x1) / 2;
  o += rect(s.x0, s.yi0, s.xi0 - s.x0, s.yi1 - s.yi0, conc, edge);
  o += rect(s.xi1, s.yi0, s.x1 - s.xi1, s.yi1 - s.yi0, conc, edge);
  o += rect(s.x0, s.yi1, s.x1 - s.x0, s.bot - s.yi1, conc, edge);
  o += rect(s.x0, s.top, mid - 26 - s.x0, s.yi0 - s.top, conc, edge);
  o += rect(mid + 26, s.top, s.x1 - mid - 26, s.yi0 - s.top, conc, edge);
  o += rect(mid - 32, s.top - 6, 64, 6, conc, edge);
  o += rect(mid - 26, s.top - 9, 52, 4, "#39424a", `rx="1"`);
  o += rect(mid - 26, s.top - 2, 52, s.yi0 - s.top + 2, "#3a444a");
  // pipes: water in from the street, and out to the house
  o += rect(s.x0 - 110, 712, 124, 6, "url(#mh-pipe)");
  o += rect(s.xi0, 712, 6, 20, "url(#mh-pipe)");
  o += rect(s.xi1 - 8, 728, H.xWi - s.xi1 + 8, 6, "url(#mh-pipe)");
  // rainwater outlet through the east parapet, and its downpipe
  o += rect(1236, 220, 22, 7, "url(#mh-pipe)");
  o += rect(H.pipeX[0], 220, H.pipeX[1] - H.pipeX[0], 470, "url(#mh-pipe)");
  o += path(`M${H.pipeX[0]} 690h8l10 6h-18z`, "#8d999f");
  return o;
}

/* ------------------------------------------------------------ leaks */

/** an animated line of water seeping along a path */
const seep = (d: string, color = "#c6dbe1", w = 1.6) => `<path class="mh-seep" d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="1.5 6"/>`;

/** a drop that falls from a stain and splashes */
function drip(from: Pt, to: Pt, delay: number, dur = 1.8) {
  const fall = to[1] - from[1];
  return (
    `<circle class="mh-drip" cx="${r1(from[0])}" cy="${r1(from[1] + 2)}" r="1.9" fill="#dcebef" style="--fall:${r1(fall - 2)}px;animation-delay:${delay}s;animation-duration:${dur}s"/>` +
    `<ellipse class="mh-ring" cx="${r1(to[0])}" cy="${r1(to[1])}" rx="6" ry="1.4" fill="none" stroke="#d8f2f6" stroke-width=".7" style="animation-delay:${(delay + dur * 0.5).toFixed(2)}s;animation-duration:${dur}s"/>`
  );
}

function leaks(moving: boolean) {
  let o = "";
  // terrace: through the slab, the stain, and drops into the bucket
  const crack = pj(EYE_TERRACE, BUCKET.x, H.terrace, BUCKET.z);
  const st = pj(EYE_FF, BUCKET.x, H.ffCeil, BUCKET.z);
  const sc = depth(EYE_FF, BUCKET.z);
  const bucketTop = pj(EYE_FF, BUCKET.x, H.ffFloor - 25, BUCKET.z);
  if (moving) {
    o += `<g class="lk lk-terrace">`;
    o += seep(`M${P(crack)}C${P([crack[0] - 4, crack[1] + 14])} ${P([st[0] + 5, st[1] - 16])} ${P([st[0], st[1] + 2])}`);
    o += drip([st[0], st[1] + 3], [bucketTop[0], bucketTop[1] + 1.2 * sc], 0, 1.6);
    o += drip([st[0] + 6, st[1] + 1], [bucketTop[0] + 4, bucketTop[1] + 1.6 * sc], 0.9, 2.3);
    o += `</g>`;
  }
  // bathroom: a leaking joint soaks the filling, goes through the slab and stains the ceiling below
  const ks = pj(EYE_GF, KSTAIN.x, H.sunkBot, KSTAIN.z);
  const kf = pj(EYE_GF, KSTAIN.x, H.gfFloor, KSTAIN.z);
  o += `<g class="lk lk-bathroom">`;
  if (moving) {
    o += seep(`M1120 466C1121 476 ${r1(ks[0] - 6)} ${r1(ks[1] - 14)} ${P([ks[0], ks[1] + 1])}`);
    o += seep(`M1150 466c4 6 4 12 2 20`);
    o += drip([ks[0], ks[1] + 2], [kf[0], kf[1]], 0.4, 2.1);
  } else o += path(blob((u, v) => [u, v], 1122, 467, 30, 6, 71, 0.25), "#3b4f57", `opacity=".42"`);
  o += `</g>`;
  // walls: rain driven through hairline cracks in the west wall
  const cracks = ["M560 532l4 3-2 4 6 2-1 5 5 3 4 1", "M560 596l3-2 3 4 4-1 2 5 4 2 4-1", "M560 640l5 2-1 4 5 1 2 4 5 2"];
  o += `<g class="lk lk-walls">`;
  o += moving ? seep(cracks.join(""), "#c6dbe1", 1.4) : `<path d="${cracks.join("")}" fill="none" stroke="#3a2d22" stroke-width="1.1" stroke-linejoin="round"/>`;
  o += `</g>`;
  // sump: ground water seeps in at the bottom, drinking water seeps out at the pipe
  const s = H.sump;
  const L = (x: number, y: number) => `${s.x0 + x} ${y}`;
  const R = (x: number, y: number) => `${s.xi1 + x} ${y}`;
  o += `<g class="lk lk-sump">`;
  if (moving) {
    o += seep(`M${L(-4, 846)}l8 3-1 4 5 2-2 4 5 3 3 2l3 14`, "#a9875a", 1.6);
    o += seep(`M${R(0, 731)}h16l8 4 10 8`, "#c6dbe1", 1.5);
    o += seep(`M${R(14, 726)}c8-1 16 1 22 5`, "#c6dbe1", 1.2);
  } else {
    o += `<path d="M${L(0, 846)}l4 2-1 4 5 2-2 4 5 3 3 2" fill="none" stroke="#1d1712" stroke-width="1.2"/>`;
    o += path(blob((u, v) => [u, v], s.xi0 + 4, 866, 6, 16, 81, 0.3), "#6d5a3c", `opacity=".5"`);
    o += path(blob((u, v) => [u, v], s.x1 + 22, 742, 20, 15, 83, 0.28), "#150f0b", `opacity=".42"`);
    o += `<path d="M${R(0, 800)}l4-2 2 4 4-1 4 3" fill="none" stroke="#1d1712" stroke-width="1"/>`;
  }
  o += `</g>`;
  return o;
}

/* ------------------------------------------------------------ fixes */

/** a membrane or coat line: a soft glow under a bright core, drawn on when sealed */
const seal = (zone: ZoneKey, d: string, w = 3) =>
  `<path class="fx fx-${zone} fx-line" pathLength="1" d="${d}" fill="none" stroke="#e6dfd1" stroke-opacity=".28" stroke-width="${w * 3.2}" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path class="fx fx-${zone} fx-line" pathLength="1" d="${d}" fill="none" stroke="#ffffff" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

function fixes() {
  let o = "";
  const tf = onFloor(TERRACE);
  // terrace: a membrane over the whole terrace, turned up the parapets; the water runs to the outlet
  o += `<clipPath id="mh-terrace-clip"><path d="${poly([tf(572, 0), tf(1228, 0), tf(1228, 1), tf(572, 1)])}"/></clipPath>`;
  o += `<g clip-path="url(#mh-terrace-clip)"><path class="fx fx-terrace fx-line fx-wipe" pathLength="1" d="M560 ${r1((TERRACE_FLOOR.front + TERRACE_FLOOR.back) / 2)}H1240" stroke="#d6e9ee" stroke-width="44"/></g>`;
  o += seal("terrace", `M572 206V${H.terrace}H1228V206`);
  // bathroom: the sunken slab coated, up the walls, full height in the shower; pond-tested
  o += seal("bathroom", `M${H.ffWall[1]} 434V${H.sunkTop}H${H.xEi}V300`, 2.6);
  const bf = onFloor(BATH);
  const br = onRight(BATH);
  const bb = onBack(BATH);
  o += path(poly([bf(BATH.x0, 0), bf(BATH.x1, 0), bf(BATH.x1, 1), bf(BATH.x0, 1)]), "#e6dfd1", `class="fx fx-bathroom fx-tint" fill-opacity=".34"`);
  o += path(quad(bb, BATH.x0, 434, BATH.x1, 454), "#e6dfd1", `class="fx fx-bathroom fx-tint" fill-opacity=".3"`);
  o += path(quad(br, 0.3, 300, 0.82, 454), "#e6dfd1", `class="fx fx-bathroom fx-tint" fill-opacity=".26"`);
  o += `<circle class="fx fx-bathroom fx-tint" cx="1120" cy="464.5" r="5" fill="none" stroke="#ffffff" stroke-width="1.6"/>`;
  // walls: crack filled, then an elastomeric coat over the whole west face
  o += seal("walls", `M${H.xW - 1.5} ${H.coping + 6}V${H.ground}`, 2.6);
  o += `<path class="fx fx-walls fx-tint" d="M561 532l4 3-2 4 6 2M561 596l3-2 3 4 4-1M561 640l5 2-1 4 5 1" fill="none" stroke="#ffffff" stroke-width="1.4"/>`;
  // sump: a crystalline coat on every inside face, the pipe sealed with a flange
  const s = H.sump;
  o += seal("sump", `M${s.xi0 + 1.5} ${s.yi0}V${s.yi1 - 1.5}H${s.xi1 - 1.5}V${s.yi0}`, 2.6);
  const sp = SUMP;
  o += path(poly([pj(sp.eye, sp.x0, sp.y0, 1), pj(sp.eye, sp.x1, sp.y0, 1), pj(sp.eye, sp.x1, sp.y1, 1), pj(sp.eye, sp.x0, sp.y1, 1)]), "#e6dfd1", `class="fx fx-sump fx-tint" fill-opacity=".2"`);
  o += `<rect class="fx fx-sump fx-tint" x="${s.xi1 - 3}" y="724" width="7" height="14" rx="2" fill="none" stroke="#ffffff" stroke-width="1.6"/>`;
  // crystals growing into the pores of the concrete
  let cr = "";
  const rand = rng(91);
  for (let i = 0; i < 16; i++) {
    const left = i % 2 === 0;
    const x = left ? s.x0 + 2 + rand() * 10 : s.xi1 + 2 + rand() * 10;
    const y = left ? 790 + rand() * 80 : 740 + rand() * 80;
    const r = 1.2 + rand() * 1.2;
    cr += `<path class="fx fx-sump fx-crystal" style="transition-delay:${(1.4 + i * 0.06).toFixed(2)}s" d="M${r1(x)} ${r1(y - r)}l${r1(r * 0.87)} ${r1(r / 2)}v${r1(r)}l${r1(-r * 0.87)} ${r1(r / 2)}l${r1(-r * 0.87)} ${r1(-r / 2)}v${r1(-r)}z" fill="#9eeaf2"/>`;
  }
  o += cr;
  return o;
}

/* ------------------------------------------------------------ hotspots */

/** where each leak shows, in world units: the page puts its buttons there */
export const HOTSPOTS: Record<ZoneKey, Pt> = {
  terrace: pj(EYE_FF, BUCKET.x, H.ffCeil, BUCKET.z),
  bathroom: pj(EYE_GF, KSTAIN.x, H.sunkBot, KSTAIN.z),
  walls: pj(EYE_GF, H.xWi, DAMP.y, DAMP.z),
  sump: [H.sump.xi0 + 8, 846],
};

/** what the camera frames for each step, in world units: [x0, y0, x1, y1] */
export const VIEWS = {
  all: [318, 100, 1290, 905],
  terrace: [560, 118, 1080, 466],
  bathroom: [900, 236, 1268, 684],
  walls: [440, 430, 910, 712],
  sump: [266, 648, 590, 912],
} as const;
/** the same on a phone held upright: narrower, so each leak fills the width */
export const VIEWS_PHONE = {
  all: [300, 96, 1290, 905],
  terrace: [600, 140, 1000, 452],
  bathroom: [990, 330, 1250, 540],
  walls: [470, 452, 800, 700],
  sump: [292, 676, 562, 900],
} as const;

/* ------------------------------------------------------------ the scene */

/** a room's contents, seen only through its own opening in the cut, darker towards the corners */
function inRoom(id: string, rm: Room, body: string, vignette = 0.6) {
  const box = rect(rm.x0, rm.y0, rm.x1 - rm.x0, rm.y1 - rm.y0, "#000");
  return `<clipPath id="mh-c-${id}">${box}</clipPath><g clip-path="url(#mh-c-${id})">${body}${rect(rm.x0, rm.y0, rm.x1 - rm.x0, rm.y1 - rm.y0, "url(#mh-vignette)", `opacity="${vignette}"`)}</g>`;
}

const VIEWBOX = `${VIEWS.all[0]} ${VIEWS.all[1]} ${VIEWS.all[2] - VIEWS.all[0]} ${VIEWS.all[3] - VIEWS.all[1]}`;
const svgOpen = (cls: string) => `<svg class="${cls}" viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">`;
const PALM_A = palm(300, 694, 214, 176, 1, 3);
const PALM_B = palm(1420, 692, 1478, 300, 0.75, 7, "mh-crown--b");

/** the whole drawing, standing still, as an SVG element; the page's camera sets its viewBox */
export function sceneMarkup() {
  const g = (cls: string, body: string) => `<g class="${cls}">${body}</g>`;
  return (
    svgOpen("mh-svg") +
    DEFS +
    g("mh-sky", sky() + neighbours() + streetLight(10)) +
    g("mh-yard", yard() + PALM_A.trunk + PALM_B.trunk) +
    g("mh-ground", cut()) +
    g("mh-rooms", inRoom("sump", SUMP, sumpRoom(), 0.5) + inRoom("bed", BED, bedroom() + bedroomLeak()) + inRoom("bath", BATH, bathroom() + showerSheen()) + inRoom("living", LIVING, livingRoom() + livingLeak()) + inRoom("kitchen", KITCHEN, kitchen() + kitchenLeak()) + terrace() + terraceLeak()) +
    g("mh-cut", structure()) +
    g("mh-leaks", leaks(false)) +
    g("mh-fixes", fixes()) +
    `</svg>`
  );
}

/**
 * Everything in the drawing that moves, in a second SVG laid over the first
 * with the same camera: drops falling, water seeping along its path, the
 * shower, the ground water and the palms in the wind. Kept apart so the big
 * drawing beneath is painted once and not again on every frame.
 */
export function motionMarkup() {
  const s = H.sump;
  const wave = `M-2400 ${H.groundwater}${"q20 -4 40 0t40 0".repeat(80)}`;
  return (
    svgOpen("mh-svg mh-motion") +
    `<defs><clipPath id="mh-gw-clip"><rect x="-2400" y="${H.groundwater - 10}" width="${s.x0 + 2400}" height="20"/><rect x="${s.x1}" y="${H.groundwater - 10}" width="${4000 - s.x1}" height="20"/></clipPath></defs>` +
    `<g clip-path="url(#mh-gw-clip)"><path class="mh-gwline" d="${wave}" fill="none" stroke="#7cc3d2" stroke-opacity=".55" stroke-width="1.4"/></g>` +
    PALM_A.crown +
    PALM_B.crown +
    showerFlow() +
    leaks(true) +
    `<path class="fx fx-terrace fx-flow" d="M1262 694q10 2 14 8" fill="none" stroke="#9fdbe6" stroke-width="2.2"/>` +
    `</svg>`
  );
}
