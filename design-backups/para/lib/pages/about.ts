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

/** which way a bearing points, in words */
const toward = (deg: number) => ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][Math.round(deg / 45) % 8]!;

/**
 * Where we work: the office as a dark card, and each town as a card with its
 * straight-line distance and a small compass whose needle points the way to it
 * from Erode, nearest first.
 */
function reachMarkup(regions: readonly string[], hq: string, address: string, hours: string, maps: string) {
  const towns = REACH.filter((r) => regions.includes(r.town) && r.km).sort((x, y) => x.km - y.km);
  const card = (r: (typeof REACH)[number]) => `<li class="ab-town">
      <div class="ab-ttop">
        <h3 class="ab-tn">${esc(r.town)}</h3>
        <span class="ab-cmp" aria-hidden="true"><i>N</i><svg viewBox="0 0 40 40" style="transform:rotate(${r.deg}deg)"><path d="M20 5l5 15h-10z" fill="currentColor"/><path d="M20 35l-5-15h10z" fill="currentColor" opacity=".25"/></svg></span>
      </div>
      <p class="ab-tk"><b>${r.km}</b> km</p>
      <p class="ab-tw">${toward(r.deg).charAt(0).toUpperCase() + toward(r.deg).slice(1)} of ${esc(hq)}</p>
    </li>`;
  return `<div class="ab-reach2">
  <div class="ab-hq">
    <span class="ab-hqi" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20V9l8-5 8 5v11h-5v-6H9v6z" fill="currentColor"/></svg></span>
    <p class="ab-hqk">Head office</p>
    <h3 class="ab-hqn">${esc(hq)}</h3>
    <p class="ab-hqa">${esc(address)}</p>
    <p class="ab-hqh">${esc(hours.replace(" IST", ""))}</p>
    <a class="ab-hqgo" href="${esc(maps)}" target="_blank" rel="noopener noreferrer">Get directions<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
  </div>
  <ul class="ab-towns">${towns.map(card).join("")}</ul>
  <p class="ab-rnote">Distances are in a straight line from our office; the needle points the way to each town. We visit every site ourselves.</p>
</div>`;
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
      </div>
      <p class="ab-p">Our office and site teams are in ${esc(hq ?? "Erode")}. From there we inspect, repair and build across ${esc(listing(towns))}, and the engineer who first visits your building stays with the job until it is tested and handed over.</p>
    </div>
    ${reachMarkup(c.regions, hq ?? "Erode", c.address.split(",").slice(0, 2).join(",").trim(), c.hours, `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery)}`)}
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

/* where we work: the office as a dark card, the towns as cards with a compass each */
.ab-wgrid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:1.2rem clamp(2rem,5vw,6rem);align-items:end}
.ab-wgrid .pg-h2{margin-top:.7rem}
.ab-wgrid .ab-p{margin:0}
.ab-reach2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:clamp(.8rem,1.4vw,1.1rem);margin-top:clamp(2rem,5vh,3rem)}
.ab-hq{position:relative;display:flex;flex-direction:column;padding:clamp(1.4rem,2.4vw,2rem);border-radius:20px;background:var(--navy);color:#f5f0e6;overflow:hidden}
.ab-hq::after{content:"";position:absolute;right:-4rem;bottom:-4rem;width:14rem;height:14rem;border-radius:50%;box-shadow:0 0 0 1px rgba(245,240,230,.12),0 0 0 2.4rem rgba(245,240,230,.03),0 0 0 2.5rem rgba(245,240,230,.1),0 0 0 5rem rgba(245,240,230,.02),0 0 0 5.1rem rgba(245,240,230,.08);pointer-events:none}
.ab-hqi{display:grid;place-items:center;width:3rem;height:3rem;border-radius:14px;background:var(--accent);color:#fff}
.ab-hqi svg{width:1.45rem;height:1.45rem}
.ab-hqk{margin:1.4rem 0 0;font-size:var(--fs-body);font-weight:600;color:rgba(245,240,230,.65)}
.ab-hqn{margin:.15rem 0 0;font-family:var(--display);font-size:var(--fs-title);font-weight:600;line-height:1;letter-spacing:-.025em}
.ab-hqa{margin:.9rem 0 0;font-size:var(--fs-body);line-height:1.5}
.ab-hqh{margin:.2rem 0 0;font-size:var(--fs-body);color:rgba(245,240,230,.7)}
.ab-hqgo{position:relative;z-index:1;display:inline-flex;align-items:center;gap:.45rem;align-self:flex-start;margin-top:auto;padding:.6rem 1rem;border-radius:999px;background:#f5f0e6;font-size:var(--fs-body);font-weight:600;color:var(--navy);text-decoration:none;transition:background-color .2s}
.ab-hq .ab-hqh{margin-bottom:1.6rem}
.ab-hqgo:hover{background:#fff}
.ab-hqgo svg{width:.9rem;height:.9rem}
.ab-towns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(.8rem,1.4vw,1.1rem);margin:0;padding:0;list-style:none}
.ab-town{display:flex;flex-direction:column;padding:1.3rem 1.4rem;border-radius:20px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
.ab-ttop{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}
.ab-tn{margin:0;font-family:var(--display);font-size:var(--fs-sub);font-weight:600;line-height:1.2;letter-spacing:-.01em}
.ab-cmp{position:relative;display:grid;place-items:center;flex:none;width:3.2rem;height:3.2rem;border-radius:50%;background:#fbf8f2;box-shadow:inset 0 0 0 1px rgba(18,34,59,.16);color:var(--accent)}
.ab-cmp svg{width:2.4rem;height:2.4rem}
.ab-cmp i{position:absolute;top:-.1rem;left:50%;transform:translate(-50%,-50%);padding:0 .2rem;border-radius:4px;background:var(--card);font-size:var(--fs-body);font-style:normal;font-weight:700;line-height:1.1;color:var(--ink)}
.ab-tk{display:flex;align-items:baseline;gap:.3rem;margin:1.2rem 0 0;font-size:var(--fs-body);font-weight:600;color:var(--mute)}
.ab-tk b{font-family:var(--display);font-size:var(--fs-title);font-weight:600;line-height:1;letter-spacing:-.03em;color:var(--ink);font-variant-numeric:tabular-nums}
.ab-tw{margin:.35rem 0 0;font-size:var(--fs-body);color:var(--ink2)}
.ab-rnote{grid-column:1 / -1;margin:.2rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.ab-svc{margin:clamp(2.4rem,6vh,3.6rem) 0 0;padding-top:1.3rem;border-top:1px solid var(--line);font-size:var(--fs-body);line-height:1.7;color:var(--mute)}
.ab-svc a{color:var(--ink);font-weight:600;text-decoration:none;border-bottom:1px solid rgba(18,34,59,.25)}
.ab-svc a:hover{border-color:var(--ink)}

@media (max-width:1023px){
  .ab-headgrid,.ab-whogrid{grid-template-columns:1fr;align-items:start}
  .ab-vlist{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ab-mission ul{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:899px){
  .ab-wgrid,.ab-reach2{grid-template-columns:1fr;align-items:start}
}
@media (max-width:479px){
  .ab-towns{grid-template-columns:1fr 1fr;gap:.6rem}
  .ab-town{padding:1rem}
  .ab-cmp{width:2.6rem;height:2.6rem}
  .ab-cmp svg{width:2rem;height:2rem}
}
@media (max-width:767px){
  .ab-mission ul{grid-template-columns:1fr}
  .ab-vlist{grid-template-columns:1fr}
  .ab-facts div{grid-template-columns:1fr;gap:.15rem}
}
`;
