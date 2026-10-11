/**
 * Drives the drop-story drawing. Everything is a pure function of the scroll
 * position `u` (0 … T timeline units) except rain, shower and ripples, which
 * also follow the clock so the drawing never looks frozen.
 */
import { C, G, PORES } from "./world";

export const T = 24;

type Box = readonly [number, number, number, number];
export type Frame = "hero" | "stage" | "final";
interface Key {
  u: number;
  box: Box;
  mbox?: Box;
  frame: Frame;
}

const HERO: Box = [230, -110, 1190, 830];
const ROOF_WIDE: Box = [290, -60, 1150, 230];
const ROOF_WIDE_M: Box = [640, -40, 1130, 200];
const ROOF: Box = [860, 30, 1140, 175];
const ROOF_M: Box = [850, 20, 1120, 180];
const BATH: Box = [820, 140, 1140, 480];
const BATH_M: Box = [836, 150, 1124, 470];
const BATH_D: Box = [856, 330, 1090, 452];
const BATH_DM: Box = [850, 320, 1090, 460];
const PIT: Box = [1000, 660, 1320, 960];
const BASE: Box = [1096, 780, 1500, 1190];
const BASE_M: Box = [1040, 790, 1330, 1180];
const CAR: Box = [470, 780, 950, 1180];
const SUMP: Box = [20, 760, 320, 1090];
const MICRO: Box = [208, 948, 292, 1004];
const MICRO_M: Box = [214, 944, 286, 1008];
const FULL: Box = [-60, -130, 1340, 1220];

export const KEYS: Key[] = [
  { u: 0, box: HERO, frame: "hero" },
  { u: 1.2, box: HERO, frame: "hero" },
  { u: 2.6, box: ROOF_WIDE, mbox: ROOF_WIDE_M, frame: "stage" },
  { u: 4.5, box: ROOF_WIDE, mbox: ROOF_WIDE_M, frame: "stage" },
  { u: 5.1, box: ROOF, mbox: ROOF_M, frame: "stage" },
  { u: 6.4, box: ROOF, mbox: ROOF_M, frame: "stage" },
  { u: 7.8, box: BATH, mbox: BATH_M, frame: "stage" },
  { u: 9.0, box: BATH, mbox: BATH_M, frame: "stage" },
  { u: 9.7, box: BATH_D, mbox: BATH_DM, frame: "stage" },
  { u: 11.8, box: BATH_D, mbox: BATH_DM, frame: "stage" },
  { u: 12.6, box: PIT, frame: "stage" },
  { u: 13.6, box: BASE, mbox: BASE_M, frame: "stage" },
  { u: 16.8, box: BASE, mbox: BASE_M, frame: "stage" },
  { u: 17.4, box: CAR, frame: "stage" },
  { u: 18.0, box: SUMP, frame: "stage" },
  { u: 18.2, box: SUMP, frame: "stage" },
  { u: 19.0, box: MICRO, mbox: MICRO_M, frame: "stage" },
  { u: 20.6, box: MICRO, mbox: MICRO_M, frame: "stage" },
  { u: 22.0, box: FULL, frame: "final" },
  { u: T, box: FULL, frame: "final" },
];

/** where each block of copy is on screen, in timeline units */
export const WINDOWS = {
  hero: [0, 1.3],
  s1: [2.4, 6.6],
  s2: [7.6, 11.9],
  s3: [13.0, 16.9],
  s4: [17.6, 20.9],
  final: [21.6, T + 1],
} as const;

/** callouts: a leader from a point in the drawing to a short label */
export interface Callout {
  id: string;
  at: readonly [number, number];
  dx: number;
  dy: number;
  text: string;
  win: readonly [number, number];
}
export const CALLOUTS: Callout[] = [
  { id: "c-top", at: [950, 112.75], dx: 0, dy: 52, text: "UV-resistant topcoat", win: [5.0, 6.5] },
  { id: "c-pu", at: [1000, 116], dx: 0, dy: 88, text: "PU membrane", win: [5.0, 6.5] },
  { id: "c-pr", at: [1040, 119.25], dx: 0, dy: 124, text: "Primer", win: [5.0, 6.5] },
  { id: "c-up", at: [1073.5, 96], dx: -84, dy: -70, text: "Turned up the parapet", win: [5.2, 6.5] },
  { id: "c-tile", at: [880, 417], dx: 0, dy: 70, text: "Tiles", win: [10.0, 11.9] },
  { id: "c-scr", at: [925, 427], dx: 0, dy: 104, text: "Screed", win: [9.7, 11.9] },
  { id: "c-co", at: [1030, 436], dx: 0, dy: 76, text: "Two waterproof coats", win: [9.7, 11.9] },
  { id: "c-upb", at: [1073, 392], dx: -100, dy: -78, text: "Coats turned up the wall", win: [9.7, 11.9] },
  { id: "c-dr", at: [980, 414], dx: -62, dy: -52, text: "Floor drain", win: [10.7, 11.9] },
  { id: "c-gw", at: [1210, 964], dx: 10, dy: -46, text: "Groundwater rising", win: [13.9, 16.9] },
  { id: "c-hd", at: [1102.5, 1110], dx: 64, dy: 34, text: "HDPE sheet membrane", win: [15.0, 16.9] },
  { id: "c-bd", at: [1109.5, 1140], dx: 64, dy: 46, text: "Protection board", win: [15.6, 16.9] },
  { id: "c-cr", at: [248.6, 969.4], dx: 0, dy: -150, text: "Crystals fill the pores", win: [19.6, 20.8] },
  { id: "c-tank", at: [222, 990], dx: 0, dy: 120, text: "Stored water", win: [19.0, 20.8] },
  { id: "c-gr", at: [276, 990], dx: 0, dy: 120, text: "Groundwater", win: [19.0, 20.8] },
];

// ───────────────────────── maths ─────────────────────────
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** fade in over `f` after a, fade out over `f` before b */
export const win = (u: number, a: number, b: number, f = 0.3) => Math.min(seg(u, a, a + f), 1 - seg(u, b - f, b));

interface Safe {
  x: number;
  y: number;
  w: number;
  h: number;
}
export function safeRect(frame: Frame, W: number, H: number, mobile: boolean): Safe {
  if (mobile) {
    if (frame === "hero") return { x: 0.04 * W, y: 0.42 * H, w: 0.92 * W, h: 0.54 * H };
    if (frame === "final") return { x: 0.04 * W, y: 0.08 * H, w: 0.92 * W, h: 0.46 * H };
    return { x: 0.04 * W, y: 0.09 * H, w: 0.92 * W, h: 0.47 * H };
  }
  if (frame === "hero") return { x: 0.47 * W, y: 0.08 * H, w: 0.5 * W, h: 0.86 * H };
  if (frame === "final") return { x: 0.45 * W, y: 0.06 * H, w: 0.52 * W, h: 0.86 * H };
  return { x: 0.42 * W, y: 0.1 * H, w: 0.54 * W, h: 0.74 * H };
}

interface Cam {
  s: number;
  cx: number;
  cy: number;
  ax: number;
  ay: number;
}
function fit(k: Key, W: number, H: number, mobile: boolean): Cam {
  const b = mobile && k.mbox ? k.mbox : k.box;
  const sf = safeRect(k.frame, W, H, mobile);
  const s = Math.min(sf.w / (b[2] - b[0]), sf.h / (b[3] - b[1]));
  return { s, cx: (b[0] + b[2]) / 2, cy: (b[1] + b[3]) / 2, ax: sf.x + sf.w / 2, ay: sf.y + sf.h / 2 };
}
export function camAt(u: number, W: number, H: number, mobile: boolean): Cam {
  let i = 0;
  while (i < KEYS.length - 2 && u > KEYS[i + 1]!.u) i++;
  const a = KEYS[i]!;
  const b = KEYS[i + 1]!;
  const t = ease(seg(u, a.u, b.u));
  const ca = fit(a, W, H, mobile);
  const cb = fit(b, W, H, mobile);
  return {
    s: Math.exp(lerp(Math.log(ca.s), Math.log(cb.s), t)),
    cx: lerp(ca.cx, cb.cx, t),
    cy: lerp(ca.cy, cb.cy, t),
    ax: lerp(ca.ax, cb.ax, t),
    ay: lerp(ca.ay, cb.ay, t),
  };
}

// ───────────────────────── engine ─────────────────────────
const NS = "http://www.w3.org/2000/svg";

export interface View {
  s: number;
  x: number;
  y: number;
  /** 0 = above ground (light), 1 = underground (dark) */
  tone: number;
}

export function createEngine(svg: SVGSVGElement) {
  const $ = <E extends Element = SVGElement>(id: string) => svg.querySelector(`#${id}`) as E | null;
  const rand = (() => {
    let s = 42;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  })();

  // dash-revealed layers
  const reveal = (id: string) => {
    const el = $<SVGPathElement>(id);
    if (!el) return null;
    const L = el.getTotalLength();
    el.style.strokeDasharray = `${L}`;
    el.style.strokeDashoffset = `${L}`;
    return { el, L };
  };
  const primer = reveal("ds-primer");
  const pu = reveal("ds-pu");
  const top = reveal("ds-top");
  const c1 = reveal("ds-c1");
  const c2 = reveal("ds-c2");
  const hdpe = reveal("ds-hdpe-mpath");
  const board = reveal("ds-board");
  const boardL = reveal("ds-board-l");
  const set = (r: { el: SVGPathElement; L: number } | null, t: number) => {
    if (r) r.el.style.strokeDashoffset = `${r.L * (1 - t)}`;
  };

  const spray = $("ds-spray");
  const drop = $("ds-drop");
  const bead = $("ds-bead");
  const ripple = $("ds-ripple");
  const splash = Array.from(svg.querySelectorAll<SVGCircleElement>("#ds-splash circle"));
  const screed = $("ds-screed");
  const tiles = Array.from(svg.querySelectorAll<SVGRectElement>("#ds-tiles rect"));
  const fixtures = $("ds-fixtures");
  const trap = $("ds-trap");
  const film = $("ds-film");
  const wt = $("ds-wt");
  const wtWave = $("ds-wt-wave");
  const tankWave = $("ds-tank-wave");
  const wet = $("ds-wet");
  const arrows = $("ds-arrows");
  const arrowEls = Array.from(svg.querySelectorAll<SVGGElement>(".ds-arrow"));
  const micro = $("ds-micro");
  const sumpTint = $("ds-sump-tint");
  const pores = PORES.map((_, i) => {
    const el = $<SVGPathElement>(`ds-pore-${i}`)!;
    return { el, L: el.getTotalLength() };
  });

  // rain
  const rainG = $("ds-rain")!;
  const rain = Array.from({ length: 90 }, () => {
    const x = -320 + rand() * 1980;
    const floor = x > 324 && x < 1076 ? G.roofSurface : x >= 294 && x <= 1124 ? 66 : G.ground;
    const l = document.createElementNS(NS, "line");
    l.setAttribute("stroke", C.water);
    l.setAttribute("stroke-width", "1");
    l.setAttribute("vector-effect", "non-scaling-stroke");
    l.setAttribute("stroke-linecap", "round");
    rainG.appendChild(l);
    return { el: l, x, floor, y0: rand() * 2000, v: 520 + rand() * 260, o: 0.25 + rand() * 0.45 };
  });

  // shower
  const showerG = $("ds-shower")!;
  const shower = Array.from({ length: 16 }, () => {
    const l = document.createElementNS(NS, "line");
    l.setAttribute("stroke", C.water);
    l.setAttribute("stroke-width", "1.1");
    l.setAttribute("vector-effect", "non-scaling-stroke");
    l.setAttribute("stroke-linecap", "round");
    showerG.appendChild(l);
    return { el: l, x: 1043 + rand() * 14, sp: (rand() - 0.5) * 18, y0: rand() * 200, v: 220 + rand() * 80 };
  });

  // percolation from the soak pit into the ground
  const percG = $("ds-perc")!;
  const perc = Array.from({ length: 30 }, () => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", `${0.9 + rand() * 0.9}`);
    c.setAttribute("fill", C.water);
    percG.appendChild(c);
    return { el: c, x: 1150 + rand() * 70, y0: rand(), v: 0.05 + rand() * 0.05, w: rand() * 6.28 };
  });

  // water getting through tile joints (bathroom)
  const seepG = $("ds-seep")!;
  const tileJoints = [2, 4, 5].map((i) => {
    const t = tiles[i]!;
    return Number(t.getAttribute("x")) + Number(t.getAttribute("width")) + 0.7;
  });
  const seep = tileJoints.map((x) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("r", "1.3");
    c.setAttribute("fill", C.water);
    seepG.appendChild(c);
    return { el: c, x };
  });

  // crystals that grow along each pore
  const crystG = $("ds-crystals")!;
  const crystals: { el: SVGGElement; at: number }[] = [];
  pores.forEach((p, i) => {
    [0.18, 0.36, 0.54, 0.74].forEach((f, j) => {
      const pt = p.el.getPointAtLength(p.L * f);
      const g = document.createElementNS(NS, "g") as SVGGElement;
      let needles = "";
      for (let k = 0; k < 9; k++) {
        const a = rand() * Math.PI * 2;
        const len = 0.8 + rand() * 1.5;
        needles += `<line x1="0" y1="0" x2="${(Math.cos(a) * len).toFixed(2)}" y2="${(Math.sin(a) * len).toFixed(2)}"/>`;
      }
      g.innerHTML = `<circle r="1.4" fill="#cfe9ff" opacity=".45"/>${needles}<circle r=".35" fill="#fff"/>`;
      g.setAttribute("stroke", "#f2f9ff");
      g.setAttribute("stroke-width", ".2");
      g.setAttribute("stroke-linecap", "round");
      crystG.appendChild(g);
      crystals.push({ el: g, at: 19.4 + j * 0.14 + i * 0.06 });
      g.dataset.x = `${pt.x}`;
      g.dataset.y = `${pt.y}`;
    });
  });

  const view: View = { s: 1, x: 0, y: 0, tone: 0 };

  function render(u: number, time: number, W: number, H: number, mobile: boolean): View {
    // camera
    const cam = camAt(u, W, H, mobile);
    const s = cam.s;
    const vx = cam.cx - cam.ax / s;
    const vy = cam.cy - cam.ay / s;
    svg.setAttribute("viewBox", `${vx.toFixed(3)} ${vy.toFixed(3)} ${(W / s).toFixed(3)} ${(H / s).toFixed(3)}`);
    view.s = s;
    view.x = vx;
    view.y = vy;
    const centreY = vy + H / s / 2;
    view.tone = clamp((centreY - 700) / 180);
    const k = clamp(1.7 / s, 1, 3.2); // keep the drop readable when the camera is far

    // ── 01 terrace
    set(primer, seg(u, 2.6, 3.1));
    set(pu, seg(u, 3.1, 4.4));
    set(top, seg(u, 4.4, 4.9));

    // the spray / brush head rides on whichever layer is being applied
    let sp: { r: { el: SVGPathElement; L: number } | null; t: number } | null = null;
    if (u > 3.1 && u < 4.4) sp = { r: pu, t: seg(u, 3.1, 4.4) };
    else if (u > 7.8 && u < 8.4) sp = { r: c1, t: seg(u, 7.8, 8.4) };
    else if (u > 8.4 && u < 9.0) sp = { r: c2, t: seg(u, 8.4, 9.0) };
    else if (u > 14.4 && u < 15.4) sp = { r: hdpe, t: seg(u, 14.4, 15.4) };
    if (spray) {
      if (sp?.r && sp.t > 0 && sp.t < 1) {
        const pt = sp.r.el.getPointAtLength(sp.r.L * sp.t);
        spray.setAttribute("cx", `${pt.x}`);
        spray.setAttribute("cy", `${pt.y}`);
        spray.setAttribute("opacity", "1");
      } else spray.setAttribute("opacity", "0");
    }

    // the drop: hangs above the roof, falls in slow motion, hits at u = 5.2
    if (drop) {
      if (u < 5.2) {
        const t = seg(u, 1.2, 5.2);
        const y = lerp(-24, G.roofSurface - 5.6, 0.7 * t + 0.3 * t * t) + (u < 1.2 ? Math.sin(time * 1.6) * 3 : 0);
        drop.setAttribute("transform", `translate(${G.dropX},${y.toFixed(2)}) scale(${k.toFixed(3)})`);
        drop.setAttribute("opacity", "1");
      } else drop.setAttribute("opacity", "0");
    }
    // splash + ripple
    const ps = seg(u, 5.2, 5.65);
    const vxs = [-30, -18, -7, 9, 20, 31];
    const vys = [-26, -36, -42, -40, -32, -22];
    splash.forEach((c, i) => {
      const on = ps > 0 && ps < 1;
      c.setAttribute("cx", `${G.dropX + vxs[i]! * ps}`);
      c.setAttribute("cy", `${G.roofSurface + vys[i]! * ps + 60 * ps * ps}`);
      c.setAttribute("opacity", on ? `${1 - ps}` : "0");
      c.setAttribute("r", `${1.5 * Math.min(k, 1.8)}`);
    });
    if (ripple) {
      const pr = seg(u, 5.2, 5.8);
      ripple.setAttribute("rx", `${pr * 30}`);
      ripple.setAttribute("ry", `${pr * 3.2}`);
      ripple.setAttribute("opacity", pr > 0 && pr < 1 ? `${1 - pr}` : "0");
    }
    // bead runs to the outlet and down the pipe
    if (bead) {
      let bx = G.dropX;
      let by = G.roofSurface - 2.6;
      let o = 0;
      if (u >= 5.35 && u < 7.4) {
        o = 1;
        if (u < 6.2) bx = lerp(G.dropX, 1078, easeOut(seg(u, 5.35, 6.2)) * 0.6 + seg(u, 5.35, 6.2) * 0.4);
        else if (u < 6.5) {
          const t = seg(u, 6.2, 6.5);
          bx = lerp(1078, G.pipeX, t);
          by = lerp(G.roofSurface - 2.6, 116, t);
        } else {
          const t = seg(u, 6.5, 7.4);
          bx = G.pipeX;
          by = lerp(116, 784, t * t);
          o = 1 - seg(u, 7.2, 7.4);
        }
      }
      bead.setAttribute("cx", `${bx}`);
      bead.setAttribute("cy", `${by}`);
      bead.setAttribute("r", `${2.8 * k}`);
      bead.setAttribute("opacity", `${o}`);
    }

    // rain (clock-driven), heavy at the start, gone once we are indoors
    const rainI = 1 - seg(u, 6.0, 6.9);
    rainG.setAttribute("opacity", `${rainI}`);
    if (rainI > 0) {
      for (const d of rain) {
        const span = d.floor + 700;
        const y = ((d.y0 + time * d.v) % span) - 700;
        d.el.setAttribute("x1", `${d.x}`);
        d.el.setAttribute("y1", `${y}`);
        d.el.setAttribute("x2", `${d.x - 1.6}`);
        d.el.setAttribute("y2", `${y - 18}`);
        d.el.setAttribute("stroke-opacity", `${d.o * clamp((d.floor - y) / 30)}`);
      }
    }

    // ── 02 bathroom
    set(c1, seg(u, 7.8, 8.4));
    set(c2, seg(u, 8.4, 9.0));
    if (screed) {
      const h = 14 * easeOut(seg(u, 9.0, 9.4));
      screed.setAttribute("y", `${434 - h}`);
      screed.setAttribute("height", `${h}`);
    }
    tiles.forEach((t, i) => {
      const p = easeOut(seg(u, 9.4 + i * 0.06, 9.4 + i * 0.06 + 0.26));
      t.setAttribute("transform", `translate(0,${(-26 * (1 - p)).toFixed(2)})`);
      t.setAttribute("opacity", `${p}`);
    });
    fixtures?.setAttribute("opacity", `${seg(u, 9.9, 10.2)}`);
    trap?.setAttribute("opacity", `${seg(u, 9.3, 9.6)}`);
    const showerI = win(u, 10.2, 11.9, 0.15);
    showerG.setAttribute("opacity", `${showerI}`);
    if (showerI > 0) {
      for (const d of shower) {
        const span = 170;
        const t = ((d.y0 + time * d.v) % span) / span;
        const y = 246 + t * 168;
        const x = d.x + d.sp * t;
        d.el.setAttribute("x1", `${x}`);
        d.el.setAttribute("y1", `${y}`);
        d.el.setAttribute("x2", `${x - d.sp * 0.03}`);
        d.el.setAttribute("y2", `${y - 7}`);
      }
    }
    film?.setAttribute("opacity", `${0.75 * win(u, 10.4, 11.9, 0.2)}`);
    seep.forEach((d, i) => {
      const a = 10.45 + i * 0.12;
      let x = d.x;
      let y = 414;
      let o = 0;
      if (u > a && u < 11.7) {
        o = 1 - seg(u, 11.4, 11.7);
        y = lerp(414, 432.6, easeOut(seg(u, a, a + 0.5)));
        x = lerp(d.x, 980, ease(seg(u, a + 0.5, a + 1.0)));
      }
      d.el.setAttribute("cx", `${x}`);
      d.el.setAttribute("cy", `${y}`);
      d.el.setAttribute("opacity", `${o}`);
    });

    // ── soak pit → ground
    const percI = win(u, 12.0, 14.0, 0.3);
    percG.setAttribute("opacity", `${percI}`);
    if (percI > 0) {
      for (const d of perc) {
        const t = (d.y0 + time * d.v) % 1;
        d.el.setAttribute("cx", `${d.x + Math.sin(time * 1.3 + d.w + t * 6) * 5}`);
        d.el.setAttribute("cy", `${812 + t * 190}`);
        d.el.setAttribute("opacity", `${Math.sin(t * Math.PI) * 0.9}`);
      }
    }

    // ── 03 basement
    const level = lerp(1500, 962, ease(seg(u, 13.4, 14.3)));
    wt?.setAttribute("transform", `translate(0,${level.toFixed(2)})`);
    wtWave?.setAttribute("transform", `translate(${-((time * 12) % 64)},0)`);
    wet?.setAttribute("opacity", `${seg(u, 13.9, 14.5) * (1 - seg(u, 15.0, 15.7))}`);
    set(hdpe, seg(u, 14.4, 15.4));
    set(board, seg(u, 15.3, 15.7));
    set(boardL, seg(u, 15.3, 15.7));
    const arrI = win(u, 15.5, 17.4, 0.3);
    arrows?.setAttribute("opacity", `${arrI}`);
    if (arrI > 0) {
      arrowEls.forEach((a, i) => {
        const p = easeOut(seg(u, 15.5 + i * 0.07, 16.1 + i * 0.07));
        const wob = Math.sin(time * 3 + i) * 1.5;
        a.setAttribute("transform", `translate(${(60 * (1 - p) + wob).toFixed(2)},0)`);
      });
    }

    // ── 04 sump
    tankWave?.setAttribute("transform", `translate(${-((time * 8) % 40)},${G.sWater})`);
    micro?.setAttribute("opacity", `${seg(u, 18.3, 18.75) * (1 - seg(u, 20.6, 21.2))}`);
    const inflow = ease(seg(u, 18.8, 19.5)) * 0.62 - ease(seg(u, 19.8, 20.4)) * 0.48;
    pores.forEach((p, i) => {
      const f = clamp(inflow - i * 0.03, 0, 1);
      p.el.style.strokeDasharray = `${(p.L * f).toFixed(2)} 999`;
    });
    for (const c of crystals) {
      const g = easeOut(seg(u, c.at, c.at + 0.4));
      c.el.setAttribute("transform", `translate(${c.el.dataset.x},${c.el.dataset.y}) scale(${g.toFixed(3)})`);
    }
    sumpTint?.setAttribute("opacity", `${seg(u, 20.2, 20.9)}`);

    return view;
  }

  /** remove what this engine added to the drawing (effects can mount twice in development) */
  function destroy() {
    for (const g of [rainG, showerG, percG, seepG, crystG]) g.replaceChildren();
  }

  return {
    render,
    destroy,
    project: (x: number, y: number): [number, number] => [(x - view.x) * view.s, (y - view.y) * view.s],
  };
}
