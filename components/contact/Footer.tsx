"use client";

import Link from "next/link";
import { ArrowRight, ArrowUp, ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Wordmark } from "@/components/navigation/Logo";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { brand, contact, nav, services } from "@/lib/content";

/** Compact footer — one dense band of brand, links, contact and social. */
export function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const tel = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;

  return (
    <footer className="relative z-10 overflow-hidden bg-night text-paper">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-[40rem] rounded-full bg-rpc/10 blur-[120px]" />
      {/* phones: one compact band (well under half a screen) */}
      <div className="gutter relative py-8 md:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/" aria-label={`${brand.name} — home`}>
              <Wordmark size="sm" />
            </Link>
            <p className="mt-3 max-w-[16rem] text-[12.5px] leading-relaxed text-paper/60">
              Design-and-build construction across Tamil Nadu.
            </p>
          </div>
          <button type="button" onClick={toTop} aria-label="Back to top" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-paper/80">
            <ArrowUp size={15} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-[12.5px]">
          <a href={tel} className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 text-paper/85">
            <Phone size={14} className="shrink-0 text-paper/50" /> {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`} className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 text-paper/85">
            <Mail size={14} className="shrink-0 text-paper/50" /> Email us
          </a>
        </div>
        <p className="mt-3 flex items-center gap-2 text-[11.5px] text-paper/50">
          <Clock size={12} className="text-paper/35" /> {contact.hours}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <p className="text-[11px] text-paper/40">© {new Date().getFullYear()} {brand.name}</p>
          <ul className="flex items-center gap-1.5">
            {contact.socials.map((so) => (
              <li key={so.label}>
                <a
                  href={so.href}
                  aria-label={so.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-8 w-8 place-items-center rounded-full text-paper/60"
                >
                  <SocialIcon name={so.label} size={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="gutter relative hidden md:block">
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* brand */}
          <div className="lg:col-span-4">
            <Link href="/" aria-label={`${brand.name} — home`} className="inline-block">
              <Wordmark size="lg" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/65">
              {brand.descriptor}. Design-and-build construction for homes, commercial and industrial projects across Tamil Nadu.
            </p>
            <p className="mt-5 flex items-center gap-2 text-xs text-paper/55">
              <Clock size={14} className="text-paper/40" /> {contact.hours}
            </p>
          </div>

          {/* directory */}
          <nav aria-label="Footer" className="lg:col-span-2">
            <p className="eyebrow mb-4 text-paper/40">Directory</p>
            <ul className="space-y-2.5">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="group inline-flex items-center gap-2 text-sm text-paper/80 transition-colors hover:text-paper">
                    <ArrowRight size={13} className="text-paper/35 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-rpc" />
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* services */}
          <div className="lg:col-span-2">
            <p className="eyebrow mb-4 text-paper/40">Services</p>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.id}>
                  <Link href="/services" className="text-sm text-paper/70 transition-colors hover:text-paper">
                    {s.title.replace(" Construction", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact + social */}
          <div className="lg:col-span-4">
            <p className="eyebrow mb-4 text-paper/40">Get in touch</p>
            <address className="space-y-3 not-italic text-sm">
              <a href={`mailto:${contact.email}`} className="group flex items-center gap-3 text-paper/80 hover:text-paper">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 group-hover:border-rpc group-hover:bg-rpc"><Mail size={14} /></span>
                {contact.email}
              </a>
              <a href={tel} className="group flex items-center gap-3 text-paper/80 hover:text-paper">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 group-hover:border-rpc group-hover:bg-rpc"><Phone size={14} /></span>
                {contact.phone}
              </a>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 text-paper/70 hover:text-paper"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 group-hover:border-rpc group-hover:bg-rpc"><MapPin size={14} /></span>
                <span className="pt-1.5 text-xs leading-relaxed">{contact.address}</span>
              </a>
            </address>
            <ul className="mt-6 flex items-center gap-2">
              {contact.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-paper/75 transition-colors hover:border-white hover:bg-white hover:text-ink"
                  >
                    <SocialIcon name={s.label} size={15} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-paper/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}. All rights reserved. · Erode · Coimbatore · Chennai
          </p>
          <div className="flex items-center gap-5">
            <Link href="/contact" className="inline-flex items-center gap-1 hover:text-paper">
              Start a project <ArrowUpRight size={12} />
            </Link>
            <button type="button" onClick={toTop} className="inline-flex items-center gap-1.5 hover:text-paper">
              Back to top <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
