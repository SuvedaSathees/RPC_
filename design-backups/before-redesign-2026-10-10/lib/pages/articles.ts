/**
 * Blog. The index: the masthead headline (its words rise in), topics to
 * narrow the list, the latest article as a dark feature, then the rest as
 * cards. The article page: the title over its cover, the text at a reading
 * width beside a contents list that follows where you are, a thin line along
 * the top showing how far through it you are, and related reading.
 */
import { arrow, crumbs, ctaBand, esc, photo, shortDate, tel, words, type ContactInfo, type PageOptions } from "./kit";

export interface PostSection {
  heading?: string;
  paragraphs?: readonly string[];
  list?: readonly string[];
  tip?: string;
}
export interface PostData {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readMinutes: number;
  cover: string;
  coverAlt: string;
  author: string;
  sections: readonly PostSection[];
}

export const BLOG_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
] as const;

export const anchor = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const when = (p: PostData) => `<time datetime="${esc(p.date)}">${shortDate(p.date)}</time><span>${p.readMinutes} min read</span>`;
const bulb = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/></svg>`;

/** a post as a card (index and related reading) */
export function postCard(p: PostData, o: PageOptions, cat = false) {
  return `<li${cat ? ` data-cat="${esc(p.category)}"` : ""} data-rv><article class="bl-card"><a href="/blog/${esc(p.slug)}" data-internal>
  ${photo(p.cover, p.coverAlt, "(min-width:1024px) 30vw, (min-width:768px) 46vw, 92vw", o)}
  <div class="bl-cardcopy">
    <p class="bl-cat">${esc(p.category)}</p>
    <h3 class="bl-title">${esc(p.title)}</h3>
    <p class="bl-ex">${esc(p.excerpt)}</p>
    <p class="bl-when">${when(p)}</p>
  </div>
</a></article></li>`;
}

export function blogIndexMarkup(d: { posts: readonly PostData[]; contact: ContactInfo }, o: PageOptions = {}) {
  const [lead, ...rest] = d.posts;
  const counts = new Map<string, number>();
  for (const p of d.posts) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const topics = [["All", d.posts.length] as const, ...[...counts.entries()]]
    .map(([t, n], i) => `<button type="button" data-topic="${esc(String(t))}" aria-pressed="${i === 0}">${esc(String(t))}<span>${n}</span></button>`)
    .join("");
  const head = `<header class="pg-head bl-head">
  <div class="pg-wrap">
    ${crumbs(BLOG_TRAIL)}
    <h1 class="bl-mast" data-rv="words">${words("Waterproofing advice from our&nbsp;engineers.")}</h1>
    <div class="bl-headrow" data-rv>
      <p class="pg-intro">How leaks start, how they are fixed and what to check before the monsoon, from the engineers who inspect buildings around Erode, Coimbatore and&nbsp;Tiruppur.</p>
      <div class="bl-topics" role="group" aria-label="Show articles about">${topics}</div>
    </div>
  </div>
</header>`;
  const feature = lead
    ? `<article class="bl-feat" data-cat="${esc(lead.category)}" data-rv="rise"><a href="/blog/${esc(lead.slug)}" data-internal>
  <div class="bl-featph">${photo(lead.cover, lead.coverAlt, "(min-width:1024px) 56vw, 92vw", o, { eager: true })}</div>
  <div class="bl-featcopy">
    <p class="bl-cat"><span>Latest</span>${esc(lead.category)}</p>
    <h2 class="bl-featt">${esc(lead.title)}</h2>
    <p class="bl-ex">${esc(lead.excerpt)}</p>
    <p class="bl-when">${when(lead)}</p>
    <span class="pg-btn pg-btn--paper">Read the article${arrow}</span>
  </div>
</a></article>`
    : "";
  return `${head}
<section class="pg-sec bl-sec" aria-label="Articles">
  <div class="pg-wrap">
    ${feature}
    ${
      rest.length
        ? `<div class="bl-morehead"><h2 class="bl-moreh" data-rv>More articles</h2><p class="bl-status" data-topic-status aria-live="polite">Showing all ${d.posts.length} articles</p></div>
    <ul class="bl-grid" data-rv-stagger="100">${rest.map((p) => postCard(p, o, true)).join("")}</ul>`
        : `<p class="bl-status" data-topic-status aria-live="polite">Showing all ${d.posts.length} articles</p>`
    }
    <p class="bl-empty" hidden>No articles on that topic yet. <button type="button" data-topic="All">Show all articles</button></p>
  </div>
</section>
${ctaBand(d.contact, {
  title: "Have a leak we haven’t covered?",
  steps: [
    ["Send us a photo", "A picture of the stain, crack or damp wall on WhatsApp helps us prepare."],
    ["We call to ask a few questions", "When it leaks, what is above it and how long it has been there."],
    ["We confirm the cause on site", "Before suggesting any work, at a visit that costs you nothing."],
  ],
})}`;
}

export function postMarkup(d: { post: PostData; related: readonly PostData[]; contact: ContactInfo }, o: PageOptions = {}) {
  const p = d.post;
  const c = d.contact;
  const toc = p.sections.filter((s) => s.heading).map((s) => s.heading!);
  // the article's own opening paragraph is set as its lead (the excerpt stays on the cards)
  let lead = false;
  const para = (t: string, open: boolean) => {
    const first = open && !lead;
    if (first) lead = true;
    return `<p${first ? ' class="po-lead"' : ""}>${esc(t)}</p>`;
  };
  const body = p.sections
    .map((s) => {
      const inner = [
        s.heading ? `<h2>${esc(s.heading)}</h2>` : "",
        ...(s.paragraphs ?? []).map((t) => para(t, !s.heading)),
        s.list ? `<ul>${s.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>` : "",
        s.tip ? `<aside class="po-tip" aria-label="Tip">${bulb}<p><b>Tip</b>${esc(s.tip)}</p></aside>` : "",
      ].join("");
      return s.heading ? `<section id="${anchor(s.heading)}" data-sec>${inner}</section>` : `<div>${inner}</div>`;
    })
    .join("\n");
  const trail = [...BLOG_TRAIL, { name: p.title, href: `/blog/${p.slug}` }];
  return `<div class="po-progress" aria-hidden="true"><i></i></div>
<article class="po" aria-labelledby="po-title">
  <header class="pg-head po-head">
    <div class="pg-wrap">
      ${crumbs(trail)}
      <p class="bl-cat po-cat" data-rv>${esc(p.category)}</p>
      <h1 class="po-h1" id="po-title" data-rv="words">${words(esc(p.title))}</h1>
      <p class="po-by" data-rv><span>${esc(p.author)}</span>${when(p)}</p>
    </div>
  </header>
  <div class="pg-wrap po-main">
    <div data-rv="rise">${photo(p.cover, p.coverAlt, "(min-width:1280px) 72rem, 94vw", o, { eager: true, cls: "po-cover" })}</div>
    <div class="po-grid">
      <div class="po-body">
        ${body}
        <p class="po-note">This article is general guidance. Every site is different, so speak to a qualified engineer before making decisions about your project.</p>
      </div>
      <aside class="po-aside">
        ${
          toc.length > 1
            ? `<nav class="po-toc" aria-label="In this article"><p>In this article</p><ol>${toc.map((h) => `<li><a href="#${anchor(h)}">${esc(h)}</a></li>`).join("")}</ol></nav>`
            : ""
        }
        <div class="po-help">
          <p class="po-helph">Seeing this at home?</p>
          <p>Send us a photo on WhatsApp, or book a visit. Inspections are free.</p>
          <a class="pg-btn pg-btn--paper" href="/contact#enquiry" data-internal>Book an inspection${arrow}</a>
          <div class="po-quick"><a href="${tel(c.phone)}">Call</a><a href="${esc(c.whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp</a></div>
        </div>
      </aside>
    </div>
  </div>
</article>
${
  d.related.length
    ? `<section class="pg-sec pg-sec--stone po-related" aria-labelledby="po-rel">
  <div class="pg-wrap">
    <div class="po-relhead"><h2 class="pg-h2" id="po-rel" data-rv="words">${words("More from the blog.")}</h2><a class="pg-link" href="/blog" data-internal>All articles${arrow}</a></div>
    <ul class="bl-grid" data-rv-stagger="100">${d.related.map((r) => postCard(r, o)).join("")}</ul>
  </div>
</section>`
    : ""
}`;
}

export const BLOG_CSS = `
/* index: the masthead and topics */
.bl-head{padding-bottom:clamp(2rem,5vh,3rem);border-bottom:0}
.bl-mast{margin:clamp(1rem,2.6vh,1.8rem) 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.88;letter-spacing:-.035em;text-wrap:balance}
.bl-headrow{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:1.4rem 3rem;margin-top:clamp(1.4rem,3.6vh,2.4rem)}
.bl-headrow .pg-intro{margin:0}
.bl-topics{display:flex;flex-wrap:wrap;gap:.45rem;justify-content:flex-end}
.bl-topics button{display:inline-flex;align-items:center;gap:.5rem;height:2.5rem;padding:0 .95rem;border:0;border-radius:999px;background:transparent;box-shadow:inset 0 0 0 1px rgba(16,26,34,.16);font:inherit;font-size:var(--fs-body);font-weight:500;color:var(--ink);cursor:pointer;transition:background-color .3s,color .3s,box-shadow .3s}
.bl-topics button span{font-size:var(--fs-body);font-variant-numeric:tabular-nums;color:var(--mute);transition:color .3s}
.bl-topics button:hover{box-shadow:inset 0 0 0 1px var(--ink)}
.bl-topics button[aria-pressed=true]{background:var(--ink);box-shadow:none;color:#f3f5f6}
.bl-topics button[aria-pressed=true] span{color:rgba(243,245,246,.6)}
.bl-topics button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.bl-sec{padding-top:clamp(1rem,3vh,2rem)}

/* topic, excerpt and date, shared */
.bl-cat{display:flex;align-items:center;gap:.6rem;margin:0;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.bl-cat span{padding:.2rem .6rem;border-radius:999px;background:#dceff2;font-size:var(--fs-body);color:#0b6e80}
.bl-ex{margin:.7rem 0 0;font-size:var(--fs-body);line-height:1.6;color:var(--ink2);text-wrap:pretty}
.bl-when{display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;margin:.9rem 0 0;font-size:var(--fs-body);color:var(--mute)}

/* the latest article, as a dark feature */
.bl-feat a{--ink:#ecf2f5;--ink2:rgba(236,242,245,.76);--mute:rgba(236,242,245,.56);--accent:#4cc9d9;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);gap:clamp(1.6rem,3.4vw,3.6rem);align-items:center;padding:clamp(12px,1.3vw,20px);border-radius:28px;background:var(--night);color:var(--ink);text-decoration:none}
.bl-featph .pg-photo{border-radius:17px;background:#15293a}
.bl-featcopy{display:flex;flex-direction:column;align-items:flex-start;padding:clamp(.8rem,2vw,2rem) clamp(.4rem,1.6vw,1.8rem) clamp(.8rem,2vw,2rem) 0}
.bl-feat .bl-cat span{background:rgba(76,201,217,.16);color:#b3e5eb}
.bl-featt{margin:.8rem 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.98;letter-spacing:-.02em;text-wrap:balance}
.bl-feat .pg-btn{margin-top:1.6rem;color:#101a22}
.bl-feat a:hover .pg-ar{transform:translate(2px,-2px)}
.bl-feat a:focus-visible{outline:2px solid #0b6e80;outline-offset:4px}

/* the rest, as cards */
.bl-morehead{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.6rem 2rem;margin:clamp(3rem,8vh,5rem) 0 clamp(1.4rem,3vh,2rem);padding-top:1.2rem;border-top:1px solid var(--line)}
.bl-moreh{margin:0;font-family:var(--serif);font-weight:400;font-size:var(--fs-sub);line-height:1;letter-spacing:-.015em}
.bl-status{margin:0;font-size:var(--fs-body);color:var(--mute)}
.bl-empty{margin:0;padding:3rem 0;text-align:center;font-size:var(--fs-body);color:var(--mute)}
.bl-empty button{border:0;border-bottom:1px solid currentColor;background:none;padding:0 0 2px;font:600 var(--fs-body) var(--sans);color:var(--ink);cursor:pointer}
.bl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(1.2rem,2vw,2rem);margin:0;padding:0;list-style:none}
.bl-card{height:100%}
.bl-card a{display:flex;flex-direction:column;height:100%;padding:10px;border-radius:22px;background:#fff;box-shadow:inset 0 0 0 1px rgba(16,26,34,.07),0 30px 60px -48px rgba(16,26,34,.45);text-decoration:none;transition:box-shadow .5s,translate .5s cubic-bezier(.2,.7,.2,1)}
.bl-card a:hover{translate:0 -4px;box-shadow:inset 0 0 0 1px rgba(16,26,34,.09),0 40px 70px -46px rgba(16,26,34,.55)}
.bl-card a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.bl-card .pg-photo{border-radius:15px}
.bl-cardcopy{display:flex;flex-direction:column;flex:1;padding:1.1rem .7rem .6rem}
.bl-title{margin:.5rem 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-sub);line-height:1.06;letter-spacing:-.01em;text-wrap:balance;transition:color .3s}
.bl-card a:hover .bl-title{color:var(--accent)}
.bl-card .bl-ex{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;font-size:var(--fs-body)}
.bl-card .bl-when{margin-top:auto;padding-top:1rem}

/* reading progress, along the very top */
.po-progress{position:fixed;inset:0 0 auto;z-index:60;height:3px;pointer-events:none}
.po-progress i{position:absolute;inset:0;background:var(--accent);transform-origin:left;transform:scaleX(0)}

/* the article */
.po-head{border-bottom:0;padding-bottom:clamp(1.8rem,4vh,2.6rem)}
.po-head .pg-wrap,.po-main{max-width:calc(72rem + 2 * var(--gutter,3rem))}
.po-cat{margin-top:clamp(1.4rem,3vh,2rem)}
.po-h1{margin:.7rem 0 0;max-width:22ch;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.98;letter-spacing:-.025em;text-wrap:balance}
.po-by{display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;margin:1.2rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.po-by span:first-child{font-weight:600;color:var(--ink)}
.po-cover{border-radius:22px}
.po-grid{display:grid;grid-template-columns:minmax(0,1fr) 17rem;gap:clamp(2rem,5vw,5rem);padding:clamp(2.4rem,6vh,4rem) 0 clamp(4rem,10vh,6rem)}
.po-body{max-width:44rem;min-width:0}
.po-lead{margin:0 0 2.2rem;padding-left:1.2rem;border-left:3px solid var(--accent);font-size:var(--fs-sub);line-height:1.6;color:var(--ink)}
.po-body section,.po-body > div{scroll-margin-top:110px}
.po-body section + section,.po-body div + section{margin-top:2.8rem}
.po-body h2{margin:0;font-family:var(--serif);font-weight:400;font-size:var(--fs-sub);line-height:1.06;letter-spacing:-.015em}
.po-body p{margin:.95rem 0 0;font-size:var(--fs-body);line-height:1.78;color:var(--ink2)}
.po-body ul{margin:1.1rem 0 0;padding:0;list-style:none}
.po-body li{position:relative;margin-top:.7rem;padding-left:1.9rem;font-size:var(--fs-body);line-height:1.65;color:var(--ink2)}
.po-body li::before{content:"";position:absolute;left:0;top:.28em;width:18px;height:18px;border-radius:50%;background:rgba(11,110,128,.1) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 8.5 7 11l4.5-5' fill='none' stroke='%2327559e' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/12px no-repeat}
.po-tip{display:flex;gap:.9rem;align-items:flex-start;margin-top:1.6rem;padding:1.1rem 1.3rem;border-radius:16px;background:#e5f3f5}
.po-tip svg{flex:none;width:22px;height:22px;margin-top:.1rem;color:var(--accent)}
.po-tip p{display:flex;flex-direction:column;gap:.3rem;margin:0;font-size:var(--fs-body);line-height:1.6;color:var(--ink)}
.po-tip b{font-size:var(--fs-body);color:var(--accent)}
.po-body .po-note{margin-top:2.8rem;padding-top:1.2rem;border-top:1px solid var(--line);font-size:var(--fs-body);line-height:1.6;color:var(--mute)}
.po-aside{position:sticky;top:110px;align-self:start;display:flex;flex-direction:column;gap:1.6rem}
.po-toc p{margin:0;font-size:var(--fs-body);font-weight:600;color:var(--mute)}
.po-toc ol{margin:.8rem 0 0;padding:0;list-style:none;border-left:1px solid var(--line)}
.po-toc li{margin:0}
.po-toc a{position:relative;display:block;padding:.45rem 0 .45rem 1rem;font-size:var(--fs-body);line-height:1.4;color:var(--mute);text-decoration:none;transition:color .3s}
.po-toc a::before{content:"";position:absolute;left:-1px;top:.35rem;bottom:.35rem;width:2px;border-radius:2px;background:var(--accent);transform:scaleY(0);transition:transform .4s cubic-bezier(.2,.7,.2,1)}
.po-toc a:hover{color:var(--ink)}
.po-toc a[aria-current]{color:var(--ink);font-weight:600}
.po-toc a[aria-current]::before{transform:scaleY(1)}
.po-help{padding:1.4rem;border-radius:18px;background:var(--night);color:#ecf2f5}
.po-helph{margin:0;font-family:var(--serif);font-size:var(--fs-sub);line-height:1.05}
.po-help p:not(.po-helph){margin:.6rem 0 0;font-size:var(--fs-body);line-height:1.55;color:rgba(236,242,245,.7)}
.po-help .pg-btn{width:100%;margin-top:1.1rem;height:2.9rem}
.po-quick{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-top:.5rem}
.po-quick a{display:grid;place-items:center;height:2.6rem;border-radius:999px;background:rgba(236,242,245,.1);font-size:var(--fs-body);font-weight:500;color:#ecf2f5;text-decoration:none}
.po-quick a:hover{background:rgba(236,242,245,.18)}
.po-relhead{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:1rem 2rem;margin-bottom:clamp(2rem,5vh,3rem)}
.po-relhead .pg-h2{margin:0}
.po-related .bl-card a{background:#fbfcfd}

@media (max-width:1023px){
  .bl-headrow{grid-template-columns:1fr}
  .bl-topics{justify-content:flex-start}
  .bl-feat a{grid-template-columns:1fr;align-items:start}
  .bl-featcopy{padding:.4rem .8rem 1rem}
  .bl-grid{grid-template-columns:1fr 1fr}
  .po-grid{grid-template-columns:1fr}
  .po-aside{position:static;order:2}
  .po-toc{display:none}
}
@media (max-width:767px){
  .po-head .pg-crumbs li:last-child{display:none}
  .bl-mast{font-size:var(--fs-title)}
  .bl-topics{flex-wrap:nowrap;overflow-x:auto;margin:0 calc(-1 * var(--gutter,16px));padding:0 var(--gutter,16px) 2px;scrollbar-width:none}
  .bl-topics::-webkit-scrollbar{display:none}
  .bl-topics button{flex:none}
  .bl-feat a{padding:10px;border-radius:22px}
  .bl-featph .pg-photo{border-radius:14px}
  .bl-featt{font-size:var(--fs-title)}
  .bl-feat .pg-btn{width:100%}
  .bl-grid{grid-template-columns:1fr}
  .bl-card a:hover{translate:none}
  .po-h1{font-size:var(--fs-title)}
  .po-cover{border-radius:14px}
  .po-lead{margin-bottom:1.6rem}
}
`;
