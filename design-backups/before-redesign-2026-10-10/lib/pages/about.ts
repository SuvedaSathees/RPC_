/**
 * About page. The opening: who RPC is, set large, with a strip of three
 * photographs of finished work. Then the story, the vision and the
 * commitments; the six values, each with its own drawn mark; and how we
 * waterproof, six steps from the first visit to the water test, each with a
 * still from RPC's waterproofing film and a line that fills as you read down
 * them. Everything arrives as it comes into view.
 */
import { arrow, ctaBand, esc, photo, crumbs, words, type ContactInfo, type PageOptions } from "./kit";

export interface AboutData {
  story: readonly string[];
  vision: string;
  mission: readonly string[];
  principles: readonly { title: string; body: string }[];
  process: readonly { id: string; title: string; body: string; image: string; alt: string }[];
  contact: ContactInfo;
}

export const ABOUT_TRAIL = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
] as const;

/** a simple drawn mark for each value (outline only; they draw themselves in as the card arrives) */
const MARKS: Record<string, string> = {
  Honesty: `<path d="M12 3.2 19 6v5.2c0 4.3-2.9 8-7 9.6-4.1-1.6-7-5.3-7-9.6V6z"/><path d="m8.8 12.1 2.2 2.2 4.3-4.6"/>`,
  Engineering: `<path d="M4 20 20 4v16z"/><path d="M9 20v-2M12 20v-3M15 20v-2M16.5 13.5h-3v3"/>`,
  Craftsmanship: `<rect x="2.5" y="8.5" width="19" height="7" rx="2"/><circle cx="12" cy="12" r="1.8"/><path d="M8.5 8.5v7M15.5 8.5v7"/>`,
  Materials: `<path d="M5.5 8h13l-1.3 11.1a1.8 1.8 0 0 1-1.8 1.6H8.6a1.8 1.8 0 0 1-1.8-1.6z"/><path d="M8.5 8a3.5 3.5 0 0 1 7 0"/><path d="M9 13h6"/>`,
  Respect: `<path d="M3.5 11.2 12 4l8.5 7.2"/><path d="M6 9.4V20h12V9.4"/><path d="M12 11.6c-1.7 2.1-2.5 3.3-2.5 4.3a2.5 2.5 0 0 0 5 0c0-1-.8-2.2-2.5-4.3z"/>`,
  Timing: `<circle cx="12" cy="13" r="7.6"/><path d="M12 9v4.4l2.8 1.8M9.5 2.8h5M12 2.8v2.6"/>`,
  Quality: `<circle cx="12" cy="10" r="6.2"/><path d="m9.3 10 1.9 1.9 3.6-3.8"/><path d="m8.6 15.3-1.6 5.2 5-2.2 5 2.2-1.6-5.2"/>`,
};
const mark = (t: string) =>
  `<svg class="ab-mark" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${(MARKS[t] ?? MARKS.Quality!).replace(/<(path|rect|circle)/g, '<$1 pathLength="1"')}</svg>`;
const tick = `<svg class="ab-tick" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** three photographs of finished work, each at its own proportions */
const STRIP = [
  { src: "/images/architectural-craft-detail.jpg", alt: "Stone cladding, timber and glass on a building finished by RPC Constructions" },
  { src: "/images/completed-frame.jpg", alt: "A completed multi-storey residential building by RPC Constructions" },
  { src: "/images/detail-01.jpg", alt: "Balconies with timber screens and planters on an apartment building" },
] as const;

export function aboutTopMarkup(d: AboutData, o: PageOptions = {}) {
  const head = `<header class="pg-head ab-head">
  <div class="pg-wrap">
    ${crumbs(ABOUT_TRAIL)}
    <div class="ab-headgrid">
      <h1 class="ab-h1" data-rv="words">${words("The waterproofing company that also&nbsp;builds.")}</h1>
      <div class="ab-headside" data-rv>
        <p class="pg-intro">RPC Constructions has waterproofed and built homes, offices and factories from its base in Erode since 2012, with sites across Coimbatore, Tiruppur, Salem and&nbsp;Chennai.</p>
        <div class="pg-actions"><a class="pg-btn pg-btn--ink" href="/contact" data-internal>Talk to our team${arrow}</a><a class="pg-btn pg-btn--line" href="/services" data-internal>Our services</a></div>
      </div>
    </div>
    <div class="ab-strip" data-rv-stagger="120">${STRIP.map((s, i) => `<div class="ab-shot" data-rv="rise">${photo(s.src, s.alt, i === 1 ? "(min-width:1024px) 45vw, 92vw" : "(min-width:1024px) 34vw, 92vw", o, { eager: true })}</div>`).join("")}</div>
  </div>
</header>`;
  const story = `<section class="pg-sec ab-storysec" aria-labelledby="ab-story">
  <div class="pg-wrap">
    <div class="ab-story">
      <div class="ab-storyhead"><h2 class="pg-h2" id="ab-story" data-rv="words">${words("Why every job starts with&nbsp;water.")}</h2></div>
      <div class="ab-text" data-rv-stagger="120">${d.story.map((p) => `<p data-rv>${esc(p)}</p>`).join("")}</div>
    </div>
    <figure class="ab-vision">
      <blockquote><p data-rv="words">${words(esc(d.vision))}</p></blockquote>
      <figcaption data-rv>Our vision</figcaption>
    </figure>
    <div class="ab-promise">
      <h3 class="ab-promiseh" data-rv>What we promise every client</h3>
      <ul class="ab-commit" data-rv-stagger="90">${d.mission.map((m) => `<li data-rv>${tick}<span>${esc(m)}</span></li>`).join("")}</ul>
    </div>
  </div>
</section>`;
  return `${head}\n${story}`;
}

export function aboutBottomMarkup(d: AboutData, o: PageOptions = {}) {
  const values = `<section class="pg-sec pg-sec--stone" aria-labelledby="ab-values">
  <div class="pg-wrap">
    <div class="ab-sechead">
      <h2 class="pg-h2" id="ab-values" data-rv="words">${words("Six values we work&nbsp;by.")}</h2>
      <p class="pg-lede" data-rv>Whether it is one bathroom in Erode or a factory roof in Perundurai, these decide how the work is done.</p>
    </div>
    <ul class="ab-values" data-rv-stagger="100">${d.principles
      .map((p) => `<li class="ab-val" data-rv>${mark(p.title)}<h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></li>`)
      .join("")}</ul>
  </div>
</section>`;
  const build = `<section class="pg-sec ab-build" aria-labelledby="ab-process" data-progress>
  <div class="pg-wrap">
    <div class="ab-sechead">
      <h2 class="pg-h2" id="ab-process" data-rv="words">${words("How we waterproof, from first visit to final&nbsp;test.")}</h2>
      <p class="pg-lede" data-rv>Six steps, in this order, on every job we take on, large or small.</p>
    </div>
    <div class="ab-progress" aria-hidden="true"><i></i></div>
    <ol class="ab-steps" data-rv-stagger="110">${d.process
      .map(
        (s) => `<li class="ab-step" data-rv>
        <div class="ab-stepph">${photo(s.image, s.alt, "(min-width:1024px) 30vw, (min-width:768px) 46vw, 92vw", o)}</div>
        <p class="ab-sno" aria-hidden="true">${esc(s.id)}</p>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.body)}</p>
      </li>`,
      )
      .join("")}</ol>
  </div>
</section>`;
  return `${values}\n${build}\n${ctaBand(d.contact, {
    title: "Let’s keep your building dry.",
    steps: [
      ["Tell us what you’re seeing", "A damp patch, a dripping ceiling or a building still on paper."],
      ["Meet an engineer on site", "The first inspection is free, anywhere around Erode and Coimbatore."],
      ["Decide in your own time", "With the cause, the method and the price in front of you."],
    ],
  })}`;
}

export const ABOUT_CSS = `
/* the opening, and three photographs from structure to finish */
.ab-head{padding-bottom:clamp(2.4rem,6vh,4rem);border-bottom:0}
.ab-headgrid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:1.6rem clamp(2rem,5vw,6rem);align-items:end;margin-top:clamp(1rem,2.6vh,1.8rem)}
.ab-h1{margin:0;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:.92;letter-spacing:-.03em;text-wrap:balance}
.ab-headside{padding-bottom:.4rem}
.ab-headside .pg-intro{margin-top:0}
.ab-strip{display:flex;align-items:flex-end;gap:clamp(.8rem,1.4vw,1.4rem);margin-top:clamp(2.2rem,6vh,4rem)}
.ab-shot{min-width:0}
.ab-shot .pg-photo{border-radius:18px}
/* equal heights: each frame's width follows its picture's proportions */
.ab-shot:nth-child(1){flex:747 1 0}
.ab-shot:nth-child(2){flex:1778 1 0}
.ab-shot:nth-child(3){flex:1600 1 0}
.ab-shot:nth-child(2){margin-bottom:clamp(1.4rem,4vh,3rem)}

/* the story, the vision and the commitments */
.ab-storysec{border-top:1px solid var(--line)}
.ab-story{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:2rem clamp(2rem,6vw,7rem);align-items:start}
.ab-storyhead{position:sticky;top:calc(var(--nav-room) + 1.5rem)}
.ab-storyhead .pg-h2{margin:0}
.ab-text p{margin:0 0 1.3rem;max-width:38rem;font-size:var(--fs-body);line-height:1.72;color:var(--ink2);text-wrap:pretty}
.ab-text p:first-child{font-size:var(--fs-sub);line-height:1.55;color:var(--ink)}
.ab-vision{margin:clamp(3.4rem,9vh,6rem) 0 0;padding:clamp(2.4rem,6vh,4rem) 0 0;border-top:1px solid var(--line)}
.ab-vision blockquote{margin:0}
.ab-vision p{position:relative;margin:0;max-width:24ch;font-family:var(--serif);font-weight:400;font-size:var(--fs-title);line-height:1.02;letter-spacing:-.022em;text-wrap:balance}
.ab-vision figcaption{margin-top:1.2rem;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.ab-promise{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:1.4rem clamp(2rem,6vw,7rem);margin-top:clamp(3rem,8vh,5rem);padding-top:clamp(1.6rem,4vh,2.4rem);border-top:1px solid var(--line)}
.ab-promiseh{margin:0;font-size:var(--fs-sub);font-weight:600;line-height:1.35}
.ab-commit{display:flex;flex-direction:column;gap:.85rem;margin:0;padding:0;list-style:none}
.ab-commit li{display:flex;align-items:flex-start;gap:.7rem;font-size:var(--fs-body);line-height:1.55;color:var(--ink2)}
.ab-tick{flex:none;width:20px;height:20px;margin-top:.12rem;padding:3px;border-radius:50%;background:rgba(11,110,128,.1);color:var(--accent)}

/* section heads */
.ab-sechead{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:1.2rem clamp(2rem,6vw,7rem);align-items:end;margin-bottom:clamp(2.2rem,6vh,3.6rem)}
.ab-sechead .pg-h2{margin:0}

/* the six values, each with its mark */
.ab-values{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(1rem,1.6vw,1.6rem);margin:0;padding:0;list-style:none}
.ab-val{padding:clamp(1.4rem,2.2vw,2.2rem);border-radius:22px;background:#fbfcfd;box-shadow:inset 0 0 0 1px rgba(16,26,34,.07)}
.ab-val[data-rv]{transition:opacity .9s cubic-bezier(.2,.7,.2,1),transform 1.05s cubic-bezier(.2,.75,.15,1),translate .5s cubic-bezier(.2,.7,.2,1),box-shadow .5s;transition-delay:var(--rvd,0ms),var(--rvd,0ms),0s,0s}
.ab-val:hover{translate:0 -3px;box-shadow:inset 0 0 0 1px rgba(16,26,34,.1),0 30px 60px -44px rgba(16,26,34,.45)}
.ab-mark{display:block;width:44px;height:44px;padding:10px;border-radius:14px;background:rgba(11,110,128,.09);color:var(--accent)}
.ab-mark *{stroke-dasharray:1;stroke-dashoffset:0;transition:stroke-dashoffset 1.4s cubic-bezier(.4,.1,.2,1) .25s}
.ab-val.rv-pending .ab-mark *{stroke-dashoffset:1}
.ab-val h3{margin:1.3rem 0 0;font-family:var(--serif);font-weight:400;font-size:var(--fs-sub);line-height:1;letter-spacing:-.015em}
.ab-val p{margin:.7rem 0 0;font-size:var(--fs-body);line-height:1.62;color:var(--ink2);text-wrap:pretty}

/* how we waterproof: six steps, a line filling as you read down them */
.ab-progress{position:relative;height:2px;margin-bottom:clamp(1.8rem,4vh,2.6rem);border-radius:2px;background:var(--line);overflow:hidden}
.ab-progress i{position:absolute;inset:0;background:var(--accent);transform:scaleX(var(--p,0));transform-origin:0 50%}
.ab-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(2rem,4vh,3rem) clamp(1rem,1.8vw,1.8rem);margin:0;padding:0;list-style:none}
.ab-step{min-width:0}
.ab-stepph .pg-photo{border-radius:18px}
.ab-sno{margin:1.1rem 0 0;font-family:var(--serif);font-size:var(--fs-sub);line-height:1;color:var(--accent)}
.ab-step h3{margin:.4rem 0 0;font-size:var(--fs-sub);font-weight:600;line-height:1.3}
.ab-step > p:last-child{margin:.5rem 0 0;max-width:30rem;font-size:var(--fs-body);line-height:1.62;color:var(--ink2);text-wrap:pretty}

@media (max-width:1023px){
  .ab-headgrid,.ab-sechead,.ab-story,.ab-promise{grid-template-columns:1fr;align-items:start}
  .ab-storyhead{position:static}
  .ab-values,.ab-steps{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (max-width:767px){
  .ab-h1{font-size:var(--fs-title)}
  .ab-strip{flex-wrap:wrap}
  .ab-shot:nth-child(1){flex:1 1 38%}
  .ab-shot:nth-child(3){flex:1 1 52%}
  .ab-shot:nth-child(2){order:-1;flex:1 1 100%;margin-bottom:0}
  .ab-values,.ab-steps{grid-template-columns:1fr}
  .ab-vision p{font-size:var(--fs-title)}
  .ab-val:hover{translate:none}
}
`;
