/**
 * Services page.
 *
 *   opening        what we do, the ways to start, and an index of every service
 *   waterproofing  RPC's core service: what it covers, then the eight
 *                  waterproofing services from RPC's methods guide, each with
 *                  what it protects against and the methods we use for it
 *   building       the six building services: homes, offices, factories,
 *                  renovation and leak repair, interiors and project
 *                  management, each with a frame for RPC's own photograph
 *   process        how a job runs, in six steps
 *   ways           three ways to work with us
 *   close          the ways to start
 *
 * Each service has its own id (its name, made into a link), so the footer, the
 * home page and the search results can link straight to it.
 */
import { METHODS, PLACES } from "../methods/data";
import { AREA_PURPOSE, SERVICE_CATEGORIES } from "../methods/doc";
import { arrow, ctaBand, esc, ph, secHead, serviceSlug, tel, tick, two, words, type ContactInfo, type PageOptions } from "./kit";

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
/** the button under each service: to the enquiry form with the service already chosen */
const quote = (title: string, cls: string) =>
  `<a class="${cls}" href="${esc(ask(title))}" data-internal><span>Get a quote<span class="pg-vh"> for ${esc(title.toLowerCase())}</span></span><i aria-hidden="true">${arrow}</i></a>`;

/** a small drawing for each waterproofing service */
const AREA_ICON: Record<string, string> = {
  terrace: `<path d="M4.5 11h15v8.5h-15z"/><path d="M3 11h18"/><path d="M8 3.8v2.4M12 3v2.4M16 3.8v2.4"/><path d="M10 19.5v-4h4v4"/>`,
  bathroom: `<path d="M5 20V8.5a4 4 0 0 1 8 0"/><path d="M10 8.5h6"/><path d="M11 11.6v1.2M14 11.6v1.2M17 11.6v1.2M12.5 15v1.2M15.5 15v1.2"/>`,
  tank: `<ellipse cx="12" cy="6" rx="7" ry="2.4"/><path d="M5 6v11.4c0 1.3 3.1 2.4 7 2.4s7-1.1 7-2.4V6"/><path d="M5 12.4c0 1.3 3.1 2.4 7 2.4s7-1.1 7-2.4"/>`,
  basement: `<path d="M3 9.5h18"/><path d="M6.5 9.5v10h11v-10"/><path d="M4.5 6.5 6 5M9.5 6.5 11 5M14.5 6.5 16 5"/><path d="M9.5 19.5v-4h5v4"/>`,
  balcony: `<path d="M6 4.5h12v5H6z"/><path d="M4 12h16M4 19.5h16"/><path d="M5.5 12v7.5M9.5 12v7.5M14.5 12v7.5M18.5 12v7.5"/>`,
  walls: `<rect x="3.5" y="5" width="17" height="14" rx="1"/><path d="M3.5 9.7h17M3.5 14.3h17M9 5v4.7M15 9.7v4.6M9 14.3V19"/>`,
  podium: `<path d="M4 19.5h16"/><path d="M6 19.5V15h12v4.5"/><path d="M12 15V9.5"/><path d="M12 11.2c-3 0-4.5-2-4.5-4 2.5 0 4.5 1.5 4.5 4zM12 10.2c0-2.5 1.8-4.5 4.5-4.5 0 2.6-2 4.5-4.5 4.5z"/>`,
  cracks: `<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="m12.5 4.5-2 4 3 3-2.5 3.5 1.5 4.5"/>`,
};
const areaIcon = (k: string) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${AREA_ICON[k] ?? AREA_ICON.terrace}</svg>`;

/** the methods the guide names for a place, by their short names */
const methodsFor = (area: string) =>
  (PLACES.find((p) => p.key === area)?.methods ?? []).map((n) => METHODS.find((m) => m.no === n)).filter((m): m is (typeof METHODS)[number] => Boolean(m));

function wpCard(s: (typeof SERVICE_CATEGORIES)[number]) {
  const ms = methodsFor(s.area);
  return `<li class="sv-w" id="${serviceSlug(s.title)}" data-rv>
  <span class="sv-wico">${areaIcon(s.area)}</span>
  <h3 class="sv-wt">${esc(s.title)}</h3>
  <p class="sv-wp">${esc(AREA_PURPOSE[s.area] ?? "")}</p>
  ${ms.length ? `<p class="sv-wm"><span>Methods we use</span>${ms.map((m) => `<a href="/waterproofing#m-${m.key}" data-internal>${esc(m.short)}</a>`).join("")}</p>` : ""}
  ${quote(s.title, "pg-cbtn sv-wask")}
</li>`;
}

function buildRow(s: ServiceData) {
  const slug = serviceSlug(s.title);
  return `<article class="sv-b" id="${slug}" aria-labelledby="sv-${slug}" data-rv>
  <div class="sv-bph">${ph({ ratio: "4/3", label: `Photo: ${s.title.toLowerCase()} by RPC` })}</div>
  <div class="sv-bcopy">
    ${s.short ? `<p class="sv-bshort">${esc(s.short)}</p>` : ""}
    <h3 class="sv-bt" id="sv-${slug}">${esc(s.title)}</h3>
    <p class="sv-bbody">${esc(s.body)}</p>
    <ul class="sv-binc" aria-label="What’s included">${s.deliverables.map((d) => `<li>${tick}<span>${esc(d)}</span></li>`).join("")}</ul>
    <dl class="sv-bmeta"><div><dt>Typical scale</dt><dd>${esc(s.scale)}</dd></div><div><dt>Programme</dt><dd>${esc(s.timeline)}</dd></div></dl>
    ${quote(s.title, "pg-cbtn pg-cbtn--ink sv-bask")}
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
        <h1 class="pg-h1" data-rv="words">${words("Waterproofing and construction services in&nbsp;Erode.")}</h1>
        <p class="pg-intro" data-rv>Leak repair and waterproofing come first, then the buildings themselves: homes, offices and factories, interiors and project management, for clients across Erode, Coimbatore, Tiruppur and&nbsp;Salem.</p>
        <div class="pg-actions" data-rv><a class="pg-btn pg-btn--ink" href="/contact#enquiry" data-internal>Book a free site inspection${arrow}</a><a class="pg-btn pg-btn--line" href="${tel(c.phone)}">Call ${esc(c.phone)}</a></div>
      </div>
      <nav class="sv-index" aria-label="Our services" data-rv>
        <div><p>Waterproofing</p><ul>${SERVICE_CATEGORIES.map((s) => `<li><a href="#${serviceSlug(s.title)}">${esc(s.title.replace(" waterproofing", ""))}</a></li>`).join("")}</ul></div>
        <div><p>Building</p><ul>${build.map((s) => `<li><a href="#${serviceSlug(s.title)}">${esc(s.title)}</a></li>`).join("")}</ul></div>
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
      <div class="sv-wpanel" data-rv>
        <p>${esc(wp.body)}</p>
        <ul>${wp.deliverables.map((x) => `<li>${tick}<span>${esc(x)}</span></li>`).join("")}</ul>
        <dl><div><dt>Typical scale</dt><dd>${esc(wp.scale)}</dd></div><div><dt>Programme</dt><dd>${esc(wp.timeline)}</dd></div></dl>
      </div>
    </div>
    <ul class="sv-wgrid" data-rv-stagger="60">${SERVICE_CATEGORIES.map(wpCard).join("")}</ul>
    <p class="sv-wmore"><a class="pg-link" href="/waterproofing" data-internal>All twelve waterproofing methods, and the twenty places they are used${arrow}</a></p>
  </div>
</section>`
    : "";

  const building = `<section class="pg-sec pg-sec--stone sv-bsec" id="building" aria-labelledby="sv-b-h">
  <div class="pg-wrap">
    ${secHead({ label: "Building", title: "Homes, offices and factories, built to stay dry.", id: "sv-b-h", lede: "Six building services from the same team, with every terrace, bathroom and sump waterproofed as the building goes up." })}
    <div class="sv-blist">${build.map(buildRow).join("")}</div>
  </div>
</section>`;

  const process = `<section class="pg-sec sv-psec" id="how-we-work" aria-labelledby="sv-p-h">
  <div class="pg-wrap">
    ${secHead({ label: "How a job runs", title: "From the first visit to the water test.", id: "sv-p-h", lede: "Six steps, in this order, on every waterproofing job we take on, large or small." })}
    <ol class="sv-steps" data-rv-stagger="80">${d.process
      .map((s, i) => `<li data-rv><span class="sv-sno">${two(i + 1)}</span><h3 class="pg-h3">${esc(s.title)}</h3><p>${esc(s.body)}</p></li>`)
      .join("")}</ol>
  </div>
</section>`;

  const ways = `<section class="pg-sec pg-sec--sky sv-ysec" id="ways-to-work" aria-labelledby="sv-y-h">
  <div class="pg-wrap">
    ${secHead({ label: "Ways to work with us", title: "Three ways to work with us.", id: "sv-y-h", lede: "Pick the arrangement that suits your project; the waterproofing specification stays the same in all three." })}
    <ul class="sv-ways" data-rv-stagger="90">${d.engagement
      .map((m) => `<li data-rv><h3 class="pg-h3">${esc(m.model)}</h3><p>${esc(m.description)}</p><p class="sv-yb">${tick}<span>${esc(m.benefit)}</span></p></li>`)
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
.sv-index{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.4rem;padding:clamp(1.2rem,2vw,1.6rem);border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
.sv-index p{margin:0 0 .5rem;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.sv-index ul{margin:0;padding:0;list-style:none}
.sv-index li{border-top:1px solid var(--line)}
.sv-index a{display:block;padding:.5rem 0;font-size:var(--fs-body);font-weight:500;text-decoration:none}
.sv-index a:hover{color:var(--accent)}

/* waterproofing: the core service, then its eight services */
.sv-wsec{scroll-margin-top:var(--nav-bar,80px)}
.sv-wintro{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:1.6rem clamp(2rem,5vw,5rem);align-items:start;margin-bottom:clamp(1.8rem,4vh,2.6rem)}
.sv-wintro .pg-shead{margin-bottom:0}
.sv-wpanel{padding:clamp(1.3rem,2.2vw,1.8rem);border-radius:16px;background:var(--sky)}
.sv-wpanel > p{margin:0;font-size:var(--fs-body);line-height:1.65;color:var(--ink)}
.sv-wpanel ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem 1.2rem;margin:1rem 0 0;padding:0;list-style:none}
.sv-wpanel li,.sv-binc li{display:flex;align-items:flex-start;gap:.55rem;font-size:var(--fs-body);line-height:1.45}
.sv-wpanel .pg-tick,.sv-binc .pg-tick,.sv-yb .pg-tick{width:20px;height:20px;margin-top:.05rem;padding:3px;border-radius:6px;background:rgba(39,86,160,.12);color:var(--accent)}
.sv-wpanel dl,.sv-bmeta{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin:1.1rem 0 0;padding-top:.9rem;border-top:1px solid rgba(39,86,160,.2)}
.sv-wpanel dt,.sv-bmeta dt{font-size:var(--fs-body);color:var(--mute)}
.sv-wpanel dd,.sv-bmeta dd{margin:.2rem 0 0;font-size:var(--fs-body);font-weight:600;line-height:1.4}
.sv-wgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(.7rem,1.2vw,1rem);margin:0;padding:0;list-style:none}
.sv-w{display:flex;flex-direction:column;gap:.7rem;padding:clamp(1.1rem,1.6vw,1.4rem);border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1rem)}
.sv-wico{display:grid;place-items:center;width:3rem;height:3rem;border-radius:12px;background:rgba(11,110,128,.12);color:var(--water)}
.sv-wico svg{width:1.6rem;height:1.6rem}
.sv-wt{margin:.2rem 0 0;font-family:var(--display);font-weight:500;font-size:var(--fs-sub);line-height:1.22;letter-spacing:-.01em}
.sv-wp{margin:0;font-size:var(--fs-body);line-height:1.55;color:var(--ink2)}
.sv-wm{display:flex;flex-wrap:wrap;gap:.35rem;margin:0}
.sv-wm span{flex-basis:100%;font-size:var(--fs-body);color:var(--mute)}
.sv-wm a{display:inline-flex;align-items:center;height:1.9rem;padding:0 .6rem;border-radius:7px;box-shadow:inset 0 0 0 1px rgba(11,110,128,.4);font-size:var(--fs-body);font-weight:500;color:var(--water);text-decoration:none}
.sv-wm a:hover{background:var(--water);color:#f5f0e6}
.sv-wask{margin-top:auto}
.sv-wmore{margin:clamp(1.4rem,3vh,2rem) 0 0}

/* building: one row per service, its photograph's frame beside it */
.sv-blist{display:flex;flex-direction:column;gap:clamp(.8rem,1.4vw,1.2rem)}
.sv-b{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.4fr);gap:clamp(1.2rem,3vw,3rem);align-items:center;padding:clamp(.8rem,1.2vw,1rem);border-radius:18px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1rem)}
.sv-bcopy{padding:clamp(.4rem,1.4vw,1.2rem) clamp(.4rem,1.6vw,1.6rem) clamp(.4rem,1.4vw,1.2rem) 0}
.sv-bshort{margin:0;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.sv-bt{margin:.4rem 0 0;font-family:var(--display);font-weight:500;font-size:var(--fs-title);line-height:1.12;letter-spacing:-.02em}
.sv-bbody{margin:.8rem 0 0;max-width:42rem;font-size:var(--fs-body);line-height:1.65;color:var(--ink2)}
.sv-binc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem 1.2rem;margin:1.1rem 0 0;padding:0;list-style:none}
.sv-bmeta{max-width:30rem;border-top-color:var(--line)}
.sv-bask{margin-top:1.3rem}

/* how a job runs */
.sv-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 clamp(1.4rem,3vw,3rem);margin:0;padding:0;list-style:none;counter-reset:s}
.sv-steps li{display:grid;grid-template-columns:3rem minmax(0,1fr);gap:.2rem 1rem;padding:1.4rem 0;border-top:1px solid var(--line)}
.sv-sno{grid-row:span 2;font-family:var(--display);font-weight:500;font-size:var(--fs-sub);line-height:1.2;color:var(--accent);font-variant-numeric:tabular-nums}
.sv-steps p{margin:.3rem 0 0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}

/* three ways to work with us */
.sv-ways{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(.8rem,1.4vw,1.2rem);margin:0;padding:0;list-style:none}
.sv-ways li{display:flex;flex-direction:column;padding:clamp(1.3rem,2.2vw,1.8rem);border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px rgba(39,86,160,.14)}
.sv-ways li > p{margin:.7rem 0 0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.sv-ways .sv-yb{display:flex;align-items:flex-start;gap:.55rem;margin-top:auto;padding-top:1.2rem;font-weight:600;color:var(--ink)}

@media (max-width:1199px){
  .sv-wgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:1023px){
  .sv-headgrid,.sv-wintro{grid-template-columns:1fr}
  .sv-b{grid-template-columns:1fr}
  .sv-bcopy{padding:.4rem .6rem .8rem}
  .sv-steps{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sv-ways{grid-template-columns:1fr}
}
@media (max-width:767px){
  .sv-wgrid,.sv-steps{grid-template-columns:1fr}
  .sv-wpanel ul,.sv-binc{grid-template-columns:1fr}
  .sv-index{grid-template-columns:1fr 1fr;gap:1rem}
  .sv-bt{font-size:var(--fs-sub)}
}
@media (max-width:479px){
  .sv-index{grid-template-columns:1fr}
}
`;
