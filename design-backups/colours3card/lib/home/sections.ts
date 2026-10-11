/**
 * Home page, below the hero, in a calm, professional register: sand and stone
 * grounds, one dark blue band, hairline rules and plain type, no icons, tiles
 * or motion.
 *
 *   Projects   the projects as a register: name, type, place, waterproofing, status
 *   Services   (dark blue) waterproofing and the places it covers, then the six
 *              building services as a list
 *   About      who we are, the facts, and four short promises
 *   Products   a job as a rendered cut-away, layer by layer, with the products that
 *              do each layer (lib/products/home.ts)
 *   -- Record  four numbers (not used on the home page)
 *   Contact    the close: the ways to reach an engineer
 *
 * Plain strings and one mount function, so the server renders every word and
 * the page works before scripts arrive. Each section has one headline written
 * around what people search for, one line under it and the links that matter.
 * No photographs are shown until RPC's own are in.
 */

export interface HomeProject {
  slug: string;
  name: string;
  location: string;
  type: string;
  area: string;
  year: string;
  status: string;
  image: string;
  waterproofing?: string;
}
export interface HomeService {
  id: string;
  title: string;
  /** one short line beside the title in the index */
  line?: string;
  short?: string;
  /** what the service covers: "Area: how", shown on the home page for the first service only */
  deliverables?: readonly string[];
  image: string;
  timeline: string;
  scale: string;
}
export interface HomeData {
  projects: readonly HomeProject[];
  services: readonly HomeService[];
  /** the About section's short promises */
  points: readonly { title: string; body: string }[];
  stats: readonly { value: number | string; suffix: string; label: string }[];
  contact: { email: string; phone: string; address: string; hours: string; whatsapp: string; mapQuery: string; socials: readonly { label: string; href: string }[] };
  brand: { name: string; descriptor: string; established: string };
  /** for the products section: how many there are, from which brands, and the brand tiles, rendered on the server (lib/products/home.ts) */
  products?: {
    count: number;
    brands: readonly string[];
    teaser: string;
  };
}
export interface HomeOptions {
  /** plain image URLs (the local test page has no image optimiser) */
  rawImages?: boolean;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const serviceSlug = (title: string) => title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const tel = (p: string) => `tel:${p.replace(/[^0-9+]/g, "")}`;
const arrow = `<svg class="hm-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const STATUS_DOT: Record<string, string> = { Completed: "done", "Under construction": "live", "In design": "plan" };

/** a section's head: a small label and the headline, with a link at the right */
const head = (label: string, title: string, id: string, link = "") =>
  `<header class="hm-head"><div><p class="hm-label">${esc(label)}</p><h2 class="hm-h2" id="${id}">${title}</h2></div>${link ? `<div class="hm-hlink">${link}</div>` : ""}</header>`;

/* ------------------------------------------------------------------ projects */
function projectsMarkup(d: HomeData, _o: HomeOptions) {
  const rows = d.projects
    .map((p) => {
      const wp = (p.waterproofing ?? "").split(/\s*·\s*/).filter(Boolean);
      return `<li><a class="hm-rrow" href="/projects#${esc(p.slug)}" data-internal>
  <span class="hm-rname">${esc(p.name)}</span>
  <span class="hm-rtype">${esc(p.type)}</span>
  <span class="hm-rloc">${esc(p.location)}</span>
  <span class="hm-rwp">${esc(wp.slice(0, 3).join(", "))}${wp.length > 3 ? ` and ${wp.length - 3} more` : ""}</span>
  <span class="hm-rst"><i data-s="${STATUS_DOT[p.status] ?? "done"}" aria-hidden="true"></i>${esc(p.status)}</span>
  <span class="hm-rgo" aria-hidden="true">${arrow}</span>
</a></li>`;
    })
    .join("");
  return `<section class="hm-sec hm-projects" id="projects" aria-labelledby="projects-title">
  <div class="hm-wrap">
    ${head("Selected projects", "Built dry across Tamil&nbsp;Nadu.", "projects-title", `<a class="hm-link" href="/projects" data-internal>All projects${arrow}</a>`)}
    <div class="hm-reg">
      <p class="hm-rhead" aria-hidden="true"><span>Project</span><span>Type</span><span>Location</span><span>Waterproofing built in</span><span>Status</span><span></span></p>
      <ul class="hm-rlist">${rows}</ul>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ services */
function servicesMarkup(d: HomeData, _o: HomeOptions) {
  const [lead, ...rest] = d.services;
  if (!lead) return "";
  // "Terraces & roofs: PU or torch-on membranes" becomes the place, then how it is done
  const covers = (lead.deliverables ?? [])
    .map((x) => {
      const [where = x, how = ""] = x.split(/:\s*/, 2);
      return `<div><dt>${esc(where)}</dt><dd>${esc(how.charAt(0).toUpperCase() + how.slice(1))}</dd></div>`;
    })
    .join("");
  const list = rest
    .map(
      (s) => `<li><a class="hm-srow" href="/services#${serviceSlug(s.title)}" data-internal>
  <span class="hm-stt">${esc(s.title)}</span>
  <span class="hm-stl">${esc(s.line ?? s.short ?? s.scale)}</span>
  <span class="hm-sgo" aria-hidden="true">${arrow}</span>
</a></li>`,
    )
    .join("");
  return `<section class="hm-sec hm-services" id="services" aria-labelledby="services-title">
  <div class="hm-wrap">
    ${head("Services", "Waterproofing, construction and leak&nbsp;repair.", "services-title", `<a class="hm-link" href="/services" data-internal>All services${arrow}</a>`)}
    <div class="hm-sgrid">
      <article class="hm-sfeat" aria-labelledby="svc-lead">
        <p class="hm-sk">${esc(lead.short ?? "Our core service")}</p>
        <h3 class="hm-sft" id="svc-lead">${esc(lead.title)}</h3>
        <p class="hm-sbody">${esc(lead.scale)}, in Erode, Coimbatore and across Tamil&nbsp;Nadu.</p>
        ${covers ? `<dl class="hm-scov">${covers}</dl>` : ""}
        <div class="hm-sbtns">
          <a class="hm-btn hm-btn--light" href="/contact#enquiry" data-internal>Book a free inspection${arrow}</a>
          <a class="hm-link hm-link--light" href="/waterproofing" data-internal>How we waterproof${arrow}</a>
        </div>
      </article>
      <div class="hm-sside">
        <p class="hm-sk">Building services</p>
        <ul class="hm-slist">${list}</ul>
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ about */
function aboutMarkup(d: HomeData, _o: HomeOptions) {
  const c = d.contact;
  const since = d.brand.established.replace(/\D+/g, "") || "2012";
  const facts = [
    ["Founded", `${since}, in Erode`],
    ["Office", c.address.split(",").slice(0, 2).join(",")],
    ["Working in", "Erode, Coimbatore, Tiruppur, Salem and Chennai"],
    ["Core service", "Waterproofing and leak repair"],
  ]
    .map(([k, v]) => `<div><dt>${esc(k!)}</dt><dd>${esc(v!)}</dd></div>`)
    .join("");
  const values = d.points.map((p) => `<li><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></li>`).join("");
  return `<section class="hm-sec hm-about" id="about" aria-labelledby="about-title">
  <div class="hm-wrap">
    ${head("About RPC", `Rooted in Erode since&nbsp;${esc(since)}.`, "about-title")}
    <div class="hm-agrid">
      <div class="hm-acopy">
        <p class="hm-lead">We repair leaks in existing buildings, and design new ones so the leaks never start.</p>
        <a class="hm-btn hm-btn--ink" href="/about" data-internal>About RPC Constructions${arrow}</a>
      </div>
      <dl class="hm-facts">${facts}</dl>
    </div>
    <ul class="hm-values">${values}</ul>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ products */
function productsMarkup(d: HomeData) {
  const pr = d.products;
  if (!pr) return "";
  return `<section class="hm-sec hm-products" id="products" aria-labelledby="products-title">
  <div class="hm-wrap">
    ${head("Products", "Waterproofing products, layer by&nbsp;layer.", "products-title", `<a class="hm-link" href="/products" data-internal>All ${pr.count} products${arrow}</a>`)}
    <div class="hm-teaser">${pr.teaser}</div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ record */
function recordMarkup(d: HomeData) {
  const items = d.stats
    .map((s) => `<div class="hm-stat"><dt>${esc(s.label)}</dt><dd>${esc(String(s.value))}${s.suffix ? `<sup>${esc(s.suffix)}</sup>` : ""}</dd></div>`)
    .join("");
  return `<section class="hm-sec hm-record" id="record" aria-label="Performance record">
  <div class="hm-wrap">${head("Record", "One dry building at a time.", "record-title")}<dl class="hm-stats">${items}</dl></div>
</section>`;
}

/* ------------------------------------------------------------------ contact */
function contactMarkup(d: HomeData, _o: HomeOptions) {
  const c = d.contact;
  const ext = ` target="_blank" rel="noopener noreferrer"`;
  const rows = [
    ["Call", `<a class="hm-ctel" href="${tel(c.phone)}">${esc(c.phone)}</a>`],
    ["WhatsApp", `<a href="${esc(c.whatsapp)}"${ext}>Chat with an engineer</a>`],
    ["Email", `<a href="mailto:${esc(c.email)}">${esc(c.email).replace("@", "<wbr>@")}</a>`],
    ["Office", `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery)}"${ext}>${esc(c.address.split(",").slice(0, 2).join(","))}</a>`],
    ["Hours", esc(c.hours)],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join("");
  return `<section class="hm-sec hm-contact" id="contact" aria-labelledby="contact-title">
  <div class="hm-wrap">
    ${head("Contact", "Talk to an engineer.", "contact-title")}
    <div class="hm-cgrid">
      <div class="hm-ccopy">
        <p class="hm-lead">A damp wall, a leaking terrace or a new building to plan? We work across Erode, Coimbatore, Tiruppur, Salem and Chennai, and call back within one working day.</p>
        <div class="hm-cbtns">
          <a class="hm-btn hm-btn--ink" href="/contact#enquiry" data-internal>Book a free inspection${arrow}</a>
          <a class="hm-btn hm-btn--line" href="${esc(c.whatsapp)}"${ext}>WhatsApp us</a>
        </div>
      </div>
      <dl class="hm-ways">${rows}</dl>
    </div>
  </div>
</section>`;
}

export type HomePart = "projects" | "services" | "about" | "products" | "record" | "contact";
const ALL_PARTS: readonly HomePart[] = ["projects", "services", "about", "products", "record", "contact"];

/** the sections asked for, in page order */
export function homeSectionsMarkup(d: HomeData, o: HomeOptions = {}, parts: readonly HomePart[] = ALL_PARTS): string {
  const make: Record<HomePart, () => string> = {
    projects: () => projectsMarkup(d, o),
    services: () => servicesMarkup(d, o),
    about: () => aboutMarkup(d, o),
    products: () => productsMarkup(d),
    record: () => recordMarkup(d),
    contact: () => contactMarkup(d, o),
  };
  return ALL_PARTS.filter((p) => parts.includes(p)).map((p) => make[p]()).join("\n");
}

/* ---------------------------------------------------------------- CSS */
/** the products section's job card (lib/products/home.ts) */
export const HOME_PRODUCTS_CSS = `
.hl{display:flex;flex-direction:column;gap:1rem}
.hl-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.hl-card{overflow:hidden;border-radius:8px;background:#f7f3eb;box-shadow:0 0 0 1px rgba(18,34,59,.12)}
/* the jobs, as tabs along the top of the card */
.hl-jobs{display:flex;padding:0 clamp(.6rem,1.8vw,1.6rem);border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none}
.hl-jobs::-webkit-scrollbar{display:none}
.hl-tab{position:relative;flex:none;display:inline-flex;align-items:center;height:3.2rem;padding:0 1rem;border:0;background:none;color:var(--mute);font-family:inherit;font-size:var(--fs-body);font-weight:500;line-height:1;white-space:nowrap;cursor:pointer;transition:color .2s}
.hl-tab:hover{color:var(--ink)}
.hl-tab[aria-selected="true"]{color:var(--ink);font-weight:600}
.hl-tab[aria-selected="true"]::after{content:"";position:absolute;left:1rem;right:1rem;bottom:-1px;height:2px;background:var(--navy)}
.hl-tab:focus-visible,.hl-brands a:focus-visible,.hl-sum:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
/* a job: the picture and its layers */
.hl-panel{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);align-items:center;gap:clamp(1rem,3vw,3rem);padding:clamp(1rem,2vw,1.8rem) clamp(1rem,2.6vw,2.4rem)}
.hl-panel[hidden]{display:none}
.hl-art{display:flex;flex-direction:column;align-items:center;gap:.4rem;margin:0;min-width:0}
.hl-pic{position:relative;width:100%;max-width:44rem}
.hl-pic img{display:block;width:100%;height:auto}
.hl-pin{position:absolute;display:grid;place-items:center;width:1.75rem;height:1.75rem;margin:-.875rem 0 0 -.875rem;border-radius:50%;background:var(--navy);box-shadow:0 0 0 2px #f7f3eb,0 4px 10px -4px rgba(4,12,30,.6);color:#fff;font-size:.875rem;font-weight:700;font-variant-numeric:tabular-nums;line-height:1;transition:background-color .2s,transform .2s}
.hl-pin.is-hot{background:var(--accent);transform:scale(1.15)}
.hl-art figcaption{max-width:30rem;font-size:var(--fs-body);line-height:1.45;color:var(--mute);text-align:center;text-wrap:balance}
.hl-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none;min-width:0;border-top:1px solid var(--line)}
.hl-row{border-bottom:1px solid var(--line);transition:background-color .2s}
.hl-row.is-hot{background:rgba(39,86,160,.05)}
.hl-sum{display:grid;grid-template-columns:1.75rem minmax(0,1fr) auto 1rem;align-items:center;gap:.9rem;padding:.8rem .4rem;list-style:none;cursor:pointer}
.hl-sum::-webkit-details-marker{display:none}
.hl-sum::marker{content:""}
.hl-n{display:grid;place-items:center;width:1.75rem;height:1.75rem;border-radius:50%;background:var(--navy);color:#fff;font-size:.875rem;font-weight:700;font-variant-numeric:tabular-nums;transition:background-color .2s}
.hl-row.is-hot .hl-n{background:var(--accent)}
.hl-tx{display:flex;flex-direction:column;min-width:0}
.hl-name{font-size:var(--fs-body);font-weight:600;line-height:1.3;color:var(--ink)}
.hl-what{font-size:var(--fs-body);line-height:1.4;color:var(--mute)}
.hl-count{font-size:var(--fs-body);font-variant-numeric:tabular-nums;color:var(--mute);white-space:nowrap}
.hl-chev{display:grid;place-items:center;color:var(--mute);transition:transform .25s}
.hl-chev svg{width:15px;height:15px}
.hl-d[open] .hl-chev{transform:rotate(180deg)}
.hl-d[open] .hl-count{color:var(--ink)}
.hl-brands{display:grid;gap:.25rem;margin:0;padding:0 .4rem .95rem calc(.4rem + 1.75rem + .9rem)}
.hl-brands div{display:grid;grid-template-columns:5.6rem minmax(0,1fr);gap:.2rem .8rem;align-items:baseline}
.hl-brands dt{display:flex;align-items:center;gap:.45rem;font-size:var(--fs-body);font-weight:600;color:var(--ink)}
.hl-brands dt i{flex:none;width:.5rem;height:.5rem;border-radius:1px;background:var(--c)}
.hl-brands dd{display:flex;flex-wrap:wrap;gap:.15rem .9rem;margin:0;font-size:var(--fs-body);line-height:1.5}
.hl-brands a{color:var(--ink2,#2a3a52);text-decoration:none;border-bottom:1px solid rgba(18,34,59,.2);transition:color .2s,border-color .2s}
.hl-brands a:hover{color:var(--ink);border-color:var(--ink)}
.hl-fine{margin:0;max-width:40rem;font-size:var(--fs-body);line-height:1.5;color:var(--mute)}
@media (max-width:899px){
  .hl-panel{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:767px){
  .hl-panel{padding:.9rem .8rem 1rem}
  .hl-pin{width:1.5rem;height:1.5rem;margin:-.75rem 0 0 -.75rem;font-size:.8125rem}
  .hl-sum{grid-template-columns:1.75rem minmax(0,1fr) 1rem;gap:.1rem .7rem;padding:.7rem .2rem}
  .hl-count{grid-column:2;grid-row:2}
  .hl-chev{grid-column:3;grid-row:1 / span 2}
  .hl-brands{padding-left:.2rem;padding-right:.2rem}
  .hl-brands div{grid-template-columns:minmax(0,1fr)}
}
`;

export const HOME_CSS = `
.hm{--paper:#ece6da;--stone:#e2d9c9;--card:#f5f0e6;--navy:#0b2350;--ink:#12223b;--ink2:#2a3a52;--mute:#5b6271;--line:rgba(18,34,59,.14);--accent:#2756a0;--display:var(--font-instrument),"Segoe UI",system-ui,sans-serif;--sans:var(--font-inter-tight),ui-sans-serif,system-ui,sans-serif;color:var(--ink);font-family:var(--sans)}
.hm-sec{position:relative;z-index:10;padding:clamp(4.5rem,11vh,8rem) 0}
.hm-wrap{box-sizing:border-box;width:100%;max-width:1600px;margin:0 auto;padding-inline:var(--gutter,3rem)}
.hm-ar{width:14px;height:14px;flex:none;transition:transform .35s cubic-bezier(.2,.7,.2,1)}

/* a section's head: a rule, the label and headline, a link at the right */
.hm-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1rem 3rem;margin-bottom:clamp(2rem,5vh,3.4rem);padding-top:1.25rem;border-top:1px solid rgba(18,34,59,.28)}
.hm-label{margin:0 0 .9rem;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.hm-h2{margin:0;max-width:22ch;font-family:var(--display);font-weight:600;font-size:var(--fs-title);line-height:1.1;letter-spacing:-.022em;text-wrap:balance}
.hm-hlink{padding-bottom:.35rem}
.hm-link{display:inline-flex;align-items:center;gap:.5rem;padding-bottom:3px;border-bottom:1px solid currentColor;font-size:var(--fs-body);font-weight:600;color:var(--ink);text-decoration:none}
.hm-link:hover .hm-ar,.hm-btn:hover .hm-ar{transform:translate(2px,-2px)}
.hm-lead{margin:0;max-width:36rem;font-size:var(--fs-sub);line-height:1.55;color:var(--ink2);text-wrap:pretty}
.hm-btn{display:inline-flex;align-items:center;justify-content:center;gap:.6rem;height:3rem;padding:0 1.35rem;border-radius:6px;font-size:var(--fs-body);font-weight:600;text-decoration:none;white-space:nowrap;box-sizing:border-box;transition:background-color .25s,color .25s,border-color .25s}
.hm-btn--ink{background:var(--navy);color:#fff}
.hm-btn--ink:hover{background:var(--accent)}
.hm-btn--line{border:1px solid rgba(18,34,59,.32);color:var(--ink)}
.hm-btn--line:hover{border-color:var(--navy);background:rgba(18,34,59,.04)}
.hm a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}

/* projects: a register */
.hm-projects{background:var(--paper)}
.hm-reg{--cols:minmax(0,1.25fr) minmax(0,.7fr) minmax(0,1fr) minmax(0,1.7fr) minmax(0,.85fr) 1.25rem}
.hm-rhead{display:grid;grid-template-columns:var(--cols);gap:1.5rem;margin:0;padding:0 0 .7rem;border-bottom:1px solid rgba(18,34,59,.28);font-size:var(--fs-body);color:var(--mute)}
.hm-rlist{margin:0;padding:0;list-style:none}
.hm-rrow{display:grid;grid-template-columns:var(--cols);align-items:baseline;gap:1.5rem;padding:1.3rem 0;border-bottom:1px solid var(--line);color:inherit;text-decoration:none;transition:background-color .2s}
.hm-rrow:hover{background:rgba(245,240,230,.7)}
.hm-rname{font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.25;letter-spacing:-.01em}
.hm-rtype,.hm-rloc,.hm-rwp,.hm-rst{font-size:var(--fs-body);line-height:1.45}
.hm-rtype{color:var(--accent);font-weight:600}
.hm-rloc{color:var(--ink2)}
.hm-rwp{color:var(--mute)}
.hm-rst{display:inline-flex;align-items:baseline;gap:.5rem;color:var(--ink2)}
.hm-rst i{flex:none;width:.5rem;height:.5rem;border-radius:50%;background:#2f8f62;transform:translateY(-1px)}
.hm-rst i[data-s=live]{background:#c98a10}
.hm-rst i[data-s=plan]{background:#0b6e80}
.hm-rgo{align-self:center;color:var(--mute)}
.hm-rrow:hover .hm-rgo{color:var(--ink)}
.hm-rrow:hover .hm-ar{transform:translate(2px,-2px)}

/* services: the dark band */
.hm-services{background:var(--navy);color:#fff}
.hm-services .hm-head{border-top-color:rgba(255,255,255,.28)}
.hm-services .hm-label,.hm-services .hm-sk{color:#9db8e8}
.hm-services .hm-link{color:#fff}
.hm-sgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:clamp(2.5rem,6vw,7rem)}
.hm-sk{margin:0;font-size:var(--fs-body);font-weight:600}
.hm-sft{margin:.6rem 0 0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.2;letter-spacing:-.01em}
.hm-sbody{margin:.5rem 0 0;max-width:32rem;font-size:var(--fs-body);line-height:1.6;color:rgba(255,255,255,.72)}
.hm-scov{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 2rem;margin:1.8rem 0 0}
.hm-scov div{padding:.9rem 0;border-top:1px solid rgba(255,255,255,.16)}
.hm-scov dt{font-size:var(--fs-body);font-weight:600}
.hm-scov dd{margin:.25rem 0 0;font-size:var(--fs-body);line-height:1.5;color:rgba(255,255,255,.66)}
.hm-sbtns{display:flex;flex-wrap:wrap;align-items:center;gap:1rem 1.6rem;margin-top:2rem}
.hm-btn--light{background:#f5f0e6;color:var(--navy)}
.hm-btn--light:hover{background:#fff}
.hm-link--light{color:#fff}
.hm-slist{margin:.6rem 0 0;padding:0;list-style:none;border-top:1px solid rgba(255,255,255,.28)}
.hm-srow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr) 1.25rem;align-items:baseline;gap:1.5rem;padding:1.2rem 0;border-bottom:1px solid rgba(255,255,255,.14);color:#fff;text-decoration:none}
.hm-stt{font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.25;letter-spacing:-.01em}
.hm-stl{font-size:var(--fs-body);line-height:1.5;color:rgba(255,255,255,.66)}
.hm-sgo{align-self:center;color:rgba(255,255,255,.6)}
.hm-srow:hover .hm-stt{text-decoration:underline;text-underline-offset:5px;text-decoration-thickness:1px}
.hm-srow:hover .hm-sgo{color:#fff}
.hm-srow:hover .hm-ar{transform:translate(2px,-2px)}
.hm-services a:focus-visible{outline-color:#9db8e8}

/* about */
.hm-about{background:var(--paper)}
.hm-agrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:2rem clamp(2.5rem,6vw,7rem);align-items:start}
.hm-acopy{display:flex;flex-direction:column;align-items:flex-start;gap:2rem}
.hm-facts{margin:0;border-top:1px solid rgba(18,34,59,.28)}
.hm-facts div{display:grid;grid-template-columns:9rem minmax(0,1fr);gap:1.5rem;padding:.95rem 0;border-bottom:1px solid var(--line)}
.hm-facts dt{font-size:var(--fs-body);color:var(--mute)}
.hm-facts dd{margin:0;font-size:var(--fs-body);font-weight:600;line-height:1.45}
.hm-values{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2rem;margin:clamp(3rem,7vh,4.5rem) 0 0;padding:0;list-style:none}
.hm-values li{padding-top:1rem;border-top:2px solid var(--navy)}
.hm-values h3{margin:0;font-size:var(--fs-body);font-weight:600}
.hm-values p{margin:.4rem 0 0;font-size:var(--fs-body);line-height:1.55;color:var(--mute)}

/* products */
.hm-products{background:var(--stone)}
.hm-teaser{min-width:0}

/* record */
.hm-record{background:var(--stone)}
.hm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:0;border-top:1px solid var(--line)}
.hm-stat{padding:1.5rem 1.5rem 0 0}
.hm-stat dd{margin:0;font-family:var(--display);font-size:var(--fs-title);font-weight:600;line-height:1}
.hm-stat dt{font-size:var(--fs-body);color:var(--mute)}

/* contact */
.hm-contact{background:var(--paper);padding-bottom:calc(clamp(4.5rem,11vh,8rem) + 2.5rem)}
.hm-cgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:2rem clamp(2.5rem,6vw,7rem);align-items:start}
.hm-ccopy{display:flex;flex-direction:column;align-items:flex-start;gap:2rem}
.hm-cbtns{display:flex;flex-wrap:wrap;gap:.75rem}
.hm-ways{margin:0;border-top:1px solid rgba(18,34,59,.28)}
.hm-ways div{display:grid;grid-template-columns:9rem minmax(0,1fr);align-items:baseline;gap:1.5rem;padding:1rem 0;border-bottom:1px solid var(--line)}
.hm-ways dt{font-size:var(--fs-body);color:var(--mute)}
.hm-ways dd{margin:0;font-size:var(--fs-body);font-weight:600;line-height:1.45;overflow-wrap:anywhere}
.hm-ways a{color:var(--ink);text-decoration:none;border-bottom:1px solid rgba(18,34,59,.25);transition:border-color .2s}
.hm-ways a:hover{border-color:var(--ink)}
.hm-ways .hm-ctel{border:0;font-family:var(--display);font-size:var(--fs-sub);letter-spacing:-.01em}

/* tablets */
@media (max-width:1023px){
  .hm-reg{--cols:minmax(0,1.3fr) minmax(0,1fr) minmax(0,.9fr) 1.25rem}
  .hm-rhead span:nth-child(2),.hm-rtype,.hm-rhead span:nth-child(4),.hm-rwp{display:none}
  .hm-sgrid,.hm-agrid,.hm-cgrid{grid-template-columns:minmax(0,1fr)}
  .hm-values{grid-template-columns:repeat(2,minmax(0,1fr))}
}
/* phones */
@media (max-width:767px){
  .hm-sec{padding:3.5rem 0}
  .hm-contact{padding-bottom:6rem}
  .hm-head{margin-bottom:1.6rem}
  .hm-rhead{display:none}
  .hm-rlist{border-top:1px solid rgba(18,34,59,.28)}
  .hm-rrow{grid-template-columns:minmax(0,1fr) 1.25rem;gap:.3rem 1rem;padding:1.05rem 0}
  .hm-rname{grid-column:1}
  .hm-rgo{grid-column:2;grid-row:1 / span 3}
  .hm-rloc,.hm-rst{grid-column:1}
  .hm-srow{grid-template-columns:minmax(0,1fr) 1.25rem;gap:.25rem 1rem;padding:1rem 0}
  .hm-stl{grid-column:1}
  .hm-sgo{grid-column:2;grid-row:1 / span 2}
  .hm-scov{grid-template-columns:minmax(0,1fr)}
  .hm-values{grid-template-columns:minmax(0,1fr);gap:1.4rem}
  .hm-facts div,.hm-ways div{grid-template-columns:minmax(0,1fr);gap:.2rem}
  .hm-stats{grid-template-columns:1fr 1fr}
}
`;

/* ------------------------------------------------------------ behaviour */
/** the products section: pick a job; point at a layer (in the list or on the picture) and it is marked in both */
export function mountHome(root: HTMLElement) {
  const off: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: EventTarget, type: K | string, fn: (e: never) => void, o?: AddEventListenerOptions) => {
    el.addEventListener(type, fn as EventListener, o);
    off.push(() => el.removeEventListener(type, fn as EventListener, o));
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const hl = root.querySelector<HTMLElement>("[data-hl]");
  if (hl) {
    const tabs = Array.from(hl.querySelectorAll<HTMLButtonElement>("[data-hl-tab]"));
    const panels = Array.from(hl.querySelectorAll<HTMLElement>("[data-hl-panel]"));
    const strip = hl.querySelector<HTMLElement>(".hl-jobs");
    const select = (k: string, focus = false) => {
      tabs.forEach((t) => {
        const sel = t.dataset.hlTab === k;
        t.setAttribute("aria-selected", String(sel));
        t.tabIndex = sel ? 0 : -1;
        if (sel && focus) t.focus({ preventScroll: true });
        // keep the chosen job in view in the strip of jobs on narrower screens
        if (sel && strip && strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: t.offsetLeft - strip.clientWidth / 2 + t.offsetWidth / 2, behavior: reduced ? "auto" : "smooth" });
      });
      panels.forEach((p) => {
        const sel = p.dataset.hlPanel === k;
        p.hidden = !sel;
        p.classList.toggle("is-on", sel);
        // the picture loads when its job is first chosen
        if (sel) p.querySelectorAll<HTMLImageElement>("img[loading='lazy']").forEach((i) => (i.loading = "eager"));
      });
    };
    tabs.forEach((t, i) => {
      on(t, "click", () => {
        if (t.getAttribute("aria-selected") !== "true") select(t.dataset.hlTab!);
      });
      on(t, "keydown", (e: KeyboardEvent) => {
        const step = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (!step && e.key !== "Home" && e.key !== "End") return;
        e.preventDefault();
        const n = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + step + tabs.length) % tabs.length;
        select(tabs[n]!.dataset.hlTab!, true);
      });
    });
    const light = (p: HTMLElement, layer: string | null) => {
      p.querySelectorAll("[data-layer]").forEach((el) => el.classList.toggle("is-hot", el.getAttribute("data-layer") === layer));
    };
    const layerAt = (t: EventTarget | null) => (t instanceof Element ? (t.closest("[data-layer]")?.getAttribute("data-layer") ?? null) : null);
    panels.forEach((p) => {
      on(p, "pointerover", (e: PointerEvent) => light(p, layerAt(e.target)));
      on(p, "pointerleave", () => light(p, null));
      on(p, "focusin", (e: FocusEvent) => light(p, layerAt(e.target)));
      on(p, "focusout", (e: FocusEvent) => {
        if (!p.contains(e.relatedTarget as Node | null)) light(p, null);
      });
    });
  }
  return () => off.forEach((f) => f());
}
