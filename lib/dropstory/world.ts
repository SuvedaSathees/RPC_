/**
 * The drop story — one building drawn as an architectural section.
 *
 * World units are roughly centimetres: the building is 8 m wide, the ground
 * line sits at y = 800 and y grows downwards. Everything that moves is given
 * an id (prefix "ds-") and driven by ./engine.ts. Waterproofing layers are
 * drawn thicker than life so they read on screen.
 */

export const C = {
  sky: "#eeede8",
  room: "#fafaf7",
  basement: "#e6e4de",
  ink: "#202428",
  conc: "#d5d0c6",
  concMark: "#a19a8e",
  brick: "#e3ded5",
  brickLine: "#c4bdb1",
  soil: "#1b1814",
  water: "#47c4e6",
  rpc: "#3b6fd8",
  rpc2: "#7aa0ee",
  primer: "#b9a77a",
  topcoat: "#dbe6fb",
  screed: "#c9c3b7",
  tile: "#f7f7f4",
  board: "#7d8389",
  palm: "#dedcd5",
} as const;

/** Key levels and positions (world units). */
export const G = {
  ground: 800,
  x0: 300,
  x1: 1100,
  wall: 24,
  parapetTop: 72,
  roofTop: 120,
  roofBot: 146,
  ffTop: 440,
  ffBot: 466,
  gfTop: 760,
  gfBot: 786,
  raftTop: 1110,
  raftBot: 1150,
  partition: 836,
  // sump (underground tank), left of the building
  sx0: 60,
  sx1: 260,
  sTop: 788,
  sTopBot: 812,
  sBase: 1030,
  sBaseBot: 1056,
  sWater: 880,
  // the drop
  dropX: 905,
  roofSurface: 112,
  pipeX: 1112,
} as const;

/** Points the copy overlays and pins point at. */
export const ANCHORS = {
  roof: [640, 112],
  bath: [1010, 434],
  basement: [1103, 1010],
  sump: [248, 960],
} as const;

const r = (n: number) => Math.round(n * 100) / 100;

function rect(x: number, y: number, w: number, h: number, fill: string, extra = "") {
  return `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" fill="${fill}" ${extra}/>`;
}
/** concrete in section: hatch fill + outline */
const conc = (x: number, y: number, w: number, h: number) =>
  rect(x, y, w, h, "url(#ds-conc)", 'class="ds-o"');
/** masonry in section */
const brick = (x: number, y: number, w: number, h: number) =>
  rect(x, y, w, h, "url(#ds-brick)", 'class="ds-o"');

/** a window seen in section: opening + three glazing lines */
function windowCut(x: number, y0: number, y1: number) {
  const w = G.wall;
  return [
    rect(x, y0, w, y1 - y0, C.room),
    `<line class="ds-l" x1="${x}" y1="${y0}" x2="${x + w}" y2="${y0}"/>`,
    `<line class="ds-l" x1="${x}" y1="${y1}" x2="${x + w}" y2="${y1}"/>`,
    `<line class="ds-t" x1="${x + w / 2 - 3}" y1="${y0}" x2="${x + w / 2 - 3}" y2="${y1}"/>`,
    `<line class="ds-t" x1="${x + w / 2}" y1="${y0}" x2="${x + w / 2}" y2="${y1}"/>`,
    `<line class="ds-t" x1="${x + w / 2 + 3}" y1="${y0}" x2="${x + w / 2 + 3}" y2="${y1}"/>`,
  ].join("");
}

function palm(x: number, h: number, lean: number) {
  const cx = x + lean;
  const cy = G.ground - h;
  const trunk = `<path fill="${C.palm}" d="M${x - 8},${G.ground} Q${x - 6 + lean * 0.15},${G.ground - h * 0.55} ${cx - 3},${cy} L${cx + 3},${cy} Q${x + 6 + lean * 0.15},${G.ground - h * 0.55} ${x + 8},${G.ground} Z"/>`;
  const angles = [-172, -146, -122, -98, -74, -50, -24, 2];
  const fronds = angles
    .map((a, i) => {
      const L = 120 + (i % 3) * 18;
      const rad = (a * Math.PI) / 180;
      const droop = Math.abs(Math.cos(rad)) * 46;
      const ex = cx + Math.cos(rad) * L;
      const ey = cy + Math.sin(rad) * L * 0.55 + droop;
      const mx = cx + Math.cos(rad) * L * 0.55;
      const my = cy + Math.sin(rad) * L * 0.55 - 18;
      return `<path fill="${C.palm}" d="M${r(cx)},${r(cy)} Q${r(mx)},${r(my - 6)} ${r(ex)},${r(ey)} Q${r(mx + 3)},${r(my + 10)} ${r(cx)},${r(cy + 6)} Z"/>`;
    })
    .join("");
  return trunk + fronds;
}

/** pseudo-random but stable */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function soilPattern() {
  const rand = rng(7);
  let specks = "";
  for (let i = 0; i < 26; i++) {
    const x = rand() * 64;
    const y = rand() * 64;
    const big = rand() > 0.8;
    specks += `<circle cx="${r(x)}" cy="${r(y)}" r="${big ? 1.6 : 0.7}" fill="${big ? "#2c2721" : "#3a332a"}"/>`;
  }
  return `<pattern id="ds-soil" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="${C.soil}"/>${specks}</pattern>`;
}

function gravelPattern() {
  const rand = rng(3);
  let g = "";
  for (let i = 0; i < 9; i++) {
    g += `<circle cx="${r(rand() * 16)}" cy="${r(rand() * 16)}" r="${r(1.6 + rand() * 1.6)}" fill="#3a342c" stroke="#5a5246" stroke-width=".5"/>`;
  }
  return `<pattern id="ds-gravel" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#26221d"/>${g}</pattern>`;
}

/** one long gentle wave, used for the water table and the tank */
function wavePath(x0: number, x1: number, amp: number, len: number, depth: number) {
  let d = `M${x0},${depth} L${x0},0`;
  for (let x = x0; x < x1; x += len) {
    d += ` Q${x + len / 4},${-amp} ${x + len / 2},0 T${x + len},0`;
  }
  d += ` L${x1},${depth} Z`;
  return d;
}

/** the concrete wall of the sump, seen under a microscope */
function microWall() {
  const rand = rng(11);
  const x0 = 236;
  const x1 = 260;
  const y0 = 896;
  const y1 = 1064;
  let s = rect(x0, y0, x1 - x0, y1 - y0, "#d9d4ca");
  // aggregate
  for (let i = 0; i < 56; i++) {
    const cx = x0 + 1 + rand() * (x1 - x0 - 2);
    const cy = y0 + 2 + rand() * (y1 - y0 - 4);
    const rad = 0.7 + rand() * 2.2;
    let pts = "";
    const n = 6 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const rr = rad * (0.7 + rand() * 0.45);
      pts += `${r(cx + Math.cos(a) * rr)},${r(cy + Math.sin(a) * rr * 0.8)} `;
    }
    s += `<polygon points="${pts}" fill="${rand() > 0.5 ? "#bdb5a8" : "#c9c2b6"}" stroke="#a69e91" stroke-width=".12"/>`;
  }
  for (let i = 0; i < 190; i++) {
    s += `<circle cx="${r(x0 + rand() * (x1 - x0))}" cy="${r(y0 + rand() * (y1 - y0))}" r=".16" fill="#9a9285"/>`;
  }
  return s;
}

/** capillary pores that cross the wall from the soil side (x=260) inwards */
export const PORES: string[] = [
  "M260,957 C256,956 254,960 251,959 C248,958 247,955 244,956 C241,957 240,960 237,959",
  "M260,969 C257,971 255,967 252,968 C249,969 248,973 245,972 C242,971 240,968 237,969",
  "M260,982 C257,980 255,984 252,983 C249,982 248,979 245,980 C242,981 240,984 237,983",
  "M260,995 C257,997 255,993 252,994 C249,995 248,999 245,998 C242,997 240,994 237,995",
];

export function worldMarkup(): string {
  const { x0, x1, wall } = G;
  const xi0 = x0 + wall; // inner faces
  const xi1 = x1 - wall;

  const defs = `
<defs>
  <pattern id="ds-conc" width="18" height="18" patternUnits="userSpaceOnUse">
    <rect width="18" height="18" fill="${C.conc}"/>
    <circle cx="3" cy="4" r=".7" fill="${C.concMark}"/><circle cx="11" cy="2.6" r=".45" fill="${C.concMark}"/>
    <circle cx="15.5" cy="8" r=".6" fill="${C.concMark}"/><circle cx="6.5" cy="10" r=".4" fill="${C.concMark}"/>
    <circle cx="2" cy="15.5" r=".55" fill="${C.concMark}"/><circle cx="9" cy="16" r=".35" fill="${C.concMark}"/>
    <path d="M12 11 l2.2 3.4 h-4.4z" fill="none" stroke="${C.concMark}" stroke-width=".45"/>
    <path d="M4 5.5 l1.4 2.2 h-2.8z" fill="none" stroke="${C.concMark}" stroke-width=".4"/>
  </pattern>
  <pattern id="ds-brick" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="7" height="7" fill="${C.brick}"/><line x1="0" y1="0" x2="0" y2="7" stroke="${C.brickLine}" stroke-width=".7"/>
  </pattern>
  <pattern id="ds-screed" width="9" height="9" patternUnits="userSpaceOnUse">
    <rect width="9" height="9" fill="${C.screed}"/><circle cx="2" cy="3" r=".35" fill="#a8a194"/><circle cx="6.5" cy="7" r=".3" fill="#a8a194"/>
  </pattern>
  ${soilPattern()}
  ${gravelPattern()}
  <linearGradient id="ds-gw" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.water}" stop-opacity=".34"/>
    <stop offset=".35" stop-color="${C.water}" stop-opacity=".2"/>
    <stop offset="1" stop-color="${C.water}" stop-opacity=".12"/>
  </linearGradient>
  <radialGradient id="ds-glow"><stop offset="0" stop-color="${C.water}" stop-opacity=".55"/><stop offset="1" stop-color="${C.water}" stop-opacity="0"/></radialGradient>
  <radialGradient id="ds-spray"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".35" stop-color="${C.rpc2}" stop-opacity=".6"/><stop offset="1" stop-color="${C.rpc}" stop-opacity="0"/></radialGradient>
  <radialGradient id="ds-wet"><stop offset="0" stop-color="#0d2a40" stop-opacity=".75"/><stop offset=".7" stop-color="#0d2a40" stop-opacity=".35"/><stop offset="1" stop-color="#0d2a40" stop-opacity="0"/></radialGradient>
  <clipPath id="ds-tank"><rect x="${G.sx0 + wall}" y="${G.sTopBot}" width="${G.sx1 - G.sx0 - wall * 2}" height="${G.sBase - G.sTopBot}"/></clipPath>
  <clipPath id="ds-under"><rect x="-4000" y="${G.ground}" width="9000" height="4000"/></clipPath>
  <clipPath id="ds-microclip"><rect x="236" y="896" width="24" height="168"/></clipPath>
  <mask id="ds-hdpe-mask" maskUnits="userSpaceOnUse" x="-100" y="700" width="1400" height="600">
    <path id="ds-hdpe-mpath" d="M1104.5,800 V1155 H295.5 V800" fill="none" stroke="#fff" stroke-width="16"/>
  </mask>
</defs>
<style>
  .ds-o{stroke:${C.ink};stroke-width:1.1;vector-effect:non-scaling-stroke}
  .ds-l{stroke:${C.ink};stroke-width:1.1;vector-effect:non-scaling-stroke;fill:none}
  .ds-t{stroke:${C.ink};stroke-width:.7;vector-effect:non-scaling-stroke;fill:none;opacity:.7}
  .ds-f{stroke:${C.ink};stroke-width:1;vector-effect:non-scaling-stroke;fill:${C.room};stroke-linejoin:round;stroke-linecap:round}
  .ds-fn{stroke:${C.ink};stroke-width:1;vector-effect:non-scaling-stroke;fill:none;stroke-linejoin:round;stroke-linecap:round}
  .ds-ghost{font-family:var(--font-inter-tight),ui-sans-serif,system-ui,sans-serif;font-weight:800;letter-spacing:-.045em}
</style>`;

  // ── backdrop ────────────────────────────────────────────────
  const sky = rect(-4000, -4000, 9000, 4000 + G.ground, C.sky);
  const palms = palm(1290, 470, 34) + palm(1395, 380, -22);
  const ghostSky = `<text class="ds-ghost" x="560" y="118" font-size="150" fill="${C.ink}" fill-opacity=".055">Terrace</text>`;
  const soil = rect(-4000, G.ground, 9000, 4000, "url(#ds-soil)");
  const ghostSoil =
    `<text class="ds-ghost" x="1128" y="1232" font-size="132" fill="#fff" fill-opacity=".06">Basement</text>` +
    `<text class="ds-ghost" x="-470" y="1162" font-size="132" fill="#fff" fill-opacity=".06">Sump</text>`;

  // groundwater: a translucent body whose top is moved by the engine
  const water = `<g clip-path="url(#ds-under)"><g id="ds-wt" transform="translate(0,1500)">
    <g id="ds-wt-wave"><path d="${wavePath(-4000, 5000, 2.2, 64, 3000)}" fill="url(#ds-gw)"/></g>
    <line x1="-4000" y1="0" x2="5000" y2="0" stroke="${C.water}" stroke-opacity=".7" stroke-width="1" vector-effect="non-scaling-stroke" stroke-dasharray="6 5"/>
  </g></g>`;

  // ── sump (underground tank) ─────────────────────────────────
  const sw = wall;
  const sump = [
    rect(G.sx0 + sw, G.sTopBot, G.sx1 - G.sx0 - sw * 2, G.sBase - G.sTopBot, "#2a3238"),
    `<g clip-path="url(#ds-tank)"><g id="ds-tank-wave" transform="translate(0,${G.sWater})"><path d="${wavePath(-200, 600, 1.6, 40, 400)}" fill="${C.water}" fill-opacity=".62"/></g></g>`,
    conc(G.sx0, G.sTop, sw, G.sBase - G.sTop),
    conc(G.sx1 - sw, G.sTop, sw, G.sBase - G.sTop),
    conc(G.sx0, G.sBase, G.sx1 - G.sx0, G.sBaseBot - G.sBase),
    conc(G.sx0, G.sTop, G.sx1 - G.sx0, G.sTopBot - G.sTop),
    // manhole + vent
    rect(122, G.sTop - 7, 56, 7, "#9aa0a5", 'class="ds-o"'),
    rect(132, G.sTop, 36, G.sTopBot - G.sTop, "#2a3238"),
    `<path class="ds-fn" d="M226,${G.sTop} V${G.sTop - 46} h12"/>`,
    // crystalline treatment shows as a blue tint on the sump walls once applied
    `<g id="ds-sump-tint" opacity="0">${rect(G.sx0, G.sTop, sw, G.sBase - G.sTop, C.rpc, 'fill-opacity=".35"')}${rect(G.sx1 - sw, G.sTop, sw, G.sBase - G.sTop, C.rpc, 'fill-opacity=".35"')}${rect(G.sx0, G.sBase, G.sx1 - G.sx0, G.sBaseBot - G.sBase, C.rpc, 'fill-opacity=".35"')}</g>`,
  ].join("");

  // ── building ────────────────────────────────────────────────
  const rooms = [
    rect(xi0, G.roofBot, xi1 - xi0, G.ffTop - G.roofBot, C.room),
    rect(xi0, G.ffBot, xi1 - xi0, G.gfTop - G.ffBot, C.room),
    rect(xi0, G.gfBot, xi1 - xi0, G.raftTop - G.gfBot, C.basement),
  ].join("");

  const structure = [
    // basement + raft
    conc(x0, G.raftTop, x1 - x0, G.raftBot - G.raftTop),
    conc(x0, G.gfBot, wall, G.raftTop - G.gfBot),
    conc(xi1, G.gfBot, wall, G.raftTop - G.gfBot),
    // slabs
    conc(x0, G.gfTop, x1 - x0, G.gfBot - G.gfTop),
    conc(x0, G.ffTop, x1 - x0, G.ffBot - G.ffTop),
    conc(x0, G.roofTop, x1 - x0, G.roofBot - G.roofTop),
    // ground floor walls
    brick(x0, G.ffBot, wall, G.gfTop - G.ffBot),
    brick(xi1, G.ffBot, wall, G.gfTop - G.ffBot),
    windowCut(x0, 540, 690),
    windowCut(xi1, 540, 690),
    // first floor walls
    brick(x0, G.roofBot, wall, G.ffTop - G.roofBot),
    brick(xi1, G.roofBot, wall, G.ffTop - G.roofBot),
    windowCut(x0, 230, 370),
    windowCut(xi1, 168, 204),
    // bathroom partition (door below)
    brick(G.partition, G.roofBot, 12, G.ffTop - G.roofBot),
    // parapets + coping
    brick(x0, G.parapetTop, wall, G.roofTop - G.parapetTop),
    brick(xi1, G.parapetTop, wall, G.roofTop - G.parapetTop),
    conc(x0 - 4, G.parapetTop - 6, wall + 8, 6),
    conc(xi1 - 4, G.parapetTop - 6, wall + 8, 6),
  ].join("");

  // furniture, drawn thin
  const furniture = [
    // first floor: sofa, lamp, picture
    `<path class="ds-f" d="M424,440 V398 H446 V372 Q446,366 452,366 H592 Q598,366 598,372 V398 H620 V440"/>`,
    `<path class="ds-fn" d="M446,408 H598 M446,398 V440 M598,398 V440"/>`,
    `<path class="ds-fn" d="M690,440 V334 M676,440 H704 M674,334 L680,312 H700 L706,334 Z"/>`,
    `<rect class="ds-f" x="500" y="236" width="76" height="54"/>`,
    `<path class="ds-fn" d="M506,282 L524,262 L536,274 L548,256 L570,282"/>`,
    // ground floor: dining table, chairs, pendant
    `<path class="ds-fn" d="M560,690 H780 M572,690 V760 M768,690 V760"/>`,
    `<path class="ds-fn" d="M526,760 V712 H556 V760 M526,712 V650"/>`,
    `<path class="ds-fn" d="M814,760 V712 H784 V760 M814,712 V650"/>`,
    `<path class="ds-fn" d="M670,466 V598 M650,616 L660,598 H680 L690,616 Z"/>`,
    // basement: a parked car
    `<path class="ds-f" d="M452,1092 L456,1062 Q470,1052 522,1048 L592,1004 Q612,994 642,994 L742,994 Q772,996 792,1010 L832,1044 Q862,1050 866,1064 L870,1092 Z"/>`,
    `<path class="ds-fn" d="M548,1046 L604,1012 H684 V1046 Z M698,1012 H748 Q768,1014 786,1046 H698 Z"/>`,
    `<circle class="ds-f" cx="540" cy="1092" r="18"/><circle class="ds-fn" cx="540" cy="1092" r="7"/>`,
    `<circle class="ds-f" cx="790" cy="1092" r="18"/><circle class="ds-fn" cx="790" cy="1092" r="7"/>`,
  ].join("");

  // ── 01 terrace: primer, PU membrane, UV topcoat (dash-revealed paths) ──
  const roofLayers = [
    `<path id="ds-primer" d="M${xi0},119.25 H${xi1}" stroke="${C.primer}" stroke-width="1.5" fill="none"/>`,
    `<path id="ds-pu" d="M326.5,84 V116 H1073.5 V84" stroke="${C.rpc}" stroke-width="5" fill="none" stroke-linejoin="miter"/>`,
    `<path id="ds-top" d="M329.75,87 V112.75 H1070.25 V87" stroke="${C.topcoat}" stroke-width="1.5" fill="none" stroke-linejoin="miter"/>`,
    `<ellipse id="ds-spray" cx="0" cy="114" rx="22" ry="12" fill="url(#ds-spray)" opacity="0"/>`,
  ].join("");

  // outlet through the parapet, rainwater head, downpipe to a soak pit
  const pipe = [
    rect(xi1, 104, wall + 10, 9, "#cfd6db", 'class="ds-o"'),
    rect(1104, 96, 18, 26, "#dfe5e9", 'class="ds-o"'),
    `<rect x="1106" y="122" width="12" height="660" fill="#dfe5e9" fill-opacity=".55" class="ds-o"/>`,
    `<path class="ds-l" d="M1106,782 Q1106,798 1124,798 H1150 M1118,782 Q1118,788 1124,788 H1150"/>`,
    rect(1150, G.ground, 70, 64, "url(#ds-gravel)"),
    `<path d="M1150,${G.ground} V864 H1220 V${G.ground}" fill="none" stroke="#6a6152" stroke-width="1" vector-effect="non-scaling-stroke" stroke-dasharray="3 3"/>`,
  ].join("");

  // ── 02 bathroom: two coats, screed, tiles, fixtures ──
  const tiles: string[] = [];
  const tx0 = 854;
  const tx1 = 1070;
  const n = 8;
  const joint = 1.4;
  const tw = (tx1 - tx0 - joint * (n - 1)) / n;
  for (let i = 0; i < n; i++) {
    const x = tx0 + i * (tw + joint);
    tiles.push(`<rect id="ds-tile-${i}" x="${r(x)}" y="414" width="${r(tw)}" height="6" fill="${C.tile}" stroke="${C.ink}" stroke-width=".7" vector-effect="non-scaling-stroke"/>`);
  }
  const bathLayers = [
    `<path id="ds-c1" d="M849.5,380 V438.5 H1074.5 V380" stroke="${C.rpc}" stroke-width="3" fill="none" stroke-linejoin="miter"/>`,
    `<path id="ds-c2" d="M852.5,383 V435.5 H1071.5 V383" stroke="${C.rpc2}" stroke-width="3" fill="none" stroke-linejoin="miter"/>`,
    `<rect id="ds-screed" x="854" y="434" width="216" height="0" fill="url(#ds-screed)"/>`,
    `<g id="ds-tiles">${tiles.join("")}</g>`,
    // floor drain through the build-up
    `<g id="ds-trap" opacity="0"><rect x="972" y="413" width="16" height="58" fill="#5d6268" stroke="${C.ink}" stroke-width=".8" vector-effect="non-scaling-stroke"/><path d="M974,414 h12 M974,416.5 h12" stroke="#c9ced3" stroke-width=".6" vector-effect="non-scaling-stroke"/></g>`,
    `<g id="ds-fixtures" opacity="0">
      <path class="ds-f" d="M856,394 V350 H872 V394 Z"/>
      <path class="ds-f" d="M872,392 H926 Q928,400 918,405 L906,410 V414 H884 V408 Q874,402 872,392 Z"/>
      <path class="ds-fn" d="M${xi1},228 H1050 V236"/>
      <path class="ds-f" d="M1040,236 H1060 L1056,244 H1044 Z"/>
      <rect class="ds-f" x="1064" y="322" width="12" height="14"/>
    </g>`,
    `<rect id="ds-film" x="990" y="412.6" width="80" height="1.4" fill="${C.water}" opacity="0"/>`,
  ].join("");

  // ── 03 basement: wet patch, HDPE sheet, protection board, pressure arrows ──
  const basementLayers = [
    `<g id="ds-wet" opacity="0">
      <ellipse cx="1088" cy="1048" rx="16" ry="64" fill="url(#ds-wet)"/>
      <ellipse cx="1072" cy="1060" rx="10" ry="40" fill="url(#ds-wet)"/>
      <path d="M1076,1086 q-2,8 0,12" stroke="${C.water}" stroke-width="1.4" fill="none" vector-effect="non-scaling-stroke"/>
    </g>`,
    `<g mask="url(#ds-hdpe-mask)">
      <path d="M1102.5,800 V1152.5 H297.5 V800" stroke="${C.rpc}" stroke-width="5" fill="none" stroke-linejoin="miter"/>
      <path d="M1106,800 V1156 H294 V800" stroke="#2a52b0" stroke-width="2.2" fill="none" stroke-dasharray="1.4 2.1" stroke-linecap="round"/>
    </g>`,
    `<path id="ds-board" d="M1109.5,800 V1150" stroke="${C.board}" stroke-width="5" fill="none"/>`,
    `<path id="ds-board-l" d="M290.5,800 V1150" stroke="${C.board}" stroke-width="5" fill="none"/>`,
    `<g id="ds-arrows" opacity="0">${[990, 1022, 1054, 1086, 1118]
      .map(
        (y, i) =>
          `<g class="ds-arrow" data-i="${i}"><path d="M${1172 + (i % 2) * 18},${y} H1120 M1128,${y - 5} L1120,${y} L1128,${y + 5}" stroke="${C.water}" stroke-width="1.6" fill="none" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></g>`,
      )
      .join("")}</g>`,
  ].join("");

  // ── 04 sump wall under the microscope ──
  const micro = `<g id="ds-micro" opacity="0">
    <g clip-path="url(#ds-microclip)">${microWall()}
      ${PORES.map((d) => `<path d="${d}" stroke="#7d766b" stroke-width="1.1" fill="none" stroke-linecap="round"/>`).join("")}
      ${PORES.map((d, i) => `<path id="ds-pore-${i}" d="${d}" stroke="${C.water}" stroke-width=".7" fill="none" stroke-linecap="round" stroke-dasharray="0 999"/>`).join("")}
    </g>
    <g id="ds-crystals"></g>
    <line x1="236" y1="896" x2="236" y2="1064" class="ds-l"/><line x1="260" y1="896" x2="260" y2="1064" class="ds-l"/>
  </g>`;

  const groundLine = `<line x1="-4000" y1="${G.ground}" x2="${x0}" y2="${G.ground}" class="ds-l"/><line x1="${x1}" y1="${G.ground}" x2="5000" y2="${G.ground}" class="ds-l"/>`;
  const tufts = [-120, 20, 360 - 400, 1180, 1250, 1330, 1460]
    .map((x) => `<path class="ds-fn" d="M${x},800 l-3,-9 M${x + 3},800 l0,-12 M${x + 6},800 l4,-8"/>`)
    .join("");

  // ── moving water ──
  const fx = `
  <g id="ds-rain"></g>
  <g id="ds-shower"></g>
  <g id="ds-perc"></g>
  <g id="ds-seep"></g>
  <ellipse id="ds-ripple" cx="${G.dropX}" cy="${G.roofSurface}" rx="0" ry="0" fill="none" stroke="${C.water}" stroke-width="1.2" vector-effect="non-scaling-stroke" opacity="0"/>
  <g id="ds-splash">${[0, 1, 2, 3, 4, 5].map(() => `<circle r="1.5" fill="${C.water}" opacity="0"/>`).join("")}</g>
  <circle id="ds-bead" r="2.8" fill="${C.water}" opacity="0"/>
  <g id="ds-drop">
    <circle r="16" fill="url(#ds-glow)"/>
    <circle r="11" fill="none" stroke="${C.water}" stroke-width=".9" vector-effect="non-scaling-stroke" stroke-dasharray="2 3" opacity=".9"/>
    <path d="M0,-7.5 C1.6,-4.4 4.2,-1.4 4.2,1.7 A4.2,4.2 0 0 1 -4.2,1.7 C-4.2,-1.4 -1.6,-4.4 0,-7.5 Z" fill="${C.water}"/>
    <ellipse cx="-1.4" cy="0.6" rx=".9" ry="1.6" fill="#fff" opacity=".8"/>
  </g>`;

  return [
    defs,
    sky,
    palms,
    ghostSky,
    soil,
    ghostSoil,
    water,
    `<g id="ds-sump">${sump}</g>`,
    rooms,
    furniture,
    structure,
    roofLayers,
    pipe,
    bathLayers,
    basementLayers,
    micro,
    groundLine,
    tufts,
    fx,
  ].join("\n");
}
