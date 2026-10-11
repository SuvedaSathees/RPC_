/**
 * The home page's products section: three pairs from RPC's list, each set side
 * by side in the seam (a short version: type, uses and packs), with tabs to
 * move between them and a link that opens the pair on the products page.
 * Rendered on the server; the browser only switches tabs and plays films.
 */
import { productBySlug, type Product } from "../products";
import { productParts, productRows, productSide } from "./products-seam";
import { seamPreview, seamRows, type SeamSide } from "./seam";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** the pairs, each with the question it answers */
const PAIRS = [
  { tab: "Two Brushbond coats", a: "fosroc-brushbond-grey", b: "fosroc-brushbond-rfx-grey" },
  { tab: "Two brands, one job", a: "fosroc-nitocote-cm210-white", b: "sika-seal-551" },
  { tab: "In the concrete, or on it?", a: "fosroc-conplast-wl-xtra", b: "sika-seal-550" },
] as const;

const head = (side: "a" | "b", s: SeamSide) => `<div class="cx-head cx-head--${side}">
  <span class="cx-ab" aria-hidden="true">${side.toUpperCase()}</span>
  <div class="cx-pick cx-pick--static"><div class="cx-pv">${seamPreview(s)}</div></div>
  <p class="cx-sub">${esc(s.sub)}</p>
</div>`;

function panel(i: number, a: Product, b: Product, whatsapp: string) {
  const parts = productParts(a, b, whatsapp);
  const rows = productRows(a, b, whatsapp).filter((r) => r.k === "Used on" || r.k === "Packs");
  return `<div class="hp-panel" role="tabpanel" id="hp-${i}" aria-labelledby="hp-t${i}"${i ? " hidden" : ""}>
  <div class="cx cx--mini">
    <div class="cx-stage">
      ${head("a", productSide(a))}
      <div class="cx-mid"><span class="cx-vs" aria-hidden="true">vs</span></div>
      ${head("b", productSide(b))}
      <div class="cx-mediawrap">${parts.media}</div>
      <div class="cx-verdict">${parts.verdict}</div>
    </div>
    <div class="cx-sheet">${seamRows(rows)}</div>
    <div class="cx-foot"><a class="hp-open" href="/products#vs=${a.slug},${b.slug}" data-internal>Open this pair in the full comparison<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>
  </div>
</div>`;
}

/** the tabs and the three pairs, as HTML */
export function homeTeaserMarkup(whatsapp: string) {
  const pairs = PAIRS.map((p) => ({ ...p, pa: productBySlug(p.a), pb: productBySlug(p.b) })).filter(
    (p): p is (typeof p) & { pa: Product; pb: Product } => Boolean(p.pa && p.pb),
  );
  const tabs = pairs
    .map((p, i) => `<button type="button" role="tab" class="hp-tab" id="hp-t${i}" aria-controls="hp-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(p.tab)}</button>`)
    .join("");
  return `<div class="hp" data-hp>
  <div class="hp-tabs" role="tablist" aria-label="Example pairs">${tabs}</div>
  ${pairs.map((p, i) => panel(i, p.pa, p.pb, whatsapp)).join("")}
</div>`;
}
