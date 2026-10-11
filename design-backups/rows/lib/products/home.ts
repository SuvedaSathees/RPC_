/**
 * The home page's products section, rendered on the server so the product list
 * never travels to the browser: the products, layer by layer.
 *
 * Pick a job (a bathroom floor, a terrace, a tank, a basement, a concrete
 * repair, an AAC wall) and it is shown as a rendered cut-away block, each
 * layer stepped back so it shows, from the slab at the bottom to the finish on
 * top, with a number on every layer we supply; beside it, the same numbers with what each
 * layer does and the products on our list that do it. Which products go in
 * which layer comes from the "systems" in lib/products (built only from what
 * RPC's spreadsheet says each product is for). The brands themselves are in
 * the home page's opening (the hero).
 */
import { productBySlug, SYSTEMS, type Product, PRODUCTS } from "./index";
import { brandMark } from "./brands";
import { shortName } from "./compare";
import { LAYER_ART_SIZE, LAYER_PINS } from "./layer-art";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ------------------------------------------------------------ the picture */

/** the jobs shown, in order (each has a rendered cut-away, see layer-art.ts) */
const JOBS = ["bathroom", "terrace", "tank", "basement", "repair", "aac"] as const;

/** a job's rendered cut-away, with its layers' numbers laid over it */
function picture(key: string, line: string, numberOf: (layer: string) => number) {
  const pins = (LAYER_PINS[key] ?? [])
    .map((m) => `<span class="hl-pin" data-layer="${m.layer}" style="left:${m.x}%;top:${m.y}%" aria-hidden="true">${numberOf(m.layer)}</span>`)
    .join("");
  return `<div class="hl-pic"><img src="/images/layers/${key}.webp" width="${LAYER_ART_SIZE.w}" height="${LAYER_ART_SIZE.h}" alt="${esc(line)}, shown as a cut-away with each layer stepped back" loading="lazy" decoding="async">${pins}</div>`;
}

/* ------------------------------------------------------------ the words */

const chev = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** a layer's products, brand by brand: the brand, then its products' names */
function byBrand(ps: readonly Product[]) {
  const brands = [...new Set(ps.map((p) => p.brand))];
  return `<dl class="hl-brands">${brands
    .map(
      (b) =>
        `<div><dt><i style="--c:${brandMark(b)}" aria-hidden="true"></i>${esc(b)}</dt><dd>${ps
          .filter((p) => p.brand === b)
          .map((p) => `<a href="/products#${p.slug}" data-internal>${esc(shortName(p))}</a>`)
          .join("")}</dd></div>`,
    )
    .join("")}</dl>`;
}

export function homeLayersMarkup(all: readonly Product[] = PRODUCTS) {
  const jobs = JOBS.map((k) => SYSTEMS.find((s) => s.key === k)).filter((s): s is (typeof SYSTEMS)[number] => Boolean(s)).map((s) => ({ s }));
  const tabs = jobs
    .map(
      ({ s }, i) =>
        `<button type="button" role="tab" class="hl-tab" id="hl-t-${s.key}" aria-controls="hl-p-${s.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-hl-tab="${s.key}">${esc(s.name)}</button>`,
    )
    .join("");
  const panels = jobs
    .map(({ s }, i) => {
      const order = s.layers.map((l) => l.key);
      const numberOf = (layer: string) => order.indexOf(layer) + 1;
      const rows = s.layers
        .map((l, k) => {
          const ps = l.products.map((slug) => productBySlug(slug)).filter((p): p is Product => Boolean(p) && all.includes(p!));
          return `<li class="hl-row" data-layer="${l.key}">
  <details class="hl-d" name="hl-${s.key}"${k === 0 ? " open" : ""}>
    <summary class="hl-sum">
      <span class="hl-n" aria-hidden="true">${k + 1}</span>
      <span class="hl-tx"><span class="hl-name"><span class="hl-vh">Layer ${k + 1}: </span>${esc(l.name)}</span><span class="hl-what">${esc(l.note)}</span></span>
      <span class="hl-count">${ps.length} ${ps.length === 1 ? "product" : "products"}</span>
      <span class="hl-chev">${chev}</span>
    </summary>
    ${byBrand(ps)}
  </details>
</li>`;
        })
        .join("");
      return `<div class="hl-panel${i === 0 ? " is-on" : ""}" role="tabpanel" id="hl-p-${s.key}" aria-labelledby="hl-t-${s.key}" data-hl-panel="${s.key}"${i === 0 ? "" : " hidden"}>
  <figure class="hl-art">${picture(s.key, s.line, numberOf)}<figcaption>${esc(s.line)}, bottom to top in the order the layers go on.</figcaption></figure>
  <ol class="hl-list">${rows}</ol>
</div>`;
    })
    .join("");
  return `<div class="hl" data-hl>
  <div class="hl-card">
    <div class="hl-jobs" role="tablist" aria-label="Jobs">${tabs}</div>
    ${panels}
  </div>
  <p class="hl-fine">A guide from our product list. The right system for your building is confirmed at the free inspection.</p>
</div>`;
}
