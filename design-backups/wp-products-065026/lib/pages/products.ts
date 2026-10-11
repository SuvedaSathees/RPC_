/**
 * Products page, brand first.
 *
 *   opening    what we supply, in a line
 *   brands     one tile per brand, sized by how many products it has on our
 *              list, with the families that make it up drawn as a bar
 *   catalogue  every product, brand by brand: tabs for the brands, a search,
 *              and the families of the brand on show; each product with its
 *              packs and a WhatsApp link for today's rate
 *   by job     "same job, different brands": the jobs for which we stock more
 *              than one brand, listed by the kind of work; pick one and its
 *              brands stand face to face with a VS between them: what the
 *              products share is said once at the top, and what sets each one
 *              apart stays under its brand (packs drawn to scale).
 *   close      before you buy, and the ways to ask
 *   rate list  products added from their cards ride in a small bar at the foot of
 *              the screen, and go to RPC on WhatsApp as one message
 *
 * Product facts come only from RPC's spreadsheet; it lists no prices, so every
 * rate is asked for on WhatsApp. Links: /products#<slug> opens that product in
 * its brand, #brand-<key> a brand, #job-<key> a job.
 */
import { CHOOSING } from "../methods/data";
import { BRAND_ADVICE } from "../methods/doc";
import { familyOf, PRODUCT_COUNT, rateLink, rateName, type Product } from "../products";
import { brandInfo, brandMark, jobGroup, jobOf, jobs, shared, type BrandInfo, type JobView } from "../products/brands";
import { cap, fullName, packAmount, shortName, useTerms } from "../products/compare";
import { packIcon } from "../products/packs";
import { arrow, ctaBand, esc, listing, secHead, words, type ContactInfo } from "./kit";

export interface ProductsData {
  products: readonly Product[];
  contact: ContactInfo;
}

export const PRODUCTS_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
] as const;

const chat = `<svg class="pg-ar" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const search = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

/* ------------------------------------------------------------ packs */

export { packIcon };

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

const plus = `<svg class="pc-plus" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v9M3.5 8h9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
const tick = `<svg class="pc-tick" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4 6.6 11.4 12.6 4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** the rate list: what was added from the cards, sent as one WhatsApp message (filled in by the page's script) */
function rateListMarkup(c: ContactInfo) {
  return `<div class="rl" data-rl data-wa="${esc(c.whatsapp)}" hidden>
  <div class="rl-card" role="region" aria-label="Your rate list">
    <ul class="rl-items" id="rl-items" data-rl-items hidden></ul>
    <div class="rl-bar">
      <button type="button" class="rl-sum" data-rl-toggle aria-expanded="false" aria-controls="rl-items"><span class="rl-n" data-rl-n>0</span><span>on your rate list</span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 10l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <a class="rl-send" data-rl-send href="${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer">${chat}<span>Ask for these rates</span></a>
    </div>
  </div>
</div>`;
}

/** what the search box looks through */
const searchText = (p: Product) => [p.brand, p.name, p.category, p.purpose, p.areas, ...p.packs.map((k) => `${k.size} ${k.listed}`)].join(" ").toLowerCase().replace(/\s+/g, " ");

function card(p: Product, c: ContactInfo, js: readonly JobView[]) {
  const f = familyOf(p.family);
  const job = jobOf(p, js);
  const uses = useTerms(p);
  return `<li class="pc" id="${p.slug}" data-family="${p.family}" data-q="${esc(searchText(p))}" style="--tint:${f.tint}">
  <div class="pc-top"><span class="pc-ico">${packIcon(p.packs[0]?.shape ?? "pail")}</span><span class="pc-fam">${esc(f.label)}</span><button type="button" class="pc-add" data-add="${p.slug}" data-name="${esc(rateName(p))}" data-label="${esc(fullName(p))}" aria-pressed="false" aria-label="Add ${esc(fullName(p))} to your rate list" hidden>${plus}${tick}<span>Add</span></button></div>
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
    ${secHead({ label: "Catalogue", title: "Every product, brand by brand.", id: "cb-h", lede: "Search by name, use or pack size, or narrow a brand to one family. Ask for one product’s rate, or add several to your rate list and ask for them all in one message." })}
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

/** each pack drawn at a size that follows its weight or volume (by the cube root, as a container grows), against the job's largest */
function packsToScale(p: Product, max: number) {
  return `<ul class="fo-packs" aria-label="Pack sizes">${p.packs
    .map((k) => {
      const q = packAmount(k.size);
      const px = q && max ? 1.25 + 2.1 * Math.cbrt(q / max) : 2;
      return `<li style="--px:${px.toFixed(2)}rem">${packIcon(k.shape)}<span>${esc(k.size)}</span></li>`;
    })
    .join("")}</ul>`;
}

/** a brand's mark: its first letter on a disc of its colour */
const mono = (name: string) => `<span class="fo-mono" style="--c:${brandMark(name)}" aria-hidden="true">${esc(name.charAt(0))}</span>`;

/** one job, its brands face to face: what they share once at the top, then each brand's products, packs drawn to scale, with a VS between */
function faceOff(j: JobView, c: ContactInfo) {
  const s = shared(j.products);
  const max = Math.max(0, ...j.products.flatMap((p) => p.packs.map((k) => packAmount(k.size) ?? 0)));
  const facts = [
    s.category ? ["Type", s.category] : null,
    s.purpose ? ["What it does", s.purpose] : null,
    s.uses.length ? ["Used on", cap(listing(s.uses))] : null,
    s.customers ? ["Bought by", s.customers] : null,
  ].filter((x): x is string[] => Boolean(x));
  const sides = j.brands
    .map((b, i) => {
      const items = b.products
        .map((p, k) => {
          const own = useTerms(p).filter((u) => !s.uses.includes(u));
          const diff = [s.category ? "" : p.category, s.purpose ? "" : p.purpose].filter(Boolean);
          return `<li class="fo-item" style="--k:${k}">
          <a class="fo-in" href="#${p.slug}" data-product-go="${p.slug}">${esc(shortName(p))}</a>
          ${diff.length ? `<p class="fo-diff">${esc(diff.join(". "))}</p>` : ""}
          ${own.length ? `<p class="fo-own"><span>Also listed for</span> ${esc(listing(own))}</p>` : ""}
          <div class="fo-ibot">${packsToScale(p, max)}<a class="fo-rate" href="${esc(rateLink(c.whatsapp, [p]))}" target="_blank" rel="noopener noreferrer" aria-label="Ask for today’s rate for ${esc(fullName(p))} on WhatsApp">${chat}Ask rate</a></div>
        </li>`;
        })
        .join("");
      const side = `<section class="fo-side" style="--c:${brandMark(b.name)};--s:${i}" aria-label="${esc(`${b.name}: ${b.products.length} ${b.products.length === 1 ? "product" : "products"}`)}">
      <header class="fo-bh">${mono(b.name)}<span class="fo-bn">${esc(b.name)}</span><span class="fo-bc">${b.products.length} ${b.products.length === 1 ? "product" : "products"}</span></header>
      <ul class="fo-items">${items}</ul>
    </section>`;
      return i === 0 ? side : `<div class="fo-vs" aria-hidden="true"><span>vs</span></div>${side}`;
    })
    .join("");
  return `<article class="fo-panel" id="job-${j.key}" data-job="${j.key}" aria-labelledby="fo-t-${j.key}">
  <header class="fo-ph">
    <p class="fo-k">${j.products.length} products from ${j.brands.length} brands</p>
    <h3 class="fo-jt" id="fo-t-${j.key}">${esc(j.name)}</h3>
    ${facts.length ? `<dl class="fo-share">${facts.map(([k, v]) => `<div><dt>${esc(k!)}</dt><dd>${esc(v!)}</dd></div>`).join("")}</dl>` : ""}
  </header>
  <div class="fo-arena" data-n="${j.brands.length}">${sides}</div>
  <footer class="fo-foot">
    <a class="pg-cbtn pg-cbtn--ink" href="${esc(rateLink(c.whatsapp, j.products))}" target="_blank" rel="noopener noreferrer"><span>Ask for all ${j.products.length} rates</span><i aria-hidden="true">${chat}</i></a>
    <p>Packs are drawn to scale by weight or volume. Check each product’s data sheet before it goes on site.</p>
  </footer>
</article>`;
}

function byJobMarkup(js: readonly JobView[], c: ContactInfo) {
  // the jobs as a list grouped by the kind of work, each with its brands' marks
  const groups = [...new Set(js.map(jobGroup))];
  const list = groups
    .map(
      (g) => `<li class="fo-group"><p class="fo-gname">${esc(g)}</p><ul>${js
        .filter((j) => jobGroup(j) === g)
        .map(
          (j) => `<li><a class="fo-tab" href="#job-${j.key}" data-job-tab="${j.key}"><span class="fo-tn">${esc(j.name)}</span><span class="fo-tm" aria-hidden="true">${j.brands.map((b) => mono(b.name)).join("")}</span></a></li>`,
        )
        .join("")}</ul></li>`,
    )
    .join("");
  return `<section class="pg-sec fo-sec" id="by-job" aria-labelledby="fo-h">
  <div class="pg-wrap">
    ${secHead({ label: "Same job, different brands", title: "Compare brands, job by job.", id: "fo-h", lede: `For ${js.length} jobs we stock more than one brand. Pick a job and see the brands face to face: what they share, and what sets each product apart.` })}
    <div class="fo">
      <nav class="fo-jobs" aria-label="Jobs to compare"><ul class="fo-glist">${list}</ul></nav>
      <div class="fo-stage">${js.map((j) => faceOff(j, c)).join("\n")}</div>
    </div>
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
${byJobMarkup(js, d.contact)}
${ctaBand(d.contact, {
  title: "Need a quantity or a rate?",
  steps: [
    ["Send the product and quantity", "The name and pack size from this page, on WhatsApp or by phone."],
    ["We reply with today’s rate", "Rates change with the market, so we quote on the day."],
    ["Check it suits the job", "Not sure it is the right product? Ask us before you buy."],
  ],
})}
${rateListMarkup(d.contact)}`;
}

export const PRODUCTS_CSS = `
.pr-head{border-bottom:0;padding-bottom:clamp(1rem,2.6vh,1.8rem)}
.pr-headgrid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);align-items:end;gap:1.4rem clamp(2rem,6vw,7rem)}
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
.bs-name{font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.15;letter-spacing:-.01em}
.bs-item--0 .bs-name{font-size:var(--fs-title);letter-spacing:-.02em}
.bs-count{font-size:var(--fs-body);color:var(--mute)}
.bs-count b{font-family:var(--display);font-weight:600;font-size:var(--fs-sub);color:var(--ink)}
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
.cb-bh{margin:0;font-family:var(--display);font-weight:600;font-size:var(--fs-title);line-height:1.1;letter-spacing:-.02em}
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
.pc-name{margin:.2rem 0 0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.2;letter-spacing:-.01em}
.pc-cat{margin:0;font-size:var(--fs-body);line-height:1.45;color:var(--ink)}
.pc-use{margin:0;font-size:var(--fs-body);line-height:1.5;color:var(--mute)}
.pc-use span{display:block;font-weight:600;color:var(--ink2)}
.pc-packs{display:flex;flex-wrap:wrap;gap:.35rem;margin:.1rem 0 0;padding:0;list-style:none}
.pc-packs li{display:inline-flex;align-items:center;height:1.9rem;padding:0 .65rem;border-radius:7px;background:var(--sand);font-size:var(--fs-body);font-weight:500;white-space:nowrap}
.pc-acts{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:auto;padding-top:.5rem}
/* adding a product to the rate list */
.pc-add{display:inline-flex;align-items:center;gap:.3rem;flex:none;height:2rem;margin-left:auto;padding:0 .75rem 0 .55rem;border:0;border-radius:999px;background:transparent;box-shadow:inset 0 0 0 1px var(--line);color:var(--ink);font:inherit;font-size:var(--fs-body);font-weight:600;line-height:1;cursor:pointer;transition:background-color .25s,color .25s,box-shadow .25s}
.pc-add[hidden]{display:none}
.pc-add svg{width:14px;height:14px}
.pc-add .pc-tick,.pc-add.is-on .pc-plus{display:none}
.pc-add.is-on .pc-tick{display:block}
.pc-add:hover{box-shadow:inset 0 0 0 1px var(--ink)}
.pc-add.is-on{background:var(--navy);box-shadow:none;color:#f5f0e6}
.pc-add:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
/* the rate list, floating at the foot of the screen */
.rl{position:fixed;left:50%;bottom:max(1rem,env(safe-area-inset-bottom));z-index:36;width:min(34rem,calc(100vw - 2 * var(--gutter,1rem)));transform:translateX(-50%);animation:rl-in .45s cubic-bezier(.2,.8,.2,1)}
.rl[hidden]{display:none}
@keyframes rl-in{from{opacity:0;transform:translate(-50%,18px)}}
.rl-card{overflow:hidden;border-radius:16px;background:var(--navy);color:#f5f0e6;box-shadow:0 26px 50px -24px rgba(4,12,30,.75),0 0 0 1px rgba(255,255,255,.06)}
.rl-bar{display:flex;align-items:center;gap:.45rem;padding:.45rem}
.rl-sum{display:flex;flex:1;align-items:center;gap:.6rem;min-width:0;height:2.7rem;padding:0 .7rem 0 .45rem;border:0;border-radius:11px;background:transparent;color:inherit;font:inherit;font-size:var(--fs-body);font-weight:500;text-align:left;white-space:nowrap;cursor:pointer;transition:background-color .25s}
.rl-sum:hover{background:rgba(255,255,255,.07)}
.rl-sum svg{width:14px;height:14px;margin-left:auto;opacity:.7;transition:transform .3s}
.rl-sum[aria-expanded="true"] svg{transform:rotate(180deg)}
.rl-n{display:grid;place-items:center;flex:none;min-width:1.8rem;height:1.8rem;padding:0 .45rem;border-radius:999px;background:#4cc9d9;color:var(--navy);font-weight:700;font-variant-numeric:tabular-nums;transition:transform .3s cubic-bezier(.3,1.6,.5,1)}
.rl-n.is-bump{transform:scale(1.25)}
.rl-send{display:inline-flex;align-items:center;gap:.45rem;flex:none;height:2.7rem;padding:0 1.05rem;border-radius:11px;background:#25d366;color:#06301a;font-size:var(--fs-body);font-weight:600;text-decoration:none;white-space:nowrap;transition:background-color .25s}
.rl-send:hover{background:#1fbd5a}
.rl-send .pg-ar{width:1.1rem;height:1.1rem}
.rl-sum:focus-visible,.rl-send:focus-visible,.rl-items button:focus-visible{outline:2px solid #4cc9d9;outline-offset:2px}
.rl-items{display:grid;gap:3px;max-height:min(19rem,42svh);margin:0;padding:.45rem .45rem 0;overflow:auto;overscroll-behavior:contain;list-style:none}
.rl-items[hidden]{display:none}
.rl-items li{display:flex;align-items:center;justify-content:space-between;gap:.75rem;min-height:2.6rem;padding:.35rem .35rem .35rem .8rem;border-radius:10px;background:rgba(255,255,255,.06);font-size:var(--fs-body);line-height:1.35}
.rl-items li button{display:grid;place-items:center;flex:none;width:2rem;height:2rem;border:0;border-radius:8px;background:transparent;color:inherit;cursor:pointer;opacity:.7;transition:background-color .2s,opacity .2s}
.rl-items li button:hover{background:rgba(255,255,255,.1);opacity:1}
.rl-items li button svg{width:14px;height:14px}
.rl-items li.rl-clear{justify-content:flex-end;min-height:0;padding:.15rem 0;background:none}
.rl-items li.rl-clear button{width:auto;height:2.2rem;padding:0 .7rem;font:inherit;font-size:var(--fs-body);font-weight:600;color:#4cc9d9;opacity:1}
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

/* same job, different brands: the jobs listed on the left; the chosen one's brands face to face on the right, a VS between them */
.fo{display:grid;grid-template-columns:minmax(15rem,19rem) minmax(0,1fr);gap:clamp(1.2rem,3vw,2.6rem);align-items:start}
.fo-jobs{position:sticky;top:calc(var(--nav-bar,64px) + 1.2rem)}
.fo-glist{display:flex;flex-direction:column;gap:1.1rem;margin:0;padding:0;list-style:none}
.fo-gname{margin:0 0 .35rem;padding-left:.9rem;font-size:var(--fs-body);font-weight:600;color:var(--mute)}
.fo-group ul{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
.fo-tab{position:relative;display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:.6rem .7rem .6rem .9rem;border-radius:10px;font-size:var(--fs-body);line-height:1.35;color:var(--ink2);text-decoration:none;transition:background-color .25s,color .25s,box-shadow .25s}
.fo-tab:hover{background:rgba(18,34,59,.05);color:var(--ink)}
.fo-tab[aria-current=true]{background:var(--card);box-shadow:inset 0 0 0 1px var(--line),0 12px 26px -20px rgba(18,34,59,.55);font-weight:600;color:var(--ink)}
.fo-tab[aria-current=true]::before{content:"";position:absolute;left:0;top:.55rem;bottom:.55rem;width:3px;border-radius:2px;background:#4cc9d9}
.fo-tab:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.fo-tn{min-width:0}
.fo-tm{display:flex;flex:none}
.fo-mono{display:grid;place-items:center;flex:none;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--c);font-family:var(--display);font-weight:500;font-size:var(--fs-body);line-height:1;color:#f5f0e6}
.fo-tm .fo-mono{box-shadow:0 0 0 2px var(--sand)}
.fo-tm .fo-mono + .fo-mono{margin-left:-.2rem}
.fo-tab[aria-current=true] .fo-mono{box-shadow:0 0 0 2px var(--card)}

/* a job: what its products share, then the brands face to face */
.fo-panel{padding:clamp(1.2rem,2.4vw,2rem);border-radius:22px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line),0 34px 70px -54px rgba(18,34,59,.6);scroll-margin-top:calc(var(--nav-bar,64px) + 1rem)}
.fo-panel + .fo-panel{margin-top:1.2rem}
.fo-k{margin:0;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.fo-jt{margin:.4rem 0 0;max-width:30ch;font-family:var(--display);font-weight:600;font-size:var(--fs-title);line-height:1.12;letter-spacing:-.02em;text-wrap:balance}
.fo-share{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:.7rem 1.6rem;margin:1.1rem 0 0;padding:.95rem 1.1rem;border-radius:14px;background:var(--sky)}
.fo-share dt{font-size:var(--fs-body);color:var(--mute)}
.fo-share dd{margin:.15rem 0 0;font-size:var(--fs-body);font-weight:600;line-height:1.4}
.fo-arena{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:0 clamp(.5rem,1.2vw,1rem);margin-top:clamp(1.3rem,3vh,1.9rem)}
.fo-arena[data-n="3"]{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr)}
.fo-side{display:flex;flex-direction:column;gap:.75rem;min-width:0;padding-top:.95rem;border-top:3px solid var(--c)}
.fo-bh{display:flex;align-items:center;gap:.65rem}
.fo-bh .fo-mono{width:2.5rem;height:2.5rem;font-size:var(--fs-sub)}
.fo-bn{font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.2}
.fo-bc{margin-left:auto;font-size:var(--fs-body);color:var(--mute);white-space:nowrap}
.fo-items{display:flex;flex-direction:column;gap:.6rem;margin:0;padding:0;list-style:none}
.fo-item{display:flex;flex-direction:column;gap:.4rem;padding:.85rem .95rem;border-radius:12px;background:var(--sand);box-shadow:inset 0 0 0 1px var(--line)}
.fo-in{align-self:flex-start;font-size:var(--fs-body);font-weight:600;line-height:1.35;color:var(--ink);text-decoration:none;border-bottom:1px solid rgba(18,34,59,.25)}
.fo-in:hover{border-color:var(--ink)}
.fo-diff,.fo-own{margin:0;font-size:var(--fs-body);line-height:1.45;color:var(--ink2)}
.fo-own span{color:var(--mute)}
.fo-ibot{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:.6rem 1rem;margin-top:.2rem}
.fo-packs{display:flex;flex-wrap:wrap;align-items:flex-end;gap:.4rem 1rem;margin:0;padding:0;list-style:none}
.fo-packs li{display:flex;flex-direction:column;align-items:flex-start;gap:.2rem;font-size:var(--fs-body);font-weight:500;white-space:nowrap}
.fo-packs svg{width:var(--px,2rem);height:var(--px,2rem);color:var(--c,var(--water))}
.fo-rate{display:inline-flex;align-items:center;gap:.4rem;height:2.2rem;padding:0 .75rem;border-radius:8px;background:rgba(37,211,102,.1);box-shadow:inset 0 0 0 1px rgba(18,140,75,.3);font-size:var(--fs-body);font-weight:600;color:#128c4b;text-decoration:none;white-space:nowrap;transition:background-color .25s,color .25s,box-shadow .25s}
.fo-rate:hover{background:#25d366;box-shadow:none;color:#fff}
.fo-rate .pg-ar{width:1rem;height:1rem}
/* the VS between two brands, on a dashed line */
.fo-vs{position:relative;display:flex;justify-content:center;width:3.3rem}
.fo-vs::before{content:"";position:absolute;top:0;bottom:0;left:50%;border-left:1.5px dashed rgba(18,34,59,.2)}
.fo-vs span{position:relative;display:grid;place-items:center;width:3.1rem;height:3.1rem;margin-top:.25rem;border-radius:50%;background:#4cc9d9;font-family:var(--display);font-weight:500;font-size:var(--fs-body);color:var(--navy);box-shadow:0 0 0 6px var(--card),0 12px 26px -12px rgba(11,110,128,.7)}
.fo-foot{display:flex;flex-wrap:wrap;align-items:center;gap:.8rem 1.6rem;margin-top:clamp(1.2rem,2.6vh,1.6rem);padding-top:clamp(1rem,2vh,1.3rem);border-top:1px solid var(--line)}
.fo-foot p{margin:0;max-width:30rem;font-size:var(--fs-body);color:var(--mute)}
.fo-foot .pg-cbtn > i .pg-ar{width:1.05rem;height:1.05rem}
/* the face-off arrives: the job's words rise, the brands come in from either side, the VS spins in, the products follow */
.fo-anim .fo-ph > *,.fo-anim .fo-side,.fo-anim .fo-item,.fo-anim .fo-foot{transition:opacity .55s ease,translate .75s cubic-bezier(.2,.75,.15,1)}
.fo-anim .fo-vs span{transition:opacity .4s ease,scale .7s cubic-bezier(.3,1.6,.45,1),rotate .7s cubic-bezier(.3,1.4,.45,1)}
.fo-anim .fo-panel:not(.is-in) .fo-ph > *{opacity:0;translate:0 12px}
.fo-anim .fo-panel:not(.is-in) .fo-side{opacity:0;translate:-44px 0}
.fo-anim .fo-panel:not(.is-in) .fo-side:last-child{translate:44px 0}
.fo-anim .fo-panel:not(.is-in) .fo-arena[data-n="3"] .fo-side:nth-child(3){translate:0 26px}
.fo-anim .fo-panel:not(.is-in) .fo-vs span{opacity:0;scale:.3;rotate:-140deg}
.fo-anim .fo-panel:not(.is-in) .fo-item{opacity:0;translate:0 14px}
.fo-anim .fo-panel:not(.is-in) .fo-foot{opacity:0}
.fo-anim .fo-ph > :nth-child(2){transition-delay:.05s}
.fo-anim .fo-ph > :nth-child(3){transition-delay:.1s}
.fo-anim .fo-side{transition-delay:.08s}
.fo-anim .fo-vs span{transition-delay:.28s}
.fo-anim .fo-item{transition-delay:calc(.3s + var(--k,0) * .07s)}
.fo-anim .fo-foot{transition-delay:.45s}
.jb-choose{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:1.4rem clamp(2rem,5vw,4rem);margin-top:clamp(2.4rem,6vh,3.6rem);padding:clamp(1.4rem,3vw,2.2rem);border-radius:16px;background:var(--sand-2)}
.jb-choose p{margin:.6rem 0 0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.jb-choose ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.6rem;margin:0;padding:0;list-style:none}
.jb-choose li{display:flex;flex-direction:column;gap:.25rem;padding-top:.8rem;border-top:1px solid rgba(18,34,59,.16);font-size:var(--fs-body);line-height:1.5}
.jb-choose li span{color:var(--ink2)}

@media (max-width:1199px){
  .bs-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .bs-item--0{grid-row:span 1}
  .fo{grid-template-columns:minmax(13rem,16rem) minmax(0,1fr)}
  .fo-arena[data-n="3"]{grid-template-columns:1fr}
  .fo-arena[data-n="3"] .fo-vs{width:auto;height:3.1rem;margin:.7rem 0}
  .fo-arena[data-n="3"] .fo-vs::before{top:50%;bottom:auto;left:0;right:0;border-left:0;border-top:1.5px dashed rgba(18,34,59,.2)}
  .fo-arena[data-n="3"] .fo-vs span{margin:0}
}
@media (max-width:899px){
  .pr-headgrid{grid-template-columns:1fr}
  .cb-tools{position:static}
  .cb-search{flex:1 1 100%}
  .fo{grid-template-columns:minmax(0,1fr)}
  /* the jobs become one row of chips that scrolls sideways */
  .fo-jobs{position:relative;top:auto;min-width:0;margin-inline:calc(-1 * var(--gutter,16px))}
  .fo-glist{flex-direction:row;gap:.4rem;overflow-x:auto;padding:0 var(--gutter,16px) 4px;scrollbar-width:none}
  .fo-glist::-webkit-scrollbar{display:none}
  .fo-group{flex:none}
  .fo-gname{display:none}
  .fo-group ul{flex-direction:row;gap:.4rem}
  .fo-tab{white-space:nowrap;padding:.5rem .6rem .5rem .85rem;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
  .fo-tab[aria-current=true]{background:var(--navy);box-shadow:none;color:#f5f0e6}
  .fo-tab[aria-current=true]::before{display:none}
  .fo-tab[aria-current=true] .fo-mono{box-shadow:0 0 0 2px var(--navy)}
  .fo-tm .fo-mono{box-shadow:0 0 0 2px var(--card)}
  .fo-arena,.fo-arena[data-n="3"]{grid-template-columns:minmax(0,1fr)}
  .fo-vs,.fo-arena[data-n="3"] .fo-vs{width:auto;height:3.1rem;margin:.7rem 0}
  .fo-vs::before,.fo-arena[data-n="3"] .fo-vs::before{top:50%;bottom:auto;left:0;right:0;border-left:0;border-top:1.5px dashed rgba(18,34,59,.2)}
  .fo-vs span{margin:0}
  .fo-anim .fo-panel:not(.is-in) .fo-side:last-child{translate:0 26px}
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
  .fo-panel{padding:1.1rem 1rem;border-radius:18px}
  .fo-foot .pg-cbtn{width:100%}
  .rl-send span{display:none}
  .rl-send{width:2.7rem;padding:0;justify-content:center}
  .rl-send .pg-ar{width:1.25rem;height:1.25rem}
}
`;
