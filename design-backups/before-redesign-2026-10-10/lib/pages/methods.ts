/**
 * Waterproofing methods page: the twelve methods from RPC's methods document,
 * two at a time.
 *
 *   opening    what is here, in a line
 *   compare    the seam (lib/compare): pick two methods and see them side by
 *              side, each with a film of it going on (made with AI, labelled)
 *   twelve     every method as a picture, by kind; "where is the water getting
 *              in?" marks the ones worth considering for a place
 *   table      all twelve against the places they are used
 *   brands     the document's brands worth comparing, and how to choose
 *   close      the ways to start
 *
 * Links to /waterproofing#m-<key> open that method in the comparison.
 */
import { methodParts, methodSide } from "../compare/methods-seam";
import { seamHead, swapIcon, SEAM_CSS } from "../compare/seam";
import { MEDIA, mediaReady, mediaSrcSmall } from "../media/catalog";
import { BRANDS_BY_JOB, CHOOSING, METHOD_GROUPS, METHODS, PLACES, ZONES, type Method } from "../methods/data";
import type { Product } from "../products";
import { arrow, crumbs, ctaBand, esc, secHead, type ContactInfo, type PageOptions } from "./kit";

export interface MethodsData {
  products: readonly Product[];
  contact: ContactInfo;
}

export const METHODS_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Waterproofing methods", href: "/waterproofing" },
] as const;

/** the pair the page opens on: the two most homes choose between for a bathroom or a balcony */
export const DEFAULT_METHODS = ["cementitious", "liquid-membrane"] as const;
const byKey = (k: string) => METHODS.find((m) => m.key === k);

const linkIcon = `<svg class="pg-ar" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

function options(selected: string) {
  return METHOD_GROUPS.map(
    (g) =>
      `<optgroup label="${esc(g.label)}">${METHODS.filter((m) => m.group === g.key)
        .map((m) => `<option value="${m.key}"${m.key === selected ? " selected" : ""}>${esc(m.name)}</option>`)
        .join("")}</optgroup>`,
  ).join("");
}

function compareMarkup(a: Method, b: Method, products: readonly Product[]) {
  const p = methodParts(a, b, products);
  return `<div class="cx" data-cx="methods" data-a="${a.key}" data-b="${b.key}">
  <div class="cx-stage">
    ${seamHead("a", methodSide(a), options(a.key), "Method A")}
    <div class="cx-mid"><button type="button" class="cx-swap" data-swap aria-label="Swap A and B">${swapIcon}</button></div>
    ${seamHead("b", methodSide(b), options(b.key), "Method B")}
    <div class="cx-mediawrap" data-media>${p.media}</div>
    <div class="cx-verdict" data-verdict aria-live="polite">${p.verdict}</div>
  </div>
  <div class="cx-sheet" data-sheet>${p.sheet}</div>
  <div class="cx-foot">
    <a class="pg-btn pg-btn--ink" href="/contact#enquiry" data-internal>Ask which suits your building${arrow}</a>
    <button type="button" class="pg-btn pg-btn--line" data-share>${linkIcon}<span data-share-label>Copy a link to this pair</span></button>
  </div>
</div>`;
}

/** one method as a card: its picture, its kind, its name and where it is used; pressing it puts it in the comparison */
function card(m: Method) {
  const k = `m-${m.key}`;
  const med = mediaReady(k);
  const g = METHOD_GROUPS.find((x) => x.key === m.group)!;
  const pic = med
    ? `<span class="wm-pic"><img src="${mediaSrcSmall(k)}" width="${med.w}" height="${med.h}" alt="${esc(med.alt)}" loading="lazy" decoding="async"></span>`
    : "";
  return `<li class="wm-card${pic ? "" : " wm-card--nopic"}" id="m-${m.key}" data-m="${m.key}" data-no="${m.no}">
  <button type="button" class="wm-cbtn" data-pick="${m.key}" aria-label="Compare ${esc(m.name)}">
    ${pic}
    <span class="wm-ctext"><span class="wm-ck">${esc(g.label)}</span><span class="wm-cn">${esc(m.name)}</span><span class="wm-ca">${esc(m.areas)}</span></span>
    <span class="wm-ab" data-ab aria-hidden="true"></span>
  </button>
</li>`;
}

function twelveMarkup() {
  const opts = PLACES.map((p) => `<option value="${p.key}" data-methods="${p.methods.join(",")}">${esc(p.label)}</option>`).join("");
  const ordered = METHOD_GROUPS.flatMap((g) => METHODS.filter((m) => m.group === g.key));
  return `<section class="pg-sec wm-twelve" id="methods" aria-labelledby="wm-twelve-h">
  <div class="pg-wrap">
    ${secHead({ n: "", label: "All twelve", title: "Where is the water getting in?", id: "wm-twelve-h", lede: "Pick a place and the methods our guide names for it stand out. Press any method to put it in the comparison. The final choice is made on site." })}
    <div class="wm-finder" data-finder>
      <label class="wm-place"><span>Water is getting in through the</span><select data-place><option value="">choose a place</option>${opts}</select></label>
      <p class="wm-status" data-status aria-live="polite">All twelve methods are shown.</p>
      <button type="button" class="pg-btn pg-btn--line wm-try" data-try hidden></button>
    </div>
    <ul class="wm-cards" data-board>${ordered.map(card).join("")}</ul>
    ${METHODS.some((m) => mediaReady(`m-${m.key}`)) ? `<p class="wm-ainote">Pictures made with AI (Google Flow) to show each method going on.</p>` : ""}
  </div>
</section>`;
}

function matrix() {
  const dot = `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/></svg>`;
  const head = `<tr><th scope="col">Method</th><th scope="col">Goes on</th>${ZONES.map((z) => `<th scope="col"><span>${esc(z.label)}</span></th>`).join("")}</tr>`;
  const rows = METHODS.map(
    (m) =>
      `<tr><th scope="row"><a href="#m-${m.key}">${esc(m.name)}</a></th><td class="wx-app">${esc(m.applied)}</td>${ZONES.map((z) =>
        m.zones.includes(z.key) ? `<td class="wx-on">${dot}<span class="pg-vh">Used for ${esc(z.label.toLowerCase())}</span></td>` : `<td class="wx-off"><span class="pg-vh">Not a main use</span></td>`,
      ).join("")}</tr>`,
  ).join("");
  return `<div class="wx-scroll" tabindex="0" role="region" aria-label="The twelve methods side by side"><table class="wx"><thead>${head}</thead><tbody>${rows}</tbody></table></div>`;
}

export function methodsPageMarkup(d: MethodsData, o: PageOptions = {}) {
  void o;
  const a = byKey(DEFAULT_METHODS[0])!;
  const b = byKey(DEFAULT_METHODS[1])!;
  const head = `<header class="pg-head wm-head">
  <div class="pg-wrap">
    ${crumbs(METHODS_TRAIL)}
    <div class="wm-headgrid">
      <h1 class="pg-h1">Twelve ways to keep water out.</h1>
      <p class="pg-intro">From cementitious coats to crystals grown inside the concrete. Pick any two and see where each one works, how it goes on and what to keep in mind.</p>
    </div>
  </div>
</header>`;
  const compare = `<section class="wm-cmpsec" id="compare" aria-label="Compare two methods">
  <div class="pg-wrap">
    ${compareMarkup(a, b, d.products)}
    ${METHODS.some((m) => mediaReady(`m-${m.key}`)) ? `<p class="cx-ainote">${METHODS.some((m) => MEDIA[`m-${m.key}`]?.film) ? "The films and pictures" : "The pictures"} show each method going on. They are made with AI (Google Flow), not taken on our sites.</p>` : ""}
  </div>
</section>`;
  const table = `<section class="pg-sec pg-sec--stone wm-side" id="at-a-glance" aria-labelledby="wm-side-h">
  <div class="pg-wrap">
    ${secHead({ n: "", label: "At a glance", title: "All twelve, and where each one works.", id: "wm-side-h", lede: "The main uses of each method, from our methods guide." })}
    ${matrix()}
  </div>
</section>`;
  const brands = `<section class="pg-sec wm-brands" id="brands" aria-labelledby="wm-brands-h">
  <div class="pg-wrap">
    ${secHead({ n: "", label: "Brands", title: "Brands worth comparing, job by job.", id: "wm-brands-h", lede: "We compare systems on what the job needs rather than on the name on the tin.", extra: `<a class="pg-link" href="/products" data-internal>Compare the products we supply${arrow}</a>` })}
    <div class="wm-bgrid">
      <dl class="wm-blist">${BRANDS_BY_JOB.map((x) => `<div><dt>${esc(x.job)}</dt><dd>${esc(x.brands)}</dd></div>`).join("")}</dl>
      <div class="wm-choose">
        <p class="wm-k">How we choose between them</p>
        <ol>${CHOOSING.map((c) => `<li><h3>${esc(c.title)}</h3><p>${esc(c.line)}</p></li>`).join("")}</ol>
      </div>
    </div>
  </div>
</section>`;
  return `${head}\n${compare}\n${twelveMarkup()}\n${table}\n${brands}\n${ctaBand(d.contact, {
    title: "Not sure which method your building needs?",
    steps: [
      ["Show us where it leaks", "Photos on WhatsApp are a good start."],
      ["We trace the water", "Where it gets in decides the method, not the other way round."],
      ["You get a method for your building", "The system, the products and the area it covers."],
    ],
  })}`;
}

/* ---------------------------------------------------------------- CSS */
export const METHODS_PAGE_CSS =
  SEAM_CSS +
  `
.wm-head{border-bottom:0;padding-bottom:clamp(1.4rem,3.2vh,2.2rem)}
.wm-headgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:end;gap:1rem clamp(2rem,6vw,7rem);margin-top:clamp(1rem,2.6vh,1.8rem)}
.wm-headgrid .pg-h1{margin:0}
.wm-headgrid .pg-intro{margin:0;padding-bottom:.3rem}
.wm-cmpsec{padding-bottom:clamp(3.5rem,9vh,6rem)}
.wm-cmpsec .cx{scroll-margin-top:calc(var(--nav-room) + .5rem)}
.cx-also{margin-top:.5rem;color:var(--mute)}
.cx-also a{color:var(--ink)}

/* the twelve */
.wm-twelve{background:var(--stone)}
.wm-finder{display:flex;flex-wrap:wrap;align-items:center;gap:.8rem 1.4rem;margin-bottom:clamp(1.6rem,4vh,2.4rem)}
.wm-place{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;font-size:var(--fs-sub);font-weight:500}
.wm-place select{height:3rem;padding:0 2.6rem 0 1.1rem;border-radius:999px;border:1px solid rgba(16,26,34,.18);background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6.5 8 10.5l4-4' fill='none' stroke='%23101a22' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right .9rem center/1rem;font:inherit;font-size:var(--fs-sub);color:var(--ink);appearance:none;cursor:pointer;max-width:100%}
.wm-place select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wm-status{flex:1 1 20rem;margin:0;color:var(--mute)}
.wm-try{height:2.8rem}
.wm-ainote{margin:1.4rem 0 0;color:var(--mute)}
.wm-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(1.4rem,2.6vw,2rem) clamp(1rem,2vw,1.6rem);margin:0;padding:0;list-style:none}
.wm-card{scroll-margin-top:calc(var(--nav-room) + 1rem)}
.wm-cbtn{position:relative;display:flex;flex-direction:column;gap:.65rem;width:100%;padding:0 0 .2rem;border:0;background:none;color:var(--ink);font:inherit;text-align:left;cursor:pointer}
.wm-pic{position:relative;display:block;aspect-ratio:1280/714;border-radius:1rem;overflow:hidden;background:#d5dee4;transition:box-shadow .3s ease}
.wm-pic img{position:absolute;inset:0}
.wm-card--nopic .wm-cbtn{height:100%;padding:1.1rem 1.2rem 1.2rem;border-radius:1rem;background:var(--card);box-shadow:0 1px 0 rgba(16,26,34,.06);transition:box-shadow .3s ease}
.wm-card--nopic .wm-cbtn:hover{box-shadow:0 0 0 1px rgba(16,26,34,.35)}
.wm-card--nopic .wm-cbtn:focus-visible{box-shadow:0 0 0 2px var(--accent)}
.wm-card--nopic .wm-ab{left:auto;right:.9rem;top:.9rem}
.wm-cards.is-filtered .wm-card--nopic.is-fit .wm-cbtn{box-shadow:0 0 0 2px #0b6e80}
.wm-cbtn:hover .wm-pic{box-shadow:0 0 0 3px var(--card),0 0 0 4px rgba(16,26,34,.35)}
.wm-cbtn:focus-visible{outline:none}
.wm-cbtn:focus-visible .wm-pic{box-shadow:0 0 0 3px var(--card),0 0 0 5px var(--accent)}
.wm-ctext{display:flex;flex-direction:column;gap:.1rem}
.wm-ck{color:var(--mute);line-height:1.35}
.wm-cn{font-weight:600;line-height:1.35}
.wm-ca{color:var(--mute);line-height:1.45}
.wm-ab{position:absolute;left:.65rem;top:.65rem;display:none;place-items:center;width:2rem;height:2rem;border-radius:50%;font-weight:600;color:#0b1d2b;background:#3cc5d6;box-shadow:0 4px 14px rgba(11,29,43,.35)}
.wm-card[data-in=a] .wm-ab,.wm-card[data-in=b] .wm-ab{display:grid}
.wm-card[data-in=b] .wm-ab{background:#f0b43c}
.wm-cards.is-filtered .wm-card{transition:opacity .35s ease}
.wm-cards.is-filtered .wm-card:not(.is-fit){opacity:.32}
.wm-cards.is-filtered .wm-card.is-fit .wm-pic{box-shadow:0 0 0 3px var(--stone),0 0 0 5px #0b6e80}

/* at a glance */
.wx-scroll{position:relative;overflow-x:auto;border-radius:1.25rem;background:var(--card);box-shadow:0 1px 0 rgba(16,26,34,.06)}
.wx-scroll:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.wx{width:100%;min-width:60rem;border-collapse:collapse}
.wx th,.wx td{padding:.85rem 1rem;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle;font-weight:400}
.wx thead th{font-weight:600;vertical-align:bottom;line-height:1.3}
.wx thead th span{display:block;max-width:9rem}
.wx tbody th a{font-weight:600;text-decoration:none}
.wx tbody th a:hover{text-decoration:underline;text-underline-offset:3px}
.wx tbody tr:last-child th,.wx tbody tr:last-child td{border-bottom:0}
.wx-app{color:var(--mute);max-width:16rem}
.wx-on,.wx-off{text-align:center!important}
.wx-on svg{width:1rem;height:1rem;fill:#0b6e80}
.pg-vh{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}

/* brands */
.wm-bgrid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:clamp(2rem,5vw,5rem);align-items:start}
.wm-blist{margin:0}
.wm-blist div{display:grid;grid-template-columns:minmax(10rem,.8fr) minmax(0,1.2fr);gap:.4rem 1.6rem;padding:1rem 0;border-bottom:1px solid var(--line)}
.wm-blist div:first-child{border-top:1px solid var(--ink)}
.wm-blist dt{font-weight:600}
.wm-blist dd{margin:0;color:var(--ink2)}
.wm-choose{padding:1.6rem 1.7rem;border-radius:1.25rem;background:var(--stone)}
.wm-k{margin:0 0 1rem;font-weight:600}
.wm-choose ol{display:flex;flex-direction:column;gap:1rem;margin:0;padding:0;list-style:none}
.wm-choose h3{margin:0;font-size:var(--fs-body);font-weight:600}
.wm-choose p{margin:.2rem 0 0;color:var(--mute);line-height:1.5}

@media (max-width:1199px){
  .wm-cards{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-width:899px){
  .wm-headgrid{grid-template-columns:1fr}
  .wm-cards{grid-template-columns:repeat(2,minmax(0,1fr))}
  .wm-bgrid{grid-template-columns:1fr}
  .wm-blist div{grid-template-columns:1fr}
  .cx-foot .pg-btn{flex:1 1 100%}
}
@media (max-width:599px){
  .wm-place{font-size:var(--fs-body)}
  .wm-place select{font-size:var(--fs-body);width:100%}
}
`;
