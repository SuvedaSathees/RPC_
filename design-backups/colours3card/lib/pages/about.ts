/**
 * About page, kept short: who RPC is, the vision and the mission, the six
 * values, where we work, and the close. Every heading is written around what
 * people search for (waterproofing and construction in Erode, Coimbatore and
 * Tamil Nadu), and every fact comes from lib/content.ts.
 *
 * The one photograph's place is an empty frame, ready for RPC's own picture.
 */
import { arrow, ctaBand, esc, listing, ph, tick, words, type ContactInfo } from "./kit";

export interface AboutData {
  story: readonly string[];
  vision: string;
  mission: readonly string[];
  principles: readonly { title: string; body: string }[];
  services: readonly { title: string; line?: string }[];
  contact: ContactInfo;
  founded: string;
}

export const ABOUT_TRAIL = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
] as const;

/** a simple drawn mark for each value */
const MARKS: Record<string, string> = {
  Honesty: `<path d="M12 3.2 19 6v5.2c0 4.3-2.9 8-7 9.6-4.1-1.6-7-5.3-7-9.6V6z"/><path d="m8.8 12.1 2.2 2.2 4.3-4.6"/>`,
  Engineering: `<path d="M4 20 20 4v16z"/><path d="M9 20v-2M12 20v-3M15 20v-2M16.5 13.5h-3v3"/>`,
  Craftsmanship: `<rect x="2.5" y="8.5" width="19" height="7" rx="2"/><circle cx="12" cy="12" r="1.8"/><path d="M8.5 8.5v7M15.5 8.5v7"/>`,
  Materials: `<path d="M5.5 8h13l-1.3 11.1a1.8 1.8 0 0 1-1.8 1.6H8.6a1.8 1.8 0 0 1-1.8-1.6z"/><path d="M8.5 8a3.5 3.5 0 0 1 7 0"/><path d="M9 13h6"/>`,
  Respect: `<path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M6 9.4V20h12V9.4"/><path d="M12 11.6c-1.7 2.1-2.5 3.3-2.5 4.3a2.5 2.5 0 0 0 5 0c0-1-.8-2.2-2.5-4.3z"/>`,
  Timing: `<circle cx="12" cy="13" r="7.6"/><path d="M12 9v4.4l2.8 1.8M9.5 2.8h5M12 2.8v2.6"/>`,
};
const markOf = (t: string) =>
  `<svg class="ab-mk" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${MARKS[t] ?? MARKS.Honesty!}</svg>`;


/**
 * The towns we work in: straight-line distance (km) and compass bearing (degrees) from the Erode
 * office, worked out from each town's latitude and longitude.
 */
const REACH: readonly { town: string; km: number; deg: number }[] = [
  { town: "Erode", km: 0, deg: 0 },
  { town: "Tiruppur", km: 48, deg: 238 },
  { town: "Salem", km: 59, deg: 52 },
  { town: "Coimbatore", km: 91, deg: 247 },
  { town: "Chennai", km: 338, deg: 55 },
];

/** a plan of the towns around the office, to scale out to 120 km; a town further away sits on the edge, pointing out */
function reachMap(regions: readonly string[]) {
  const cx = 250, cy = 215, px = 1.45, edge = 185;
  const at = (km: number, deg: number) => {
    const r = Math.min(km * px, edge);
    const a = (deg * Math.PI) / 180;
    return [cx + Math.sin(a) * r, cy - Math.cos(a) * r] as const;
  };
  const f = (n: number) => n.toFixed(1);
  const rings = [50, 100]
    .map((k) => `<circle cx="${cx}" cy="${cy}" r="${k * px}" class="ab-ring"/><text x="${f(cx + 4)}" y="${f(cy - k * px - 6)}" class="ab-rl">${k} km</text>`)
    .join("");
  const towns = REACH.filter((r) => regions.includes(r.town) && r.km)
    .map((r) => {
      const far = r.km * px > edge;
      const [x, y] = at(r.km, r.deg);
      // most names sit beside their town, on the side away from the office; a name that would crowd its neighbour sits below
      const below = r.town === "Tiruppur";
      const right = below || x >= cx;
      const lx = below ? x - 4 : x + (right ? 12 : -12);
      const ly = below ? y + 24 : y + (far ? 18 : 4);
      const [sx, sy] = at(112, r.deg);
      const arrowOut = far ? `<path class="ab-far" d="M${f(sx)} ${f(sy)}L${f(x)} ${f(y)}"/><path class="ab-fara" d="M${f(x)} ${f(y)}l-9 1.5M${f(x)} ${f(y)}l-3.2 8.6"/>` : `<circle cx="${f(x)}" cy="${f(y)}" r="5" class="ab-dot"/>`;
      return `${arrowOut}<text x="${f(lx)}" y="${f(ly)}" class="ab-tl" text-anchor="${right ? "start" : "end"}">${esc(r.town)}<tspan class="ab-tk" x="${f(lx)}" dy="17">${r.km} km</tspan></text>`;
    })
    .join("");
  return `<svg class="ab-mapsvg" viewBox="0 0 500 430" role="img" aria-label="A plan of the towns we work in around our Erode office">
  <defs><pattern id="ab-grid" width="29" height="29" patternUnits="userSpaceOnUse"><path d="M29 0H0V29" fill="none" stroke="#12223b" stroke-opacity=".07"/></pattern></defs>
  <rect width="500" height="430" fill="url(#ab-grid)"/>
  ${rings}
  <g class="ab-north" transform="translate(462 40)"><path d="M0 -16 6 6 0 2 -6 6Z"/><text y="22" text-anchor="middle">N</text></g>
  ${towns}
  <rect x="${cx - 7}" y="${cy - 7}" width="14" height="14" class="ab-hq"/>
  <text x="${cx + 14}" y="${cy + 5}" class="ab-tl ab-tl--hq">Erode<tspan class="ab-tk" x="${cx + 14}" dy="17">Head office</tspan></text>
</svg>`;
}

export function aboutMarkup(d: AboutData) {
  const c = d.contact;
  const [hq, ...towns] = c.regions;
  const head = `<header class="pg-head ab-head">
  <div class="pg-wrap">
    <div class="ab-headgrid">
      <div class="ab-headcopy">
        <p class="pg-mark">About RPC Constructions</p>
        <h1 class="pg-h1" data-rv="words">${words("Waterproofing and construction in Erode since&nbsp;2012.")}</h1>
        <p class="pg-intro" data-rv>We keep buildings dry. RPC Constructions repairs leaks in buildings already standing and builds new homes, offices and factories with their waterproofing designed in, from our office on Perundurai Road, Erode.</p>
        <div class="pg-actions" data-rv><a class="pg-btn pg-btn--ink" href="/contact#enquiry" data-internal>Book a free site inspection${arrow}</a><a class="pg-btn pg-btn--line" href="/services" data-internal>Our services</a></div>
      </div>
      <dl class="ab-facts" data-rv>
        <div><dt>Founded</dt><dd>${esc(d.founded)}, in ${esc(hq ?? "Erode")}</dd></div>
        <div><dt>Core service</dt><dd>Waterproofing and leak repair</dd></div>
        <div><dt>Also</dt><dd>Homes, offices and factories, interiors and project management</dd></div>
        <div><dt>Working in</dt><dd>${esc(listing(c.regions))}</dd></div>
        <div><dt>Office hours</dt><dd>${esc(c.hours)}</dd></div>
      </dl>
    </div>
  </div>
</header>`;

  const who = `<section class="pg-sec ab-who" aria-labelledby="ab-who-h">
  <div class="pg-wrap">
    <div class="ab-whogrid">
      <div class="ab-whoph" data-rv>${ph({ ratio: "4/3", label: "Photo: the RPC team on site" })}</div>
      <div class="ab-whocopy">
        <p class="pg-mark">Who we are</p>
        <h2 class="pg-h2" id="ab-who-h" data-rv>An engineer‑led waterproofing company that also builds.</h2>
        ${d.story.map((p, i) => `<p class="${i === 0 ? "ab-lead" : "ab-p"}" data-rv>${esc(p)}</p>`).join("")}
      </div>
    </div>
  </div>
</section>`;

  const vm = `<section class="pg-sec pg-sec--sky ab-vm" aria-label="Vision and mission">
  <div class="pg-wrap">
    <article class="ab-vision" aria-labelledby="ab-vision-h" data-rv>
      <h2 class="ab-vh" id="ab-vision-h">Our vision</h2>
      <p class="ab-vtext">${esc(d.vision)}</p>
    </article>
    <article class="ab-mission" aria-labelledby="ab-mission-h">
      <h2 class="ab-vh" id="ab-mission-h" data-rv>Our mission</h2>
      <ul data-rv-stagger="80">${d.mission.map((m) => `<li data-rv>${tick}<span>${esc(m)}</span></li>`).join("")}</ul>
    </article>
  </div>
</section>`;

  const values = `<section class="pg-sec ab-values" aria-labelledby="ab-values-h">
  <div class="pg-wrap">
    <div class="ab-vhead">
      <p class="pg-mark">Our values</p>
      <h2 class="pg-h2" id="ab-values-h" data-rv>Six values on every site.</h2>
    </div>
    <ul class="ab-vlist" data-rv-stagger="70">${d.principles
      .map((p) => `<li data-rv>${markOf(p.title)}<div><h3 class="pg-h3">${esc(p.title)}</h3><p>${esc(p.body)}</p></div></li>`)
      .join("")}</ul>
  </div>
</section>`;

  const where = `<section class="pg-sec pg-sec--stone ab-where" aria-labelledby="ab-where-h">
  <div class="pg-wrap">
    <div class="ab-wgrid">
      <div class="ab-wcopy">
        <p class="pg-mark">Where we work</p>
        <h2 class="pg-h2" id="ab-where-h">Waterproofing contractors in ${esc(listing(c.regions))}.</h2>
        <p class="ab-p">Our office and site teams are in ${esc(hq ?? "Erode")}. From there we inspect, repair and build across ${esc(listing(towns))}, and the engineer who first visits your building stays with the job until it is tested and handed over.</p>
        <table class="ab-reach">
          <caption class="pg-vh">Where we work, and how far each town is from our office</caption>
          <thead><tr><th scope="col">Town</th><th scope="col">From our office</th><th scope="col">Visits</th></tr></thead>
          <tbody>${REACH.filter((r) => c.regions.includes(r.town))
            .map((r) => `<tr><th scope="row">${esc(r.town)}</th><td>${r.km ? `${r.km} km` : "Head office"}</td><td>${r.km ? "Site visits" : esc(c.address.split(",").slice(0, 2).join(","))}</td></tr>`)
            .join("")}</tbody>
        </table>
        <p class="ab-wnote">Distances are in a straight line from our office in ${esc(hq ?? "Erode")}.</p>
      </div>
      <figure class="ab-map">${reachMap(c.regions)}<figcaption>Our office in ${esc(hq ?? "Erode")}, with rings at 50 and 100 km. Chennai is further north-east, off the edge of the map.</figcaption></figure>
    </div>
    <p class="ab-svc">What we do there: ${d.services.map((s) => `<a href="/services" data-internal>${esc(s.title)}</a>`).join(", ")}.</p>
  </div>
</section>`;

  return `${head}\n${who}\n${vm}\n${values}\n${where}\n${ctaBand(c, {
    title: "Let’s keep your building dry.",
    steps: [
      ["Tell us what you’re seeing", "A damp patch, a dripping ceiling or a building still on paper."],
      ["Meet an engineer on site", "The first inspection is free, anywhere around Erode and Coimbatore."],
      ["Decide in your own time", "With the cause, the method and the price in front of you."],
    ],
  })}`;
}

export const ABOUT_CSS = `
/* the opening: the h1 and its intro, and the company's facts beside them */
.ab-headgrid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:2rem clamp(2rem,5vw,6rem);align-items:end}
.ab-headcopy .pg-mark{margin-bottom:.9rem}
.ab-facts{margin:0;padding:clamp(1.2rem,2vw,1.8rem) clamp(1.3rem,2.2vw,2rem);border-radius:8px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
.ab-facts div{display:grid;grid-template-columns:8.5rem minmax(0,1fr);gap:.4rem 1rem;padding:.8rem 0;border-top:1px solid var(--line)}
.ab-facts div:first-child{border-top:0;padding-top:.2rem}
.ab-facts div:last-child{padding-bottom:.2rem}
.ab-facts dt{font-size:var(--fs-body);color:var(--mute)}
.ab-facts dd{margin:0;font-size:var(--fs-body);font-weight:600;line-height:1.45}

/* who we are */
.ab-whogrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:clamp(2rem,5vw,6rem);align-items:center}
.ab-whocopy .pg-h2{margin-top:.7rem}
.ab-lead{margin:1.4rem 0 0;max-width:40rem;font-size:var(--fs-sub);line-height:1.55;color:var(--ink)}
.ab-p{margin:1rem 0 0;max-width:40rem;font-size:var(--fs-body);line-height:1.7;color:var(--ink2)}

/* vision and mission: the vision across the panel, the mission's four promises under it */
.ab-vh{margin:0;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.ab-vtext{margin:.9rem 0 0;max-width:30ch;font-family:var(--display);font-weight:600;font-size:var(--fs-title);line-height:1.16;letter-spacing:-.02em;text-wrap:balance}
.ab-mission{margin-top:clamp(2.4rem,6vh,3.6rem);padding-top:clamp(1.4rem,3vh,2rem);border-top:1px solid rgba(39,86,160,.22)}
.ab-mission ul{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem clamp(1rem,2vw,2rem);margin:1.2rem 0 0;padding:0;list-style:none}
.ab-mission li{display:flex;flex-direction:column;gap:.5rem;padding-top:1rem;border-top:2px solid var(--navy);font-size:var(--fs-body);line-height:1.55}
.ab-mission .pg-tick{display:none}

/* values */
.ab-vhead{margin-bottom:clamp(1.8rem,4vh,2.6rem)}
.ab-vhead .pg-h2{margin-top:.7rem}
.ab-vlist{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0 clamp(1.4rem,3vw,3rem);margin:0;padding:0;list-style:none}
.ab-vlist li{display:block;padding:1.3rem 0;border-top:1px solid var(--line)}
.ab-mk{display:none}
.ab-vlist p{margin:.4rem 0 0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}

/* where we work: the towns as a table, and a plan of them around the office */
.ab-wgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:2.4rem clamp(2rem,5vw,6rem);align-items:start}
.ab-wgrid .pg-h2{margin-top:.7rem}
.ab-reach{width:100%;margin-top:2rem;border-collapse:collapse;font-size:var(--fs-body)}
.ab-reach th,.ab-reach td{padding:.85rem 0;border-bottom:1px solid var(--line);text-align:left;vertical-align:baseline}
.ab-reach thead th{padding-top:0;border-bottom:1px solid rgba(18,34,59,.32);font-weight:500;color:var(--mute)}
.ab-reach tbody th{font-family:var(--display);font-size:var(--fs-sub);font-weight:600;letter-spacing:-.01em}
.ab-reach td{color:var(--ink2)}
.ab-reach td:nth-child(2){font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink)}
.ab-wnote{margin:.8rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.ab-map{margin:0;padding:clamp(.8rem,1.6vw,1.2rem);border-radius:8px;background:var(--card);box-shadow:0 0 0 1px var(--line)}
.ab-mapsvg{display:block;width:100%;height:auto}
.ab-map figcaption{margin-top:.6rem;font-size:var(--fs-body);line-height:1.5;color:var(--mute)}
.ab-ring{fill:none;stroke:#2756a0;stroke-opacity:.45;stroke-dasharray:4 5}
.ab-rl{font-family:var(--sans);font-size:12px;fill:#2756a0;fill-opacity:.8}
.ab-north path{fill:#12223b}
.ab-north text{font-family:var(--sans);font-size:12px;font-weight:700;fill:#12223b}
.ab-dot{fill:#0b2350;stroke:#f5f0e6;stroke-width:2}
.ab-hq{fill:#2756a0;stroke:#f5f0e6;stroke-width:2.5}
.ab-far{stroke:#0b2350;stroke-width:1.5;stroke-dasharray:2 4;fill:none}
.ab-fara{stroke:#0b2350;stroke-width:1.8;fill:none;stroke-linecap:round}
.ab-tl{font-family:var(--display);font-size:16px;font-weight:600;fill:#12223b}
.ab-tl--hq{fill:#2756a0}
.ab-tk{font-family:var(--sans);font-size:12.5px;font-weight:500;fill:#5b6271}
.ab-svc{margin:clamp(2.4rem,6vh,3.6rem) 0 0;padding-top:1.3rem;border-top:1px solid var(--line);font-size:var(--fs-body);line-height:1.7;color:var(--mute)}
.ab-svc a{color:var(--ink);font-weight:600;text-decoration:none;border-bottom:1px solid rgba(18,34,59,.25)}
.ab-svc a:hover{border-color:var(--ink)}

@media (max-width:1023px){
  .ab-headgrid,.ab-whogrid,.ab-wgrid{grid-template-columns:1fr;align-items:start}
  .ab-vlist{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ab-mission ul{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:767px){
  .ab-mission ul{grid-template-columns:1fr}
  .ab-vlist{grid-template-columns:1fr}
  .ab-facts div{grid-template-columns:1fr;gap:.15rem}
}
`;
