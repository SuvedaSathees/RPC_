/**
 * Inner pages (services, projects, about, contact, blog) in the home page's
 * language: paper and stone grounds, the serif headline face, one accent blue,
 * hairlines, and the site's night blue for the closing call to action.
 *
 * Plain strings, like the home sections, so the server renders every word
 * and the pages work before scripts arrive. A small client component adds
 * the little behaviour there is (links, the enquiry form).
 */

export interface PageOptions {
  /** plain image URLs (the local test page has no image optimiser) */
  rawImages?: boolean;
}
export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  hours: string;
  whatsapp: string;
  mapQuery: string;
  regions: readonly string[];
}

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const tel = (p: string) => `tel:${p.replace(/[^0-9+]/g, "")}`;
export const two = (n: number) => String(n).padStart(2, "0");
/**
 * A heading whose words rise into place when it arrives (with data-rv="words"
 * on the heading). Takes escaped text; the words stay plain text for search
 * and screen readers.
 */
export const words = (html: string) =>
  html
    .split(/ +/)
    .map((w, i) => `<span class="pg-w"><span style="--wi:${i}">${w}</span></span>`)
    .join(" ");
export const mapsLink = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
/** "Erode, Coimbatore and Chennai" */
export const listing = (xs: readonly string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

export const arrow = `<svg class="pg-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const arrowDown = `<svg class="pg-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3.8 8.8 8 13l4.2-4.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/**
 * The photographs' own sizes. Every frame takes its picture's proportions, so
 * nothing is cut off and the generator's mark in a corner stays visible.
 */
const SIZES: Record<string, readonly [number, number]> = {
  "/film/wp-final.jpg": [1600, 900],
  "/images/interior-joinery.jpg": [1200, 896],
  "/images/process-01.jpg": [1920, 1080],
  "/images/process-02.jpg": [1920, 1080],
  "/images/process-03.jpg": [1920, 1080],
  "/images/process-04.jpg": [1920, 1080],
  "/images/process-05.jpg": [1920, 1080],
  "/images/process-06.jpg": [1920, 1072],
  "/images/completed-frame.jpg": [1440, 810],
  "/images/architectural-craft-detail.jpg": [896, 1200],
  "/images/detail-01.jpg": [1600, 1000],
  "/images/detail-02.jpg": [1200, 896],
  "/images/anatomy-wp-walls.jpg": [1376, 768],
  // stills from RPC's own waterproofing films
  "/images/waterproofing/villa-upper-floors.jpg": [1920, 1080],
  "/images/waterproofing/terrace-slab-cutaway.jpg": [1920, 1080],
  "/images/waterproofing/basement-wall-cutaway.jpg": [1920, 1080],
  "/images/waterproofing/bathroom-membrane-under-tiles.jpg": [1920, 1080],
  "/images/waterproofing/water-tank-cutaway.jpg": [1920, 1080],
  "/images/waterproofing/villa-pool-deck.jpg": [1920, 1080],
  "/images/waterproofing/villa-with-pool.jpg": [1920, 1080],
  "/images/waterproofing/terrace-before-monsoon.jpg": [1920, 1080],
  "/images/waterproofing/house-lit-interiors.jpg": [1600, 900],
  "/images/waterproofing/house-wet-zones.jpg": [1600, 900],
  "/images/waterproofing/terrace-parapet-outlet.jpg": [1600, 900],
  "/images/waterproofing/bathroom-wet-zone.jpg": [1600, 900],
  "/images/waterproofing/sump-cutaway.jpg": [1600, 900],
  "/images/waterproofing/basement-car-park.jpg": [1600, 900],
  "/images/projects/anna-nagar-mixed-use-chennai.jpg": [1376, 768],
  "/images/projects/avinashi-corporate-centre-coimbatore.jpg": [1376, 768],
  "/images/projects/kaveri-residences-perundurai-road.jpg": [1920, 1072],
  "/images/projects/sipcot-textile-unit-perundurai.jpg": [1376, 768],
  "/images/projects/thindal-courtyard-villa-erode.jpg": [1376, 768],
  "/images/bp-1.jpg": [1920, 1080],
  "/stages/01-empty-plot.jpg": [1920, 1080],
  "/stages/02-site-preparation.jpg": [1920, 1080],
  "/stages/03-foundation.jpg": [1920, 1080],
  "/stages/04-rcc-columns.jpg": [1920, 1080],
  "/stages/05-beams-and-slabs.jpg": [1920, 1080],
  "/stages/06-structural-frame.jpg": [1920, 1080],
  "/stages/07-masonry-walls.jpg": [1920, 1080],
  "/stages/08-plastering.jpg": [1920, 1080],
  "/stages/09-windows-and-glass.jpg": [1920, 1080],
  "/stages/10-exterior-finishing.jpg": [1920, 1080],
  "/stages/11-landscaping.jpg": [1920, 1080],
  "/stages/12-completed.jpg": [1920, 1080],
};
export const ratio = (src: string) => {
  const s = SIZES[src];
  return s ? `${s[0]}/${s[1]}` : "16/9";
};

export function img(src: string, alt: string, sizes: string, o: PageOptions, eager = false) {
  const load = eager ? `fetchpriority="high"` : `loading="lazy"`;
  const s = SIZES[src];
  const wh = s ? ` width="${s[0]}" height="${s[1]}"` : "";
  if (o.rawImages) return `<img src="${esc(src)}" alt="${esc(alt)}"${wh} ${load} decoding="async">`;
  const u = (w: number) => `/_next/image?url=${encodeURIComponent(src)}&amp;w=${w}&amp;q=75`;
  const set = [640, 828, 1080, 1440, 1920].map((w) => `${u(w)} ${w}w`).join(", ");
  return `<img src="${u(1080)}" srcset="${set}" sizes="${esc(sizes)}" alt="${esc(alt)}"${wh} ${load} decoding="async">`;
}

/** a photograph in a rounded frame at its own proportions; nothing is laid over its lower right */
export function photo(src: string, alt: string, sizes: string, o: PageOptions, opts: { eager?: boolean; cls?: string; tag?: string } = {}) {
  return `<div class="pg-photo${opts.cls ? ` ${opts.cls}` : ""}" style="aspect-ratio:${ratio(src)}">${img(src, alt, sizes, o, opts.eager)}${opts.tag ?? ""}</div>`;
}

export interface Crumb {
  name: string;
  href: string;
}
export function crumbs(trail: readonly Crumb[]) {
  const items = trail
    .map((t, i) =>
      i < trail.length - 1
        ? `<li><a href="${esc(t.href)}" data-internal>${esc(t.name)}</a></li>`
        : `<li><span aria-current="page">${esc(t.name)}</span></li>`,
    )
    .join("");
  return `<nav class="pg-crumbs" aria-label="Breadcrumb"><ol>${items}</ol></nav>`;
}

/** a section marker: "01 —— Label" (or "—— Label" without a number) */
export const mark = (n: string, label: string) =>
  `<p class="pg-mark">${n ? `<span class="pg-idx">${esc(n)}</span>` : ""}<span class="pg-rule" aria-hidden="true"></span><span>${esc(label)}</span></p>`;

export const serviceSlug = (title: string) => title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** "2026-09-18" → "18 Sep 2026", the same on the server and in the browser */
export const shortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[(m ?? 1) - 1] ?? ""} ${y}`;
};

/**
 * The page's opening: breadcrumbs and the one h1. With an `aside` (a photo, an
 * index) the copy stacks on the left; without one, the intro and actions sit
 * on the right of the headline, like the home page's section heads.
 */
export function pageHead(p: { trail: readonly Crumb[]; title: string; intro?: string; actions?: string; aside?: string; id?: string; cls?: string }) {
  const intro = p.intro ? `<p class="pg-intro">${p.intro}</p>` : "";
  const actions = p.actions ? `<div class="pg-actions">${p.actions}</div>` : "";
  const h1 = `<h1 class="pg-h1"${p.id ? ` id="${p.id}"` : ""}>${p.title}</h1>`;
  const cls = p.cls ? ` ${p.cls}` : "";
  if (p.aside)
    return `<header class="pg-head${cls}">
  <div class="pg-wrap pg-headgrid">
    <div class="pg-headcopy">${crumbs(p.trail)}${h1}${intro}${actions}</div>
    <div class="pg-headaside">${p.aside}</div>
  </div>
</header>`;
  return `<header class="pg-head pg-head--split${cls}">
  <div class="pg-wrap">
    ${crumbs(p.trail)}
    <div class="pg-headgrid">
      <div class="pg-headcopy">${h1}</div>
      <div class="pg-headside">${intro}${actions}</div>
    </div>
  </div>
</header>`;
}

/** a section's head: marker and h2 on the left, a line and a link on the right */
export function secHead(p: { n: string; label: string; title: string; lede?: string; extra?: string; id?: string }) {
  const side = p.lede || p.extra ? `<div class="pg-sside">${p.lede ? `<p class="pg-lede">${p.lede}</p>` : ""}${p.extra ?? ""}</div>` : "";
  return `<header class="pg-shead">
  <div>${mark(p.n, p.label)}<h2 class="pg-h2"${p.id ? ` id="${p.id}"` : ""}>${p.title}</h2></div>
  ${side}
</header>`;
}

export type CtaStep = readonly [title: string, line: string];
/**
 * The close of every inner page, in the site's night blue: the question, three
 * steps written for that page (so no two pages say the same thing), and the
 * ways to start.
 */
export function ctaBand(c: ContactInfo, t: { title: string; steps: readonly CtaStep[] }) {
  const { title, steps } = t;
  return `<section class="pg-cta" aria-labelledby="pg-cta-title">
  <div class="pg-wrap">
    <h2 class="pg-ctah" id="pg-cta-title">${esc(title)}</h2>
    <div class="pg-ctabody">
      <ol class="pg-ctasteps" aria-label="What happens next">${steps.map(([h, p], i) => `<li><span class="pg-ctan" aria-hidden="true">${i + 1}</span><p class="pg-ctast">${esc(h)}</p><p class="pg-ctasd">${esc(p)}</p></li>`).join("")}</ol>
      <div class="pg-ctaacts">
        <a class="pg-btn pg-btn--paper" href="/contact#enquiry" data-internal>Book a free site inspection${arrow}</a>
        <a class="pg-btn pg-btn--ghost" href="${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp us</a>
        <p class="pg-ctaline"><a class="pg-ctatel" href="${tel(c.phone)}">${esc(c.phone)}</a><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
      </div>
    </div>
  </div>
</section>`;
}

export const KIT_CSS = `
.pg{--paper:#f3f5f6;--stone:#e4eaee;--card:#fbfcfd;--ink:#101a22;--ink2:rgba(16,26,34,.78);--mute:rgba(16,26,34,.6);--line:rgba(16,26,34,.12);--accent:#0b6e80;--night:#0b1d2b;--serif:var(--font-instrument),"Times New Roman",serif;--sans:var(--font-inter-tight),ui-sans-serif,system-ui,sans-serif;--nav-room:88px;position:relative;z-index:10;background:var(--paper);color:var(--ink);font-family:var(--sans)}
.pg *,.pg *::before,.pg *::after{box-sizing:border-box}
.pg-wrap{width:100%;max-width:1600px;margin:0 auto;padding-inline:var(--gutter,3rem)}
.pg img{display:block;width:100%;height:100%;object-fit:cover}
:where(.pg) a{color:inherit}
.pg-ar{width:14px;height:14px;flex:none;transition:transform .45s cubic-bezier(.2,.7,.2,1)}
.pg-sec{position:relative;padding:clamp(4rem,11vh,7.5rem) 0}
.pg-sec--stone{background:var(--stone)}
.pg-sec + .pg-sec:not(.pg-sec--stone){border-top:1px solid var(--line)}

/* night grounds (the services page, the contact opening): the shared parts take light ink */
.pg-dark{--ink:#ecf2f5;--ink2:rgba(236,242,245,.76);--mute:rgba(236,242,245,.56);--line:rgba(236,242,245,.14);--accent:#4cc9d9;background:var(--night);color:#ecf2f5}
.pg-dark .pg-btn--ink{background:#ecf2f5;color:#101a22}
.pg-dark .pg-btn--ink:hover{background:#fff}
.pg-dark .pg-btn--line{border-color:rgba(236,242,245,.3)}
.pg-dark .pg-btn--line:hover{border-color:#ecf2f5}
.pg-dark .pg-photo{background:#15293a}

/* photographs: rounded, at their own proportions */
.pg-photo{position:relative;overflow:hidden;border-radius:18px;background:#dde5ea}
.pg-photo img{position:absolute;inset:0}

/* opening */
.pg-head{padding:calc(var(--nav-room) + clamp(.6rem,3vh,2.4rem)) 0 clamp(2.6rem,7vh,5rem);border-bottom:1px solid var(--line)}
.pg-crumbs ol{display:flex;flex-wrap:wrap;align-items:center;gap:.45rem;margin:0;padding:0;list-style:none;font-size:var(--fs-body);color:var(--mute)}
.pg-crumbs li+li::before{content:"/";margin-right:.45rem;opacity:.45}
.pg-crumbs a{text-decoration:none;transition:color .3s}
.pg-crumbs a:hover{color:var(--ink)}
.pg-crumbs [aria-current]{color:var(--ink);font-weight:500}
.pg-headgrid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:2.2rem clamp(2rem,6vw,7rem);align-items:center}
.pg-head--split .pg-headgrid{align-items:end;margin-top:clamp(1rem,2.6vh,1.8rem)}
.pg-head--split .pg-h1{margin-top:0}
.pg-h1{margin:clamp(1rem,2.6vh,1.8rem) 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.95;letter-spacing:-.025em;text-wrap:balance;max-width:17ch}
.pg-intro{margin:clamp(1rem,2.4vh,1.5rem) 0 0;max-width:34rem;font-size:var(--fs-sub);line-height:1.6;color:var(--mute);text-wrap:pretty}
.pg-headside .pg-intro{margin-top:0}
.pg-headside{padding-bottom:.4rem}
.pg-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem;margin-top:clamp(1.4rem,3vh,2rem)}

/* buttons and links */
.pg-btn{display:inline-flex;align-items:center;justify-content:center;gap:.6rem;height:3.1rem;padding:0 1.5rem;border-radius:999px;font-size:var(--fs-body);font-weight:600;text-decoration:none;white-space:nowrap;cursor:pointer;transition:background-color .3s,color .3s,border-color .3s}
.pg-btn:hover .pg-ar,.pg-link:hover .pg-ar{transform:translate(2px,-2px)}
.pg-btn--ink{background:var(--ink);color:#f3f5f6}
.pg-btn--ink:hover{background:var(--accent)}
.pg-btn--line{border:1px solid rgba(16,26,34,.2);color:var(--ink)}
.pg-btn--line:hover{border-color:var(--ink)}
.pg-btn--paper{background:#ecf2f5;color:var(--ink)}
.pg-btn--paper:hover{background:#fff}
.pg-btn--ghost{border:1px solid rgba(236,242,245,.3);color:#ecf2f5}
.pg-btn--ghost:hover{border-color:#ecf2f5}
.pg-link{display:inline-flex;align-items:center;gap:.5rem;padding-bottom:3px;border-bottom:1px solid currentColor;font-size:var(--fs-body);font-weight:600;text-decoration:none}

/* section heads */
.pg-mark{display:flex;align-items:center;gap:.75rem;margin:0;font-size:var(--fs-body);font-weight:500;color:var(--mute)}
.pg-idx{font-weight:600;font-variant-numeric:tabular-nums;color:var(--accent)}
.pg-rule{width:2rem;height:1px;background:currentColor;opacity:.35}
.pg-shead{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);align-items:end;gap:1.2rem clamp(2rem,6vw,7rem);margin-bottom:clamp(2.2rem,6vh,3.8rem)}
.pg-h2{margin:.9rem 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.98;letter-spacing:-.022em;text-wrap:balance;max-width:20ch}
.pg-sside{display:flex;flex-direction:column;align-items:flex-start;gap:1.2rem;padding-bottom:.3rem}
.pg-lede{margin:0;max-width:32rem;font-size:var(--fs-sub);line-height:1.6;color:var(--mute);text-wrap:pretty}

/* closing call to action: the question large, then the three steps that follow getting in touch, ending at the ways to start */
.pg-cta{position:relative;background:var(--night);color:#ecf2f5;padding:clamp(4.5rem,12vh,8rem) 0 clamp(4rem,10vh,6.5rem)}
.pg-cta::after{content:"";position:absolute;left:max(var(--gutter,3rem),calc((100% - 1600px) / 2 + var(--gutter,3rem)));right:max(var(--gutter,3rem),calc((100% - 1600px) / 2 + var(--gutter,3rem)));bottom:0;height:1px;background:rgba(236,242,245,.12)}
.pg-ctah{margin:0;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.92;letter-spacing:-.03em;text-wrap:balance}
.pg-ctabody{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1.15fr);gap:2.6rem clamp(2rem,4.5vw,5rem);align-items:start;margin-top:clamp(2.8rem,7vh,4.6rem)}
.pg-ctasteps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:0;padding:0;list-style:none}
.pg-ctasteps li{position:relative;min-width:0;padding:1.7rem 1.8rem 0 0;border-top:1px solid rgba(236,242,245,.2)}
.pg-ctasteps li::before{content:"";position:absolute;left:0;top:-5px;width:9px;height:9px;border-radius:50%;background:#4cc9d9;box-shadow:0 0 0 5px var(--night)}
.pg-ctan{display:block;font-family:var(--serif);font-size:var(--fs-sub);line-height:1;color:#4cc9d9}
.pg-ctast{margin:.85rem 0 0;font-size:var(--fs-body);font-weight:600;line-height:1.35;color:#ecf2f5}
.pg-ctasd{margin:.4rem 0 0;max-width:17rem;font-size:var(--fs-body);line-height:1.55;color:rgba(236,242,245,.62);text-wrap:pretty}
.pg-ctaacts{display:flex;flex-direction:column;align-items:stretch;gap:.7rem;padding-top:1rem}
.pg-ctaline{display:flex;flex-direction:column;gap:.3rem;margin:1rem 0 0;font-size:var(--fs-body)}
.pg-ctaline a{width:max-content;text-decoration:none;color:rgba(236,242,245,.66)}
.pg-ctaline .pg-ctatel{font-size:var(--fs-sub);font-weight:600;letter-spacing:.01em;color:#ecf2f5}
.pg-ctaline a:hover{text-decoration:underline;text-underline-offset:4px}
.pg-cta .pg-btn:focus-visible,.pg-ctaline a:focus-visible{outline:2px solid #4cc9d9;outline-offset:3px}

@media (max-width:1023px){
  .pg-headgrid,.pg-shead{grid-template-columns:1fr}
  .pg-ctabody{grid-template-columns:1fr;gap:2.4rem}
  .pg-ctaacts{flex-direction:row;flex-wrap:wrap;align-items:center;padding-top:0}
  .pg-ctaline{flex-direction:row;flex-wrap:wrap;align-items:baseline;gap:.3rem 1.4rem;margin:0 0 0 .5rem}
  .pg-ctaacts{column-gap:.7rem;row-gap:1rem}
  .pg-head--split .pg-headgrid{align-items:start;gap:1.2rem}
  .pg-headside{padding-bottom:0}
}
@media (max-width:767px){
  .pg{--nav-room:68px}
  .pg-head{padding:calc(var(--nav-room) + .6rem) 0 2.4rem}
  .pg-h1{font-size:var(--fs-title);max-width:none}
  .pg-intro{font-size:var(--fs-sub)}
  .pg-actions .pg-btn{flex:1 1 auto}
  .pg-sec{padding:3.6rem 0}
  .pg-h2{font-size:var(--fs-title)}
  .pg-shead{margin-bottom:1.8rem}
  .pg-cta{padding:4rem 0 3.4rem}
  .pg-ctah{font-size:var(--fs-title)}
  .pg-ctabody{margin-top:2.2rem;gap:2.2rem}
  /* the steps run down a line on phones */
  .pg-ctasteps{grid-template-columns:1fr}
  .pg-ctasteps li{display:grid;grid-template-columns:2.4rem minmax(0,1fr);column-gap:.2rem;padding:0 0 1.5rem 1.4rem;border-top:0;border-left:1px solid rgba(236,242,245,.2)}
  .pg-ctasteps li:last-child{padding-bottom:0;border-left-color:transparent}
  .pg-ctasteps li::before{left:-5px;top:.55rem}
  .pg-ctan{grid-row:span 2;font-size:var(--fs-sub)}
  .pg-ctast{margin:0;font-size:var(--fs-body)}
  .pg-ctasd{max-width:none}
  .pg-ctaacts{flex-direction:column;align-items:stretch}
  .pg-ctaline{flex-direction:column;align-items:flex-start;margin:.5rem 0 0}
}
/* motion: anything marked data-rv arrives as it comes into view. Scripts add the starting state, so without them nothing is hidden. */
.pg-w{display:inline-block;overflow:hidden;vertical-align:top;padding:0 .04em .14em;margin:0 -.04em -.14em}
.pg-w>span{display:inline-block;transition:transform 1.05s cubic-bezier(.2,.75,.15,1);transition-delay:calc(var(--rvd,0ms) + var(--wi,0) * 55ms)}
.rv-pending .pg-w>span{transform:translateY(112%)}
[data-rv]:not([data-rv=words]){transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform 1.05s cubic-bezier(.2,.75,.15,1);transition-delay:var(--rvd,0ms)}
[data-rv].rv-pending:not([data-rv=words]){opacity:0;transform:translateY(32px)}
[data-rv=fade].rv-pending{transform:none!important}
[data-rv=left].rv-pending{transform:translateX(-44px)!important}
[data-rv=right].rv-pending{transform:translateX(44px)!important}
[data-rv=rise].rv-pending{transform:translateY(70px)!important}
@media (prefers-reduced-motion:reduce){.pg *{transition:none!important}}
`;
