/**
 * A line drawing of each kind of pack (bag, kit, pail, can, drum, roll, …),
 * for the products page, the comparisons and the home page's stock chart.
 */
/** the drawings, on a 24 × 24 grid, stroked in the current colour */
export const PACK_DRAWINGS: Record<string, string> = {
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

const attrs = `viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;

/** one pack, drawn inline */
export const packIcon = (shape: string) => `<svg ${attrs}>${PACK_DRAWINGS[shape] ?? PACK_DRAWINGS.bag}</svg>`;

/** every drawing once, as symbols to <use> (for pages that draw many packs) */
export const packSymbols = (prefix: string) =>
  `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${Object.entries(PACK_DRAWINGS)
    .map(([k, d]) => `<symbol id="${prefix}-${k}" viewBox="0 0 24 24">${d}</symbol>`)
    .join("")}</svg>`;
/** one pack, drawn from the symbols */
export const packUse = (prefix: string, shape: string, extra = "") =>
  `<svg ${attrs}${extra}><use href="#${prefix}-${shape in PACK_DRAWINGS ? shape : "bag"}"/></svg>`;
