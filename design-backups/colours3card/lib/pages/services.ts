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
import { arrow, ctaBand, esc, secHead, serviceSlug, tel, two, type ContactInfo, type PageOptions } from "./kit";

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

/** a waterproofing service as a row of the register: what it is, what it protects against, the methods we use, and a quote */
function wpRow(s: (typeof SERVICE_CATEGORIES)[number]) {
  const ms = methodsFor(s.area);
  return `<li class="sv-w" id="${serviceSlug(s.title)}">
  <h3 class="sv-wt">${esc(s.title)}</h3>
  <p class="sv-wp">${esc(AREA_PURPOSE[s.area] ?? "")}</p>
  <p class="sv-wm">${ms.length ? ms.map((m) => `<a href="/waterproofing#m-${m.key}" data-internal>${esc(m.short)}</a>`).join(", ") : `<span>Chosen on site</span>`}</p>
  <a class="sv-wask pg-link" href="${esc(ask(s.title))}" data-internal>Get a quote<span class="pg-vh"> for ${esc(s.title.toLowerCase())}</span>${arrow}</a>
</li>`;
}

function buildRow(s: ServiceData) {
  const slug = serviceSlug(s.title);
  return `<article class="sv-b" id="${slug}" aria-labelledby="sv-${slug}">
  <div class="sv-bside">
    ${s.short ? `<p class="sv-bshort">${esc(s.short)}</p>` : ""}
    <h3 class="sv-bt" id="sv-${slug}">${esc(s.title)}</h3>
    <dl class="sv-bmeta"><div><dt>Typical scale</dt><dd>${esc(s.scale)}</dd></div><div><dt>Programme</dt><dd>${esc(s.timeline)}</dd></div></dl>
    <a class="pg-btn pg-btn--ink sv-bask" href="${esc(ask(s.title))}" data-internal>Get a quote<span class="pg-vh"> for ${esc(s.title.toLowerCase())}</span>${arrow}</a>
  </div>
  <div class="sv-bcopy">
    <p class="sv-bbody">${esc(s.body)}</p>
    <p class="sv-binch">What’s included</p>
    <ul class="sv-binc">${s.deliverables.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
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
    <div class="sv-reg">
      <p class="sv-rhead" aria-hidden="true"><span>Service</span><span>Protects against</span><span>Methods we use</span><span></span></p>
      <ul class="sv-wgrid">${SERVICE_CATEGORIES.map(wpRow).join("")}</ul>
    </div>
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
      .map((s, i) => `<li><span class="sv-sno">${two(i + 1)}</span><h3 class="pg-h3">${esc(s.title)}</h3><p>${esc(s.body)}</p></li>`)
      .join("")}</ol>
  </div>
</section>`;

  const ways = `<section class="pg-sec sv-ysec" id="ways-to-work" aria-labelledby="sv-y-h">
  <div class="pg-wrap">
    ${secHead({ label: "Ways to work with us", title: "Three ways to work with us.", id: "sv-y-h", lede: "Pick the arrangement that suits your project; the waterproofing specification stays the same in all three." })}
    <ul class="sv-ways">${d.engagement
      .map((m) => `<li><h3 class="pg-h3">${esc(m.model)}</h3><p>${esc(m.description)}</p><p class="sv-yb">${esc(m.benefit)}</p></li>`)
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
.sv-reg{--cols:minmax(0,1fr) minmax(0,1.35fr) minmax(0,1.25fr) 8rem}
.sv-rhead{display:grid;grid-template-columns:var(--cols);gap:1.5rem;margin:0;padding:0 0 .7rem;border-bottom:1px solid rgba(18,34,59,.32);font-size:var(--fs-body);color:var(--mute)}
.sv-wgrid{margin:0;padding:0;list-style:none}
.sv-w{display:grid;grid-template-columns:var(--cols);align-items:baseline;gap:1.5rem;padding:1.3rem 0;border-bottom:1px solid var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1rem)}
.sv-w:target{background:rgba(39,86,160,.06)}
.sv-wt{margin:0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.25;letter-spacing:-.01em}
.sv-wp{margin:0;font-size:var(--fs-body);line-height:1.55;color:var(--ink2)}
.sv-wm{margin:0;font-size:var(--fs-body);line-height:1.6;color:var(--mute)}
.sv-wm a{color:var(--water);font-weight:600;text-decoration:none;border-bottom:1px solid rgba(11,110,128,.35)}
.sv-wm a:hover{border-color:var(--water)}
.sv-wask{justify-self:end;white-space:nowrap}
.sv-wmore{margin:clamp(1.4rem,3vh,2rem) 0 0}

/* building: one spec row per service */
.sv-blist{border-top:1px solid rgba(18,34,59,.32)}
.sv-b{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr);gap:1.6rem clamp(2rem,5vw,5rem);padding:clamp(2rem,5vh,3rem) 0;border-bottom:1px solid var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1rem)}
.sv-bshort{margin:0;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.sv-bt{margin:.4rem 0 0;font-family:var(--display);font-weight:600;font-size:var(--fs-title);line-height:1.12;letter-spacing:-.02em}
.sv-bmeta{max-width:26rem;margin-top:1.4rem}
.sv-bask{margin-top:1.6rem}
.sv-bbody{margin:0;max-width:42rem;font-size:var(--fs-sub);line-height:1.55;color:var(--ink2)}
.sv-binch{margin:1.6rem 0 0;font-size:var(--fs-body);font-weight:600;color:var(--mute)}
.sv-binc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 2rem;margin:.5rem 0 0;padding:0;list-style:none}
.sv-binc li{padding:.7rem 0;border-top:1px solid var(--line);font-size:var(--fs-body);line-height:1.45}

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

@media (max-width:1023px){
  .sv-headgrid,.sv-wintro,.sv-b{grid-template-columns:1fr}
  .sv-reg{--cols:minmax(0,1fr) minmax(0,1.3fr) 7rem}
  .sv-rhead span:nth-child(3),.sv-wm{display:none}
  .sv-steps{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sv-ways{grid-template-columns:1fr}
}
@media (max-width:767px){
  .sv-rhead{display:none}
  .sv-wgrid{border-top:1px solid rgba(18,34,59,.32)}
  .sv-w{grid-template-columns:1fr;gap:.35rem}
  .sv-wm{display:block}
  .sv-wask{justify-self:start;margin-top:.4rem}
  .sv-steps,.sv-wcov,.sv-binc{grid-template-columns:1fr}
  .sv-index{grid-template-columns:1fr 1fr;gap:1rem}
  .sv-bt{font-size:var(--fs-sub)}
}
@media (max-width:479px){
  .sv-index{grid-template-columns:1fr}
}
`;
