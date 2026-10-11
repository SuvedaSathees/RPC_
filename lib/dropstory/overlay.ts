/**
 * The HTML that sits over the drawing (copy, callouts, pins, progress rail)
 * and its stylesheet. Plain strings so the same markup renders in React and
 * in static previews.
 */
import { STORY } from "./copy";
import { CALLOUTS, WINDOWS } from "./engine";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const PINS = [
  { key: "roof", n: 1, place: "Terrace", method: "PU membrane" },
  { key: "bath", n: 2, place: "Bathroom", method: "Cementitious coats" },
  { key: "basement", n: 3, place: "Basement", method: "HDPE sheet" },
  { key: "sump", n: 4, place: "Sump", method: "Crystalline" },
] as const;

export function overlayMarkup(): string {
  const h = STORY.hero;
  const f = STORY.final;
  const stages = STORY.stages
    .map((s, i) => {
      const w = WINDOWS[s.key];
      return `<div class="ds-copy ds-copy--stage" data-win="${w[0]},${w[1]}">
  <p class="ds-meta"><span class="ds-n">${i + 1}/4</span><span>${esc(s.place)}</span></p>
  <h2 class="ds-h2">${esc(s.method)}</h2>
  <p class="ds-body">${esc(s.body)}</p>
  <p class="ds-used"><span>Used on</span> ${esc(s.used)}</p>
</div>`;
    })
    .join("\n");

  const rail = STORY.stages
    .map(
      (s, i) =>
        `<div class="ds-rail-i" data-rail="${i}"><span class="ds-rail-bar"><i></i></span><span class="ds-rail-t"><b>${esc(s.place)}</b> ${esc(s.short)}</span></div>`,
    )
    .join("");

  const callouts = CALLOUTS.map(
    (c) => `<div class="ds-callout" data-callout="${c.id}"><span>${esc(c.text)}</span></div><span class="ds-dot" data-dot="${c.id}"></span>`,
  ).join("");
  const leaders = CALLOUTS.map((c) => `<line data-leader="${c.id}" x1="0" y1="0" x2="0" y2="0"/>`).join("");

  const pins = PINS.map(
    (p) => `<div class="ds-pin" data-pin="${p.key}"><b>${p.n}</b><span><strong>${esc(p.place)}</strong>${esc(p.method)}</span></div>`,
  ).join("");

  return `
<div class="ds-scrim" aria-hidden="true"></div>
<div class="ds-floor" aria-hidden="true"></div>
<svg class="ds-leaders" aria-hidden="true">${leaders}</svg>
<div aria-hidden="true">${callouts}${pins}</div>
<div class="ds-copy ds-copy--hero" data-win="${WINDOWS.hero[0]},${WINDOWS.hero[1]}">
  <p class="ds-kicker">${esc(h.kicker)}</p>
  <h1 class="ds-h1"><span class="ds-sr">RPC Constructions: </span>${esc(h.title)}</h1>
  <p class="ds-lede">${esc(h.body)}</p>
  <p class="ds-cue"><span aria-hidden="true"></span>${esc(h.cue)}</p>
</div>
${stages}
<div class="ds-copy ds-copy--final" data-win="${WINDOWS.final[0]},${WINDOWS.final[1]}">
  <h2 class="ds-brand">${esc(f.title)}</h2>
  <p class="ds-body">${esc(f.body)}</p>
  <div class="ds-ctas">
    <a class="ds-btn ds-btn--solid" href="${f.primary.href}" data-anchor>${esc(f.primary.label)}</a>
    <a class="ds-btn" href="${f.secondary.href}" data-internal>${esc(f.secondary.label)}</a>
  </div>
</div>
<div class="ds-rail" aria-hidden="true">${rail}</div>`;
}

export const DS_CSS = `
.ds-section{position:relative;height:calc(24 * 36vh + 100vh);background:#eeede8;--ds-bg:#eeede8;--ds-accent:#3b6fd8}
@media (max-width:767px){.ds-section{height:calc(24 * 28svh + 100svh)}}
.ds-stage{position:sticky;top:0;height:100vh;height:100svh;overflow:hidden}
.ds-svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.ds-ov{position:absolute;inset:0;pointer-events:none;color:var(--ds-fg);--ds-fg:#15181b;--ds-mute:rgba(21,24,27,.6);--ds-line:rgba(21,24,27,.16);transition:color .5s}
.ds-section[data-tone=dark] .ds-ov{--ds-fg:#f2f0eb;--ds-mute:rgba(242,240,235,.64);--ds-line:rgba(242,240,235,.2);--ds-accent:#8fb0f5}
.ds-ov a{pointer-events:auto}
.ds-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.ds-scrim{position:absolute;top:0;bottom:0;left:0;width:62vw;opacity:0;background:linear-gradient(90deg,var(--ds-bg) 0%,var(--ds-bg) 62%,transparent 100%)}
.ds-floor{position:absolute;left:0;right:0;bottom:0;height:140px;opacity:0;background:linear-gradient(0deg,var(--ds-bg) 0%,var(--ds-bg) 38%,transparent 100%)}

.ds-copy{position:absolute;opacity:0;visibility:hidden;will-change:opacity,transform;--dy:0px}
.ds-copy--hero{left:var(--gutter,3rem);top:50%;width:min(44vw,40rem);transform:translateY(calc(-50% + var(--dy)))}
.ds-copy--stage{left:var(--gutter,3rem);top:50%;width:min(33vw,29rem);transform:translateY(calc(-50% + var(--dy)))}
.ds-copy--final{left:var(--gutter,3rem);top:19vh;width:min(36vw,32rem);transform:translateY(var(--dy))}
.ds-kicker{margin:0 0 1.4rem;font-size:14px;font-weight:500;color:var(--ds-mute)}
.ds-h1{margin:0;font-family:var(--font-inter-tight),ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:clamp(3.2rem,7vw,7.4rem);line-height:.9;letter-spacing:-.055em;text-wrap:balance}
.ds-lede{margin:1.7rem 0 0;max-width:27rem;font-size:1.06rem;line-height:1.55;color:var(--ds-mute)}
.ds-cue{display:flex;align-items:center;gap:.8rem;margin:2.6rem 0 0;font-size:13px;font-weight:500}
.ds-cue span{display:block;width:1px;height:34px;background:currentColor;transform-origin:top;animation:ds-cue 2.2s cubic-bezier(.65,0,.35,1) infinite}
@keyframes ds-cue{0%{transform:scaleY(0);transform-origin:top}45%{transform:scaleY(1);transform-origin:top}55%{transform:scaleY(1);transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}

.ds-meta{display:flex;gap:.7rem;align-items:baseline;margin:0;font-size:14px;font-weight:500;color:var(--ds-mute)}
.ds-n{color:var(--ds-accent);font-weight:600;font-variant-numeric:tabular-nums}
.ds-h2{margin:.85rem 0 1.15rem;font-weight:600;font-size:clamp(2rem,3.2vw,3.25rem);line-height:1;letter-spacing:-.04em;text-wrap:balance}
.ds-body{margin:0;font-size:1rem;line-height:1.6;opacity:.82;max-width:29rem}
.ds-used{margin:1.4rem 0 0;padding-top:1rem;border-top:1px solid var(--ds-line);font-size:14px;line-height:1.45}
.ds-used span{color:var(--ds-mute);margin-right:.3rem}
.ds-brand{margin:0 0 1.3rem;font-weight:700;font-size:clamp(3rem,5.6vw,6rem);line-height:.9;letter-spacing:-.055em}
.ds-ctas{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:2rem}
.ds-btn{display:inline-flex;align-items:center;height:3.1rem;padding:0 1.35rem;border-radius:999px;border:1px solid var(--ds-line);font-size:14px;font-weight:600;color:inherit;text-decoration:none;transition:background-color .3s,border-color .3s}
.ds-btn:hover{border-color:currentColor}
.ds-btn--solid{background:#3b6fd8;border-color:#3b6fd8;color:#fff}
.ds-btn--solid:hover{background:#2c5bc0;border-color:#2c5bc0}

.ds-leaders{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.ds-leaders line{stroke:currentColor;stroke-opacity:.5;stroke-width:1}
.ds-callout{position:absolute;left:0;top:0;opacity:0;white-space:nowrap;font-size:12.5px;font-weight:500;line-height:1;padding:6px 10px;border-radius:999px;background:color-mix(in srgb,var(--ds-bg) 86%,transparent);box-shadow:0 0 0 1px var(--ds-line)}
.ds-dot{position:absolute;left:0;top:0;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;border-radius:50%;background:var(--ds-bg);box-shadow:0 0 0 1.5px var(--ds-accent);opacity:0}
.ds-pin{position:absolute;left:0;top:0;display:flex;align-items:center;gap:.6rem;opacity:0;white-space:nowrap}
.ds-pin b{display:grid;place-items:center;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:#3b6fd8;color:#fff;font-size:12px;font-weight:700;box-shadow:0 0 0 4px color-mix(in srgb,#3b6fd8 22%,transparent)}
.ds-pin span{display:flex;flex-direction:column;gap:2px;margin-top:-13px;padding:6px 10px;border-radius:10px;background:color-mix(in srgb,var(--ds-bg) 88%,transparent);font-size:12px;color:var(--ds-mute)}
.ds-pin strong{font-size:13px;font-weight:600;color:var(--ds-fg)}

.ds-rail{position:absolute;left:var(--gutter,3rem);right:var(--gutter,3rem);bottom:28px;display:grid;grid-template-columns:repeat(4,1fr);gap:18px;opacity:0}
.ds-rail-bar{display:block;height:2px;background:var(--ds-line);overflow:hidden}
.ds-rail-bar i{display:block;height:100%;background:var(--ds-accent);transform:scaleX(0);transform-origin:left}
.ds-rail-t{display:block;margin-top:10px;font-size:12.5px;color:var(--ds-mute);transition:color .3s}
.ds-rail-t b{font-weight:600;color:var(--ds-fg)}
.ds-rail-i[data-on="0"] .ds-rail-t{opacity:.55}

@media (max-width:767px){
  .ds-scrim{top:auto;right:0;width:auto;height:62%;background:linear-gradient(0deg,var(--ds-bg) 0%,var(--ds-bg) 58%,transparent 100%)}
  .ds-floor{top:0;bottom:auto;height:120px;background:linear-gradient(180deg,var(--ds-bg) 0%,var(--ds-bg) 45%,transparent 100%)}
  .ds-copy--hero{left:16px;right:16px;top:92px;width:auto;transform:translateY(var(--dy))}
  .ds-h1{font-size:clamp(2.9rem,14vw,4.2rem)}
  .ds-lede{margin-top:1.1rem;font-size:.98rem}
  .ds-cue{margin-top:1.4rem}
  .ds-cue span{height:22px}
  .ds-copy--stage,.ds-copy--final{left:16px;right:16px;top:auto;bottom:calc(22px + env(safe-area-inset-bottom));width:auto;transform:translateY(var(--dy))}
  .ds-h2{font-size:1.85rem;margin:.6rem 0 .8rem}
  .ds-body{font-size:.95rem;line-height:1.5}
  .ds-used{margin-top:1rem;padding-top:.8rem;font-size:13px}
  .ds-brand{font-size:clamp(2.6rem,12vw,3.6rem);margin-bottom:.9rem}
  .ds-ctas{margin-top:1.3rem}
  .ds-btn{height:2.9rem;padding:0 1.1rem;font-size:13.5px}
  .ds-rail{top:76px;bottom:auto;left:16px;right:16px;gap:6px}
  .ds-rail-t{display:none}
  .ds-callout{font-size:11.5px;padding:5px 8px}
  .ds-pin span{display:none}
}
@media (prefers-reduced-motion:reduce){.ds-cue span{animation:none;transform:none}}
`;
