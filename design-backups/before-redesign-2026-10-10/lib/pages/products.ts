/**
 * Products page: any two of RPC's products, side by side.
 *
 *   opening     what is here, in a line
 *   compare     the seam (lib/compare): pick A and B; what they share moves to
 *               the middle, what sets them apart stays on its side; a picture
 *               of each kind of product going on (made with AI, and labelled)
 *   pairs       ready-made pairs that do the same job
 *   list        every product grouped by family: search, narrow by family or
 *               brand, put any one into the comparison, or ask for its rate
 *   close       before you buy, and the ways to ask
 *
 * Product facts come only from RPC's spreadsheet. No prices are shown: the
 * sheet has none, so every product is "rate on request", by WhatsApp.
 * Links to /products#<slug> open that product in the comparison; links to
 * /products#vs=<a>,<b> open a pair.
 */
import { productParts, packIcon, productSide } from "../compare/products-seam";
import { seamHead, swapIcon, SEAM_CSS } from "../compare/seam";
import { MEDIA, mediaReady, mediaSrcSmall } from "../media/catalog";

/** whether any of the AI pictures are in place yet (their notes appear with them) */
const pictures = () => Object.keys(MEDIA).some((k) => mediaReady(k));
import { FAMILIES, PRODUCT_COUNT, BRANDS, productBySlug, rateLink, type Product } from "../products";
import { fullName, HEAD_TO_HEADS, kindOf, shortName } from "../products/compare";
import { crumbs, ctaBand, esc, secHead, type ContactInfo } from "./kit";

export interface ProductsData {
  products: readonly Product[];
  contact: ContactInfo;
}

export const PRODUCTS_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
] as const;

/** the pair the page opens on: a bathroom and wet-area coat against a terrace coat, two different jobs, so two pictures */
export const DEFAULT_PAIR = ["fosroc-brushbond-rfx-grey", "fosroc-brushbond-roofguard-white"] as const;

const chat = `<svg class="pg-ar" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const linkIcon = `<svg class="pg-ar" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

/** the options of a picker, grouped by family */
function options(all: readonly Product[], selected: string) {
  return FAMILIES.map((f) => {
    const ps = all.filter((p) => p.family === f.key);
    if (!ps.length) return "";
    return `<optgroup label="${esc(f.label)}">${ps
      .map((p) => `<option value="${p.slug}"${p.slug === selected ? " selected" : ""}>${esc(fullName(p))}</option>`)
      .join("")}</optgroup>`;
  }).join("");
}

/** the comparison itself */
export function compareMarkup(all: readonly Product[], a: Product, b: Product, whatsapp: string, opts: { id?: string } = {}) {
  const parts = productParts(a, b, whatsapp);
  return `<div class="cx" data-cx="products"${opts.id ? ` id="${opts.id}"` : ""} data-a="${a.slug}" data-b="${b.slug}" data-wa="${esc(whatsapp)}">
  <div class="cx-stage">
    ${seamHead("a", productSide(a), options(all, a.slug), "Product A")}
    <div class="cx-mid"><button type="button" class="cx-swap" data-swap aria-label="Swap A and B">${swapIcon}</button></div>
    ${seamHead("b", productSide(b), options(all, b.slug), "Product B")}
    <div class="cx-mediawrap" data-media>${parts.media}</div>
    <div class="cx-verdict" data-verdict aria-live="polite">${parts.verdict}</div>
  </div>
  <div class="cx-sheet" data-sheet>${parts.sheet}</div>
  <div class="cx-foot">
    <a class="pg-btn pg-btn--ink" data-both href="${esc(parts.both)}" target="_blank" rel="noopener noreferrer">${chat}Ask for both rates on WhatsApp</a>
    <button type="button" class="pg-btn pg-btn--line" data-share>${linkIcon}<span data-share-label>Copy a link to this pair</span></button>
  </div>
</div>`;
}

/* ------------------------------------------------------------ pairs */

function pairCard(a: Product, b: Product) {
  const ka = kindOf(a);
  const m = mediaReady(ka?.media);
  const thumb =
    m && ka
      ? `<span class="pr-pthumb"><img src="${mediaSrcSmall(ka.media)}" width="${m.w}" height="${m.h}" alt="" loading="lazy" decoding="async"></span>`
      : `<span class="pr-pthumb pr-pthumb--icon">${packIcon(a.packs[0]?.shape ?? "pail")}</span>`;
  const job = a.category === b.category ? a.category : ka?.plural ? ka.plural[0]!.toUpperCase() + ka.plural.slice(1) : a.category;
  return `<li><button type="button" class="pr-pair" data-pair="${a.slug},${b.slug}" aria-label="Compare ${esc(fullName(a))} with ${esc(fullName(b))}">
  ${thumb}
  <span class="pr-ptext">
    <span class="pr-pjob">${esc(job)}</span>
    <span class="pr-pn pr-pn--a">${esc(fullName(a))}</span>
    <span class="pr-pn pr-pn--b">${esc(fullName(b))}</span>
  </span>
</button></li>`;
}

/* ------------------------------------------------------------ the list */

/** what the search box looks through */
const searchText = (p: Product) =>
  [p.brand, p.name, p.category, p.purpose, p.areas, ...p.packs.map((k) => `${k.size} ${k.listed}`)].join(" ").toLowerCase().replace(/\s+/g, " ");

function row(p: Product, c: ContactInfo) {
  return `<li class="pr-row" id="${p.slug}" data-family="${p.family}" data-brand="${esc(p.brand)}" data-q="${esc(searchText(p))}">
  <div class="pr-id"><p class="pr-brand">${esc(p.brand)}</p><h4 class="pr-name">${esc(shortName(p))}</h4></div>
  <p class="pr-cat">${esc(p.category)}</p>
  <p class="pr-areas">${esc(p.areas)}</p>
  <ul class="pr-packs" aria-label="Pack sizes">${p.packs.map((k) => `<li>${packIcon(k.shape)}${esc(k.size)}</li>`).join("")}</ul>
  <div class="pr-acts">
    <button type="button" class="pr-cmp" data-cmp="${p.slug}" aria-label="Compare ${esc(fullName(p))}">Compare</button>
    <a class="pr-rate" href="${esc(rateLink(c.whatsapp, [p]))}" target="_blank" rel="noopener noreferrer" aria-label="Ask for today's rate for ${esc(fullName(p))} on WhatsApp">${chat}Rate</a>
  </div>
</li>`;
}

/** a family's picture: the kind of product most of it is */
const FAMILY_MEDIA: Record<string, string> = {
  waterproofing: "m-cementitious",
  admixtures: "p-admixture",
  tiling: "p-tile-adhesive",
  bonding: "p-bonding",
  repair: "p-repair",
  grouts: "p-grout",
  site: "p-curing",
  walling: "p-aac",
};

function listMarkup(d: ProductsData) {
  const counts = new Map(FAMILIES.map((f) => [f.key, d.products.filter((p) => p.family === f.key).length] as const));
  const chips = [`<button type="button" class="pr-chip" data-fam="all" aria-pressed="true">All <span>${d.products.length}</span></button>`]
    .concat(
      FAMILIES.filter((f) => counts.get(f.key)).map(
        (f) => `<button type="button" class="pr-chip" data-fam="${f.key}" aria-pressed="false">${esc(f.label)} <span>${counts.get(f.key)}</span></button>`,
      ),
    )
    .join("");
  const brands = `<label class="pr-brandsel"><span class="sr-only">Brand</span><select data-brandsel><option value="all">All brands</option>${BRANDS.map((b) => `<option value="${esc(b)}">${esc(b)}</option>`).join("")}</select></label>`;
  const groups = FAMILIES.map((f) => {
    const ps = d.products.filter((p) => p.family === f.key);
    if (!ps.length) return "";
    const mk = FAMILY_MEDIA[f.key];
    const m = mediaReady(mk);
    const pic = m && mk ? `<span class="pr-gpic"><img src="${mediaSrcSmall(mk)}" width="${m.w}" height="${m.h}" alt="" loading="lazy" decoding="async"></span>` : "";
    return `<section class="pr-group" data-group="${f.key}" aria-labelledby="pr-g-${f.key}">
  <header class="pr-ghead${pic ? "" : " pr-ghead--nopic"}">${pic}<div><h3 class="pr-gh" id="pr-g-${f.key}">${esc(f.label)}</h3><p class="pr-gline">${esc(f.line)}</p></div><p class="pr-gcount" data-gcount>${ps.length} ${ps.length === 1 ? "product" : "products"}</p></header>
  <ul class="pr-rows">${ps.map((p) => row(p, d.contact)).join("")}</ul>
</section>`;
  }).join("");
  return `<section class="pg-sec pr-list" id="all-products" aria-labelledby="pr-all">
  <div class="pg-wrap">
    ${secHead({ n: "", label: "The full list", title: `All ${d.products.length} products.`, id: "pr-all", lede: `Search by name, brand or where it is used. Put any product into the comparison, or ask for its rate.${pictures() ? " The family pictures are made with AI." : ""}` })}
    <div class="pr-tools" data-tools>
      <label class="pr-search"><span class="sr-only">Search products</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><input type="search" data-search placeholder="Search: tank, grout, Sika…" autocomplete="off"></label>
      <div class="pr-chips" role="group" aria-label="Families">${chips}</div>
      ${brands}
    </div>
    <p class="pr-status" data-status aria-live="polite">Showing all ${d.products.length} products.</p>
    <div class="pr-groups">${groups}</div>
    <p class="pr-empty" data-empty hidden>Nothing matches that. Try a shorter word, or <a href="#all-products" data-clear>show all products</a>.</p>
    <aside class="pr-note" aria-label="Before you buy">
      <p class="pr-noteh">Before you buy</p>
      <p>Rates change with the market, so we quote today&rsquo;s price when you ask. Before any product goes on site, check its current data sheet (TDS), safety sheet and pack label, and that it is the right system for the job.</p>
    </aside>
  </div>
</section>`;
}

export function productsPageMarkup(d: ProductsData) {
  const a = productBySlug(DEFAULT_PAIR[0]) ?? d.products[0]!;
  const b = productBySlug(DEFAULT_PAIR[1]) ?? d.products[1]!;
  const brands = BRANDS.join(", ").replace(/, ([^,]*)$/, " and $1");
  const head = `<header class="pg-head pr-head">
  <div class="pg-wrap">
    ${crumbs(PRODUCTS_TRAIL)}
    <div class="pr-headgrid">
      <h1 class="pg-h1">Compare any two products.</h1>
      <p class="pg-intro">${PRODUCT_COUNT} products from ${esc(brands)}. Pick two: what they share moves to the middle, and what sets them apart stays on its side.</p>
    </div>
  </div>
</header>`;
  const compare = `<section class="pr-cmpsec" id="compare" aria-label="Compare two products">
  <div class="pg-wrap">
    ${compareMarkup(d.products, a, b, d.contact.whatsapp)}
    ${pictures() ? `<p class="cx-ainote">The pictures show each kind of product going on. They are made with AI (Google Flow), not taken on our sites, and they are not the products themselves.</p>` : ""}
  </div>
</section>`;
  const pairs = `<section class="pg-sec pr-pairs" id="pairs" aria-labelledby="pr-pairs-h">
  <div class="pg-wrap">
    ${secHead({ n: "", label: "Ready-made pairs", title: "Start from a pair.", id: "pr-pairs-h", lede: "Products on our list of the same kind, from two brands or in two grades. Pick one to open it above." })}
    ${pictures() ? `<p class="pr-ainote">Thumbnails: AI-made pictures of each kind of product going on.</p>` : ""}
    <ul class="pr-pairlist">${HEAD_TO_HEADS.filter(([x, y]) => !(x.slug === a.slug && y.slug === b.slug))
      .map(([x, y]) => pairCard(x, y))
      .join("")}</ul>
  </div>
</section>`;
  return `${head}
${compare}
${pairs}
${listMarkup(d)}
${ctaBand(d.contact, {
  title: "Need a quantity or a rate?",
  steps: [
    ["Send the product and quantity", "The name and pack size from this page, on WhatsApp or by phone."],
    ["We reply with today’s rate", "Rates change with the market, so we quote on the day."],
    ["Check it suits the job", "Not sure it is the right product? Ask us before you buy."],
  ],
})}`;
}

export const PRODUCTS_CSS =
  SEAM_CSS +
  `
.pr-head{border-bottom:0;padding-bottom:clamp(1.4rem,3.2vh,2.2rem)}
.pr-headgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:end;gap:1rem clamp(2rem,6vw,7rem);margin-top:clamp(1rem,2.6vh,1.8rem)}
.pr-headgrid .pg-h1{margin:0}
.pr-headgrid .pg-intro{margin:0;padding-bottom:.3rem}
.pr-cmpsec{padding-bottom:clamp(3.5rem,9vh,6rem)}
.pr-cmpsec .cx{scroll-margin-top:calc(var(--nav-room) + .5rem)}

/* ready-made pairs */
.pr-pairs{background:var(--stone)}
.pr-ainote{margin:-1.2rem 0 1.2rem;color:var(--mute)}
.pr-pairlist{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,22rem),1fr));gap:.9rem;margin:0;padding:0;list-style:none}
.pr-pair{display:grid;grid-template-columns:6.5rem minmax(0,1fr);gap:1rem;align-items:center;width:100%;padding:.75rem 1rem .75rem .75rem;border:1px solid rgba(16,26,34,.08);border-radius:1.1rem;background:var(--card);color:var(--ink);font:inherit;text-align:left;cursor:pointer;transition:border-color .2s ease,box-shadow .25s ease}
.pr-pair:hover{border-color:rgba(16,26,34,.24);box-shadow:0 18px 40px -30px rgba(11,29,43,.6)}
.pr-pair:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.pr-pthumb{position:relative;display:block;aspect-ratio:1280/714;border-radius:.65rem;overflow:hidden;background:#dde5ea}
.pr-pthumb img{position:absolute;inset:0}
.pr-pthumb--icon{display:grid;place-items:center;color:var(--mute)}
.pr-pthumb--icon svg{width:2.2rem;height:2.2rem}
.pr-ptext{display:flex;flex-direction:column;gap:.15rem;min-width:0}
.pr-pjob{color:var(--mute);line-height:1.35}
.pr-pn{display:flex;align-items:center;gap:.5rem;font-weight:600;line-height:1.35}
.pr-pn::before{content:"";flex:none;width:.55rem;height:.55rem;border-radius:50%;background:#0b6e80}
.pr-pn--b::before{background:#f0b43c}

/* the list */
.pr-tools{position:sticky;top:calc(var(--nav-room) - 1.2rem);z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;padding:.6rem;border-radius:1.4rem;background:rgba(243,245,246,.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 1px 0 rgba(16,26,34,.06),0 12px 30px -24px rgba(11,29,43,.5)}
.pr-search{display:flex;align-items:center;gap:.55rem;flex:1 1 15rem;height:2.9rem;padding:0 1rem;border-radius:999px;background:#fff;border:1px solid rgba(16,26,34,.12)}
.pr-search:focus-within{outline:2px solid var(--accent);outline-offset:2px}
.pr-search svg{width:1.1rem;height:1.1rem;flex:none;color:var(--mute)}
.pr-search input{flex:1;min-width:0;border:0;background:none;font:inherit;font-size:var(--fs-body);color:var(--ink);outline:none}
.pr-chips{display:flex;gap:.4rem;overflow-x:auto;scrollbar-width:none;flex:1 1 30rem;min-width:0;padding:.1rem 2rem .1rem .1rem;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 3rem),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 3rem),transparent)}
.pr-chips::-webkit-scrollbar{display:none}
.pr-chip{flex:none;display:inline-flex;align-items:center;gap:.4rem;height:2.6rem;padding:0 1rem;border-radius:999px;border:1px solid rgba(16,26,34,.14);background:transparent;color:var(--ink);font:inherit;cursor:pointer;white-space:nowrap;transition:background-color .2s ease,color .2s ease,border-color .2s ease}
.pr-chip span{color:var(--mute)}
.pr-chip:hover{border-color:var(--ink)}
.pr-chip[aria-pressed=true]{background:var(--ink);border-color:var(--ink);color:#f3f5f6}
.pr-chip[aria-pressed=true] span{color:rgba(243,245,246,.7)}
.pr-chip:focus-visible,.pr-brandsel select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pr-brandsel select{height:2.6rem;padding:0 2.2rem 0 1rem;border-radius:999px;border:1px solid rgba(16,26,34,.14);background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6.5 8 10.5l4-4' fill='none' stroke='%23101a22' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right .8rem center/1rem;font:inherit;color:var(--ink);appearance:none;cursor:pointer}
.pr-status{margin:1rem .2rem 0;color:var(--mute)}
.pr-groups{display:flex;flex-direction:column;gap:clamp(2rem,5vh,3rem);margin-top:clamp(1.4rem,3vh,2rem)}
.pr-group[hidden]{display:none}
.pr-ghead{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:1rem;padding-bottom:.9rem;border-bottom:1px solid var(--ink)}
.pr-ghead--nopic{grid-template-columns:minmax(0,1fr) auto}
.pr-gpic{position:relative;display:block;width:6.5rem;aspect-ratio:1280/714;border-radius:.6rem;overflow:hidden;background:#dde5ea}
.pr-gpic img{position:absolute;inset:0}
.pr-gh{margin:0;font-size:var(--fs-sub);font-weight:600;line-height:1.25}
.pr-gline{margin:.15rem 0 0;color:var(--mute)}
.pr-gcount{margin:0;color:var(--mute);white-space:nowrap}
.pr-rows{margin:0;padding:0;list-style:none}
.pr-row{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr) minmax(0,1.4fr) minmax(0,.9fr) auto;gap:.4rem 1.6rem;align-items:center;padding:1rem .2rem;border-bottom:1px solid var(--line);scroll-margin-top:calc(var(--nav-room) + 5rem)}
.pr-row[hidden]{display:none}
.pr-row.is-hit{animation:pr-hit 1.6s ease}
@keyframes pr-hit{0%,40%{background:rgba(76,201,217,.16)}100%{background:transparent}}
.pr-id{min-width:0}
.pr-brand{margin:0;color:var(--mute)}
.pr-name{margin:.1rem 0 0;font-size:var(--fs-body);font-weight:600;line-height:1.35}
.pr-cat,.pr-areas{margin:0;line-height:1.45}
.pr-areas{color:var(--mute)}
.pr-packs{display:flex;flex-wrap:wrap;gap:.3rem .9rem;margin:0;padding:0;list-style:none}
.pr-packs li{display:inline-flex;align-items:center;gap:.35rem;white-space:nowrap}
.pr-packs svg{width:1.1rem;height:1.1rem;color:var(--mute)}
.pr-acts{display:flex;gap:.4rem;justify-content:flex-end}
.pr-cmp,.pr-rate{display:inline-flex;align-items:center;gap:.4rem;height:2.5rem;padding:0 1rem;border-radius:999px;border:1px solid rgba(16,26,34,.16);background:transparent;color:var(--ink);font:inherit;font-weight:500;text-decoration:none;cursor:pointer;white-space:nowrap;transition:background-color .2s ease,border-color .2s ease,color .2s ease}
.pr-cmp{background:var(--ink);border-color:var(--ink);color:#f3f5f6}
.pr-cmp:hover{background:var(--accent);border-color:var(--accent)}
.pr-rate:hover{border-color:var(--ink)}
.pr-cmp:focus-visible,.pr-rate:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pr-rate .pg-ar{width:1rem;height:1rem}
.pr-empty{margin:2rem 0 0;color:var(--mute)}
.pr-empty a{color:var(--ink)}
.pr-note{display:grid;grid-template-columns:minmax(10rem,.35fr) minmax(0,1fr);gap:.6rem 2rem;margin-top:clamp(2.4rem,6vh,4rem);padding:1.4rem 1.6rem;border-radius:1.25rem;background:var(--stone)}
.pr-note p{margin:0;line-height:1.6;max-width:60rem}
.pr-noteh{font-weight:600}
.cx-foot .pg-btn .pg-ar{width:1.1rem;height:1.1rem}
@media (max-width:1199px){
  .pr-row{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) auto;grid-template-areas:"id cat acts" "areas areas packs"}
  .pr-id{grid-area:id}.pr-cat{grid-area:cat}.pr-areas{grid-area:areas}.pr-packs{grid-area:packs;justify-content:flex-end}.pr-acts{grid-area:acts}
}
@media (max-width:899px){
  .pr-headgrid{grid-template-columns:1fr}
  .pr-tools{position:static;border-radius:1.2rem}
  .pr-chips{flex-basis:100%;order:3}
  .pr-search{flex-basis:100%}
  .pr-brandsel{flex:1}
  .pr-brandsel select{width:100%}
  .pr-row{grid-template-columns:minmax(0,1fr);grid-template-areas:"id" "cat" "areas" "packs" "acts";gap:.35rem}
  .pr-packs{justify-content:flex-start}
  .pr-acts{justify-content:flex-start;margin-top:.4rem}
  .pr-ghead{grid-template-columns:auto minmax(0,1fr)}
  .pr-gcount{grid-column:2}
  .pr-ghead--nopic{grid-template-columns:minmax(0,1fr)}
  .pr-ghead--nopic .pr-gcount{grid-column:1}
  .pr-gpic{width:5rem}
  .pr-note{grid-template-columns:1fr;padding:1.2rem}
  .cx-foot .pg-btn{flex:1 1 100%}
}
`;
