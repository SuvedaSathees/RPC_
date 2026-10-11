/**
 * Two products in the seam (see seam.ts): the parts of the comparison that
 * change when a side changes, worked out from the spreadsheet (via
 * lib/products/compare.ts). Shared by the server render and the browser.
 */
import { familyOf, rateLink, type Product } from "../products";
import { cap, fullName, jobsFor, kindOf, packAmount, productVerdict, shortName, useTerms, usesNote } from "../products/compare";
import { seamMedia, seamPreview, seamRows, seamVerdict, type SeamRow, type SeamSide } from "./seam";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ------------------------------------------------------------ packs */

/** a line drawing of each kind of pack */
const PACK_ICON: Record<string, string> = {
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
export const packIcon = (shape: string, cls = "") =>
  `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${PACK_ICON[shape] ?? PACK_ICON.bag}</svg>`;
/** the size as the sheet gives it (the drawing shows the kind of pack) */
const packLabel = (size: string) => size;

/**
 * Each side's packs, drawn at sizes that follow their weight or volume (by
 * the cube root, as a real container grows) against the largest of the two
 * products' packs, so a 1 kg pouch reads small beside a 25 kg bag.
 */
function packsCell(p: Product, max: number) {
  const items = p.packs
    .map((k) => {
      const q = packAmount(k.size);
      const px = q && max ? 1.5 + 3.2 * Math.cbrt(q / max) : 2.6;
      return `<li class="cx-pack" style="--px:${px.toFixed(2)}rem">${packIcon(k.shape)}<span>${esc(packLabel(k.size))}</span></li>`;
    })
    .join("");
  return `<ul class="cx-packs" aria-label="Pack sizes">${items}</ul>`;
}

/* ------------------------------------------------------------ the parts */

export const productSide = (p: Product): SeamSide => ({ kicker: p.brand, name: shortName(p), sub: p.category });

const chat = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

/**
 * The jobs (from the systems) each product is part of. A job both are in
 * moves to the seam, saying whether they are alternatives for the same step
 * or two steps of the same job; the rest stay on their sides.
 */
function jobsRow(a: Product, b: Product): SeamRow | null {
  const ja = jobsFor(a.slug);
  const jb = jobsFor(b.slug);
  if (!ja.length && !jb.length) return null;
  const names = (xs: { job: string }[]) => [...new Set(xs.map((x) => x.job))];
  const shared = names(ja).filter((j) => jb.some((x) => x.job === j));
  const line = (j: string) => {
    const sa = ja.filter((x) => x.job === j).map((x) => x.step.toLowerCase());
    const sb = jb.filter((x) => x.job === j).map((x) => x.step.toLowerCase());
    const same = sa.some((x) => sb.includes(x));
    return same ? `${j}: either can be the ${sa.find((x) => sb.includes(x))}` : `${j}: ${sa[0]} (A), then ${sb[0]} (B)`;
  };
  const side = (xs: { job: string; step: string }[]) => xs.filter((x) => !shared.includes(x.job)).map((x) => `${x.job}: ${x.step.toLowerCase()}`);
  const onlyA = side(ja);
  const onlyB = side(jb);
  const chipsOf = (xs: string[], cls: string) => `<ul class="cx-chips ${cls}">${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const mid = shared.length ? `<p class="cx-vh cx-vh--both">Both</p>${chipsOf(shared.map(line), "cx-chips--both")}` : `<p class="cx-none">No job in common</p>`;
  if (!onlyA.length && !onlyB.length) return { t: "html", k: "Part of these jobs", a: "", b: "", same: chipsOf(shared.map(line), "cx-chips--both") };
  const cell = (xs: string[], who: string) => (xs.length ? `<p class="cx-vh">Only ${who}</p>${chipsOf(xs, `cx-chips--${who.toLowerCase()}`)}` : `<p class="cx-vh">Only ${who}</p><p class="cx-none">Nothing else listed</p>`);
  return { t: "html", k: "Part of these jobs", a: cell(onlyA, "A"), b: cell(onlyB, "B"), mid };
}

/** the rows, from the sheet: what it is, what it does, where it is used, packs, who buys it, the jobs it is part of, and its rate */
export function productRows(a: Product, b: Product, whatsapp: string): SeamRow[] {
  const amounts = [...a.packs, ...b.packs].map((k) => packAmount(k.size) ?? 0);
  const max = Math.max(0, ...amounts);
  const sameSizes = a.packs.map((k) => `${k.size}|${k.shape}`).join() === b.packs.map((k) => `${k.size}|${k.shape}`).join();
  const rows: SeamRow[] = [
    { t: "text", k: "Type", a: esc(a.category), b: esc(b.category) },
    { t: "text", k: "What it does", a: esc(a.purpose), b: esc(b.purpose) },
    {
      t: "venn",
      k: "Used on",
      a: useTerms(a).map(cap),
      b: useTerms(b).map(cap),
      noteA: usesNote(a) || undefined,
      noteB: usesNote(b) || undefined,
      empty: "Nothing listed for both",
    },
    { t: "html", k: "Packs", a: packsCell(a, max), b: packsCell(b, max), same: sameSizes ? packsCell(a, max) : undefined },
    { t: "text", k: "Who it is for", a: esc(a.customers), b: esc(b.customers) },
  ];
  const jr = jobsRow(a, b);
  if (jr) rows.push(jr);
  rows.push({
    t: "html",
    k: "Today's rate",
    a: `<div class="cx-links"><a href="${esc(rateLink(whatsapp, [a]))}" target="_blank" rel="noopener noreferrer">${chat}<span class="cx-rl">Ask for ${esc(fullName(a))}</span><span class="cx-rs">Ask for its rate</span></a></div>`,
    b: `<div class="cx-links"><a href="${esc(rateLink(whatsapp, [b]))}" target="_blank" rel="noopener noreferrer">${chat}<span class="cx-rl">Ask for ${esc(fullName(b))}</span><span class="cx-rs">Ask for its rate</span></a></div>`,
  });
  return rows;
}

/** the parts that change with the two sides */
export function productParts(a: Product, b: Product, whatsapp: string) {
  const v = productVerdict(a, b);
  const fall = (p: Product) => ({
    key: kindOf(p)?.media ?? null,
    fallback: kindOf(p) ? "Picture on its way" : p.category === "Construction chemical" ? "Ask us what this one is best used for" : p.category,
    icon: kindOf(p) ? undefined : packIcon(p.packs[0]?.shape ?? "pail"),
  });
  return {
    previewA: seamPreview(productSide(a)),
    previewB: seamPreview(productSide(b)),
    subA: a.category,
    subB: b.category,
    media: seamMedia(fall(a), fall(b), ""),
    verdict: seamVerdict(v.lead, v.more),
    sheet: seamRows(productRows(a, b, whatsapp)),
    both: rateLink(whatsapp, a.slug === b.slug ? [a] : [a, b]),
    title: `${fullName(a)} vs ${fullName(b)}`,
    family: familyOf(a.family).label,
  };
}
