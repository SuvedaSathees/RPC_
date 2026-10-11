/**
 * The home page's products section, rendered on the server so the product list
 * never travels to the browser: the products, layer by layer.
 *
 * Pick a job (a bathroom floor, a terrace, a tank, a basement, a concrete
 * repair, an AAC wall) and it is drawn as a cut-away block, each layer stepped
 * back so it shows, from the slab at the bottom to the finish on top, with a
 * number on every layer we supply; beside it, the same numbers with what each
 * layer does and the products on our list that do it. Which products go in
 * which layer comes from the "systems" in lib/products (built only from what
 * RPC's spreadsheet says each product is for); under it, the brands.
 */
import { productBySlug, SYSTEMS, type Product, PRODUCTS } from "./index";
import { brandInfo, brandMark } from "./brands";
import { shortName } from "./compare";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ------------------------------------------------------------ the drawing */

/** what a layer is drawn as */
type Look = "concrete" | "lean" | "coat" | "roofcoat" | "screed" | "adhesive" | "tile" | "membrane" | "skim" | "bond" | "mortar" | "aac" | "plaster";
/** something drawn in or on a layer */
type Feat = "specks" | "joint" | "plug" | "bars" | "tilejoints" | "aacjoints";

interface Band {
  look: Look;
  /** thickness, in drawing units (thin coats drawn thicker than life, so they show) */
  t: number;
  /** the job's layer this band is (it gets that layer's number) */
  layer?: string;
  /** a band that is not one of our products: its name, written on it */
  name?: string;
  feats?: readonly { kind: Feat; layer?: string; at?: number }[];
}

/** the jobs shown, and how each is drawn, bottom band first */
const DRAWN: readonly { key: string; bands: readonly Band[] }[] = [
  {
    key: "bathroom",
    bands: [
      { look: "concrete", t: 56, name: "Concrete slab" },
      { look: "coat", t: 9, layer: "coat" },
      { look: "screed", t: 22, layer: "screed" },
      { look: "adhesive", t: 9, layer: "adhesive" },
      { look: "tile", t: 15, feats: [{ kind: "tilejoints", layer: "grout" }] },
    ],
  },
  {
    key: "terrace",
    bands: [
      { look: "concrete", t: 64, name: "Roof slab", feats: [{ kind: "specks", layer: "mix", at: 0.3 }] },
      { look: "skim", t: 7, layer: "fill" },
      { look: "roofcoat", t: 11, layer: "coat" },
    ],
  },
  {
    key: "tank",
    bands: [
      {
        look: "concrete",
        t: 72,
        name: "Tank floor",
        feats: [
          { kind: "specks", layer: "mix", at: 0.2 },
          { kind: "plug", layer: "plug", at: 0.48 },
          { kind: "joint", layer: "joint", at: 0.76 },
        ],
      },
      { look: "coat", t: 10, layer: "coat" },
    ],
  },
  {
    key: "basement",
    bands: [
      { look: "lean", t: 16 },
      { look: "membrane", t: 9, layer: "sheet" },
      {
        look: "concrete",
        t: 64,
        name: "Basement raft",
        feats: [
          { kind: "specks", layer: "mix", at: 0.3 },
          { kind: "plug", layer: "plug", at: 0.56 },
          { kind: "joint", layer: "joint", at: 0.8 },
        ],
      },
    ],
  },
  {
    key: "repair",
    bands: [
      { look: "concrete", t: 58, name: "Old concrete", feats: [{ kind: "bars" }] },
      { look: "bond", t: 7, layer: "bond" },
      { look: "mortar", t: 26, layer: "mortar" },
      { look: "skim", t: 7, layer: "finish" },
    ],
  },
  {
    key: "aac",
    bands: [
      { look: "aac", t: 62, layer: "block", feats: [{ kind: "aacjoints", layer: "joint" }] },
      { look: "plaster", t: 13, layer: "plaster" },
    ],
  },
];

/** front, top and side colours for each look; a pattern id for the front where it has one */
const FACES: Record<Look, { front: string; top: string; side: string; pattern?: string; light?: boolean }> = {
  concrete: { front: "#a4a29b", top: "#c3c1b9", side: "#86847e", pattern: "hlp-conc" },
  lean: { front: "#b8b3a6", top: "#cdc8bc", side: "#9a958a", pattern: "hlp-lean" },
  coat: { front: "#3f8b97", top: "#63aab4", side: "#2f707b" },
  roofcoat: { front: "#e6ebee", top: "#f7f9fa", side: "#c4ccd2", light: true },
  screed: { front: "#bcb193", top: "#d3cab0", side: "#9f9578", pattern: "hlp-scr" },
  adhesive: { front: "#8b939b", top: "#a7aeb5", side: "#727a82" },
  tile: { front: "#ece5d6", top: "#f6f2e8", side: "#cfc6b4", light: true },
  membrane: { front: "#2b3037", top: "#3b4149", side: "#202429", pattern: "hlp-mem" },
  skim: { front: "#d6d1c6", top: "#e8e4dc", side: "#bab4a8", light: true },
  bond: { front: "#c9b58a", top: "#dac9a0", side: "#ab996f" },
  mortar: { front: "#8c99a5", top: "#a8b3bd", side: "#74808b", pattern: "hlp-mor" },
  aac: { front: "#dddbd3", top: "#eeede7", side: "#c2c0b8", pattern: "hlp-aac", light: true },
  plaster: { front: "#e0d4bd", top: "#eee5d4", side: "#c6b99f", light: true },
};

/** the drawing's frame: the block's front-left corner, its width, the depth it recedes by, and the step each layer is cut back */
const X0 = 20;
const W = 380;
const X1 = X0 + W;
const DX = 104;
const DY = -66;
const STEP = 62;
const Y0 = 300;

const n1 = (v: number) => Math.round(v * 10) / 10;
const pts = (p: readonly (readonly [number, number])[]) => p.map(([x, y]) => `${n1(x)},${n1(y)}`).join(" ");

/** a small seeded random, so every drawing is the same on every visit */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** the patterns, once for the whole section */
function patterns() {
  const dots = (id: string, size: number, base: string, n: number, cols: readonly string[], rmin: number, rmax: number, seed: number) => {
    const r = rng(seed);
    let out = `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${base}"/>`;
    for (let i = 0; i < n; i++) out += `<circle cx="${n1(r() * size)}" cy="${n1(r() * size)}" r="${n1(rmin + r() * (rmax - rmin))}" fill="${cols[Math.floor(r() * cols.length)]}"/>`;
    return `${out}</pattern>`;
  };
  return `<svg class="hl-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
${dots("hlp-conc", 46, "#a4a29b", 22, ["#8f8d86", "#b8b6ae", "#7e7c76", "#c7c5bd", "#97958e"], 0.6, 1.9, 7)}
${dots("hlp-lean", 40, "#b8b3a6", 14, ["#a39e92", "#cac5b9", "#948f84"], 0.6, 1.5, 11)}
${dots("hlp-scr", 22, "#bcb193", 16, ["#a99e81", "#cfc5a8", "#b2a78a", "#968c71"], 0.4, 1, 3)}
${dots("hlp-mor", 30, "#8c99a5", 12, ["#7c8995", "#9da9b4", "#6f7b86"], 0.5, 1.3, 5)}
${dots("hlp-aac", 20, "#dddbd3", 13, ["#c9c7bf", "#cfcdc5", "#bebcb4", "#e9e8e2"], 0.5, 1.4, 9)}
<pattern id="hlp-mem" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#2b3037"/><rect width="1.4" height="7" fill="#353b43"/></pattern>
<filter id="hlp-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
</defs></svg>`;
}

interface Marker {
  layer: string;
  x: number;
  y: number;
}

/** one job drawn: the bands bottom to top, then the numbers */
function drawing(key: string, bands: readonly Band[], numberOf: (layer: string) => number) {
  const markers: Marker[] = [];
  let y = Y0;
  let out = "";
  // the block's shadow on the ground
  const total = bands.reduce((s, b) => s + b.t, 0);
  out += `<polygon class="hl-shadow" points="${pts([
    [X0 + 10, Y0 + 4],
    [X1 + 10, Y0 + 4],
    [X1 + DX + 14, Y0 + DY + 4],
    [X0 + DX + 14, Y0 + DY + 4],
  ])}" filter="url(#hlp-blur)"/>`;
  bands.forEach((b, i) => {
    const x0 = X0 + i * STEP;
    const yb = y;
    const yt = y - b.t;
    y = yt;
    const f = FACES[b.look];
    const front = f.pattern ? `url(#${f.pattern})` : f.front;
    const next = bands[i + 1];
    let g = `<polygon points="${pts([[x0, yb], [X1, yb], [X1, yt], [x0, yt]])}" fill="${front}"/>`;
    g += `<polygon points="${pts([[X1, yb], [X1 + DX, yb + DY], [X1 + DX, yt + DY], [X1, yt]])}" fill="${f.side}"/>`;
    g += `<polygon points="${pts([[x0, yt], [X1, yt], [X1 + DX, yt + DY], [x0 + DX, yt + DY]])}" fill="${f.top}"/>`;
    // crisp edges: a light line along the top front edge, a dark one down the front corner
    g += `<path d="M${x0} ${n1(yt + 0.5)}H${X1}" stroke="#fff" stroke-opacity="${f.light ? 0.7 : 0.28}" stroke-width="1"/>`;
    g += `<path d="M${X1} ${yb}V${yt}" stroke="#000" stroke-opacity=".12" stroke-width="1"/>`;
    // the look's details
    if (b.look === "adhesive") {
      // the notched trowel's ridges, on the part of the top that shows
      for (let s = 0.12; s < 0.95; s += 0.13) g += `<path d="M${n1(x0 + s * DX)} ${n1(yt + s * DY)}h${STEP - 6}" stroke="#7c848c" stroke-width="1.2" stroke-opacity=".75"/>`;
    }
    const feats = b.feats ?? [];
    for (const ft of feats) {
      const fx = (at: number) => x0 + 18 + (X1 - x0 - 36) * at;
      if (ft.kind === "specks") {
        // the admixture, all through the concrete
        const r = rng(key.length * 31 + i);
        let s = "";
        for (let k = 0; k < 26; k++) {
          const sx = x0 + 10 + r() * (X1 - x0 - 20);
          const sy = yt + 8 + r() * (b.t - 14);
          s += `<path d="M${n1(sx)} ${n1(sy - 2.2)}l2 2.2-2 2.2-2-2.2z"/>`;
        }
        g += `<g class="hl-feat" data-layer="${ft.layer}" fill="#2aa3b2" fill-opacity=".9">${s}</g>`;
        if (ft.layer) markers.push({ layer: ft.layer, x: fx(ft.at ?? 0.3), y: yb - b.t * 0.58 });
      } else if (ft.kind === "joint") {
        // a construction joint, with the waterstop strip in it
        const jx = fx(ft.at ?? 0.7);
        const jm = (yb + yt) / 2;
        g += `<g class="hl-feat" data-layer="${ft.layer}"><path d="M${n1(jx)} ${yt}V${yb}" stroke="#5d5b56" stroke-width="2"/><path d="M${n1(jx)} ${yt}l${DX * 0.32} ${DY * 0.32}" stroke="#5d5b56" stroke-width="1.6" stroke-opacity=".7"/><rect x="${n1(jx - 8)}" y="${n1(jm - 4)}" width="16" height="8" rx="3" fill="#29323b"/><rect x="${n1(jx - 8)}" y="${n1(jm - 4)}" width="16" height="2.4" rx="1.2" fill="#4a5864"/></g>`;
        if (ft.layer) markers.push({ layer: ft.layer, x: jx + 22, y: jm - 16 });
      } else if (ft.kind === "plug") {
        // a leak stopped with a plug
        const px = fx(ft.at ?? 0.5);
        const pm = yb - b.t * 0.5;
        g += `<g class="hl-feat" data-layer="${ft.layer}"><path d="M${n1(px - 11)} ${n1(pm)}c0-7 6-11 12-10 7 1 11 6 10 12-1 6-7 9-13 8-6 0-9-4-9-10z" fill="#77796f" stroke="#5c5e56" stroke-width="1.2"/><path d="M${n1(px - 4)} ${n1(pm + 2)}c2-3 6-4 9-1" stroke="#9a9c92" stroke-width="1.4" fill="none"/></g>`;
        if (ft.layer) markers.push({ layer: ft.layer, x: px + 24, y: pm - 10 });
      } else if (ft.kind === "bars") {
        // the exposed steel: a pocket broken out of the old concrete, and the bars in it
        const top = yt + 4;
        g += `<path d="M${x0 + 40} ${yt}l10 22h${X1 - x0 - 110}l12-22z" fill="#7a7872"/>`;
        const xs = [0.18, 0.42, 0.66].map((a) => x0 + 56 + (X1 - x0 - 140) * a);
        xs.forEach((bx, k) => {
          const primed = k > 0;
          g += `<g class="hl-feat" data-layer="${primed ? "prime" : "clean"}"><circle cx="${n1(bx)}" cy="${n1(top + 10)}" r="6.5" fill="${primed ? "#5a6b7a" : "#9aa4ad"}"/><circle cx="${n1(bx - 1.8)}" cy="${n1(top + 8)}" r="2" fill="#fff" fill-opacity=".55"/></g>`;
        });
        markers.push({ layer: "clean", x: xs[0]!, y: top - 14 });
        markers.push({ layer: "prime", x: xs[1]! + 2, y: top - 14 });
      } else if (ft.kind === "tilejoints") {
        // tiles: joints down the front and across the top, filled with grout
        let j = "";
        for (let jx = x0 + 44; jx < X1 - 6; jx += 44) j += `<path d="M${jx} ${yb}V${yt}"/><path d="M${jx} ${yt}l${DX} ${DY}"/>`;
        for (const s of [1 / 3, 2 / 3]) j += `<path d="M${n1(x0 + s * DX)} ${n1(yt + s * DY)}H${n1(X1 + s * DX)}"/>`;
        g += `<g class="hl-feat" data-layer="${ft.layer}" stroke="#8a8275" stroke-width="1.8">${j}</g>`;
        if (ft.layer) markers.push({ layer: ft.layer, x: x0 + 44 + DX * (1 / 3), y: yt + DY * (1 / 3) });
      } else if (ft.kind === "aacjoints") {
        // block joints, with the thin-bed mortar in them
        let j = "";
        for (let jx = x0 + 78; jx < X1 - 8; jx += 78) j += `<path d="M${jx} ${yb}V${yt}l${DX} ${DY}"/>`;
        g += `<g class="hl-feat" data-layer="${ft.layer}" stroke="#a9a59a" stroke-width="2.4" fill="none">${j}</g>`;
        if (ft.layer) markers.push({ layer: ft.layer, x: x0 + 78 + 16, y: yb - b.t * 0.5 });
      }
    }
    // the band's own number: on the part of its top that shows, or on its face where the band above hides the top
    if (b.layer) {
      const shows = next ? STEP - next.t * (DX / -DY) : STEP;
      if (shows >= 26) markers.push({ layer: b.layer, x: x0 + Math.min(shows, STEP) / 2 + DX * 0.5, y: yt + DY * 0.5 });
      // the band above hides its top: the number goes on its face, at the right, clear of the rest
      else markers.push({ layer: b.layer, x: X1 - 30, y: (yb + yt) / 2 });
    }
    // a name for a band that is not one of ours
    if (b.name && b.t >= 40) g += `<text class="hl-bname" x="${x0 + 14}" y="${yb - 12}">${esc(b.name)}</text>`;
    out += `<g class="hl-band" style="--i:${i}"${b.layer ? ` data-layer="${b.layer}"` : ""}>${g}</g>`;
  });
  // the numbers, last, so nothing covers them
  const nums = markers
    .map(
      (m) =>
        `<g class="hl-mk" data-layer="${m.layer}" transform="translate(${n1(m.x)} ${n1(m.y)})"><circle r="11.5"/><text y="4.3" text-anchor="middle">${numberOf(m.layer)}</text></g>`,
    )
    .join("");
  const top = Y0 - total + DY - 18;
  return `<svg class="hl-svg" viewBox="0 ${top} ${X1 + DX + 24} ${Y0 + 26 - top}" role="presentation" aria-hidden="true" focusable="false">${out}<g class="hl-mks">${nums}</g></svg>`;
}

/* ------------------------------------------------------------ the words */

/** a product as a chip: its brand's mark and its name */
function chip(p: Product) {
  return `<li><a class="hl-chip" href="/products#${p.slug}" data-internal><i style="--c:${brandMark(p.brand)}" aria-hidden="true">${esc(p.brand.charAt(0))}</i><span class="hl-vh">${esc(p.brand)} </span>${esc(shortName(p))}</a></li>`;
}

const SHOW = 2;

export function homeLayersMarkup(all: readonly Product[] = PRODUCTS) {
  const jobs = DRAWN.map((d) => ({ d, s: SYSTEMS.find((s) => s.key === d.key) })).filter((j): j is { d: (typeof DRAWN)[number]; s: (typeof SYSTEMS)[number] } => Boolean(j.s));
  const tabs = jobs
    .map(
      ({ s }, i) =>
        `<button type="button" role="tab" class="hl-tab" id="hl-t-${s.key}" aria-controls="hl-p-${s.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-hl-tab="${s.key}">${esc(s.name)}</button>`,
    )
    .join("");
  const panels = jobs
    .map(({ d, s }, i) => {
      const order = s.layers.map((l) => l.key);
      const numberOf = (layer: string) => order.indexOf(layer) + 1;
      const rows = s.layers
        .map((l, k) => {
          const ps = l.products.map((slug) => productBySlug(slug)).filter((p): p is Product => Boolean(p) && all.includes(p!));
          const more = ps.length - SHOW;
          return `<li class="hl-row" data-layer="${l.key}" tabindex="-1">
  <span class="hl-n" aria-hidden="true">${k + 1}</span>
  <div class="hl-rb">
    <p class="hl-name"><span class="hl-vh">Layer ${k + 1}: </span>${esc(l.name)}</p>
    <p class="hl-what">${esc(l.note)}</p>
    <ul class="hl-chips"${more > 0 ? " data-more" : ""}>${ps.map(chip).join("")}${more > 0 ? `<li class="hl-mli"><button type="button" class="hl-more" aria-expanded="false">${more} more</button></li>` : ""}</ul>
  </div>
</li>`;
        })
        .join("");
      return `<div class="hl-panel${i === 0 ? " is-on" : ""}" role="tabpanel" id="hl-p-${s.key}" aria-labelledby="hl-t-${s.key}" data-hl-panel="${s.key}"${i === 0 ? "" : " hidden"}>
  <figure class="hl-art">${drawing(s.key, d.bands, numberOf)}<figcaption>${esc(s.line)}, drawn bottom to top in the order the layers go on.</figcaption></figure>
  <ol class="hl-list">${rows}</ol>
</div>`;
    })
    .join("");
  const brands = brandInfo(all)
    .map((b) => `<li><a class="hl-brand" href="/products#brand-${b.key}" data-internal><i style="--c:${brandMark(b.name)}" aria-hidden="true">${esc(b.name.charAt(0))}</i>${esc(b.name)}<span>${b.count}</span></a></li>`)
    .join("");
  return `<div class="hl" data-hl>
  ${patterns()}
  <div class="hl-jobs" role="tablist" aria-label="Jobs">${tabs}</div>
  <div class="hl-card">${panels}</div>
  <div class="hl-foot">
    <p class="hl-fine">A guide from our product list. The right system for your building is confirmed at the free inspection.</p>
    <ul class="hl-brands" aria-label="Products by brand">${brands}</ul>
  </div>
</div>`;
}
