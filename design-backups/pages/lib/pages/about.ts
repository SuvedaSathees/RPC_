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

/**
 * The towns along one road through the office: those to the south-west
 * (Tiruppur, Coimbatore) on the left, those to the north-east (Salem, Chennai)
 * on the right, each a milestone set at its distance, to one scale out to
 * 100 km either side; a town further away stands past a break in the road.
 */
function routeMarkup(regions: readonly string[], hq: string, address: string) {
  const ORIGIN = 44; // where the office sits along the road, in % of its length
  const PER_KM = 0.4; // % of the road per km, out to 100 km
  const FAR = 92; // where a town beyond 100 km stands, past the break
  const towns = REACH.filter((r) => regions.includes(r.town) && r.km);
  const xOf = (r: (typeof REACH)[number]) => {
    const west = r.deg > 180;
    if (r.km > 100) return west ? 100 - FAR : FAR;
    return west ? ORIGIN - r.km * PER_KM : ORIGIN + r.km * PER_KM;
  };
  const hasFar = towns.some((r) => r.km > 100);
  const stones = towns
    .map(
      (r) => `<li class="ab-ms${r.km > 100 ? " ab-ms--far" : ""}" style="--x:${xOf(r).toFixed(1)}%">
      <span class="ab-msc">${esc(r.town)}</span>
      <span class="ab-msk"><b>${r.km}</b>km</span>
      <span class="ab-msv">${r.deg > 180 ? "South-west" : "North-east"} · site visits</span>
    </li>`,
    )
    .join("");
  // the same towns as a list, north-east first, for a phone (where the road runs down the page) and for screen readers
  const ne = towns.filter((r) => r.deg <= 180).sort((x, y) => y.km - x.km);
  const sw = towns.filter((r) => r.deg > 180).sort((x, y) => x.km - y.km);
  const item = (r: (typeof REACH)[number]) =>
    `<li class="ab-ml${r.deg > 180 ? " is-sw" : ""}"><span class="ab-mlc">${esc(r.town)}</span><span class="ab-mlk"><b>${r.km}</b> km ${r.deg > 180 ? "south-west" : "north-east"}</span></li>`;
  const list = `${ne.map(item).join("")}<li class="ab-ml ab-ml--hq"><span class="ab-mlc">${esc(hq)}</span><span class="ab-mlk">Head office, ${esc(address)}</span></li>${sw.map(item).join("")}`;
  return `<figure class="ab-route">
  <div class="ab-roadwrap" aria-hidden="true">
    <ul class="ab-stones">
      ${stones}
      <li class="ab-office" style="--x:${ORIGIN}%"><span class="ab-oi"><svg viewBox="0 0 24 24"><path d="M4 20V9l8-5 8 5v11h-5v-6H9v6z" fill="currentColor"/></svg></span><span class="ab-on">${esc(hq)}</span><span class="ab-oa">Head office</span></li>
    </ul>
    <div class="ab-road">
      ${hasFar ? `<span class="ab-break" style="--x:${(ORIGIN + 100 * PER_KM - 3.5).toFixed(1)}%"></span>` : ""}
    </div>
    <div class="ab-scale"><em class="ab-dir ab-dir--w">Towards Coimbatore</em><em class="ab-dir ab-dir--e">Towards Salem and Chennai</em><span style="--x:${ORIGIN - 50 * PER_KM}%">50 km</span><span style="--x:${ORIGIN}%">0</span><span style="--x:${ORIGIN + 50 * PER_KM}%">50 km</span></div>
  </div>
  <ol class="ab-mlist">${list}</ol>
  <figcaption>Our office is on ${esc(address)}. Distances are in a straight line from it.</figcaption>
</figure>`;
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
    ${routeMarkup(c.regions, hq ?? "Erode", c.address.split(",").slice(0, 2).join(",").trim())}
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

/* where we work: one road through the office, a milestone for each town at its distance */
.ab-wgrid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:1.2rem clamp(2rem,5vw,6rem);align-items:end}
.ab-wgrid .pg-h2{margin-top:.7rem}
.ab-wgrid .ab-p{margin:0}
.ab-route{margin:clamp(2rem,5vh,3rem) 0 0}
.ab-roadwrap{position:relative;padding:clamp(1.8rem,3.4vw,2.6rem) clamp(1rem,2.4vw,2rem) .8rem;border-radius:16px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line)}
.ab-stones{position:relative;height:8.8rem;margin:0;padding:0;list-style:none}
.ab-stones > li{position:absolute;bottom:0;left:var(--x);transform:translateX(-50%)}
/* a milestone: a rounded cap with the town's name, the distance cut in below */
.ab-ms{display:flex;flex-direction:column;align-items:center;width:8.6rem}
.ab-ms .ab-msc,.ab-ms .ab-msk{width:7.2rem;box-sizing:border-box;text-align:center}
.ab-msc{display:flex;align-items:flex-end;justify-content:center;height:3.6rem;padding:0 .4rem .5rem;border-radius:3.6rem 3.6rem 0 0;background:var(--navy);font-size:var(--fs-body);font-weight:600;line-height:1.2;color:#f5f0e6}
.ab-msk{display:flex;align-items:baseline;justify-content:center;gap:.2rem;height:4.4rem;padding-top:.7rem;border-radius:0 0 4px 4px;background:#fbf8f2;box-shadow:inset 0 0 0 1px rgba(18,34,59,.14),0 14px 20px -16px rgba(4,12,30,.6);font-size:var(--fs-body);font-weight:600;color:var(--mute)}
.ab-msk b{font-family:var(--display);font-size:var(--fs-title);font-weight:600;line-height:1;letter-spacing:-.03em;color:var(--ink);font-variant-numeric:tabular-nums}
.ab-msv{position:absolute;top:calc(100% + 2.6rem);left:50%;width:max-content;transform:translateX(-50%);font-size:var(--fs-body);color:var(--mute)}
.ab-ms--far .ab-msc{background:var(--accent)}
/* the office: a dark marker standing on the road */
.ab-office{display:flex;flex-direction:column;align-items:center;gap:.25rem;padding-bottom:.6rem}
.ab-oi{display:grid;place-items:center;width:3.4rem;height:3.4rem;border-radius:14px;background:var(--accent);box-shadow:0 0 0 6px rgba(39,86,160,.16);color:#fff}
.ab-oi svg{width:1.6rem;height:1.6rem}
.ab-on{margin-top:.5rem;font-family:var(--display);font-size:var(--fs-sub);font-weight:600;line-height:1.1;color:var(--ink)}
.ab-oa{font-size:var(--fs-body);color:var(--mute)}
/* the road */
.ab-road{position:relative;display:flex;align-items:center;justify-content:space-between;height:2.6rem;padding:0 1rem;border-radius:999px;background:linear-gradient(var(--navy),var(--navy)) padding-box;background-color:var(--navy);color:rgba(245,240,230,.75);font-size:var(--fs-body)}
.ab-road::before{content:"";position:absolute;left:1.2rem;right:1.2rem;top:50%;height:2px;margin-top:-1px;background:repeating-linear-gradient(90deg,rgba(245,240,230,.55) 0 18px,transparent 18px 34px)}
.ab-dir{position:absolute;top:.5rem;font-size:var(--fs-body);font-style:normal;font-weight:600;color:var(--ink2);white-space:nowrap}
.ab-dir--w{left:0}
.ab-dir--e{right:0}
.ab-dir--w::before{content:"← "}
.ab-dir--e::after{content:" →"}
.ab-break{position:absolute;top:-.4rem;bottom:-.4rem;left:var(--x);width:1.6rem;margin-left:-.8rem;background:var(--card);transform:skewX(-18deg);box-shadow:inset 3px 0 0 var(--navy),inset -3px 0 0 var(--navy)}
.ab-scale{position:relative;height:2.6rem;margin-top:.5rem}
.ab-scale span{position:absolute;top:0;left:var(--x);padding-top:.5rem;transform:translateX(-50%);font-size:var(--fs-body);color:var(--mute);font-variant-numeric:tabular-nums}
.ab-scale span::before{content:"";position:absolute;top:0;left:50%;width:1px;height:.35rem;background:rgba(18,34,59,.35)}
.ab-scale span:nth-of-type(2){visibility:hidden}
.ab-msv{display:none}
.ab-mlist{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.ab-route figcaption{margin-top:.8rem;font-size:var(--fs-body);line-height:1.5;color:var(--mute)}
.ab-svc{margin:clamp(2.4rem,6vh,3.6rem) 0 0;padding-top:1.3rem;border-top:1px solid var(--line);font-size:var(--fs-body);line-height:1.7;color:var(--mute)}
.ab-svc a{color:var(--ink);font-weight:600;text-decoration:none;border-bottom:1px solid rgba(18,34,59,.25)}
.ab-svc a:hover{border-color:var(--ink)}

@media (max-width:1023px){
  .ab-headgrid,.ab-whogrid{grid-template-columns:1fr;align-items:start}
  .ab-vlist{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ab-mission ul{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:899px){
  /* phones and small tablets: the road runs down the page, north-east at the top */
  .ab-wgrid{grid-template-columns:1fr;align-items:start}
  .ab-roadwrap{display:none}
  .ab-mlist{position:relative;width:auto;height:auto;overflow:visible;clip-path:none;white-space:normal;display:flex;flex-direction:column;gap:.6rem;margin:0;padding:0 0 0 2.4rem;list-style:none}
  .ab-mlist::before{content:"";position:absolute;left:.75rem;top:.6rem;bottom:.6rem;width:.9rem;border-radius:999px;background:var(--navy)}
  .ab-mlist::after{content:"";position:absolute;left:1.15rem;top:1.2rem;bottom:1.2rem;width:2px;background:repeating-linear-gradient(rgba(245,240,230,.6) 0 12px,transparent 12px 22px)}
  .ab-ml{position:relative;display:flex;align-items:baseline;justify-content:space-between;gap:1rem;padding:.9rem 1rem;border-radius:12px;background:var(--card);box-shadow:inset 0 0 0 1px var(--line),inset 4px 0 0 var(--navy)}
  .ab-ml::before{content:"";position:absolute;left:-1.95rem;top:50%;width:.7rem;height:.7rem;margin-top:-.35rem;border-radius:50%;background:#f5f0e6;box-shadow:0 0 0 3px var(--navy)}
  .ab-ml--hq{background:var(--navy);box-shadow:none;color:#f5f0e6}
  .ab-ml--hq::before{background:var(--accent);box-shadow:0 0 0 3px #f5f0e6}
  .ab-mlc{font-family:var(--display);font-size:var(--fs-sub);font-weight:600}
  .ab-mlk{font-size:var(--fs-body);color:var(--mute);text-align:right}
  .ab-mlk b{color:var(--ink);font-size:var(--fs-sub)}
  .ab-ml--hq .ab-mlk{color:rgba(245,240,230,.75)}
}
@media (max-width:767px){
  .ab-mission ul{grid-template-columns:1fr}
  .ab-vlist{grid-template-columns:1fr}
  .ab-facts div{grid-template-columns:1fr;gap:.15rem}
}
`;
