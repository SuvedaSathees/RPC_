/**
 * Copy and chrome over the "art of waterproofing" canvas, as a plain HTML
 * string plus its stylesheet, so React and static previews render the same.
 */
import { CHAPTERS, FILM_MQ, T, WINDOWS } from "./engine";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** running text: hyphenated compounds ("heat-welded", "UV-resistant") never split across lines */
const prose = (s: string) => esc(s).replace(/[^\s]+-[^\s]+/g, (w) => `<span class="aw-nb">${w}</span>`);

export const ART_COPY = {
  hero: {
    kicker: "RPC Constructions · Erode & Coimbatore",
    title: "The art of waterproofing.",
    body: "Every leak starts with a crack. Follow one concrete slab through the four systems we use to seal it, from crack injection to the final membrane.",
    cue: "Scroll to explore",
  },
  /** phones: the story plays as a short film, captioned step by step */
  film: { opening: "A crack opens", replay: "Replay", replayLabel: "Replay the animation" },
  /** heading over each method's applications */
  usedLabel: "Recommended for",
  chapters: [
    {
      n: "01",
      name: "Injection grouting",
      short: "Injection grouting",
      title: "Sealed at the source.",
      body: "Polyurethane resin is pressure-injected through ports along the crack. It expands on contact with water, fills the void and bonds to both faces, stopping the leak where it starts.",
      used: "Live leaks through cracks and pour joints",
    },
    {
      n: "02",
      name: "Crystalline treatment",
      short: "Crystalline treatment",
      title: "Protection within the concrete.",
      body: "A crystalline compound reacts with moisture and free lime in the concrete, forming insoluble crystals that block its capillary pores and seal hairline cracks from within.",
      used: "Drinking-water sumps, overhead tanks and lift pits",
    },
    {
      n: "03",
      name: "Liquid membrane",
      short: "Liquid membrane",
      title: "A seamless, flexible shield.",
      body: "Applied as a liquid across the entire surface, it cures into one continuous elastomeric coat that bridges hairline cracks and moves with the structure through heat and monsoon.",
      used: "Terraces with solar stands, balconies and planters",
    },
    {
      n: "04",
      name: "APP/SBS torch-on membrane",
      short: "Torch-on membrane",
      title: "The final barrier.",
      body: "Polymer-modified bitumen sheets are torch-bonded to the surface with heat-welded overlaps, forming a durable, UV-resistant layer against sun, standing water and monsoon rain.",
      used: "Large flat roofs, podium decks and factory slabs",
    },
  ],
  /** shown under the last method, where the story settles */
  ctas: {
    primary: { label: "Book a free inspection", href: "/contact#enquiry" },
    secondary: { label: "Compare all 12 methods", href: "/waterproofing" },
  },
} as const;

/**
 * layer callouts: a point on the slab (image fractions), where the label sits
 * (CSS px), and when (timeline units; each is fully drawn at its step's rest).
 * `phone: false` leaves a label out on narrow screens, where two would crowd.
 */
export const CALLS = [
  { id: "grout", at: [0.346, 0.565], dx: 60, dy: 112, text: "PU resin, injected under pressure", win: [0.7, 1.3], phone: true },
  { id: "crystal", at: [0.24, 0.5], dx: 30, dy: 128, text: "Crystals seal the capillary pores", win: [1.7, 2.3], phone: true },
  { id: "coat", at: [0.72, 0.3], dx: 50, dy: -125, text: "Seamless elastomeric coat", win: [2.7, 3.3], phone: true },
  { id: "sheet", at: [0.8, 0.3], dx: 60, dy: -100, text: "Torch-applied APP/SBS sheet", win: [3.5, T + 1], phone: false },
  { id: "drops", at: [0.56, 0.33], dx: 50, dy: -145, text: "Water beads and runs off", win: [3.72, T + 1], phone: true },
] as const;

/** wrap each word so headlines can rise into view word by word */
const words = (t: string) =>
  esc(t)
    .split(" ")
    .map((w, i) => `<span class="aw-wd" style="--i:${i}"><span>${w}</span></span>`)
    .join(" ");

export function artOverlayMarkup(): string {
  const c = ART_COPY;
  const chapters = c.chapters
    .map((ch, i) => {
      const w = CHAPTERS[i]!;
      const last = i === c.chapters.length - 1;
      const ctas = last
        ? `
  <div class="aw-ctas">
    <a class="aw-btn aw-btn--solid" href="${c.ctas.primary.href}" data-internal>${esc(c.ctas.primary.label)}</a>
    <a class="aw-btn" href="${c.ctas.secondary.href}" ${c.ctas.secondary.href.startsWith("#") ? "data-anchor" : "data-internal"}>${esc(c.ctas.secondary.label)}</a>
  </div>`
        : "";
      return `<div class="aw-copy aw-copy--ch" data-win="${w[0]},${w[1]}">
  <p class="aw-label"><span class="aw-n">${ch.n}</span>${esc(ch.name)}</p>
  <h2 class="aw-title">${words(ch.title)}</h2>
  <p class="aw-body">${prose(ch.body)}</p>
  <p class="aw-used"><span>${esc(c.usedLabel)}</span>${esc(ch.used)}</p>${ctas}
</div>`;
    })
    .join("\n");
  const rail = c.chapters
    .map((ch, i) => `<div class="aw-rail-i" data-rail="${i}"><span class="aw-rail-bar"><i></i></span><span class="aw-rail-t"><b>${ch.n}</b>${esc(ch.short)}</span></div>`)
    .join("");
  const calls = CALLS.map(
    (k) => `<span class="aw-dot" data-dot="${k.id}"></span><div class="aw-call" data-call="${k.id}"><span>${esc(k.text)}</span></div>`,
  ).join("");
  const lines = CALLS.map((k) => `<line data-line="${k.id}" x1="0" y1="0" x2="0" y2="0"/>`).join("");
  const nums = c.chapters.map((ch, i) => `<div class="aw-num" data-num="${i}">${ch.n}</div>`).join("");
  const caps = [`<span data-cap="0">${esc(c.film.opening)}</span>`, ...c.chapters.map((ch, i) => `<span data-cap="${i + 1}"><b>${ch.n}</b>${esc(ch.short)}</span>`)].join("");
  return `
<div class="aw-vig" aria-hidden="true"></div>
<div class="aw-nums" aria-hidden="true">${nums}</div>
<svg class="aw-lines" aria-hidden="true">${lines}</svg>
<div aria-hidden="true">${calls}</div>
<div class="aw-copy aw-copy--hero" data-win="${WINDOWS.hero[0]},${WINDOWS.hero[1]}">
  <p class="aw-kicker">${esc(c.hero.kicker)}</p>
  <h1 class="aw-h1"><span class="aw-sr">RPC Constructions: </span>${words(c.hero.title)}</h1>
  <p class="aw-lede">${prose(c.hero.body)}</p>
  <div class="aw-ctas aw-ctas--hero">
    <a class="aw-btn aw-btn--solid" href="${c.ctas.primary.href}" data-internal>${esc(c.ctas.primary.label)}</a>
    <p class="aw-cue"><span aria-hidden="true"></span>${esc(c.hero.cue)}</p>
  </div>
</div>
${chapters}
<div class="aw-rail" aria-hidden="true">${rail}</div>
<div class="aw-film">
  <p class="aw-cap" aria-hidden="true">${caps}</p>
  <button type="button" class="aw-replay" aria-label="${esc(c.film.replayLabel)}"><svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M2.5 8a5.5 5.5 0 1 0 1.7-3.98" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M2.2 1.8v3.1h3.1" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>${esc(c.film.replay)}</button>
</div>
`;
}

export const ART_CSS = `
.aw-section{position:relative;height:calc(${T} * 100vh + 100vh);background:#fbfbfa;color:#101a22}
.aw-stage{position:sticky;top:0;height:100vh;height:100svh;overflow:hidden;background:#fbfbfa}
.aw-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.aw-ov{position:absolute;inset:0;pointer-events:none;--ink:#101a22;--mute:rgba(16,26,34,.58);--line:rgba(16,26,34,.14);--accent:#0b6e80}
.aw-ov a,.aw-ov button{pointer-events:auto}
.aw-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.aw-grain{position:absolute;inset:-50%;pointer-events:none;opacity:.05;mix-blend-mode:multiply;animation:aw-grain 1.2s steps(6) infinite}
@keyframes aw-grain{0%{transform:translate(0,0)}20%{transform:translate(-3%,2%)}40%{transform:translate(2%,-3%)}60%{transform:translate(-2%,-1%)}80%{transform:translate(3%,3%)}100%{transform:translate(0,0)}}

.aw-copy{position:absolute;opacity:0;visibility:hidden;will-change:opacity,transform;--dy:0px;color:var(--ink)}
.aw-copy--hero{left:var(--gutter,3rem);top:50%;width:min(36vw,36rem);transform:translateY(calc(-50% + var(--dy)))}
.aw-copy--ch{left:var(--gutter,3rem);top:50%;width:min(28vw,26rem);transform:translateY(calc(-50% + var(--dy)))}
.aw-kicker{margin:0 0 1.6rem;font-size:var(--fs-body);font-weight:500;letter-spacing:.02em;color:var(--mute)}
.aw-h1{margin:0;font-family:var(--font-instrument),"Times New Roman",serif;font-weight:400;font-size:var(--fs-title);line-height:.92;letter-spacing:-.03em}
.aw-lede{margin:1.8rem 0 0;max-width:26rem;font-size:var(--fs-sub);line-height:1.6;color:var(--mute)}
.aw-cue{display:flex;align-items:center;gap:.8rem;margin:0;font-size:var(--fs-body);font-weight:500;letter-spacing:.04em;color:var(--mute)}
.aw-cue span{display:block;width:1px;height:38px;background:currentColor;transform-origin:top;animation:aw-cue 2.4s cubic-bezier(.65,0,.35,1) infinite}
@keyframes aw-cue{0%{transform:scaleY(0);transform-origin:top}45%{transform:scaleY(1);transform-origin:top}55%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
.aw-label{display:flex;align-items:baseline;gap:.75rem;margin:0;font-size:var(--fs-body);font-weight:500;color:var(--mute)}
.aw-n{font-variant-numeric:tabular-nums;font-weight:600;color:var(--accent)}
.aw-title{margin:1rem 0 1.2rem;font-family:var(--font-instrument),"Times New Roman",serif;font-weight:400;font-size:var(--fs-title);line-height:.98;letter-spacing:-.02em;text-wrap:balance}
.aw-body{margin:0;font-size:var(--fs-body);line-height:1.65;color:rgba(16,26,34,.74);max-width:27rem}
.aw-used{display:flex;flex-direction:column;gap:.3rem;margin:1.6rem 0 0;padding-top:1.1rem;border-top:1px solid var(--line);font-size:var(--fs-body);line-height:1.45}
.aw-used span{font-size:var(--fs-body);color:var(--mute)}
.aw-lede,.aw-body,.aw-used{text-wrap:pretty}
.aw-rail-t,.aw-nb{white-space:nowrap}
.aw-ctas{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.8rem}
.aw-ctas--hero{align-items:center;gap:1.6rem;margin-top:2.4rem}
.aw-btn{display:inline-flex;align-items:center;height:3.2rem;padding:0 1.5rem;border-radius:999px;border:1px solid var(--line);font-size:var(--fs-body);font-weight:600;color:var(--ink);text-decoration:none;background:rgba(255,255,255,.6);transition:border-color .3s,background-color .3s}
.aw-btn:hover{border-color:var(--ink)}
.aw-btn--solid{background:var(--ink);border-color:var(--ink);color:#f3f5f6}
.aw-btn--solid:hover{background:var(--accent);border-color:var(--accent)}

.aw-rail{position:absolute;left:var(--gutter,3rem);bottom:30px;width:min(62vw,52rem);display:grid;grid-template-columns:repeat(4,1fr);gap:18px;opacity:0}
.aw-rail-bar{display:block;height:1px;background:var(--line);overflow:hidden}
.aw-rail-bar i{display:block;height:100%;background:var(--ink);transform:scaleX(0);transform-origin:left}
.aw-rail-t{display:flex;gap:.5rem;margin-top:10px;font-size:var(--fs-body);color:var(--mute);transition:color .4s}
.aw-rail-t b{font-weight:600;color:var(--accent)}
.aw-rail-i[data-on="1"] .aw-rail-t{color:var(--ink)}


/* word-by-word headline reveal; the rest of each block follows */
.aw-wd{display:inline-block;overflow:hidden;vertical-align:bottom;padding:0 .02em .1em;margin:0 -.02em -.1em}
.aw-wd>span{display:inline-block;transform:translateY(112%);transition:transform 1.1s cubic-bezier(.19,1,.22,1);transition-delay:calc(var(--i) * 60ms)}
.aw-copy.is-in .aw-wd>span{transform:none}
.aw-copy .aw-kicker,.aw-copy .aw-label,.aw-copy .aw-lede,.aw-copy .aw-body,.aw-copy .aw-used,.aw-copy .aw-cue,.aw-copy .aw-ctas{opacity:0;transform:translateY(12px);transition:opacity .9s ease .28s,transform 1.1s cubic-bezier(.19,1,.22,1) .28s}
.aw-copy .aw-kicker,.aw-copy .aw-label{transition-delay:0s}
.aw-copy.is-in .aw-kicker,.aw-copy.is-in .aw-label,.aw-copy.is-in .aw-lede,.aw-copy.is-in .aw-body,.aw-copy.is-in .aw-used,.aw-copy.is-in .aw-cue,.aw-copy.is-in .aw-ctas{opacity:1;transform:none}

/* soft lens falloff and big chapter numerals */
.aw-vig{position:absolute;inset:0;background:radial-gradient(120% 90% at 66% 52%,rgba(0,0,0,0) 55%,rgba(16,26,34,.07) 100%)}
.aw-nums{position:absolute;right:var(--gutter,3rem);top:9vh}
.aw-num{display:none;position:absolute;right:0;top:0;font-family:var(--font-instrument),"Times New Roman",serif;font-size:var(--fs-title);line-height:.8;letter-spacing:-.04em;color:var(--ink);opacity:0;font-variant-numeric:tabular-nums}

/* callouts */
.aw-lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.aw-lines line{stroke:var(--ink);stroke-opacity:.45;stroke-width:1}
.aw-dot{position:absolute;left:0;top:0;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:#fff;box-shadow:0 0 0 1px var(--ink),0 0 0 6px rgba(255,255,255,.35);opacity:0}
.aw-dot::after{content:"";position:absolute;inset:-7px;border-radius:50%;border:1px solid rgba(16,26,34,.35);animation:aw-ping 2.4s cubic-bezier(.2,.7,.2,1) infinite}
@keyframes aw-ping{0%{transform:scale(.4);opacity:1}100%{transform:scale(1.8);opacity:0}}
.aw-call{position:absolute;left:0;top:0;opacity:0;white-space:nowrap;font-size:var(--fs-body);font-weight:500;letter-spacing:.01em;color:var(--ink);padding:0 0 6px;border-bottom:1px solid rgba(16,26,34,.45)}

/* preloader */


@media (max-width:767px),(max-aspect-ratio:21/20){
  /* stacked: the slab in its own box under the nav, the copy below it */
  .aw-section{--aw-cv:75vw}
  .aw-stage{background:linear-gradient(to bottom,#fbfbfa calc(64px + var(--aw-cv) - 1px),#f4f4f3 calc(64px + var(--aw-cv)),#fbfbfa calc(64px + var(--aw-cv) + 160px))}
  .aw-nums,.aw-vig{display:none}
  .aw-call{font-size:var(--fs-body);padding-bottom:4px}
  .aw-canvas{position:absolute;top:64px;left:0;right:0;bottom:auto;height:var(--aw-cv)}
  .aw-copy--hero,.aw-copy--ch{left:var(--gutter,16px);right:var(--gutter,16px);width:auto;max-width:40rem;top:calc(64px + var(--aw-cv) + 22px);transform:translateY(var(--dy))}
  .aw-h1{font-size:var(--fs-title)}
  .aw-lede{margin-top:1rem;font-size:var(--fs-sub)}
  .aw-title{font-size:var(--fs-title);margin:.7rem 0 .8rem}
  .aw-body{font-size:var(--fs-body);line-height:1.55}
  .aw-used{margin-top:1rem;padding-top:.8rem;font-size:var(--fs-body)}
  .aw-ctas{margin-top:1.2rem}
  .aw-ctas--hero{gap:1.2rem;margin-top:1.4rem}
  .aw-btn{height:2.9rem;padding:0 1.15rem;font-size:var(--fs-body)}
  .aw-rail{left:var(--gutter,16px);right:var(--gutter,16px);width:auto;bottom:calc(16px + env(safe-area-inset-bottom));gap:6px}
  .aw-rail-t{display:none}
}
/* short phones: a shallower picture so the copy and buttons clear the progress bar */
@media (max-width:767px) and (max-height:720px){
  .aw-section{--aw-cv:62.5vw}
  .aw-copy--hero,.aw-copy--ch{top:calc(64px + var(--aw-cv) + 14px)}
  .aw-used{display:none}
  .aw-lede,.aw-body{line-height:1.5}
}
/* film caption and replay (phones only, see below) */
.aw-film{display:none}
.aw-cap{position:relative;flex:1;min-width:0;height:18px;margin:0;font-size:var(--fs-body);font-weight:500;line-height:18px;color:var(--ink)}
.aw-cap span{position:absolute;left:0;top:0;display:flex;gap:.5rem;white-space:nowrap;opacity:0;transform:translateY(6px);transition:opacity .18s ease,transform .25s ease}
.aw-cap span[data-on="past"]{transform:translateY(-5px)}
.aw-cap span[data-on="1"]{opacity:1;transform:none;transition:opacity .35s ease .16s,transform .55s cubic-bezier(.19,1,.22,1) .16s}
.aw-cap span[data-cap="0"]{color:var(--mute)}
.aw-cap b{font-weight:600;color:var(--accent);font-variant-numeric:tabular-nums}
.aw-replay{display:inline-flex;align-items:center;gap:.4rem;height:34px;padding:0 .9rem 0 .75rem;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.75);font:inherit;font-size:var(--fs-body);font-weight:600;color:var(--ink);cursor:pointer;-webkit-tap-highlight-color:transparent;opacity:0;visibility:hidden;transform:translateY(4px);transition:opacity .45s ease,visibility .45s,transform .5s cubic-bezier(.19,1,.22,1),border-color .3s}
.aw-replay:hover,.aw-replay:focus-visible{border-color:var(--ink)}
.aw-section[data-film="end"] .aw-replay{opacity:1;visibility:visible;transform:none}

/* phones: a five-second film instead of four scroll steps; one screen, then the page scrolls on */
@media ${FILM_MQ}{
  .aw-section{height:100vh;height:100svh}
  .aw-copy--ch{display:none}
  .aw-rail{top:calc(64px + var(--aw-cv) + 10px);bottom:auto;gap:4px}
  .aw-film{display:flex;align-items:center;justify-content:space-between;gap:1rem;position:absolute;left:var(--gutter,16px);right:var(--gutter,16px);top:calc(64px + var(--aw-cv) + 20px);height:34px}
  .aw-copy--hero{top:calc(64px + var(--aw-cv) + 86px)}
  .aw-h1{font-size:var(--fs-title)}
}
@media ${FILM_MQ} and (max-height:780px){
  .aw-section{--aw-cv:62.5vw}
  .aw-rail{top:calc(64px + var(--aw-cv) + 8px)}
  .aw-film{top:calc(64px + var(--aw-cv) + 16px)}
  .aw-copy--hero{top:calc(64px + var(--aw-cv) + 66px)}
  .aw-h1{font-size:var(--fs-title)}
}
/* very small phones: a shallower picture and tighter type so the button stays on screen */
@media ${FILM_MQ} and (max-height:640px){
  .aw-section{--aw-cv:52vw}
  .aw-copy--hero{top:calc(64px + var(--aw-cv) + 60px)}
  .aw-kicker{margin-bottom:.9rem}
  .aw-h1{font-size:var(--fs-title)}
  .aw-lede{margin-top:.7rem;font-size:var(--fs-sub);line-height:1.45}
  .aw-ctas--hero{margin-top:1rem}
}
/* the narrowest phones: the button alone, so it never wraps under the scroll hint */
@media (max-width:350px){.aw-ctas--hero .aw-cue{display:none}}
/* portrait tablets: the stacked layout with larger type */
@media (min-width:768px) and (max-aspect-ratio:21/20){
  .aw-h1{font-size:var(--fs-title)}
  .aw-title{font-size:var(--fs-title)}
  .aw-lede{font-size:var(--fs-sub)}.aw-body{font-size:var(--fs-body)}
  .aw-call{font-size:var(--fs-body)}
}
@media (prefers-reduced-motion:reduce){
  .aw-cue span,.aw-grain,.aw-dot::after{animation:none}.aw-wd>span{transform:none!important;transition:none}
}
`;
