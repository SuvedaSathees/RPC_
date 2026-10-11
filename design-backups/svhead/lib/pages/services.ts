/**
 * Services page, kept to what we do and what search engines read.
 *
 *   opening        the page's heading (the services and the towns), a line on
 *                  the free inspection and where we work, and links to the lists
 *   waterproofing  the eight waterproofing services from RPC's methods guide:
 *                  what each protects against, and a quote
 *   building       the six building services, each with its line and a quote
 *   questions      what people ask before they book (also set out for search
 *                  engines on the page)
 *   close          the ways to start
 *
 * Each service has its own id (its name, made into a link), so the footer, the
 * home page and the search results can link straight to it.
 */
import { AREA_PURPOSE, SERVICE_CATEGORIES } from "../methods/doc";
import { arrow, ctaBand, esc, secHead, serviceSlug, type ContactInfo, type PageOptions } from "./kit";

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

/** a small line drawing for each building service, by a word in its name */
const BUILD_ICON: readonly (readonly [RegExp, string])[] = [
  [/residential/i, `<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>`],
  [/commercial/i, `<path d="M5 21V4h10v17"/><path d="M15 9h4v12"/><path d="M8 8h1M11 8h1M8 12h1M11 12h1M8 16h1M11 16h1"/><path d="M3 21h18"/>`],
  [/industrial/i, `<path d="M3 21V11l6 3V11l6 3V6h4v15z"/><path d="M3 21h18"/><path d="M7 18h2M12 18h2"/>`],
  [/renovation|repair/i, `<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2-2z"/>`],
  [/interior/i, `<path d="M4 18v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5"/><path d="M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/><path d="M3 18h18M6 18v2M18 18v2"/>`],
  [/project|management/i, `<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8.5 10l1.5 1.5 3-3M8.5 16h7"/>`],
];
const buildIcon = (title: string) =>
  `<span class="sv-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${BUILD_ICON.find(([r]) => r.test(title))?.[1] ?? BUILD_ICON[0]![1]}</svg></span>`;

/** a small line drawing for each way to work with us, in their order */
/** the questions people ask, answered from what the rest of the site already says (also set out for search engines on the page) */
export function serviceFaq(d: Pick<ServicesData, "services" | "process" | "contact">): { q: string; a: string }[] {
  const c = d.contact;
  const [hq, ...towns] = c.regions;
  const street = c.address.split(",").slice(0, 2).join(",").trim();
  const test = d.process.find((p) => /test/i.test(p.title));
  const repair = d.services.find((s) => /repair/i.test(s.title));
  const list = (xs: readonly string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
  return [
    { q: "Which areas do you work in?", a: `We work from our office on ${street}, across ${list([hq ?? "Erode", ...towns])}.` },
    { q: "Is the site inspection free?", a: "Yes. An engineer visits, traces where the water is getting in, and only then recommends one method and a price, in writing." },
    { q: "Which waterproofing method will my building need?", a: "It depends on where the water comes from, the surface and how much it moves. Our guide covers twelve methods, from cementitious coats to crystalline and injection grouting; the final choice is made on site." },
    ...(test ? [{ q: "How do you check that the waterproofing works?", a: test.body }] : []),
    ...(repair ? [{ q: "Can you repair a leak in a building that is already in use?", a: `Yes. ${repair.body}` }] : []),
    { q: "Do you also build new buildings?", a: "Yes: homes, offices and factories, with every terrace, bathroom and sump waterproofed as the building goes up." },
    { q: "How soon will you reply to an enquiry?", a: "An engineer replies within one working day, by phone or on WhatsApp." },
  ];
}

/** a waterproofing service as a card: its icon and name, what it protects against, the methods we use, and a quote */
function wpRow(s: (typeof SERVICE_CATEGORIES)[number]) {
  return `<li class="sv-card sv-w" id="${serviceSlug(s.title)}">
  <span class="sv-icon">${placeIcon(s.area)}</span>
  <h3 class="sv-ct">${esc(s.title)}</h3>
  <p class="sv-cp">${esc(AREA_PURPOSE[s.area] ?? "")}</p>
  <a class="sv-go" href="${esc(ask(s.title))}" data-internal>Get a quote<span class="pg-vh"> for ${esc(s.title.toLowerCase())}</span>${arrow}</a>
</li>`;
}

/** a building service as a card: its icon, name and line, its scale and programme, what's included, and a quote */
function buildRow(s: ServiceData) {
  const slug = serviceSlug(s.title);
  return `<article class="sv-card sv-b" id="${slug}" aria-labelledby="sv-${slug}">
  ${buildIcon(s.title)}
  <h3 class="sv-ct" id="sv-${slug}">${esc(s.title)}</h3>
  <p class="sv-cp">${esc(s.body)}</p>
  <a class="sv-go" href="${esc(ask(s.title))}" data-internal>Get a quote<span class="pg-vh"> for ${esc(s.title.toLowerCase())}</span>${arrow}</a>
</article>`;
}

export function servicesPageMarkup(d: ServicesData, o: PageOptions = {}) {
  void o;
  const c = d.contact;
  const [wp, ...build] = d.services;
  const [hq, ...towns] = c.regions;
  const where = towns.length ? `${towns.slice(0, -1).join(", ")}${towns.length > 1 ? " and " : ""}${towns[towns.length - 1]}` : "";
  const head = `<header class="pg-head sv-head">
  <div class="pg-wrap sv-headgrid">
    <div>
      <p class="pg-mark">Services</p>
      <h1 class="pg-h1">Waterproofing and construction services in ${esc(hq ?? "Erode")}, Coimbatore and&nbsp;Tiruppur.</h1>
    </div>
    <div class="sv-hside">
      <p class="pg-intro">Every job starts with a free site inspection. We work from ${esc(hq ?? "Erode")} across ${esc(where)}.</p>
      <ul class="sv-jump" aria-label="On this page">
        <li><a href="#${wp ? serviceSlug(wp.title) : "building"}">Waterproofing services</a></li>
        <li><a href="#building">Construction services</a></li>
        <li><a href="#questions">Questions</a></li>
      </ul>
    </div>
  </div>
</header>`;

  const waterproofing = wp
    ? `<section class="pg-sec sv-wsec" id="${serviceSlug(wp.title)}" aria-labelledby="sv-w-h">
  <div class="pg-wrap">
    ${secHead({ label: "Waterproofing services", title: "From the terrace to the sump.", id: "sv-w-h" })}
    <ul class="sv-wgrid">${SERVICE_CATEGORIES.map(wpRow).join("")}</ul>
  </div>
</section>`
    : "";

  const building = `<section class="pg-sec pg-sec--stone sv-bsec" id="building" aria-labelledby="sv-b-h">
  <div class="pg-wrap">
    ${secHead({ label: "Construction services", title: "Homes, offices and factories, built to stay dry.", id: "sv-b-h" })}
    <div class="sv-blist">${build.map(buildRow).join("")}</div>
  </div>
</section>`;

  const faq = `<section class="pg-sec sv-fsec" id="questions" aria-labelledby="sv-f-h">
  <div class="pg-wrap sv-fgrid">
    ${secHead({ label: "Questions", title: "Waterproofing questions, answered.", id: "sv-f-h", lede: "What people in Erode and Coimbatore ask us before they book." })}
    <div class="sv-faq">${serviceFaq(d)
      .map((f, i) => `<details class="sv-q"${i === 0 ? " open" : ""}><summary><h3>${esc(f.q)}</h3><span class="sv-qi" aria-hidden="true"></span></summary><p>${esc(f.a)}</p></details>`)
      .join("")}</div>
  </div>
</section>`;

  return `${head}\n${waterproofing}\n${building}\n${faq}\n${ctaBand(c, {
    title: "Not sure which service you need?",
    steps: [
      ["Describe the problem", "A line on the form is enough: a leak, a repair or a new building."],
      ["Talk it through with an engineer", "A short call to understand the building and what you have noticed."],
      ["We visit before we advise", "A free site inspection, so the advice fits the building."],
    ],
  })}`;
}

export const SERVICES_CSS = `
/* the opening: the title on the left, a line and the ways to start on the right */
.sv-headgrid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:1.6rem clamp(2rem,5vw,6rem);align-items:end}
.sv-headgrid .pg-mark{margin-bottom:.9rem}
.sv-headgrid .pg-h1{max-width:22ch}
.sv-hside .pg-intro{margin:0}
.sv-head{padding-bottom:clamp(1.4rem,3.5vh,2.2rem);border-bottom:0}
.sv-hside{display:flex;flex-direction:column;gap:1rem;padding-bottom:.4rem}
.sv-jump{display:flex;flex-wrap:wrap;gap:.4rem;margin:0;padding:0;list-style:none}
.sv-jump a{display:inline-flex;align-items:center;height:2.3rem;padding:0 .9rem;border-radius:999px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);font-size:var(--fs-body);font-weight:600;color:var(--ink);text-decoration:none;transition:box-shadow .2s,background-color .2s}
.sv-jump a:hover{box-shadow:inset 0 0 0 1.5px var(--navy)}
.sv-jump a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sv-wsec,.sv-bsec{scroll-margin-top:var(--nav-bar,80px)}

/* the cards (waterproofing and building alike): an icon, the name, a line, the details, and a quote along the foot */
.sv-wgrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(.8rem,1.3vw,1.1rem);margin:0;padding:0;list-style:none}
.sv-blist{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(.8rem,1.3vw,1.1rem)}
.sv-card{display:flex;flex-direction:column;padding:1.4rem 1.4rem 0;border-radius:18px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1rem);transition:box-shadow .3s,transform .3s}
.sv-card:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 1px rgba(18,34,59,.28),0 24px 44px -34px rgba(18,34,59,.55)}
.sv-card:target{box-shadow:inset 0 0 0 2px var(--accent),0 0 0 6px rgba(39,86,160,.1)}
.sv-icon{display:grid;place-items:center;width:2.9rem;height:2.9rem;border-radius:14px;background:var(--navy);color:#f5f0e6}
.sv-icon .sv-wi{display:contents}
.sv-icon svg{width:1.4rem;height:1.4rem}
.sv-ct{margin:1rem 0 0;font-family:var(--display);font-size:var(--fs-sub);font-weight:600;line-height:1.2;letter-spacing:-.015em;color:var(--ink)}
.sv-cp{margin:.5rem 0 1.3rem;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.sv-b .sv-cp{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}
.sv-wsec{padding-top:calc(var(--nav-room,80px) + clamp(1.5rem,4vh,2.5rem))}
.sv-cm{margin:.8rem 0 1.2rem;font-size:var(--fs-body);line-height:1.55;color:var(--ink2)}
.sv-cm span{font-weight:600;color:var(--ink)}
.sv-cm a{color:var(--accent);text-decoration:none;border-bottom:1px solid rgba(39,86,160,.3)}
.sv-cm a:hover{border-color:var(--accent)}
.sv-cm em{font-style:normal;color:var(--mute)}
.sv-go{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin:auto -1.4rem 0;padding:.9rem 1.4rem;border-top:1px solid var(--line);font-size:var(--fs-body);font-weight:600;color:var(--accent);text-decoration:none;transition:background-color .2s,color .2s}
.sv-go .pg-ar{width:1rem;height:1rem;transition:transform .2s}
.sv-go:hover{background:var(--navy);color:#f5f0e6}
.sv-go:hover .pg-ar{transform:translate(2px,-2px)}
.sv-go:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.sv-btop{display:flex;align-items:center;gap:.8rem}
.sv-bshort{margin:.2rem 0 0;font-size:var(--fs-body);font-weight:600;line-height:1.35;color:var(--accent)}
.sv-bmeta{display:flex;flex-wrap:wrap;gap:.4rem;margin:-.4rem 0 1.2rem}
.sv-bmeta span{padding:.25rem .65rem;border-radius:999px;background:rgba(18,34,59,.06);font-size:var(--fs-body);font-weight:500;color:var(--ink)}
.sv-bmeta dt{font-size:var(--fs-body);color:var(--mute)}
.sv-bmeta dd{margin:.15rem 0 0;font-size:var(--fs-body);font-weight:600;line-height:1.35;color:var(--ink)}
.sv-binc{display:flex;flex-direction:column;gap:.35rem;margin:1rem 0 1.3rem;padding:0;list-style:none}
.sv-binc li{position:relative;padding-left:1.5rem;font-size:var(--fs-body);line-height:1.45;color:var(--ink)}
.sv-binc li::before{content:"";position:absolute;left:0;top:.2rem;width:1rem;height:1rem;border-radius:50%;background:rgba(39,86,160,.14) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 8.3l2.3 2.3 4.7-5' fill='none' stroke='%232756a0' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/.75rem no-repeat}
.sv-wmore{margin:clamp(1.4rem,3vh,2rem) 0 0}

/* how a job runs: six steps on one line, joined */

/* three ways to work with us */

/* questions: the heading beside, each question opening to its answer */
.sv-fgrid{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:1.6rem clamp(2rem,5vw,5rem);align-items:start}
.sv-fgrid .pg-shead{margin-bottom:0}
.sv-faq{display:flex;flex-direction:column;gap:.5rem}
.sv-q{border-radius:14px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);interpolate-size:allow-keywords}
.sv-q::details-content{height:0;overflow:clip;transition:height .3s ease,content-visibility .3s allow-discrete}
.sv-q[open]::details-content{height:auto}
.sv-q summary{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.2rem;list-style:none;cursor:pointer}
.sv-q summary::-webkit-details-marker{display:none}
.sv-q summary:focus-visible{outline:2px solid var(--accent);outline-offset:-2px;border-radius:14px}
.sv-q h3{margin:0;font-size:var(--fs-body);font-weight:600;line-height:1.4;color:var(--ink)}
.sv-qi{position:relative;flex:none;width:1.8rem;height:1.8rem;border-radius:50%;background:rgba(18,34,59,.07);transition:transform .3s,background-color .2s}
.sv-qi::before,.sv-qi::after{content:"";position:absolute;left:50%;top:50%;width:.7rem;height:1.6px;margin:-.8px 0 0 -.35rem;background:var(--ink)}
.sv-qi::after{transform:rotate(90deg)}
.sv-q[open] .sv-qi{transform:rotate(45deg);background:var(--navy)}
.sv-q[open] .sv-qi::before,.sv-q[open] .sv-qi::after{background:#fff}
.sv-q p{margin:0;padding:0 1.2rem 1.1rem;font-size:var(--fs-body);line-height:1.65;color:var(--ink2)}

@media (max-width:1199px){
  .sv-wgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .sv-blist{grid-template-columns:repeat(2,minmax(0,1fr))}
  /* the six steps keep to one line, which slides sideways */
}
@media (max-width:1023px){
  .sv-headgrid,.sv-fgrid{grid-template-columns:1fr}
}
@media (max-width:699px){
  .sv-wgrid,.sv-blist{grid-template-columns:minmax(0,1fr)}
  .sv-wcov{grid-template-columns:1fr}
  .sv-jump{flex-wrap:nowrap;overflow-x:auto;margin-inline:calc(-1 * var(--gutter,16px));padding:0 var(--gutter,16px) 4px;scrollbar-width:none}
  .sv-jump::-webkit-scrollbar{display:none}
  .sv-jump a{flex:none}
}
`;
