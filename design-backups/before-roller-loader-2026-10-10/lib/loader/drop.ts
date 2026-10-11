/**
 * Opening screen for the home page: one roof terrace, pictured at each step of
 * its waterproofing (swept clean, primed, the first coat going on, the second
 * coat finished, then rain running off the sealed slab). The pictures change
 * as the page loads, each fading in over the last; a line under them names the
 * step, with the share loaded. Once everything is in, the last picture holds
 * for a moment and the screen lifts away.
 *
 * The pictures were made with AI (Google Flow, from one picture of the
 * finished terrace, so all five share its camera) and are labelled as such.
 * They are shown whole, at their own proportions, with nothing over their
 * lower right corner, where the maker's mark is.
 *
 * Plain markup and one mount function, so the server renders the screen and
 * nothing of the page shows before it. Three type sizes only, like the site:
 * everything here is the paragraph size.
 */

export interface DropProgress {
  /** share of the page's pictures loaded, 0 … 1 */
  share: number;
  /** everything is in */
  done: boolean;
}
export interface DropOptions {
  getProgress: () => DropProgress | null | undefined;
  /** the screen starts to lift: the page can start */
  onReveal?: () => void;
  /** the screen has gone */
  onGone?: () => void;
}

/** set once the full opening has played, so a return in the same visit is quick */
const INTRO_KEY = "rpc-drop-intro";
const MIN_MS = 2800;
const MIN_MS_RETURN = 900;
const MAX_MS = 9000;
/** how long the page waits, once it is ready, for the last picture to arrive */
const LAST_WAIT_MS = 1200;
const HOLD_MS = 500;
const LIFT_MS = 900;
const FADE_MS = 650;

/** the pictures' own size */
const W = 1376;
const H = 768;
/** each step of the job, from the share of the opening where it starts */
const FRAMES: readonly { at: number; step: string }[] = [
  { at: 0, step: "Cleaning the slab" },
  { at: 0.2, step: "Priming the surface" },
  { at: 0.42, step: "First waterproof coat" },
  { at: 0.66, step: "Second coat" },
  { at: 0.9, step: "Sealed" },
];
const src = (i: number) => `/media/loader-${i + 1}.webp`;
const srcset = (i: number) => `/media/loader-${i + 1}-m.webp ${W / 2}w, ${src(i)} ${W}w`;

export function dropLoaderMarkup(): string {
  const imgs = FRAMES.map((_, i) =>
    i === 0
      ? `<img class="dl-ph is-on" src="${src(i)}" srcset="${srcset(i)}" sizes="(min-width: 1180px) 1040px, 92vw" width="${W}" height="${H}" alt="" decoding="async" fetchpriority="high">`
      : `<img class="dl-ph" data-src="${src(i)}" data-srcset="${srcset(i)}" sizes="(min-width: 1180px) 1040px, 92vw" width="${W}" height="${H}" alt="" decoding="async">`,
  ).join("");
  return `<div class="dl" role="status" aria-label="Loading">
  <span class="dl-sr">Loading the page</span>
  <div class="dl-stage" aria-hidden="true">
    <div class="dl-frame">${imgs}</div>
    <div class="dl-bar"><span data-dl-bar></span></div>
    <div class="dl-row">
      <span class="dl-brand">RPC Constructions</span>
      <span class="dl-step" data-dl-step>${FRAMES[0]!.step}</span>
      <span class="dl-pct"><span data-dl-pct>0</span>%</span>
    </div>
    <p class="dl-ai">Pictures made with AI</p>
  </div>
</div>`;
}

export const DROP_CSS = `
.dl{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:#0b1d2b;color:#ecf2f5;font-family:var(--font-inter-tight),ui-sans-serif,system-ui,sans-serif;font-size:var(--fs-body,1rem);clip-path:inset(0 0 0 0);transition:clip-path ${LIFT_MS}ms cubic-bezier(.76,0,.24,1)}
.dl.is-open{clip-path:inset(0 0 100% 0)}
.dl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.dl-stage{width:min(calc(100vw - 2rem),1040px,calc((100svh - 11rem) * ${(W / H).toFixed(4)}));transition:transform ${LIFT_MS}ms cubic-bezier(.76,0,.24,1),opacity ${Math.round(LIFT_MS * 0.6)}ms ease}
.dl.is-open .dl-stage{transform:translateY(-36px);opacity:0}
.dl-frame{position:relative;aspect-ratio:${W}/${H};overflow:hidden;border-radius:16px;background:#12293a;box-shadow:0 40px 90px -50px rgba(0,0,0,.8)}
.dl-ph{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity ${FADE_MS}ms ease}
.dl-ph.is-on{opacity:1}
.dl-bar{position:relative;height:2px;margin-top:clamp(1rem,2.6svh,1.4rem);background:rgba(236,242,245,.14);overflow:hidden;border-radius:2px}
.dl-bar span{position:absolute;inset:0;background:#4cc9d9;transform-origin:0 50%;transform:scaleX(0)}
.dl-row{display:grid;grid-template-columns:1fr auto auto;align-items:baseline;gap:1.25rem;margin-top:.8rem;line-height:1.4}
.dl-brand{font-weight:600;letter-spacing:.01em}
.dl-step{color:rgba(236,242,245,.75)}
.dl-pct{min-width:4ch;text-align:right;font-variant-numeric:tabular-nums;color:#4cc9d9;font-weight:600}
.dl.is-sealed .dl-step{color:#4cc9d9}
.dl-ai{margin:.3rem 0 0;color:rgba(236,242,245,.45)}
@media (max-width:560px){
  .dl-frame{border-radius:12px}
  .dl-row{grid-template-columns:1fr auto;row-gap:.25rem}
  .dl-step{grid-column:1;grid-row:2}
  .dl-pct{grid-row:1/span 2;align-self:center}
}
@media (prefers-reduced-motion:reduce){
  .dl{transition:opacity .45s ease}
  .dl.is-open{clip-path:inset(0 0 0 0);opacity:0}
  .dl.is-open .dl-stage{transform:none}
  .dl-ph{transition:none}
}
`;

/** runs the screen: follows the loading through the five pictures, holds the last, lifts */
export function mountDropLoader(root: HTMLElement, opts: DropOptions) {
  const el = root.querySelector<HTMLElement>(".dl");
  if (!el) return () => {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const imgs = Array.from(el.querySelectorAll<HTMLImageElement>(".dl-ph"));
  const bar = el.querySelector<HTMLElement>("[data-dl-bar]");
  const pctEl = el.querySelector<HTMLElement>("[data-dl-pct]");
  const stepEl = el.querySelector<HTMLElement>("[data-dl-step]");
  const ready = (img: HTMLImageElement | undefined) => !!img && img.complete && img.naturalWidth > 0;

  // the other pictures load once the first is in, so it comes first; with reduced
  // motion the first one stays, without the sequence
  const loadRest = () =>
    imgs.slice(1).forEach((img) => {
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      if (img.dataset.src) img.src = img.dataset.src;
    });
  const first = imgs[0];
  if (reduced && stepEl) stepEl.textContent = "";
  if (!reduced) {
    if (first && !ready(first)) {
      first.addEventListener("load", loadRest, { once: true });
      first.addEventListener("error", loadRest, { once: true });
    } else loadRest();
  }

  window.scrollTo(0, 0);
  let minMs = reduced ? 300 : MIN_MS;
  try {
    if (sessionStorage.getItem(INTRO_KEY) === "1") minMs = Math.min(minMs, MIN_MS_RETURN);
  } catch {
    /* storage unavailable: play the full opening */
  }

  const start = performance.now();
  let last = start;
  let raf = 0;
  let shown = 0;
  let phase: "load" | "hold" | "open" = "load";
  let holdAt = 0;
  let waitAt = 0;
  let frame = 0;
  const timers: number[] = [];

  /** the picture for this share of the opening: one that has loaded, else the one before it */
  const show = (k: number) => {
    if (reduced) return;
    let i = 0;
    for (let s = 0; s < FRAMES.length; s++) if (k >= FRAMES[s]!.at) i = s;
    while (i > 0 && !ready(imgs[i])) i--;
    if (i !== frame) {
      frame = i;
      imgs.forEach((img, j) => img.classList.toggle("is-on", j <= i));
      if (stepEl) stepEl.textContent = FRAMES[i]!.step;
    }
  };
  const setShare = (k: number) => {
    if (bar) bar.style.transform = `scaleX(${k.toFixed(4)})`;
    if (pctEl) pctEl.textContent = String(k >= 1 ? 100 : Math.min(99, Math.round(k * 100)));
  };
  const seal = (now: number) => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* fine: the next visit plays the full opening */
    }
    shown = 1;
    setShare(1);
    show(1);
    phase = "hold";
    holdAt = now;
    if (frame === FRAMES.length - 1) el.classList.add("is-sealed");
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const t = now - start;
    const dt = Math.min(0.25, Math.max(0, (now - last) / 1000));
    last = now;
    if (phase === "load") {
      // the steps follow the loading: never ahead of time, nor of the real loading beyond the first third
      const p = opts.getProgress() ?? { share: 0, done: false };
      const timeFloor = Math.min(1, t / minMs);
      const target = p.done ? timeFloor : Math.min(timeFloor, 0.3 + p.share * 0.65);
      shown += (target - shown) * (reduced ? 1 : 1 - Math.exp(-dt / 0.18));
      const k = shown > 0.985 ? 1 : shown;
      setShare(k);
      show(k);
      if (t > MAX_MS) seal(now);
      else if (p.done && t > minMs && shown > 0.985) {
        // the page is ready: the last picture gets a short grace to arrive, then the page goes on without it
        if (!waitAt) waitAt = now;
        if (reduced || ready(imgs[imgs.length - 1]) || now - waitAt > LAST_WAIT_MS) seal(now);
      }
    } else if (phase === "hold" && now - holdAt >= (reduced ? 0 : HOLD_MS)) {
      phase = "open";
      el.classList.add("is-open");
      opts.onReveal?.();
      timers.push(window.setTimeout(() => opts.onGone?.(), reduced ? 480 : LIFT_MS + 40));
      cancelAnimationFrame(raf);
    }
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    timers.forEach((id) => window.clearTimeout(id));
  };
}
