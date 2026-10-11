/**
 * The home page's products section, rendered on the server so the product list
 * never travels to the browser:
 *
 *   on our list   every product we supply, drawn as its pack in the colour of
 *                 its family, brand by brand (each row opens that brand on the
 *                 products page), with a key to the colours
 *   face to face  the jobs for which we stock more than one brand, one at a
 *                 time: the job, its brands either side of a VS, and a link to
 *                 the full comparison; the home page's script turns through them
 */
import { FAMILIES, familyOf, PRODUCTS, type Product } from "./index";
import { brandInfo, brandMark, jobs } from "./brands";
import { packSymbols, packUse } from "./packs";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const two = (n: number) => String(n).padStart(2, "0");
const arrow = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const chev = (d: string) => `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** the families' names, short enough for the key */
const SHORT: Record<string, string> = {
  waterproofing: "Waterproofing",
  admixtures: "Admixtures",
  tiling: "Tiling",
  bonding: "Bonding",
  repair: "Repair",
  grouts: "Grouts",
  site: "Curing and floors",
  walling: "AAC and plaster",
  other: "Other",
};

/** a brand's mark: its first letter on a disc of its colour */
const mono = (name: string) => `<span class="hb-mono" style="--c:${brandMark(name)}" aria-hidden="true">${esc(name.charAt(0))}</span>`;

export function homeBrandsMarkup(all: readonly Product[] = PRODUCTS) {
  const bs = brandInfo(all);
  const js = jobs(all);
  let k = 0;
  const rows = bs
    .map((b) => {
      // grouped by family, in the families' order, so each brand's colours sit together
      const rank = (p: Product) => FAMILIES.findIndex((f) => f.key === p.family);
      const packs = [...b.products]
        .sort((x, y) => rank(x) - rank(y))
        .map((p) => {
          const f = familyOf(p.family);
          return packUse("hbk", p.packs[0]?.shape ?? "pail", ` class="hb-ic" style="--k:${k++};color:${f.tint}"`);
        })
        .join("");
      return `<li><a class="hb-row" href="/products#brand-${b.key}" data-internal aria-label="${esc(`${b.name}: ${b.count} products`)}">
  <span class="hb-who">${mono(b.name)}<span class="hb-name">${esc(b.name)}</span><span class="hb-n">${b.count}</span></span>
  <span class="hb-packs" aria-hidden="true">${packs}</span>
  <span class="hb-go" aria-hidden="true">${arrow}</span>
</a></li>`;
    })
    .join("");
  const fams = FAMILIES.filter((f) => all.some((p) => p.family === f.key))
    .map((f) => `<li><i style="background:${f.tint}"></i>${esc(SHORT[f.key] ?? f.label)}</li>`)
    .join("");
  const slides = js
    .map(
      (j, i) => `<a class="hb-vjob" href="/products#job-${j.key}" data-internal data-vjob${i ? " hidden" : ""}>
  <span class="hb-vjn">${esc(j.name)}</span>
  <span class="hb-vrow" data-n="${j.brands.length}">${j.brands
        .map((b, n) => `${n ? `<span class="hb-vvs" aria-hidden="true">vs</span>` : ""}<span class="hb-vb">${mono(b.name)}<span class="hb-vbn">${esc(b.name)}</span><span class="hb-vbc">${b.products.length}</span></span>`)
        .join("")}</span>
</a>`,
    )
    .join("");
  return `<div class="hb">
  ${packSymbols("hbk")}
  <div class="hb-stock" data-rv>
    <div class="hb-sh"><p class="hb-k">On our list</p><p class="hb-total"><b>${all.length}</b> products from ${bs.length} brands, each drawn as its pack</p></div>
    <ul class="hb-rows">${rows}</ul>
    <ul class="hb-key" aria-label="Colours: the kind of product">${fams}</ul>
  </div>
  <div class="hb-vs" data-vs data-rv>
    <div class="hb-vhead"><p class="hb-k">Same job, different brands</p><p class="hb-vpos" aria-hidden="true"><b data-vpos>01</b> / ${two(js.length)}</p></div>
    <div class="hb-vstage">${slides}</div>
    <div class="hb-vctl">
      <button type="button" class="hb-vbtn" data-vprev aria-label="Previous job" hidden>${chev("M9.8 4 5.8 8l4 4")}</button>
      <span class="hb-vbar" aria-hidden="true"><i data-vbar></i></span>
      <button type="button" class="hb-vbtn" data-vnext aria-label="Next job" hidden>${chev("M6.2 4l4 4-4 4")}</button>
      <a class="hb-vall" href="/products#by-job" data-internal>All ${js.length} jobs${arrow}</a>
    </div>
  </div>
</div>`;
}
