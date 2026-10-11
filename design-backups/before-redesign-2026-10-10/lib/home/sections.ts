/**
 * Home page, below the hero: the sections in the language of "The art of
 * waterproofing": paper and stone grounds, the serif headline face, one
 * accent blue and hairlines, closing on the site's night blue for contact.
 *
 *   02 Selected projects  a filmstrip of project cards that scrolls sideways
 *   03 Services           an index of the seven services; the row under the mouse lights up
 *   04 About              who we are, four short facts and a photograph
 *   05 Products           the products RPC supplies, two at a time: three pairs
 *                         side by side in the seam (lib/compare), each opening
 *   -- Record             four numbers that count up (not used on the home page,
 *                         which keeps the site's own performance-record band, 06)
 *   07 Contact            dark close with a framed photograph and four ways to reach us
 *
 * Plain strings and one mount function, like the hero and the methods list, so
 * the server renders every word and the page works before scripts arrive.
 * The copy is short on purpose: each section has one headline written around
 * what people search for (waterproofing and building in Erode, Coimbatore and
 * across Tamil Nadu), one line under it and the links that matter, and no
 * line is repeated elsewhere on the site.
 *
 * Photographs are shown whole, at their own proportions, with nothing laid
 * over their lower right, so the generator's mark there stays visible.
 */

import { HOME_PRODUCTS_CSS } from "../compare/home-teaser-css";
import { films } from "../compare/seam-behaviour";

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
  /** for the products section: how many there are, from which brands, and the pairs, rendered on the server (lib/compare/home-teaser.ts) */
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
const chevron = (dir: "l" | "r") =>
  `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${dir === "l" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const two = (n: number) => String(n).padStart(2, "0");

function imgTag(src: string, alt: string, sizes: string, o: HomeOptions, cls = "", eager = false) {
  const load = eager ? `fetchpriority="high"` : `loading="lazy"`;
  if (o.rawImages) return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" ${load} decoding="async">`;
  const u = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&amp;w=${w}&amp;q=75`;
  const set = [640, 828, 1080, 1440, 1920].map((w) => `${u(w)} ${w}w`).join(", ");
  return `<img class="${cls}" src="${u(1080)}" srcset="${set}" sizes="${esc(sizes)}" alt="${esc(alt)}" ${load} decoding="async">`;
}

const mark = (n: string, label: string, extra = "") =>
  `<p class="hm-mark" data-rv><span class="hm-idx">${n}</span><span class="hm-rule" aria-hidden="true"></span><span>${esc(label)}</span>${extra}</p>`;

/* ------------------------------------------------------------------ 02 */
function projectsMarkup(d: HomeData, o: HomeOptions) {
  const dot = (s: string) => (s === "Completed" ? "done" : s === "Under construction" ? "live" : "plan");
  const cards = d.projects
    .map(
      (p, i) => `<li class="hm-card" data-rv style="--d:${Math.min(i, 3) * 80}ms">
  <a href="/projects#${esc(p.slug)}" data-internal>
    <div class="hm-ph">
      ${imgTag(p.image, `${p.name}, ${p.location}: ${p.type.toLowerCase()} project by RPC Constructions`, "(min-width:1024px) 40vw, 84vw", o)}
      <span class="hm-status" data-s="${dot(p.status)}"><i></i>${esc(p.status)}</span>
      <span class="hm-no">${two(i + 1)}</span>
    </div>
    <p class="hm-meta"><span>${esc(p.type)}</span><span>${esc(p.location)}</span></p>
    <h3 class="hm-pname">${esc(p.name)}${arrow}</h3>
  </a>
</li>`,
    )
    .join("");
  return `<section class="hm-sec hm-projects" id="projects" aria-labelledby="projects-title">
  <div class="hm-wrap">
    <header class="hm-head">
      <div>
        ${mark("02", "Selected projects")}
        <h2 class="hm-h2" id="projects-title" data-rv>Built dry across Tamil&nbsp;Nadu.</h2>
      </div>
      <div class="hm-side" data-rv>
        <p class="hm-lede">Apartments in Erode, offices on Avinashi Road in Coimbatore and a textile unit at SIPCOT Perundurai, each with its waterproofing designed in.</p>
        <div class="hm-ctrl">
          <span class="hm-count" aria-hidden="true"><b data-pos>01</b> / ${two(d.projects.length)}</span>
          <button type="button" class="hm-nav" data-prev aria-label="Previous project">${chevron("l")}</button>
          <button type="button" class="hm-nav" data-next aria-label="Next project">${chevron("r")}</button>
        </div>
      </div>
    </header>
  </div>
  <ul class="hm-track" data-track aria-label="Projects">${cards}</ul>
  <div class="hm-wrap hm-pfoot">
    <div class="hm-bar" aria-hidden="true"><i data-bar></i></div>
    <a class="hm-link" href="/projects" data-internal>View all projects${arrow}</a>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ 03 */
function servicesMarkup(d: HomeData, o: HomeOptions) {
  const rows = d.services
    .map(
      (s, i) => `<li data-rv style="--d:${i * 50}ms">
  <a class="hm-srow" href="/services#${serviceSlug(s.title)}" data-internal data-img="${i}">
    <span class="hm-sno">${esc(s.id)}</span>
    <span class="hm-st">${esc(s.title)}</span>
    <span class="hm-smeta">${esc(s.line ?? s.short ?? s.scale)}</span>
    <span class="hm-sgo" aria-hidden="true">${arrow}</span>
  </a>
</li>`,
    )
    .join("");
  return `<section class="hm-sec hm-services" id="services" aria-labelledby="services-title">
  <div class="hm-wrap">
    <header class="hm-head">
      <div>
        ${mark("03", "Services")}
        <h2 class="hm-h2" id="services-title" data-rv>From leak repair to turnkey&nbsp;builds.</h2>
      </div>
      <div class="hm-side" data-rv>
        <p class="hm-lede">Waterproofing leads, and every other service is planned around it, for clients across Erode and Coimbatore.</p>
        <a class="hm-link" href="/services" data-internal>View all services${arrow}</a>
      </div>
    </header>
    <div class="hm-sbox">
      <ol class="hm-slist">${rows}</ol>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ 04 */
function aboutMarkup(d: HomeData, o: HomeOptions) {
  const values = d.points
    .map((p, i) => `<li data-rv style="--d:${i * 60}ms"><span class="hm-vno">${two(i + 1)}</span><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></li>`)
    .join("");
  return `<section class="hm-sec hm-about" id="about" aria-labelledby="about-title">
  <div class="hm-wrap hm-agrid">
    <div class="hm-acopy">
      ${mark("04", "About RPC")}
      <h2 class="hm-statement" id="about-title" data-rv>Rooted in Erode since&nbsp;2012.</h2>
      <p class="hm-lead" data-rv>We repair leaks in existing buildings, and design new ones so the leaks never start.</p>
      <ul class="hm-values">${values}</ul>
      <a class="hm-btn hm-btn--ink" href="/about" data-internal data-rv>About RPC Constructions${arrow}</a>
    </div>
    <figure class="hm-afig" data-rv>
      <div class="hm-aph">${imgTag("/images/anatomy-wp-walls.jpg", "Cutaway of an external wall: brick, waterproof plaster and an elastomeric coat being rolled on", "(min-width:1024px) 40vw, 92vw", o)}</div>
      <figcaption><span>Waterproof plaster under an elastomeric coat</span><span>External walls</span></figcaption>
    </figure>
  </div>
</section>`;
}

/* ---------------------------------------------------------- 05 products */
function productsMarkup(d: HomeData) {
  const pr = d.products;
  if (!pr) return "";
  const brands = pr.brands.length < 2 ? pr.brands.join("") : `${pr.brands.slice(0, -1).join(", ")} and ${pr.brands[pr.brands.length - 1]}`;
  return `<section class="hm-sec hm-products" id="products" aria-labelledby="products-title">
  <div class="hm-wrap hm-pgrid">
    <div class="hm-pcopy">
      ${mark("05", "Products")}
      <h2 class="hm-h2" id="products-title" data-rv>Two products, side by&nbsp;side.</h2>
      <p class="hm-lede" data-rv>${pr.count} products from ${esc(brands)}. Set any two against each other: what they share meets in the middle, and what differs stays on its side. Then ask us for today&rsquo;s rate.</p>
      <a class="hm-btn hm-btn--ink hm-pbtn" href="/products" data-internal data-rv>Compare any two products${arrow}</a>
    </div>
    <div class="hm-teaser" data-rv>${pr.teaser}</div>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ 05 */
const NOTES = ["Built & waterproofed", "Working from Erode", "Homes, firms & factories", "Erode to Chennai"];
function recordMarkup(d: HomeData) {
  const items = d.stats
    .map(
      (s, i) => `<div class="hm-stat" data-rv style="--d:${i * 90}ms">
  <dt>${esc(s.label)}<span>${esc(NOTES[i] ?? "")}</span></dt>
  <dd><span ${typeof s.value === "number" ? `data-count="${s.value}"` : ""}>${esc(String(s.value))}</span>${s.suffix ? `<sup>${esc(s.suffix)}</sup>` : ""}</dd>
</div>`,
    )
    .join("");
  return `<section class="hm-sec hm-record" id="record" aria-label="Performance record">
  <div class="hm-wrap">
    <header class="hm-head hm-head--tight">
      <div>
        ${mark("05", "Performance record")}
        <h2 class="hm-h2" data-rv>One dry building <span class="hm-soft">at a time.</span></h2>
      </div>
    </header>
    <dl class="hm-stats">${items}</dl>
  </div>
</section>`;
}

/* ------------------------------------------------------------------ 06 */
/** a small line drawing for each way to reach us */
const WAY_ICON: Record<string, string> = {
  call: `<path d="M6.6 3.8h2.6l1.4 3.7-1.9 1.2a10.6 10.6 0 0 0 5.6 5.6l1.2-1.9 3.7 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A15 15 0 0 1 5 5.5a1.6 1.6 0 0 1 1.6-1.7z"/>`,
  whatsapp: `<path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6z"/><path d="M8.6 11.6h.01M12 11.6h.01M15.4 11.6h.01" stroke-width="2.4"/>`,
  email: `<rect x="3.5" y="5.5" width="17" height="13" rx="2.6"/><path d="m4.6 7.2 7.4 5.6 7.4-5.6"/>`,
  visit: `<path d="M12 20.6s-6.4-5.5-6.4-10.8a6.4 6.4 0 0 1 12.8 0c0 5.3-6.4 10.8-6.4 10.8z"/><circle cx="12" cy="9.9" r="2.3"/>`,
};
const wayIcon = (k: string) =>
  `<span class="hm-wi" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${WAY_ICON[k] ?? ""}</svg></span>`;

function contactMarkup(d: HomeData, o: HomeOptions) {
  const c = d.contact;
  const ways = [
    { k: "Call", v: c.phone, href: tel(c.phone) },
    { k: "WhatsApp", v: "Chat with us", href: c.whatsapp, ext: true },
    { k: "Email", v: c.email, href: `mailto:${c.email}`, short: "Send an email" },
    { k: "Visit", v: "Perundurai Road, Erode", href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery)}`, ext: true },
  ]
    .map((w, i) => {
      const key = w.k.toLowerCase();
      const value = "short" in w ? `<span class="hm-wfull">${esc(w.v).replace("@", "<wbr>@")}</span><span class="hm-wshort">${esc(w.short as string)}</span>` : esc(w.v);
      return `<li data-rv style="--d:${i * 70}ms"><a class="hm-way hm-way--${key}" href="${esc(w.href)}"${w.ext ? ` target="_blank" rel="noopener noreferrer"` : ""}>${wayIcon(key)}<span class="hm-wt"><span class="hm-wk">${w.k}</span><span class="hm-wv">${value}</span></span>${arrow}</a></li>`;
    })
    .join("");
  return `<section class="hm-sec hm-contact" id="contact" aria-labelledby="contact-title">
  <div class="hm-wrap">
    <div class="hm-cgrid">
      <div class="hm-ccopy">
        ${mark("07", "Contact")}
        <h2 class="hm-ch" id="contact-title" data-rv>Talk to an engineer.</h2>
        <p class="hm-clede" data-rv>A damp wall, a leaking terrace or a new building to plan? We work across Erode, Coimbatore, Tiruppur, Salem and Chennai, and call back within one working day.</p>
        <div class="hm-cbtns" data-rv>
          <a class="hm-btn hm-btn--paper" href="/contact#enquiry" data-internal>Book a free inspection${arrow}</a>
          <a class="hm-btn hm-btn--line" href="${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp us</a>
        </div>
      </div>
      <figure class="hm-cfig" data-rv>
        <div class="hm-cph">${imgTag("/images/waterproofing/house-lit-interiors.jpg", "A three-storey house with terraces, balconies and a pool, its rooms lit", "(min-width:1024px) 38vw, 92vw", o)}</div>
      </figure>
    </div>
    <ul class="hm-ways">${ways}</ul>
  </div>
</section>`;
}

export type HomePart = "projects" | "services" | "about" | "products" | "record" | "contact";
const ALL_PARTS: readonly HomePart[] = ["projects", "services", "about", "products", "record", "contact"];

/** the sections asked for, in page order (the home page uses the site's own record band) */
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
export { HOME_PRODUCTS_CSS };
export const HOME_CSS = `
/*
 * Every section is exactly one screen tall (laptops, tablets and phones held
 * upright): the headline and text keep their size, and the photographs and
 * lists stretch or shrink to fill what is left under the navigation bar.
 */
.hm{--paper:#f3f5f6;--stone:#e4eaee;--ink:#101a22;--mute:rgba(16,26,34,.6);--line:rgba(16,26,34,.12);--accent:#0b6e80;--serif:var(--font-instrument),"Times New Roman",serif;--sans:var(--font-inter-tight),ui-sans-serif,system-ui,sans-serif;--nav-room:88px;color:var(--ink);font-family:var(--sans)}
.hm-sec{position:relative;z-index:10;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;min-height:100vh;min-height:100svh;padding:calc(var(--nav-room) + clamp(.4rem,2.6svh,2.2rem)) 0 clamp(1.4rem,4.6svh,3.2rem)}
.hm-wrap{box-sizing:border-box;width:100%;padding-inline:var(--gutter,3rem);max-width:1600px;margin:0 auto}
.hm img{display:block;width:100%;height:100%;object-fit:cover}
.hm-ar{width:14px;height:14px;flex:none;transition:transform .45s cubic-bezier(.2,.7,.2,1)}

/* shared: section marker, headline, lede, links and buttons */
.hm-mark{display:flex;align-items:center;gap:.75rem;margin:0;font-size:var(--fs-body);font-weight:500;color:var(--mute)}
.hm-idx{font-variant-numeric:tabular-nums;font-weight:600;color:var(--accent)}
.hm-rule{width:2rem;height:1px;background:currentColor;opacity:.35}
.hm-h2{margin:min(1.1rem,2svh) 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.95;letter-spacing:-.022em;text-wrap:balance;max-width:20ch}
.hm-soft{color:rgba(16,26,34,.42)}
.hm-head{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);align-items:end;gap:1.2rem clamp(2rem,6vw,7rem);margin-bottom:clamp(1.1rem,4svh,3.2rem)}
.hm-side{display:flex;flex-direction:column;align-items:flex-start;gap:min(1.4rem,2.4svh);padding-bottom:.3rem}
.hm-lede{margin:0;max-width:30rem;font-size:var(--fs-sub);line-height:1.6;color:var(--mute);text-wrap:pretty}
.hm-link{display:inline-flex;align-items:center;gap:.55rem;padding-bottom:4px;border-bottom:1px solid currentColor;font-size:var(--fs-body);font-weight:600;color:var(--ink);text-decoration:none}
.hm-link:hover .hm-ar,.hm-btn:hover .hm-ar{transform:translate(2px,-2px)}
.hm-btn{display:inline-flex;align-items:center;justify-content:center;gap:.6rem;height:min(3.25rem,6.4svh);min-height:2.75rem;padding:0 1.5rem;border-radius:999px;font-size:var(--fs-body);font-weight:600;text-decoration:none;box-sizing:border-box;transition:background-color .3s,color .3s,border-color .3s}
.hm-btn--ink{background:var(--ink);color:#f3f5f6}
.hm-btn--ink:hover{background:var(--accent)}

/* reveal as each block reaches the screen (only once scripts run) */
.hm.js [data-rv]{opacity:0;transform:translateY(18px);transition:opacity .9s ease var(--d,0ms),transform 1.1s cubic-bezier(.19,1,.22,1) var(--d,0ms)}
.hm.js [data-rv].is-in{opacity:1;transform:none}

/* 02 projects: a filmstrip whose photographs take the height that is left */
.hm-projects{background:var(--paper)}
.hm-ctrl{display:flex;align-items:center;gap:.6rem}
.hm-count{min-width:4.5rem;font-size:var(--fs-body);font-variant-numeric:tabular-nums;color:var(--mute)}
.hm-count b{font-weight:600;color:var(--ink)}
.hm-nav{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer;transition:background-color .3s,color .3s,border-color .3s,opacity .3s}
.hm-nav svg{width:16px;height:16px}
.hm-nav:hover:not(:disabled){background:var(--ink);border-color:var(--ink);color:#f3f5f6}
.hm-nav:disabled{opacity:.35;cursor:default}
.hm-track{--edge:max(var(--gutter,3rem),calc((100% - 1600px) / 2 + var(--gutter,3rem)));flex:1 1 0;min-height:18rem;max-height:46rem;display:flex;align-items:stretch;gap:clamp(14px,1.6vw,24px);margin:0;padding:0 var(--edge) 4px;list-style:none;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding-inline:var(--edge);scrollbar-width:none;cursor:grab}
.hm-track::-webkit-scrollbar{display:none}
.hm-track.is-drag{scroll-snap-type:none;cursor:grabbing}
.hm-track.is-drag a{pointer-events:none}
.hm-card{display:flex;flex:0 0 clamp(18rem,32vw,36rem);scroll-snap-align:start}
.hm-card a{display:flex;flex-direction:column;width:100%;color:inherit;text-decoration:none}
/* each photograph whole, at its own proportions; the strip's height decides how wide the cards are */
.hm-ph{position:relative;flex:none;aspect-ratio:1376/768;overflow:hidden;border-radius:18px;background:#dde5ea}
.hm-ph img{position:absolute;inset:0}
.hm-ph::after{content:"";position:absolute;inset:0 0 auto;height:42%;background:linear-gradient(to bottom,rgba(0,0,0,.3),transparent);pointer-events:none}
@media (min-width:768px){
  @supports (width:1cqh){
    .hm-track{container-type:size}
    .hm-card{flex-basis:clamp(16rem,calc((100cqh - 7.6rem) * 1.7917),min(44rem,84vw))}
  }
}
.hm-status{position:absolute;left:14px;top:14px;z-index:1;display:inline-flex;align-items:center;gap:.45rem;height:28px;padding:0 .75rem;border-radius:999px;background:rgba(243,245,246,.92);font-size:var(--fs-body);font-weight:600;color:var(--ink);backdrop-filter:blur(8px)}
.hm-status i{width:7px;height:7px;border-radius:50%;background:#2f9e6b}
.hm-status[data-s=live] i{background:#e8a215}
.hm-status[data-s=plan] i{background:#0b7d91}
.hm-no{position:absolute;right:16px;top:10px;z-index:1;font-family:var(--serif);font-size:var(--fs-sub);line-height:1;color:#fff;font-variant-numeric:tabular-nums}
.hm-meta{display:flex;flex-wrap:wrap;gap:.2rem .9rem;margin:min(1.1rem,2svh) 0 0;font-size:var(--fs-body);color:var(--mute)}
.hm-meta span:first-child{font-weight:600;color:var(--accent)}
.hm-pname{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin:.4rem 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-sub);line-height:1.05;letter-spacing:-.015em}
.hm-pname .hm-ar{width:18px;height:18px;color:var(--mute)}
.hm-card a:hover .hm-pname .hm-ar{transform:translate(3px,-3px);color:var(--ink)}
.hm-pfoot{display:flex;align-items:center;gap:2rem;margin-top:min(2.2rem,3.6svh)}
.hm-bar{position:relative;flex:1;height:1px;background:var(--line);overflow:hidden}
.hm-bar i{position:absolute;inset:0;background:var(--ink);transform-origin:left;transform:scaleX(.2)}

/* 03 services: seven rows sharing the height; a picture follows the pointer */
.hm-services{background:var(--stone)}
.hm-services > .hm-wrap{display:flex;flex-direction:column;flex:1 1 auto;max-height:58rem}
.hm-sbox{position:relative;display:flex;flex:1 1 0;min-height:20rem;max-height:46rem}
.hm-slist{display:flex;flex-direction:column;flex:1;margin:0;padding:0;list-style:none;border-bottom:1px solid var(--line)}
.hm-slist > li{display:flex;flex:1 1 0;min-height:0}
.hm-srow{position:relative;display:grid;flex:1;grid-template-columns:4.5rem minmax(0,1fr) minmax(12rem,19rem) 3rem;align-items:center;gap:1.5rem;padding:min(.6rem,1svh) 0;border-top:1px solid var(--line);color:inherit;text-decoration:none}
.hm-sno{font-size:var(--fs-body);font-weight:600;font-variant-numeric:tabular-nums;color:var(--accent)}
.hm-st{font-family:var(--serif);font-size:var(--fs-sub);line-height:1;letter-spacing:-.02em;transition:transform .6s cubic-bezier(.2,.7,.2,1),color .4s}
.hm-smeta{font-size:var(--fs-body);line-height:1.4;color:var(--mute);text-wrap:pretty}
.hm-sgo{display:grid;place-items:center;justify-self:end;width:min(44px,6svh);height:min(44px,6svh);min-width:36px;min-height:36px;border-radius:50%;border:1px solid var(--line);transition:background-color .35s,color .35s,border-color .35s}
.hm-slist.is-hover .hm-srow{color:rgba(16,26,34,.35)}
.hm-slist.is-hover .hm-srow.is-on{color:var(--ink)}
.hm-srow.is-on .hm-st{transform:translateX(14px)}
.hm-srow.is-on .hm-sgo{background:var(--ink);border-color:var(--ink);color:#f3f5f6}
.hm-srow.is-on .hm-sgo .hm-ar{transform:translate(1px,-1px)}

/* 04 about: the copy beside a photograph that fills the height */
.hm-about{background:var(--paper)}
.hm-agrid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);align-items:stretch;gap:clamp(2rem,5vw,6rem);flex:1 1 auto;max-height:52rem}
.hm-acopy{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;min-width:0}
.hm-acopy .hm-mark{align-self:stretch}
.hm-statement{margin:min(1.4rem,2.6svh) 0 0;max-width:20ch;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.98;letter-spacing:-.025em;text-wrap:balance}
.hm-lead{margin:min(1.6rem,3svh) 0 0;max-width:42rem;font-size:var(--fs-sub);line-height:1.6;color:rgba(16,26,34,.78);text-wrap:pretty}
.hm-values{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(1rem,2vw,2rem);align-self:stretch;margin:min(1.8rem,3.4svh) 0 min(1.8rem,3.4svh);padding:0;list-style:none}
.hm-values li{display:grid;grid-template-columns:1.9rem 1fr;align-content:start;column-gap:.1rem;padding:min(.85rem,1.5svh) 0 min(.95rem,1.6svh);border-top:1px solid var(--line)}
.hm-vno{grid-row:1/3;padding-top:.12rem;font-size:var(--fs-body);font-weight:600;font-variant-numeric:tabular-nums;color:var(--accent)}
.hm-values h3{margin:0;font-size:var(--fs-body);font-weight:600;letter-spacing:-.01em}
.hm-values p{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:.3rem 0 0;font-size:var(--fs-body);line-height:1.45;color:var(--mute)}
/* the photograph as large as the space allows, at its own proportions */
.hm-afig{display:flex;flex-direction:column;justify-content:center;min-height:0;margin:0;container-type:size}
.hm-aph{position:relative;flex:none;width:min(100cqw,calc((100cqh - 2.4rem) * 1.7917));aspect-ratio:1376/768;overflow:hidden;border-radius:18px;background:#dde5ea}
.hm-afig figcaption{width:min(100cqw,calc((100cqh - 2.4rem) * 1.7917))}
@container (max-height:8rem){.hm-aph,.hm-afig figcaption{display:none}}
.hm-aph img{position:absolute;inset:0}
.hm-afig figcaption{display:flex;justify-content:space-between;gap:1rem;box-sizing:border-box;margin-top:.8rem;font-size:var(--fs-body);color:var(--mute)}
.hm-afig figcaption span:first-child{color:var(--ink);font-weight:500}

/* 05 record */
.hm-record{background:var(--stone)}
.hm-head--tight{grid-template-columns:1fr;margin-bottom:clamp(1.6rem,6svh,4.5rem)}
.hm-head--tight .hm-h2{max-width:none}
.hm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.hm-stat{display:flex;flex-direction:column-reverse;justify-content:flex-end;gap:min(1.2rem,2.4svh);padding:min(3rem,6svh) clamp(1rem,2.2vw,2.2rem)}
.hm-stat+.hm-stat{border-left:1px solid var(--line)}
.hm-stat:first-child{padding-left:0}
.hm-stat dd{display:flex;align-items:flex-start;margin:0;font-family:var(--serif);font-size:var(--fs-title);line-height:.85;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.hm-stat sup{margin-left:.04em;font-size:var(--fs-sub);line-height:1;color:var(--accent);top:0}
.hm-stat dt{display:flex;flex-direction:column;gap:.25rem;font-size:var(--fs-body);font-weight:600}
.hm-stat dt span{font-size:var(--fs-body);font-weight:400;color:var(--mute)}

/* 05 products: the copy on the left, three pairs side by side on the right */
.hm-products{background:var(--stone)}
.hm-pgrid{display:grid;grid-template-columns:minmax(0,.75fr) minmax(0,1.6fr);gap:clamp(1.6rem,4vw,4.5rem);align-items:center}
.hm-pcopy .hm-h2{max-width:12ch}
.hm-pcopy .hm-lede{margin-top:min(1.2rem,2.2svh)}
.hm-pbtn{margin-top:min(1.8rem,3.4svh)}
.hm-teaser{min-width:0}
/* the pictures keep to a size that lets the whole section fit one screen */
.hm-teaser .cx-media.is-same .cx-fig{width:min(100%,24svh * 1.79,20rem)}
.hm-teaser .cx-media:not(.is-same) .cx-fig{width:min(100%,22svh * 1.79)}
.hm-teaser .cx-media:not(.is-same) .cx-ma .cx-fig{margin-left:auto}
@media (min-width:1024px) and (max-height:899px){
  .hm-teaser .cx-sub{display:none}
  .hm-teaser .cx-media.is-same .cx-fig{width:min(100%,16svh * 1.79,16rem)}
  .hm-teaser .cx-media:not(.is-same) .cx-fig{width:min(100%,15svh * 1.79)}
  .hm-teaser .cx-sheet .cx-row + .cx-row{display:none}
  .hm-teaser .cx-row{padding:.5rem 0}
  .hm-teaser .cx-fig figcaption{margin-top:.3rem}
  .hm-teaser .cx-sub{margin-top:.2rem}
  .hm-teaser .cx-chips li{padding:.2rem .65rem}
  .hm-teaser .cx-pack svg{width:calc(var(--px,2.5rem) * .65);height:calc(var(--px,2.5rem) * .65)}
}
@media (max-width:1023px){
  .hm-pgrid{grid-template-columns:minmax(0,1fr)}
  .hm-pcopy .hm-h2{max-width:none}
}
@media (max-width:767px){
  .hm-products{justify-content:flex-start}
}
/* 07 contact: the dark close; the photograph takes the height */
.hm-contact{background:var(--color-night,#0b1d2b);color:#ecf2f5;--line:rgba(236,242,245,.14);--mute:rgba(236,242,245,.6)}
.hm-contact::before,.hm-contact::after{content:"";position:absolute;left:max(var(--gutter,3rem),calc((100% - 1600px) / 2 + var(--gutter,3rem)));right:max(var(--gutter,3rem),calc((100% - 1600px) / 2 + var(--gutter,3rem)));height:1px;background:rgba(236,242,245,.12)}
.hm-contact::before{top:0}
.hm-contact::after{bottom:0}
.hm-contact > .hm-wrap{display:flex;flex-direction:column;flex:1 1 auto;max-height:56rem}
.hm-contact .hm-mark{color:var(--mute)}
.hm-contact .hm-idx{color:#4cc9d9}
.hm-cgrid{display:grid;flex:1 1 auto;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:clamp(2rem,6vw,7rem);align-items:stretch}
.hm-ccopy{display:flex;flex-direction:column;justify-content:center;align-items:flex-start}
.hm-ch{margin:min(1.2rem,2.4svh) 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.9;letter-spacing:-.03em;max-width:9ch}
.hm-clede{margin:min(1.6rem,3svh) 0 0;max-width:30rem;font-size:var(--fs-sub);line-height:1.6;color:rgba(236,242,245,.72);text-wrap:pretty}
.hm-cbtns{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:min(2rem,3.8svh)}
.hm-btn--paper{background:#ecf2f5;color:var(--ink)}
.hm-btn--paper:hover{background:#fff}
.hm-btn--line{border:1px solid rgba(236,242,245,.3);color:#ecf2f5}
.hm-btn--line:hover{border-color:#ecf2f5}
.hm-cfig{display:flex;flex-direction:column;justify-content:center;min-height:0;margin:0;container-type:size}
.hm-cph{position:relative;flex:none;width:min(100cqw,calc(100cqh * 1.7778));aspect-ratio:1600/900;overflow:hidden;border-radius:18px;background:#222}
@container (max-height:6.5rem){.hm-cph{display:none}}
.hm-cph img{position:absolute;inset:0}
/* four ways to reach us, as tiles: a drawn icon, what it is, and the number or address */
.hm-ways{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.92fr) minmax(0,1.3fr) minmax(0,1.12fr);gap:clamp(.6rem,1vw,.9rem);margin:min(2.8rem,5.2svh) 0 0;padding:0;list-style:none}
.hm-ways li{display:flex;min-width:0}
.hm-way{position:relative;display:flex;align-items:center;gap:.95rem;box-sizing:border-box;width:100%;min-width:0;padding:min(1.05rem,2svh) 1.4rem min(1.05rem,2svh) min(1.05rem,2svh);border-radius:18px;background:rgba(236,242,245,.035);box-shadow:inset 0 0 0 1px rgba(236,242,245,.09);color:inherit;text-decoration:none;transition:background-color .45s,box-shadow .45s,translate .45s cubic-bezier(.2,.7,.2,1)}
.hm-way:hover{background:rgba(236,242,245,.075);box-shadow:inset 0 0 0 1px rgba(236,242,245,.2);translate:0 -3px}
.hm-way:focus-visible{outline:2px solid #4cc9d9;outline-offset:3px}
.hm-wi{flex:none;display:grid;place-items:center;width:min(46px,6.4svh);height:min(46px,6.4svh);min-width:38px;min-height:38px;border-radius:14px;background:rgba(76,201,217,.13);color:#4cc9d9;transition:background-color .45s,color .45s}
.hm-wi svg{width:21px;height:21px}
.hm-way--whatsapp .hm-wi{background:rgba(74,201,133,.13);color:#62d49a}
.hm-way:hover .hm-wi{background:#4cc9d9;color:#0b1d2b}
.hm-way--whatsapp:hover .hm-wi{background:#62d49a}
.hm-wt{display:flex;flex-direction:column;gap:.18rem;min-width:0}
.hm-wk{font-size:var(--fs-body);letter-spacing:.01em;color:var(--mute)}
.hm-wv{overflow-wrap:anywhere;font-size:var(--fs-body);font-weight:600;line-height:1.3;color:#ecf2f5}
.hm-way--call .hm-wv{white-space:nowrap}
@media (min-width:1024px) and (max-width:1180px){.hm-wv{font-size:var(--fs-body)}.hm-wi{width:40px;height:40px;min-width:40px;min-height:40px}}
.hm-wshort{display:none}
.hm-ways .hm-ar{position:absolute;right:1rem;top:1rem;color:rgba(236,242,245,.42)}
.hm-way:hover .hm-ar{color:#ecf2f5;transform:translate(2px,-2px)}

/* tablets */
@media (max-width:1023px){
  .hm-head{grid-template-columns:1fr;align-items:start;gap:min(1.2rem,2svh)}
  .hm-card{flex-basis:44vw}
  .hm-srow{grid-template-columns:3.2rem minmax(0,1fr) 13rem 2.75rem;gap:1.1rem}
  .hm-st{font-size:var(--fs-sub)}
  .hm-agrid{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:2.2rem}
  .hm-values{grid-template-columns:1fr 1fr}
  .hm-cgrid{grid-template-columns:1fr 1fr;gap:2.5rem}
  .hm-ways{grid-template-columns:1fr 1fr}
  .hm-fgrid{grid-template-columns:1fr 1fr}
}
/* phones held upright */
@media (max-width:767px){
  .hm{--nav-room:68px}
  .hm-sec{justify-content:flex-start;padding:calc(var(--nav-room) + min(.8rem,1.6svh)) 0 min(1.4rem,2.6svh)}
  .hm-h2{font-size:var(--fs-title);max-width:13ch}
  .hm-head{margin-bottom:min(1.4rem,2.6svh)}
  .hm-side{gap:min(1rem,1.8svh)}
  .hm-lede{font-size:var(--fs-sub);line-height:1.5}
  .hm-ctrl .hm-nav{width:40px;height:40px}
  /* projects */
  .hm-projects{justify-content:center}
  .hm-card{flex-basis:84vw}
  .hm-track{flex:none;min-height:0;max-height:none}
  .hm-pname{font-size:var(--fs-sub)}
  .hm-pfoot{gap:1.2rem;margin-top:min(1.2rem,2.2svh)}
  /* services */
  .hm-slist{border-bottom:0}
  .hm-sbox{min-height:0;max-height:none}
  .hm-srow{grid-template-columns:2rem minmax(0,1fr) 34px;grid-template-rows:1fr auto auto 1fr;column-gap:.6rem;row-gap:0;padding:min(.45rem,.8svh) 0}
  .hm-sno{grid-column:1;grid-row:1/-1;align-self:center}
  .hm-st{grid-column:2;grid-row:2;font-size:var(--fs-sub);line-height:1.1}
  .hm-smeta{grid-column:2;grid-row:3;margin-top:.15rem;font-size:var(--fs-body);line-height:1.35}
  .hm-sgo{grid-column:3;grid-row:1/-1;align-self:center;width:34px;height:34px;min-width:0;min-height:0}
  .hm-srow.is-on .hm-st{transform:none}
  /* about: copy, the principles as tags, then the photograph */
  .hm-agrid{display:flex;flex-direction:column;gap:min(1.2rem,2.2svh);max-height:none}
  .hm-acopy{flex:none}
  .hm-mark{flex-wrap:wrap}
  .hm-statement{font-size:var(--fs-title);max-width:none;margin-top:min(1rem,1.8svh)}
  .hm-lead{margin-top:min(1rem,1.8svh);font-size:var(--fs-sub);line-height:1.55}
  .hm-values{display:flex;flex-wrap:wrap;gap:6px;margin:min(1rem,1.8svh) 0}
  .hm-values li{display:inline-flex;align-items:center;height:28px;padding:0 11px;border:0;border-radius:999px;box-shadow:inset 0 0 0 1px var(--line)}
  .hm-values .hm-vno,.hm-values p{display:none}
  .hm-values h3{font-size:var(--fs-body);font-weight:600}
  .hm-afig{flex:1 1 0;min-height:0}
  /* record */
  .hm-record{justify-content:center}
  .hm-stats{grid-template-columns:1fr 1fr}
  .hm-stat{padding:min(1.6rem,3.2svh) 1rem}
  .hm-stat:nth-child(odd){padding-left:0;border-left:0}
  .hm-stat:nth-child(n+3){border-top:1px solid var(--line)}
  .hm-stat dd{font-size:var(--fs-title)}
  .hm-stat dt span{font-size:var(--fs-body)}
  /* contact */
  .hm-contact > .hm-wrap{max-height:none}
  .hm-cgrid{display:flex;flex-direction:column;gap:min(1.3rem,2.4svh)}
  .hm-ccopy{flex:none}
  .hm-ch{font-size:var(--fs-title)}
  .hm-clede{font-size:var(--fs-sub);line-height:1.5}
  .hm-cbtns{margin-top:min(1.3rem,2.4svh)}
  .hm-cbtns .hm-btn{height:2.9rem}
  .hm-cfig{flex:1 1 0;min-height:0}
  .hm-ways{grid-template-columns:1fr 1fr;gap:.5rem;margin-top:min(1.2rem,2.2svh)}
  .hm-way{gap:.55rem;padding:min(.7rem,1.3svh) .7rem;border-radius:14px}
  .hm-way:hover{translate:none}
  .hm-wi{width:30px;height:30px;min-width:30px;min-height:30px;border-radius:9px}
  .hm-wi svg{width:16px;height:16px}
  .hm-wk{font-size:var(--fs-body)}
  .hm-wv{font-size:var(--fs-body)}
  .hm-wfull{display:none}
  .hm-wshort{display:inline}
  .hm-ways .hm-ar{display:none}
}
/* narrow phones: the tiles' number still on one line */
@media (max-width:380px){
  .hm-way{gap:.5rem;padding:min(.65rem,1.2svh) .6rem}
  .hm-wi{width:28px;height:28px;min-width:28px;min-height:28px}
  .hm-wv{font-size:var(--fs-body)}
}
@media (max-width:340px){
  .hm-wi{display:none}
}
/* short phones: drop what does not fit in one screen */
@media (max-width:767px) and (max-height:760px){
  .hm-side .hm-lede{display:none}
  .hm-services .hm-side{display:none}
  .hm-afig{display:none}
  .hm-cfig{display:none}
}
@media (max-width:767px) and (max-height:700px){
  .hm-lead{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
}
/* phones turned sideways and other very short screens: sections take their natural height */
@media (max-height:520px){
  .hm-sec{min-height:0;justify-content:flex-start}
  .hm-track{flex:none;height:min(26rem,90svh)}
  .hm-sbox{flex:none;min-height:0}
  .hm-slist > li{flex:none}
  .hm-srow{padding:.7rem 0}
  .hm-agrid,.hm-cgrid{flex:none}
  .hm-afig,.hm-cfig{height:17rem}
}
@media (prefers-reduced-motion:reduce){
  .hm.js [data-rv]{opacity:1;transform:none;transition:none}
}
`;

/* ------------------------------------------------------------ behaviour */
/** reveals, the projects strip, the services preview and the count-ups */
export function mountHome(root: HTMLElement) {
  const off: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: EventTarget, type: K | string, fn: (e: never) => void, o?: AddEventListenerOptions) => {
    el.addEventListener(type, fn as EventListener, o);
    off.push(() => el.removeEventListener(type, fn as EventListener, o));
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("js");

  // reveals
  const rv = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          rv.unobserve(e.target);
        }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  root.querySelectorAll("[data-rv]").forEach((el) => rv.observe(el));
  off.push(() => rv.disconnect());
  // the products section: tabs between the three pairs, and their films
  const hp = root.querySelector<HTMLElement>("[data-hp]");
  if (hp) {
    const tabs = Array.from(hp.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const pick = (t: HTMLButtonElement, focus = false) => {
      tabs.forEach((x) => {
        const yes = x === t;
        x.setAttribute("aria-selected", String(yes));
        x.tabIndex = yes ? 0 : -1;
        const p = hp.querySelector<HTMLElement>(`#${x.getAttribute("aria-controls")}`);
        if (p) p.hidden = !yes;
      });
      if (focus) t.focus();
      film.refresh();
    };
    const film = films(hp);
    off.push(film.off);
    tabs.forEach((t, i) => {
      on(t, "click", () => pick(t));
      on(t, "keydown", (e: KeyboardEvent) => {
        const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!n) return;
        e.preventDefault();
        pick(tabs[(i + n + tabs.length) % tabs.length]!, true);
      });
    });
  }

  // projects: buttons, position, progress, and drag to scroll with a mouse
  const track = root.querySelector<HTMLElement>("[data-track]");
  if (track) {
    const prev = root.querySelector<HTMLButtonElement>("[data-prev]");
    const next = root.querySelector<HTMLButtonElement>("[data-next]");
    const pos = root.querySelector<HTMLElement>("[data-pos]");
    const bar = root.querySelector<HTMLElement>("[data-bar]");
    const cards = Array.from(track.children) as HTMLElement[];
    const step = () => (cards[1] ? cards[1].offsetLeft - cards[0]!.offsetLeft : track.clientWidth * 0.8);
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const x = track.scrollLeft;
      if (prev) prev.disabled = x <= 2;
      if (next) next.disabled = x >= max - 2;
      const i = Math.min(cards.length - 1, Math.round(x / Math.max(1, step())));
      if (pos) pos.textContent = String((x >= max - 2 ? cards.length : i + 1)).padStart(2, "0");
      if (bar) {
        const share = track.clientWidth / Math.max(1, track.scrollWidth);
        bar.style.transform = `translateX(${(max > 0 ? x / max : 0) * (1 / share - 1) * 100}%) scaleX(1)`;
        bar.style.width = `${share * 100}%`;
      }
    };
    const go = (dir: number) => track.scrollBy({ left: dir * step(), behavior: reduced ? "auto" : "smooth" });
    if (prev) on(prev, "click", () => go(-1));
    if (next) on(next, "click", () => go(1));
    on(track, "scroll", update, { passive: true });
    on(window, "resize", update);
    update();
    // mouse drag (touch scrolls natively)
    let down = false;
    let moved = false;
    let sx = 0;
    let sl = 0;
    on(track, "pointerdown", (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      moved = false;
      sx = e.clientX;
      sl = track.scrollLeft;
    });
    on(window, "pointermove", (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        track.classList.add("is-drag");
      }
      if (moved) track.scrollLeft = sl - dx;
    });
    on(window, "pointerup", () => {
      if (!down) return;
      down = false;
      if (moved) {
        track.classList.remove("is-drag");
        // settle on the nearest card
        const s = step();
        track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: reduced ? "auto" : "smooth" });
      }
    });
    on(track, "click", (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, { capture: true });
    on(track, "dragstart", (e: DragEvent) => e.preventDefault());
  }

  // services: the row under the mouse lights up and the others step back
  const list = root.querySelector<HTMLElement>(".hm-slist");
  if (list && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const rows = Array.from(list.querySelectorAll<HTMLElement>(".hm-srow"));
    rows.forEach((row) =>
      on(row, "pointerenter", (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        rows.forEach((r) => r.classList.toggle("is-on", r === row));
        list.classList.add("is-hover");
      }),
    );
    on(list, "pointerleave", () => {
      rows.forEach((r) => r.classList.remove("is-on"));
      list.classList.remove("is-hover");
    });
  }

  // record: numbers count up once
  const counts = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
  if (counts.length && !reduced) {
    counts.forEach((c) => (c.textContent = "0"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          io.unobserve(e.target);
          const el = e.target as HTMLElement;
          const to = Number(el.dataset.count);
          const t0 = performance.now();
          const run = (now: number) => {
            const k = Math.min(1, (now - t0) / 1600);
            el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3))));
            if (k < 1) requestAnimationFrame(run);
          };
          requestAnimationFrame(run);
        }
      },
      { threshold: 0.4 },
    );
    counts.forEach((c) => io.observe(c));
    off.push(() => io.disconnect());
  }

  return () => {
    off.forEach((f) => f());
    root.classList.remove("js");
  };
}
