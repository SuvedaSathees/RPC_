/**
 * Waterproofing page, laid out like RPC's "Types of Waterproofing Methods"
 * document and kept to what it says:
 *
 *   opening    why waterproofing, and how a method is chosen, with the page's contents
 *   methods    the twelve methods: where each is mainly used, how it works, what
 *              to keep in mind, and the products on our list of that kind
 *   areas      the twenty places in a building the document lists, what each is
 *              protected against, and the methods the document names for it
 *   services   the eight waterproofing services the document recommends
 *   fosroc     the Fosroc products it names for each kind of method
 *   brands     fifteen brands and what each is known for; which brands to look at
 *              for each job; and how to choose between them
 *   close      the ways to start
 *
 * Links to /waterproofing#m-<key> land on that method, #a-<key> on a place.
 */
import { BRANDS_BY_JOB, CHOOSING, METHOD_GROUPS, METHODS, PLACES, type Method } from "../methods/data";
import { AREA_PURPOSE, BRAND_ADVICE, BRAND_GROUPS, BRAND_SPECIALITY, DOC_INTRO, DOC_WHY, FOSROC_BY_METHOD, REFERENCE_SITES, SERVICE_CATEGORIES } from "../methods/doc";
import type { Product } from "../products";
import { arrow, ctaBand, esc, secHead, serviceSlug, two, words, type ContactInfo, type PageOptions } from "./kit";

export interface MethodsData {
  products: readonly Product[];
  contact: ContactInfo;
}

export const METHODS_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Waterproofing", href: "/waterproofing" },
] as const;

const byNo = (n: number) => METHODS.find((m) => m.no === n);
const groupOf = (m: Method) => METHOD_GROUPS.find((g) => g.key === m.group)!;
/** the brands on RPC's product list, for marking them among the document's brands */
const STOCKED = ["Fosroc", "Sika", "Berger"];
const stocked = (b: string) => STOCKED.some((s) => b.toLowerCase().startsWith(s.toLowerCase()));

/** a small drawing for each kind of method */
const GROUP_ICON: Record<string, string> = {
  coat: `<path d="M4 17h16"/><path d="M5 14.5c2-1.6 4-1.6 6 0s4 1.6 6 0 2-1.1 2-1.1"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.2"/><path d="M17 8.5v3"/>`,
  sheet: `<path d="M3.5 16.5h17"/><path d="M5 13.5h9.5l2.5-2.5"/><ellipse cx="18.2" cy="9" rx="1.8" ry="3"/><path d="M5 13.5 7.5 11h9"/>`,
  concrete: `<rect x="3.5" y="6" width="17" height="12" rx="1.5"/><circle cx="8" cy="10.5" r="1"/><circle cx="13.5" cy="13.5" r="1"/><circle cx="16.5" cy="9.5" r=".8"/><circle cx="9.5" cy="15" r=".7"/>`,
  joint: `<rect x="3.5" y="6" width="7.5" height="12" rx="1"/><rect x="13" y="6" width="7.5" height="12" rx="1"/><path d="M12 4v16" stroke-dasharray="2 2"/>`,
};
const groupIcon = (k: string) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${GROUP_ICON[k] ?? GROUP_ICON.coat}</svg>`;

function methodCard(m: Method, products: readonly Product[]) {
  const g = groupOf(m);
  const ps = m.products.map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => Boolean(p));
  const areas = m.areas.split(/,\s*/);
  return `<li class="wp-m" id="m-${m.key}" data-rv>
  <div class="wp-mtop"><span class="wp-mno">${two(m.no)}</span><span class="wp-mgroup">${groupIcon(m.group)}${esc(g.label)}</span></div>
  <h3 class="wp-mname">${esc(m.name)}</h3>
  <ul class="wp-mareas" aria-label="Main application areas">${areas.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
  <p class="wp-mhow">${esc(m.how)}</p>
  <dl class="wp-mnotes">
    <div><dt>Good to know</dt><dd>${esc(m.notes[0])}</dd></div>
    <div><dt>Keep in mind</dt><dd>${esc(m.notes[1])}</dd></div>
    <div><dt>Goes on</dt><dd>${esc(m.applied)}</dd></div>
  </dl>
  ${
    ps.length
      ? `<p class="wp-mprod"><span>On our product list</span>${ps.map((p) => `<a href="/products#${p.slug}" data-internal>${esc(p.name)}</a>`).join("")}</p>`
      : ""
  }
</li>`;
}

function areaTile(a: (typeof PLACES)[number], i: number) {
  const ms = a.methods.map(byNo).filter((m): m is Method => Boolean(m));
  return `<li class="wp-a" id="a-${a.key}">
  <span class="wp-ano">${two(i + 1)}</span>
  <h3 class="wp-aname">${esc(a.label)}</h3>
  <p class="wp-apurp">${esc(AREA_PURPOSE[a.key] ?? "")}</p>
  <p class="wp-ams">${
    ms.length
      ? ms.map((m) => `<a href="#m-${m.key}" data-m-go="${m.key}">${esc(m.short)}</a>`).join("")
      : `<span class="wp-aonsite">Method chosen on site</span>`
  }</p>
</li>`;
}

export function methodsPageMarkup(d: MethodsData, o: PageOptions = {}) {
  void o;
  const c = d.contact;
  const toc = [
    ["#methods", "The 12 methods"],
    ["#areas", "20 places water gets in"],
    ["#our-services", "Our waterproofing services"],
    ["#fosroc", "Fosroc products by method"],
    ["#brands", "Brands, and how to choose"],
  ];
  const head = `<header class="pg-head wp-head">
  <div class="pg-wrap">
    <div class="wp-headgrid">
      <div>
        <p class="pg-mark">Types of waterproofing methods</p>
        <h1 class="pg-h1" data-rv="words">${words("Waterproofing methods for every part of a&nbsp;building.")}</h1>
        <p class="pg-intro" data-rv>${esc(DOC_WHY)} ${esc(DOC_INTRO)}</p>
        <div class="pg-actions" data-rv><a class="pg-btn pg-btn--ink" href="/contact#enquiry" data-internal>Book a free site inspection${arrow}</a><a class="pg-btn pg-btn--line" href="${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer">Send us a photo on WhatsApp</a></div>
      </div>
      <nav class="wp-toc" aria-label="On this page" data-rv>
        <p>On this page</p>
        <ol>${toc.map(([h, t]) => `<li><a href="${h}">${esc(t!)}${arrow}</a></li>`).join("")}</ol>
        <p class="wp-tocnote">From our methods guide. Based in Erode, working all over Tamil Nadu.</p>
      </nav>
    </div>
  </div>
</header>`;

  const methods = `<section class="pg-sec wp-msec" id="methods" aria-labelledby="wp-m-h">
  <div class="pg-wrap">
    ${secHead({ label: "The methods", title: "Twelve waterproofing methods, and where each is used.", id: "wp-m-h", lede: "The main application areas are from our methods guide. The final choice is made on site, once we know where the water is coming from." })}
    <p class="wp-swipe" aria-hidden="true">Swipe sideways for all twelve methods.</p>
    <ol class="wp-mlist">${METHODS.map((m) => methodCard(m, d.products)).join("")}</ol>
  </div>
</section>`;

  const areas = `<section class="pg-sec pg-sec--stone wp-asec" id="areas" aria-labelledby="wp-a-h">
  <div class="pg-wrap">
    ${secHead({ label: "Application areas", title: "Twenty places water gets into a building.", id: "wp-a-h", lede: "What each place is protected against, and the methods our guide names for it. Press a method to read about it." })}
    <ol class="wp-alist">${PLACES.map(areaTile).join("")}</ol>
  </div>
</section>`;

  const services = `<section class="pg-sec wp-ssec" id="our-services" aria-labelledby="wp-s-h">
  <div class="pg-wrap">
    <div class="wp-sgrid">
      <div>
        ${secHead({ label: "What we do", title: "Our waterproofing services.", id: "wp-s-h", lede: "Eight services for homes, offices and factories in Erode, Coimbatore and across Tamil Nadu." })}
        <a class="pg-link" href="/services" data-internal>All our services${arrow}</a>
      </div>
      <ul class="wp-slist">${SERVICE_CATEGORIES.map(
        (s) => `<li><a href="/services#${serviceSlug(s.title)}" data-internal><span class="wp-sname">${esc(s.title)}</span><span class="wp-sline">${esc(AREA_PURPOSE[s.area] ?? "")}</span>${arrow}</a></li>`,
      ).join("")}</ul>
    </div>
  </div>
</section>`;

  const fosroc = `<section class="pg-sec pg-sec--sky wp-fsec" id="fosroc" aria-labelledby="wp-f-h">
  <div class="pg-wrap">
    ${secHead({ label: "Fosroc", title: "Common Fosroc products, by method.", id: "wp-f-h", lede: "The products our guide names for each kind of method. Those on our product list link to it." })}
    <div class="wp-ftable" role="table" aria-label="Fosroc products by method">
      <div class="wp-frow wp-frow--head" role="row"><span role="columnheader">Method</span><span role="columnheader">Fosroc products</span></div>
      ${FOSROC_BY_METHOD.map(
        (f) => `<div class="wp-frow" role="row"><span class="wp-fm" role="cell">${esc(f.method)}</span><span class="wp-fp" role="cell">${f.products
          .map((p) => (p.slug ? `<a href="/products#${p.slug}" data-internal>${esc(p.name)}</a>` : `<span>${esc(p.name)}</span>`))
          .join("")}</span></div>`,
      ).join("")}
    </div>
  </div>
</section>`;

  const brands = `<section class="pg-sec wp-bsec" id="brands" aria-labelledby="wp-b-h">
  <div class="pg-wrap">
    ${secHead({ label: "Brands", title: "Waterproofing brands, and what each is known for.", id: "wp-b-h", lede: "Fifteen brands from our guide. The ones marked are on our own product list." })}
    <ul class="wp-blist">${BRAND_SPECIALITY.map(
      (b) => `<li class="${stocked(b.brand) ? "is-ours" : ""}"><span class="wp-bname">${esc(b.brand)}${stocked(b.brand) ? `<span class="wp-bours">On our list</span>` : ""}</span><span class="wp-bspec">${esc(b.speciality)}</span></li>`,
    ).join("")}</ul>
    <div class="wp-byjob">
      <h3 class="pg-h3">Brands to compare, by job</h3>
      <dl>${BRANDS_BY_JOB.map(
        (x) => `<div><dt>${esc(x.job)}</dt><dd>${x.brands
          .split(/,\s*/)
          .map((b) => `<span class="${stocked(b) ? "is-ours" : ""}">${esc(b)}</span>`)
          .join("")}</dd></div>`,
      ).join("")}</dl>
    </div>
    <div class="wp-choose">
      <div class="wp-cgroups">
        <h3 class="pg-h3">How we choose a system</h3>
        <p>We keep three groups of brands:</p>
        <ol>${BRAND_GROUPS.map((g) => `<li>${esc(g)}</li>`).join("")}</ol>
        <p>${esc(BRAND_ADVICE)}</p>
      </div>
      <ul class="wp-ccrit">${CHOOSING.map((x) => `<li><b>${esc(x.title)}</b><span>${esc(x.line)}</span></li>`).join("")}</ul>
    </div>
    <p class="wp-refs">For product data, see the makers’ own sites: ${REFERENCE_SITES.map((r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a>`).join(", ")}.</p>
  </div>
</section>`;

  return `${head}\n${methods}\n${areas}\n${services}\n${fosroc}\n${brands}\n${ctaBand(c, {
    title: "Not sure which method your building needs?",
    steps: [
      ["Show us where it leaks", "Photos on WhatsApp are a good start."],
      ["We trace the water", "Where it gets in decides the method, not the other way round."],
      ["You get a method for your building", "The system, the products and the area it covers, in writing."],
    ],
  })}`;
}

/* ---------------------------------------------------------------- CSS */
export const METHODS_PAGE_CSS = `
.wp-headgrid{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:2rem clamp(2rem,5vw,6rem);align-items:end}
.wp-headgrid .pg-mark{margin-bottom:.9rem}
.wp-headgrid .pg-h1{max-width:20ch}
.wp-toc{padding:clamp(1.2rem,2vw,1.6rem);border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
.wp-toc > p:first-child{margin:0 0 .6rem;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.wp-toc ol{margin:0;padding:0;list-style:none}
.wp-toc li{border-top:1px solid var(--line)}
.wp-toc a{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.75rem 0;font-size:var(--fs-body);font-weight:600;text-decoration:none}
.wp-toc a:hover .pg-ar{transform:translate(2px,-2px)}
.wp-toc .pg-ar{color:var(--mute)}
.wp-tocnote{margin:.6rem 0 0;padding-top:.8rem;border-top:1px solid var(--line);font-size:var(--fs-body);color:var(--mute)}

/* the twelve methods */
.wp-mlist{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(.8rem,1.4vw,1.2rem);margin:0;padding:0;list-style:none}
.wp-m{display:flex;flex-direction:column;gap:.8rem;padding:clamp(1.2rem,1.8vw,1.6rem);border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1.2rem);transition:box-shadow .4s}
.wp-m.is-hit,.wp-m:target{box-shadow:inset 0 0 0 2px var(--accent),0 0 0 6px rgba(39,86,160,.12)}
.wp-mtop{display:flex;align-items:center;justify-content:space-between;gap:1rem}
.wp-mno{font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1;color:var(--accent);font-variant-numeric:tabular-nums}
.wp-mgroup{display:inline-flex;align-items:center;gap:.4rem;font-size:var(--fs-body);color:var(--mute)}
.wp-mgroup svg{width:1.3rem;height:1.3rem;color:var(--water)}
.wp-mname{margin:0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.22;letter-spacing:-.01em}
.wp-mareas{display:flex;flex-wrap:wrap;gap:.35rem;margin:0;padding:0;list-style:none}
.wp-mareas li{padding:.3rem .65rem;border-radius:7px;background:var(--sky);font-size:var(--fs-body);font-weight:500;line-height:1.3;color:var(--ink)}
.wp-mhow{margin:0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.wp-mnotes{margin:0;padding-top:.3rem}
.wp-mnotes div{display:grid;grid-template-columns:7.2rem minmax(0,1fr);gap:.8rem;padding:.55rem 0;border-top:1px solid var(--line)}
.wp-mnotes dt{font-size:var(--fs-body);color:var(--mute)}
.wp-mnotes dd{margin:0;font-size:var(--fs-body);line-height:1.5}
.wp-mprod{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;margin:auto 0 0;padding-top:.8rem;border-top:1px solid var(--line);font-size:var(--fs-body)}
.wp-mprod span{flex-basis:100%;color:var(--mute)}
.wp-mprod a{display:inline-flex;align-items:center;height:2rem;padding:0 .7rem;border-radius:8px;background:var(--navy);color:#f5f0e6;font-weight:600;text-decoration:none}
.wp-mprod a:hover{background:var(--accent)}

/* the twenty places */
.wp-alist{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.7rem;margin:0;padding:0;list-style:none}
.wp-a{display:flex;flex-direction:column;gap:.5rem;padding:1.1rem 1.15rem;border-radius:14px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1.2rem)}
.wp-ano{font-size:var(--fs-body);font-weight:600;color:var(--accent);font-variant-numeric:tabular-nums}
.wp-aname{margin:0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.22;letter-spacing:-.01em}
.wp-apurp{margin:0;font-size:var(--fs-body);line-height:1.55;color:var(--ink2)}
.wp-ams{display:flex;flex-wrap:wrap;gap:.35rem;margin:auto 0 0;padding-top:.5rem}
.wp-ams a{display:inline-flex;align-items:center;height:1.9rem;padding:0 .6rem;border-radius:7px;box-shadow:inset 0 0 0 1px rgba(11,110,128,.4);font-size:var(--fs-body);font-weight:500;color:var(--water);text-decoration:none;transition:background-color .2s,color .2s}
.wp-ams a:hover{background:var(--water);color:#f5f0e6}
.wp-aonsite{font-size:var(--fs-body);color:var(--mute)}

/* our services */
.wp-sgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.6fr);gap:2rem clamp(2rem,5vw,5rem);align-items:start}
.wp-slist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem;margin:0;padding:0;list-style:none}
.wp-slist a{position:relative;display:flex;flex-direction:column;gap:.35rem;height:100%;padding:1.1rem 3rem 1.1rem 1.2rem;border-radius:14px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);text-decoration:none;transition:box-shadow .3s}
.wp-slist a:hover{box-shadow:inset 0 0 0 1.5px var(--navy)}
.wp-slist .pg-ar{position:absolute;right:1.1rem;top:1.2rem;color:var(--accent)}
.wp-slist a:hover .pg-ar{transform:translate(2px,-2px)}
.wp-sname{font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.25}
.wp-sline{font-size:var(--fs-body);line-height:1.5;color:var(--ink2)}

/* Fosroc by method */
.wp-ftable{border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px rgba(39,86,160,.16);overflow:hidden}
.wp-frow{display:grid;grid-template-columns:minmax(10rem,.6fr) minmax(0,2fr);gap:1rem 2rem;align-items:center;padding:1rem clamp(1rem,2vw,1.6rem);border-top:1px solid var(--line)}
.wp-frow--head{border-top:0;background:rgba(39,86,160,.08);font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.wp-fm{font-family:var(--display);font-weight:600;font-size:var(--fs-sub)}
.wp-fp{display:flex;flex-wrap:wrap;gap:.45rem}
.wp-fp a,.wp-fp > span{display:inline-flex;align-items:center;height:2.2rem;padding:0 .8rem;border-radius:9px;font-size:var(--fs-body);font-weight:600}
.wp-fp a{background:var(--navy);color:#f5f0e6;text-decoration:none}
.wp-fp a:hover{background:var(--accent)}
.wp-fp > span{box-shadow:inset 0 0 0 1px rgba(18,34,59,.2)}

/* brands */
.wp-blist{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 clamp(1.4rem,3vw,3rem);margin:0;padding:0;list-style:none}
.wp-blist li{display:flex;flex-direction:column;gap:.3rem;padding:1rem 0;border-top:1px solid var(--line)}
.wp-bname{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.25}
.wp-bours{display:inline-flex;align-items:center;height:1.6rem;padding:0 .55rem;border-radius:6px;background:var(--water);font-family:var(--sans);font-size:var(--fs-body);font-weight:600;color:#f5f0e6}
.wp-bspec{font-size:var(--fs-body);line-height:1.5;color:var(--ink2)}
.wp-byjob{margin-top:clamp(2.4rem,6vh,3.4rem)}
.wp-byjob dl{margin:1rem 0 0;border-top:2px solid var(--ink)}
.wp-byjob dl div{display:grid;grid-template-columns:minmax(12rem,.7fr) minmax(0,2fr);gap:.6rem 2rem;align-items:center;padding:.9rem 0;border-bottom:1px solid var(--line)}
.wp-byjob dt{font-size:var(--fs-body);font-weight:600}
.wp-byjob dd{display:flex;flex-wrap:wrap;gap:.4rem;margin:0}
.wp-byjob dd span{display:inline-flex;align-items:center;height:2rem;padding:0 .7rem;border-radius:8px;box-shadow:inset 0 0 0 1px rgba(18,34,59,.18);font-size:var(--fs-body);font-weight:500}
.wp-byjob dd span.is-ours{background:var(--water);box-shadow:none;color:#f5f0e6}
.wp-choose{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:1.6rem clamp(2rem,5vw,4rem);margin-top:clamp(2.4rem,6vh,3.4rem);padding:clamp(1.4rem,3vw,2.2rem);border-radius:16px;background:var(--sand-2)}
.wp-cgroups p{margin:.7rem 0 0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.wp-cgroups ol{display:flex;flex-direction:column;gap:.4rem;margin:.7rem 0 0;padding:0 0 0 1.2rem;font-size:var(--fs-body);font-weight:600}
.wp-ccrit{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.6rem;margin:0;padding:0;list-style:none}
.wp-ccrit li{display:flex;flex-direction:column;gap:.25rem;padding-top:.8rem;border-top:1px solid rgba(18,34,59,.16);font-size:var(--fs-body);line-height:1.5}
.wp-ccrit span{color:var(--ink2)}
.wp-refs{margin:1.6rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.wp-refs a{color:var(--ink);text-underline-offset:3px}

@media (max-width:1199px){
  .wp-mlist{grid-template-columns:repeat(2,minmax(0,1fr))}
  .wp-alist{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-width:1023px){
  .wp-headgrid,.wp-sgrid,.wp-choose{grid-template-columns:1fr}
  .wp-blist{grid-template-columns:repeat(2,minmax(0,1fr))}
}
.wp-swipe{display:none}
@media (max-width:767px){
  .wp-slist,.wp-blist,.wp-ccrit{grid-template-columns:1fr}
  /* phones: the twelve methods side by side, swiped through */
  .wp-swipe{display:block;margin:-.6rem 0 .9rem;font-size:var(--fs-body);color:var(--mute)}
  .wp-mlist{display:flex;gap:.7rem;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;margin-inline:calc(-1 * var(--gutter,16px));padding:0 var(--gutter,16px) .5rem;scroll-padding-inline:var(--gutter,16px);scrollbar-width:none}
  .wp-mlist::-webkit-scrollbar{display:none}
  .wp-m{flex:0 0 86%;scroll-snap-align:start}
  .wp-alist{grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem}
  .wp-a{padding:.95rem}
  .wp-frow{grid-template-columns:1fr;gap:.6rem}
  .wp-frow--head{display:none}
  .wp-byjob dl div{grid-template-columns:1fr}
  .wp-mnotes div{grid-template-columns:1fr;gap:.15rem}
}
@media (max-width:479px){
  .wp-alist{grid-template-columns:1fr}
  .wp-a{display:grid;grid-template-columns:2rem minmax(0,1fr);gap:.35rem .4rem;padding:.9rem 1rem}
  .wp-ano{grid-row:1;padding-top:.15rem}
  .wp-aname,.wp-apurp,.wp-ams{grid-column:2}
  .wp-ams{padding-top:.25rem}
}
`;
