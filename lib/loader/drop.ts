/**
 * Opening screen for the home page: concrete that has been waterproofed, out in
 * the rain. Drops land and bead up on the sealed surface instead of soaking in;
 * the larger beads run down, gathering the small ones and leaving a trail of
 * droplets. Once the page is ready the water runs off: a wet edge drains down
 * the screen, sweeping the beads with it, and the page is left behind, dry.
 *
 * The concrete (made from noise) and the bead (a rendered sprite) are RPC's
 * own pictures, not photographs. Plain markup and one mount function, so the
 * server renders the wet concrete and nothing of the page shows before it.
 * Three type sizes only, like the site: everything here is the paragraph size.
 */

export interface DropProgress {
  /** share of the page's pictures loaded, 0 … 1 */
  share: number;
  /** everything is in */
  done: boolean;
}
export interface DropOptions {
  getProgress: () => DropProgress | null | undefined;
  /** the water starts to run off: the page underneath can start */
  onStart?: () => void;
  /** the same moment, for whatever should begin as the screen goes */
  onReveal?: () => void;
  /** the screen has gone */
  onGone?: () => void;
  /** what the page under the screen looks like at the top, for the nav bar once the water uncovers it */
  pageTone?: "light" | "dark";
}

/** set once the full opening has played, so a return in the same visit is quicker */
const INTRO_KEY = "rpc-drop-intro";
/** the rain shows for at least this long, so the beading is seen */
const MIN_MS = 1500;
const MIN_MS_RETURN = 550;
/** after this the water runs off whether the page is ready or not */
const MAX_MS = 9000;
/** the run-off, from the top of the screen to the bottom */
const DRAIN_MS = 1150;
const DRAIN_MS_RETURN = 800;
const FADE_MS = 300;

const CONCRETE = "/media/loader-concrete.webp";
const BEAD = "/media/loader-bead.webp";
/** the bead sprite: its footprint radius as a share of the sprite's size */
const BEAD_R = 92 / 256;
/** the sealer's darker tone over the concrete, and its sheen */
const TINT = "rgba(11,29,43,.46)";
const SHEEN_DEG = 118;
const SHEEN = "rgba(255,255,255,.075)";

export function dropLoaderMarkup(): string {
  return `<div class="dl" role="status" aria-label="Loading" data-nav-tone="dark">
  <span class="dl-sr">Loading the page</span>
  <canvas class="dl-cv" aria-hidden="true"></canvas>
  <canvas class="dl-wet" aria-hidden="true"></canvas>
  <p class="dl-meta" aria-hidden="true">Loading <span data-dl-pct>0</span>%</p>
</div>`;
}

export const DROP_CSS = `
.dl{position:fixed;inset:0;z-index:80;overflow:hidden;background:linear-gradient(${SHEEN_DEG}deg,${SHEEN},rgba(255,255,255,0) 46%),linear-gradient(${TINT},${TINT}),#7b7b79 url(${CONCRETE}) 50% 50%/cover no-repeat;color:#eef3f5;font-family:var(--font-inter-tight),ui-sans-serif,system-ui,sans-serif;font-size:var(--fs-body,1rem);transition:opacity ${FADE_MS}ms ease}
.dl.is-live{background:none}
.dl.is-done{opacity:0}
.dl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.dl-cv,.dl-wet{position:absolute;inset:0;width:100%;height:100%;display:block}
.dl-meta{position:absolute;right:var(--gutter,1.25rem);bottom:clamp(1rem,3.2vh,2rem);margin:0;line-height:1.4;font-variant-numeric:tabular-nums;opacity:0;text-shadow:0 1px 2px rgba(0,0,0,.45);transition:opacity .3s ease}
.dl.is-waiting .dl-meta{opacity:.8}
`;

type Bead = {
  x: number;
  y: number;
  /** footprint radius, CSS px */
  r: number;
  vx: number;
  vy: number;
  run: boolean;
  /** when it landed, for the little impact */
  born: number;
  /** distance run since it last left a droplet behind */
  trail: number;
  /** in the run-off: when this bead lets go */
  letGo: number;
  gone: boolean;
};

/** runs the screen: rain on sealed concrete, then the run-off that uncovers the page */
export function mountDropLoader(root: HTMLElement, opts: DropOptions) {
  const el = root.querySelector<HTMLElement>(".dl");
  if (!el) return () => {};
  const cv = el.querySelector<HTMLCanvasElement>(".dl-cv");
  const wet = el.querySelector<HTMLCanvasElement>(".dl-wet");
  const pctEl = el.querySelector<HTMLElement>("[data-dl-pct]");
  const cx = cv?.getContext("2d") ?? null;
  const wx = wet?.getContext("2d") ?? null;
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
  let finishing = false;
  let released = false;

  // sizes: CSS pixels, and the canvases' pixels per CSS pixel
  let W = window.innerWidth;
  let H = window.innerHeight;
  let px = Math.min(1.75, window.devicePixelRatio || 1);
  const fit = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    px = Math.min(1.75, window.devicePixelRatio || 1);
    for (const c of [cv, wet]) {
      if (!c) continue;
      c.width = Math.round(W * px);
      c.height = Math.round(H * px);
    }
  };

  // the sealed concrete, drawn exactly as the stylesheet draws it, so the switch is invisible
  const concrete = new Image();
  concrete.decoding = "async";
  const bead = new Image();
  bead.decoding = "async";
  const paintCover = () => {
    if (!cx || !cv) return;
    const w = cv.width;
    const h = cv.height;
    cx.globalCompositeOperation = "source-over";
    cx.fillStyle = "#7b7b79";
    cx.fillRect(0, 0, w, h);
    if (concrete.naturalWidth) {
      const s = Math.max(w / concrete.naturalWidth, h / concrete.naturalHeight);
      const dw = concrete.naturalWidth * s;
      const dh = concrete.naturalHeight * s;
      cx.drawImage(concrete, (w - dw) / 2, (h - dh) / 2, dw, dh);
    }
    cx.fillStyle = TINT;
    cx.fillRect(0, 0, w, h);
    // the CSS gradient line: through the centre at the given angle, long enough to reach the corners
    const a = (SHEEN_DEG * Math.PI) / 180;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const len = Math.abs(w * dx) + Math.abs(h * dy);
    const g = cx.createLinearGradient(w / 2 - (dx * len) / 2, h / 2 - (dy * len) / 2, w / 2 + (dx * len) / 2, h / 2 + (dy * len) / 2);
    g.addColorStop(0, SHEEN);
    g.addColorStop(0.46, "rgba(255,255,255,0)");
    cx.fillStyle = g;
    cx.fillRect(0, 0, w, h);
  };
  const ready = (img: HTMLImageElement) =>
    img.complete && img.naturalWidth > 0 ? Promise.resolve() : img.decode().catch(() => undefined);
  concrete.src = CONCRETE;
  bead.src = BEAD;
  let prepared = false;
  const canRain = !!cx && !!wx;
  Promise.all([ready(concrete), ready(bead)]).then(() => {
    if (!alive) return;
    if (canRain) {
      fit();
      paintCover();
      el.classList.add("is-live");
    }
    prepared = true;
  });

  /* ---------- the water ---------- */
  let beads: Bead[] = [];
  const rnd = Math.random;
  const area = () => (W * H) / 1e6; // in megapixels of CSS px
  /** the size beads start to run at, and gravity, in CSS px */
  const RUN_R = 7.5;
  const G = 1500;
  const newBead = (x: number, y: number, r: number, now: number): Bead => ({ x, y, r, vx: 0, vy: 0, run: false, born: now, trail: 0, letGo: 0, gone: false });
  const merge = (a: Bead, b: Bead) => {
    // volumes add; the merged bead sits nearer the larger one
    const va = a.r ** 3;
    const vb = b.r ** 3;
    a.x = (a.x * va + b.x * vb) / (va + vb);
    a.y = (a.y * va + b.y * vb) / (va + vb);
    a.r = Math.cbrt(va + vb);
    a.vy = Math.max(a.vy, b.vy);
    b.gone = true;
  };
  /** a size for a raindrop's bead: mostly small, a few larger */
  const dropSize = () => (rnd() < 0.08 ? 5 + rnd() * 4 : 1.3 + Math.pow(rnd(), 2) * 5.5);
  const seed = (now: number) => {
    const n = Math.round(230 * area());
    for (let i = 0; i < n; i++) beads.push(newBead(rnd() * W, rnd() * H, dropSize() * 0.9, now + rnd() * 450));
  };

  // a coarse grid, so beads only check the ones near them
  const CELL = 28;
  let grid = new Map<number, Bead[]>();
  const key = (x: number, y: number) => Math.floor(x / CELL) + Math.floor(y / CELL) * 4096;
  const rebuild = () => {
    grid = new Map();
    for (const b of beads) {
      if (b.gone) continue;
      const k = key(b.x, b.y);
      const list = grid.get(k);
      if (list) list.push(b);
      else grid.set(k, [b]);
    }
  };
  const near = (b: Bead, f: (o: Bead) => void) => {
    const gx = Math.floor(b.x / CELL);
    const gy = Math.floor(b.y / CELL);
    const span = Math.ceil((b.r + 12) / CELL);
    for (let j = gy - span; j <= gy + span; j++)
      for (let i = gx - span; i <= gx + span; i++) {
        const list = grid.get(i + j * 4096);
        if (list) for (const o of list) if (o !== b && !o.gone) f(o);
      }
  };
  const land = (now: number) => {
    const b = newBead(rnd() * W, rnd() * H * 1.02, dropSize(), now);
    near(b, (o) => {
      if (!b.gone && Math.hypot(o.x - b.x, o.y - b.y) < (o.r + b.r) * 0.82) merge(o.r >= b.r ? o : b, o.r >= b.r ? b : o);
    });
    if (!b.gone) beads.push(b);
  };

  /* ---------- the run-off ---------- */
  let draining = false;
  let drainAt = 0;
  let edge = -60;
  const ph = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
  const edgeAt = (x: number) => edge + Math.sin(x / 190 + ph[0]!) * 11 + Math.sin(x / 61 + ph[1]!) * 5 + Math.sin(x / 23 + ph[2]!) * 1.6;
  const release = () => {
    if (released) return;
    released = true;
    opts.onStart?.();
    opts.onReveal?.();
  };
  const drain = (now: number) => {
    if (draining) return;
    draining = true;
    drainAt = now;
    // every bead lets go at its own moment, the larger ones first
    for (const b of beads) b.letGo = now + rnd() * 420 * (1.2 - Math.min(1, b.r / 8));
    release();
  };
  const finish = () => {
    if (finishing) return;
    finishing = true;
    release();
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* fine: the next visit plays the full opening */
    }
    el.classList.add("is-done");
    timers.push(window.setTimeout(() => alive && opts.onGone?.(), FADE_MS + 40));
    cancelAnimationFrame(raf);
  };

  /* ---------- drawing ---------- */
  const drawBeads = (now: number) => {
    if (!wx || !wet) return;
    wx.setTransform(1, 0, 0, 1, 0, 0);
    wx.clearRect(0, 0, wet.width, wet.height);
    wx.setTransform(px, 0, 0, px, 0, 0);
    wx.imageSmoothingQuality = "high";
    const k = 1 / BEAD_R;
    for (const b of beads) {
      if (b.gone) continue;
      const age = now - b.born;
      if (age < 0) continue;
      // a fresh drop lands with a little spread and settles; a running one stretches
      const spread = age < 140 ? 1 + 0.35 * (1 - age / 140) : 1;
      const stretch = b.run ? 1 + Math.min(0.45, b.vy / 1400) : 1;
      const sx = (spread / Math.sqrt(stretch)) * b.r;
      const sy = spread * stretch * b.r;
      wx.globalAlpha = age < 70 ? age / 70 : 1;
      wx.drawImage(bead, b.x - sx * k, b.y - sy * k + (stretch - 1) * b.r * 0.5, 2 * sx * k, 2 * sy * k);
    }
    wx.globalAlpha = 1;
    if (draining) {
      // the water's front: a darker wet band with a bright line along its edge
      const step = 6;
      wx.beginPath();
      for (let x = -step; x <= W + step; x += step) {
        const y = edgeAt(x);
        if (x === -step) wx.moveTo(x, y);
        else wx.lineTo(x, y);
      }
      // a soft wet shadow just below the edge, then the thin bright lip of the water
      wx.save();
      wx.translate(0, 5);
      for (const [width, alpha] of [[16, 0.07], [9, 0.09], [4, 0.12]] as const) {
        wx.strokeStyle = `rgba(3,10,16,${alpha})`;
        wx.lineWidth = width;
        wx.stroke();
      }
      wx.restore();
      wx.strokeStyle = "rgba(230,242,248,.5)";
      wx.lineWidth = 1.4;
      wx.stroke();
    }
  };

  /** uncovers the page above the water's edge */
  const uncover = () => {
    if (!cx) return;
    cx.save();
    cx.setTransform(px, 0, 0, px, 0, 0);
    cx.globalCompositeOperation = "destination-out";
    cx.fillStyle = "#000";
    cx.beginPath();
    cx.moveTo(-10, -10);
    const step = 6;
    for (let x = -step; x <= W + step; x += step) cx.lineTo(x, edgeAt(x) - 1);
    cx.lineTo(W + 10, -10);
    cx.closePath();
    cx.fill();
    cx.restore();
  };

  /* ---------- the loop ---------- */
  let last = start;
  let rainDebt = 0;
  let seeded = false;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const t = now - start;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    const p = opts.getProgress() ?? { share: 0, done: false };
    const done = p.done || t > MAX_MS;
    // the share loaded shows only when the page is slow, after the rain has had its time
    if (!done && pctEl) pctEl.textContent = String(Math.min(99, Math.round(p.share * 100)));
    el.classList.toggle("is-waiting", !done && t > MIN_MS);
    if (!prepared) {
      if (t > MAX_MS) finish();
      return;
    }
    if (!canRain) {
      if (done) finish();
      return;
    }
    if (!seeded) {
      seeded = true;
      seed(now);
    }
    const minMs = reduced ? 0 : quick ? MIN_MS_RETURN : MIN_MS;
    if (done && t > minMs) {
      // reduced motion: no run-off, the screen simply fades
      if (reduced) {
        drawBeads(now);
        finish();
        return;
      }
      drain(now);
    }

    if (!reduced) {
      // rain, until the run-off starts
      if (!draining) {
        rainDebt += dt * 34 * area();
        while (rainDebt >= 1) {
          rainDebt -= 1;
          land(now);
        }
      }
      rebuild();
      if (draining) {
        const k = Math.min(1, (now - drainAt) / (quick ? DRAIN_MS_RETURN : DRAIN_MS));
        // the edge eases in, then runs off the bottom
        edge = -60 + (H + 140) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
      }
      for (const b of beads) {
        if (b.gone || now < b.born) continue;
        if (draining && now > b.letGo) b.run = true;
        if (!b.run && b.r > RUN_R) b.run = true;
        if (draining) {
          // the water's front gathers whatever it reaches
          const e = edgeAt(b.x);
          if (b.y < e + b.r * 0.4) {
            b.y = e + b.r * 0.4;
            b.run = true;
            b.vy = Math.max(b.vy, 260);
          }
        }
        if (!b.run) continue;
        const pull = draining ? 1.9 : Math.min(1.6, 0.35 + (b.r - RUN_R) / 6);
        b.vy = Math.min(draining ? 1500 : 650, b.vy + G * pull * dt);
        b.vx += (rnd() - 0.5) * 60 * dt;
        b.vx *= 0.9;
        const dy = b.vy * dt;
        b.y += dy;
        b.x += b.vx * dt;
        // a running bead leaves small droplets behind, and gathers the ones it meets
        b.trail += dy;
        if (b.trail > 16 && b.r > 3) {
          b.trail = 0;
          if (rnd() < 0.55) {
            const tr = 0.7 + rnd() * 0.9;
            b.r = Math.cbrt(Math.max(1, b.r ** 3 - tr ** 3));
            beads.push(newBead(b.x + (rnd() - 0.5) * 2, b.y - b.r * 1.1, tr, now));
          }
        }
        near(b, (o) => {
          if (!b.gone && !o.gone && Math.hypot(o.x - b.x, o.y - b.y) < (o.r + b.r) * 0.85) merge(b, o);
        });
        if (b.y - b.r * 3 > H) b.gone = true;
      }
      beads = beads.filter((b) => !b.gone);
      if (draining) {
        uncover();
        // the top is dry again: the bar over it can turn dark-on-light, as on the page
        if (edge > 96) el.dataset.navTone = opts.pageTone ?? "light";
      }
    }
    drawBeads(now);
    if (draining && edge > H + 60) finish();
  };
  raf = requestAnimationFrame(loop);

  // a window resized before the run-off: the canvases follow it
  const onResize = () => {
    if (!draining && prepared && canRain) {
      fit();
      paintCover();
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
