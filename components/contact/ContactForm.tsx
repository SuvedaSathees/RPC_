"use client";

import { ArrowUpRight, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { contact, services } from "@/lib/content";

const budgetRanges = ["Under ₹50 L", "₹50 L – ₹2 Cr", "₹2 Cr – ₹10 Cr", "₹10 Cr +", "Not sure yet"] as const;

/**
 * Enquiries are delivered to the office inbox through FormSubmit
 * (https://formsubmit.co) — no server or API key needed. The very first
 * submission sends a one-time activation email to `contact.email`; once
 * that is confirmed every enquiry arrives in the inbox as a table.
 * WhatsApp is offered alongside as an instant alternative.
 */
const ENDPOINT = `https://formsubmit.co/ajax/${contact.email}`;

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [type, setType] = useState<string>(services[0].title);
  const [budget, setBudget] = useState<string>("₹50 L – ₹2 Cr");
  const [name, setName] = useState("");

  // /contact?service=Interiors preselects the discipline
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("service");
    if (q && services.some((s) => s.title === q)) setType(q);
  }, []);

  const summary = (f: FormData) =>
    [
      `Project enquiry — ${type}`,
      `Name: ${f.get("name") ?? ""}`,
      `Phone: ${f.get("phone") ?? ""}`,
      `Email: ${f.get("email") ?? ""}`,
      `Site location: ${f.get("location") ?? ""}`,
      `Budget: ${budget}`,
      "",
      String(f.get("message") ?? ""),
    ].join("\n");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    if (!el.reportValidity()) return;
    const f = new FormData(el);
    if (f.get("_honey")) return; // bot
    setName(String(f.get("name") ?? "").split(" ")[0] ?? "");
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New project enquiry — ${type} (${f.get("location") ?? ""})`,
          _template: "table",
          _captcha: "false",
          _replyto: f.get("email"),
          Name: f.get("name"),
          Phone: f.get("phone"),
          Email: f.get("email"),
          "Site location": f.get("location"),
          "Project type": type,
          Budget: budget,
          Message: f.get("message"),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: string | boolean };
      if (!res.ok || String(data.success) === "false") throw new Error("send failed");
      setStatus("sent");
      el.reset();
    } catch {
      setStatus("error");
    }
  };

  const openWhatsApp = () => {
    const el = form.current;
    const text = el ? summary(new FormData(el)) : `Project enquiry — ${type}`;
    window.open(`${contact.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  if (status === "sent") {
    return (
      <div role="status" className="flex h-full flex-col justify-center py-6">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 size={24} />
        </span>
        <p className="display mt-5 text-4xl">Thank you{name ? `, ${name}` : ""}.</p>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">
          Your enquiry has reached our office. An RPC engineer will call you within one working day. For anything urgent, call{" "}
          <a className="font-medium text-ink underline underline-offset-4" href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}>{contact.phone}</a>.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-6 self-start text-sm font-medium text-ink underline underline-offset-4">
          Send another enquiry
        </button>
      </div>
    );
  }

  const field =
    "mt-1.5 w-full rounded-md border border-ink/15 bg-paper px-3.5 py-2.5 text-[15px] outline-none transition-colors placeholder:text-mute/70 focus:border-ink focus:bg-white";
  const chip = (on: boolean) =>
    `cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] transition-colors duration-200 ${
      on ? "border-ink bg-ink text-paper" : "border-ink/15 bg-paper text-ink/80 hover:border-ink"
    }`;

  return (
    <form ref={form} onSubmit={onSubmit} className="flex flex-col gap-5">
      {/* spam trap */}
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <fieldset>
        <legend className="text-[13px] font-medium text-ink-2">Project type</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {services.map((s) => (
            <label key={s.id} className={chip(type === s.title)}>
              <input type="radio" name="type" value={s.title} className="sr-only" checked={type === s.title} onChange={() => setType(s.title)} />
              {s.title}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[13px] font-medium text-ink-2">Estimated budget</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {budgetRanges.map((b) => (
            <label key={b} className={chip(budget === b)}>
              <input type="radio" name="budget" value={b} className="sr-only" checked={budget === b} onChange={() => setBudget(b)} />
              {b}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[13px] font-medium text-ink-2">
          Full name *
          <input required name="name" autoComplete="name" className={field} placeholder="Your name" />
        </label>
        <label className="block text-[13px] font-medium text-ink-2">
          Phone *
          <input required type="tel" name="phone" autoComplete="tel" inputMode="tel" pattern="[0-9+\s\-]{8,}" className={field} placeholder="+91 98765 43210" />
        </label>
        <label className="block text-[13px] font-medium text-ink-2">
          Email *
          <input required type="email" name="email" autoComplete="email" className={field} placeholder="you@example.com" />
        </label>
        <label className="block text-[13px] font-medium text-ink-2">
          Site location *
          <input required name="location" className={field} placeholder="e.g. Perundurai Road, Erode" />
        </label>
      </div>

      <label className="block text-[13px] font-medium text-ink-2">
        About your project
        <textarea
          name="message"
          rows={3}
          className={`${field} resize-none`}
          placeholder="Plot size, number of floors, approval status, when you would like to start…"
        />
      </label>

      {status === "error" && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          We couldn’t send that just now. Please try again, send it on WhatsApp, or call {contact.phone}.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" disabled={status === "sending"} className="btn btn-solid disabled:opacity-60">
          <span>{status === "sending" ? "Sending…" : "Send enquiry"}</span>
          <span className="btn-icon" aria-hidden>
            {status === "sending" ? <Loader2 size={15} className="animate-spin" /> : <ArrowUpRight size={15} strokeWidth={1.5} />}
          </span>
        </button>
        <button
          type="button"
          onClick={openWhatsApp}
          className="inline-flex h-[3.25rem] items-center gap-2 rounded-full border border-ink/15 px-5 text-sm font-medium text-ink transition-colors hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
        >
          <MessageCircle size={16} /> Send on WhatsApp
        </button>
      </div>
      <p className="text-xs text-mute">We reply within one working day. Your details are used only to respond to this enquiry.</p>
    </form>
  );
}
