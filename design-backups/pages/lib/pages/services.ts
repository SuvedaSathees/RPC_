/**
 * Services page.
 *
 *   opening        what we do, the ways to start, and an index of every service
 *   waterproofing  RPC's core service: what it covers, then the eight
 *                  waterproofing services from RPC's methods guide as a
 *                  register: what each protects against and the methods we use
 *   building       the six building services: homes, offices, factories,
 *                  renovation and leak repair, interiors and project
 *                  management, each with its scale, programme and what's included
 *   process        how a job runs, in six steps
 *   ways           three ways to work with us
 *   close          the ways to start
 *
 * Each service has its own id (its name, made into a link), so the footer, the
 * home page and the search results can link straight to it.
 */
import { METHODS, PLACES } from "../methods/data";
import { AREA_PURPOSE, SERVICE_CATEGORIES } from "../methods/doc";
import { arrow, ctaBand, esc, secHead, serviceSlug, tel, type ContactInfo, type PageOptions } from "./kit";

export interface ServiceData {
  id: string;
  title: string;
  short?: string;
  body: string;
  image: string;
  deliverables: readonly string[];
  timeline: string;
  scale: string;
}
export interface EngagementData {
  model: string;
  description: string;
  benefit: string;
}
export interface StepData {
  id: string;
  title: string;
  body: string;
}
export interface ServicesData {
  services: readonly ServiceData[];
  engagement: readonly EngagementData[];
  process: readonly StepData[];
  contact: ContactInfo;
}

export const SERVICES_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
] as const;

const ask = (title: string) => `/contact?service=${encodeURIComponent(title)}#enquiry`;

/** the methods the guide names for a place, by their short names */
const methodsFor = (area: string) =>
  (PLACES.find((p) => p.key === area)?.methods ?? []).map((n) => METHODS.find((m) => m.no === n)).filter((m): m is (typeof METHODS)[number] => Boolean(m));

/** a small line drawing for each place a waterproofing service covers */
const PLACE_ICON: Record<string, string> = {
  terrace: `<path d="M3 11h18M5 11v8h14v-8"/><path d="M7 7l2-3M12 7V3.5M17 7l-2-3"/><path d="M9 15h6"/>`,
  bathroom: `<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M6 12V6a2 2 0 0 1 4 0"/><path d="M8 19l-1 2M16 19l1 2"/>`,
  tank: `<rect x="5" y="6" width="14" height="14" rx="2"/><path d="M5 12c2.3-1.3 4.7 1.3 7 0s4.7-1.3 7 0"/><path d="M9 6V3.5h6V6"/>`,
  basement: `<path d="M3 9h18"/><path d="M5 9v11h14V9"/><path d="M9 20v-5h6v5"/><path d="M3 5.5c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0"/>`,
  balcony: `<path d="M4 13h16M4 13v7M20 13v7M8 13v7M12 13v7M16 13v7M3 20h18"/><path d="M7 13V5h10v8"/>`,
  walls: `<path d="M3 5h18v15H3z"/><path d="M3 10h18M3 15h18M9 5v5M15 10v5M9 15v5"/>`,
  podium: `<path d="M3 16h18v4H3z"/><path d="M8 16c0-3 1.8-5 4-5s4 2 4 5"/><path d="M12 11V5M12 7c1.5-2 3.5-2 4.5-1M12 8c-1.5-2-3.5-2-4.5-1"/>`,
  cracks: `<path d="M4 4h16v16H4z"/><path d="M12 4l-2 4 3 3-2 4 2 2-1 3"/>`,
};
const placeIcon = (area: string) =>
  `<span class="sv-wi" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${PLACE_ICON[area] ?? ""}</svg></span>`;

/** a small line drawing for each way to work with us, in their order */
const WAY_ICON = [
  `<path d="M4 20h16"/><path d="M6 20V10l6-5 6 5v10"/><path d="M10 20v-5h4v5"/><path d="M15 3.5l4 3"/>`,
  `<path d="M3 7h8v4H3zM13 7h8v4h-8zM8 13h8v4H8zM3 13h3v4H3zM18 13h3v4h-3z"/>`,
  `<path d="M12 3.5s6 6.7 6 10.5a6 6 0 0 1-12 0c0-3.8 6-10.5 6-10.5z"/><path d="M9.5 14.5l1.8 1.8 3.4-3.6"/>`,
];

/** a waterproofing service as a row of the register: what it is, what it protects against, the methods we use, and a quote */
function wpRow(s: (typeof SERVICE_CATEGORIES)[number]) {
  const ms = methodsFor(s.area);
  return `<li class="sv-w" id="${serviceSlug(s.title)}">
  <h3 class="sv-wt"><span>${esc(s.title)}</span>${placeIcon(s.area)}</h3>
  <div class="sv-wbody">
    <p class="sv-wp">${esc(AREA_PURPOSE[s.area] ?? "")}</p>
    <p class="sv-wml">Methods we use</p>
    <p class="sv-wm">${ms.length ? ms.map((m) => `<a href="/waterproofing#m-${m.key}" data-internal>${esc(m.short)}</a>`).join("") : `<span>Chosen on site</span>`}</p>
    <a class="sv-wask pg-link" href="${esc(ask(s.title))}" data-internal>Get a quote<span class="pg-vh"> for ${esc(s.title.toLowerCase())}</span>${arrow}</a>
  </div>
</li>`;
}

function buildRow(s: ServiceData) {
  const slug = serviceSlug(s.title);
  return `<article class="sv-b" id="${slug}" aria-labelledby="sv-${slug}">
  <header class="sv-bhead">
    ${s.short ? `<p class="sv-bshort">${esc(s.short)}</p>` : ""}
    <h3 class="sv-bt" id="sv-${slug}">${esc(s.title)}</h3>
  </header>
  <div class="sv-bin">
    <p class="sv-bbody">${esc(s.body)}</p>
    <dl class="sv-bmeta"><div><dt>Typical scale</dt><dd>${esc(s.scale)}</dd></div><div><dt>Programme</dt><dd>${esc(s.timeline)}</dd></div></dl>
    <p class="sv-binch">What’s included</p>
    <ul class="sv-binc">${s.deliverables.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
    <a class="pg-btn pg-btn--ink sv-bask" href="${esc(ask(s.title))}" data-internal>Get a quote<span class="pg-vh"> for ${esc(s.title.toLowerCase())}</span>${arrow}</a>
  </div>
</article>`;
}

export function servicesPageMarkup(d: ServicesData, o: PageOptions = {}) {
  void o;
  const c = d.contact;
  const [wp, ...build] = d.services;
  const head = `<header class="pg-head sv-head">
  <div class="pg-wrap">
    <div class="sv-headgrid">
      <div>
        <p class="pg-mark">Services</p>
        <h1 class="pg-h1">Waterproofing and construction services in&nbsp;Erode.</h1>
        <p class="pg-intro">Leak repair and waterproofing come first, then the buildings themselves: homes, offices and factories, interiors and project management, for clients across Erode, Coimbatore, Tiruppur and&nbsp;Salem.</p>
        <div class="pg-actions"><a class="pg-btn pg-btn--ink" href="/contact#enquiry" data-internal>Book a free site inspection${arrow}</a><a class="pg-btn pg-btn--line" href="${tel(c.phone)}">Call ${esc(c.phone)}</a></div>
      </div>
      <nav class="sv-index" aria-label="Our services">
        <div><p>Waterproofing<span>${SERVICE_CATEGORIES.length}</span></p><ul>${SERVICE_CATEGORIES.map((s) => `<li><a href="#${serviceSlug(s.title)}">${placeIcon(s.area)}${esc(s.title.replace(" waterproofing", ""))}</a></li>`).join("")}</ul></div>
        <div><p>Building<span>${build.length}</span></p><ul>${build.map((s) => `<li><a href="#${serviceSlug(s.title)}">${esc(s.title)}</a></li>`).join("")}</ul></div>
      </nav>
    </div>
  </div>
</header>`;

  const waterproofing = wp
    ? `<section class="pg-sec sv-wsec" id="${serviceSlug(wp.title)}" aria-labelledby="sv-w-h">
  <div class="pg-wrap">
    <div class="sv-wintro">
      <div>
        ${secHead({ label: wp.short ?? "Our core service", title: "Eight waterproofing services, from the terrace to the sump.", id: "sv-w-h" })}
      </div>
      <div class="sv-wpanel">
        <p>${esc(wp.body)}</p>
        <dl class="sv-wcov">${wp.deliverables
          .map((x) => {
            const [where = x, how = ""] = x.split(/:\s*/, 2);
            return `<div><dt>${esc(where)}</dt><dd>${esc(how.charAt(0).toUpperCase() + how.slice(1))}</dd></div>`;
          })
          .join("")}</dl>
        <dl class="sv-wfacts"><div><dt>Typical scale</dt><dd>${esc(wp.scale)}</dd></div><div><dt>Programme</dt><dd>${esc(wp.timeline)}</dd></div></dl>
      </div>
    </div>
    <ul class="sv-wgrid">${SERVICE_CATEGORIES.map(wpRow).join("")}</ul>
    <p class="sv-wmore"><a class="pg-link" href="/waterproofing" data-internal>All twelve waterproofing methods, and the twenty places they are used${arrow}</a></p>
  </div>
</section>`
    : "";

  const building = `<section class="pg-sec sv-bsec" id="building" aria-labelledby="sv-b-h">
  <div class="pg-wrap">
    ${secHead({ label: "Building", title: "Homes, offices and factories, built to stay dry.", id: "sv-b-h", lede: "Six building services from the same team, with every terrace, bathroom and sump waterproofed as the building goes up." })}
    <div class="sv-blist">${build.map(buildRow).join("")}</div>
  </div>
</section>`;

  const process = `<section class="pg-sec pg-sec--stone sv-psec" id="how-we-work" aria-labelledby="sv-p-h">
  <div class="pg-wrap">
    ${secHead({ label: "How a job runs", title: "From the first visit to the water test.", id: "sv-p-h", lede: "Six steps, in this order, on every waterproofing job we take on, large or small." })}
    <ol class="sv-steps">${d.process
      .map((s, i) => `<li><span class="sv-sno" aria-hidden="true">${i + 1}</span><div><h3 class="pg-h3"><span class="pg-vh">Step ${i + 1}: </span>${esc(s.title)}</h3><p>${esc(s.body)}</p></div></li>`)
      .join("")}</ol>
  </div>
</section>`;

  const ways = `<section class="pg-sec sv-ysec" id="ways-to-work" aria-labelledby="sv-y-h">
  <div class="pg-wrap">
    ${secHead({ label: "Ways to work with us", title: "Three ways to work with us.", id: "sv-y-h", lede: "Pick the arrangement that suits your project; the waterproofing specification stays the same in all three." })}
    <ul class="sv-ways">${d.engagement
      .map((m, i) => `<li><span class="sv-yi" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${WAY_ICON[i] ?? WAY_ICON[0]}</svg></span><h3 class="pg-h3">${esc(m.model)}</h3><p>${esc(m.description)}</p><p class="sv-yb"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>${esc(m.benefit)}</p></li>`)
      .join("")}</ul>
  </div>
</section>`;

  return `${head}\n${waterproofing}\n${building}\n${process}\n${ways}\n${ctaBand(c, {
    title: "Not sure which service you need?",
    steps: [
      ["Describe the problem", "A line on the form is enough: a leak, a repair or a new building."],
      ["Talk it through with an engineer", "A short call to understand the building and what you have noticed."],
      ["We visit before we advise", "A free site inspection, so the advice fits the building."],
    ],
  })}`;
}

export const SERVICES_CSS = `
/* the opening and the index of every service */
.sv-headgrid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:2rem clamp(2rem,5vw,6rem);align-items:end}
.sv-headgrid .pg-mark{margin-bottom:.9rem}
.sv-headgrid .pg-h1{max-width:18ch}
.sv-index{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.6rem;padding-top:1rem;border-top:1px solid rgba(18,34,59,.28)}
.sv-index p{margin:0 0 .5rem;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.sv-index ul{margin:0;padding:0;list-style:none}
.sv-index li{border-top:1px solid var(--line)}
.sv-index a{display:block;padding:.5rem 0;font-size:var(--fs-body);font-weight:500;text-decoration:none}
.sv-index a:hover{color:var(--accent)}

/* waterproofing: the core service, then its eight services as a register */
.sv-wsec{scroll-margin-top:var(--nav-bar,80px)}
.sv-wintro{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:1.6rem clamp(2rem,5vw,5rem);align-items:start;margin-bottom:clamp(2.4rem,6vh,3.6rem)}
.sv-wintro .pg-shead{margin-bottom:0}
.sv-wpanel{padding-top:1.25rem;border-top:1px solid rgba(18,34,59,.28)}
.sv-wpanel > p{margin:0;font-size:var(--fs-sub);line-height:1.55;color:var(--ink2)}
.sv-wcov{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 2rem;margin:1.4rem 0 0}
.sv-wcov div{padding:.8rem 0;border-top:1px solid var(--line)}
.sv-wcov dt,.sv-wfacts dd,.sv-bmeta dd{font-size:var(--fs-body);font-weight:600;line-height:1.4}
.sv-wcov dd{margin:.2rem 0 0;font-size:var(--fs-body);line-height:1.5;color:var(--mute)}
.sv-wfacts,.sv-bmeta{display:grid;grid-template-columns:1fr 1fr;gap:.8rem 2rem;margin:.4rem 0 0;padding-top:.9rem;border-top:1px solid var(--line)}
.sv-wfacts dt,.sv-bmeta dt{font-size:var(--fs-body);color:var(--mute)}
.sv-wfacts dd,.sv-bmeta dd{margin:.2rem 0 0}
/* the eight waterproofing services: cards, three to a row, each named on a dark blue band */
.sv-wgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(.9rem,1.6vw,1.3rem);margin:0;padding:0;list-style:none}
.sv-w{display:flex;flex-direction:column;overflow:hidden;border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1rem);transition:box-shadow .3s,transform .3s}
.sv-w:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 1px rgba(18,34,59,.3),0 22px 44px -32px rgba(18,34,59,.5)}
.sv-w:target{box-shadow:inset 0 0 0 2px var(--accent)}
.sv-wt{margin:0;padding:1.1rem 1.3rem;background:var(--navy);font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.25;letter-spacing:-.01em;color:#fff}
.sv-wbody{display:flex;flex:1;flex-direction:column;padding:1.1rem 1.3rem 1.3rem}
.sv-wp{margin:0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.sv-wml{margin:1.1rem 0 .45rem;font-size:var(--fs-body);font-weight:600;color:var(--mute)}
.sv-wm{display:flex;flex-wrap:wrap;gap:.35rem;margin:0}
.sv-wm a,.sv-wm span{display:inline-flex;align-items:center;min-height:2rem;padding:.2rem .65rem;border-radius:8px;background:var(--paper);box-shadow:inset 0 0 0 1px rgba(18,34,59,.1);font-size:var(--fs-body);font-weight:500;color:var(--ink);text-decoration:none;transition:background-color .2s,color .2s}
.sv-wm a:hover{background:var(--navy);color:#fff}
.sv-wm span{color:var(--mute)}
.sv-wask{align-self:flex-start;margin-top:auto;padding-top:1.3rem}
.sv-wmore{margin:clamp(1.4rem,3vh,2rem) 0 0}
/* every card in a grid the same size: rows share the tallest height, names get room for two lines */
.sv-wgrid,.sv-blist{grid-auto-rows:1fr}
.sv-wt{box-sizing:border-box;display:flex;align-items:center;min-height:calc(2.5em + 2.2rem)}
.sv-bt{min-height:2.4em}

/* the six building services: cards, three to a row */
.sv-blist{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(.9rem,1.6vw,1.3rem)}
.sv-b{display:flex;flex-direction:column;overflow:hidden;border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1rem)}
.sv-bhead{padding:1.3rem 1.4rem 1.2rem;background:var(--navy);color:#fff}
.sv-bshort{margin:0;font-size:var(--fs-body);font-weight:600;color:rgba(255,255,255,.66)}
.sv-bt{margin:.35rem 0 0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.2;letter-spacing:-.01em}
.sv-bin{display:flex;flex:1;flex-direction:column;padding:1.2rem 1.4rem 1.4rem}
.sv-bbody{margin:0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.sv-bmeta{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin:1.1rem 0 0;padding:.85rem 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.sv-bmeta dt{font-size:var(--fs-body);color:var(--mute)}
.sv-bmeta dd{margin:.2rem 0 0;font-size:var(--fs-body);font-weight:600;line-height:1.4}
.sv-binch{margin:1rem 0 .3rem;font-size:var(--fs-body);font-weight:600;color:var(--mute)}
.sv-binc{margin:0;padding:0;list-style:none}
.sv-binc li{position:relative;padding:.35rem 0 .35rem 1.1rem;font-size:var(--fs-body);line-height:1.45}
.sv-binc li::before{content:"";position:absolute;left:0;top:.95rem;width:.45rem;height:2px;background:var(--accent)}
.sv-bask{align-self:flex-start;margin-top:auto}
.sv-binc{margin-bottom:1.4rem}

/* how a job runs: six steps, in order */
.sv-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2.2rem clamp(1.4rem,3vw,3rem);margin:0;padding:0;list-style:none}
.sv-steps li{display:flex;flex-direction:column;gap:.4rem;padding-top:1rem;border-top:2px solid var(--navy)}
.sv-sno{font-size:var(--fs-body);font-weight:700;color:var(--accent);font-variant-numeric:tabular-nums}
.sv-steps p{margin:.2rem 0 0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}

/* three ways to work with us */
.sv-ways{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2rem clamp(1.4rem,3vw,3rem);margin:0;padding:0;list-style:none}
.sv-ways li{display:flex;flex-direction:column;padding-top:1.1rem;border-top:1px solid rgba(18,34,59,.32)}
.sv-ways li > p{margin:.6rem 0 0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.sv-ways .sv-yb{margin-top:auto;padding-top:1.1rem;font-weight:600;color:var(--ink)}

@media (max-width:1099px){
  .sv-wgrid,.sv-blist{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:1023px){
  .sv-headgrid,.sv-wintro{grid-template-columns:1fr}
  .sv-steps{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sv-ways{grid-template-columns:1fr}
}
@media (max-width:699px){
  .sv-wgrid,.sv-blist{grid-template-columns:minmax(0,1fr);grid-auto-rows:auto}
  .sv-wt{min-height:0}
  .sv-bt{min-height:0}
  .sv-steps,.sv-wcov{grid-template-columns:1fr}
  .sv-index{grid-template-columns:1fr 1fr;gap:1rem}
}
@media (max-width:479px){
  .sv-index{grid-template-columns:1fr}
}

/* ---- enhanced: the index as a dark panel, icons for the places, a joined-up process, the three ways as cards ---- */
.sv-index{gap:.8rem;padding:1rem;border-top:0;border-radius:16px;background:var(--navy);box-shadow:0 30px 60px -40px rgba(4,12,30,.7)}
.sv-index > div{padding:.6rem .7rem .4rem;border-radius:10px;background:rgba(255,255,255,.05)}
.sv-index p{display:flex;align-items:center;justify-content:space-between;margin:0 0 .4rem;color:#f5f0e6}
.sv-index p span{min-width:1.7rem;padding:.05rem .45rem;border-radius:999px;background:rgba(245,240,230,.14);font-weight:600;text-align:center;font-variant-numeric:tabular-nums}
.sv-index li{border-top:1px solid rgba(255,255,255,.08)}
.sv-index a{display:flex;align-items:center;gap:.55rem;padding:.45rem .2rem;color:rgba(245,240,230,.82);transition:color .2s}
.sv-index a:hover{color:#fff}
.sv-index .sv-wi{width:1.15rem;height:1.15rem;color:rgba(245,240,230,.55)}
.sv-index a:hover .sv-wi{color:#fff}
.sv-wi{display:inline-grid;place-items:center;flex:none}
.sv-wi svg{width:100%;height:100%}
.sv-wt{justify-content:space-between;gap:1rem}
.sv-wt .sv-wi{width:2.6rem;height:2.6rem;padding:.55rem;box-sizing:border-box;border-radius:12px;background:rgba(245,240,230,.1);color:#f5f0e6}
.sv-w:hover .sv-wt .sv-wi{background:#f5f0e6;color:var(--navy)}
.sv-wt .sv-wi{transition:background-color .25s,color .25s}

.sv-steps{counter-reset:none;gap:2.4rem clamp(1.4rem,3vw,3rem)}
.sv-steps li{position:relative;flex-direction:column;align-items:flex-start;gap:.9rem;padding-top:0;border-top:0}
.sv-sno{position:relative;z-index:1;display:grid;place-items:center;flex:none;width:2.8rem;height:2.8rem;border-radius:50%;background:var(--navy);box-shadow:0 0 0 6px var(--stone,#e2d9c8);font-size:var(--fs-body);font-weight:700;color:#f5f0e6}
.sv-steps li:not(:nth-child(3n))::after{content:"";position:absolute;top:1.4rem;left:3.4rem;right:calc(-1 * clamp(1.4rem,3vw,3rem));height:2px;background:repeating-linear-gradient(90deg,rgba(11,35,80,.35) 0 8px,transparent 8px 14px)}
.sv-steps li > div{min-width:0}
.sv-steps li:last-child .sv-sno{background:var(--accent)}

.sv-ways{gap:clamp(.9rem,1.6vw,1.3rem)}
.sv-ways li{padding:1.4rem 1.4rem 0;border-top:0;border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);overflow:hidden}
.sv-yi{display:grid;place-items:center;width:3rem;height:3rem;margin-bottom:1rem;border-radius:14px;background:var(--navy);color:#f5f0e6}
.sv-yi svg{width:1.5rem;height:1.5rem}
.sv-ways .sv-yb{display:flex;align-items:flex-start;gap:.55rem;margin:auto -1.4rem 0;padding:1rem 1.4rem;border-top:1px solid var(--line);background:rgba(18,34,59,.035);line-height:1.45}
.sv-ways li > p:not(.sv-yb){margin-bottom:1.2rem}
.sv-yb svg{flex:none;width:1rem;height:1rem;margin-top:.2rem;color:var(--accent)}

@media (max-width:1023px){
  .sv-steps li:not(:nth-child(3n))::after{display:none}
}
@media (max-width:699px){
  .sv-steps{gap:0}
  .sv-steps li{flex-direction:row;gap:1rem;padding-bottom:1.6rem}
  .sv-steps li > div{padding-top:.45rem}
  .sv-steps li:not(:last-child)::before{content:"";position:absolute;left:1.4rem;top:2.8rem;bottom:0;width:2px;margin-left:-1px;background:repeating-linear-gradient(rgba(11,35,80,.35) 0 8px,transparent 8px 14px)}
  .sv-index{grid-template-columns:1fr}
}
`;
