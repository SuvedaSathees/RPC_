/**
 * The rows of the waterproofing page's "two methods, side by side" table.
 * Shared by the page's markup (the first pair) and its behaviour in the browser
 * (every pair after that), so both draw the table the same way. Kept free of
 * other imports so the browser only loads these few lines.
 */
export interface CmpMethod {
  key: string;
  short: string;
  kind: string;
  applied: string;
  areas: string;
  how: string;
  good: string;
  mind: string;
  products: readonly { slug: string; name: string }[];
}

type RowKey = "kind" | "applied" | "areas" | "how" | "good" | "mind" | "products";
export const CMP_ROWS: readonly (readonly [RowKey, string])[] = [
  ["kind", "Kind"],
  ["applied", "Goes on"],
  ["areas", "Main areas"],
  ["how", "How it works"],
  ["good", "Good to know"],
  ["mind", "Keep in mind"],
  ["products", "On our product list"],
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function value(m: CmpMethod, k: RowKey) {
  if (k !== "products") return esc(m[k]);
  return m.products.length
    ? `<span class="wpx-prods">${m.products.map((p) => `<a href="/products#${esc(p.slug)}" data-internal>${esc(p.name)}</a>`).join("")}</span>`
    : `<span class="wpx-none">None on our list yet</span>`;
}

/** the table's rows for methods a and b; a row where both say the same thing is said once, marked "Both" */
export function compareRowsHtml(a: CmpMethod, b: CmpMethod) {
  return CMP_ROWS.map(([k, label]) => {
    const va = value(a, k);
    const vb = value(b, k);
    const cells =
      va === vb
        ? `<span class="wpx-cell wpx-cell--both" role="cell"><span class="wpx-both">Both</span>${va}</span>`
        : `<span class="wpx-cell" role="cell" data-side="a">${va}</span><span class="wpx-cell" role="cell" data-side="b">${vb}</span>`;
    return `<div class="wpx-row" role="row"><span class="wpx-rh" role="rowheader">${label}</span>${cells}</div>`;
  }).join("");
}
