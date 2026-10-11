/**
 * Products page, brand first.
 *
 *   opening    what we supply, in a line
 *   brands     one tile per brand, sized by how many products it has on our
 *              list, with the families that make it up drawn as a bar
 *   catalogue  every product, brand by brand: tabs for the brands, a search,
 *              and the families of the brand on show; each product with its
 *              packs and a WhatsApp link for today's rate
 *   by job     "same job, different brands": a table of the jobs for which we
 *              stock more than one brand, the brands across the top. Open a job
 *              and what the products share is said once, and what sets each
 *              one apart stays under its brand (packs drawn to scale).
 *   close      before you buy, and the ways to ask
 *
 * Product facts come only from RPC's spreadsheet; it lists no prices, so every
 * rate is asked for on WhatsApp. Links: /products#<slug> opens that product in
 * its brand, #brand-<key> a brand, #job-<key> a job.
 */
import { CHOOSING } from "../methods/data";
import { BRAND_ADVICE } from "../methods/doc";
import { familyOf, PRODUCT_COUNT, rateLink, type Product } from "../products";
import { brandInfo, jobOf, jobs, shared, type BrandInfo, type JobView } from "../products/brands";
import { cap, fullName, packAmount, shortName, useTerms } from "../products/compare";
import { arrow, crumbs, ctaBand, esc, listing, secHead, words, type ContactInfo } from "./kit";

export interface ProductsData {
  products: readonly Product[];
  contact: ContactInfo;
}

export const PRODUCTS_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
] as const;

const chat = `<svg class="pg-ar" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const chev = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.2 8 10l4-3.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const search = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

/* ------------------------------------------------------------ packs */

/** a line drawing of each kind of pack */
const PACK: Record<string, string> = {
  bag: `<path d="M6.5 7.5h11l1.5 12.5h-14z"/><path d="M8 7.5 9 4h6l1 3.5"/><path d="M9.5 12.5h5"/>`,
  kit: `<path d="M3.8 9.5h9.4l-1.1 10.5H4.9z"/><path d="M4.8 9.5a3.7 2.2 0 0 1 7.4 0"/><path d="M14.6 13h5.6l-.8 7h-4z"/>`,
  pail: `<path d="M5.5 8.5h13l-1.4 11.5H6.9z"/><path d="M7 8.5c0-3 2.2-4.6 5-4.6s5 1.6 5 4.6"/><path d="M6.4 12.5h11.2"/>`,
  can: `<path d="M7 6.5h8l3 3V20H6V7.5z"/><path d="M14.5 6.5V4h-3v2.5"/><path d="M9.5 11h5"/>`,
  drum: `<rect x="6" y="3.5" width="12" height="17" rx="2"/><path d="M6 9h12M6 15h12"/>`,
  roll: `<ellipse cx="7.5" cy="12" rx="3" ry="7"/><path d="M7.5 5H18v14H7.5"/><path d="M18 5a3 7 0 0 1 0 14"/>`,
  block: `<path d="M4 9.5 12 6l8 3.5v8L12 21l-8-3.5z"/><path d="M4 9.5 12 13l8-3.5M12 13v8"/>`,
  bottle: `<path d="M10 3.5h4v3l2 2.5v11.5H8V9l2-2.5z"/><path d="M8 13.5h8"/>`,
  tin: `<path d="M6.5 7h11v12.5h-11z"/><ellipse cx="12" cy="7" rx="5.5" ry="1.8"/><path d="M6.5 12.5h11"/>`,
  cartridge: `<path d="M3.5 10h12.5v4H3.5z"/><path d="M16 10.8l5-.9v4.2l-5-.9"/><path d="M2.2 11v2"/>`,
  sachet: `<path d="M6 4h12v16H6z"/><path d="M6 7.5h12M9 4l-.5 3.5M15 4l.5 3.5"/>`,
  pouch: `<path d="M7 5.5h10l1.5 14.5h-13z"/><path d="M8.5 5.5V3.5h7v2"/><path d="M9 10.5h6"/>`,
};
export const packIcon = (shape: string) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${PACK[shape] ?? PACK.bag}</svg>`;

/* ------------------------------------------------------------ brands */

/** a brand's families as one bar, each family's share in its colour */
function familyBar(b: BrandInfo) {
  return `<span class="bs-bar" aria-hidden="true">${b.families.map((f) => `<i style="flex:${f.count};background:${f.tint}"></i>`).join("")}</span>`;
}

function brandTile(b: BrandInfo, i: number) {
  const fams = b.families.slice(0, i === 0 ? 5 : 3);
  const more = b.families.length - fams.length;
  return `<li class="bs-item bs-item--${i}" data-rv><a class="bs-tile" href="#brand-${b.key}" data-brand-go="${b.key}">
  <span class="bs-top"><span class="bs-name">${esc(b.name)}</span><span class="bs-count"><b>${b.count}</b> ${b.count === 1 ? "product" : "products"}</span></span>
  ${familyBar(b)}
  <span class="bs-fams">${fams.map((f) => `<span><i style="background:${f.tint}"></i>${esc(f.label)} <b>${f.count}</b></span>`).join("")}${more > 0 ? `<span class="bs-more">and ${more} more ${more === 1 ? "family" : "families"}</span>` : ""}</span>
  <span class="bs-go">See all ${b.count} ${esc(b.name)} products${arrow}</span>
</a></li>`;
}

function shelfMarkup(bs: readonly BrandInfo[], jobCount: number) {
  return `<section class="pg-sec bs-sec" id="brands" aria-labelledby="bs-h">
  <div class="pg-wrap">
    ${secHead({ label: "Brands", title: "Choose a brand.", id: "bs-h", lede: "Each tile is sized by how many of that brand’s products are on our list. The bar shows what they are for." })}
    <ul class="bs-grid" data-rv-stagger="70">${bs.map(brandTile).join("")}
      <li class="bs-item bs-item--job" data-rv><a class="bs-tile bs-tile--job" href="#by-job">
        <span class="bs-top"><span class="bs-name">Same job, different brands</span></span>
        <span class="bs-jobline">${jobCount} jobs for which we stock more than one brand, set side by side.</span>
        <span class="bs-go">Compare brands by job${arrow}</span>
      </a></li>
    </ul>
  </div>
</section>`;
}

/* ------------------------------------------------------------ the catalogue */

/** what the search box looks through */
const searchText = (p: Product) => [p.brand, p.name, p.category, p.purpose, p.areas, ...p.packs.map((k) => `${k.size} ${k.listed}`)].join(" ").toLowerCase().replace(/\s+/g, " ");

function card(p: Product, c: ContactInfo, js: readonly JobView[]) {
  const f = familyOf(p.family);
  const job = jobOf(p, js);
  const uses = useTerms(p);
  return `<li class="pc" id="${p.slug}" data-family="${p.family}" data-q="${esc(searchText(p))}" style="--tint:${f.tint}">
  <div class="pc-top"><span class="pc-ico">${packIcon(p.packs[0]?.shape ?? "pail")}</span><span class="pc-fam">${esc(f.label)}</span></div>
  <h4 class="pc-name">${esc(shortName(p))}</h4>
  <p class="pc-cat">${esc(p.category === "Construction chemical" ? "Ask us what this one is best used for" : p.category)}</p>
  ${uses.length ? `<p class="pc-use"><span>Used on</span>${esc(cap(listing(uses)))}</p>` : ""}
  <ul class="pc-packs" aria-label="Pack sizes">${p.packs.map((k) => `<li>${esc(k.size)}</li>`).join("")}</ul>
  <div class="pc-acts">
    <a class="pc-rate" href="${esc(rateLink(c.whatsapp, [p]))}" target="_blank" rel="noopener noreferrer" aria-label="Ask for today’s rate for ${esc(fullName(p))} on WhatsApp">${chat}Ask rate</a>
    ${job ? `<a class="pc-alt" href="#job-${job.key}" data-job-go="${job.key}" aria-label="Compare ${esc(fullName(p))} with other brands">Other brands</a>` : ""}
  </div>
</li>`;
}

function catalogueMarkup(bs: readonly BrandInfo[], c: ContactInfo, js: readonly JobView[]) {
  const tabs = [`<button type="button" role="tab" class="cb-tab" data-tab="all" aria-selected="false">All brands <span>${PRODUCT_COUNT}</span></button>`]
    .concat(bs.map((b, i) => `<button type="button" role="tab" class="cb-tab" data-tab="${b.key}" aria-selected="${i === 0}">${esc(b.name)} <span>${b.count}</span></button>`))
    .join("");
  const panels = bs
    .map(
      (b) => `<section class="cb-brand" id="brand-${b.key}" data-brand="${b.key}" aria-labelledby="cb-h-${b.key}">
  <header class="cb-bhead">
    <h3 class="cb-bh" id="cb-h-${b.key}">${esc(b.name)}</h3>
    <p class="cb-bcount">${b.count} ${b.count === 1 ? "product" : "products"} on our list</p>
    ${familyBar(b)}
  </header>
  <ul class="cb-grid">${b.products.map((p) => card(p, c, js)).join("")}</ul>
  <button type="button" class="cb-more" data-more hidden>Show all ${b.count} ${esc(b.name)} products</button>
</section>`,
    )
    .join("");
  return `<section class="pg-sec pg-sec--stone cb-sec" id="catalogue" aria-labelledby="cb-h">
  <div class="pg-wrap">
    ${secHead({ label: "Catalogue", title: "Every product, brand by brand.", id: "cb-h", lede: "Search by name, use or pack size, or narrow a brand to one family. Every product has a link for today’s rate." })}
    <div class="cb-tools" data-tools hidden>
      <div class="cb-tabs" role="tablist" aria-label="Brands">${tabs}</div>
      <label class="cb-search">${search}<span class="sr-only">Search products</span><input type="search" data-search placeholder="Search all ${PRODUCT_COUNT} products" autocomplete="off"></label>
    </div>
    <div class="cb-fams" data-fams role="group" aria-label="Families" hidden></div>
    <p class="cb-status" data-status aria-live="polite"></p>
    <div class="cb-panels">${panels}</div>
    <p class="cb-empty" data-empty hidden>Nothing matches that. Try a shorter word, or <button type="button" data-clear>show every product</button>.</p>
  </div>
</section>`;
}

/* ------------------------------------------------------------ same job, different brands */

/** "Auramix 200-20, Auramix 200-41 and 4 more" */
function cellNames(ps: readonly Product[]) {
  const names = ps.map(shortName);
  return names.length <= 3 ? listing(names) : `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`;
}

/** each pack drawn at a size that follows its weight or volume (by the cube root, as a container grows), against the job's largest */
function packsToScale(p: Product, max: number) {
  return `<ul class="jb-packs" aria-label="Pack sizes">${p.packs
    .map((k) => {
      const q = packAmount(k.size);
      const px = q && max ? 1.3 + 2.5 * Math.cbrt(q / max) : 2.2;
      return `<li style="--px:${px.toFixed(2)}rem">${packIcon(k.shape)}<span>${esc(k.size)}</span></li>`;
    })
    .join("")}</ul>`;
}

function jobBody(j: JobView, c: ContactInfo) {
  const s = shared(j.products);
  const max = Math.max(0, ...j.products.flatMap((p) => p.packs.map((k) => packAmount(k.size) ?? 0)));
  const facts = [
    s.category ? ["Type", s.category] : ["Types", listing([...new Set(j.products.map((p) => p.category))])],
    s.purpose ? ["What it does", s.purpose] : null,
    ["Used on", s.uses.length ? cap(listing(s.uses)) : "No one place is listed for all of them"],
    s.customers ? ["Bought by", s.customers] : null,
  ].filter((x): x is string[] => Boolean(x));
  const brands = j.brands
    .map(
      (b) => `<div class="jb-brand">
    <p class="jb-bname">${esc(b.name)} <span>${b.products.length}</span></p>
    <ul class="jb-items">${b.products
      .map((p) => {
        const own = useTerms(p).filter((u) => !s.uses.includes(u));
        const diff = [s.category ? "" : p.category, s.purpose ? "" : p.purpose].filter(Boolean);
        return `<li class="jb-item">
        <a class="jb-iname" href="#${p.slug}" data-product-go="${p.slug}">${esc(shortName(p))}</a>
        ${diff.length ? `<p class="jb-diff">${esc(diff.join(". "))}</p>` : ""}
        ${own.length ? `<p class="jb-own"><span>Also listed for</span> ${esc(listing(own))}</p>` : ""}
        ${packsToScale(p, max)}
        <a class="jb-rate" href="${esc(rateLink(c.whatsapp, [p]))}" target="_blank" rel="noopener noreferrer" aria-label="Ask for today’s rate for ${esc(fullName(p))} on WhatsApp">${chat}Ask rate</a>
      </li>`;
      })
      .join("")}</ul>
  </div>`,
    )
    .join("");
  return `<div class="jb-body">
  <div class="jb-shared">
    <p class="jb-k">What our list says they share</p>
    <dl>${facts.map(([k, v]) => `<div><dt>${esc(k!)}</dt><dd>${esc(v!)}</dd></div>`).join("")}</dl>
  </div>
  <div class="jb-brands" data-n="${Math.min(3, j.brands.length)}">${brands}</div>
  <div class="jb-foot">
    <a class="pg-btn pg-btn--ink" href="${esc(rateLink(c.whatsapp, j.products))}" target="_blank" rel="noopener noreferrer">${chat}Ask for all ${j.products.length} rates</a>
    <p>Packs are drawn to scale by weight or volume. Check each product’s data sheet before it goes on site.</p>
  </div>
</div>`;
}

function byJobMarkup(js: readonly JobView[], bs: readonly BrandInfo[], c: ContactInfo) {
  // the brands with at least one job in common with another brand, in the brand list's order
  const cols = bs.map((b) => b.name).filter((n) => js.some((j) => j.brands.some((x) => x.name === n)));
  const head = `<div class="jb-head" aria-hidden="true"><span>Job</span>${cols.map((n) => `<span>${esc(n)}</span>`).join("")}<span></span></div>`;
  const rows = js
    .map(
      (j, i) => `<details class="jb-row" id="job-${j.key}" data-job="${j.key}"${i === 0 ? " open" : ""}>
  <summary class="jb-sum">
    <span class="jb-job"><span class="jb-jn">${esc(j.name)}</span><span class="jb-jl">${j.products.length} products from ${j.brands.length} brands</span></span>
    ${cols
      .map((n) => {
        const b = j.brands.find((x) => x.name === n);
        return b ? `<span class="jb-cell" data-has="1"><span class="jb-cb">${esc(n)} ${b.products.length}</span><span class="jb-cn">${esc(cellNames(b.products))}</span></span>` : `<span class="jb-cell" data-has="0" aria-hidden="true"></span>`;
      })
      .join("")}
    <span class="jb-chev" aria-hidden="true">${chev}</span>
  </summary>
  ${jobBody(j, c)}
</details>`,
    )
    .join("");
  return `<section class="pg-sec jb-sec" id="by-job" aria-labelledby="jb-h">
  <div class="pg-wrap">
    ${secHead({ label: "Same job, different brands", title: "Compare brands, job by job.", id: "jb-h", lede: `For ${js.length} jobs we stock more than one brand. Open a job to see what the products share, and what sets each one apart.` })}
    <div class="jb-table" style="--cols:${cols.length}">${head}${rows}</div>
    <aside class="jb-choose" aria-labelledby="jb-choose-h">
      <div><h3 class="pg-h3" id="jb-choose-h">How we choose between brands</h3><p>${esc(BRAND_ADVICE)}</p></div>
      <ol>${CHOOSING.map((x) => `<li><b>${esc(x.title)}</b><span>${esc(x.line)}</span></li>`).join("")}</ol>
    </aside>
  </div>
</section>`;
}

/* ------------------------------------------------------------ the page */

export function productsPageMarkup(d: ProductsData) {
  const bs = brandInfo(d.products);
  const js = jobs(d.products);
  const names = listing(bs.map((b) => b.name));
  const head = `<header class="pg-head pr-head">
  <div class="pg-wrap">
    ${crumbs(PRODUCTS_TRAIL)}
    <div class="pr-headgrid">
      <div>
        <p class="pg-mark">Products</p>
        <h1 class="pg-h1" data-rv="words">${words("Waterproofing products and construction chemicals, by&nbsp;brand.")}</h1>
      </div>
      <div class="pr-headside" data-rv>
        <p class="pg-intro">${PRODUCT_COUNT} products from ${esc(names)}, supplied from Erode. Rates change with the market, so ask us for today’s.</p>
        <div class="pg-actions"><a class="pg-btn pg-btn--ink" href="#brands">Browse by brand${arrow}</a><a class="pg-btn pg-btn--line" href="#by-job">Compare brands by job</a></div>
      </div>
    </div>
  </div>
</header>`;
  return `${head}
${shelfMarkup(bs, js.length)}
${catalogueMarkup(bs, d.contact, js)}
${byJobMarkup(js, bs, d.contact)}
${ctaBand(d.contact, {
  title: "Need a quantity or a rate?",
  steps: [
    ["Send the product and quantity", "The name and pack size from this page, on WhatsApp or by phone."],
    ["We reply with today’s rate", "Rates change with the market, so we quote on the day."],
    ["Check it suits the job", "Not sure it is the right product? Ask us before you buy."],
  ],
})}`;
}

export const PRODUCTS_CSS = `
.pr-head{border-bottom:0;padding-bottom:clamp(1rem,2.6vh,1.8rem)}
.pr-headgrid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);align-items:end;gap:1.4rem clamp(2rem,6vw,7rem);margin-top:clamp(1.2rem,3vh,2rem)}
.pr-headgrid .pg-mark{margin-bottom:.9rem}
.pr-headgrid .pg-h1{max-width:20ch}
.pr-headside .pg-intro{margin-top:0}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

/* brands: tiles sized by how many products each has */
.bs-sec{padding-top:clamp(2rem,5vh,3.4rem)}
.bs-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:minmax(11.5rem,auto);gap:clamp(.7rem,1.2vw,1rem);margin:0;padding:0;list-style:none}
.bs-item{display:flex;min-width:0}
.bs-item--0{grid-column:span 2;grid-row:span 2}
.bs-item--1{grid-column:span 2}
.bs-item--job{grid-column:span 2}
.bs-tile{position:relative;display:flex;flex-direction:column;gap:1rem;width:100%;padding:clamp(1.1rem,1.8vw,1.6rem);border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);color:var(--ink);text-decoration:none;transition:box-shadow .35s,background-color .35s,translate .45s cubic-bezier(.2,.7,.2,1)}
.bs-tile:hover{box-shadow:inset 0 0 0 1.5px var(--navy);translate:0 -2px}
.bs-top{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.bs-name{font-family:var(--display);font-weight:500;font-size:var(--fs-sub);line-height:1.15;letter-spacing:-.01em}
.bs-item--0 .bs-name{font-size:var(--fs-title);letter-spacing:-.02em}
.bs-count{font-size:var(--fs-body);color:var(--mute)}
.bs-count b{font-family:var(--display);font-weight:500;font-size:var(--fs-sub);color:var(--ink)}
.bs-item--0 .bs-count b{font-size:var(--fs-title)}
.bs-bar{display:flex;gap:2px;height:10px;border-radius:5px;overflow:hidden}
.bs-item--0 .bs-bar{height:14px;border-radius:7px}
.bs-bar i{display:block;min-width:4px}
.bs-fams{display:flex;flex-direction:column;gap:.45rem;font-size:var(--fs-body);color:var(--ink2)}
.bs-fams span{display:flex;align-items:center;gap:.55rem}
.bs-fams i{flex:none;width:9px;height:9px;border-radius:3px}
.bs-fams b{margin-left:auto;font-weight:600;font-variant-numeric:tabular-nums;color:var(--ink)}
.bs-fams .bs-more{color:var(--mute)}
.bs-item--0 .bs-fams{gap:.7rem;font-size:var(--fs-sub)}
.bs-item--0 .bs-fams i{width:12px;height:12px}
.bs-item:not(.bs-item--0):not(.bs-item--1):not(.bs-item--job) .bs-fams span:nth-child(n+3){display:none}
.bs-go{display:inline-flex;align-items:center;gap:.5rem;margin-top:auto;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.bs-tile:hover .pg-ar{transform:translate(2px,-2px)}
.bs-tile--job{background:var(--sky);box-shadow:inset 0 0 0 1px rgba(39,86,160,.18)}
.bs-jobline{max-width:28rem;font-size:var(--fs-body);line-height:1.55;color:var(--ink2)}

/* the catalogue */
.cb-tools{position:sticky;top:calc(var(--nav-bar,80px) + .6rem);z-index:6;display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;padding:.55rem;border-radius:14px;background:rgba(245,240,230,.92);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:inset 0 0 0 1px var(--line),0 14px 30px -26px rgba(18,34,59,.6)}
.cb-tabs{display:flex;gap:.35rem;flex:1 1 34rem;min-width:0;overflow-x:auto;scrollbar-width:none}
.cb-tabs::-webkit-scrollbar{display:none}
.cb-tab{flex:none;display:inline-flex;align-items:center;gap:.45rem;height:2.6rem;padding:0 .95rem;border:0;border-radius:10px;background:transparent;font:inherit;font-size:var(--fs-body);font-weight:600;color:var(--ink);cursor:pointer;transition:background-color .25s,color .25s}
.cb-tab span{font-weight:500;color:var(--mute);font-variant-numeric:tabular-nums}
.cb-tab:hover{background:rgba(18,34,59,.06)}
.cb-tab[aria-selected=true]{background:var(--navy);color:#f5f0e6}
.cb-tab[aria-selected=true] span{color:rgba(245,240,230,.7)}
.cb-search{display:flex;align-items:center;gap:.5rem;flex:0 1 19rem;height:2.6rem;padding:0 .9rem;border-radius:10px;background:var(--sand);box-shadow:inset 0 0 0 1px var(--line)}
.cb-search:focus-within{outline:2px solid var(--accent);outline-offset:2px}
.cb-search svg{width:1.1rem;height:1.1rem;flex:none;color:var(--mute)}
.cb-search input{flex:1;min-width:0;border:0;background:none;font:inherit;font-size:var(--fs-body);color:var(--ink);outline:none}
.cb-fams{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.9rem}
.cb-fam{display:inline-flex;align-items:center;gap:.45rem;height:2.3rem;padding:0 .85rem;border:0;border-radius:999px;background:transparent;box-shadow:inset 0 0 0 1px rgba(18,34,59,.18);font:inherit;font-size:var(--fs-body);color:var(--ink);cursor:pointer}
.cb-fam i{width:9px;height:9px;border-radius:3px}
.cb-fam span{color:var(--mute);font-variant-numeric:tabular-nums}
.cb-fam[aria-pressed=true]{background:var(--ink);box-shadow:none;color:#f5f0e6}
.cb-fam[aria-pressed=true] span{color:rgba(245,240,230,.7)}
.cb-tab:focus-visible,.cb-fam:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.cb-status{margin:1rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.cb-status:empty{display:none}
.cb-panels{display:flex;flex-direction:column;gap:clamp(2.4rem,6vh,3.6rem);margin-top:clamp(1.2rem,3vh,1.8rem)}
.cb-brand{scroll-margin-top:calc(var(--nav-h,68px) + 5rem)}
.cb-brand[hidden]{display:none}
.cb-bhead{display:grid;grid-template-columns:auto 1fr;align-items:baseline;gap:.3rem 1.2rem;margin-bottom:1.2rem}
.cb-bh{margin:0;font-family:var(--display);font-weight:500;font-size:var(--fs-title);line-height:1.1;letter-spacing:-.02em}
.cb-bcount{margin:0;font-size:var(--fs-body);color:var(--mute)}
.cb-bhead .bs-bar{grid-column:1/-1;margin-top:.6rem}
.cb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,16.5rem),1fr));gap:.8rem;margin:0;padding:0;list-style:none}
.pc{display:flex;flex-direction:column;gap:.55rem;padding:1.05rem 1.1rem 1rem;border-radius:14px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);scroll-margin-top:calc(var(--nav-h,68px) + 6rem)}
.pc[hidden]{display:none}
.pc.is-hit{animation:pc-hit 2s ease}
@keyframes pc-hit{0%,45%{box-shadow:inset 0 0 0 2px var(--accent),0 0 0 6px rgba(39,86,160,.14)}100%{box-shadow:inset 0 0 0 1px var(--line)}}
.pc-top{display:flex;align-items:center;gap:.6rem}
.pc-ico{display:grid;place-items:center;flex:none;width:2.4rem;height:2.4rem;border-radius:10px;background:color-mix(in srgb,var(--tint) 14%,transparent);color:var(--tint)}
.pc-ico svg{width:1.4rem;height:1.4rem}
.pc-fam{font-size:var(--fs-body);font-weight:600;color:var(--tint)}
.pc-name{margin:.2rem 0 0;font-family:var(--display);font-weight:500;font-size:var(--fs-sub);line-height:1.2;letter-spacing:-.01em}
.pc-cat{margin:0;font-size:var(--fs-body);line-height:1.45;color:var(--ink)}
.pc-use{margin:0;font-size:var(--fs-body);line-height:1.5;color:var(--mute)}
.pc-use span{display:block;font-weight:600;color:var(--ink2)}
.pc-packs{display:flex;flex-wrap:wrap;gap:.35rem;margin:.1rem 0 0;padding:0;list-style:none}
.pc-packs li{display:inline-flex;align-items:center;height:1.9rem;padding:0 .65rem;border-radius:7px;background:var(--sand);font-size:var(--fs-body);font-weight:500;white-space:nowrap}
.pc-acts{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:auto;padding-top:.5rem}
.pc-rate,.pc-alt{display:inline-flex;align-items:center;gap:.4rem;height:2.4rem;padding:0 .85rem;border-radius:9px;font-size:var(--fs-body);font-weight:600;text-decoration:none;white-space:nowrap;transition:background-color .25s,color .25s,box-shadow .25s}
.pc-rate{background:var(--navy);color:#f5f0e6}
.pc-rate:hover{background:var(--accent)}
.pc-rate .pg-ar{width:1rem;height:1rem}
.pc-alt{box-shadow:inset 0 0 0 1px rgba(18,34,59,.2);color:var(--ink)}
.pc-alt:hover{box-shadow:inset 0 0 0 1.5px var(--navy)}
.cb-more{display:flex;align-items:center;justify-content:center;width:100%;height:3rem;margin-top:.8rem;border:0;border-radius:12px;background:transparent;box-shadow:inset 0 0 0 1.5px rgba(18,34,59,.22);font:inherit;font-size:var(--fs-body);font-weight:600;color:var(--ink);cursor:pointer;transition:box-shadow .25s,background-color .25s}
.cb-more:hover{box-shadow:inset 0 0 0 1.5px var(--navy);background:rgba(18,34,59,.03)}
.cb-more:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.cb-more[hidden]{display:none}
.cb-empty{margin:2rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.cb-empty button{border:0;border-bottom:1px solid currentColor;background:none;padding:0;font:inherit;font-weight:600;color:var(--ink);cursor:pointer}

/* same job, different brands */
.jb-table{border-top:2px solid var(--ink)}
.jb-head,.jb-sum{display:grid;grid-template-columns:minmax(14rem,1.5fr) repeat(var(--cols),minmax(0,1fr)) 2.6rem;gap:0 .9rem;align-items:center}
.jb-head{padding:.8rem 0;border-bottom:1px solid var(--line);font-size:var(--fs-body);font-weight:600;color:var(--mute)}
.jb-row{border-bottom:1px solid var(--line);scroll-margin-top:calc(var(--nav-h,68px) + 1rem)}
.jb-sum{padding:1rem 0;cursor:pointer;list-style:none;transition:background-color .25s}
.jb-sum::-webkit-details-marker{display:none}
.jb-sum:hover{background:rgba(18,34,59,.03)}
.jb-sum:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.jb-job{display:flex;flex-direction:column;gap:.2rem;min-width:0}
.jb-jn{font-family:var(--display);font-weight:500;font-size:var(--fs-sub);line-height:1.25;letter-spacing:-.01em}
.jb-jl{font-size:var(--fs-body);color:var(--mute)}
.jb-cell{min-width:0;font-size:var(--fs-body);line-height:1.4}
.jb-cell[data-has="1"]{padding:.55rem .7rem;border-radius:10px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
.jb-cell[data-has="0"]::before{content:"";display:block;width:1.2rem;height:2px;margin:0 auto;background:rgba(18,34,59,.18)}
.jb-cb{display:none;font-weight:600}
.jb-cn{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.jb-chev{display:grid;place-items:center;justify-self:end;width:2.2rem;height:2.2rem;border-radius:9px;box-shadow:inset 0 0 0 1px rgba(18,34,59,.2);transition:transform .35s,background-color .25s,color .25s}
.jb-chev svg{width:1rem;height:1rem}
.jb-row[open] .jb-chev{transform:rotate(180deg);background:var(--navy);color:#f5f0e6;box-shadow:none}
.jb-row[open] .jb-sum{padding-bottom:1.2rem}
.jb-body{display:grid;grid-template-columns:minmax(14rem,.9fr) minmax(0,2.6fr);gap:1.2rem clamp(1.2rem,3vw,2.6rem);padding:0 0 1.8rem}
.jb-shared{padding:1.2rem 1.3rem;border-radius:14px;background:var(--sky)}
.jb-k{margin:0 0 .8rem;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.jb-shared dl{margin:0}
.jb-shared div{padding:.6rem 0;border-top:1px solid rgba(39,86,160,.18)}
.jb-shared div:first-child{border-top:0;padding-top:0}
.jb-shared dt{font-size:var(--fs-body);color:var(--mute)}
.jb-shared dd{margin:.15rem 0 0;font-size:var(--fs-body);font-weight:600;line-height:1.45}
.jb-brands{display:grid;grid-template-columns:minmax(0,1fr);gap:1rem}
.jb-brands[data-n="2"]{grid-template-columns:repeat(2,minmax(0,1fr))}
.jb-brands[data-n="3"]{grid-template-columns:repeat(3,minmax(0,1fr))}
.jb-bname{display:flex;align-items:center;gap:.5rem;margin:0 0 .6rem;font-family:var(--display);font-weight:500;font-size:var(--fs-sub)}
.jb-bname span{display:grid;place-items:center;min-width:1.7rem;height:1.7rem;padding:0 .4rem;border-radius:7px;background:var(--navy);font-family:var(--sans);font-size:var(--fs-body);font-weight:600;color:#f5f0e6}
.jb-items{display:flex;flex-direction:column;gap:.6rem;margin:0;padding:0;list-style:none}
.jb-item{display:flex;flex-direction:column;gap:.45rem;padding:.9rem 1rem;border-radius:12px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
.jb-iname{align-self:flex-start;font-size:var(--fs-body);font-weight:600;line-height:1.35;text-decoration:none;border-bottom:1px solid rgba(18,34,59,.25)}
.jb-iname:hover{border-color:var(--ink)}
.jb-diff,.jb-own{margin:0;font-size:var(--fs-body);line-height:1.45;color:var(--ink2)}
.jb-own span{color:var(--mute)}
.jb-packs{display:flex;flex-wrap:wrap;align-items:flex-end;gap:.4rem 1rem;margin:.2rem 0 0;padding:0;list-style:none}
.jb-packs li{display:flex;flex-direction:column;align-items:flex-start;gap:.25rem;font-size:var(--fs-body);font-weight:500;white-space:nowrap}
.jb-packs svg{width:var(--px,2.2rem);height:var(--px,2.2rem);color:var(--water)}
.jb-rate{display:inline-flex;align-items:center;gap:.35rem;align-self:flex-start;margin-top:.2rem;font-size:var(--fs-body);font-weight:600;color:var(--accent);text-decoration:none}
.jb-rate .pg-ar{width:1rem;height:1rem}
.jb-rate:hover{text-decoration:underline;text-underline-offset:3px}
.jb-foot{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:.8rem 1.6rem}
.jb-foot p{margin:0;max-width:34rem;font-size:var(--fs-body);color:var(--mute)}
.jb-foot .pg-ar{width:1.05rem;height:1.05rem}
.jb-choose{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:1.4rem clamp(2rem,5vw,4rem);margin-top:clamp(2.4rem,6vh,3.6rem);padding:clamp(1.4rem,3vw,2.2rem);border-radius:16px;background:var(--sand-2)}
.jb-choose p{margin:.6rem 0 0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.jb-choose ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.6rem;margin:0;padding:0;list-style:none}
.jb-choose li{display:flex;flex-direction:column;gap:.25rem;padding-top:.8rem;border-top:1px solid rgba(18,34,59,.16);font-size:var(--fs-body);line-height:1.5}
.jb-choose li span{color:var(--ink2)}

@media (max-width:1199px){
  .bs-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .bs-item--0{grid-row:span 1}
  .jb-head{display:none}
  .jb-sum{grid-template-columns:minmax(0,1fr) 2.6rem;gap:.7rem 1rem}
  .jb-job{grid-column:1}
  .jb-chev{grid-column:2;grid-row:1}
  .jb-cell[data-has="0"]{display:none}
  .jb-cell[data-has="1"]{grid-column:1/-1;display:flex;gap:.6rem;align-items:baseline;padding:.45rem .7rem}
  .jb-cb{display:inline;flex:none}
  .jb-cn{-webkit-line-clamp:1;color:var(--mute)}
  .jb-body{grid-template-columns:1fr}
}
@media (max-width:899px){
  .pr-headgrid{grid-template-columns:1fr}
  .cb-tools{position:static}
  .cb-search{flex:1 1 100%}
  .jb-brands[data-n]{grid-template-columns:1fr}
  .jb-choose{grid-template-columns:1fr}
}
@media (max-width:599px){
  .bs-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:auto;gap:.6rem}
  .bs-item--0,.bs-item--1,.bs-item--job{grid-column:1/-1}
  .bs-item:not(.bs-item--0):not(.bs-item--1):not(.bs-item--job) .bs-tile{gap:.7rem;padding:1rem}
  .bs-item:not(.bs-item--0):not(.bs-item--1):not(.bs-item--job) .bs-fams{display:none}
  .bs-item:not(.bs-item--0):not(.bs-item--1):not(.bs-item--job) .bs-top{flex-direction:column;align-items:flex-start;gap:.15rem}
  .bs-go .pg-ar{display:none}
  .cb-fams{flex-wrap:nowrap;overflow-x:auto;margin-inline:calc(-1 * var(--gutter,16px));padding:0 var(--gutter,16px) 2px;scrollbar-width:none}
  .cb-fams::-webkit-scrollbar{display:none}
  .cb-fam{flex:none}
  .pc{padding:.95rem 1rem}
  .jb-choose ol{grid-template-columns:1fr}
  .jb-foot .pg-btn{width:100%}
}
`;
