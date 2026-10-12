/**
 * Projects page: a compact opening with the title, a line on what we build,
 * and chips that narrow the projects by status and by town; then each project
 * in words alone (no photographs or drawings): its type and status, name and
 * place, the waterproofing built into it in the order it goes in, what it is,
 * the story of its waterproofing, its structure and materials, and a way to
 * ask about something similar. /projects#slug lands on that project (the home
 * page links so).
 */
import { arrow, ctaBand, esc, mark, words, type ContactInfo, type PageOptions } from "./kit";
import { SEARCH_BAR_CSS, searchBar } from "./search-bar";

export interface ProjectData {
  slug: string;
  name: string;
  location: string;
  type: string;
  status: string;
  image: string;
  summary: string;
  /** the story of its waterproofing */
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
/** "HDPE membrane under the raft · DPC · …" → its layers, in the order they go in */
const layersOf = (p: ProjectData) =>
  (p.waterproofing ?? "")
    .split("·")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1));

const pin = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14.5s-4.6-3.9-4.6-7.6a4.6 4.6 0 0 1 9.2 0c0 3.7-4.6 7.6-4.6 7.6z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="6.9" r="1.6" fill="currentColor"/></svg>`;

/** one project as a simple card: where it stands, its name and town, a line on it, the waterproofing built in, and a way to ask */
function row(p: ProjectData) {
  const layers = layersOf(p);
  const text = [p.name, p.location, p.type, p.status, p.summary, p.waterproofing ?? "", p.materials ?? ""].join(" ").toLowerCase();
  return `<article class="pj-row" id="${esc(p.slug)}" data-town="${esc(town(p.location))}" data-status="${esc(p.status)}" data-text="${esc(text)}" aria-labelledby="pj-${esc(p.slug)}">
  <p class="pj-top"><span class="pj-stat" data-s="${dot(p.status)}"><i class="pj-st" data-s="${dot(p.status)}"></i>${esc(p.status)}</span><span class="pj-type">${esc(p.type)}</span></p>
  <h2 class="pj-name" id="pj-${esc(p.slug)}">${esc(p.name)}</h2>
  <p class="pj-loc">${pin}${esc(p.location)}</p>
  <p class="pj-lead">${esc(p.summary)}</p>
  ${layers.length ? `<div class="pj-wp"><p class="pj-k">Waterproofing built in</p><ul class="pj-chips">${layers.map((l) => `<li>${esc(l)}</li>`).join("")}</ul></div>` : ""}
  <a class="pj-ask" href="/contact?project=${encodeURIComponent(p.name)}#enquiry" data-internal>Ask about a similar project${arrow}</a>
</article>`;
}

export function projectsPageMarkup(d: ProjectsData, o: PageOptions = {}) {
  void o;
  const ps = d.projects;
  const count = (f: (p: ProjectData) => boolean) => ps.filter(f).length;
  const statuses = [...new Set(ps.map((p) => p.status))].sort((a, b) => STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b));
  const towns = [...new Set(ps.map((p) => town(p.location)))];
  const bar = searchBar({
    label: "Search projects",
    placeholder: "Search projects",
    cls: "pj-bar",
    hidden: true,
    filters: [
      { key: "status", label: "Status", options: [{ value: "all", text: `All statuses (${ps.length})` }, ...statuses.map((st) => ({ value: st, text: `${st} (${count((p) => p.status === st)})` }))] },
      { key: "town", label: "Town", options: [{ value: "all", text: `All towns (${ps.length})` }, ...towns.map((t) => ({ value: t, text: `${t} (${count((p) => town(p.location) === t)})` }))] },
    ],
  });
  return `<header class="pg-head pj-hero">
  <div class="pg-wrap">
    <div class="pj-herogrid">
      <div>${mark("01", "Projects")}<h1 class="pj-h1" data-rv="words">${words("Projects built to stay&nbsp;dry.")}</h1></div>
      <div class="pj-heroside">
        ${bar}
        <p class="pj-showing" aria-live="polite">Showing all ${ps.length} projects</p>
      </div>
    </div>
  </div>
</header>
<section class="pj-listwrap" aria-label="Projects">
  <div class="pg-wrap">
    <div class="pj-list" id="project-list">${ps.map(row).join("\n")}</div>
    <p class="pj-empty" hidden>No projects match your search. <button type="button" data-reset>Show all projects</button></p>
  </div>
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

export const PROJECTS_CSS = SEARCH_BAR_CSS + `
/* the opening: the title, and beside it a line on what we build and the choices */
.pj-hero{padding-bottom:clamp(2.2rem,5vh,3.6rem);border-bottom:0}
.pj-herogrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:1.8rem clamp(2rem,5vw,6rem);align-items:end}
.pj-herogrid .pg-mark{margin-bottom:.9rem}
.pj-h1{margin:0;font-family:var(--display);font-weight:600;font-size:var(--fs-title);line-height:1.12;letter-spacing:-.02em;text-wrap:balance}
.pj-heroside{display:flex;flex-direction:column;gap:1.5rem;min-width:0;padding-bottom:.45rem}
.pj-heroside .pg-intro{margin:0}

/* the search bar, shown once scripts run */
.pj-heroside{align-self:end}
.pj-bar{max-width:42rem;margin-left:auto}
/* the running count is read out, not shown */
.pj-showing{position:absolute;width:1px;height:1px;margin:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

/* the projects as cards, three to a row */
.pj-listwrap{padding:clamp(.4rem,1.6vh,1rem) 0 clamp(4.5rem,12vh,7.5rem)}
/* the cards: plain and even, three to a row */
.pj-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:stretch;gap:clamp(.9rem,1.5vw,1.2rem)}
.pj-row{display:flex;flex-direction:column;padding:1.3rem 1.35rem 0;border-radius:18px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1rem);transition:box-shadow .3s,transform .3s}
.pj-row:hover{box-shadow:inset 0 0 0 1px rgba(18,34,59,.28),0 24px 44px -34px rgba(18,34,59,.55);transform:translateY(-2px)}
.pj-row[hidden]{display:none}
.pj-row:target{box-shadow:inset 0 0 0 2px var(--accent),0 0 0 6px rgba(39,86,160,.1)}
.pj-top{display:flex;align-items:center;justify-content:space-between;gap:.6rem;margin:0}
.pj-stat{display:inline-flex;align-items:center;gap:.45rem;height:1.9rem;padding:0 .75rem;border-radius:999px;background:rgba(47,158,107,.12);font-size:var(--fs-body);font-weight:600;color:#1f7a4f}
.pj-stat[data-s=live]{background:rgba(232,162,21,.16);color:#9a6408}
.pj-stat[data-s=plan]{background:rgba(39,86,160,.12);color:var(--accent)}
.pj-st{flex:none;width:7px;height:7px;border-radius:50%;background:currentColor}
.pj-type{font-size:var(--fs-body);color:var(--mute)}
.pj-name{margin:1rem 0 0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.15;letter-spacing:-.015em;color:var(--ink);text-wrap:balance}
.pj-loc{display:flex;align-items:center;gap:.35rem;margin:.35rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.pj-loc svg{flex:none;width:.95rem;height:.95rem}
.pj-lead{margin:.8rem 0 1.2rem;font-size:var(--fs-body);line-height:1.55;color:var(--ink2);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.pj-wp{margin-top:-.2rem}
.pj-k{margin:0 0 .45rem;font-size:var(--fs-body);font-weight:600;color:var(--ink)}
.pj-chips{display:flex;flex-wrap:wrap;gap:.35rem;margin:0;padding:0;list-style:none}
.pj-chips li{padding:.25rem .65rem;border-radius:8px;background:rgba(18,34,59,.06);font-size:var(--fs-body);line-height:1.4;color:var(--ink)}
.pj-ask{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin:auto -1.35rem 0;padding:1rem 1.35rem;border-top:1px solid var(--line);font-size:var(--fs-body);font-weight:600;color:var(--accent);text-decoration:none;transition:background-color .2s,color .2s}
.pj-ask .pg-ar{width:1rem;height:1rem;transition:transform .2s}
.pj-ask:hover{background:var(--navy);color:#f5f0e6}
.pj-ask:hover .pg-ar{transform:translate(2px,-2px)}
.pj-ask:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.pj-wp{margin-bottom:1.2rem}
.pj-empty{margin:0;padding:3rem 0;text-align:center;font-size:var(--fs-body);color:var(--mute)}
.pj-empty button{border:0;border-bottom:1px solid currentColor;background:none;padding:0 0 2px;font:600 var(--fs-body) var(--sans);color:var(--ink);cursor:pointer}

/* below wide screens the title sits above the line and the choices */
@media (max-width:1199px){
  .pj-herogrid{grid-template-columns:1fr;align-items:start;gap:1.4rem}
  .pj-heroside{gap:1.3rem}
  .pj-heroside .pg-intro{max-width:40rem}
}
/* tablets: two to a row; phones: one */
@media (max-width:1099px){.pj-list{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:699px){.pj-list{grid-template-columns:minmax(0,1fr)}}
@media (max-width:767px){
  .pj-bar{max-width:none}
  .pj-hero{padding-bottom:1.6rem}
  .pj-row{padding:1.2rem 1.1rem 0}
  .pj-ask{margin-inline:-1.1rem;padding-inline:1.1rem}
}
`;
