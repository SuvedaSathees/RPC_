/**
 * "Drop test" loading screen for the home page. Rain falls on a concrete slab
 * while a waterproof coat is rolled across it, left to right, as the page
 * loads: drops that land on bare concrete soak in and leave a damp patch;
 * drops that land on the coat bead up and roll away. A line under the slab
 * names the stage of the job, with the share loaded. Once everything is in,
 * a sheen runs along the finished coat and the screen lifts away.
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
const MIN_MS = 2400;
const MIN_MS_RETURN = 900;
const MAX_MS = 9000;
const SEAL_MS = 650;
const LIFT_MS = 900;

/* the drawing, in its own units */
const X0 = 30;
const X1 = 570;
const TOP = 118; // the slab's top surface
const STEPS: readonly [number, string][] = [
  [0, "Cleaning the slab"],
  [0.16, "Priming the surface"],
  [0.38, "First waterproof coat"],
  [0.68, "Second coat"],
  [0.995, "Sealed"],
];
/** where the drops fall, and how often */
const DROPS: readonly [x: number, period: number, offset: number][] = [
  [64, 1180, 0.1],
  [122, 1460, 0.55],
  [186, 1260, 0.3],
  [248, 1520, 0.8],
  [312, 1210, 0.05],
  [372, 1390, 0.62],
  [436, 1300, 0.38],
  [500, 1480, 0.9],
  [548, 1240, 0.2],
];

function specks() {
  let s = 17;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let out = "";
  for (let i = 0; i < 70; i++)
    out += `<circle cx="${(X0 + 4 + r() * (X1 - X0 - 8)).toFixed(1)}" cy="${(TOP + 5 + r() * 58).toFixed(1)}" r="${(0.7 + r() * 1.6).toFixed(2)}" class="dl-sp${i % 3}"/>`;
  return out;
}

export function dropLoaderMarkup(): string {
  const drops = DROPS.map(([x]) => `<path class="dl-drop" data-dl-drop transform="translate(${x} -20)" d="M0 -11c-3.2 5.6-4.4 8.8-4.4 10.5a4.4 4.4 0 0 0 8.8 0c0-1.7-1.2-4.9-4.4-10.5z"/>`).join("");
  return `<div class="dl" role="status" aria-label="Loading">
  <span class="dl-sr">Loading the page</span>
  <div class="dl-stage" aria-hidden="true">
    <svg class="dl-svg" viewBox="0 0 600 210" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="dl-coat-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fdbe6"/><stop offset="1" stop-color="#2aa5b6"/></linearGradient>
        <linearGradient id="dl-sheen-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <radialGradient id="dl-wet-g"><stop offset="0" stop-color="#16354a" stop-opacity=".9"/><stop offset=".6" stop-color="#1d3d52" stop-opacity=".55"/><stop offset="1" stop-color="#1d3d52" stop-opacity="0"/></radialGradient>
        <clipPath id="dl-slab-clip"><rect x="${X0}" y="${TOP}" width="${X1 - X0}" height="66" rx="6"/></clipPath>
        <clipPath id="dl-coat-clip"><rect data-dl-coatclip x="${X0 - 2}" y="${TOP - 12}" width="0" height="14"/></clipPath>
      </defs>
      <g data-dl-drops>${drops}</g>
      <rect class="dl-c" x="${X0}" y="${TOP}" width="${X1 - X0}" height="66" rx="6"/>
      <g clip-path="url(#dl-slab-clip)">${specks()}<g data-dl-wets></g></g>
      <g clip-path="url(#dl-coat-clip)">
        <rect x="${X0 - 2}" y="${TOP - 9}" width="${X1 - X0 + 4}" height="10" rx="4" fill="url(#dl-coat-g)"/>
        <rect data-dl-sheen x="${X0 - 120}" y="${TOP - 9}" width="110" height="10" fill="url(#dl-sheen-g)"/>
      </g>
      <g data-dl-beads></g>
      <g class="dl-roller" data-dl-roller transform="translate(${X0} 0)">
        <rect x="-15" y="${TOP - 26}" width="30" height="15" rx="7.5"/>
        <path d="M0 ${TOP - 26}V${TOP - 44}h22V${TOP - 70}"/>
      </g>
    </svg>
    <div class="dl-row">
      <span class="dl-brand">RPC Constructions</span>
      <span class="dl-step" data-dl-step>${STEPS[0]![1]}</span>
      <span class="dl-pct"><span data-dl-pct>0</span>%</span>
    </div>
  </div>
</div>`;
}

export const DROP_CSS = `
.dl{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:#0b1d2b;color:#ecf2f5;font-family:var(--font-inter-tight),ui-sans-serif,system-ui,sans-serif;font-size:var(--fs-body,1rem);clip-path:inset(0 0 0 0);transition:clip-path ${LIFT_MS}ms cubic-bezier(.76,0,.24,1)}
.dl.is-open{clip-path:inset(0 0 100% 0)}
.dl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.dl-stage{width:min(86vw,920px);transition:transform ${LIFT_MS}ms cubic-bezier(.76,0,.24,1),opacity ${LIFT_MS * 0.6}ms ease}
.dl.is-open .dl-stage{transform:translateY(-36px);opacity:0}
.dl-svg{display:block;width:100%;height:auto;overflow:visible}
.dl-c{fill:#c3ccd2}
.dl-sp0{fill:#9aa7b0}.dl-sp1{fill:#aab5bc}.dl-sp2{fill:#d4dbdf}
.dl-drop{fill:#4cc9d9}
.dl-wet{fill:url(#dl-wet-g);opacity:0}
.dl-bead{fill:#a8eef5;stroke:#4cc9d9;stroke-width:1}
.dl-roller rect{fill:#e8a215}
.dl-roller path{fill:none;stroke:#ecf2f5;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;opacity:.85}
.dl-roller{transition:opacity .5s ease}
.dl.is-sealed .dl-roller{opacity:0}
.dl-row{display:grid;grid-template-columns:1fr auto auto;align-items:baseline;gap:1.2rem;margin-top:clamp(1.2rem,3.4svh,2rem);padding-top:.9rem;border-top:1px solid rgba(236,242,245,.16);line-height:1.4}
.dl-brand{font-weight:600;letter-spacing:.01em}
.dl-step{color:rgba(236,242,245,.7)}
.dl-pct{min-width:4ch;text-align:right;font-variant-numeric:tabular-nums;color:#4cc9d9;font-weight:600}
.dl.is-sealed .dl-step{color:#4cc9d9}
@media (max-width:560px){
  .dl-stage{width:88vw}
  .dl-row{grid-template-columns:1fr auto;row-gap:.35rem}
  .dl-step{grid-column:1;grid-row:2}
  .dl-pct{grid-row:1/span 2;align-self:center}
}
@media (prefers-reduced-motion:reduce){
  .dl{transition:opacity .45s ease}
  .dl.is-open{clip-path:inset(0 0 0 0);opacity:0}
  .dl-drop{display:none}
}
`;

const SVGNS = "http://www.w3.org/2000/svg";

/** runs the screen: follows the loading, rolls the coat, seals, lifts */
export function mountDropLoader(root: HTMLElement, opts: DropOptions) {
  const el = root.querySelector<HTMLElement>(".dl");
  if (!el) return () => {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const q = <T extends Element>(sel: string) => el.querySelector<T>(sel);
  const clip = q<SVGRectElement>("[data-dl-coatclip]");
  const sheen = q<SVGRectElement>("[data-dl-sheen]");
  const roller = q<SVGGElement>("[data-dl-roller]");
  const wets = q<SVGGElement>("[data-dl-wets]");
  const beads = q<SVGGElement>("[data-dl-beads]");
  const pctEl = q<HTMLElement>("[data-dl-pct]");
  const stepEl = q<HTMLElement>("[data-dl-step]");
  const drops = Array.from(el.querySelectorAll<SVGPathElement>("[data-dl-drop]"));

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
  let phase: "load" | "seal" | "open" = "load";
  let sealAt = 0;
  let step = -1;
  const timers: number[] = [];
  const prevPhase = DROPS.map(() => 0);

  const edgeX = (k: number) => X0 + (X1 - X0) * k;
  const setCoat = (k: number) => {
    const x = edgeX(k);
    clip?.setAttribute("width", Math.max(0, x - X0 + 2).toFixed(2));
    roller?.setAttribute("transform", `translate(${x.toFixed(2)} 0)`);
  };
  const setStep = (k: number, pct: number) => {
    if (pctEl) pctEl.textContent = String(pct);
    let i = 0;
    for (let s = 0; s < STEPS.length; s++) if (k >= STEPS[s]![0]) i = s;
    if (i !== step) {
      step = i;
      if (stepEl) stepEl.textContent = STEPS[i]![1];
    }
  };
  /** a drop lands at x: on the coat it beads and rolls off; on bare concrete it soaks in */
  const land = (x: number, k: number) => {
    if (reduced) return;
    const coated = x < edgeX(k) - 4;
    if (coated && beads) {
      const b = document.createElementNS(SVGNS, "ellipse");
      b.setAttribute("class", "dl-bead");
      b.setAttribute("cx", String(x));
      b.setAttribute("cy", String(TOP - 13.5));
      b.setAttribute("rx", "6.2");
      b.setAttribute("ry", "4.6");
      const dir = x < 300 ? -1 : 1;
      b.style.transformBox = "fill-box";
      b.style.transformOrigin = "50% 100%";
      beads.appendChild(b);
      const a = b.animate(
        [
          { transform: "translate(0,0) scale(.3)", opacity: 0.95 },
          { transform: "translate(0,0) scale(1)", opacity: 1, offset: 0.2 },
          { transform: `translate(${dir * 26}px,0) scale(.9)`, opacity: 0 },
        ],
        { duration: 1100, easing: "cubic-bezier(.3,.6,.4,1)" },
      );
      a.onfinish = () => b.remove();
    } else if (wets) {
      const w = document.createElementNS(SVGNS, "ellipse");
      w.setAttribute("class", "dl-wet");
      w.setAttribute("cx", String(x));
      w.setAttribute("cy", String(TOP + 2));
      w.setAttribute("rx", "7");
      w.setAttribute("ry", "4");
      w.style.transformBox = "view-box";
      w.style.transformOrigin = `${x}px ${TOP}px`;
      wets.appendChild(w);
      const a = w.animate(
        [
          { transform: "scale(.4,.4)", opacity: 0.85 },
          { transform: "scale(2.6,5.2)", opacity: 0.55, offset: 0.55 },
          { transform: "scale(3.4,7)", opacity: 0 },
        ],
        { duration: 1700, easing: "cubic-bezier(.2,.7,.3,1)" },
      );
      a.onfinish = () => w.remove();
    }
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const t = now - start;
    const dt = Math.min(0.25, Math.max(0, (now - last) / 1000));
    last = now;
    // the coat follows the loading (never ahead of time, nor of the real loading beyond the first third)
    if (phase === "load") {
      const p = opts.getProgress() ?? { share: 0, done: false };
      const timeFloor = Math.min(1, t / minMs);
      const target = p.done ? timeFloor : Math.min(timeFloor, 0.3 + p.share * 0.65);
      shown += (target - shown) * (reduced ? 1 : 1 - Math.exp(-dt / 0.18));
      const k = shown > 0.995 ? 1 : shown;
      setCoat(k);
      setStep(k, k >= 1 ? 100 : Math.min(99, Math.round(k * 100)));
      if ((p.done && t > minMs && shown > 0.995) || t > MAX_MS) {
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {
          /* fine: the next visit plays the full opening */
        }
        shown = 1;
        setCoat(1);
        setStep(1, 100);
        phase = "seal";
        sealAt = now;
        el.classList.add("is-sealed");
      }
    } else if (phase === "seal") {
      const k = reduced ? 1 : Math.min(1, (now - sealAt) / SEAL_MS);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      sheen?.setAttribute("x", (X0 - 120 + (X1 - X0 + 240) * e).toFixed(2));
      if (k >= 1) {
        phase = "open";
        el.classList.add("is-open");
        opts.onReveal?.();
        timers.push(window.setTimeout(() => opts.onGone?.(), reduced ? 480 : LIFT_MS + 40));
      }
    }
    // the rain: each drop falls, lands, and starts again
    if (!reduced && phase !== "open")
      DROPS.forEach(([x, period, offset], i) => {
        const ph = (t / period + offset) % 1;
        if (ph < prevPhase[i]!) land(x, shown);
        prevPhase[i] = ph;
        const y = -20 + (TOP - 14 + 20) * Math.pow(ph, 1.7);
        const d = drops[i];
        if (d) {
          d.setAttribute("transform", `translate(${x} ${y.toFixed(2)})`);
          d.style.opacity = ph > 0.94 ? "0" : "1";
        }
      });
    if (phase === "open") cancelAnimationFrame(raf);
  };
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    timers.forEach((id) => window.clearTimeout(id));
  };
}
