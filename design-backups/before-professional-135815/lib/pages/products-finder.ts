/**
 * The products page's finder: "who makes what" and the list it opens.
 *
 *   grid      every brand against every kind of product, each square the number
 *             of products that brand has of that kind on our list. A square
 *             lists those products; a brand's name lists all of that brand's,
 *             a kind lists that kind from every brand. (On phones the same
 *             choices are two rows of chips.)
 *   search    by name, use or pack size, across the whole list
 *   list      the products in rows, brand by brand: what it is and its packs at
 *             a glance; open a row for what it does, where it is used, who buys
 *             it, the jobs it is part of, its packs drawn to scale, today's rate
 *             and the other brands for the same job
 *   enquiry   products added from their rows ride in a bar at the foot of the
 *             screen, each with its pack and how many, and go to RPC on
 *             WhatsApp as one message
 *
 * Every fact is RPC's spreadsheet's (lib/products); it lists no prices, so
 * rates are asked for. Without scripts every product is listed, each row still
 * opens, and each product keeps its own rate link.
 */
import { FAMILIES, familyOf, rateLink, type Product } from "../products";
import { brandMark, jobOf, type BrandInfo, type JobView } from "../products/brands";
import { cap, fullName, jobsFor, packAmount, shortName, useTerms, usesNote } from "../products/compare";
import { packIcon } from "../products/packs";
import { esc, listing, secHead, type ContactInfo } from "./kit";

const chat = `<svg class="pg-ar" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
const search = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const chev = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const plus = `<svg class="pf-plus" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v9M3.5 8h9" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`;
const tick = `<svg class="pf-tick" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4 6.6 11.4 12.6 4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const lowerFirst = (s: string) => (/^[A-Z][a-z]/.test(s) ? s[0]!.toLowerCase() + s.slice(1) : s);

/** what the search looks through */
const searchText = (p: Product) => [p.brand, p.name, p.category, p.purpose, p.areas, ...p.packs.map((k) => `${k.size} ${k.listed}`)].join(" ").toLowerCase().replace(/\s+/g, " ");

/** a product's packs drawn at sizes that follow their weight or volume (by the cube root, as a container grows) */
function packsToScale(p: Product) {
  const max = Math.max(0, ...p.packs.map((k) => packAmount(k.size) ?? 0));
  return `<ul class="pf-scale" aria-label="Pack sizes">${p.packs
    .map((k) => {
      const q = packAmount(k.size);
      const px = q && max ? 1.6 + 1.9 * Math.cbrt(q / max) : 2.6;
      return `<li style="--px:${px.toFixed(2)}rem">${packIcon(k.shape)}<span>${esc(k.size)}</span></li>`;
    })
    .join("")}</ul>`;
}

/** one product: a row that opens */
function row(p: Product, c: ContactInfo, js: readonly JobView[]) {
  const f = familyOf(p.family);
  const uses = useTerms(p);
  const parts = jobsFor(p.slug);
  const job = jobOf(p, js);
  const cat = p.category === "Construction chemical" ? "Ask us what this one is best used for" : p.category;
  const facts = [
    ["What it does", p.purpose],
    ["Used on", uses.length ? cap(listing(uses)) : usesNote(p)],
    ["Bought by", p.customers],
    parts.length ? ["Part of", parts.map((x) => `${x.job} (${lowerFirst(x.step)})`).join("; ")] : null,
  ].filter((x): x is string[] => Boolean(x && x[1]));
  return `<li class="pf-row" id="${p.slug}" data-family="${p.family}" data-q="${esc(searchText(p))}" style="--tint:${f.tint}">
  <details class="pf-d">
    <summary class="pf-sum">
      <span class="pf-ico">${packIcon(p.packs[0]?.shape ?? "pail")}</span>
      <span class="pf-tx"><span class="pf-name">${esc(shortName(p))}</span><span class="pf-cat">${esc(cat)}</span></span>
      <span class="pf-packs">${p.packs.map((k) => `<span>${esc(k.size)}</span>`).join("")}</span>
      <span class="pf-chev">${chev}</span>
    </summary>
    <div class="pf-open">
      <dl class="pf-facts">${facts.map(([k, v]) => `<div><dt>${esc(k!)}</dt><dd>${esc(v!)}</dd></div>`).join("")}</dl>
      <div class="pf-ofoot">
        ${packsToScale(p)}
        <div class="pf-acts">
          <a class="pf-rate" href="${esc(rateLink(c.whatsapp, [p]))}" target="_blank" rel="noopener noreferrer">${chat}Ask today’s rate</a>
          ${job ? `<a class="pf-alt" href="#job-${job.key}" data-job-go="${job.key}">Compare brands for this job</a>` : ""}
        </div>
      </div>
    </div>
  </details>
  <button type="button" class="pf-add" data-add="${p.slug}" data-label="${esc(fullName(p))}" data-packs="${esc(p.packs.map((k) => k.size).join("|"))}" aria-pressed="false" aria-label="Add ${esc(fullName(p))} to your enquiry" hidden>${plus}${tick}<span>Add</span></button>
</li>`;
}

/** the grid: brands across, kinds down, how many of each */
function grid(bs: readonly BrandInfo[], total: number) {
  const fams = FAMILIES.filter((f) => bs.some((b) => b.products.some((p) => p.family === f.key)));
  const n = (b: BrandInfo, f: string) => b.products.filter((p) => p.family === f).length;
  const max = Math.max(1, ...fams.flatMap((f) => bs.map((b) => n(b, f.key))));
  const head = bs
    .map(
      (b) =>
        `<th scope="col"><button type="button" class="pf-colh" data-pick="${b.key}|all" aria-pressed="false" aria-label="All ${b.count} ${esc(b.name)} products" style="--c:${brandMark(b.name)}"><span>${esc(b.name)}</span><b>${b.count}</b></button></th>`,
    )
    .join("");
  const body = fams
    .map((f) => {
      const all = bs.reduce((s, b) => s + n(b, f.key), 0);
      const cells = bs
        .map((b) => {
          const k = n(b, f.key);
          return `<td data-col="${b.key}">${
            k
              ? `<button type="button" class="pf-cell${k / max > 0.45 ? " is-deep" : ""}" data-pick="${b.key}|${f.key}" aria-pressed="false" aria-label="${k} ${esc(b.name)}: ${esc(f.label.toLowerCase())}" style="--v:${(k / max).toFixed(2)}">${k}</button>`
              : `<span class="pf-none"><span class="sr-only">None</span></span>`
          }</td>`;
        })
        .join("");
      return `<tr data-row="${f.key}"><th scope="row"><button type="button" class="pf-rowh" data-pick="all|${f.key}" aria-pressed="false" aria-label="All ${all} ${esc(f.label.toLowerCase())}" style="--t:${f.tint}"><i aria-hidden="true"></i><span>${esc(f.label)}</span><b>${all}</b></button></th>${cells}</tr>`;
    })
    .join("");
  return `<div class="pf-gridcard">
  <table class="pf-mx">
    <caption class="sr-only">How many products each brand has of each kind. Pick a number to list those products.</caption>
    <thead><tr><td class="pf-corner"><button type="button" class="pf-allbtn" data-pick="all|all" aria-pressed="true">All products <b>${total}</b></button></td>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</div>`;
}

/** the same choices as two rows of chips, for phones */
function chips(bs: readonly BrandInfo[], total: number) {
  const fams = FAMILIES.filter((f) => bs.some((b) => b.products.some((p) => p.family === f.key)));
  const count = (f: string) => bs.reduce((s, b) => s + b.products.filter((p) => p.family === f).length, 0);
  return `<div class="pf-chips" data-chips>
  <div class="pf-chiprow" role="group" aria-label="Brand">
    <button type="button" class="pf-chip" data-chip-brand="all" aria-pressed="true">All brands<span>${total}</span></button>
    ${bs.map((b) => `<button type="button" class="pf-chip" data-chip-brand="${b.key}" aria-pressed="false" style="--c:${brandMark(b.name)}"><i aria-hidden="true"></i>${esc(b.name)}<span>${b.count}</span></button>`).join("")}
  </div>
  <div class="pf-chiprow" role="group" aria-label="Kind of product">
    <button type="button" class="pf-chip" data-chip-fam="all" aria-pressed="true">Every kind</button>
    ${fams.map((f) => `<button type="button" class="pf-chip" data-chip-fam="${f.key}" aria-pressed="false" style="--c:${f.tint}"><i aria-hidden="true"></i>${esc(f.label)}<span data-chip-n>${count(f.key)}</span></button>`).join("")}
  </div>
</div>`;
}

export function finderMarkup(bs: readonly BrandInfo[], c: ContactInfo, js: readonly JobView[], total: number) {
  const lists = bs
    .map(
      (b) => `<section class="pf-brand" id="brand-${b.key}" data-brand="${b.key}" aria-labelledby="pf-h-${b.key}">
  <h3 class="pf-bh" id="pf-h-${b.key}" style="--c:${brandMark(b.name)}"><i aria-hidden="true"></i>${esc(b.name)}<span data-bcount>${b.count} ${b.count === 1 ? "product" : "products"}</span></h3>
  <ul class="pf-rows">${b.products.map((p) => row(p, c, js)).join("")}</ul>
  <button type="button" class="pf-more" data-more hidden>Show all ${b.count} ${esc(b.name)} products</button>
</section>`,
    )
    .join("");
  return `<section class="pg-sec pg-sec--stone pf-sec" id="find" aria-labelledby="pf-title">
  <div class="pg-wrap">
    ${secHead({ label: "Find a product", title: "Who makes what.", id: "pf-title", lede: "Each number is how many products of that kind a brand has on our list. Pick one to see them, or search by name, use or pack size." })}
    <div class="pf">
      <div class="pf-side">${grid(bs, total)}</div>
      <div class="pf-main">
        <label class="pf-search">${search}<span class="sr-only">Search products</span><input type="search" data-search placeholder="Search ${total} products" autocomplete="off" enterkeyhint="search"><button type="button" class="pf-x" data-clear-q aria-label="Clear the search" hidden><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button></label>
        ${chips(bs, total)}
        <div class="pf-state"><p class="pf-status" data-status aria-live="polite">All ${total} products, brand by brand.</p><button type="button" class="pf-clear" data-clear hidden>Show every product</button></div>
        <div class="pf-lists">${lists}</div>
        <p class="pf-empty" data-empty hidden>Nothing on our list matches that. Try a shorter word, or <button type="button" data-clear>show every product</button>.</p>
      </div>
    </div>
  </div>
</section>`;
}

/** the enquiry: what was added, each with its pack and how many (the page's script fills it in) */
export function enquiryMarkup(c: ContactInfo) {
  return `<div class="rl" data-rl data-wa="${esc(c.whatsapp)}" hidden>
  <div class="rl-card" role="region" aria-label="Your enquiry">
    <div class="rl-open" id="rl-open" data-rl-open hidden>
      <ol class="rl-lines" data-rl-lines></ol>
      <div class="rl-foot"><span>Pick the pack and how many. We reply on WhatsApp with today’s rates.</span><button type="button" data-rl-clear>Clear the list</button></div>
    </div>
    <div class="rl-bar">
      <button type="button" class="rl-sum" data-rl-toggle aria-expanded="false" aria-controls="rl-open"><span class="rl-n" data-rl-n>0</span><span>in your enquiry</span>${chev}</button>
      <a class="rl-send" data-rl-send href="${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer">${chat}<span>Ask for these rates</span></a>
    </div>
  </div>
</div>`;
}

export const FINDER_CSS = `
/* the finder: the grid beside the list */
.pf{display:grid;grid-template-columns:minmax(0,38rem) minmax(0,1fr);gap:clamp(1.6rem,3vw,2.6rem);align-items:start}
.pf-side{position:sticky;top:calc(var(--nav-bar,64px) + 1.2rem)}
.pf-gridcard{padding:clamp(.8rem,1.3vw,1.1rem);border-radius:18px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line),0 30px 60px -50px rgba(18,34,59,.55)}
.pf-mx{width:100%;border-collapse:separate;border-spacing:3px;font-size:var(--fs-body)}
.pf-mx th,.pf-mx td{padding:0;text-align:center;vertical-align:middle}
.pf-mx thead th,.pf-mx thead td{vertical-align:bottom}
.pf-mx button{border:0;font:inherit;color:var(--ink);cursor:pointer;transition:background-color .2s,color .2s,opacity .2s,box-shadow .2s}
.pf-mx button:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.pf-allbtn{display:flex;align-items:baseline;gap:.45rem;width:100%;padding:.5rem .55rem;border-radius:10px;background:none;font-weight:600;text-align:left}
.pf-allbtn b{font-weight:500;color:var(--mute);font-variant-numeric:tabular-nums}
.pf-colh{display:flex;flex-direction:column;align-items:center;gap:.1rem;width:100%;padding:.55rem .25rem .45rem;border-radius:10px;background:none;line-height:1.2}
.pf-colh::before{content:"";width:1.4rem;height:4px;margin-bottom:.35rem;border-radius:2px;background:var(--c)}
.pf-colh span{font-weight:600}
.pf-colh b{font-weight:500;color:var(--mute);font-variant-numeric:tabular-nums}
.pf-rowh{display:flex;align-items:center;gap:.55rem;width:100%;min-height:2.6rem;padding:.3rem .55rem;border-radius:10px;background:none;line-height:1.25;text-align:left}
.pf-rowh i{flex:none;width:10px;height:10px;border-radius:3px;background:var(--t)}
.pf-rowh span{min-width:0}
.pf-rowh b{margin-left:auto;padding-left:.4rem;font-weight:500;color:var(--mute);font-variant-numeric:tabular-nums}
.pf-cell{display:grid;place-items:center;width:100%;min-width:2.6rem;height:2.6rem;border-radius:10px;background:rgba(11,110,128,calc(.1 + var(--v) * .62));font-weight:600;font-variant-numeric:tabular-nums}
.pf-cell.is-deep{color:#f5f0e6}
.pf-none{display:block;height:2.6rem;border-radius:10px;background:repeating-linear-gradient(135deg,transparent 0 5px,rgba(18,34,59,.05) 5px 6px)}
.pf-allbtn:hover,.pf-colh:hover,.pf-rowh:hover{background:rgba(18,34,59,.06)}
.pf-cell:hover{box-shadow:inset 0 0 0 2px var(--navy)}
.pf-mx .pf-cell:disabled{background:transparent;box-shadow:inset 0 0 0 1px var(--line);color:rgba(18,34,59,.32);cursor:default}
.pf-mx [aria-pressed="true"]{background:var(--navy);color:#f5f0e6}
.pf-mx [aria-pressed="true"] b{color:rgba(245,240,230,.72)}
.pf-mx .pf-colh[aria-pressed="true"]::before{background:#4cc9d9}
/* what is outside the choice steps back */
.pf-mx.is-narrow .pf-cell:not(.is-in){opacity:.28}
.pf-mx .is-row .pf-rowh,.pf-mx .is-col .pf-colh{box-shadow:inset 0 0 0 1.5px rgba(18,34,59,.28)}

/* the list */
.pf-main{min-width:0;container-type:inline-size}
.pf-search{display:flex;align-items:center;gap:.7rem;height:3.5rem;padding:0 1.1rem;border-radius:14px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line),0 20px 40px -36px rgba(18,34,59,.6)}
.pf-search:focus-within{outline:2px solid var(--accent);outline-offset:2px}
.pf-search svg{flex:none;width:1.3rem;height:1.3rem;color:var(--mute)}
.pf-search input{flex:1;min-width:0;border:0;background:none;font:inherit;font-size:var(--fs-sub);color:var(--ink);outline:none}
.pf-search input::placeholder{color:var(--mute);opacity:1}
.pg .pf-search input:focus-visible{outline:none}
.pf-search input::-webkit-search-cancel-button{-webkit-appearance:none;appearance:none}
.pf-x{display:grid;place-items:center;flex:none;width:2.2rem;height:2.2rem;margin-right:-.5rem;border:0;border-radius:8px;background:none;color:var(--mute);cursor:pointer}
.pf-x[hidden]{display:none}
.pf-x:hover{background:rgba(18,34,59,.06);color:var(--ink)}
.pf-x svg{width:15px;height:15px}
.pf-chips{display:none}
.pf-state{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.4rem 1rem;margin:1.1rem 0 .9rem}
.pf-status{margin:0;font-size:var(--fs-body);font-weight:600;color:var(--ink)}
.pf-clear,.pf-empty button{padding:0;border:0;border-bottom:1px solid currentColor;background:none;font:inherit;font-size:var(--fs-body);font-weight:600;color:var(--accent);cursor:pointer}
.pf-clear[hidden]{display:none}
.pf-brand + .pf-brand{margin-top:1.7rem}
.pf-brand[hidden]{display:none}
.pf-bh{display:flex;align-items:center;gap:.6rem;margin:0 0 .65rem;font-family:var(--display);font-size:var(--fs-sub);font-weight:600;line-height:1.2;letter-spacing:-.01em;scroll-margin-top:calc(var(--nav-bar,64px) + 1.4rem)}
.pf-bh i{flex:none;width:.55rem;height:1.3rem;border-radius:3px;background:var(--c)}
.pf-bh span{margin-left:.2rem;font-family:var(--sans);font-size:var(--fs-body);font-weight:500;letter-spacing:0;color:var(--mute)}
.pf-rows{margin:0;padding:0;list-style:none;border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);overflow:hidden}
.pf-row{position:relative;border-top:1px solid var(--line);scroll-margin-top:calc(var(--nav-bar,64px) + 1.4rem)}
.pf-row:first-child{border-top:0}
.pf-row[hidden]{display:none}
.pf-row.is-hit{animation:pf-hit 2.2s ease}
@keyframes pf-hit{0%,45%{background:rgba(76,201,217,.16)}100%{background:transparent}}
.pf-sum{position:relative;display:grid;grid-template-columns:2.6rem minmax(0,1fr) auto;align-items:center;gap:.35rem 1rem;padding:.8rem 8.8rem .8rem .9rem;list-style:none;cursor:pointer;transition:background-color .2s}
.pf-sum::-webkit-details-marker{display:none}
.pf-sum::marker{content:""}
.pf-sum:hover{background:rgba(18,34,59,.03)}
.pf-sum:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}
.pf-ico{display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:10px;background:color-mix(in srgb,var(--tint) 13%,transparent);color:var(--tint)}
.pf-ico svg{width:1.45rem;height:1.45rem}
.pf-tx{display:flex;flex-direction:column;min-width:0}
.pf-name{font-size:var(--fs-body);font-weight:600;line-height:1.35}
.pf-cat{font-size:var(--fs-body);line-height:1.4;color:var(--mute)}
.pf-packs{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:.3rem}
.pf-packs span{display:inline-flex;align-items:center;height:1.85rem;padding:0 .6rem;border-radius:7px;background:var(--sand);font-size:var(--fs-body);font-weight:500;white-space:nowrap}
.pf-chev{position:absolute;top:1.35rem;right:1rem;display:grid;place-items:center;width:1.5rem;height:1.5rem;color:var(--mute);transition:transform .25s}
.pf-chev svg{width:15px;height:15px}
.pf-d[open] .pf-chev{transform:rotate(180deg)}
.pf-d[open] .pf-sum{background:rgba(39,86,160,.05)}
.pf-add{position:absolute;top:1.05rem;right:3.1rem;display:inline-flex;align-items:center;gap:.3rem;height:2.1rem;padding:0 .8rem 0 .6rem;border:0;border-radius:999px;background:var(--card);box-shadow:inset 0 0 0 1px rgba(18,34,59,.22);font:inherit;font-size:var(--fs-body);font-weight:600;line-height:1;color:var(--ink);cursor:pointer;transition:background-color .2s,color .2s,box-shadow .2s}
.pf-add[hidden]{display:none}
.pf-add svg{width:14px;height:14px}
.pf-add .pf-tick,.pf-add.is-on .pf-plus{display:none}
.pf-add.is-on .pf-tick{display:block}
.pf-add:hover{box-shadow:inset 0 0 0 1.5px var(--navy)}
.pf-add.is-on{background:var(--navy);box-shadow:none;color:#f5f0e6}
.pf-add:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pf-open{padding:.2rem 1.1rem 1.2rem calc(.9rem + 2.6rem + 1rem)}
.pf-facts{margin:0}
.pf-facts div{display:grid;grid-template-columns:7.4rem minmax(0,1fr);gap:.2rem 1rem;padding:.55rem 0;border-top:1px solid var(--line)}
.pf-facts div:first-child{border-top:0}
.pf-facts dt{font-size:var(--fs-body);color:var(--mute)}
.pf-facts dd{margin:0;font-size:var(--fs-body);line-height:1.5}
.pf-ofoot{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1rem 1.4rem;margin-top:.6rem;padding-top:.9rem;border-top:1px solid var(--line)}
.pf-scale{display:flex;align-items:flex-end;gap:.4rem 1.2rem;margin:0;padding:0;list-style:none}
.pf-scale li{display:flex;flex-direction:column;align-items:flex-start;gap:.2rem;font-size:var(--fs-body);font-weight:500;white-space:nowrap}
.pf-scale svg{width:var(--px,2.4rem);height:var(--px,2.4rem);color:var(--tint)}
.pf-acts{display:flex;flex-wrap:wrap;gap:.5rem}
.pf-rate,.pf-alt{display:inline-flex;align-items:center;gap:.45rem;height:2.4rem;padding:0 .9rem;border-radius:9px;font-size:var(--fs-body);font-weight:600;text-decoration:none;white-space:nowrap;transition:background-color .2s,color .2s,box-shadow .2s}
.pf-rate{background:rgba(37,211,102,.12);box-shadow:inset 0 0 0 1px rgba(18,140,75,.32);color:#128c4b}
.pf-rate:hover{background:#25d366;box-shadow:none;color:#fff}
.pf-rate .pg-ar{width:1.05rem;height:1.05rem}
.pf-alt{box-shadow:inset 0 0 0 1px rgba(18,34,59,.22);color:var(--ink)}
.pf-alt:hover{box-shadow:inset 0 0 0 1.5px var(--navy)}
.pf-rate:focus-visible,.pf-alt:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pf-more{display:flex;align-items:center;justify-content:center;width:100%;height:3rem;margin-top:.6rem;border:0;border-radius:12px;background:transparent;box-shadow:inset 0 0 0 1.5px rgba(18,34,59,.2);font:inherit;font-size:var(--fs-body);font-weight:600;color:var(--ink);cursor:pointer;transition:box-shadow .2s,background-color .2s}
.pf-more:hover{box-shadow:inset 0 0 0 1.5px var(--navy)}
.pf-more:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.pf-more[hidden]{display:none}
.pf-empty{margin:1.4rem 0 0;font-size:var(--fs-body);color:var(--mute)}

/* a narrow list: the packs go under the name */
@container (max-width:36rem){
  .pf-sum{grid-template-columns:2.6rem minmax(0,1fr);padding-right:7.4rem}
  .pf-packs{grid-column:2;grid-row:2;justify-content:flex-start}
  .pf-chev{right:.75rem}
  .pf-add{right:2.6rem}
  .pf-open{padding-left:.9rem;padding-right:.9rem}
  .pf-facts div{grid-template-columns:minmax(0,1fr);gap:.1rem}
}

/* the enquiry, floating at the foot of the screen */
.rl{position:fixed;left:50%;bottom:max(1rem,env(safe-area-inset-bottom));z-index:36;width:min(38rem,calc(100vw - 2 * var(--gutter,1rem)));transform:translateX(-50%);animation:rl-in .4s cubic-bezier(.2,.8,.2,1)}
.rl[hidden]{display:none}
@keyframes rl-in{from{opacity:0;transform:translate(-50%,16px)}}
.rl-card{overflow:hidden;border-radius:16px;background:var(--navy);color:#f5f0e6;box-shadow:0 26px 50px -24px rgba(4,12,30,.75),0 0 0 1px rgba(255,255,255,.06)}
.rl-bar{display:flex;align-items:center;gap:.45rem;padding:.45rem}
.rl-sum{display:flex;flex:1;align-items:center;gap:.6rem;min-width:0;height:2.8rem;padding:0 .7rem 0 .45rem;border:0;border-radius:11px;background:transparent;color:inherit;font:inherit;font-size:var(--fs-body);font-weight:500;text-align:left;white-space:nowrap;cursor:pointer;transition:background-color .2s}
.rl-sum:hover{background:rgba(255,255,255,.07)}
.rl-sum svg{width:15px;height:15px;margin-left:auto;opacity:.7;transform:rotate(180deg);transition:transform .3s}
.rl-sum[aria-expanded="true"] svg{transform:none}
.rl-n{display:grid;place-items:center;flex:none;min-width:1.85rem;height:1.85rem;padding:0 .45rem;border-radius:999px;background:#4cc9d9;color:var(--navy);font-weight:700;font-variant-numeric:tabular-nums;transition:transform .3s cubic-bezier(.3,1.6,.5,1)}
.rl-n.is-bump{transform:scale(1.22)}
.rl-send{display:inline-flex;align-items:center;gap:.45rem;flex:none;height:2.8rem;padding:0 1.1rem;border-radius:11px;background:#25d366;color:#06301a;font-size:var(--fs-body);font-weight:600;text-decoration:none;white-space:nowrap;transition:background-color .2s}
.rl-send:hover{background:#1fbd5a}
.rl-send .pg-ar{width:1.1rem;height:1.1rem}
.rl-card button:focus-visible,.rl-card select:focus-visible,.rl-card input:focus-visible,.rl-send:focus-visible{outline:2px solid #4cc9d9;outline-offset:2px}
.rl-open{padding:.5rem .5rem 0}
.rl-open[hidden]{display:none}
.rl-lines{display:grid;gap:3px;max-height:min(21rem,46svh);margin:0;padding:0;overflow:auto;overscroll-behavior:contain;list-style:none}
.rl-lines li{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.4rem .8rem;padding:.45rem .45rem .45rem .85rem;border-radius:11px;background:rgba(255,255,255,.06);font-size:var(--fs-body);line-height:1.35}
.rl-name{flex:1 1 12rem;min-width:0}
.rl-ctl{display:flex;align-items:center;gap:.35rem}
.rl-pack{height:2.2rem;padding:0 1.9rem 0 .65rem;border:0;border-radius:8px;background:rgba(255,255,255,.1) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23f5f0e6' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right .55rem center/12px;font:inherit;font-size:var(--fs-body);color:#f5f0e6;appearance:none;cursor:pointer}
.rl-pack option{color:#121314;background:#fff}
.rl-onepack{padding:0 .4rem;color:rgba(245,240,230,.75)}
.rl-qty{display:flex;align-items:center;height:2.2rem;border-radius:8px;background:rgba(255,255,255,.1)}
.rl-qty button{display:grid;place-items:center;width:2.1rem;height:2.2rem;border:0;background:none;color:inherit;font:inherit;font-size:1.1rem;line-height:1;cursor:pointer;border-radius:8px}
.rl-qty button:hover{background:rgba(255,255,255,.1)}
.rl-qty input{width:2.6rem;height:2.2rem;border:0;background:none;font:inherit;font-size:var(--fs-body);font-weight:600;color:#f5f0e6;text-align:center;-moz-appearance:textfield}
.rl-qty input::-webkit-outer-spin-button,.rl-qty input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
.rl-rm{display:grid;place-items:center;width:2.2rem;height:2.2rem;border:0;border-radius:8px;background:transparent;color:inherit;cursor:pointer;opacity:.7;transition:background-color .2s,opacity .2s}
.rl-rm:hover{background:rgba(255,255,255,.1);opacity:1}
.rl-rm svg{width:14px;height:14px}
.rl-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.3rem 1rem;padding:.65rem .35rem .2rem .45rem;font-size:var(--fs-body);color:rgba(245,240,230,.7)}
.rl-foot button{height:2.2rem;padding:0 .4rem;border:0;background:none;font:inherit;font-size:var(--fs-body);font-weight:600;color:#4cc9d9;cursor:pointer}

@media (max-width:1199px){
  .pf{grid-template-columns:minmax(0,1fr)}
  .pf-side{position:static}
}
@media (max-width:699px){
  /* phones: the grid becomes two rows of chips above the list */
  .pf-side{display:none}
  .pf-chips{display:flex;flex-direction:column;gap:.45rem;margin-top:.8rem}
  .pf-chiprow{display:flex;gap:.4rem;overflow-x:auto;margin-inline:calc(-1 * var(--gutter,16px));padding:0 var(--gutter,16px) 2px;scrollbar-width:none}
  .pf-chiprow::-webkit-scrollbar{display:none}
  .pf-chip{display:inline-flex;flex:none;align-items:center;gap:.45rem;height:2.4rem;padding:0 .85rem;border:0;border-radius:999px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line);font:inherit;font-size:var(--fs-body);font-weight:500;color:var(--ink);white-space:nowrap;cursor:pointer}
  .pf-chip i{width:9px;height:9px;border-radius:3px;background:var(--c)}
  .pf-chip span{color:var(--mute);font-variant-numeric:tabular-nums}
  .pf-chip[aria-pressed="true"]{background:var(--navy);box-shadow:none;color:#f5f0e6}
  .pf-chip[aria-pressed="true"] span{color:rgba(245,240,230,.72)}
  .pf-chip[data-empty]{opacity:.45}
  .pf-chip:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
  .pf-search{height:3.2rem}
  .pf-search input{font-size:var(--fs-body)}
  .pf-sum{padding:.75rem 6.9rem .75rem .8rem;column-gap:.75rem}
  .pf-add{top:1rem;right:2.4rem;padding:0 .7rem 0 .5rem}
  .pf-chev{top:1.3rem;right:.6rem}
  .pf-ofoot{flex-direction:column;align-items:flex-start}
  .rl-send span{display:none}
  .rl-send{width:2.8rem;padding:0;justify-content:center}
  .rl-send .pg-ar{width:1.25rem;height:1.25rem}
}
`;
