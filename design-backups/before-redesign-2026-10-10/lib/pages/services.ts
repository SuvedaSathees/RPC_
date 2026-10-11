/**
 * Services page. A light opening with the title, a line on what we do, the
 * two ways to start and an index of the seven services. Waterproofing, RPC's
 * core service, comes first as a dark feature listing the places it covers
 * and the system used on each. The other six follow as
 * cards, each with its photograph, what it covers, what is included, the
 * typical scale and programme, and a way to ask about it. Then the three ways
 * to work with RPC, and the close. Everything arrives as it comes into view.
 */
import { arrow, crumbs, ctaBand, esc, photo, serviceSlug, tel, words, type ContactInfo, type PageOptions } from "./kit";

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
export interface ServicesData {
  services: readonly ServiceData[];
  engagement: readonly EngagementData[];
  contact: ContactInfo;
}

export const SERVICES_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
] as const;

const tick = `<svg class="sv-tick" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ask = (s: ServiceData) => `/contact?service=${encodeURIComponent(s.title)}#enquiry`;
const meta = (s: ServiceData) => `<dl class="sv-meta"><div><dt>Typical scale</dt><dd>${esc(s.scale)}</dd></div><div><dt>Programme</dt><dd>${esc(s.timeline)}</dd></div></dl>`;

/** waterproofing first, on night blue: its protection listed from the raft up to the roof */
function feature(s: ServiceData, o: PageOptions) {
  const slug = serviceSlug(s.title);
  return `<article class="sv-feat" id="${slug}" aria-labelledby="sv-${slug}" data-rv="rise">
  <div class="sv-fph">${photo(s.image, "A three-storey house with its terraces, bathrooms, sump, basement and pool highlighted where they are waterproofed", "(min-width:1024px) 52vw, 94vw", o, { eager: true })}</div>
  <div class="sv-ftxt">
    ${s.short ? `<p class="sv-short">${esc(s.short)}</p>` : ""}
    <h2 class="sv-ftitle" id="sv-${slug}">${esc(s.title)}</h2>
    <p class="sv-fbody">${esc(s.body)}</p>
    <div class="sv-rise">
      <p class="sv-risek">What we waterproof</p>
      <ul class="sv-layers">${s.deliverables.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
      <a class="pg-link sv-mlink" href="/waterproofing" data-internal>Compare all twelve methods${arrow}</a>
    </div>
    <div class="sv-ffoot">${meta(s)}<a class="pg-btn pg-btn--paper" href="${esc(ask(s))}" data-internal>Ask about ${esc(s.title.toLowerCase())}${arrow}</a></div>
  </div>
</article>`;
}

/** every other service as a card */
function card(s: ServiceData, o: PageOptions) {
  const slug = serviceSlug(s.title);
  return `<article class="sv-card" id="${slug}" aria-labelledby="sv-${slug}" data-rv>
  <div class="sv-cph">${photo(s.image, `${s.title} by RPC Constructions`, "(min-width:1024px) 30vw, (min-width:768px) 46vw, 94vw", o)}</div>
  <div class="sv-cbody">
    ${s.short ? `<p class="sv-short">${esc(s.short)}</p>` : ""}
    <h2 class="sv-title" id="sv-${slug}">${esc(s.title)}</h2>
    <p class="sv-body">${esc(s.body)}</p>
    <ul class="sv-inc" aria-label="What’s included">${s.deliverables.map((d) => `<li>${tick}<span>${esc(d)}</span></li>`).join("")}</ul>
    ${meta(s)}
    <a class="pg-link sv-ask" href="${esc(ask(s))}" data-internal>Ask about ${esc(s.title.toLowerCase())}${arrow}</a>
  </div>
</article>`;
}

export function servicesPageMarkup(d: ServicesData, o: PageOptions = {}) {
  const [first, ...rest] = d.services;
  const index = d.services.map((s) => `<li data-rv><a href="#${serviceSlug(s.title)}">${esc(s.title)}</a></li>`).join("");
  const head = `<header class="pg-head sv-head">
  <div class="pg-wrap">
    <div class="sv-headgrid">
      <div>
        ${crumbs(SERVICES_TRAIL)}
        <h1 class="sv-h1" data-rv="words">${words("Waterproofing and building services in&nbsp;Erode.")}</h1>
      </div>
      <div class="sv-headside" data-rv>
        <p class="pg-intro">Leak repair and waterproofing come first, then the buildings themselves: seven services from one team, for homes and businesses in Erode, Coimbatore, Tiruppur and&nbsp;Salem.</p>
        <div class="pg-actions"><a class="pg-btn pg-btn--ink" href="/contact#enquiry" data-internal>Book a free site inspection${arrow}</a><a class="pg-btn pg-btn--line" href="${tel(d.contact.phone)}">Call ${esc(d.contact.phone)}</a></div>
      </div>
    </div>
    <nav class="sv-index" aria-label="Our services"><ul data-rv-stagger="60">${index}</ul></nav>
  </div>
</header>`;
  const list = `<section class="sv-list" aria-label="Our services">
  <div class="pg-wrap">
    ${first ? feature(first, o) : ""}
    <div class="sv-grid" data-rv-stagger="110">${rest.map((s) => card(s, o)).join("\n")}</div>
  </div>
</section>`;
  const ways = `<section class="pg-sec pg-sec--stone sv-wayssec" aria-labelledby="sv-ways">
  <div class="pg-wrap">
    <div class="sv-wayshead">
      <h2 class="pg-h2" id="sv-ways" data-rv="words">${words("Three ways to work with&nbsp;us.")}</h2>
      <p class="pg-lede" data-rv>Pick the arrangement that suits your project; the waterproofing specification stays the same in all three.</p>
    </div>
    <ul class="sv-ways" data-rv-stagger="110">${d.engagement
      .map((m) => `<li data-rv><h3>${esc(m.model)}</h3><p>${esc(m.description)}</p><p class="sv-wbenefit">${tick}<span>${esc(m.benefit)}</span></p></li>`)
      .join("")}</ul>
  </div>
</section>`;
  return `${head}\n${list}\n${ways}\n${ctaBand(d.contact, {
    title: "Not sure which service you need?",
    steps: [
      ["Describe the problem", "A line on the form is enough: a leak, a repair or a new building."],
      ["Talk it through with an engineer", "A short call to understand the building and what you have noticed."],
      ["We visit before we advise", "A free site inspection, so the advice fits the building."],
    ],
  })}`;
}

export const SERVICES_CSS = `
/* the opening */
.sv-head{padding-bottom:clamp(2rem,5vh,3.2rem);border-bottom:0}
.sv-headgrid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:1.6rem clamp(2rem,5vw,6rem);align-items:end}
.sv-h1{margin:clamp(1rem,2.6vh,1.8rem) 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.92;letter-spacing:-.03em;text-wrap:balance}
.sv-headside{padding-bottom:.4rem}
.sv-headside .pg-intro{margin-top:0}
.sv-index{margin-top:clamp(2rem,5vh,3.2rem);padding-top:1.3rem;border-top:1px solid var(--line)}
.sv-index ul{display:flex;flex-wrap:wrap;gap:.45rem;margin:0;padding:0;list-style:none}
.sv-index a{display:inline-flex;align-items:center;height:2.4rem;padding:0 1rem;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(16,26,34,.16);font-size:var(--fs-body);font-weight:500;text-decoration:none;transition:background-color .3s,color .3s,box-shadow .3s}
.sv-index a:hover{background:var(--ink);box-shadow:none;color:#f3f5f6}
.sv-index a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}

/* waterproofing first, on night blue */
.sv-list{padding:clamp(1rem,3vh,2rem) 0 clamp(4.5rem,12vh,8rem)}
.sv-feat{--ink:#ecf2f5;--ink2:rgba(236,242,245,.76);--mute:rgba(236,242,245,.56);--line:rgba(236,242,245,.14);--accent:#4cc9d9;display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:clamp(1.6rem,3.4vw,3.6rem);align-items:center;padding:clamp(12px,1.3vw,20px);border-radius:28px;background:var(--night);color:var(--ink);scroll-margin-top:110px}
.sv-fph{min-width:0;align-self:center}
.sv-fph .pg-photo{border-radius:17px;background:#15293a}
.sv-ftxt{min-width:0;padding:clamp(.8rem,2vw,2rem) clamp(.4rem,1.6vw,1.8rem) clamp(.8rem,2vw,2rem) 0}
.sv-short{margin:0;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.sv-ftitle{margin:.5rem 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.95;letter-spacing:-.025em}
.sv-fbody{margin:1rem 0 0;max-width:34rem;font-size:var(--fs-body);line-height:1.65;color:var(--ink2);text-wrap:pretty}
.sv-rise{margin-top:1.6rem}
.sv-risek{margin:0;font-size:var(--fs-body);color:var(--mute)}
/* listed raft first, shown with the roof on top, as in a section through the building */
.sv-layers{position:relative;display:flex;flex-direction:column;margin:.8rem 0 0;padding:0 0 0 1.6rem;list-style:none}
.sv-layers::before{content:"";position:absolute;left:5px;top:.75rem;bottom:.75rem;width:1px;background:linear-gradient(to bottom,rgba(76,201,217,.7),rgba(76,201,217,.2))}
.sv-layers li{position:relative;padding:.32rem 0;font-size:var(--fs-body);line-height:1.45}
.sv-mlink{margin-top:1.2rem}
.sv-layers li::before{content:"";position:absolute;left:-1.6rem;top:.72rem;width:11px;height:11px;border-radius:50%;background:var(--night);box-shadow:inset 0 0 0 2px var(--accent)}
.sv-layers li:first-child::before{background:var(--accent)}
.sv-ffoot{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1.2rem 2rem;margin-top:1.5rem;padding-top:1.1rem;border-top:1px solid var(--line)}
.sv-feat .sv-meta{flex:1 1 15rem;margin:0;padding:0;border:0}
.sv-feat .pg-btn--paper{color:#101a22}
.sv-feat .pg-btn:focus-visible{outline:2px solid var(--accent);outline-offset:3px}

/* the other six, as cards */
.sv-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(1.2rem,2vw,2rem);margin-top:clamp(1.2rem,2vw,2rem)}
.sv-card{display:flex;flex-direction:column;min-width:0;padding:10px;border-radius:24px;background:#fff;box-shadow:inset 0 0 0 1px rgba(16,26,34,.07),0 30px 60px -48px rgba(16,26,34,.45);scroll-margin-top:110px}
.sv-card[data-rv]{transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform 1.05s cubic-bezier(.2,.75,.15,1),translate .5s cubic-bezier(.2,.7,.2,1),box-shadow .5s;transition-delay:var(--rvd,0ms),var(--rvd,0ms),0s,0s}
.sv-card:hover{translate:0 -4px;box-shadow:inset 0 0 0 1px rgba(16,26,34,.09),0 40px 70px -46px rgba(16,26,34,.55)}
.sv-cph .pg-photo{border-radius:16px}
.sv-cbody{display:flex;flex-direction:column;flex:1;padding:1.2rem .8rem .6rem}
.sv-card .sv-short{color:var(--accent)}
.sv-title{margin:.45rem 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-sub);line-height:1;letter-spacing:-.018em}
.sv-body{margin:.8rem 0 0;font-size:var(--fs-body);line-height:1.62;color:var(--ink2);text-wrap:pretty}
.sv-inc{display:flex;flex-direction:column;gap:.45rem;margin:1.1rem 0 0;padding:1.1rem 0 0;list-style:none;border-top:1px solid var(--line)}
.sv-inc li{display:flex;align-items:flex-start;gap:.55rem;font-size:var(--fs-body);line-height:1.45}
.sv-tick{flex:none;width:16px;height:16px;margin-top:.1rem;padding:2px;border-radius:50%;background:rgba(11,110,128,.1);color:var(--accent)}
.sv-meta{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin:1.1rem 0 0;padding:.9rem 0 0;border-top:1px solid var(--line)}
.sv-meta dt{font-size:var(--fs-body);color:var(--mute)}
.sv-meta dd{margin:.2rem 0 0;font-size:var(--fs-body);font-weight:600;line-height:1.4}
.sv-ask{align-self:flex-start;margin-top:auto;padding-top:0}
.sv-cbody .sv-meta{margin-bottom:1.3rem}
.sv-ask:focus-visible{outline:2px solid var(--accent);outline-offset:3px}

/* three ways to work with us */
.sv-wayshead{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:1.2rem clamp(2rem,6vw,7rem);align-items:end;margin-bottom:clamp(2rem,5vh,3.4rem)}
.sv-wayshead .pg-h2{margin:0}
.sv-ways{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(1rem,1.6vw,1.6rem);margin:0;padding:0;list-style:none}
.sv-ways li{display:flex;flex-direction:column;padding:clamp(1.4rem,2.2vw,2.2rem);border-radius:22px;background:#fbfcfd;box-shadow:inset 0 0 0 1px rgba(16,26,34,.07)}
.sv-ways h3{margin:0;font-family:var(--serif);font-weight:400;font-size:var(--fs-sub);line-height:1.02;letter-spacing:-.015em}
.sv-ways li > p{margin:.9rem 0 0;font-size:var(--fs-body);line-height:1.62;color:var(--ink2)}
.sv-ways .sv-wbenefit{display:flex;align-items:flex-start;gap:.55rem;margin-top:auto;padding-top:1.4rem;font-weight:600;color:var(--ink)}
.sv-ways li > p:nth-of-type(1){margin-bottom:1.4rem}

@media (max-width:1199px){
  .sv-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:1023px){
  .sv-headgrid,.sv-wayshead{grid-template-columns:1fr;align-items:start}
  .sv-feat{grid-template-columns:1fr}
  .sv-ftxt{padding:.4rem .8rem 1rem}
  .sv-ways{grid-template-columns:1fr}
}
@media (max-width:767px){
  .sv-h1{font-size:var(--fs-title)}
  .sv-index{margin-top:1.8rem;padding-top:1rem}
  .sv-index ul{flex-wrap:nowrap;overflow-x:auto;margin-inline:calc(-1 * var(--gutter,16px));padding:0 var(--gutter,16px) 2px;scrollbar-width:none}
  .sv-index ul::-webkit-scrollbar{display:none}
  .sv-index li{flex:none}
  .sv-index a{height:2.3rem;font-size:var(--fs-body)}
  .sv-grid{grid-template-columns:1fr}
  .sv-feat{padding:10px;border-radius:22px}
  .sv-fph .pg-photo{border-radius:14px}
  .sv-ftitle{font-size:var(--fs-title)}
  .sv-feat .pg-btn{width:100%}
  .sv-ffoot{flex-direction:column;align-items:stretch}
  .sv-feat .sv-meta{flex:none}
  .sv-card:hover{translate:none}
}
`;
