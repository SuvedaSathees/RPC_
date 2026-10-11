/**
 * Contact page, on one screen and without the footer. On night blue: the
 * title, whether the office is open right now, the number to call set large,
 * WhatsApp, email and directions, and the office address and hours; beside
 * them, the enquiry form on a white card. The form sends through FormSubmit,
 * as before (see contact-form.ts).
 */
import { arrow, crumbs, esc, listing, mapsLink, tel, words, type ContactInfo } from "./kit";

export interface ContactPageData {
  contact: ContactInfo;
  types: readonly string[];
}

export const CONTACT_TRAIL = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "/contact" },
] as const;

export const BUDGETS = ["Under ₹50 L", "₹50 L – ₹2 Cr", "₹2 Cr – ₹10 Cr", "₹10 Cr +", "Not sure yet"] as const;

function form(d: ContactPageData) {
  const c = d.contact;
  const opts = (xs: readonly string[], sel?: string) => xs.map((x) => `<option${x === sel ? " selected" : ""}>${esc(x)}</option>`).join("");
  const field = (label: string, control: string, full = false) => `<label class="ct-field${full ? " ct-full" : ""}"><span>${label}</span>${control}</label>`;
  return `<form class="ct-form" data-enquiry data-endpoint="https://formsubmit.co/ajax/${esc(c.email)}" data-whatsapp="${esc(c.whatsapp)}">
  <input type="text" name="_honey" tabindex="-1" autocomplete="off" class="ct-trap" aria-hidden="true">
  <div class="ct-row">
    ${field("What do you need?", `<select name="type">${opts(d.types, d.types[0])}</select>`)}
    ${field("Estimated budget", `<select name="budget">${opts(BUDGETS, BUDGETS[1])}</select>`)}
    ${field("Full name *", `<input required name="name" autocomplete="name" placeholder="Your name">`)}
    ${field("Phone *", `<input required type="tel" name="phone" autocomplete="tel" inputmode="tel" pattern="[0-9+\\s\\-]{8,}" placeholder="+91 98765 43210">`)}
    ${field("Email *", `<input required type="email" name="email" autocomplete="email" placeholder="you@example.com">`)}
    ${field("Site location *", `<input required name="location" placeholder="e.g. Perundurai Road, Erode">`)}
    ${field("About your project", `<textarea name="message" rows="3" placeholder="Plot size, floors, approvals, or where the leak is…"></textarea>`, true)}
  </div>
  <p class="ct-alert" role="alert" hidden>We couldn’t send that just now. Please try again, send it on WhatsApp, or call <a href="${tel(c.phone)}">${esc(c.phone)}</a>.</p>
  <div class="ct-send">
    <button type="submit" class="pg-btn pg-btn--ink" data-send><span data-label>Send enquiry</span>${arrow}</button>
    <button type="button" class="pg-btn ct-wa" data-wa>Send on WhatsApp</button>
  </div>
  <p class="ct-note">An engineer replies within one working day. Your details are only used to answer this enquiry.</p>
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
  const ways = [
    { k: "WhatsApp", v: "Chat with an engineer", href: c.whatsapp, ext: true },
    { k: "Email", v: c.email, href: `mailto:${c.email}` },
    { k: "Directions", v: "142 Perundurai Road, Erode", href: mapsLink(c.mapQuery), ext: true },
  ]
    .map(
      (w) =>
        `<li data-rv><a href="${esc(w.href)}"${w.ext ? ` target="_blank" rel="noopener noreferrer"` : ""}><span class="ct-wk">${w.k}</span><span class="ct-wv">${esc(w.v).replace("@", "<wbr>@")}</span>${arrow}</a></li>`,
    )
    .join("");
  return `<section class="pg-dark ct-page" aria-labelledby="ct-title">
  <div class="pg-wrap ct-grid">
    <div class="ct-info">
      ${crumbs(CONTACT_TRAIL)}
      <p class="pg-mark ct-mark">Contact</p>
      <h1 class="ct-h1" id="ct-title" data-rv="words">${words("Contact RPC Constructions.")}</h1>
      <p class="ct-lede" data-rv>A leak to stop, a building to plan, or both? Call, WhatsApp or send the form, and an engineer takes it from there.</p>
      <p class="ct-open" data-rv data-hours data-days="${o.d0}-${o.d1}" data-from="${o.from}" data-to="${o.to}"><i aria-hidden="true"></i><span data-open-text>Open ${hoursText}</span></p>
      <a class="ct-tel" href="${tel(c.phone)}" data-rv="rise"><span class="ct-telk">Call us</span><span class="ct-telv">${esc(c.phone)}</span></a>
      <ul class="ct-ways" data-rv-stagger="90">${ways}</ul>
      <div class="ct-office" data-rv>
        <address>${esc(c.address)}</address>
        <p>${hoursText}. Site inspections in and around ${esc(listing(c.regions))}.</p>
      </div>
    </div>
    <div class="ct-card" id="enquiry" data-rv="right">
      <h2 class="ct-cardh">Tell us about your project.</h2>
      <p class="ct-sub">Takes under a minute. Fields marked * are needed.</p>
      ${form(d)}
    </div>
  </div>
</section>`;
}

export const CONTACT_CSS = `
/* one screen on the pale blue: the ways to reach us beside the form */
.ct-page{display:flex;align-items:center;min-height:100svh;padding:calc(var(--nav-room) + .4rem) 0 clamp(1.6rem,4vh,2.8rem)}
.ct-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.02fr);gap:2.4rem clamp(2.4rem,6vw,7rem);align-items:center;width:100%}
.ct-info{min-width:0}
.ct-mark{margin-top:clamp(.9rem,2.4vh,1.5rem)}
.ct-h1{margin:.6rem 0 0;font-family:var(--display);font-weight:500;font-size:var(--fs-title);line-height:1.12;letter-spacing:-.02em;text-wrap:balance}
.ct-lede{margin:clamp(.8rem,2vh,1.2rem) 0 0;max-width:31rem;font-size:var(--fs-sub);line-height:1.6;color:var(--mute);text-wrap:pretty}
.ct-open{display:inline-flex;align-items:center;gap:.6rem;margin:clamp(1rem,2.4vh,1.4rem) 0 0;padding:.5rem .95rem;border-radius:10px;background:var(--card);box-shadow:inset 0 0 0 1px rgba(39,86,160,.16);font-size:var(--fs-body);font-weight:500;color:var(--ink)}
.ct-open i{position:relative;flex:none;width:8px;height:8px;border-radius:50%;background:var(--mute)}
.ct-open[data-state=open] i{background:#45c486}
.ct-open[data-state=open] i::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:1px solid #45c486;animation:ctPulse 2.4s ease-out infinite}
.ct-open[data-state=closed] i{background:#e0a93a}
@keyframes ctPulse{from{opacity:.9;transform:scale(.6)}to{opacity:0;transform:scale(1.9)}}
.ct-tel{display:flex;flex-direction:column;gap:.25rem;width:fit-content;margin:clamp(1.4rem,4vh,2.6rem) 0 0;text-decoration:none;color:var(--ink)}
.ct-telk{font-size:var(--fs-body);font-weight:500;color:var(--accent)}
.ct-telv{font-family:var(--display);font-weight:500;font-size:var(--fs-title);line-height:1.1;letter-spacing:-.02em;white-space:nowrap;transition:color .35s}
.ct-tel:hover .ct-telv{color:var(--accent)}
.ct-tel:focus-visible{outline:2px solid var(--accent);outline-offset:6px}
.ct-ways{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin:clamp(1.4rem,3.6vh,2.2rem) 0 0;padding:0;list-style:none;border-top:1px solid rgba(39,86,160,.2)}
.ct-ways li+li{border-left:1px solid rgba(39,86,160,.2)}
.ct-ways a{position:relative;display:flex;flex-direction:column;gap:.3rem;padding:1rem 2.2rem 0 1.2rem;text-decoration:none}
.ct-ways li:first-child a{padding-left:0}
.ct-wk{font-size:var(--fs-body);color:var(--mute)}
.ct-wv{font-size:var(--fs-body);font-weight:500;line-height:1.35}
.ct-ways .pg-ar{position:absolute;right:.8rem;top:1.05rem;color:var(--mute)}
.ct-ways a:hover .pg-ar{color:var(--ink);transform:translate(2px,-2px)}
.ct-ways a:focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:4px}
.ct-office{margin:clamp(1.2rem,3vh,1.8rem) 0 0;font-size:var(--fs-body);line-height:1.55;color:var(--mute)}
.ct-office address{font-style:normal;color:var(--ink2)}
.ct-office p{margin:.2rem 0 0}

/* the enquiry form, on a sand card */
.ct-card{scroll-margin-top:calc(var(--nav-bar,80px) + 1rem);padding:clamp(1.3rem,2.2vw,2.2rem);border-radius:20px;background:var(--card);color:var(--ink);box-shadow:inset 0 0 0 1px rgba(39,86,160,.14),0 40px 80px -56px rgba(18,34,59,.55)}
.ct-cardh{margin:0;font-family:var(--display);font-weight:500;font-size:var(--fs-sub);line-height:1.2;letter-spacing:-.01em}
.ct-sub{margin:.5rem 0 0;font-size:var(--fs-body);color:var(--mute)}
.ct-form{display:flex;flex-direction:column;gap:1rem;margin-top:1.2rem}
.ct-trap{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);opacity:0;pointer-events:none}
.ct-row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem .8rem}
.ct-full{grid-column:1/-1}
.ct-field{display:flex;flex-direction:column;gap:.35rem;min-width:0}
.ct-field > span{font-size:var(--fs-body);font-weight:500;color:var(--ink2)}
.ct-field input,.ct-field select,.ct-field textarea{width:100%;min-width:0;border:1px solid rgba(18,34,59,.16);border-radius:10px;background:var(--sand);font:inherit;font-size:var(--fs-body);color:var(--ink);outline:none;transition:border-color .25s,box-shadow .25s}
.ct-field input,.ct-field select{height:2.75rem;padding:0 .85rem}
.ct-field select{appearance:none;padding-right:2.3rem;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4' fill='none' stroke='%23121314' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right .75rem center;background-size:14px}
.ct-field textarea{padding:.7rem .85rem;resize:vertical;min-height:5rem;line-height:1.5}
.ct-field input::placeholder,.ct-field textarea::placeholder{color:rgba(18,34,59,.42)}
.ct-field input:focus,.ct-field select:focus,.ct-field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 4px rgba(39,86,160,.14)}
.ct-alert{margin:0;padding:.75rem .95rem;border-radius:11px;background:#fdf0ef;font-size:var(--fs-body);line-height:1.5;color:#8a2a22}
.ct-send{display:flex;flex-wrap:wrap;gap:.6rem}
.ct-send .pg-btn{height:2.9rem}
.pg-dark .ct-card .pg-btn--ink{background:var(--navy);color:#f5f0e6}
.pg-dark .ct-card .pg-btn--ink:hover{background:var(--accent)}
.ct-card .pg-btn:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.ct-send [data-send]:disabled{opacity:.6;cursor:progress}
.ct-wa{border:1px solid rgba(37,211,102,.5);background:rgba(37,211,102,.08);color:#128c4b}
.ct-wa:hover{background:#25d366;border-color:#25d366;color:#fff}
.ct-note{margin:-.3rem 0 0;font-size:var(--fs-body);line-height:1.5;color:var(--mute)}
.ct-done{padding:1.6rem 0 .6rem;outline:none}
.ct-tick{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#2f9e6b;color:#fff}
.ct-tick svg{width:20px;height:20px}
.ct-doneh{margin:1.1rem 0 0;font-family:var(--display);font-weight:500;font-size:var(--fs-sub);line-height:1.2}
.ct-done p:not(.ct-doneh){max-width:28rem;font-size:var(--fs-body);line-height:1.6;color:var(--ink2)}
.ct-done button{border:0;border-bottom:1px solid currentColor;background:none;padding:0 0 3px;font:inherit;font-size:var(--fs-body);font-weight:600;cursor:pointer}

/* short laptop screens: a little tighter so it all stays on one screen */
@media (min-width:1024px) and (max-height:800px){
  .ct-card{padding:1.3rem 1.6rem}
  .ct-form{gap:.8rem;margin-top:.9rem}
  .ct-row{gap:.6rem .75rem}
  .ct-field input,.ct-field select{height:2.55rem}
  .ct-field textarea{min-height:3.6rem}
  .ct-field textarea[rows]{height:3.6rem}
  .ct-ways a{padding-top:.8rem}
}
@media (max-width:1023px){
  .ct-page{display:block;min-height:0;padding-bottom:3rem}
  .ct-grid{grid-template-columns:1fr;gap:2.6rem}
}
@media (max-width:767px){
  .ct-page{padding-top:calc(var(--nav-room) + .4rem)}
  .ct-h1{font-size:var(--fs-title)}
  .ct-telv{font-size:var(--fs-title)}
  .ct-ways{grid-template-columns:1fr}
  .ct-ways li+li{border-left:0;border-top:1px solid var(--line)}
  .ct-ways a,.ct-ways li:first-child a{padding:.9rem 2.4rem .9rem 0}
  .ct-ways .pg-ar{right:.2rem;top:1.05rem}
  .ct-row{grid-template-columns:1fr}
  .ct-card{padding:1.3rem 1.1rem;border-radius:20px}
  .ct-send .pg-btn{flex:1 1 100%}
}
@media (prefers-reduced-motion:reduce){
  .ct-open i::after{animation:none}
}
`;
