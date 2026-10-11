/**
 * Opening screen for the home page: bare concrete, and a roller laying a
 * waterproof coat across it in a few passes, each pass uncovering the page
 * underneath, the way a fresh coat goes over a slab. The first pass starts
 * as soon as the screen is up; the rest wait for the page's pictures, so the
 * page is ready by the time it is uncovered. A small line at the foot gives
 * the share loaded while there is a wait.
 *
 * The concrete and the roller are RPC's own pictures (made from noise, and a
 * 3D render), not photographs. Plain markup and one mount function, so the
 * server renders the concrete and nothing of the page shows before it. Three
 * type sizes only, like the site: everything here is the paragraph size.
 */

export interface DropProgress {
  /** share of the page's pictures loaded, 0 … 1 */
  share: number;
  /** everything is in */
  done: boolean;
}
export interface DropOptions {
  getProgress: () => DropProgress | null | undefined;
  /** the first pass starts: the page underneath can start */
  onStart?: () => void;
  /** the last pass starts: what should begin as the screen goes can start */
  onReveal?: () => void;
  /** the screen has gone */
  onGone?: () => void;
}

/** set once the full opening has played, so a return in the same visit is quicker */
const INTRO_KEY = "rpc-drop-intro";
/** after this, the passes go on whether the page is ready or not */
const MAX_MS = 9000;
/** one pass across a 1440px wide screen (shorter screens are a little quicker) */
const PASS_MS = 760;
const PASS_MS_RETURN = 460;
const FADE_MS = 380;

const CONCRETE = "/media/loader-concrete.webp";
const ROLLER = "/media/loader-roller.webp";
const ROLLER_M = "/media/loader-roller-m.webp";
/** the roller picture: its size, and where the cover sits in it, as shares of that size */
const SPRITE = { w: 1138, h: 1068, coverX: 0.8418, coverTop: 0.0234, coverBottom: 0.8792, coverW: 0.1793 };

export function dropLoaderMarkup(): string {
  return `<div class="dl" role="status" aria-label="Loading" data-nav-tone="dark">
  <span class="dl-sr">Loading the page</span>
  <canvas class="dl-cv" aria-hidden="true"></canvas>
  <img class="dl-roller" src="${ROLLER}" srcset="${ROLLER_M} ${SPRITE.w / 2}w, ${ROLLER} ${SPRITE.w}w" sizes="(max-width: 767px) 80vw, 520px" width="${SPRITE.w}" height="${SPRITE.h}" alt="" aria-hidden="true" decoding="async" fetchpriority="high">
  <p class="dl-meta" aria-hidden="true">Loading <span data-dl-pct>0</span>%</p>
</div>`;
}

export const DROP_CSS = `
.dl{position:fixed;inset:0;z-index:80;overflow:hidden;background:#7b7b79 url(${CONCRETE}) 50% 50%/cover no-repeat;color:#f3f5f5;font-family:var(--font-inter-tight),ui-sans-serif,system-ui,sans-serif;font-size:var(--fs-body,1rem);transition:opacity ${FADE_MS}ms ease}
.dl.is-live{background:none}
.dl.is-done{opacity:0}
.dl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.dl-cv{position:absolute;inset:0;width:100%;height:100%;display:block}
.dl-roller{position:absolute;left:0;top:0;max-width:none;height:auto;transform:translate3d(-300vw,0,0);transform-origin:50% 50%;will-change:transform;pointer-events:none;user-select:none}
.dl-meta{position:absolute;right:var(--gutter,1.25rem);bottom:clamp(1rem,3.2vh,2rem);margin:0;line-height:1.4;font-variant-numeric:tabular-nums;text-shadow:0 1px 2px rgba(0,0,0,.45);transition:opacity .3s ease}
.dl.is-ready .dl-meta,.dl.is-last .dl-meta{opacity:0}
@media (prefers-reduced-motion:reduce){.dl-roller{display:none}}
`;

/** a small seeded random, so each pass gets its own edge */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * One pass of coat, as a mask (where the coat uncovers the page) and a shade
 * (the thin shadow its edge casts on the concrete): a band with slightly wavy
 * edges and a few dry streaks along them, where the coat is thinner. `w` and `h`
 * are in canvas pixels; `px` is the canvas pixels per CSS pixel.
 */
function coatMask(w: number, h: number, px: number, seed: number) {
  const mask = document.createElement("canvas");
  const shade = document.createElement("canvas");
  mask.width = shade.width = w;
  mask.height = shade.height = h;
  const g = mask.getContext("2d");
  const s = shade.getContext("2d");
  if (!g || !s) return { mask, shade };
  const r = random(seed);
  const ph = Array.from({ length: 6 }, () => r() * Math.PI * 2);
  const wave = (x: number, k: number) =>
    (Math.sin(x / (230 * px) + ph[k]!) * 5 + Math.sin(x / (83 * px) + ph[k + 1]!) * 2.2 + Math.sin(x / (29 * px) + ph[k + 2]!) * 0.9) * px;
  const inset = 10 * px;
  const step = 4 * px;
  const topAt = (x: number) => inset + wave(x, 0);
  const bottom: [number, number][] = [];
  for (let x = w + step; x >= -step; x -= step) bottom.push([x, h - inset - wave(x, 3) + (r() - 0.5) * 0.8 * px]);
  g.beginPath();
  g.moveTo(-step, topAt(-step));
  for (let x = 0; x <= w + step; x += step) g.lineTo(x, topAt(x) + (r() - 0.5) * 0.8 * px);
  for (const [x, y] of bottom) g.lineTo(x, y);
  g.closePath();
  g.fillStyle = "#fff";
  g.fill();
  // dry streaks along the edges: the coat a little thinner there
  g.globalCompositeOperation = "destination-out";
  g.strokeStyle = "#000";
  g.lineCap = "round";
  for (let i = 0; i < 24; i++) {
    const top = r() < 0.5;
    const d = (3 + Math.pow(r(), 1.4) * 8) * px;
    const x0 = r() * w;
    const len = (30 + r() * 170) * px;
    const y = top ? topAt(x0) + d : h - inset - wave(x0, 3) - d;
    g.globalAlpha = 0.04 + r() * 0.1;
    g.lineWidth = (1.5 + r() * 2.5) * px;
    g.beginPath();
    g.moveTo(x0, y);
    g.lineTo(x0 + len, y + (r() - 0.5) * 1.5 * px);
    g.stroke();
  }
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  // the edge's shadow on the concrete, just below the coat: a few soft strokes
  s.lineJoin = "round";
  for (const [width, alpha, dy] of [[7, 0.05, 3.5], [4.5, 0.08, 2.6], [2.2, 0.13, 1.8]] as const) {
    s.strokeStyle = `rgba(8,14,20,${alpha})`;
    s.lineWidth = width * px;
    s.beginPath();
    bottom.forEach(([x, y], i) => (i ? s.lineTo(x, y + dy * px) : s.moveTo(x, y + dy * px)));
    s.stroke();
  }
  return { mask, shade };
}

/** runs the screen: paints the concrete, rolls the passes as the page loads, then lets go */
export function mountDropLoader(root: HTMLElement, opts: DropOptions) {
  const el = root.querySelector<HTMLElement>(".dl");
  if (!el) return () => {};
  const cv = el.querySelector<HTMLCanvasElement>(".dl-cv");
  const roller = el.querySelector<HTMLImageElement>(".dl-roller");
  const pctEl = el.querySelector<HTMLElement>("[data-dl-pct]");
  const ctx = cv?.getContext("2d") ?? null;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let quick = false;
  try {
    quick = sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    /* storage unavailable: play the full opening */
  }
  window.scrollTo(0, 0);

  const start = performance.now();
  let alive = true;
  let raf = 0;
  const timers: number[] = [];
  let started = false;
  let revealed = false;
  let finishing = false;

  // sizes: CSS pixels, and the canvas's pixels per CSS pixel
  let W = window.innerWidth;
  let H = window.innerHeight;
  let px = Math.min(1.75, window.devicePixelRatio || 1);
  const fit = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    px = Math.min(1.75, window.devicePixelRatio || 1);
    if (cv) {
      cv.width = Math.round(W * px);
      cv.height = Math.round(H * px);
    }
  };

  // the concrete, drawn exactly as the stylesheet draws it (cover, centred), so the switch is invisible
  const concrete = new Image();
  concrete.decoding = "async";
  const paintConcrete = () => {
    if (!ctx || !cv) return;
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    if (concrete.naturalWidth) {
      const s = Math.max(cv.width / concrete.naturalWidth, cv.height / concrete.naturalHeight);
      const dw = concrete.naturalWidth * s;
      const dh = concrete.naturalHeight * s;
      ctx.drawImage(concrete, (cv.width - dw) / 2, (cv.height - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = "#7b7b79";
      ctx.fillRect(0, 0, cv.width, cv.height);
    }
  };
  const ready = (img: HTMLImageElement) =>
    img.complete && img.naturalWidth > 0 ? Promise.resolve() : img.decode().catch(() => undefined);
  concrete.src = CONCRETE;
  let prepared = false;
  const canRoll = !reduced && !!ctx && !!roller;
  Promise.all([ready(concrete), roller ? ready(roller) : Promise.resolve()]).then(() => {
    if (!alive) return;
    if (canRoll) {
      fit();
      paintConcrete();
      el.classList.add("is-live");
    }
    prepared = true;
  });

  /* ---------- the passes ---------- */
  type Pass = { top: number; mid: number; h: number; dir: 1 | -1; mask: HTMLCanvasElement | null; shade: HTMLCanvasElement | null; seed: number; from: number; to: number; edge: number; t0: number; ms: number };
  let passes: Pass[] = [];
  let current = -1;
  let sw = 0;
  let sh = 0;
  const plan = () => {
    const target = Math.min(0.36 * H, 0.62 * W);
    const n = Math.max(3, Math.ceil(H / target));
    const step = H / n;
    const bandH = step * 1.24;
    // the roller's cover is as long as the pass is wide
    sh = (bandH * 0.97) / (SPRITE.coverBottom - SPRITE.coverTop);
    sw = (sh * SPRITE.w) / SPRITE.h;
    if (roller) roller.style.width = `${sw}px`;
    const cover = SPRITE.coverW * sw;
    const ms = (quick ? PASS_MS_RETURN : PASS_MS) * (0.55 + 0.45 * Math.min(1.4, W / 1440));
    const seed = Math.floor(Math.random() * 1e9);
    passes = Array.from({ length: n }, (_, i) => {
      const dir: 1 | -1 = i % 2 === 0 ? 1 : -1;
      const mid = step * (i + 0.5);
      const top = mid - bandH / 2;
      // the cover's centre travels from just off one side until the handle has left the other
      const from = dir === 1 ? -cover / 2 - 4 : W + cover / 2 + 4;
      const to = dir === 1 ? W + SPRITE.coverX * sw + 4 : -SPRITE.coverX * sw - 4;
      return { top, mid, h: bandH, dir, mask: null, shade: null, seed: seed + i * 7919, from, to, edge: dir === 1 ? 0 : W, t0: 0, ms };
    });
    shape(passes[0]!);
  };
  /** draws a pass's coat (once): the first before it starts, the others while the first runs */
  const shape = (p: Pass) => {
    if (p.mask) return;
    const m = coatMask(Math.round(W * px), Math.round(p.h * px), px, p.seed);
    p.mask = m.mask;
    p.shade = m.shade;
  };

  /** places the roller with its cover's centre at x on the pass */
  const place = (p: Pass, x: number, t: number) => {
    if (!roller) return;
    const coverMid = SPRITE.coverTop + (SPRITE.coverBottom - SPRITE.coverTop) / 2;
    const left = x - (p.dir === 1 ? SPRITE.coverX : 1 - SPRITE.coverX) * sw;
    const top = p.mid - coverMid * sh + Math.sin(t / 90) * 1.2;
    const tilt = Math.sin(t / 140) * 0.5;
    roller.style.transform = `translate3d(${left.toFixed(1)}px,${top.toFixed(1)}px,0) scaleX(${p.dir}) rotate(${tilt.toFixed(2)}deg)`;
  };
  const hideRoller = () => {
    if (roller) roller.style.transform = "translate3d(-300vw,0,0)";
  };

  /** uncovers the page from the pass's last edge to x */
  const coat = (p: Pass, x: number) => {
    if (!ctx) return;
    const nx = Math.max(0, Math.min(W, x));
    const a = p.dir === 1 ? p.edge : nx;
    const b = p.dir === 1 ? nx : p.edge;
    if (b - a > 0.5 && p.mask && p.shade) {
      ctx.globalCompositeOperation = "destination-out";
      const sx = Math.round(a * px);
      const ex = Math.round(b * px);
      const y = Math.round(p.top * px);
      if (ex > sx) {
        ctx.drawImage(p.mask, sx, 0, ex - sx, p.mask.height, sx, y, ex - sx, p.mask.height);
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(p.shade, sx, 0, ex - sx, p.shade.height, sx, y, ex - sx, p.shade.height);
      }
      ctx.globalCompositeOperation = "source-over";
    }
    p.edge = nx;
  };

  const ease = (t: number) => 0.45 * t + 0.55 * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  const begin = (i: number, now: number) => {
    current = i;
    const p = passes[i]!;
    p.t0 = now;
    if (i === 0 && !started) {
      started = true;
      opts.onStart?.();
    }
    if (i === passes.length - 1 && !revealed) {
      revealed = true;
      el.classList.add("is-last");
      opts.onReveal?.();
    }
  };

  const finish = () => {
    if (finishing) return;
    finishing = true;
    if (!started) {
      started = true;
      opts.onStart?.();
    }
    if (!revealed) {
      revealed = true;
      opts.onReveal?.();
    }
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* fine: the next visit plays the full opening */
    }
    hideRoller();
    el.classList.add("is-done");
    timers.push(window.setTimeout(() => alive && opts.onGone?.(), FADE_MS + 40));
    cancelAnimationFrame(raf);
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const t = now - start;
    const p = opts.getProgress() ?? { share: 0, done: false };
    const done = p.done || t > MAX_MS;
    // the share loaded shows only while there is something to wait for
    if (done) el.classList.add("is-ready");
    else if (pctEl) pctEl.textContent = String(Math.min(99, Math.round(p.share * 100)));
    if (!prepared) {
      if (t > MAX_MS) finish();
      return;
    }
    // no passes (reduced motion, or no canvas): the concrete simply fades once the page is ready
    if (!canRoll) {
      if (done) finish();
      return;
    }
    if (current === -1) {
      plan();
      begin(0, now);
    }
    const pass = passes[current]!;
    // one more pass's coat drawn per frame, ahead of time
    const todo = passes.find((q) => !q.mask);
    if (todo && todo !== pass) shape(todo);
    shape(pass);
    const k = Math.min(1, (now - pass.t0) / pass.ms);
    const x = pass.from + (pass.to - pass.from) * ease(k);
    coat(pass, x);
    place(pass, x, now);
    if (k < 1) return;
    coat(pass, pass.to);
    // the top is coated: the bar over it can turn dark-on-light, as on the page
    if (current === 0) el.dataset.navTone = "light";
    const next = current + 1;
    if (next >= passes.length) {
      finish();
      return;
    }
    // the passes after the first wait for the page, so it is ready when it is uncovered
    if (!done) {
      hideRoller();
      return;
    }
    begin(next, now);
  };
  raf = requestAnimationFrame(loop);

  // a window resized before the passes start: the canvas follows it
  const onResize = () => {
    if (current === -1 && prepared && canRoll) {
      fit();
      paintConcrete();
    }
  };
  window.addEventListener("resize", onResize);

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    timers.forEach((id) => window.clearTimeout(id));
    window.removeEventListener("resize", onResize);
  };
}
