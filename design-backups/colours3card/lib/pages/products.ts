/**
 * Products page, a counter to find a product and ask its rate.
 *
 *   opening    what we supply, in a line
 *   find       who makes what: every brand against every kind of product, as a
 *              grid of counts that lists what is picked; a search; and every
 *              product in rows that open (lib/pages/products-finder.ts)
 *   by job     "same job, different brands": the jobs for which we stock more
 *              than one brand, listed by the kind of work; pick one and its
 *              products are set out in a table, brand by brand: what they have
 *              in common said once above it, and only what differs in columns.
 *   close      before you buy, and the ways to ask
 *   enquiry    products added from their rows ride in a bar at the foot of the
 *              screen, each with its pack and how many, and go to RPC on
 *              WhatsApp as one message
 *
 * Product facts come only from RPC's spreadsheet; it lists no prices, so every
 * rate is asked for on WhatsApp. Links: /products#<slug> opens that product,
 * #brand-<key> a brand, #job-<key> a job.
 */
import { CHOOSING } from "../methods/data";
import { BRAND_ADVICE } from "../methods/doc";
import { PRODUCT_COUNT, rateLink, type Product } from "../products";
import { brandInfo, brandMark, jobGroup, jobs, shared, type JobView } from "../products/brands";
import { cap, fullName, shortName, useTerms } from "../products/compare";
import { packIcon } from "../products/packs";
import { arrow, ctaBand, esc, listing, secHead, type ContactInfo } from "./kit";
import { enquiryMarkup, FINDER_CSS, finderMarkup } from "./products-finder";

export interface ProductsData {
  products: readonly Product[];
  contact: ContactInfo;
}

export const PRODUCTS_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
] as const;

const chat = `<svg class="pg-ar" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

export { packIcon };

/* ------------------------------------------------------------ same job, different brands */

/**
 * One job's products in a table, brand by brand: what they all have in common
 * is said once above it, and only what differs gets a column (the type, what
 * it does, the other places it is listed for), with the packs and a rate link
 * on every row.
 */
function faceOff(j: JobView, c: ContactInfo) {
  const s = shared(j.products);
  const n = j.products.length;
  const own = (p: Product) => useTerms(p).filter((u) => !s.uses.includes(u));
  const cols: { key: "type" | "does" | "also"; label: string; cell: (p: Product) => string }[] = [];
  if (!s.category) cols.push({ key: "type", label: "Type", cell: (p) => p.category });
  if (!s.purpose) cols.push({ key: "does", label: "What it does", cell: (p) => p.purpose });
  if (j.products.some((p) => own(p).length)) cols.push({ key: "also", label: "Also listed for", cell: (p) => cap(listing(own(p))) });
  const span = cols.length + 3;
  const facts = [
    s.category ? ["Type", s.category] : null,
    s.purpose ? ["What it does", s.purpose] : null,
    s.uses.length ? ["Used on", cap(listing(s.uses))] : null,
    s.customers ? ["Bought by", s.customers] : null,
  ].filter((x): x is string[] => Boolean(x));
  const groups = j.brands
    .map(
      (b) => `<tbody style="--c:${brandMark(b.name)}">
      <tr class="fo-brow"><th colspan="${span}" scope="rowgroup"><span class="fo-bname"><i aria-hidden="true"></i>${esc(b.name)}</span><span class="fo-bcount">${b.products.length} ${b.products.length === 1 ? "product" : "products"}</span></th></tr>
      ${b.products
        .map(
          (p) => `<tr>
        <th scope="row" class="fo-name"><a href="#${p.slug}" data-product-go="${p.slug}">${esc(shortName(p))}</a></th>
        ${cols.map((col) => `<td data-label="${col.label}" class="fo-c-${col.key}">${esc(col.cell(p))}</td>`).join("")}
        <td data-label="Packs" class="fo-c-packs"><span class="fo-packs">${p.packs.map((k) => `<span>${packIcon(k.shape)}${esc(k.size)}</span>`).join("")}</span></td>
        <td class="fo-c-rate"><a class="fo-rate" href="${esc(rateLink(c.whatsapp, [p]))}" target="_blank" rel="noopener noreferrer" aria-label="Ask for today’s rate for ${esc(fullName(p))} on WhatsApp">${chat}Ask rate</a></td>
      </tr>`,
        )
        .join("")}
    </tbody>`,
    )
    .join("");
  return `<article class="fo-panel" id="job-${j.key}" data-job="${j.key}" aria-labelledby="fo-t-${j.key}">
  <header class="fo-ph">
    <div>
      <h3 class="fo-jt" id="fo-t-${j.key}">${esc(j.name)}</h3>
      <p class="fo-k">${n} products from ${esc(listing(j.brands.map((b) => b.name)))}</p>
    </div>
    <a class="fo-all" href="${esc(rateLink(c.whatsapp, j.products))}" target="_blank" rel="noopener noreferrer">${chat}Ask for all ${n} rates</a>
  </header>
  ${facts.length ? `<div class="fo-share"><p class="fo-sharek">All ${n} have in common</p><dl>${facts.map(([k, v]) => `<div><dt>${esc(k!)}</dt><dd>${esc(v!)}</dd></div>`).join("")}</dl></div>` : ""}
  <div class="fo-tablewrap">
    <table class="fo-table">
      <caption class="sr-only">${esc(j.name)}: the products of each brand</caption>
      <thead><tr><th scope="col">Product</th>${cols.map((col) => `<th scope="col" class="fo-c-${col.key}">${col.label}</th>`).join("")}<th scope="col" class="fo-c-packs">Packs</th><th scope="col"><span class="sr-only">Rate</span></th></tr></thead>
      ${groups}
    </table>
  </div>
  <p class="fo-note">Check each product’s data sheet before it goes on site.</p>
</article>`;
}

function byJobMarkup(js: readonly JobView[], c: ContactInfo) {
  // the jobs as a list grouped by the kind of work
  const groups = [...new Set(js.map(jobGroup))];
  const list = groups
    .map(
      (g) => `<li class="fo-group"><p class="fo-gname">${esc(g)}</p><ul>${js
        .filter((j) => jobGroup(j) === g)
        .map((j) => `<li><a class="fo-tab" href="#job-${j.key}" data-job-tab="${j.key}"><span class="fo-tn">${esc(j.name)}</span><span class="fo-tc">${j.products.length}</span></a></li>`)
        .join("")}</ul></li>`,
    )
    .join("");
  return `<section class="pg-sec fo-sec" id="by-job" aria-labelledby="fo-h">
  <div class="pg-wrap">
    ${secHead({ label: "Same job, different brands", title: "Compare brands, job by job.", id: "fo-h", lede: `For ${js.length} jobs we stock more than one brand. Pick a job to see its products side by side.` })}
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
        <h1 class="pg-h1">Waterproofing products and construction chemicals, by&nbsp;brand.</h1>
      </div>
      <div class="pr-headside">
        <p class="pg-intro">${PRODUCT_COUNT} products from ${esc(names)}, supplied from Erode. Rates change with the market, so ask us for today’s.</p>
        <div class="pg-actions"><a class="pg-btn pg-btn--ink" href="#find">Find a product${arrow}</a><a class="pg-btn pg-btn--line" href="#by-job">Compare brands by job</a></div>
      </div>
    </div>
  </div>
</header>`;
  return `${head}
${finderMarkup(bs, d.contact, js, PRODUCT_COUNT)}
${byJobMarkup(js, d.contact)}
${ctaBand(d.contact, {
  title: "Need a quantity or a rate?",
  steps: [
    ["Send the product and quantity", "Add products here with their packs and how many, or tell us on WhatsApp or by phone."],
    ["We reply with today’s rate", "Rates change with the market, so we quote on the day."],
    ["Check it suits the job", "Not sure it is the right product? Ask us before you buy."],
  ],
})}
${enquiryMarkup(d.contact)}`;
}

export const PRODUCTS_CSS = FINDER_CSS + `
.pr-head{border-bottom:0;padding-bottom:clamp(1rem,2.6vh,1.8rem)}
.pr-headgrid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);align-items:end;gap:1.4rem clamp(2rem,6vw,7rem)}
.pr-headgrid .pg-mark{margin-bottom:.9rem}
.pr-headgrid .pg-h1{max-width:20ch}
.pr-headside .pg-intro{margin-top:0}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

/* same job, different brands: the jobs on the left, the chosen one's products in a table on the right */
.fo{display:grid;grid-template-columns:minmax(14rem,17rem) minmax(0,1fr);gap:clamp(1.2rem,3vw,2.6rem);align-items:start}
.fo-jobs{position:sticky;top:calc(var(--nav-bar,64px) + 1.2rem)}
.fo-glist{display:flex;flex-direction:column;gap:1rem;margin:0;padding:0;list-style:none}
.fo-gname{margin:0 0 .3rem;padding-left:.8rem;font-size:var(--fs-body);font-weight:600;color:var(--mute)}
.fo-group ul{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
.fo-tab{display:flex;align-items:center;justify-content:space-between;gap:.8rem;min-height:2.5rem;padding:.45rem .8rem;border-radius:6px;font-size:var(--fs-body);line-height:1.3;color:var(--ink2);text-decoration:none;transition:background-color .2s,color .2s}
.fo-tab:hover{background:rgba(18,34,59,.06);color:var(--ink)}
.fo-tab[aria-current=true]{background:var(--navy);color:#f5f0e6;font-weight:600}
.fo-tab:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.fo-tn{min-width:0}
.fo-tc{flex:none;min-width:1.6rem;font-weight:500;font-variant-numeric:tabular-nums;text-align:right;color:var(--mute)}
.fo-tab[aria-current=true] .fo-tc{color:#4cc9d9}

/* a job */
.fo-panel{padding:clamp(1.2rem,2.2vw,1.8rem);border-radius:8px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line),0 30px 60px -50px rgba(18,34,59,.55);scroll-margin-top:calc(var(--nav-bar,64px) + 1rem)}
.fo-panel + .fo-panel{margin-top:1.2rem}
.fo-ph{display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:.8rem 1.4rem}
.fo-jt{margin:0;font-family:var(--display);font-weight:600;font-size:var(--fs-sub);line-height:1.25;letter-spacing:-.01em}
.fo-k{margin:.3rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.fo-all,.fo-rate{display:inline-flex;align-items:center;gap:.45rem;border-radius:6px;background:rgba(37,211,102,.12);box-shadow:inset 0 0 0 1px rgba(18,140,75,.32);font-size:var(--fs-body);font-weight:600;color:#128c4b;text-decoration:none;white-space:nowrap;transition:background-color .2s,color .2s,box-shadow .2s}
.fo-all{height:2.6rem;padding:0 1rem}
.fo-rate{height:2.2rem;padding:0 .75rem}
.fo-all:hover,.fo-rate:hover{background:#25d366;box-shadow:none;color:#fff}
.fo-all .pg-ar,.fo-rate .pg-ar{width:1rem;height:1rem}
.fo-all:focus-visible,.fo-rate:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.fo-share{margin-top:1.1rem;padding:.9rem 1.1rem 1rem;border-left:2px solid var(--accent);background:rgba(39,86,160,.05)}
.fo-sharek{margin:0 0 .55rem;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.fo-share dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:.6rem 1.6rem;margin:0}
.fo-share dt{font-size:var(--fs-body);color:var(--mute)}
.fo-share dd{margin:.1rem 0 0;font-size:var(--fs-body);font-weight:600;line-height:1.4}
.fo-tablewrap{margin-top:1.2rem}
.fo-table{width:100%;border-collapse:collapse;font-size:var(--fs-body)}
.fo-table thead th{padding:0 .8rem .55rem;font-weight:500;color:var(--mute);text-align:left;white-space:nowrap}
.fo-table thead th:first-child,.fo-table tbody th,.fo-table td:first-child{padding-left:0}
.fo-table tbody tr > *{padding:.75rem .8rem;border-top:1px solid var(--line);text-align:left;vertical-align:top;line-height:1.45}
.fo-table tbody tr > :first-child{padding-left:.9rem}
.fo-table tbody tr > :last-child{padding-right:0;text-align:right}
.fo-brow th{padding:.8rem 0 .55rem!important;border-top:0!important;background:none;text-align:left!important}
.fo-table tbody + tbody .fo-brow th{padding-top:1.4rem!important}
.fo-bname{display:inline-flex;align-items:center;gap:.55rem;font-family:var(--display);font-size:var(--fs-sub);font-weight:600;line-height:1.2;color:var(--ink)}
.fo-bname i{width:.5rem;height:1.2rem;border-radius:3px;background:var(--c)}
.fo-bcount{margin-left:.6rem;font-weight:500;color:var(--mute)}
.fo-table tbody tr:not(.fo-brow) > :first-child{box-shadow:inset 3px 0 0 var(--c)}
.fo-table th.fo-name{width:13rem}
.fo-name a{font-weight:600;color:var(--ink);text-decoration:none;border-bottom:1px solid rgba(18,34,59,.22);transition:border-color .2s}
.fo-name a:hover{border-color:var(--ink)}
.fo-table td{color:var(--ink2)}
.fo-c-packs{white-space:nowrap}
.fo-packs{display:inline-flex;flex-wrap:wrap;gap:.3rem}
.fo-packs > span{display:inline-flex;align-items:center;gap:.35rem;height:2rem;padding:0 .6rem 0 .45rem;border-radius:8px;background:var(--sand);font-weight:500;color:var(--ink)}
.fo-packs svg{width:1.1rem;height:1.1rem;color:var(--c,var(--water))}
.fo-table tbody tr:not(.fo-brow):hover > *{background:rgba(39,86,160,.035)}
.fo-note{margin:1rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.jb-choose{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:1.4rem clamp(2rem,5vw,4rem);margin-top:clamp(2.4rem,6vh,3.6rem);padding:clamp(1.4rem,3vw,2.2rem);border-radius:8px;background:var(--sand-2)}
.jb-choose p{margin:.6rem 0 0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.jb-choose ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.6rem;margin:0;padding:0;list-style:none}
.jb-choose li{display:flex;flex-direction:column;gap:.25rem;padding-top:.8rem;border-top:1px solid rgba(18,34,59,.16);font-size:var(--fs-body);line-height:1.5}
.jb-choose li span{color:var(--ink2)}

@media (max-width:1199px){
  .fo{grid-template-columns:minmax(12rem,15rem) minmax(0,1fr)}
}
@media (max-width:899px){
  .pr-headgrid{grid-template-columns:1fr}
  .fo{grid-template-columns:minmax(0,1fr)}
  /* the jobs become one row of chips that scrolls sideways */
  .fo-jobs{position:relative;top:auto;min-width:0;margin-inline:calc(-1 * var(--gutter,16px))}
  .fo-glist{flex-direction:row;gap:.4rem;overflow-x:auto;padding:0 var(--gutter,16px) 4px;scrollbar-width:none}
  .fo-glist::-webkit-scrollbar{display:none}
  .fo-group{flex:none}
  .fo-gname{display:none}
  .fo-group ul{flex-direction:row;gap:.4rem}
  .fo-tab{white-space:nowrap;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
  .fo-tab[aria-current=true]{box-shadow:none}
  .jb-choose{grid-template-columns:1fr}
}
@media (max-width:699px){
  /* phones: each product is a short block of its own */
  .fo-table thead{display:none}
  .fo-table,.fo-table tbody,.fo-table tr,.fo-table th,.fo-table td{display:block;width:auto}
  .fo-table tbody tr:not(.fo-brow){display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.35rem .8rem;padding:.8rem .2rem .85rem .9rem;border-top:1px solid var(--line);box-shadow:inset 3px 0 0 var(--c)}
  .fo-table tbody tr > *{padding:0!important;border:0!important;box-shadow:none!important;text-align:left!important}
  .fo-table .fo-name{grid-column:1/-1}
  .fo-table td[data-label]:not(.fo-c-packs){grid-column:1/-1}
  .fo-table td[data-label]:not(.fo-c-packs)::before{content:attr(data-label);display:block;color:var(--mute)}
  .fo-c-packs{grid-column:1;align-self:center}
  .fo-c-rate{grid-column:2;align-self:center}
  .fo-brow th{padding:.9rem 0 .5rem!important}
}
@media (max-width:599px){
  .jb-choose ol{grid-template-columns:1fr}
  .fo-panel{padding:1.1rem 1rem;border-radius:8px}
  .fo-all{width:100%;justify-content:center}
}
`;
