/**
 * Projects page, set out as a deck of project boards. A compact opening holds
 * the title, a line on what we build, and chips that narrow the projects by
 * status and by town. Then each project as a board, its photograph's frame large
 * beside its name, place, summary and key facts; on bigger screens the boards
 * stack as the page scrolls, each sliding over the last, which eases back.
 * Each project opens into a full view: the photograph large, the structure,
 * materials and the waterproofing built in, with the next and previous
 * projects a click away. /projects#slug opens that project straight away
 * (the home page links so).
 */
import { arrow, ctaBand, esc, photo, words, type ContactInfo, type PageOptions } from "./kit";

export interface ProjectData {
  slug: string;
  name: string;
  location: string;
  type: string;
  status: string;
  image: string;
  summary: string;
  /** the full view's text (the board shows the summary) */
  story?: string;
  waterproofing?: string;
  structuralSystem?: string;
  materials?: string;
}
export interface ProjectsData {
  projects: readonly ProjectData[];
  contact: ContactInfo;
}

export const PROJECTS_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
] as const;

const town = (location: string) => location.split(",").pop()?.trim() ?? location;
const dot = (s: string) => (s === "Completed" ? "done" : s === "Under construction" ? "live" : "plan");
const STATUS_ORDER = ["Completed", "Under construction", "In design"];

/** one project as a board: the photograph large, the words beside it, the facts and actions at the foot */
function board(p: ProjectData, i: number, o: PageOptions) {
  const chip = `<span class="pj-chip"><i class="pj-st" data-s="${dot(p.status)}"></i>${esc(p.status)}</span>`;
  const row = (k: string, v?: string, extra = "") => (v ? `<div><dt>${k}</dt><dd>${extra}${esc(v)}</dd></div>` : "");
  return `<article class="pj-board" id="${esc(p.slug)}" style="--i:${i}" data-town="${esc(town(p.location))}" data-status="${esc(p.status)}" aria-labelledby="pj-${esc(p.slug)}">
  <div class="pj-bph">${photo(p.image, `${p.name}, ${p.location}: ${p.type.toLowerCase()} project by RPC Constructions`, "(min-width:1024px) 54vw, 94vw", o, { eager: i === 0, tag: chip })}<button type="button" class="pj-zoom" data-open="${esc(p.slug)}" aria-haspopup="dialog" aria-label="${esc(`View ${p.name}`)}" hidden><span>View project</span></button></div>
  <div class="pj-btxt">
    <div class="pj-bhead">
      <p class="pj-btype">${esc(p.type)}</p>
      <h2 class="pj-name" id="pj-${esc(p.slug)}">${esc(p.name)}</h2>
      <p class="pj-bloc">${esc(p.location)}</p>
      <p class="pj-sum">${esc(p.summary)}</p>
    </div>
    <div class="pj-bfoot">
      <dl class="pj-mini">${row("Status", p.status, `<i class="pj-st" data-s="${dot(p.status)}"></i>`)}${row("Structure", p.structuralSystem)}</dl>
      <div class="pj-acts"><button type="button" class="pj-view" data-open="${esc(p.slug)}" aria-haspopup="dialog" hidden>View project</button><a class="pg-link" href="/contact?project=${encodeURIComponent(p.name)}#enquiry" data-internal>Ask about a similar project${arrow}</a></div>
    </div>
  </div>
</article>`;
}

/** the full view of a project, opened over the page */
function detail(p: ProjectData, i: number, n: number, o: PageOptions) {
  const layers = (p.waterproofing ?? "")
    .split("·")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1));
  const fact = (k: string, v?: string, extra = "") => (v ? `<div><dt>${k}</dt><dd>${extra}${esc(v)}</dd></div>` : "");
  return `<dialog class="pj-dlg" id="dlg-${esc(p.slug)}" data-dlg="${esc(p.slug)}" aria-labelledby="dlg-${esc(p.slug)}-t" data-lenis-prevent>
  <div class="pj-dlgin">
    <div class="pj-dlgph">${photo(p.image, `${p.name}, ${p.location}`, "(min-width:900px) 58vw, 100vw", o)}</div>
    <div class="pj-dlgcopy">
      <p class="pj-dlgmeta"><span>${esc(p.type)}</span><span>${esc(p.location)}</span></p>
      <p class="pj-dlgt" id="dlg-${esc(p.slug)}-t">${esc(p.name)}</p>
      <p class="pj-dlgsum">${esc(p.story ?? p.summary)}</p>
      <dl class="pj-facts">
        ${fact("Status", p.status, `<i class="pj-st" data-s="${dot(p.status)}"></i>`)}
        ${fact("Structure", p.structuralSystem)}
        ${fact("Materials", p.materials)}
      </dl>
      ${layers.length ? `<div class="pj-layers"><p class="pj-k">Waterproofing built in</p><ol>${layers.map((l) => `<li>${esc(l)}</li>`).join("")}</ol></div>` : ""}
      <div class="pj-dlgacts"><a class="pg-btn pg-btn--ink" href="/contact?project=${encodeURIComponent(p.name)}#enquiry" data-internal>Ask about a similar project${arrow}</a></div>
      <div class="pj-dlgnav"><button type="button" data-go="-1" aria-label="Previous project"><span aria-hidden="true">←</span>Previous</button><span data-pos>${i + 1} of ${n}</span><button type="button" data-go="1" aria-label="Next project">Next<span aria-hidden="true">→</span></button></div>
    </div>
    <button type="button" class="pj-x" data-close aria-label="Close" autofocus><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
  </div>
</dialog>`;
}

export function projectsPageMarkup(d: ProjectsData, o: PageOptions = {}) {
  const ps = d.projects;
  const count = (f: (p: ProjectData) => boolean) => ps.filter(f).length;
  const statuses = [...new Set(ps.map((p) => p.status))].sort((a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b));
  const towns = [...new Set(ps.map((p) => town(p.location)))];
  const statusChips = [["all", "All", ps.length] as const, ...statuses.map((s) => [s, s, count((p) => p.status === s)] as const)]
    .map(([key, label, n], i) => `<button type="button" data-status="${esc(key)}" aria-pressed="${i === 0}">${esc(label)} <span>${n}</span></button>`)
    .join("");
  const townChips = towns
    .map((t) => `<button type="button" data-town="${esc(t)}" aria-pressed="false">${esc(t)} <span>${count((p) => town(p.location) === t)}</span><i aria-hidden="true"></i></button>`)
    .join("");
  return `<header class="pg-head pj-hero">
  <div class="pg-wrap">
    <div class="pj-herogrid">
      <div><p class="pg-mark">Projects</p><h1 class="pj-h1" data-rv="words">${words("Projects built to stay&nbsp;dry.")}</h1></div>
      <div class="pj-heroside">
        <p class="pg-intro">Five projects from Erode to Chennai, each with the waterproofing specified for it. Open one to see the layers, the structure and the materials.</p>
        <div class="pj-tools" hidden>
          <div class="pj-filter" role="group" aria-label="Show projects by status">${statusChips}</div>
          <span class="pj-sep" aria-hidden="true"></span>
          <div class="pj-filter pj-towns" role="group" aria-label="Show projects by town">${townChips}</div>
          <p class="pj-showing" aria-live="polite">Showing all ${ps.length} projects</p>
        </div>
      </div>
    </div>
  </div>
</header>
<section class="pj-deckwrap" aria-label="Projects">
  <div class="pg-wrap">
    <div class="pj-deck" id="project-list">${ps.map((p, i) => board(p, i, o)).join("\n")}</div>
    <p class="pj-empty" hidden>No projects match these filters. <button type="button" data-reset>Show all projects</button></p>
  </div>
  ${ps.map((p, i) => detail(p, i, ps.length, o)).join("\n")}
</section>
${ctaBand(d.contact, {
  title: "Planning something similar?",
  steps: [
    ["Share your plot or drawings", "A site in Erode, Coimbatore or nearby, or plans you already have."],
    ["We review the water risks", "Soil, groundwater, terraces and wet areas, before a price is fixed."],
    ["Build with it designed in", "A quote with the waterproofing written into every stage."],
  ],
})}`;
}

export const PROJECTS_CSS = `
/* the opening: the title, and beside it a line on what we build and the choices */
.pj-hero{padding-bottom:clamp(2.2rem,5vh,3.6rem);border-bottom:0}
.pj-herogrid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:1.8rem clamp(2rem,5vw,6rem);align-items:end}
.pj-herogrid .pg-mark{margin-bottom:.9rem}
.pj-h1{margin:0;font-family:var(--display);font-weight:500;font-size:var(--fs-title);line-height:1.12;letter-spacing:-.02em;text-wrap:balance}
.pj-heroside{display:flex;flex-direction:column;gap:1.5rem;min-width:0;padding-bottom:.45rem}
.pj-heroside .pg-intro{margin:0}

/* filters, shown once scripts run */
.pj-tools{display:flex;flex-direction:column;align-items:flex-start;gap:.45rem;min-width:0}
.pj-filter{display:flex;flex-wrap:wrap;gap:.4rem}
.pj-sep{display:none;flex:none;width:1px;height:1.4rem;margin:0 .2rem;background:rgba(16,26,34,.16)}
.pj-filter button{display:inline-flex;align-items:center;gap:.5rem;height:2.4rem;padding:0 .9rem;border:0;border-radius:10px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);font:500 var(--fs-body) var(--sans);color:var(--ink);white-space:nowrap;cursor:pointer;transition:background-color .3s,color .3s,box-shadow .3s,opacity .3s}
.pj-filter button span{font-size:var(--fs-body);font-variant-numeric:tabular-nums;color:var(--mute)}
.pj-filter button:hover{box-shadow:inset 0 0 0 1px var(--ink)}
.pj-filter button[aria-pressed=true]{background:var(--navy);box-shadow:none;color:#f5f0e6}
.pj-filter button[aria-pressed=true] span{color:rgba(245,240,230,.65)}
.pj-towns button[aria-pressed=true]{background:var(--accent)}
.pj-filter button.is-zero:not([aria-pressed=true]){opacity:.4}
.pj-filter button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pj-towns i{display:none;position:relative;width:9px;height:9px}
.pj-towns button[aria-pressed=true] i{display:block}
.pj-towns i::before,.pj-towns i::after{content:"";position:absolute;left:0;top:50%;width:9px;height:1.5px;margin-top:-.75px;background:currentColor;transform:rotate(45deg)}
.pj-towns i::after{transform:rotate(-45deg)}
/* the running count is read out, not shown */
.pj-showing{position:absolute;width:1px;height:1px;margin:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

/* the deck: each project a board; on bigger screens they stack as the page scrolls */
.pj-deckwrap{position:relative;padding:clamp(.6rem,2vh,1.4rem) 0 clamp(5rem,13vh,8.5rem)}
.pj-deck{display:flex;flex-direction:column;gap:clamp(1.6rem,5vh,3.4rem)}
.pj-board{--depth:0;position:sticky;top:calc(var(--nav-bar,80px) + 12px + var(--i,0) * 14px);display:grid;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);gap:clamp(1.6rem,3.2vw,3.4rem);padding:clamp(12px,1.25vw,20px);border-radius:22px;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);transform:scale(calc(1 - var(--depth) * .035));transform-origin:50% 0;scroll-margin-top:calc(var(--nav-bar,80px) + 1rem)}
.pj-board + .pj-board{box-shadow:inset 0 0 0 1px var(--line),0 -26px 50px -30px rgba(18,34,59,.35)}
.pj-board.is-tall{position:relative;top:auto}
.pj-bph{position:relative;min-width:0;align-self:start}
.pj-bph .pg-photo{border-radius:14px}
/* the photograph opens the full view; the hint sits top right, clear of the picture's lower corner */
.pj-zoom{position:absolute;inset:0;z-index:2;width:100%;height:100%;padding:0;border:0;border-radius:15px;background:transparent;cursor:zoom-in}
.pj-zoom span{position:absolute;right:14px;top:14px;display:inline-flex;align-items:center;height:32px;padding:0 .9rem;border-radius:9px;background:var(--navy);font:600 var(--fs-body) var(--sans);color:#f5f0e6;opacity:0;transform:translateY(-4px);transition:opacity .3s,transform .3s}
.pj-bph:hover .pj-zoom span,.pj-zoom:focus-visible span{opacity:1;transform:none}
.pj-zoom:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.pj-btxt{display:flex;flex-direction:column;justify-content:space-between;gap:1.6rem;min-width:0;padding:clamp(.5rem,1.3vw,1.4rem) clamp(.3rem,1.2vw,1.3rem) clamp(.3rem,.7vw,.7rem) 0}
.pj-btype{margin:0;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.pj-name{margin:.55rem 0 0;font-family:var(--display);font-weight:500;font-size:var(--fs-title);line-height:1.12;letter-spacing:-.02em;color:var(--ink);text-wrap:balance}
.pj-bloc{margin:.55rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.pj-sum{display:-webkit-box;margin:1.1rem 0 0;font-size:var(--fs-body);line-height:1.62;color:var(--ink2);-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;text-wrap:pretty}
.pj-mini{margin:0;border-top:1px solid var(--line)}
.pj-mini div{display:grid;grid-template-columns:6.2rem minmax(0,1fr);gap:1rem;padding:.62rem 0;border-bottom:1px solid var(--line)}
.pj-mini dt{font-size:var(--fs-body);color:var(--mute)}
.pj-mini dd{display:flex;align-items:center;gap:.45rem;margin:0;font-size:var(--fs-body);font-weight:500;line-height:1.45}
.pj-st{flex:none;width:8px;height:8px;border-radius:50%;background:#2f9e6b}
.pj-st[data-s=live]{background:#e8a215}
.pj-st[data-s=plan]{background:#0b7d91}
.pj-chip{display:none}
.pj-acts{display:flex;flex-wrap:wrap;align-items:center;gap:.8rem 1.4rem;margin-top:1.3rem}
.pj-view{height:2.75rem;padding:0 1.3rem;border:0;border-radius:10px;background:var(--navy);font:600 var(--fs-body) var(--sans);color:#f5f0e6;cursor:pointer;transition:background-color .3s}
.pj-view:hover{background:var(--accent)}
.pj-view:focus-visible,.pj-board .pg-link:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.pj-empty{margin:0;padding:3rem 0;text-align:center;font-size:var(--fs-body);color:var(--mute)}
.pj-empty button{border:0;border-bottom:1px solid currentColor;background:none;padding:0 0 2px;font:600 var(--fs-body) var(--sans);color:var(--ink);cursor:pointer}

/* the full view of a project */
.pj-dlg{width:min(1180px,calc(100vw - 2rem));max-width:none;max-height:calc(100svh - 2rem);margin:auto;padding:0;border:0;border-radius:20px;background:var(--card);color:var(--ink);font-family:var(--sans);overflow:auto;overscroll-behavior:contain;box-shadow:0 50px 100px -40px rgba(0,0,0,.6)}
.pj-dlg::backdrop{background:rgba(11,35,80,.62)}
.pj-dlg[open]{animation:pjIn .45s cubic-bezier(.2,.7,.2,1)}
@keyframes pjIn{from{opacity:0;transform:translateY(18px)}}
.pj-dlgin{position:relative;display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);min-height:100%}
.pj-dlgph{display:flex;align-items:center;background:#ddd3c2}
.pj-dlgph .pg-photo{width:100%;border-radius:0;box-shadow:none}
.pj-dlg.is-step .pj-dlgin{animation:pjSwap .4s ease}
@keyframes pjSwap{from{opacity:.2}}
html:has(.pj-dlg[open]){overflow:hidden}
.pj-dlgcopy{display:flex;flex-direction:column;padding:clamp(1.6rem,2.8vw,2.8rem) clamp(1.4rem,2.6vw,2.6rem)}
.pj-dlgmeta{display:flex;flex-wrap:wrap;gap:.2rem .9rem;margin:0;padding-right:3rem;font-size:var(--fs-body);color:var(--mute)}
.pj-dlgmeta span:first-child{font-weight:600;color:var(--accent)}
.pj-dlgt{margin:.6rem 0 0;font-family:var(--display);font-weight:500;font-size:var(--fs-title);line-height:1.12;letter-spacing:-.02em}
.pj-dlgsum{margin:1rem 0 0;font-size:var(--fs-body);line-height:1.65;color:var(--ink2);text-wrap:pretty}
.pj-facts{margin:1.4rem 0 0;border-top:1px solid var(--line)}
.pj-facts div{display:grid;grid-template-columns:6.5rem minmax(0,1fr);gap:1rem;padding:.7rem 0;border-bottom:1px solid var(--line)}
.pj-facts dt{font-size:var(--fs-body);color:var(--mute)}
.pj-facts dd{display:flex;align-items:center;gap:.45rem;margin:0;font-size:var(--fs-body);font-weight:500;line-height:1.45}
.pj-k{margin:0;font-size:var(--fs-body);font-weight:500;color:var(--mute)}
.pj-layers{margin-top:1.4rem}
.pj-layers ol{position:relative;margin:.7rem 0 0;padding:0 0 0 1.5rem;list-style:none}
.pj-layers ol::before{content:"";position:absolute;left:5px;top:.7rem;bottom:.7rem;width:1px;background:rgba(11,110,128,.35)}
.pj-layers li{position:relative;padding:.3rem 0;font-size:var(--fs-body);line-height:1.45}
.pj-layers li::before{content:"";position:absolute;left:-1.5rem;top:.62rem;width:11px;height:11px;border-radius:50%;background:var(--card);box-shadow:inset 0 0 0 2px var(--water)}
.pj-dlgacts{margin-top:1.8rem}
.pj-dlgnav{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:auto;padding-top:1.6rem}
.pj-dlgnav button{display:inline-flex;align-items:center;gap:.45rem;border:0;background:none;padding:.4rem 0;font:600 var(--fs-body) var(--sans);color:var(--ink);cursor:pointer}
.pj-dlgnav button span{transition:transform .25s}
.pj-dlgnav button:hover{color:var(--accent)}
.pj-dlgnav button[data-go="-1"]:hover span{transform:translateX(-3px)}
.pj-dlgnav button[data-go="1"]:hover span{transform:translateX(3px)}
.pj-dlgnav button:disabled{opacity:.3;pointer-events:none}
.pj-dlgnav button:focus-visible{outline:2px solid var(--accent);outline-offset:5px;border-radius:4px}
.pj-dlgnav span{font-size:var(--fs-body);font-variant-numeric:tabular-nums;color:var(--mute)}
.pj-x{position:absolute;right:14px;top:14px;z-index:3;display:grid;place-items:center;width:42px;height:42px;padding:0;border:0;border-radius:10px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);color:var(--ink);cursor:pointer}
.pj-x svg{width:16px;height:16px}
.pj-x:hover{background:var(--navy);color:#f5f0e6}
/* laptops with short screens: the whole view still fits without scrolling */
@media (min-width:900px) and (max-height:820px){
  .pj-dlgcopy{padding-block:1.5rem}
  .pj-dlgt{font-size:var(--fs-title)}
  .pj-dlgsum{margin-top:.8rem;font-size:var(--fs-body);line-height:1.55}
  .pj-facts{margin-top:1.1rem}
  .pj-facts div{padding:.55rem 0}
  .pj-layers{margin-top:1.1rem}
  .pj-layers li{padding:.2rem 0}
  .pj-layers li::before{top:.52rem}
  .pj-dlgacts{margin-top:1.3rem}
  .pj-dlgnav{padding-top:1rem}
}
@media (max-width:899px){
  .pj-dlgin{grid-template-columns:1fr}
  .pj-dlgnav{position:sticky;bottom:0;z-index:2;margin:1.6rem calc(-1 * clamp(1.4rem,2.6vw,2.6rem)) calc(-1 * clamp(1.6rem,2.8vw,2.8rem));padding:.55rem clamp(1.4rem,2.6vw,2.6rem) calc(.55rem + env(safe-area-inset-bottom));border-top:1px solid var(--line);background:rgba(245,240,230,.95);backdrop-filter:blur(10px)}
}

/* below wide screens the title sits above the line and the choices */
@media (max-width:1199px){
  .pj-herogrid{grid-template-columns:1fr;align-items:start;gap:1.4rem}
  .pj-heroside{gap:1.3rem}
  .pj-heroside .pg-intro{max-width:40rem}
}
/* tablets: each board stacks its photograph over its words */
@media (max-width:1023px){
  .pj-board{grid-template-columns:1fr;gap:1.4rem}
  .pj-btxt{padding:0 .6rem .6rem;gap:1.3rem}
  .pj-bfoot{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:1rem 2rem;align-items:end}
  .pj-acts{margin-top:0}
}
/* phones: a plain list of boards; the status sits on the photograph, the fuller facts wait in the full view */
@media (max-width:767px){
  /* one row of chips that scrolls sideways; the edges fade while there is more to see */
  .pj-tools{--fl:0px;--fr:0px;flex-direction:row;align-items:center;gap:.4rem;overflow-x:auto;margin-inline:calc(-1 * var(--gutter,16px));padding:0 var(--gutter,16px) 2px;scrollbar-width:none;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 var(--fl),#000 calc(100% - var(--fr)),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 var(--fl),#000 calc(100% - var(--fr)),transparent 100%)}
  .pj-tools.fade-l{--fl:28px}
  .pj-tools.fade-r{--fr:48px}
  .pj-tools::-webkit-scrollbar{display:none}
  .pj-filter{flex-wrap:nowrap;gap:.4rem}
  .pj-filter button{flex:none;height:2.35rem;padding:0 .85rem;font-size:var(--fs-body)}
  .pj-sep{display:block}
  .pj-hero{padding-bottom:1.6rem}
  .pj-deck{gap:1rem}
  .pj-board,.pj-board.is-tall{position:relative;top:auto;transform:none;gap:1rem;padding:10px 10px 18px;border-radius:20px;box-shadow:none}
  .pj-bph .pg-photo,.pj-zoom{border-radius:12px}
  .pj-chip{position:absolute;left:10px;top:10px;z-index:1;display:inline-flex;align-items:center;gap:.4rem;height:26px;padding:0 .65rem;border-radius:8px;background:var(--card);font-size:var(--fs-body);font-weight:600;color:var(--ink)}
  .pj-chip .pj-st[data-s=done]{background:#2f9e6b}
  .pj-chip .pj-st[data-s=live]{background:#e8a215}
  .pj-chip .pj-st[data-s=plan]{background:#0b7d91}
  .pj-zoom span{display:none}
  .pj-btxt{padding:0 .5rem;gap:1rem}
  .pj-name{margin-top:.4rem;font-size:var(--fs-title)}
  .pj-bloc{margin-top:.4rem;font-size:var(--fs-body)}
  .pj-sum{margin-top:.75rem;font-size:var(--fs-body);-webkit-line-clamp:3}
  .pj-bfoot{display:block}
  .pj-mini{display:none}
  .pj-acts{gap:.7rem 1.2rem}
  .pj-view{height:2.5rem;padding:0 1.1rem;font-size:var(--fs-body)}
  .pj-dlg{width:100vw;height:100svh;max-height:100svh;border-radius:0}
  .pj-dlgcopy{padding:1.4rem 1.1rem 1.8rem}
  .pj-dlgnav{margin:1.6rem -1.1rem -1.8rem;padding-inline:1.1rem}
  .pj-x{right:12px;top:12px}
}
@media (prefers-reduced-motion:reduce){
  .pj-board{transform:none}
}
`;
