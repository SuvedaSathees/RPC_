/**
 * Waterproofing page, kept to what RPC's "Types of Waterproofing Methods"
 * document says:
 *
 *   opening   the title, how a method is chosen and the ways to start; then
 *             "Where is the water getting in?": the eight places our services
 *             cover, on a drawing of a house (lib/pages/methods-tools.ts)
 *   rain test pick a method and watch where it stops the water (lib/pages/methods-rain.ts)
 *   methods   the twelve methods in their four kinds, one row each with where
 *             it is mainly used and how it goes on; opened, how it works, what
 *             to keep in mind, and the products on our list of that kind
 *   places    the other twelve places the document lists, what each is
 *             protected against, and the methods it names for them
 *   brands    the fifteen brands it lists, and what each is known for, moving slowly left to right
 *   close     the ways to start
 *
 * Links to /waterproofing#m-<key> open that method, #a-<key> a place (for the
 * eight on the drawing, the drawing opens on it).
 */
import { METHOD_GROUPS, METHODS, PLACES, type Method } from "../methods/data";
import { AREA_PURPOSE, BRAND_SPECIALITY, DOC_INTRO, FOSROC_BY_METHOD, REFERENCE_SITES, SERVICE_CATEGORIES } from "../methods/doc";
import type { Product } from "../products";
import { arrow, ctaBand, esc, secHead, type ContactInfo, type PageOptions } from "./kit";
import { methodsData, METHODS_TOOLS_CSS, placeMapMarkup } from "./methods-tools";
import { RAIN_CSS, rainMarkup } from "./methods-rain";

export interface MethodsData {
  products: readonly Product[];
  contact: ContactInfo;
}

export const METHODS_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Waterproofing", href: "/waterproofing" },
] as const;

const byNo = (n: number) => METHODS.find((m) => m.no === n);
/** the brands on RPC's product list, for marking them among the document's brands */
const STOCKED = ["Fosroc", "Sika", "Berger"];
const stocked = (b: string) => STOCKED.some((s) => b.toLowerCase().startsWith(s.toLowerCase()));

/** the document's brands, those on our list first (otherwise in the document's order) */
const BRANDS = [...BRAND_SPECIALITY].sort((x, y) => Number(stocked(y.brand)) - Number(stocked(x.brand)));

const TICK = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const MIND = `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.8v4M8 11.1v.1" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;

/** a method as a card: its name, how it goes on, where it is used, how it works, what is good to know and what to keep in mind, and our products of its kind */
function methodRow(m: Method, products: readonly Product[]) {
  const ps = m.products.map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => Boolean(p));
  // Fosroc products the guide names for this kind of method that are not on our list
  const also = FOSROC_BY_METHOD.filter((f) => f.methods.includes(m.key))
    .flatMap((f) => f.products)
    .filter((p) => !p.slug);
  const prods = [
    ps.length ? `<p><span>On our product list</span>${ps.map((p) => `<a href="/products#${p.slug}" data-internal>${esc(p.name)}</a>`).join("")}</p>` : "",
    also.length ? `<p><span>Also from Fosroc</span>${also.map((p) => `<b>${esc(p.name)}</b>`).join("")}</p>` : "",
  ].join("");
  return `<li class="wp-row wp-card" id="m-${m.key}">
  <h4 class="wp-cn">${esc(m.name)}</h4>
  <p class="wp-ca">${esc(m.applied)}</p>
  <p class="wp-cuse"><span>Used on</span>${esc(m.areas)}</p>
  <p class="wp-how">${esc(m.how)}</p>
  <dl class="wp-notes">
    <div class="is-good"><dt>${TICK}Good to know</dt><dd>${esc(m.notes[0])}</dd></div>
    <div class="is-mind"><dt>${MIND}Keep in mind</dt><dd>${esc(m.notes[1])}</dd></div>
  </dl>
  ${prods ? `<div class="wp-prods">${prods}</div>` : ""}
</li>`;
}

/** what each kind's picture shows (a rendered cut-away, in /public/images/methods) */
const KIND_ALT: Readonly<Record<string, string>> = {
  coat: "A concrete slab with a waterproof coat applied over its surface",
  sheet: "A sheet membrane unrolled over a concrete slab, two sheets lapped where they meet",
  concrete: "A concrete block with crystals grown in its pores, near the surface",
  joint: "Two concrete pours with a waterstop cast across the joint and a sealant at the top",
};

/** one kind of method: a picture of where it keeps the water out, and its methods */
function kindBlock(g: (typeof METHOD_GROUPS)[number], products: readonly Product[]) {
  return `<section class="wp-kind" aria-labelledby="wp-k-${g.key}">
  <div class="wp-khead">
    <div class="wp-kart"><img src="/images/methods/${g.key}.webp" width="900" height="438" alt="${esc(KIND_ALT[g.key] ?? "")}" loading="lazy" decoding="async"></div>
    <h3 class="wp-kname" id="wp-k-${g.key}">${esc(g.label)}</h3>
    <p class="wp-kline">${esc(g.line)}</p>
  </div>
  <ul class="wp-rows">${METHODS.filter((m) => m.group === g.key)
    .map((m) => methodRow(m, products))
    .join("")}</ul>
</section>`;
}

function placeItem(a: (typeof PLACES)[number]) {
  const ms = a.methods.map(byNo).filter((m): m is Method => Boolean(m));
  return `<li class="wp-p" id="a-${a.key}">
  <h3 class="wp-pname">${esc(a.label)}</h3>
  <p class="wp-ppurp">${esc(AREA_PURPOSE[a.key] ?? "")}</p>
  ${ms.length ? `<p class="wp-pms">${ms.map((m) => `<a href="#m-${m.key}" data-m-go="${m.key}">${esc(m.short)}</a>`).join("")}</p>` : ""}
</li>`;
}

export function methodsPageMarkup(d: MethodsData, o: PageOptions = {}) {
  void o;
  const c = d.contact;
  const head = `<header class="pg-head wp-head">
  <div class="pg-wrap">
    <div class="wp-hgrid">
      <div>
        <p class="pg-mark">Waterproofing</p>
        <h1 class="pg-h1">Waterproofing methods for every part of a&nbsp;building.</h1>
      </div>
      <div class="wp-hside">
        <p class="pg-intro">${esc(DOC_INTRO)}</p>
        <div class="pg-actions"><a class="pg-btn pg-btn--ink" href="/contact#enquiry" data-internal>Book a free site inspection${arrow}</a><a class="pg-btn pg-btn--line" href="${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer">Send us a photo on WhatsApp</a></div>
      </div>
    </div>
  </div>
</header>`;

  const methods = `<section class="pg-sec pg-sec--stone wp-msec" id="methods" aria-labelledby="wp-m-h">
  <div class="pg-wrap">
    ${secHead({ label: "From our methods guide", title: "Twelve methods, in four kinds.", id: "wp-m-h", lede: "How each works, what is good to know and what to keep in mind. The final choice is made on site, once we know where the water is coming from." })}
    <div class="wp-kinds">${METHOD_GROUPS.map((g) => kindBlock(g, d.products)).join("")}</div>
  </div>
</section>`;

  const onDrawing = new Set(SERVICE_CATEGORIES.map((s) => s.area));
  const more = PLACES.filter((p) => !onDrawing.has(p.key));
  const places = `<section class="pg-sec wp-psec" id="areas" aria-labelledby="wp-a-h">
  <div class="pg-wrap">
    ${secHead({ label: "Also in our guide", title: "Twelve more places that need waterproofing.", id: "wp-a-h", lede: "Where our guide names a method for one, it is linked. For the others, the method is chosen on site." })}
    <ul class="wp-plist">${more.map(placeItem).join("")}</ul>
  </div>
</section>`;

  const brands = `<section class="pg-sec pg-sec--stone wp-bsec" id="brands" aria-labelledby="wp-b-h">
  <div class="pg-wrap">
    ${secHead({ label: "Brands", title: "Fifteen brands, and what each is known for.", id: "wp-b-h", lede: "From our methods guide. Fosroc, Sika and Berger are on our own product list." })}
    <div class="wp-marq" role="region" aria-label="The fifteen brands, moving slowly; hover to pause">
      <ul class="wp-mtrack">${[0, 1]
        .map((copy) =>
          BRANDS.map(
            (b) =>
              `<li class="wp-btile${stocked(b.brand) ? " is-ours" : ""}"${copy ? ` aria-hidden="true"` : ""}><p class="wp-bname">${esc(b.brand)}</p>${stocked(b.brand) ? `<span class="wp-bours">On our list</span>` : ""}<p class="wp-bspec">${esc(b.speciality)}</p></li>`,
          ).join(""),
        )
        .join("")}</ul>
    </div>
    <p class="wp-refs">For product data, see the makers’ own sites: ${REFERENCE_SITES.map((r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a>`).join(", ")}.</p>
  </div>
</section>`;

  return `${head}\n${placeMapMarkup()}\n${rainMarkup()}\n${methods}\n${methodsData(d.products)}\n${places}\n${brands}\n${ctaBand(c, {
    title: "Not sure which method your building needs?",
    steps: [
      ["Show us where it leaks", "Photos on WhatsApp are a good start."],
      ["We trace the water", "Where it gets in decides the method, not the other way round."],
      ["You get a method for your building", "The system, the products and the area it covers, in writing."],
    ],
  })}`;
}

/* ---------------------------------------------------------------- CSS */
const BASE_CSS = `
/* opening: the title and the ways to start, with the house straight under them */
.wp-head{padding-bottom:0;border-bottom:0}
.wp-hgrid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:1.4rem clamp(2rem,6vw,6rem);align-items:end}
.wp-hgrid .pg-mark{margin-bottom:.9rem}
.wp-hgrid .pg-h1{max-width:17ch}
.wp-hside .pg-intro{margin:0;max-width:34rem}

/* the twelve methods, kind by kind: the kind's picture and name above, its methods as cards */
.wp-kinds{display:flex;flex-direction:column;gap:clamp(2.2rem,5vh,3.2rem)}
.wp-kind{display:flex;flex-direction:column;gap:1.1rem}
.wp-khead{display:grid;grid-template-columns:9rem minmax(0,1fr);column-gap:1.2rem;align-items:center;padding-bottom:1rem;border-bottom:2px solid var(--navy)}
.wp-kart{grid-row:1 / span 2;width:100%;margin:0}
.wp-kart img{display:block;width:100%;height:auto}
.wp-kname{align-self:end;margin:0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.2;letter-spacing:-.01em}
.wp-kline{align-self:start;margin:.2rem 0 0;font-size:var(--fs-body);line-height:1.5;color:var(--mute)}
.wp-rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(.8rem,1.4vw,1.1rem);margin:0;padding:0;list-style:none}
.wp-card{display:flex;flex-direction:column;padding:clamp(1.15rem,1.8vw,1.5rem);border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1.2rem);transition:box-shadow .3s}
.wp-card:hover{box-shadow:inset 0 0 0 1px rgba(18,34,59,.3),0 22px 44px -34px rgba(18,34,59,.5)}
.wp-row.is-hit{box-shadow:inset 0 0 0 2px var(--accent),0 0 0 6px rgba(39,86,160,.12)}
.wp-cn{margin:0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.2;letter-spacing:-.01em;color:var(--ink)}
.wp-ca{margin:.25rem 0 0;font-size:var(--fs-body);line-height:1.45;color:var(--mute)}
.wp-cuse{display:flex;flex-wrap:wrap;align-items:baseline;gap:.15rem .6rem;margin:.9rem 0 0;padding:.55rem .75rem;border-radius:10px;background:rgba(18,34,59,.045);font-size:var(--fs-body);line-height:1.45;color:var(--ink)}
.wp-cuse span{font-weight:600;color:var(--accent)}
.wp-how{margin:.9rem 0 0;font-size:var(--fs-body);line-height:1.65;color:var(--ink2)}
.wp-notes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem 1.2rem;margin:1rem 0 0;padding-top:.95rem;border-top:1px solid var(--line)}
.wp-notes dt{display:flex;align-items:center;gap:.4rem;font-size:var(--fs-body);font-weight:600}
.wp-notes dt svg{flex:none;width:1rem;height:1rem}
.wp-notes .is-good dt{color:#1f7a4f}
.wp-notes .is-mind dt{color:#a35f10}
.wp-notes dd{margin:.2rem 0 0;font-size:var(--fs-body);line-height:1.5;color:var(--ink)}
.wp-prods{display:flex;flex-direction:column;gap:.55rem;margin-top:auto;padding-top:1rem}
.wp-notes + .wp-prods{border-top:0}
.wp-prods p{display:flex;flex-wrap:wrap;align-items:center;gap:.35rem;margin:0;font-size:var(--fs-body)}
.wp-prods span{margin-right:.3rem;color:var(--mute)}
.wp-prods a,.wp-prods b{display:inline-flex;align-items:center;min-height:2rem;padding:.25rem .7rem;border-radius:8px;font-weight:600;line-height:1.3}
.wp-prods a{background:var(--navy);color:#f5f0e6;text-decoration:none;transition:background-color .2s}
.wp-prods a:hover{background:var(--accent)}
.wp-prods b{box-shadow:inset 0 0 0 1px rgba(18,34,59,.2)}

/* twelve more places */
.wp-plist{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 clamp(1.6rem,3.5vw,3.4rem);margin:0;padding:0;list-style:none}
.wp-p{padding:1.1rem 0 1.3rem;border-top:1px solid var(--line);scroll-margin-top:calc(var(--nav-bar,80px) + 1.2rem)}
.wp-pname{margin:0;font-size:var(--fs-body);font-weight:600;line-height:1.4}
.wp-ppurp{margin:.3rem 0 0;font-size:var(--fs-body);line-height:1.55;color:var(--mute)}
.wp-pms{display:flex;flex-wrap:wrap;gap:.35rem;margin:.7rem 0 0}
.wp-pms a{display:inline-flex;align-items:center;min-height:1.9rem;padding:.2rem .6rem;border-radius:7px;box-shadow:inset 0 0 0 1px rgba(11,110,128,.4);font-size:var(--fs-body);font-weight:500;color:var(--water);text-decoration:none;transition:background-color .2s,color .2s}
.wp-pms a:hover{background:var(--water);color:#f5f0e6}

/* brands: the fifteen as tiles moving slowly left to right; hover (or focus) pauses them */
.wp-marq{margin-inline:calc(-1 * var(--gutter,16px));overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.wp-mtrack{display:flex;gap:.9rem;width:max-content;margin:0;padding:.4rem 0;list-style:none;animation:wp-marq 70s linear infinite}
.wp-marq:hover .wp-mtrack,.wp-marq:focus-within .wp-mtrack{animation-play-state:paused}
@keyframes wp-marq{from{transform:translateX(-50%)}to{transform:translateX(0)}}
.wp-btile{display:flex;flex-direction:column;gap:.45rem;width:17rem;min-height:9rem;box-sizing:border-box;padding:1.1rem 1.2rem;border-radius:14px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
.wp-btile.is-ours{background:var(--navy);box-shadow:none;color:#f5f0e6}
.wp-bname{margin:0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.2;letter-spacing:-.01em}
.wp-bours{align-self:flex-start;display:inline-flex;align-items:center;height:1.6rem;padding:0 .55rem;border-radius:999px;background:rgba(245,240,230,.16);font-size:var(--fs-body);font-weight:600;color:#f5f0e6}
.wp-bspec{margin:auto 0 0;font-size:var(--fs-body);line-height:1.45;color:var(--ink2)}
.wp-btile.is-ours .wp-bspec{color:rgba(245,240,230,.78)}
@media (prefers-reduced-motion:reduce){
  .wp-marq{margin-inline:0;-webkit-mask-image:none;mask-image:none}
  .wp-mtrack{flex-wrap:wrap;width:auto;animation:none}
  .wp-mtrack li[aria-hidden]{display:none}
}
.wp-refs{margin:1.6rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.wp-refs a{color:var(--ink);text-underline-offset:3px}

@media (max-width:1023px){
  .wp-hgrid{grid-template-columns:minmax(0,1fr);align-items:start}
  .wp-plist{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:899px){
  .wp-rows{grid-template-columns:minmax(0,1fr)}
  .wp-khead{grid-template-columns:7rem minmax(0,1fr)}
}
@media (max-width:767px){
  .wp-plist{grid-template-columns:minmax(0,1fr)}
  .wp-p{padding:.9rem 0 1rem}
  .wp-notes{grid-template-columns:minmax(0,1fr)}
  .wp-btile{width:14.5rem}
}
`;

export const METHODS_PAGE_CSS = BASE_CSS + METHODS_TOOLS_CSS + RAIN_CSS;
