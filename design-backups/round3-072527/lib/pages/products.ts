/**
 * Products page, a counter to find a product and ask its rate.
 *
 *   opening    what we supply, in a line
 *   find       who makes what: every brand against every kind of product, as a
 *              grid of counts that lists what is picked; a search; and every
 *              product in rows that open (lib/pages/products-finder.ts)
 *   by job     "same job, different brands": the jobs for which we stock more
 *              than one brand, listed by the kind of work; pick one and its
 *              brands stand face to face with a VS between them: what the
 *              products share is said once at the top, and what sets each one
 *              apart stays under its brand (packs drawn to scale).
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
import { cap, fullName, packAmount, shortName, useTerms } from "../products/compare";
import { packIcon } from "../products/packs";
import { arrow, ctaBand, esc, listing, secHead, words, type ContactInfo } from "./kit";
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
  .fo{grid-template-columns:minmax(13rem,16rem) minmax(0,1fr)}
  .fo-arena[data-n="3"]{grid-template-columns:1fr}
  .fo-arena[data-n="3"] .fo-vs{width:auto;height:3.1rem;margin:.7rem 0}
  .fo-arena[data-n="3"] .fo-vs::before{top:50%;bottom:auto;left:0;right:0;border-left:0;border-top:1.5px dashed rgba(18,34,59,.2)}
  .fo-arena[data-n="3"] .fo-vs span{margin:0}
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
  .jb-choose ol{grid-template-columns:1fr}
  .fo-panel{padding:1.1rem 1rem;border-radius:18px}
  .fo-foot .pg-cbtn{width:100%}
}
`;
