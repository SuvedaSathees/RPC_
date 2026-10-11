/**
 * Contact page, on one screen and without the footer, on the pale blue. On the
 * left: the title, the number to call on a card of its own with whether the
 * office is open right now, then WhatsApp, email and the office as a short
 * list with their drawings, and the towns where we inspect sites. On the
 * right: the enquiry form, with the kind of project picked from a row of
 * buttons, and what happens after it is sent. A waterline runs along the foot
 * of the page. The form sends through FormSubmit, as before (contact-form.ts).
 */
import { arrow, esc, listing, mapsLink, tel, words, type ContactInfo } from "./kit";

export interface ContactPageData {
  contact: ContactInfo;
  types: readonly string[];
}

export const CONTACT_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "/contact" },
] as const;

export const BUDGETS = ["Under ₹50 L", "₹50 L – ₹2 Cr", "₹2 Cr – ₹10 Cr", "₹10 Cr +", "Not sure yet"] as const;

/** the project types as their buttons show them (the enquiry still carries the full service name) */
const TYPE_LABEL: Record<string, string> = {
  "Residential Construction": "Residential",
  "Commercial Construction": "Commercial",
  "Industrial Construction": "Industrial",
  "Renovation & Leak Repair": "Renovation & leak repair",
  "Project Management": "Project management",
};

/** drawings for the ways to reach us (the same hand as the home page's) */
const ICON: Record<string, string> = {
  call: `<path d="M6.6 3.8h2.6l1.4 3.7-1.9 1.2a10.6 10.6 0 0 0 5.6 5.6l1.2-1.9 3.7 1.4v2.6a1.6 1.6 0 0 1-1.7 1.6A15 15 0 0 1 5 5.5a1.6 1.6 0 0 1 1.6-1.7z"/>`,
  whatsapp: `<path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6z"/><path d="M8.6 11.6h.01M12 11.6h.01M15.4 11.6h.01" stroke-width="2.4"/>`,
  email: `<rect x="3.5" y="5.5" width="17" height="13" rx="2.6"/><path d="m4.6 7.2 7.4 5.6 7.4-5.6"/>`,
  visit: `<path d="M12 20.6s-6.4-5.5-6.4-10.8a6.4 6.4 0 0 1 12.8 0c0 5.3-6.4 10.8-6.4 10.8z"/><circle cx="12" cy="9.9" r="2.3"/>`,
};
const icon = (k: string, cls = "") =>
  `<span class="ct-ico${cls}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICON[k] ?? ""}</svg></span>`;

function form(d: ContactPageData) {
  const c = d.contact;
  const opts = (xs: readonly string[], sel?: string) => xs.map((x) => `<option${x === sel ? " selected" : ""}>${esc(x)}</option>`).join("");
  const field = (label: string, control: string, cls: string) => `<label class="ct-field ${cls}"><span>${label}</span>${control}</label>`;
  const types = d.types
    .map(
      (t, i) =>
        `<label class="ct-chip"><input type="radio" name="type" value="${esc(t)}"${i === 0 ? " checked" : ""}><span>${esc(TYPE_LABEL[t] ?? t)}</span></label>`,
    )
    .join("");
  return `<form class="ct-form" data-enquiry data-endpoint="https://formsubmit.co/ajax/${esc(c.email)}" data-whatsapp="${esc(c.whatsapp)}">
  <input type="text" name="_honey" tabindex="-1" autocomplete="off" class="ct-trap" aria-hidden="true">
  <fieldset class="ct-types">
    <legend>What kind of project?</legend>
    <div class="ct-chips">${types}</div>
  </fieldset>
  <div class="ct-row">
    ${field("Full name *", `<input required name="name" autocomplete="name" placeholder="Your name">`, "ct-f")}
    ${field("Phone *", `<input required type="tel" name="phone" autocomplete="tel" inputmode="tel" pattern="[0-9+\\s\\-]{8,}" placeholder="+91 98765 43210">`, "ct-f")}
    ${field("Email *", `<input required type="email" name="email" autocomplete="email" placeholder="you@example.com">`, "ct-f")}
    ${field("Estimated budget", `<select name="budget">${opts(BUDGETS, "Not sure yet")}</select>`, "ct-f")}
    ${field("Site location *", `<input required name="location" placeholder="e.g. Perundurai Road, Erode">`, "ct-f ct-wide")}
    ${field("About your project", `<textarea name="message" rows="3" placeholder="Plot size, floors, approvals, or where the leak is…"></textarea>`, "ct-full")}
  </div>
  <p class="ct-alert" role="alert" hidden>We couldn’t send that just now. Please try again, send it on WhatsApp, or call <a href="${tel(c.phone)}">${esc(c.phone)}</a>.</p>
  <div class="ct-send">
    <button type="submit" class="pg-cbtn pg-cbtn--ink" data-send><span data-label>Send enquiry</span><i aria-hidden="true">${arrow}</i></button>
    <button type="button" class="ct-wa" data-wa>${icon("whatsapp", " ct-ico--wa")}Send on WhatsApp</button>
    <p class="ct-note">Your details are only used to answer this enquiry.</p>
  </div>
</form>
<div class="ct-done" role="status" tabindex="-1" hidden>
  <span class="ct-tick" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
  <p class="ct-doneh">Thank you<span data-name></span>.</p>
  <p>Your enquiry has reached our office. An engineer will call you within one working day. For anything urgent, call <a href="${tel(c.phone)}">${esc(c.phone)}</a>.</p>
  <button type="button" class="pg-link" data-again>Send another enquiry</button>
</div>`;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/** "Mon – Sat · 08:30 – 18:30 IST" → the opening days and times */
export function openingHours(h: string) {
  const t = h.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  const d = h.match(/(Sun|Mon|Tue|Wed|Thu|Fri|Sat)[a-z]*\s*[–-]\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat)/);
  const day = (s?: string) => DAYS.findIndex((x) => x.startsWith(s ?? "~"));
  return {
    from: t ? `${t[1]!.padStart(2, "0")}:${t[2]}` : "08:30",
    to: t ? `${t[3]!.padStart(2, "0")}:${t[4]}` : "18:30",
    d0: d ? Math.max(0, day(d[1])) : 1,
    d1: d ? Math.max(0, day(d[2])) : 6,
  };
}
/** "18:30" → "6:30 pm" */
export const clock = (hm: string) => {
  const [h = 0, m = 0] = hm.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
};

export function contactPageMarkup(d: ContactPageData) {
  const c = d.contact;
  const o = openingHours(c.hours);
  const hoursText = `${DAYS[o.d0]} to ${DAYS[o.d1]}, ${clock(o.from)} to ${clock(o.to)}`;
  const street = c.address.split(",").slice(0, 2).join(",");
  const ways = [
    { k: "whatsapp", label: "WhatsApp", v: "<span>Chat with an engineer</span>", href: c.whatsapp, ext: true },
    { k: "email", label: "Email", v: `<span>${esc(c.email).replace("@", "<wbr>@")}</span>`, href: `mailto:${c.email}` },
    { k: "visit", label: "Office", v: `<span>${esc(street)}</span><small>${esc(hoursText)}</small>`, href: mapsLink(c.mapQuery), ext: true },
  ]
    .map(
      (w) =>
        `<li><a class="ct-way" href="${esc(w.href)}"${w.ext ? ` target="_blank" rel="noopener noreferrer"` : ""}>${icon(w.k, w.k === "whatsapp" ? " ct-ico--wa" : "")}<span class="ct-wk">${w.label}</span><span class="ct-wv">${w.v}</span>${arrow}</a></li>`,
    )
    .join("");
  const steps = [
    "We call you back within one working day.",
    "An engineer inspects the site; the first visit is free.",
    "You get the cause, the method and the price.",
  ]
    .map((s, i) => `<li><b>${i + 1}</b><span>${s}</span></li>`)
    .join("");
  return `<section class="pg-dark ct-page" aria-labelledby="ct-title">
  <div class="pg-wrap ct-grid">
    <div class="ct-info">
      <p class="pg-mark ct-mark">Contact</p>
      <h1 class="ct-h1" id="ct-title" data-rv="words">${words("Contact RPC Constructions.")}</h1>
      <p class="ct-lede" data-rv>A leak to stop, a building to plan, or both? An engineer takes it from there.</p>
      <a class="ct-call" href="${tel(c.phone)}" data-rv>
        <span class="ct-callk">${icon("call", " ct-ico--call")}Call an engineer</span>
        <span class="ct-callv">${esc(c.phone)}</span>
        <span class="ct-callfoot">
          <span class="ct-open" data-hours data-days="${o.d0}-${o.d1}" data-from="${o.from}" data-to="${o.to}"><i aria-hidden="true"></i><span data-open-text>Open ${hoursText}</span></span>
          <span class="ct-go" aria-hidden="true">${arrow}${arrow}</span>
        </span>
      </a>
      <ul class="ct-ways" data-rv>${ways}</ul>
      <div class="ct-areas" data-rv>
        <p>We inspect sites in and around</p>
        <ul aria-label="${esc(listing(c.regions))}">${c.regions.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      </div>
    </div>
    <div class="ct-card" id="enquiry" data-rv="right">
      <h2 class="ct-cardh">Tell us about your project.</h2>
      <p class="ct-sub">Takes under a minute. Fields marked * are needed.</p>
      ${form(d)}
      <div class="ct-next">
        <p>What happens next</p>
        <ol>${steps}</ol>
      </div>
    </div>
  </div>
  <svg class="ct-water" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M0 30C180 16 360 14 540 24s360 20 540 12 270-20 360-14V60H0Z" fill="rgba(39,86,160,.08)"/>
    <path d="M0 40c200-12 380-12 560-3s340 14 520 6 260-14 360-9V60H0Z" fill="rgba(11,110,128,.1)"/>
  </svg>
</section>`;
}

export const CONTACT_CSS = `
/* one screen on the pale blue: the ways to reach us beside the form, a waterline along the foot */
.ct-page{position:relative;display:flex;align-items:center;min-height:100svh;padding:calc(var(--nav-room) + clamp(1.1rem,3.2vh,2.2rem)) 0 clamp(1.8rem,4.4vh,3rem);overflow:hidden}
.ct-water{position:absolute;left:0;right:0;bottom:0;width:100%;height:clamp(30px,6vh,56px);pointer-events:none}
.ct-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);gap:2.4rem clamp(2rem,5vw,5.5rem);align-items:center;width:100%}
.ct-info{min-width:0}
.ct-mark{margin:0}
.ct-h1{margin:.6rem 0 0;font-family:var(--display);font-weight:500;font-size:var(--fs-title);line-height:1.12;letter-spacing:-.02em;text-wrap:balance}
.ct-lede{margin:clamp(.7rem,1.8vh,1.1rem) 0 0;max-width:31rem;font-size:var(--fs-sub);line-height:1.55;color:var(--mute);text-wrap:pretty}

/* the number to call, on a card of its own */
.ct-call{position:relative;display:flex;flex-direction:column;margin:clamp(1.2rem,3.2vh,2rem) 0 0;padding:clamp(.9rem,1.9vh,1.2rem) clamp(1rem,1.6vw,1.35rem);border-radius:18px;background:var(--card);box-shadow:inset 0 0 0 1px rgba(39,86,160,.14),0 26px 50px -38px rgba(18,34,59,.55);color:var(--ink);text-decoration:none;transition:box-shadow .35s,translate .35s cubic-bezier(.2,.7,.2,1)}
.ct-call:hover{translate:0 -2px;box-shadow:inset 0 0 0 1px rgba(39,86,160,.26),0 30px 56px -36px rgba(18,34,59,.6)}
.ct-call:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.ct-callk{display:flex;align-items:center;gap:.75rem;font-size:var(--fs-body);font-weight:600;color:var(--accent)}
.ct-callk .ct-ico{width:2.4rem;height:2.4rem;border-radius:10px}
.ct-callv{margin-top:clamp(.45rem,1.1vh,.7rem);font-family:var(--display);font-weight:500;font-size:var(--fs-title);line-height:1.1;letter-spacing:-.02em;white-space:nowrap}
.ct-callfoot{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:clamp(.7rem,1.6vh,1rem);padding-top:clamp(.65rem,1.4vh,.85rem);border-top:1px solid var(--line)}
.ct-go{position:relative;display:block;flex:none;width:2.6rem;height:2.6rem;overflow:hidden;border-radius:10px;background:var(--navy);color:#f5f0e6;transition:background-color .35s,color .35s}
.ct-go .pg-ar{position:absolute;inset:0;margin:auto;width:16px;height:16px;transition:transform .5s cubic-bezier(.2,.7,.2,1)}
.ct-go .pg-ar + .pg-ar{transform:translate(-210%,210%)}
.ct-call:hover .ct-go,.ct-call:focus-visible .ct-go{background:#4cc9d9;color:var(--navy)}
.ct-call:hover .ct-go .pg-ar,.ct-call:focus-visible .ct-go .pg-ar{transform:translate(210%,-210%)}
.ct-call:hover .ct-go .pg-ar + .pg-ar,.ct-call:focus-visible .ct-go .pg-ar + .pg-ar{transform:none}
.ct-open{display:flex;align-items:center;gap:.6rem;min-width:0;font-size:var(--fs-body);font-weight:500;color:var(--ink2)}
.ct-open i{position:relative;flex:none;width:8px;height:8px;border-radius:50%;background:var(--mute)}
.ct-open[data-state=open] i{background:#45c486}
.ct-open[data-state=open] i::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:1px solid #45c486;animation:ctPulse 2.4s ease-out infinite}
.ct-open[data-state=closed] i{background:#e0a93a}
@keyframes ctPulse{from{opacity:.9;transform:scale(.6)}to{opacity:0;transform:scale(1.9)}}

/* drawings */
.ct-ico{display:grid;place-items:center;flex:none;width:2.6rem;height:2.6rem;border-radius:12px;background:rgba(39,86,160,.12);color:var(--accent)}
.ct-ico svg{width:52%;height:52%}
.ct-ico--call{background:var(--navy);color:#4cc9d9}
.ct-ico--wa{background:rgba(37,211,102,.16);color:#128c4b}

/* WhatsApp, email and the office: a short list */
.ct-ways{margin:clamp(.9rem,2.2vh,1.3rem) 0 0;padding:0;list-style:none}
.ct-ways li + li{border-top:1px solid rgba(39,86,160,.18)}
.ct-way{position:relative;display:grid;grid-template-columns:auto 5.2rem minmax(0,1fr) auto;align-items:center;gap:.9rem;padding:clamp(.45rem,1.1vh,.7rem) .4rem;border-radius:12px;color:var(--ink);text-decoration:none;transition:background-color .3s}
.ct-way:hover{background:rgba(245,240,230,.6)}
.ct-way:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.ct-wk{font-size:var(--fs-body);color:var(--mute)}
.ct-wv{display:flex;flex-direction:column;font-size:var(--fs-body);font-weight:600;line-height:1.35}
.ct-wv small{font-size:var(--fs-body);font-weight:400;color:var(--mute)}
.ct-way > .pg-ar{color:var(--mute)}
.ct-way:hover > .pg-ar{color:var(--ink);transform:translate(2px,-2px)}

/* the towns */
.ct-areas{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .8rem;margin:clamp(.9rem,2.2vh,1.3rem) 0 0}
.ct-areas p{margin:0;font-size:var(--fs-body);color:var(--mute)}
.ct-areas ul{display:flex;flex-wrap:wrap;gap:.4rem;margin:0;padding:0;list-style:none}
.ct-areas li{display:inline-flex;align-items:center;height:1.9rem;padding:0 .7rem;border-radius:8px;background:rgba(245,240,230,.7);box-shadow:inset 0 0 0 1px rgba(39,86,160,.14);font-size:var(--fs-body);font-weight:500;color:var(--ink2)}

/* the enquiry form, on a sand card */
.ct-card{scroll-margin-top:calc(var(--nav-bar,80px) + 1rem);padding:clamp(1.3rem,2vw,1.75rem);border-radius:22px;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px rgba(39,86,160,.14),0 40px 80px -56px rgba(18,34,59,.55)}
.ct-cardh{margin:0;font-family:var(--display);font-weight:500;font-size:var(--fs-sub);line-height:1.2;letter-spacing:-.01em}
.ct-sub{margin:.4rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.ct-form{display:flex;flex-direction:column;gap:clamp(.8rem,1.8vh,1rem);margin-top:clamp(.9rem,2vh,1.2rem)}
.ct-trap{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);opacity:0;pointer-events:none}
/* the kind of project: a row of buttons, one chosen */
.ct-types{min-width:0;margin:0;padding:0;border:0}
.ct-types legend{margin:0 0 .45rem;padding:0;font-size:var(--fs-body);font-weight:500;color:var(--ink2)}
.ct-chips{display:flex;flex-wrap:wrap;gap:.45rem}
.ct-chip{position:relative;display:inline-flex}
.ct-chip input{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}
.pg .ct-chip input:focus-visible{outline:none}
.ct-chip span{display:inline-flex;align-items:center;gap:.45rem;height:2.4rem;padding:0 .9rem;border-radius:9px;background:var(--sand);box-shadow:inset 0 0 0 1px rgba(18,34,59,.16);font-size:var(--fs-body);font-weight:500;color:var(--ink);white-space:nowrap;transition:background-color .25s,color .25s,box-shadow .25s}
.ct-chip:hover span{box-shadow:inset 0 0 0 1px rgba(18,34,59,.42)}
.ct-chip input:checked + span{background:var(--navy);color:#f5f0e6;box-shadow:none}
.ct-chip input:checked + span::before{content:"";width:7px;height:7px;border-radius:50%;background:#4cc9d9}
.ct-chip input:focus-visible + span{outline:2px solid var(--accent);outline-offset:2px}
.ct-row{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.75rem .8rem}
.ct-f{grid-column:span 2}
.ct-wide{grid-column:span 4}
.ct-full{grid-column:1/-1}
.ct-field{display:flex;flex-direction:column;gap:.35rem;min-width:0}
.ct-field > span{font-size:var(--fs-body);font-weight:500;color:var(--ink2)}
.ct-field input,.ct-field select,.ct-field textarea{width:100%;min-width:0;border:1px solid rgba(18,34,59,.16);border-radius:10px;background:var(--sand);font:inherit;font-size:var(--fs-body);color:var(--ink);outline:none;transition:border-color .25s,box-shadow .25s}
.ct-field input,.ct-field select{height:2.75rem;padding:0 .85rem}
.ct-field select{appearance:none;padding-right:2.3rem;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23121314' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .75rem center;background-size:14px}
.ct-field textarea{padding:.7rem .85rem;resize:vertical;min-height:4.3rem;line-height:1.5}
.ct-field textarea[rows]{height:4.3rem}
.ct-field input::placeholder,.ct-field textarea::placeholder{color:rgba(18,34,59,.42)}
.ct-field input:focus,.ct-field select:focus,.ct-field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 4px rgba(39,86,160,.14)}
.ct-alert{margin:0;padding:.75rem .95rem;border-radius:11px;background:#fdf0ef;font-size:var(--fs-body);line-height:1.5;color:#8a2a22}
.ct-send{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem}
.ct-send [data-send]{padding-left:1.3rem}
.ct-send [data-send]:disabled{opacity:.6;cursor:progress}
.ct-wa{display:inline-flex;align-items:center;gap:.6rem;height:3rem;padding:0 1.1rem 0 .3rem;border:0;border-radius:10px;background:rgba(37,211,102,.1);box-shadow:inset 0 0 0 1px rgba(18,140,75,.35);font:inherit;font-size:var(--fs-body);font-weight:600;color:#128c4b;cursor:pointer;transition:background-color .3s,color .3s,box-shadow .3s}
.ct-wa .ct-ico{width:2.4rem;height:2.4rem;border-radius:8px;background:rgba(37,211,102,.18)}
.ct-wa:hover{background:#25d366;box-shadow:none;color:#fff}
.ct-wa:hover .ct-ico{background:rgba(255,255,255,.22);color:#fff}
.ct-note{flex:1 1 11rem;margin:0 0 0 .4rem;font-size:var(--fs-body);line-height:1.4;color:var(--mute)}
/* what happens next */
.ct-next{margin-top:clamp(.9rem,2vh,1.2rem);padding-top:clamp(.8rem,1.8vh,1rem);border-top:1px solid var(--line)}
.ct-next p{margin:0;font-size:var(--fs-body);font-weight:600}
.ct-next ol{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem;margin:.55rem 0 0;padding:0;list-style:none}
.ct-next li{display:flex;align-items:flex-start;gap:.6rem;font-size:var(--fs-body);line-height:1.4;color:var(--ink2)}
.ct-next b{display:grid;place-items:center;flex:none;width:1.6rem;height:1.6rem;border-radius:7px;background:rgba(11,110,128,.12);font-size:var(--fs-body);font-weight:600;color:var(--water)}
/* sent */
.ct-done{padding:1.4rem 0 .4rem;outline:none}
.ct-tick{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#2f9e6b;color:#fff}
.ct-tick svg{width:20px;height:20px}
.ct-doneh{margin:1.1rem 0 0;font-family:var(--display);font-weight:500;font-size:var(--fs-sub);line-height:1.2}
.ct-done p:not(.ct-doneh){max-width:28rem;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.ct-done button{border:0;border-bottom:1px solid currentColor;background:none;padding:0 0 3px;font:inherit;font-size:var(--fs-body);font-weight:600;cursor:pointer}

/* short laptop screens: a little tighter so it all stays on one screen */
@media (min-width:1024px) and (max-height:820px){
  .ct-card{padding:1.2rem 1.5rem}
  .ct-form{gap:.7rem;margin-top:.8rem}
  .ct-row{gap:.55rem .75rem}
  .ct-chip span{height:2.2rem}
  .ct-field input,.ct-field select{height:2.5rem}
  .ct-field textarea{min-height:3.4rem}
  .ct-field textarea[rows]{height:3.4rem}
  .ct-send .pg-cbtn,.ct-wa{height:2.8rem}
  .ct-next{margin-top:.8rem;padding-top:.7rem}
}
/* small laptops: two fields to a row, and each way to reach us with its label above */
@media (max-width:1279px){
  .ct-f{grid-column:span 3}
  .ct-wide{grid-column:1/-1}
  .ct-way{grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"ico k ar" "ico v ar";row-gap:.1rem;column-gap:.8rem}
  .ct-way > .ct-ico{grid-area:ico}
  .ct-wk{grid-area:k}
  .ct-wv{grid-area:v}
  .ct-way > .pg-ar{grid-area:ar}
}
@media (max-width:1023px){
  .ct-page{display:block;min-height:0;padding-bottom:5rem}
  .ct-grid{grid-template-columns:1fr;gap:2.6rem}
  .ct-info{max-width:40rem}
}
@media (max-width:767px){
  .ct-page{padding-top:calc(var(--nav-room) + 1.6rem)}
  .ct-row{grid-template-columns:1fr}
  .ct-f,.ct-wide{grid-column:1/-1}
  .ct-card{padding:1.3rem 1.1rem;border-radius:20px}
  .ct-send > *{flex:1 1 100%}
  .ct-note{margin:0}
  .ct-next ol{grid-template-columns:1fr;gap:.55rem}
}
@media (prefers-reduced-motion:reduce){
  .ct-open i::after{animation:none}
  .ct-call{transition:none}
}
`;
