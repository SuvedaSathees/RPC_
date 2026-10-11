/**
 * "The art of waterproofing" — one concrete roof slab, one locked camera.
 *
 * Seven photoreal stills (Google Flow), each an edit of the one before:
 *   S0 slab → S1 crack → S2 PU grout → S3 crystals in the cut face
 *   → S4 liquid membrane → S5 torch-on membrane → S6 water beading off.
 * Every change grows out of the previous image along a precomputed "time
 * map" (the crack travels along itself, grout rises in it, coats spread from
 * the repair, the sheet unrolls), so the whole story plays as one shot.
 *
 * Images are drawn anchored to the bottom-right corner, which stays visible.
 */

export type Img = HTMLImageElement | ImageBitmap;
export const STILLS = 7;
/**
 * The story is told in exactly four scroll steps, one per method. The
 * timeline runs 0 … T and each step is one unit: u = 0 is the opening frame,
 * u = 1 … 4 are the four resting states (01 grout … 04 torch-on, finished).
 */
export const STEPS = 4;
export const T = STEPS;

/**
 * Phones don't step through the story with the scroll: it plays by itself once,
 * like a short film (crack to sealed slab in FILM_S seconds), and the page then
 * scrolls on normally. Shared by the styles and the scripts so they always agree.
 */
export const FILM_MQ = "(max-width: 767px)";
export const FILM_S = 5;

/** copy windows, in timeline units */
export const WINDOWS = {
  hero: [0, 0.3],
  grout: [0.55, 1.45],
  crystal: [1.5, 2.45],
  membrane: [2.5, 3.45],
  torch: [3.5, T + 1],
} as const;
export const CHAPTERS = [WINDOWS.grout, WINDOWS.crystal, WINDOWS.membrane, WINDOWS.torch] as const;

/** growth of still i+1 over still i, in timeline units */
const STAGES: [number, number][] = [
  [0.06, 0.4], // crack (step 1)
  [0.42, 0.85], // grout (step 1)
  [1.12, 1.8], // crystals (step 2)
  [2.12, 2.8], // liquid membrane (step 3)
  [3.1, 3.6], // torch-on (step 4)
  [3.6, 3.88], // water beads (step 4)
];

/** where the slab sits inside every still (image fractions, shadow excluded) */
const SLAB = { l: 0.105, t: 0.24 };
/** the most the camera ever leans in during the story (slow push + crystals) */
const ZOOM_STORY = 1.09;
/** the slab never grows wider than this share of the screen, so there is always air around it */
const MAX_SHARE = 0.7;

/**
 * Side-by-side layout: how much of the screen's left side the copy needs
 * (device px, measured from the page), for the opening headline and for the
 * method chapters. Without it the slab is centred (stacked phone layout).
 */
export interface Clear {
  hero: number;
  story: number;
  /** device px kept free at the top for the navigation */
  top: number;
}

/** where water leaks out of the underside of the crack, as image fractions */
export const LEAK = { x: 0.344, y: 0.645 };

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const win = (u: number, a: number, b: number, f = 0.3) => Math.min(seg(u, a, a + f), 1 - seg(u, b - f, b));

interface Geo {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** a time map: one byte per pixel, when that pixel changes (0 first … 255 last) */
export interface TimeMap {
  w: number;
  h: number;
  data: Uint8ClampedArray;
}

export function readTimeMap(img: Img): TimeMap {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  const data = new Uint8ClampedArray(c.width * c.height);
  for (let i = 0; i < data.length; i++) data[i] = d[i * 4]!;
  return { w: c.width, h: c.height, data };
}

export function createArtEngine(canvas: HTMLCanvasElement, stills: Img[], maps: TimeMap[]) {
  const ctx = canvas.getContext("2d", { alpha: false })!;
  const layer = document.createElement("canvas");
  const lx = layer.getContext("2d")!;
  const maskC = document.createElement("canvas");
  const mx = maskC.getContext("2d")!;
  let maskImg: ImageData | null = null;
  let maskKey = "";

  // water drops leaking from the underside of the crack
  let rs = 9;
  const rnd = () => ((rs = (rs * 16807) % 2147483647) - 1) / 2147483646;
  const drops = Array.from({ length: 7 }, (_, i) => ({ off: i / 7 + rnd() * 0.05, dx: (rnd() - 0.5) * 0.004, r: 0.8 + rnd() * 0.6 }));

  const fit = (img: Img, W: number, H: number, k: number): Geo => {
    const s = Math.max(W / img.width, H / img.height) * k;
    const w = img.width * s;
    const h = img.height * s;
    return { x: W - w, y: H - h, w, h };
  };

  /** threshold a time map into the mask canvas: opaque where the change has happened */
  function buildMask(m: TimeMap, idx: number, p: number, soft = 0.08) {
    const key = `${idx}:${p.toFixed(4)}`;
    if (key === maskKey) return maskC;
    maskKey = key;
    if (maskC.width !== m.w || maskC.height !== m.h) {
      maskC.width = m.w;
      maskC.height = m.h;
      maskImg = null;
    }
    if (!maskImg) maskImg = mx.createImageData(m.w, m.h);
    const out = maskImg.data;
    const edge = p * (1 + soft) * 255;
    const k = 1 / soft;
    for (let i = 0, j = 3; i < m.data.length; i++, j += 4) {
      const a = (edge - m.data[i]!) * k;
      out[j] = a <= 0 ? 0 : a >= 255 ? 255 : a;
    }
    mx.putImageData(maskImg, 0, 0);
    return maskC;
  }

  const edgeCache = new Map<Img, string>();
  function edgeColour(img: Img) {
    let c = edgeCache.get(img);
    if (c) return c;
    const t = document.createElement("canvas");
    t.width = 24;
    t.height = 14;
    const x = t.getContext("2d", { willReadFrequently: true })!;
    x.drawImage(img, 0, 0, 24, 14);
    const d = x.getImageData(0, 0, 3, 14).data;
    let r = 0,
      g = 0,
      b = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i]!;
      g += d[i + 1]!;
      b += d[i + 2]!;
    }
    const n = d.length / 4;
    c = `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
    edgeCache.set(img, c);
    return c;
  }

  /** draw a still, optionally through a mask; a scaled-down still melts into the background */
  function drawStill(img: Img, g: Geo, W: number, H: number, mask?: HTMLCanvasElement, alpha = 1) {
    const small = g.x > 0.5 || g.y > 0.5;
    if (!small && !mask) {
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, g.x, g.y, g.w, g.h);
      ctx.globalAlpha = 1;
      return;
    }
    if (layer.width !== W || layer.height !== H) {
      layer.width = W;
      layer.height = H;
    }
    lx.globalCompositeOperation = "source-over";
    lx.clearRect(0, 0, W, H);
    lx.drawImage(img, g.x, g.y, g.w, g.h);
    if (mask) {
      lx.globalCompositeOperation = "destination-in";
      lx.drawImage(mask, g.x, g.y, g.w, g.h);
    }
    if (small) {
      lx.globalCompositeOperation = "destination-in";
      const fl = lx.createLinearGradient(g.x, 0, g.x + g.w * 0.16, 0);
      fl.addColorStop(0, "rgba(0,0,0,0)");
      fl.addColorStop(1, "rgba(0,0,0,1)");
      lx.fillStyle = fl;
      lx.fillRect(0, 0, W, H);
      const ft = lx.createLinearGradient(0, g.y, 0, g.y + g.h * 0.14);
      ft.addColorStop(0, "rgba(0,0,0,0)");
      ft.addColorStop(1, "rgba(0,0,0,1)");
      lx.fillStyle = ft;
      lx.fillRect(0, 0, W, H);
    }
    lx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = alpha;
    ctx.drawImage(layer, 0, 0);
    ctx.globalAlpha = 1;
  }

  /** a soft diagonal band of light; the bottom-right corner is left untouched */
  function lightSweep(W: number, H: number, t: number, strength: number) {
    const x = lerp(-0.4, 1.4, t) * W;
    const band = W * 0.22;
    const grd = ctx.createLinearGradient(x - band, 0, x + band, H * 0.35);
    grd.addColorStop(0, "rgba(255,255,255,0)");
    grd.addColorStop(0.5, `rgba(255,255,255,${strength})`);
    grd.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.rect(W * 0.86, H * 0.84, W * 0.14, H * 0.16);
    ctx.clip("evenodd");
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  /**
   * @param intro 0 → 1 as the slab first appears out of the white page
   */
  let lastG: Geo = { x: 0, y: 0, w: 1, h: 1 };
  let lastDpr = 1;

  function render(u: number, time: number, W: number, H: number, dpr: number, intro: number, shift = { x: 0, y: 0 }, clear: Clear | null = null) {
    const s0 = stills[0]!;
    // one continuous, slow camera move over the whole story, leaning in for the crystals (step 2)
    const cover = Math.max(W / s0.width, H / s0.height) * s0.width; // image width when it covers the screen
    const zoom = 1 + 0.06 * ease(seg(u, 0, T)) + 0.05 * Math.sin(seg(u, 1.05, 2.95) * Math.PI);
    let base: number;
    if (clear) {
      // beside the copy: the slab's left edge never crosses into the copy, its top stays under the nav
      const aspect = s0.height / s0.width;
      const size = (left: number, z: number) =>
        Math.min(W * MAX_SHARE, (W - left) / ((1 - SLAB.l) * z), (H - clear.top) / ((1 - SLAB.t) * aspect * z)) / cover;
      // a small push-in as the headline gives way to the first method
      base = lerp(size(clear.hero, 1), size(clear.story, ZOOM_STORY), ease(seg(u, 0.05, 0.75)));
    } else {
      base = clamp(W / cover, 0.55, 1); // stacked: the slab fills the width of its box, centred
    }
    const k = base * zoom;
    const g = fit(s0, W, H, k);
    g.x += shift.x * dpr;
    g.y += shift.y * dpr;
    lastG = g;
    lastDpr = dpr;

    // background: the stills' own white, so the slab floats in one continuous space
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = edgeColour(s0);
    ctx.fillRect(0, 0, W, H);

    // the latest finished still, then the next one growing over it
    let i = 0;
    while (i < STAGES.length && u >= STAGES[i]![1]) i++;
    const appear = clamp(intro);
    drawStill(stills[i]!, g, W, H, undefined, appear);
    if (i < STAGES.length) {
      const [a, b] = STAGES[i]!;
      const p = seg(u, a, b);
      if (p > 0 && maps[i]) drawStill(stills[i + 1]!, g, W, H, buildMask(maps[i]!, i, ease(p)), appear);
    }

    // water leaking through the open crack, until the grout seals it
    const leak = seg(u, 0.26, 0.36) * (1 - seg(u, 0.6, 0.72));
    if (leak > 0) {
      const x0 = g.x + LEAK.x * g.w;
      const y0 = g.y + LEAK.y * g.h;
      const fall = g.h * 0.24;
      for (const d of drops) {
        const t = (d.off + time * 0.55) % 1;
        const y = y0 + t * t * fall;
        const x = x0 + d.dx * g.w;
        const r = d.r * dpr * 2.2 * (0.6 + 0.4 * (1 - t));
        ctx.globalAlpha = leak * (1 - t) * 0.85;
        const grd = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
        grd.addColorStop(0, "rgba(255,255,255,0.95)");
        grd.addColorStop(0.5, "rgba(150,175,195,0.75)");
        grd.addColorStop(1, "rgba(90,110,130,0.5)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 0.8, r * (1 + t * 0.8), 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // the finish: a single pass of light across the protected slab
    const sw = seg(u, 3.64, 3.97);
    if (sw > 0 && sw < 1) lightSweep(W, H, sw, 0.42);
  }

  /** image fractions → CSS pixels inside the canvas, for the callouts */
  const project = (fx: number, fy: number): [number, number] => [(lastG.x + fx * lastG.w) / lastDpr, (lastG.y + fy * lastG.h) / lastDpr];

  return { render, project };
}
