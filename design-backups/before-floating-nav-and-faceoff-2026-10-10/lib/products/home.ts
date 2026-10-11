/**
 * The home page's products section: the six brands RPC supplies, each with
 * how many of its products are on the list and what they are for, and one job
 * for which we stock more than one brand. Rendered on the server, so the
 * product list never travels to the browser.
 */
import { PRODUCTS, type Product } from "./index";
import { brandInfo, jobs } from "./brands";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const arrow = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export function homeBrandsMarkup(all: readonly Product[] = PRODUCTS) {
  const bs = brandInfo(all);
  const job = jobs(all)[0];
  const tiles = bs
    .map(
      (b) => `<li><a class="hb-b" href="/products#brand-${b.key}" data-internal>
  <span class="hb-top"><span class="hb-name">${esc(b.name)}</span><span class="hb-n"><b>${b.count}</b> ${b.count === 1 ? "product" : "products"}</span></span>
  <span class="hb-bar" aria-hidden="true">${b.families.map((f) => `<i style="flex:${f.count};background:${f.tint}"></i>`).join("")}</span>
  <span class="hb-fam">${esc(b.families[0]?.label ?? "")}${b.families.length > 1 ? ` and ${b.families.length - 1} more` : ""}</span>
</a></li>`,
    )
    .join("");
  const compare = job
    ? `<a class="hb-job" href="/products#job-${job.key}" data-internal>
  <span class="hb-jk">Same job, different brands</span>
  <span class="hb-jn">${esc(job.name)}</span>
  <span class="hb-jb">${job.brands.map((b) => `<span>${esc(b.name)} ${b.products.length}</span>`).join("")}</span>
  <span class="hb-go" aria-hidden="true">${arrow}</span>
</a>`
    : "";
  return `<div class="hb"><ul class="hb-brands" aria-label="Brands we supply">${tiles}</ul>${compare}</div>`;
}
