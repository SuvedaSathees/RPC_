/**
 * Each project drawn the way an architect would sketch it (an elevation, with
 * what is below ground in section), and its waterproofing marked on it: every
 * layer the project lists is drawn in teal where it goes and numbered to match
 * the list beside the drawing. Pointing at a layer in the list (or at its
 * number on the drawing) brings that layer forward.
 *
 * The drawings follow each project's own description (six storeys with
 * balconies and rooftop solar; a G+8 glazed office; a courtyard villa under
 * clay tiles; long-span steel sheds; shops with two blocks over a courtyard).
 * They show the kind of building, not its measured design.
 */
import type { ProjectData } from "./projects";

type Anchor = "roof" | "wet" | "facade" | "plinth" | "below" | "floor" | "podium" | "drain";
interface Layer {
  /** the teal lines (and areas) of this layer */
  d: string;
  /** where its number sits on the drawing */
  at: readonly [number, number];
}
interface Sheet {
  /** what the drawing shows, for a screen reader */
  title: string;
  /** the drawing itself */
  body: string;
  layers: Partial<Record<Anchor, Layer>>;
}

const W = 640;
const GROUND = 330;
/** the part of the drawing shown: the empty sky above the buildings trimmed off */
const VB = { y: 40, h: 400 };

/** where a layer the project lists goes, by its own words */
export function anchorOf(item: string): Anchor {
  const s = item.toLowerCase();
  if (/raft|basement|foundation/.test(s)) return "below";
  if (/dpc|plinth|termite/.test(s)) return "plinth";
  if (/podium/.test(s)) return "podium";
  if (/curtain|fa[çc]ade/.test(s)) return "facade";
  if (/wet area|bathroom/.test(s)) return "wet";
  if (/trimix|floor/.test(s)) return "floor";
  if (/drain/.test(s)) return "drain";
  return "roof";
}

/* ------------------------------------------------------------ pieces */
const r1 = (v: number) => Math.round(v * 10) / 10;
const rect = (cls: string, x: number, y: number, w: number, h: number) => `<rect class="${cls}" x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"/>`;
const path = (cls: string, d: string) => `<path class="${cls}" d="${d}"/>`;
/** a tree: a trunk and a rounded crown */
const tree = (x: number, h: number, r: number) =>
  `<g class="pjd-tree"><path d="M${x} ${GROUND}V${GROUND - h * 0.45}"/><path d="M${x - r} ${GROUND - h + r}a${r} ${r} 0 0 1 ${r} -${r}a${r} ${r} 0 0 1 ${r} ${r}a${r * 0.95} ${r * 0.9} 0 0 1 -${r * 0.35} ${r * 1.15}h-${r * 1.3}a${r * 0.95} ${r * 0.9} 0 0 1 -${r * 0.35} -${r * 1.15}z"/></g>`;
const shrub = (x: number, w: number) => `<path class="pjd-tree" d="M${x} ${GROUND}c0 -${w * 0.55} ${w * 0.2} -${w * 0.7} ${w * 0.5} -${w * 0.7}s${w * 0.5} ${w * 0.15} ${w * 0.5} ${w * 0.7}"/>`;
const ground = (from = 0, to = W) => `<rect x="0" y="${GROUND}" width="${W}" height="${VB.y + VB.h - GROUND}" fill="url(#pjd-earth)"/>${path("pjd-g", `M${from} ${GROUND}H${to}`)}`;
/** a row of windows */
const windows = (xs: readonly number[], y: number, w: number, h: number) => xs.map((x) => rect("pjd-win", x, y, w, h)).join("");

/* ------------------------------------------------------------ the five kinds of building */

/** six storeys of homes: windows and a bathroom's small window on each floor, balconies, solar on the roof, a raft below */
function residential(): Sheet {
  const L = 180;
  const R = 460;
  const fh = 36;
  const floors = 6;
  const top = GROUND - floors * fh;
  let body = "";
  body += rect("pjd-s", L, top, R - L, GROUND - top);
  body += rect("pjd-s", L - 4, top - 12, R - L + 8, 12);
  const vents: string[] = [];
  for (let k = 0; k < floors; k++) {
    const y0 = GROUND - k * fh;
    const y1 = y0 - fh;
    if (k > 0) body += path("pjd-f", `M${L} ${y0}H${R}`);
    body += windows([196, 234], y1 + 9, 26, 17);
    vents.push(rect("pjd-wpf", 274, y1 + 9, 10, 10));
    body += rect("pjd-win", 274, y1 + 9, 10, 10);
    if (k === 0) {
      body += rect("pjd-win", 312, y1 + 4, 34, fh - 4);
      body += path("pjd-fine", `M329 ${y1 + 4}V${y0}`);
      body += windows([368, 406], y1 + 9, 26, 17);
    } else {
      body += rect("pjd-win", 312, y1 + 5, 128, fh - 9);
      body += path("pjd-fine", `M344 ${y1 + 5}V${y0 - 4}M376 ${y1 + 5}V${y0 - 4}M408 ${y1 + 5}V${y0 - 4}`);
      body += rect("pjd-rail", 304, y0 - 13, 144, 13);
      body += path("pjd-fine", Array.from({ length: 13 }, (_, i) => `M${315 + i * 11} ${y0 - 13}V${y0}`).join(""));
    }
  }
  // the stair room and the solar panels on the roof
  body += rect("pjd-s", 196, top - 40, 44, 28);
  body += rect("pjd-win", 206, top - 32, 12, 20);
  body += Array.from({ length: 5 }, (_, i) => {
    const x = 258 + i * 40;
    return `${path("pjd-panel", `M${x} ${top - 14}L${x + 9} ${top - 30}H${x + 38}L${x + 29} ${top - 14}Z`)}${path("pjd-fine", `M${x + 14} ${top - 14}V${top - 22}M${x + 28} ${top - 14}V${top - 22}`)}`;
  }).join("");
  // the landscaped front court
  body += tree(70, 92, 22) + tree(122, 70, 17) + tree(530, 84, 20) + tree(586, 66, 16) + shrub(150, 18) + shrub(490, 16);
  body = ground() + body;
  // the raft, below the ground
  body += rect("pjd-cut", 168, GROUND + 12, 304, 16);
  body += rect("pjd-cut", 186, GROUND, 9, 12) + rect("pjd-cut", 445, GROUND, 9, 12) + rect("pjd-cut", 316, GROUND, 9, 12);
  return {
    title: "An elevation of a six-storey block of homes with balconies and solar panels on the roof, and its raft foundation below the ground",
    body,
    layers: {
      roof: { d: path("pjd-wp", `M${L - 2} ${top}H${R + 2}M${L - 2} ${top}V${top - 11}M${R + 2} ${top}V${top - 11}`), at: [R + 26, top - 6] },
      wet: { d: vents.join(""), at: [292, top - 0 + fh * 0.5 + 6] },
      plinth: { d: path("pjd-wp", `M${L} ${GROUND - 4}H${R}`), at: [L - 22, GROUND - 4] },
      below: { d: path("pjd-wp", `M166 ${GROUND + 30}H474M166 ${GROUND + 30}V${GROUND + 10}M474 ${GROUND + 30}V${GROUND + 10}`), at: [496, GROUND + 26] },
    },
  };
}

/** a G+8 office: a glazed curtain wall on every floor, a plant room on the roof, a basement below */
function office(): Sheet {
  const L = 230;
  const R = 410;
  const fh = 25;
  const floors = 9;
  const top = GROUND - floors * fh;
  let body = ground();
  body += rect("pjd-glass", L, top, R - L, GROUND - top);
  body += rect("pjd-s pjd-hollow", L, top, R - L, GROUND - top);
  body += rect("pjd-s", L - 4, top - 9, R - L + 8, 9);
  body += rect("pjd-s", 318, top - 34, 66, 25);
  body += path("pjd-fine", `M330 ${top - 34}V${top - 9}`);
  // floors and mullions
  for (let k = 1; k < floors; k++) body += path("pjd-f", `M${L} ${GROUND - k * fh}H${R}`);
  body += path("pjd-fine", Array.from({ length: 8 }, (_, i) => `M${L + 20 * (i + 1)} ${top}V${GROUND - fh}`).join(""));
  // the lobby: glass doors under a canopy
  body += rect("pjd-s", 286, GROUND - fh - 4, 68, 4);
  body += path("pjd-fine", `M300 ${GROUND - fh}V${GROUND}M320 ${GROUND - fh}V${GROUND}M340 ${GROUND - fh}V${GROUND}`);
  // the road, a street light and trees
  body += path("pjd-fine", `M440 ${GROUND - 2}H640`);
  body += path("pjd-line", `M492 ${GROUND}V${GROUND - 92}h18`) + rect("pjd-s", 504, GROUND - 94, 12, 4);
  body += tree(110, 86, 21) + tree(166, 66, 16) + shrub(200, 16) + tree(580, 78, 19);
  // the basement, in section
  body += rect("pjd-cut", L - 14, GROUND, R - L + 28, 94);
  body += rect("pjd-void", L - 2, GROUND, R - L + 4, 82);
  body += rect("pjd-cut", 290, GROUND, 8, 82) + rect("pjd-cut", 346, GROUND, 8, 82);
  body += path("pjd-fine", `M${L + 10} ${GROUND + 82}H${R - 10}`);
  const facade = Array.from({ length: 9 }, (_, i) => `M${L + 20 * i} ${top}V${GROUND - fh}`).join("") + `M${R} ${top}V${GROUND - fh}`;
  return {
    title: "An elevation of a nine-storey office building with a glazed curtain wall and a plant room on the roof, and its basement in section",
    body,
    layers: {
      roof: { d: path("pjd-wp", `M${L - 2} ${top}H${R + 2}M${L - 2} ${top}V${top - 8}M${R + 2} ${top}V${top - 8}`), at: [R + 24, top - 4] },
      facade: { d: path("pjd-wp pjd-thin", facade), at: [L - 26, top + 92] },
      below: {
        d: path("pjd-wp", `M${L - 12} ${GROUND + 2}V${GROUND + 92}H${R + 12}V${GROUND + 2}`) + rect("pjd-wpf", L - 15, GROUND + 79, 7, 7) + rect("pjd-wpf", R + 8, GROUND + 79, 7, 7),
        at: [R + 34, GROUND + 48],
      },
    },
  };
}

/** a courtyard house in section: two wings under clay-tiled roofs, the courtyard open to the sky between them, a bathroom in one wing */
function villa(): Sheet {
  const plinth = GROUND - 18;
  const eave = 214;
  const ridge = 146;
  let body = ground();
  // the raised plinth and its footings
  body += rect("pjd-s", 96, plinth, 448, 18);
  body += [104, 236, 384, 516].map((x) => path("pjd-cut", `M${x} ${GROUND}h20l6 26h-32z`)).join("");
  // the two wings: walls, rooms beyond, and the sloped roofs with their tiles
  const wing = (a: number, b: number) => {
    const mid = (a + b) / 2;
    let s = rect("pjd-cut", a, eave - 6, 8, plinth - eave + 6) + rect("pjd-cut", b - 8, eave - 6, 8, plinth - eave + 6);
    s += path("pjd-roof", `M${a - 18} ${eave}L${mid} ${ridge}L${b + 18} ${eave}`);
    const slope = (x0: number, y0: number, x1: number, y1: number) =>
      Array.from({ length: 9 }, (_, i) => {
        const t = (i + 0.5) / 9;
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        return `M${r1(x)} ${r1(y - 3)}l${x1 > x0 ? 4 : -4} 3`;
      }).join("");
    s += path("pjd-tile", slope(a - 18, eave, mid, ridge) + slope(b + 18, eave, mid, ridge));
    return s;
  };
  body += wing(112, 252) + wing(388, 528);
  // beyond: a door in the left wing, the bathroom's tiled wall and small window in the right
  body += rect("pjd-win", 148, plinth - 60, 28, 60) + rect("pjd-win", 194, plinth - 56, 34, 26);
  body += rect("pjd-tilewall", 468, plinth - 52, 48, 52) + rect("pjd-win", 480, eave + 10, 24, 14);
  body += rect("pjd-win", 410, plinth - 60, 28, 60);
  // the courtyard: teak posts under the eaves and a tree open to the sky
  body += path("pjd-line", `M266 ${eave + 4}V${plinth}M374 ${eave + 4}V${plinth}`);
  body += `<g class="pjd-tree"><path d="M320 ${plinth}V${plinth - 52}"/><path d="M296 ${plinth - 58}c0 -22 14 -32 24 -32s24 10 24 32c-7 9 -41 9 -48 0z"/></g>`;
  // the garden in front
  body += tree(54, 104, 24) + shrub(80, 14) + tree(594, 88, 20) + shrub(560, 16);
  return {
    title: "A section through a courtyard house: two wings under clay-tiled sloped roofs, the courtyard open to the sky between them, on a raised plinth",
    body,
    layers: {
      roof: {
        d: path("pjd-wp", `M94 ${eave - 5}L182 ${ridge - 4}L266 ${eave - 5}M374 ${eave - 5}L458 ${ridge - 4}L546 ${eave - 5}`),
        at: [182, ridge - 26],
      },
      wet: { d: path("pjd-wp", `M466 ${plinth - 1}H518V${plinth - 54}`) + rect("pjd-wpf pjd-soft", 468, plinth - 52, 48, 51), at: [492, plinth - 70] },
      plinth: { d: path("pjd-wp", `M96 ${plinth}H544`) + path("pjd-wp pjd-dash", `M96 ${GROUND + 6}H544`), at: [76, plinth + 6] },
    },
  };
}

/** a long-span steel shed and its lower store beside it, solar on the roof, gutters and drains, a trimix floor */
function industrial(): Sheet {
  const L = 92;
  const R = 448;
  const eave = 196;
  const ridge = 146;
  const mid = (L + R) / 2;
  let body = ground();
  // the gable: portal frame, cladding, a rolling shutter and a louvre
  body += path("pjd-s", `M${L} ${GROUND}V${eave}L${mid} ${ridge}L${R} ${eave}V${GROUND}Z`);
  body += path("pjd-fine", Array.from({ length: 29 }, (_, i) => {
    const x = L + 12 * (i + 1);
    const yTop = x <= mid ? eave - ((x - L) / (mid - L)) * (eave - ridge) : ridge + ((x - mid) / (R - mid)) * (eave - ridge);
    return `M${x} ${r1(yTop + 2)}V${GROUND - 8}`;
  }).join(""));
  body += rect("pjd-s", 216, 232, 108, GROUND - 232);
  body += path("pjd-fine", Array.from({ length: 11 }, (_, i) => `M218 ${240 + i * 8}H322`).join(""));
  body += rect("pjd-win", mid - 22, ridge + 12, 44, 12);
  // the store beside it, under a single slope
  body += path("pjd-s", `M${R} ${GROUND}V218L586 236V${GROUND}`);
  body += rect("pjd-win", 486, 258, 64, 26);
  // RCC pedestals under the columns
  body += rect("pjd-cut", L - 6, GROUND - 12, 12, 12) + rect("pjd-cut", R - 6, GROUND - 12, 12, 12);
  // solar panels along both slopes
  const panels = (x0: number, y0: number, x1: number, y1: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const t0 = 0.08 + i * 0.18;
      const t1 = t0 + 0.15;
      const ax = x0 + (x1 - x0) * t0;
      const ay = y0 + (y1 - y0) * t0;
      const bx = x0 + (x1 - x0) * t1;
      const by = y0 + (y1 - y0) * t1;
      return path("pjd-panel", `M${r1(ax)} ${r1(ay - 3)}L${r1(bx)} ${r1(by - 3)}L${r1(bx)} ${r1(by - 9)}L${r1(ax)} ${r1(ay - 9)}Z`);
    }).join("");
  body += panels(L, eave, mid, ridge) + panels(R, eave, mid, ridge);
  // the precast compound wall
  body += path("pjd-line", `M8 ${GROUND}V${GROUND - 40}M40 ${GROUND}V${GROUND - 40}`) + path("pjd-fine", `M8 ${GROUND - 14}H40M8 ${GROUND - 28}H40`);
  body += tree(614, 78, 17);
  return {
    title: "The gable end of a long-span steel shed with solar panels on its roof, and a lower store beside it",
    body,
    layers: {
      floor: { d: path("pjd-wp", `M${L + 6} ${GROUND - 3}H${R - 6}`), at: [158, GROUND - 22] },
      roof: {
        d: path("pjd-wp", `M${L - 6} ${eave + 2}L${mid} ${ridge - 1}L${R + 6} ${eave + 2}`) + path("pjd-wp pjd-thin", [0.2, 0.4, 0.6, 0.8].map((t) => `M${r1(L + (mid - L) * t)} ${r1(eave - (eave - ridge) * t - 6)}v10M${r1(R - (R - mid) * t)} ${r1(eave - (eave - ridge) * t - 6)}v10`).join("")),
        at: [mid, ridge - 26],
      },
      drain: { d: path("pjd-wp", `M${L - 8} ${eave + 2}V${GROUND - 2}M${R + 8} ${eave + 14}V${GROUND - 2}M${L - 30} ${GROUND + 3}H${L + 2}M${R - 2} ${GROUND + 3}H${R + 30}`), at: [62, eave + 40] },
    },
  };
}

/** shops at street level, two blocks above them around a shaded courtyard on the podium, and a basement below */
function mixedUse(): Sheet {
  const L = 110;
  const R = 530;
  const pod = GROUND - 40;
  const slab = pod - 8;
  const lb = [L, 270] as const;
  const rb = [370, R] as const;
  const fh = 34;
  const lTop = slab - 4 * fh;
  const rTop = slab - 5 * fh;
  let body = ground();
  // the shops, under awnings, and the transfer slab over them
  body += rect("pjd-s", L, pod, R - L, GROUND - pod);
  body += path("pjd-fine", Array.from({ length: 13 }, (_, i) => `M${L + 30 * (i + 1)} ${pod + 8}V${GROUND}`).join(""));
  body += rect("pjd-cut", L - 4, slab, R - L + 8, 8);
  // the office block (left) and the homes (right), with jaali screens
  body += rect("pjd-s", lb[0], lTop, lb[1] - lb[0], slab - lTop);
  body += rect("pjd-s", rb[0], rTop, rb[1] - rb[0], slab - rTop);
  for (let k = 1; k < 4; k++) body += path("pjd-f", `M${lb[0]} ${slab - k * fh}H${lb[1]}`);
  for (let k = 1; k < 5; k++) body += path("pjd-f", `M${rb[0]} ${slab - k * fh}H${rb[1]}`);
  for (let k = 0; k < 4; k++) body += windows([124, 158], slab - (k + 1) * fh + 8, 24, 18) + rect("pjd-jaali", 196, slab - (k + 1) * fh + 5, 64, 25);
  for (let k = 0; k < 5; k++) body += rect("pjd-jaali", 382, slab - (k + 1) * fh + 5, 52, 25) + windows([448, 486], slab - (k + 1) * fh + 8, 26, 18);
  // the courtyard: louvres overhead for shade, a tree and benches on the podium
  body += path("pjd-fine", Array.from({ length: 6 }, (_, i) => `M${lb[1]} ${lTop + 10 + i * 6}H${rb[0]}`).join(""));
  body += `<g class="pjd-tree"><path d="M320 ${slab}V${slab - 44}"/><path d="M296 ${slab - 50}c0 -22 14 -30 24 -30s24 8 24 30c-8 9 -40 9 -48 0z"/></g>`;
  body += path("pjd-line", `M282 ${slab}v-8h18v8M340 ${slab}v-8h18v8`);
  body += tree(62, 80, 19) + tree(584, 72, 17);
  // the basement, in section
  body += rect("pjd-cut", L - 8, GROUND, R - L + 16, 84);
  body += rect("pjd-void", L + 4, GROUND, R - L - 8, 72);
  body += [200, 310, 420].map((x) => rect("pjd-cut", x, GROUND, 8, 72)).join("");
  return {
    title: "A section through shops at street level with an office block and a block of homes above them around a shaded courtyard, and a basement below",
    body,
    layers: {
      below: { d: path("pjd-wp", `M${L - 6} ${GROUND + 2}V${GROUND + 82}H${R + 6}V${GROUND + 2}`), at: [R + 30, GROUND + 44] },
      podium: { d: path("pjd-wp", `M${lb[1]} ${slab - 1}H${rb[0]}M${lb[0]} ${lTop}H${lb[1]}M${rb[0]} ${rTop}H${rb[1]}`), at: [320, lTop - 22] },
      facade: { d: path("pjd-wp pjd-thin", `M${lb[0]} ${slab}V${lTop}M${lb[1]} ${slab}V${lTop}M${rb[0]} ${slab}V${rTop}M${rb[1]} ${slab}V${rTop}`), at: [R + 26, rTop + 60] },
    },
  };
}

const BY_TYPE: Record<string, () => Sheet> = { Residential: residential, Commercial: office, Villa: villa, Industrial: industrial, "Mixed-use": mixedUse };

/** the patterns every drawing shares, once on the page */
export const PROJECT_DRAWING_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<pattern id="pjd-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#e6ddcc"/><line x1="0" y1="0" x2="0" y2="6" stroke="#12223b" stroke-opacity=".24" stroke-width="1"/></pattern>
<pattern id="pjd-earth" width="16" height="12" patternUnits="userSpaceOnUse"><rect width="16" height="12" fill="#e9e0cf"/><circle cx="3" cy="3" r="1" fill="#12223b" fill-opacity=".14"/><circle cx="11" cy="9" r=".85" fill="#12223b" fill-opacity=".1"/></pattern>
<pattern id="pjd-jaali-p" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#e8d7c4"/><path d="M4 .8 7.2 4 4 7.2 .8 4Z" fill="none" stroke="#a0522d" stroke-opacity=".55" stroke-width=".8"/></pattern>
<pattern id="pjd-tiles-p" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#eee8dc"/><path d="M0 .5H7M.5 0V7" stroke="#12223b" stroke-opacity=".18" stroke-width=".8"/></pattern>
<linearGradient id="pjd-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1eadc" stop-opacity="0"/><stop offset="1" stop-color="#f1eadc"/></linearGradient>
</defs></svg>`;

/**
 * A project's drawing with its waterproofing on it. `items` are the layers the
 * project lists, in the list's order; each gets its number on the drawing.
 */
export function projectSheet(p: ProjectData, items: readonly string[]) {
  const make = BY_TYPE[p.type] ?? residential;
  const s = make();
  const used = new Set<Anchor>();
  const layers: string[] = [];
  const marks: string[] = [];
  items.forEach((item, k) => {
    const a = anchorOf(item);
    const l = s.layers[a];
    if (!l || used.has(a)) return;
    used.add(a);
    layers.push(`<g class="pjd-l" data-k="${k}">${l.d}</g>`);
    marks.push(`<span class="pj-mk" data-k="${k}" style="left:${((l.at[0] / W) * 100).toFixed(2)}%;top:${(((l.at[1] - VB.y) / VB.h) * 100).toFixed(2)}%">${k + 1}</span>`);
  });
  return `<div class="pj-sheet"><svg class="pjd" viewBox="0 ${VB.y} ${W} ${VB.h}" role="img" aria-label="${s.title.replace(/"/g, "&quot;")}">${s.body}<rect x="0" y="${VB.y + VB.h - 34}" width="${W}" height="34" fill="url(#pjd-fade)"/>${layers.join("")}</svg><div class="pj-marks" aria-hidden="true">${marks.join("")}</div></div>`;
}

/** layers brought forward when their line in the list, or their number, is pointed at */
const pointRules = (sel: (k: number) => string) => Array.from({ length: 6 }, (_, k) => sel(k)).join(",");

export const PROJECT_SHEET_CSS = `
.pj-sheet{position:relative;overflow:hidden;border-radius:14px;background:#f1eadc;background-image:linear-gradient(rgba(18,34,59,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(18,34,59,.045) 1px,transparent 1px);background-size:24px 24px;box-shadow:inset 0 0 0 1px rgba(18,34,59,.08)}
.pjd{display:block;width:100%;height:auto}
.pjd-g{fill:none;stroke:#12223b;stroke-width:1.4}
.pjd-s{fill:#f8f4ec;stroke:#12223b;stroke-width:1.3;stroke-linejoin:round}
.pjd-s.pjd-hollow{fill:none}
.pjd-glass{fill:#dfe6ec}
.pjd-f{fill:none;stroke:#12223b;stroke-opacity:.55;stroke-width:1}
.pjd-fine{fill:none;stroke:#12223b;stroke-opacity:.32;stroke-width:1}
.pjd-line{fill:none;stroke:#12223b;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}
.pjd-win{fill:#e4e7e6;stroke:#12223b;stroke-opacity:.6;stroke-width:1}
.pjd-rail{fill:none;stroke:#12223b;stroke-opacity:.55;stroke-width:1}
.pjd-panel{fill:#2c3e57;stroke:#12223b;stroke-width:.8}
.pjd-cut{fill:url(#pjd-hatch);stroke:#12223b;stroke-width:1.1;stroke-linejoin:round}
.pjd-void{fill:#f1eadc}
.pjd-roof{fill:none;stroke:#8e4a2a;stroke-width:6;stroke-linejoin:round;stroke-linecap:round}
.pjd-tile{fill:none;stroke:#f1eadc;stroke-width:1.3;stroke-linecap:round}
.pjd-tilewall{fill:url(#pjd-tiles-p);stroke:#12223b;stroke-opacity:.5;stroke-width:1}
.pjd-jaali{fill:url(#pjd-jaali-p);stroke:#a0522d;stroke-opacity:.5;stroke-width:.8}
.pjd-tree,.pjd-tree path{fill:none;stroke:#3d6b3f;stroke-opacity:.7;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}
/* the waterproofing, in teal; one layer brought forward fades the others */
.pjd-wp{fill:none;stroke:#0b6e80;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;transition:stroke-width .25s,opacity .25s}
.pjd-wp.pjd-thin{stroke-width:1.7}
.pjd-wp.pjd-dash{stroke-dasharray:2 6;stroke-width:3}
.pjd-wpf{fill:#0b6e80;transition:opacity .25s}
.pjd-wpf.pjd-soft{fill-opacity:.22}
.pjd-l{transition:opacity .25s}
@media (max-width:767px){.pj-mk{width:1.5rem;height:1.5rem;margin:-.75rem 0 0 -.75rem;box-shadow:0 0 0 2px #f1eadc}}
.pj-marks{position:absolute;inset:0;pointer-events:none}
.pj-mk{position:absolute;display:grid;place-items:center;width:1.8rem;height:1.8rem;margin:-.9rem 0 0 -.9rem;border-radius:50%;background:var(--navy);box-shadow:0 0 0 3px #f1eadc;font-size:var(--fs-body);font-weight:600;line-height:1;color:#f5f0e6;pointer-events:auto;transition:background-color .25s,transform .25s}
/* pointing at a layer's line in the list, or at its number */
${pointRules((k) => `.pj-pt:has([data-k="${k}"]:is(:hover,:focus-visible)) .pjd-l:not([data-k="${k}"])`)}{opacity:.18}
${pointRules((k) => `.pj-pt:has([data-k="${k}"]:is(:hover,:focus-visible)) .pjd-l[data-k="${k}"] .pjd-wp`)}{stroke-width:6}
${pointRules((k) => `.pj-pt:has([data-k="${k}"]:is(:hover,:focus-visible)) .pj-mk[data-k="${k}"]`)}{background:#0b6e80;transform:scale(1.12)}
${pointRules((k) => `.pj-pt:has([data-k="${k}"]:is(:hover,:focus-visible)) .pj-wpl li[data-k="${k}"]`)}{background:rgba(11,110,128,.1)}
`;
