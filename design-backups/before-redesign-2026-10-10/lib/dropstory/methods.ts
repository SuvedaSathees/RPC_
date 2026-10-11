/**
 * "Twelve methods" — every waterproofing system RPC uses, grouped by where it
 * goes in a building. A small section drawing beside the list lights up the
 * part of the building each group protects.
 */
import { METHOD_GROUPS } from "./copy";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function diagram() {
  // a small section: roof at y 60, first floor 160, ground floor 250, ground 262, basement to 372
  const zone = (key: string, body: string) => `<g class="mx-z" data-zone="${key}">${body}</g>`;
  return `<svg class="mx-diagram" viewBox="0 0 400 420" aria-hidden="true">
  <rect x="-20" y="262" width="440" height="180" class="mx-soil"/>
  <line x1="-20" y1="262" x2="420" y2="262" class="mx-ln"/>
  <rect x="130" y="70" width="200" height="300" class="mx-room"/>
  <path class="mx-ln" d="M130,40 V372 H330 V40 M130,70 H330 M130,160 H330 M130,250 H330 M276,70 V160"/>
  <rect x="34" y="262" width="70" height="88" class="mx-room"/>
  <path class="mx-ln" d="M34,262 V350 H104 V262"/>
  ${zone("roof", `<path d="M133,46 V67 H327 V46" class="mx-zs"/>`)}
  ${zone("wet", `<path d="M279,146 V157 H327 V146" class="mx-zs"/>`)}
  ${zone("below", `<path d="M333,262 V375 H127 V262" class="mx-zs"/>`)}
  ${zone("concrete", `<path d="M37,262 V347 H101 V262" class="mx-zs"/><rect x="133" y="362" width="194" height="8" class="mx-zf"/>`)}
  ${zone("joints", `<g class="mx-zj">${[
    [130, 160],
    [330, 160],
    [130, 250],
    [330, 250],
    [130, 370],
    [330, 370],
    [69, 350],
  ]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5"/>`)
    .join("")}</g>`)}
  <g class="mx-labels">
    <text x="232" y="34" text-anchor="middle" data-for="roof">Roof</text>
    <text x="303" y="140" text-anchor="middle" data-for="wet">Bathroom</text>
    <text x="232" y="398" text-anchor="middle" data-for="below">Basement</text>
    <text x="69" y="372" text-anchor="middle" data-for="concrete">Tank</text>
    <text x="232" y="232" text-anchor="middle" data-for="joints">Every joint</text>
  </g>
</svg>`;
}

/**
 * Phones: a small locator for each group, the same building section reduced to
 * an icon with only that group's zone drawn, in blue.
 */
function mini(key: string) {
  const zones: Record<string, string> = {
    roof: `<path class="mx-mz" d="M130,44 V70 H330 V44"/>`,
    wet: `<rect class="mx-mzf" x="276" y="128" width="54" height="32"/>`,
    below: `<path class="mx-mz" d="M330,262 V372 H130 V262"/>`,
    concrete: `<rect class="mx-mzf" x="34" y="262" width="70" height="88"/><rect class="mx-mzf" x="130" y="358" width="200" height="14"/>`,
    joints: [
      [130, 160],
      [330, 160],
      [130, 250],
      [330, 250],
      [130, 370],
      [330, 370],
      [69, 350],
    ]
      .map(([x, y]) => `<circle class="mx-mzf" cx="${x}" cy="${y}" r="15"/>`)
      .join(""),
  };
  return `<svg class="mx-mini" viewBox="18 22 330 364" aria-hidden="true">
  <rect x="0" y="262" width="400" height="140" class="mx-msoil"/>
  <rect x="130" y="70" width="200" height="300" class="mx-mroom"/>
  <rect x="34" y="262" width="70" height="88" class="mx-mroom"/>
  <path class="mx-mln" d="M130,40 V372 H330 V40 M130,70 H330 M130,160 H330 M130,250 H330 M276,70 V160 M34,262 V350 H104 V262 M18,262 H348"/>
  ${zones[key] ?? ""}
</svg>`;
}

export interface MethodsOptions {
  /**
   * Methods the page above shows, by name, with the label to tag them with
   * (e.g. the four steps of the home hero). Without it, the drop story's tags are used.
   */
  featured?: Record<string, string>;
  /**
   * The home page's layout: on wide screens a grid of cards, one per place, with
   * the building section in a card of its own that lights the place pointed at.
   */
  art?: boolean;
  /** plain image URLs (the local test page has no image optimiser) */
  rawImages?: boolean;
}

/**
 * The home layout's photographs, one per place: real site photographs of each
 * kind of work. They are shown whole, at their own proportions, and nothing is
 * laid over them, so the generator's mark in the lower right stays visible.
 */
const PHOTOS: Record<string, { src: string; alt: string; caption: string }> = {
  roof: {
    src: "/images/anatomy-wp-roof.jpg",
    alt: "Worker rolling a PU waterproofing membrane on a terrace, with a white heat-reflective top coat",
    caption: "On a terrace: a PU membrane rolled over the primed slab and turned up the parapet.",
  },
  wet: {
    src: "/images/anatomy-wp-interior.jpg",
    alt: "Bathroom coated with grey waterproofing and flooded for a pond test, next to a finished tiled area",
    caption: "In a bathroom: the floor and walls coated, then flooded for a pond test before tiling.",
  },
  below: {
    src: "/images/anatomy-wp-foundation.jpg",
    alt: "Anti-termite spraying and a black HDPE membrane laid under the raft reinforcement",
    caption: "Below ground: soil treated against termites and an HDPE sheet laid under the raft.",
  },
  concrete: {
    src: "/images/anatomy-wp-structure.jpg",
    alt: "Worker adding waterproofing admixture to the concrete mixer during a slab pour",
    caption: "Inside the concrete: a waterproofing admixture dosed into every batch of the mix.",
  },
  joints: {
    src: "/images/anatomy-wp-windows.jpg",
    alt: "Worker sealing an aluminium window frame with silicone under a sunshade with a drip groove, above a sloped granite sill",
    caption: "At the joints: the gap around a window frame sealed with silicone so water cannot track in.",
  },
};

function photoUrl(src: string, w: number, raw?: boolean) {
  return raw ? src : `/_next/image?url=${encodeURIComponent(src)}&amp;w=${w}&amp;q=75`;
}

/**
 * The home layout's panel headings: what people search for, one per place
 * (the tabs keep the shorter names of the places).
 */
const SEARCH_HEADS: Record<string, string> = {
  roof: "Terrace waterproofing",
  wet: "Bathroom waterproofing",
  below: "Basement waterproofing",
  concrete: "Tank and concrete waterproofing",
  joints: "Crack and leak repair",
};

export function methodsMarkup(opts: MethodsOptions = {}): string {
  const tag = (m: { name: string; story?: string }) => {
    if (opts.featured) {
      const n = opts.featured[m.name];
      return n ? `<em>Shown above · ${esc(n)}</em>` : "";
    }
    // the home layout lists the methods plainly
    if (opts.art) return "";
    return m.story ? `<em>In the story: ${esc(m.story)}</em>` : "";
  };
  // phones show each group as a card that opens and closes; the first starts open
  const groups = METHOD_GROUPS.map(
    (g, i) => `<div class="mx-group${i === 0 ? " is-open" : ""}" data-group="${g.key}" tabindex="0">
  <div class="mx-ghead">
    <span class="mx-icon" aria-hidden="true">${mini(g.key)}</span>
    <h3><button type="button" class="mx-toggle" aria-expanded="${i === 0}" aria-controls="mx-p-${g.key}"><span class="mx-gt">${esc(g.title)}</span><span class="mx-count">${g.methods.length} ${g.methods.length === 1 ? "method" : "methods"}</span></button></h3>
    <p>${esc(g.note)}</p>
    <span class="mx-chev" aria-hidden="true"></span>
  </div>
  <div class="mx-panel" id="mx-p-${g.key}"><div class="mx-pin">
    <p class="mx-pnote">${esc(g.note)}</p>
    <ul>${g.methods
      .map(
        (m) => `<li class="mx-row"><span class="mx-name">${esc(m.name)}${tag(m)}</span><span class="mx-areas">${esc(m.areas)}</span></li>`,
      )
      .join("")}</ul>
  </div></div>
</div>`,
  ).join("\n");

  const foot = `<div class="mx-foot">
        <p>Not sure which one your building needs? We inspect first, then recommend.</p>
        <a class="mx-btn" href="/contact#enquiry" data-internal>Book a free inspection</a>
      </div>`;
  if (opts.art) {
    const SHORT: Record<string, string> = { roof: "Roofs & terraces", wet: "Bathrooms", below: "Below ground", concrete: "Inside concrete", joints: "Joints & cracks" };
    const tabs = METHOD_GROUPS.map(
      (g, i) => `<button type="button" role="tab" class="mx-tab" id="mx-t-${g.key}" data-tab="${g.key}" aria-controls="mx-tp-${g.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
      <span class="mx-icon" aria-hidden="true">${mini(g.key)}</span><span class="mx-tt"><span class="mx-tl">${esc(g.title)}</span><span class="mx-ts">${esc(SHORT[g.key] ?? g.title)}</span></span><span class="mx-tc">${String(g.methods.length).padStart(2, "0")}</span>
    </button>`,
    ).join("");
    const panels = METHOD_GROUPS.map(
      (g, i) => `<div class="mx-tp${i === 0 ? "" : " is-off"}" role="tabpanel" id="mx-tp-${g.key}" aria-labelledby="mx-t-${g.key}"${i === 0 ? "" : ' aria-hidden="true"'}>
      <div class="mx-tph"><h3>${esc(SEARCH_HEADS[g.key] ?? g.title)}</h3></div>
      <p class="mx-tpn">${esc(g.note)}</p>
      <ul>${g.methods.map((m) => `<li class="mx-row"><span class="mx-name">${esc(m.name)}${tag(m)}</span><span class="mx-areas">${esc(m.areas)}</span></li>`).join("")}</ul>
    </div>`,
    ).join("");
    return `<div class="mx-wrap">
  <header class="mx-ahead">
    <div>
      <p class="mx-mark"><span class="mx-idx">01</span><span class="mx-rule2" aria-hidden="true"></span><span>Waterproofing</span></p>
      <h2 id="methods-title">Terrace, bathroom and basement waterproofing.</h2>
    </div>
    <div class="mx-aside2">
      <p class="mx-alede">Twelve methods we use on homes and buildings in Erode and Coimbatore, from PU membranes on terraces to crystalline coatings inside water tanks. Pick a place to see which suit it.</p>
      <div class="mx-acta"><a class="mx-btn" href="/contact#enquiry" data-internal>Book a free site inspection</a><a class="mx-alink" href="/waterproofing" data-internal>Compare all 12 methods<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>
    </div>
  </header>
  <div class="mx-abody">
    <div class="mx-tabs" role="tablist" aria-label="Places in a building">${tabs}</div>
    <figure class="mx-afig">
      <div class="mx-photo">${METHOD_GROUPS.map((g, i) => {
        const p = PHOTOS[g.key];
        if (!p) return "";
        const set = [640, 828, 1080, 1440].map((w) => `${photoUrl(p.src, w, opts.rawImages)} ${w}w`).join(", ");
        return `<img data-ph="${g.key}"${i === 0 ? ' class="is-on"' : ' aria-hidden="true"'} src="${photoUrl(p.src, 1080, opts.rawImages)}"${opts.rawImages ? "" : ` srcset="${set}" sizes="(min-width:1200px) 36vw, 1px"`} alt="${esc(p.alt)}" loading="lazy" decoding="async" width="1376" height="768">`;
      }).join("")}</div>
      <figcaption class="mx-phcap">${METHOD_GROUPS.map((g, i) => (PHOTOS[g.key] ? `<span data-pcap="${g.key}"${i === 0 ? ' class="is-on"' : ""}>${esc(PHOTOS[g.key]!.caption)}</span>` : "")).join("")}</figcaption>
    </figure>
    <div class="mx-panels">${panels}</div>
  </div>
</div>`;
  }

  return `<div class="mx-wrap">
  <header class="mx-head">
    <div class="eyebrow mx-marker"><span style="opacity:.5">(01)</span><span class="mx-rule"></span><span>Waterproofing</span></div>
    <h2>Twelve methods, each for its own place.</h2>
    <p>Every part of a building meets water differently: rain on the roof, daily splashes in a bathroom, steady pressure underground. These are the methods we use, grouped by where they go.</p>
  </header>
  <div class="mx-grid">
    <div class="mx-aside"><div class="mx-sticky">${diagram()}</div></div>
    <div class="mx-list">${groups}
      ${foot}
    </div>
  </div>
</div>`;
}

export const METHODS_CSS = `
.mx-section{position:relative;background:#e8edf0;color:#101a22;padding:clamp(5rem,12vh,9rem) 0 clamp(5rem,12vh,8rem)}
.mx-wrap{padding-inline:var(--gutter,3rem);max-width:1500px;margin:0 auto}
.mx-marker{display:flex;align-items:center;gap:.75rem;color:rgba(16,26,34,.7)}
.mx-rule{display:block;width:2rem;height:1px;background:currentColor;opacity:.3}
.mx-head h2{margin:1.4rem 0 0;max-width:15ch;font-weight:600;font-size:var(--fs-title);line-height:.95;letter-spacing:-.045em}
.mx-head p{margin:1.4rem 0 0;max-width:36rem;font-size:var(--fs-body);line-height:1.6;color:rgba(16,26,34,.62)}
.mx-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(2rem,6vw,7rem);margin-top:clamp(3rem,8vh,5rem)}
.mx-sticky{position:sticky;top:16vh}
.mx-diagram{display:block;width:100%;max-width:440px;height:auto;overflow:visible}
.mx-soil{fill:#1a2228}
.mx-room{fill:#f7f9fa}
.mx-ln{fill:none;stroke:#1d2a33;stroke-width:1.2;stroke-linejoin:round}
.mx-zs{fill:none;stroke:#c2cdd5;stroke-width:6;stroke-linejoin:miter;transition:stroke .45s,stroke-width .45s}
.mx-zf{fill:#c2cdd5;transition:fill .45s}
.mx-zj circle{fill:#e8edf0;stroke:#c2cdd5;stroke-width:2.5;transition:stroke .45s,fill .45s}
.mx-labels text{font-family:var(--font-inter-tight),ui-sans-serif,sans-serif;font-size:var(--fs-body);font-weight:600;fill:#0b7d91;opacity:0;transition:opacity .45s}
.mx-section[data-active=roof] [data-zone=roof] .mx-zs,.mx-section[data-active=wet] [data-zone=wet] .mx-zs,.mx-section[data-active=below] [data-zone=below] .mx-zs,.mx-section[data-active=concrete] [data-zone=concrete] .mx-zs{stroke:#0b7d91;stroke-width:8}
.mx-section[data-active=concrete] [data-zone=concrete] .mx-zf{fill:#0b7d91}
.mx-section[data-active=joints] .mx-zj circle{stroke:#0b7d91;fill:#d3eef1}
.mx-section[data-active=roof] [data-for=roof],.mx-section[data-active=wet] [data-for=wet],.mx-section[data-active=below] [data-for=below],.mx-section[data-active=concrete] [data-for=concrete],.mx-section[data-active=joints] [data-for=joints]{opacity:1}

.mx-group{padding:2.2rem 0 2.4rem;border-top:1px solid rgba(16,26,34,.16);outline:none;transition:opacity .4s}
.mx-group:focus-visible{outline:1px solid #0b7d91;outline-offset:6px}
.mx-section[data-active] .mx-group:not(.is-active){opacity:.45}
.mx-ghead{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.4rem 2rem}
.mx-ghead h3{margin:0;font-size:var(--fs-sub);font-weight:600;letter-spacing:-.01em}
.mx-ghead p{margin:0;max-width:26rem;font-size:var(--fs-body);line-height:1.45;color:rgba(16,26,34,.58)}
.mx-group ul{list-style:none;margin:1.2rem 0 0;padding:0}
.mx-row{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:1.5rem;align-items:baseline;padding:1rem 0;border-top:1px solid rgba(16,26,34,.08)}
.mx-row:first-child{border-top:0}
.mx-name{display:flex;flex-direction:column;gap:.35rem;font-size:var(--fs-body);font-weight:500;line-height:1.12;letter-spacing:-.025em}
.mx-name em{font-style:normal;font-size:var(--fs-body);font-weight:600;letter-spacing:0;color:#0b7d91}
.mx-areas{font-size:var(--fs-body);line-height:1.45;color:rgba(16,26,34,.6)}
.mx-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.2rem 2rem;margin-top:1rem;padding-top:2.2rem;border-top:1px solid rgba(16,26,34,.16)}
.mx-foot p{margin:0;max-width:26rem;font-size:var(--fs-body);line-height:1.5}
.mx-btn{display:inline-flex;align-items:center;height:3.1rem;padding:0 1.4rem;border-radius:999px;background:#101a22;color:#ecf2f5;font-size:var(--fs-body);font-weight:600;text-decoration:none;transition:background-color .3s}
.mx-btn:hover{background:#0b7d91}
/* phone-only parts of each group, hidden on wide screens */
.mx-icon,.mx-count,.mx-chev,.mx-pnote{display:none}
.mx-toggle{all:unset;cursor:default}

/* serif variant: matches the "art of waterproofing" hero */
.mx-section--serif .mx-head h2{font-family:var(--font-instrument),"Times New Roman",serif;font-weight:400;font-size:var(--fs-title);line-height:.95;letter-spacing:-.025em;max-width:17ch;text-wrap:balance}
.mx-section--serif .mx-name em{color:#0b6e80}
/* home layout: a place explorer, one screen tall (tabs, the building, that place's methods) */
.mx-mark{display:flex;align-items:center;gap:.75rem;margin:0;font-size:var(--fs-body);font-weight:500;color:rgba(16,26,34,.6)}
.mx-idx{font-weight:600;font-variant-numeric:tabular-nums;color:#0b6e80}
.mx-rule2{display:block;width:2rem;height:1px;background:currentColor;opacity:.35}
.mx-section--art,.mx-section--art *{box-sizing:border-box}
.mx-section.mx-section--art{display:flex;flex-direction:column;justify-content:center;min-height:100vh;min-height:100svh;padding:calc(var(--nav-room,88px) + min(1rem,1.6svh)) 0 clamp(1rem,3.4svh,3rem);background:#e4eaee}
.mx-section--art .mx-wrap{width:100%;max-width:1600px;box-sizing:border-box}
.mx-ahead{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);align-items:end;gap:1rem clamp(2rem,6vw,7rem)}
.mx-ahead h2{margin:min(1rem,1.8svh) 0 0;font-family:var(--font-instrument),"Times New Roman",serif;font-weight:400;font-size:var(--fs-title);line-height:.95;letter-spacing:-.022em;max-width:23ch;text-wrap:balance}
.mx-aside2{display:flex;flex-direction:column;gap:min(1.2rem,2.2svh);padding-bottom:.3rem}
.mx-alede{margin:0;max-width:30rem;font-size:var(--fs-sub);line-height:1.6;color:rgba(16,26,34,.6);text-wrap:pretty}
.mx-abody{display:grid;grid-template-columns:minmax(14rem,.82fr) minmax(0,1.5fr) minmax(0,1.6fr);gap:clamp(.9rem,1.6vw,1.4rem);margin-top:clamp(1.2rem,4svh,3rem)}
.mx-tabs{display:flex;flex-direction:column;justify-content:space-between;gap:6px}
.mx-tab{all:unset;box-sizing:border-box;display:grid;grid-template-columns:44px minmax(0,1fr) auto;align-items:center;gap:12px;padding:min(9px,1.2svh) 16px min(9px,1.2svh) 9px;border-radius:15px;cursor:pointer;color:#101a22;-webkit-tap-highlight-color:transparent;transition:background-color .35s,box-shadow .35s,color .35s}
.mx-tab:hover{background:rgba(251,252,253,.6)}
.mx-tab[aria-selected=true]{background:#fbfcfd;box-shadow:inset 0 0 0 1px rgba(16,26,34,.08),0 16px 30px -24px rgba(16,26,34,.5)}
.mx-tab:focus-visible{outline:2px solid #0b7d91;outline-offset:2px}
.mx-tab .mx-icon{display:grid;place-items:center;width:44px;height:44px;border-radius:11px;background:#fff;box-shadow:inset 0 0 0 1px rgba(16,26,34,.07)}
.mx-tab .mx-mini{display:block;width:31px;height:34px;overflow:visible}
.mx-msoil{fill:#dbe3e8}
.mx-mroom{fill:#fff}
.mx-mln{fill:none;stroke:#26333d;stroke-width:1.1;vector-effect:non-scaling-stroke;stroke-linejoin:round}
.mx-mz{fill:none;stroke:#0b7d91;stroke-width:3;vector-effect:non-scaling-stroke;stroke-linejoin:round}
.mx-mzf{fill:#0b7d91}
.mx-tt{min-width:0;font-size:var(--fs-body);font-weight:600;letter-spacing:-.01em}
.mx-ts{display:none}
.mx-tc{font-size:var(--fs-body);font-weight:600;font-variant-numeric:tabular-nums;color:rgba(16,26,34,.45)}
.mx-tab[aria-selected=true] .mx-tc{color:#0b6e80}
.mx-afig{display:flex;flex-direction:column;justify-content:center;gap:min(1rem,1.8svh);min-width:0;margin:0;padding:clamp(10px,1.5svh,14px);border-radius:20px;background:#fbfcfd;box-shadow:inset 0 0 0 1px rgba(16,26,34,.07)}
/* the photograph keeps its own proportions (no cropping) and nothing covers it */
.mx-photo{position:relative;aspect-ratio:1376/768;border-radius:12px;overflow:hidden;background:#dde5ea}
.mx-photo img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .55s ease}
.mx-photo img.is-on{opacity:1}
.mx-phcap{display:grid;padding:0 6px 2px}
.mx-phcap span{grid-area:1/1;font-size:var(--fs-body);line-height:1.5;color:rgba(16,26,34,.62);text-wrap:pretty;opacity:0;transition:opacity .4s ease}
.mx-phcap span.is-on{opacity:1}
.mx-panels{display:grid;align-content:start;min-width:0;padding:clamp(18px,3svh,30px) clamp(20px,2.2vw,32px);border-radius:20px;background:#fbfcfd;box-shadow:inset 0 0 0 1px rgba(16,26,34,.07)}
/* all five lists share one cell: the card is always as tall as the longest (roofs and terraces),
   so choosing another place never changes the size of the section */
.mx-tp{grid-area:1/1;min-width:0;transition:opacity .45s ease .1s,transform .55s cubic-bezier(.2,.7,.2,1) .1s,visibility 0s}
.mx-tp.is-off{opacity:0;transform:translateY(8px);visibility:hidden;pointer-events:none;transition:opacity .2s ease,transform .2s ease,visibility 0s .2s}
.mx-tph{display:flex;align-items:baseline;justify-content:space-between;gap:1rem}
.mx-tph h3{margin:0;font-family:var(--font-instrument),"Times New Roman",serif;font-weight:400;font-size:var(--fs-sub);line-height:1;letter-spacing:-.01em}
.mx-tpn{margin:.55rem 0 0;font-size:var(--fs-body);line-height:1.5;color:rgba(16,26,34,.6)}
.mx-tp ul{list-style:none;margin:min(1.1rem,2.2svh) 0 0;padding:0}
.mx-tp .mx-row{display:grid;grid-template-columns:1fr;gap:.12rem;align-items:baseline;padding:min(.75rem,1.2svh) 0;border-top:1px solid rgba(16,26,34,.09)}
.mx-tp .mx-row:first-child{border-top:1px solid rgba(16,26,34,.09)}
.mx-tp .mx-name{flex-direction:row;flex-wrap:wrap;align-items:center;gap:.3rem .6rem;font-size:var(--fs-body);line-height:1.3;letter-spacing:-.015em}
.mx-tp .mx-name em{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;background:#dceff2;font-size:var(--fs-body);font-weight:600;letter-spacing:.01em;white-space:nowrap}
.mx-tp .mx-areas{font-size:var(--fs-body);line-height:1.45}
.mx-acta{display:flex;align-items:center;gap:.6rem 1.4rem;flex-wrap:wrap}
.mx-alink{display:inline-flex;align-items:center;gap:.5rem;padding-bottom:3px;border-bottom:1px solid currentColor;font-size:var(--fs-body);font-weight:600;color:#101a22;text-decoration:none;white-space:nowrap}
.mx-alink svg{width:14px;height:14px;transition:transform .45s cubic-bezier(.2,.7,.2,1)}
.mx-alink:hover svg{transform:translate(2px,-2px)}
.mx-section--art .mx-acta .mx-btn{flex:none;height:min(3rem,6svh);min-height:2.6rem;background:#101a22;color:#ecf2f5}
.mx-section--art .mx-acta .mx-btn:hover{background:#0b7d91}
/* tall, wide screens: each method on one line, its uses beside it */
@media (min-width:1200px) and (min-height:861px){.mx-tp .mx-row{grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:1.2rem;padding:min(.8rem,1.4svh) 0}}
@media (max-height:860px){.mx-tpn{display:none}}
@media (min-width:768px) and (max-width:1199px){.mx-afig{display:none}.mx-abody{grid-template-columns:minmax(14rem,.8fr) minmax(0,1.6fr)}}
@media (min-width:768px) and (max-width:1023px){
  .mx-ahead{grid-template-columns:1fr}
  .mx-ahead h2{font-size:var(--fs-title)}
  .mx-abody{grid-template-columns:minmax(0,.9fr) minmax(0,1.4fr)}
}
@media (max-width:767px){
  .mx-section.mx-section--art{justify-content:center;padding:calc(var(--nav-room-m,68px) + .4rem) 0 .9rem}
  .mx-ahead{display:block}
  .mx-ahead h2{margin-top:.8rem;font-size:var(--fs-title);max-width:none}
  .mx-alede{display:none}
  .mx-abody{display:flex;flex-direction:column;flex:1;min-height:0;margin-top:min(1.4rem,2.6svh)}
  .mx-tabs{flex-direction:row;justify-content:flex-start;margin:0 calc(-1 * var(--gutter,16px));padding:0 var(--gutter,16px) 2px;overflow-x:auto;scrollbar-width:none;-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 30px),transparent);mask-image:linear-gradient(to right,#000 calc(100% - 30px),transparent)}
  .mx-tabs::-webkit-scrollbar{display:none}
  .mx-tab{flex:none;display:flex;gap:7px;height:38px;padding:0 13px;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(16,26,34,.14)}
  .mx-tab .mx-icon,.mx-tl{display:none}
  .mx-ts{display:inline;font-size:var(--fs-body);font-weight:600}
  .mx-tab[aria-selected=true]{background:#101a22;color:#f3f5f6;box-shadow:none}
  .mx-tab[aria-selected=true] .mx-tc{color:#7fd8e3}
  .mx-afig{display:none}
  .mx-panels{margin-top:12px;padding:16px 16px 14px;border-radius:18px}
  .mx-tph h3{font-size:var(--fs-sub)}
  .mx-tpn{display:none}
  .mx-tp ul{margin-top:.7rem}
  .mx-tp .mx-row{grid-template-columns:1fr;gap:.15rem;padding:min(.7rem,1.35svh) 0}
  .mx-tp .mx-name{font-size:var(--fs-body)}
  .mx-tp .mx-areas{font-size:var(--fs-body)}
  .mx-aside2{display:none}
}
/* short phones: tighter rows; the shortest drop each method's uses */
@media (max-width:767px) and (max-height:760px){.mx-tp .mx-row{padding:.36rem 0}.mx-tp .mx-areas{font-size:var(--fs-body);line-height:1.35}}
@media (max-width:767px) and (max-height:660px){.mx-tp .mx-areas{display:none}}
@media (max-width:900px){
  /* phones and small tablets: the five places as cards that open, each with a locator icon */
  .mx-section{padding:clamp(4rem,10vh,5.5rem) 0 clamp(3.5rem,9vh,5rem)}
  .mx-head h2{margin-top:1.1rem}
  .mx-section--serif .mx-head h2{font-size:var(--fs-title);line-height:.96;max-width:12ch}
  .mx-head p{margin-top:1rem;font-size:var(--fs-body);line-height:1.58}
  .mx-grid{display:block;max-width:44rem;margin-top:2rem}
  .mx-aside{display:none}
  .mx-list{display:flex;flex-direction:column;gap:10px}
  .mx-section[data-active] .mx-group:not(.is-active){opacity:1}
  .mx-group{padding:0;border:0;border-radius:18px;background:#f7f9fa;box-shadow:inset 0 0 0 1px rgba(16,26,34,.07),0 10px 24px -18px rgba(16,26,34,.35);transition:background-color .35s,box-shadow .35s}
  .mx-group.is-open{background:#fbfcfd;box-shadow:inset 0 0 0 1px rgba(16,26,34,.1),0 18px 34px -22px rgba(16,26,34,.4)}
  .mx-group:focus-visible{outline-offset:3px}
  .mx-ghead{position:relative;display:grid;grid-template-columns:56px minmax(0,1fr) 30px;align-items:center;gap:14px;padding:12px 14px 12px 12px}
  .mx-ghead > p{display:none}
  .mx-icon{display:grid;place-items:center;width:56px;height:56px;border-radius:13px;background:#fff;box-shadow:inset 0 0 0 1px rgba(16,26,34,.07)}
  .mx-mini{display:block;width:40px;height:44px;overflow:visible}
  .mx-msoil{fill:#dbe3e8}
  .mx-mroom{fill:#fff}
  .mx-mln{fill:none;stroke:#26333d;stroke-width:1.1;vector-effect:non-scaling-stroke;stroke-linejoin:round}
  .mx-mz{fill:none;stroke:#0b7d91;stroke-width:3.2;vector-effect:non-scaling-stroke;stroke-linejoin:round}
  .mx-mzf{fill:#0b7d91}
  .mx-ghead h3{min-width:0;font-size:var(--fs-sub);line-height:1.25}
  .mx-toggle{display:flex;flex-direction:column;gap:3px;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .mx-toggle::after{content:"";position:absolute;inset:0;border-radius:18px}
  .mx-toggle:focus-visible::after{outline:2px solid #0b7d91;outline-offset:2px}
  .mx-count{display:block;font-size:var(--fs-body);font-weight:500;letter-spacing:0;color:rgba(16,26,34,.55)}
  .mx-chev{position:relative;display:block;justify-self:end;width:30px;height:30px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(16,26,34,.14);transition:background-color .35s,box-shadow .35s}
  .mx-chev::before,.mx-chev::after{content:"";position:absolute;left:50%;top:50%;width:11px;height:1.5px;margin:-.75px 0 0 -5.5px;border-radius:1px;background:#101a22;transition:transform .45s cubic-bezier(.2,.7,.2,1),background-color .35s}
  .mx-chev::after{transform:rotate(90deg)}
  .mx-group.is-open .mx-chev{background:#101a22;box-shadow:none}
  .mx-group.is-open .mx-chev::before,.mx-group.is-open .mx-chev::after{background:#fbfcfd}
  .mx-group.is-open .mx-chev::after{transform:rotate(0deg)}
  .mx-panel{display:grid;grid-template-rows:0fr;transition:grid-template-rows .5s cubic-bezier(.2,.7,.2,1)}
  .mx-group.is-open .mx-panel{grid-template-rows:1fr}
  .mx-pin{min-height:0;overflow:hidden;padding:0 16px;visibility:hidden;transition:visibility 0s .5s}
  .mx-group.is-open .mx-pin{visibility:visible;transition:visibility 0s}
  .mx-pnote{display:block;margin:2px 0 4px;font-size:var(--fs-body);line-height:1.5;color:rgba(16,26,34,.6);text-wrap:pretty}
  .mx-group ul{margin:.4rem 0 .5rem}
  .mx-row{grid-template-columns:1fr;gap:.3rem;padding:.95rem 0;border-top:1px solid rgba(16,26,34,.08)}
  .mx-row:first-child{border-top:1px solid rgba(16,26,34,.08)}
  .mx-name{flex-direction:row;flex-wrap:wrap;align-items:center;gap:.35rem .55rem;font-size:var(--fs-body);line-height:1.3;letter-spacing:-.015em}
  .mx-name em{display:inline-flex;align-items:center;height:21px;padding:0 8px;border-radius:999px;background:#dceff2;font-size:var(--fs-body);font-weight:600;letter-spacing:.01em;white-space:nowrap}
  .mx-areas{font-size:var(--fs-body);line-height:1.45}
  .mx-foot{flex-direction:column;align-items:flex-start;gap:1.1rem;margin-top:8px;padding:22px 20px;border:0;border-radius:18px;background:#101a22;color:#ecf2f5}
  .mx-foot p{font-size:var(--fs-body);line-height:1.45;color:rgba(236,242,245,.88)}
  .mx-btn{background:#ecf2f5;color:#101a22;height:3rem}
  .mx-btn:hover{background:#fff}
}
@media (min-width:600px) and (max-width:900px){.mx-section--serif .mx-head h2{max-width:17ch}}
`;

/** the home layout: choosing a place (click, mouse-over or arrow keys) shows its methods and lights it on the building */
function mountTabs(section: HTMLElement) {
  const tabs = Array.from(section.querySelectorAll<HTMLButtonElement>("[data-tab]"));
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const select = (t: HTMLButtonElement, focus = false) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
      const p = section.querySelector<HTMLElement>(`#${x.getAttribute("aria-controls")}`);
      if (p) {
        p.classList.toggle("is-off", !on);
        if (on) p.removeAttribute("aria-hidden");
        else p.setAttribute("aria-hidden", "true");
      }
    });
    section.dataset.active = t.dataset.tab!;
    section.querySelectorAll<HTMLElement>("[data-ph]").forEach((im) => {
      const on = im.dataset.ph === t.dataset.tab;
      im.classList.toggle("is-on", on);
      if (on) im.removeAttribute("aria-hidden");
      else im.setAttribute("aria-hidden", "true");
    });
    section.querySelectorAll<HTMLElement>("[data-pcap]").forEach((c) => c.classList.toggle("is-on", c.dataset.pcap === t.dataset.tab));
    if (focus) t.focus();
    // phones: keep the chosen chip in view
    if (t.parentElement && t.parentElement.scrollWidth > t.parentElement.clientWidth) t.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  };
  const off: (() => void)[] = [];
  tabs.forEach((t, i) => {
    const click = () => select(t);
    const enter = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && fine.matches) select(t);
    };
    const key = (e: KeyboardEvent) => {
      const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select(tabs[(i + d + tabs.length) % tabs.length]!, true);
    };
    t.addEventListener("click", click);
    t.addEventListener("pointerenter", enter);
    t.addEventListener("keydown", key);
    off.push(() => {
      t.removeEventListener("click", click);
      t.removeEventListener("pointerenter", enter);
      t.removeEventListener("keydown", key);
    });
  });
  if (tabs[0]) section.dataset.active = tabs.find((t) => t.getAttribute("aria-selected") === "true")?.dataset.tab ?? tabs[0].dataset.tab!;
  return () => off.forEach((f) => f());
}

/** highlight the zone of whichever group is hovered, focused or in the middle of the screen */
export function mountMethods(section: HTMLElement) {
  if (section.querySelector("[data-tab]")) return mountTabs(section);
  const groups = Array.from(section.querySelectorAll<HTMLElement>("[data-group]"));
  let hovered: HTMLElement | null = null;
  let scrolled: HTMLElement | null = null;
  const apply = () => {
    const g = hovered ?? scrolled;
    if (g) section.dataset.active = g.dataset.group!;
    else delete section.dataset.active;
    groups.forEach((x) => x.classList.toggle("is-active", x === g));
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) scrolled = e.target as HTMLElement;
      apply();
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );
  const off: (() => void)[] = [];
  // phones: each card opens and closes on its own
  const narrow = window.matchMedia("(max-width: 900px)");
  const toggles = groups.map((g) => g.querySelector<HTMLButtonElement>(".mx-toggle"));
  const setStops = () => {
    groups.forEach((g, i) => {
      const t = toggles[i];
      if (narrow.matches) {
        g.removeAttribute("tabindex");
        if (t) t.tabIndex = 0;
      } else {
        g.tabIndex = 0;
        if (t) t.tabIndex = -1;
      }
    });
  };
  setStops();
  narrow.addEventListener("change", setStops);
  off.push(() => narrow.removeEventListener("change", setStops));
  groups.forEach((g, i) => {
    const t = toggles[i];
    if (!t) return;
    const flip = () => {
      if (!narrow.matches) return;
      const open = !g.classList.contains("is-open");
      g.classList.toggle("is-open", open);
      t.setAttribute("aria-expanded", String(open));
    };
    t.addEventListener("click", flip);
    off.push(() => t.removeEventListener("click", flip));
  });
  for (const g of groups) {
    io.observe(g);
    const enter = () => {
      hovered = g;
      apply();
    };
    const leave = () => {
      hovered = null;
      apply();
    };
    g.addEventListener("pointerenter", enter);
    g.addEventListener("pointerleave", leave);
    g.addEventListener("focus", enter);
    g.addEventListener("blur", leave);
    off.push(() => {
      g.removeEventListener("pointerenter", enter);
      g.removeEventListener("pointerleave", leave);
      g.removeEventListener("focus", enter);
      g.removeEventListener("blur", leave);
    });
  }
  // clear the highlight once the list leaves the screen
  const outer = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) {
      scrolled = null;
      apply();
    }
  });
  outer.observe(section);
  return () => {
    io.disconnect();
    outer.disconnect();
    off.forEach((f) => f());
  };
}
