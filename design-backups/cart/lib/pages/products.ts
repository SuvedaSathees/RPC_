/**
 * Products page, a counter to find a product and ask its rate.
 *
 *   opening    what we supply, in a line
 *   find       who makes what: every brand against every kind of product, as a
 *              grid of counts that lists what is picked; a search; and every
 *              product in rows that open (lib/pages/products-finder.ts)
 *   by job     "same job, different brands": the jobs for which we stock more
 *              than one brand, listed by the kind of work; pick one, then any two
 *              of its products, and they face each other head to head, with
 *              what they share marked and what differs standing out.
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
import { brandInfo, brandMark, jobGroup, jobs, type JobView } from "../products/brands";
import { cap, fullName, productVerdict, shortName, useTerms, usesNote } from "../products/compare";
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
 * One job, head to head. Every product for the job sits in its brand's column
 * as a chip; the two picked (one from each of the first two brands, to start)
 * face each other across a spine of what the sheet says about them: the type,
 * what it does, where it is listed for, who buys it and the packs. A row the two
 * share is marked "Same" and kept quiet, so what differs stands out; the places
 * they are both listed for are filled in. The rest happens in the browser
 * (products-behaviour.ts), from the job's facts set out below the panel as JSON.
 */
const ROWS = [
  { k: "cat", label: "Type" },
  { k: "does", label: "What it does" },
  { k: "uses", label: "Listed for" },
  { k: "by", label: "Bought by" },
  { k: "packs", label: "Packs" },
] as const;

interface Side {
  b: string;
  c: string;
  n: string;
  f: string;
  cat: string;
  does: string;
  uses: string[];
  note: string;
  by: string;
  packs: string;
  rate: string;
}

function sideOf(p: Product, c: ContactInfo): Side {
  return {
    b: p.brand,
    c: brandMark(p.brand),
    n: shortName(p),
    f: fullName(p),
    cat: p.category,
    does: p.purpose,
    uses: useTerms(p).map(cap),
    note: usesNote(p),
    by: p.customers,
    packs: p.packs.map((k) => `<span>${packIcon(k.shape)}${esc(k.size)}</span>`).join(""),
    rate: rateLink(c.whatsapp, [p]),
  };
}

/** the cells of one row for one side, and whether the two agree on it */
function cell(k: (typeof ROWS)[number]["k"], x: Side, y: Side): { html: string; same: boolean } {
  if (k === "uses") {
    const same = x.uses.length > 0 && x.uses.length === y.uses.length && x.uses.every((u) => y.uses.includes(u));
    const html = x.uses.length
      ? `<span class="h2-uses">${x.uses.map((u) => `<span${y.uses.includes(u) ? ` class="is-both"` : ""}>${esc(u)}</span>`).join("")}</span>`
      : `<span class="h2-none">${esc(x.note || "Not listed")}</span>`;
    return { html, same };
  }
  if (k === "packs") return { html: `<span class="fo-packs">${x.packs}</span>`, same: false };
  return { html: esc(x[k]), same: x[k] === y[k] };
}

function headToHead(a: Side, b: Side) {
  return ROWS.map((r) => {
    const ca = cell(r.k, a, b);
    const cb = cell(r.k, b, a);
    const same = ca.same && cb.same;
    return `<div class="h2-row${same ? " is-same" : ""}" data-row="${r.k}"><dt><span>${r.label}</span><em>Same</em></dt><dd data-s="a">${ca.html}</dd><dd data-s="b">${cb.html}</dd></div>`;
  }).join("");
}

function faceOff(j: JobView, c: ContactInfo) {
  const n = j.products.length;
  const pa = j.brands[0]!.products[0]!;
  const pb = j.brands[1]!.products[0]!;
  const sides: Record<string, Side> = Object.fromEntries(j.products.map((p) => [p.slug, sideOf(p, c)]));
  const verdicts: Record<string, string> = {};
  for (const x of j.products)
    for (const y of j.products)
      if (x !== y) {
        const v = productVerdict(x, y);
        verdicts[`${x.slug}|${y.slug}`] = [v.lead, v.more].filter(Boolean).join(" ");
      }
  const A = sides[pa.slug]!;
  const B = sides[pb.slug]!;
  // every product of the job in one list, brand by brand, for each side to pick from
  const options = (sel: string) =>
    j.brands.map((br) => `<optgroup label="${esc(br.name)}">${br.products.map((p) => `<option value="${p.slug}"${p.slug === sel ? " selected" : ""}>${esc(shortName(p))}</option>`).join("")}</optgroup>`).join("");
  const head = (s: "a" | "b", x: Side) =>
    `<label class="h2-head" data-s="${s}" style="--c:${x.c}"><span class="h2-side" aria-hidden="true">${s === "a" ? 1 : 2}</span><span class="h2-hb">${esc(x.b)}</span><select class="h2-sel" data-h2="${s}" aria-label="${s === "a" ? "First" : "Second"} product to compare">${options(s === "a" ? pa.slug : pb.slug)}</select></label>`;
  const rate = (s: "a" | "b", x: Side) =>
    `<a class="fo-rate" data-s="${s}" href="${esc(x.rate)}" target="_blank" rel="noopener noreferrer">${chat}Ask the rate<span class="h2-rn">for ${esc(x.n)}</span></a>`;
  const data = JSON.stringify({ sides, verdicts }).replace(/</g, "\\u003c");
  return `<article class="fo-panel" id="job-${j.key}" data-job="${j.key}" data-a="${pa.slug}" data-b="${pb.slug}" aria-labelledby="fo-t-${j.key}">
  <header class="fo-ph">
    <div>
      <h3 class="fo-jt" id="fo-t-${j.key}">${esc(j.name)}</h3>
      <p class="fo-k">${n} products from ${esc(listing(j.brands.map((b) => b.name)))}</p>
    </div>
    <a class="fo-all" href="${esc(rateLink(c.whatsapp, j.products))}" target="_blank" rel="noopener noreferrer">${chat}Ask for all ${n} rates</a>
  </header>
  <p class="h2-pk">Choose two products to compare. Rows they share are marked “Same”.</p>
  <div class="h2-ring" aria-live="polite">
    <div class="h2-heads">${head("a", A)}<span class="h2-vs" aria-hidden="true">vs</span>${head("b", B)}</div>
    <p class="h2-verdict">${esc(verdicts[`${pa.slug}|${pb.slug}`] ?? "")}</p>
    <dl class="h2-rows">${headToHead(A, B)}</dl>
    <div class="h2-acts">${rate("a", A)}${rate("b", B)}</div>
  </div>
  <p class="fo-note">Places in dark blue are listed for both. Check each product’s data sheet before it goes on site.</p>
  <script type="application/json" class="h2-data">${data}</script>
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
    ${secHead({ label: "Same job, different brands", title: "Compare brands, job by job.", id: "fo-h", lede: `For ${js.length} jobs we stock more than one brand. Pick a job, then any two of its products to set them side by side.` })}
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

/* same job, different brands: the jobs on the left; the chosen job's products as chips by brand, and two of them head to head */
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
.fo-tab[aria-current=true] .fo-tc{color:rgba(255,255,255,.7)}

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
.fo-packs{display:inline-flex;flex-wrap:wrap;gap:.3rem}
.fo-packs > span{display:inline-flex;align-items:center;gap:.35rem;height:2rem;padding:0 .6rem 0 .45rem;border-radius:8px;background:var(--sand);font-weight:500;color:var(--ink)}
.fo-packs svg{width:1.1rem;height:1.1rem;color:var(--c,var(--water))}
.fo-note{margin:1rem 0 0;font-size:var(--fs-body);color:var(--mute)}

/* head to head: the products as chips, brand by brand; two picked face each other across a spine */
.h2-pick{margin-top:1.3rem}
.h2-pk{margin:0 0 .6rem;font-size:var(--fs-body);font-weight:600;color:var(--ink2)}
.h2-roster{display:grid;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));gap:.7rem}
.h2-brand{padding:.75rem .7rem .7rem;border-radius:12px;background:rgba(18,34,59,.035);box-shadow:inset 0 3px 0 var(--c)}
.h2-bn{display:flex;align-items:center;gap:.5rem;margin:0 0 .5rem .2rem;font-size:var(--fs-body);font-weight:600;color:var(--ink)}
.h2-bn i{width:.55rem;height:.55rem;border-radius:50%;background:var(--c)}
.h2-bn span{margin-left:auto;padding-right:.2rem;font-weight:500;color:var(--mute)}
.h2-brand ul{display:flex;flex-direction:column;gap:.35rem;margin:0;padding:0;list-style:none}
.h2-chip{display:grid;grid-template-columns:1.6rem minmax(0,1fr) auto;align-items:center;gap:.6rem;width:100%;min-height:2.75rem;padding:.4rem .7rem .4rem .45rem;border:0;border-radius:8px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);font:inherit;font-size:var(--fs-body);color:var(--ink);text-align:left;cursor:pointer;transition:background-color .2s,box-shadow .2s,color .2s}
.h2-chip:hover{box-shadow:inset 0 0 0 1.5px var(--navy)}
.h2-chip:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.h2-tag{display:grid;place-items:center;width:1.6rem;height:1.6rem;border-radius:50%;box-shadow:inset 0 0 0 1.5px rgba(18,34,59,.2);font-size:var(--fs-body);font-weight:700;line-height:1}
.h2-cn{min-width:0;font-weight:600;line-height:1.3}
.h2-cp{color:var(--mute);white-space:nowrap}
.h2-chip[aria-pressed=true]{background:var(--navy);box-shadow:none;color:#fff}
.h2-chip[aria-pressed=true] .h2-tag{background:#f5f0e6;box-shadow:none;color:var(--navy)}
.h2-chip[aria-pressed=true] .h2-cp{color:rgba(255,255,255,.7)}

.h2-ring{--cols:minmax(0,1fr) 9.5rem minmax(0,1fr);margin-top:1.4rem;padding:clamp(1rem,2vw,1.6rem);border-radius:14px;background:var(--paper,#fbf8f2);box-shadow:inset 0 0 0 1px var(--line)}
.h2-heads{display:grid;grid-template-columns:var(--cols);align-items:stretch}
.h2-head{position:relative;display:flex;flex-direction:column;justify-content:center;gap:.15rem;min-width:0;padding:1rem 1.2rem;border-radius:12px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line),inset 0 4px 0 var(--c)}
.h2-head[data-s=a]{align-items:flex-end;padding-right:3.4rem;text-align:right}
.h2-head[data-s=b]{padding-left:3.4rem}
.h2-side{position:absolute;top:50%;display:grid;place-items:center;width:2.1rem;height:2.1rem;margin-top:-1.05rem;border-radius:50%;background:var(--c);font-size:var(--fs-body);font-weight:700;color:#fff}
.h2-head[data-s=a] .h2-side{right:.9rem}
.h2-head[data-s=b] .h2-side{left:.9rem}
.h2-hb{margin:0;font-size:var(--fs-body);font-weight:600;color:var(--mute)}
.h2-hn{margin:0;font-family:var(--display);font-size:var(--fs-sub);font-weight:600;line-height:1.2;letter-spacing:-.01em;color:var(--ink)}
.h2-vs{align-self:center;justify-self:center;display:grid;place-items:center;width:3.2rem;height:3.2rem;border-radius:50%;background:var(--navy);box-shadow:0 0 0 6px var(--paper,#fbf8f2);font-family:var(--display);font-size:var(--fs-body);font-weight:700;color:#f5f0e6}
/* the two sides: the brand, and a list to choose the product */
.h2-head{cursor:pointer}
.h2-hb{display:block}
.h2-sel{max-width:100%;margin:0;padding:.1rem 1.6rem .1rem 0;border:0;border-radius:6px;background:transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%2312223b' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right .1rem center/14px;font-family:var(--display);font-size:var(--fs-sub);font-weight:600;line-height:1.25;letter-spacing:-.01em;color:var(--ink);cursor:pointer;appearance:none;-webkit-appearance:none}
.h2-head[data-s=a] .h2-sel{text-align:right;text-align-last:right}
.h2-sel:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.h2-sel option,.h2-sel optgroup{font-family:var(--sans);font-size:16px;color:#12223b}
.h2-head:hover{box-shadow:inset 0 0 0 1.5px var(--navy),inset 0 4px 0 var(--c)}
.h2-pk{margin:1.1rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.h2-verdict{max-width:46rem;margin:1.1rem auto .4rem;font-size:var(--fs-body);line-height:1.55;text-align:center;color:var(--ink2)}
.h2-verdict:empty{display:none}
.h2-rows{margin:0}
.h2-row{position:relative;display:grid;grid-template-columns:var(--cols);align-items:start;padding:.85rem 0;border-top:1px solid var(--line)}
.h2-row dt{grid-column:2;grid-row:1;display:flex;flex-direction:column;align-items:center;gap:.3rem;padding:0 .6rem;font-size:var(--fs-body);font-weight:600;line-height:1.3;text-align:center;color:var(--ink)}
.h2-row dt em{display:none;padding:.1rem .55rem;border-radius:999px;background:rgba(18,34,59,.07);font-style:normal;font-weight:500;color:var(--mute)}
.h2-row dd{grid-row:1;min-width:0;margin:0;font-size:var(--fs-body);line-height:1.5;color:var(--ink)}
.h2-row dd[data-s=a]{grid-column:1;text-align:right}
.h2-row dd[data-s=b]{grid-column:3}
.h2-row.is-same dt em{display:block}
.h2-row.is-same dd{color:var(--mute)}
.h2-row:not(.is-same):not([data-row=packs]) dd{font-weight:500}
.h2-uses{display:flex;flex-wrap:wrap;gap:.3rem}
.h2-row dd[data-s=a] .h2-uses,.h2-row dd[data-s=a] .fo-packs{justify-content:flex-end}
.h2-uses span{display:inline-flex;align-items:center;min-height:1.9rem;padding:.15rem .6rem;border-radius:7px;box-shadow:inset 0 0 0 1px rgba(18,34,59,.2);font-weight:500;line-height:1.3;color:var(--ink)}
.h2-uses span.is-both{background:var(--navy);box-shadow:none;color:#f5f0e6}
.h2-none{color:var(--mute)}
.h2-row[data-row=packs] .fo-packs svg{color:var(--mute)}
.h2-acts{display:grid;grid-template-columns:var(--cols);padding-top:1rem;border-top:1px solid var(--line)}
.h2-acts .fo-rate{position:relative;max-width:100%;height:auto;min-height:2.4rem;padding:.4rem .8rem;white-space:normal}
.h2-acts .fo-rate[data-s=a]{grid-column:1;justify-self:end}
.h2-acts .fo-rate[data-s=b]{grid-column:3;justify-self:start}
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
  /* phones: the spine's names go above each row, the two sides below it */
  .h2-ring{--cols:minmax(0,1fr) minmax(0,1fr);padding:.9rem .8rem}
  .h2-heads{column-gap:1.4rem}
  .h2-vs{position:absolute;left:50%;width:2.4rem;height:2.4rem;margin-left:-1.2rem;box-shadow:0 0 0 4px var(--paper,#fbf8f2)}
  .h2-heads{position:relative}
  .h2-head{padding:2.6rem .8rem .8rem!important;align-items:flex-start!important;text-align:left!important}
  .h2-side{top:.7rem;margin-top:0;width:1.7rem;height:1.7rem}
  .h2-head[data-s=a] .h2-side{right:auto;left:.8rem}
  .h2-row{column-gap:1rem;row-gap:.5rem}
  .h2-row dt{grid-column:1/-1;flex-direction:row;justify-content:center}
  .h2-row dd{grid-row:2}
  .h2-row dd[data-s=a]{grid-column:1;text-align:left}
  .h2-row dd[data-s=b]{grid-column:2}
  .h2-row dd[data-s=a] .h2-uses,.h2-row dd[data-s=a] .fo-packs{justify-content:flex-start}
  .h2-acts{column-gap:1rem}
  .h2-acts .fo-rate[data-s=a]{justify-self:stretch;justify-content:center}
  .h2-acts .fo-rate[data-s=b]{grid-column:2;justify-self:stretch;justify-content:center}
  .h2-acts .fo-rate{padding:.4rem .5rem;white-space:nowrap}
  .h2-rn{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
  .h2-head{justify-content:flex-start}
  /* a row the two share is said once, across both */
  .h2-row.is-same dd[data-s=b]{display:none}
  .h2-row.is-same dd[data-s=a]{grid-column:1/-1;text-align:center}
  .h2-row.is-same dd[data-s=a] .h2-uses{justify-content:center}
}
@media (max-width:599px){
  .jb-choose ol{grid-template-columns:1fr}
  .fo-panel{padding:1.1rem 1rem;border-radius:8px}
  .fo-all{width:100%;justify-content:center}
}
`;
