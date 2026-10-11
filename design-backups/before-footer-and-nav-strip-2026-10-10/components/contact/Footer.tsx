"use client";

import Link from "next/link";
import { ArrowUp, ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Wordmark } from "@/components/navigation/Logo";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { brand, contact, nav } from "@/lib/content";
import { SERVICE_CATEGORIES } from "@/lib/methods/doc";

/** the waterproofing services, each linked to its place on the services page */
const slug = (t: string) => t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * The footer: the logo's dark blue, like the nav bar. The logo large with a
 * line on what we do and the free inspection; then the pages, the
 * waterproofing services and the ways to reach us; then the small print.
 */
export function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const tel = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapQuery)}`;
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water-2";

  return (
    <footer className="relative z-10 bg-night text-[#f5f0e6]">
      <div className="gutter mx-auto max-w-[1600px]">
        {/* the logo, what we do, and the way to start */}
        <div className="flex flex-col gap-8 border-b border-white/10 py-10 md:flex-row md:items-end md:justify-between md:py-14">
          <div>
            <Link href="/" aria-label={`${brand.name} — home`} className={`inline-block rounded-[12px] ${focus}`}>
              <span className="block md:hidden"><Wordmark size="lg" /></span>
              <span className="hidden md:block"><Wordmark size="xl" /></span>
            </Link>
            <p className="mt-5 max-w-md text-body leading-relaxed text-white/68">
              Waterproofing contractors and builders in Erode, keeping homes, offices and factories dry across Coimbatore, Tiruppur, Salem and Chennai since 2012.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/contact#enquiry"
              className={`group inline-flex h-12 items-center gap-2.5 rounded-[10px] bg-water-2 pl-5 pr-1.5 text-body font-semibold text-night transition-colors hover:bg-[#7fe0ea] ${focus}`}
            >
              Book a free site inspection
              <span className="grid h-9 w-9 place-items-center rounded-[8px] bg-night text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </span>
            </Link>
            <a href={tel} className={`inline-flex h-12 items-center gap-2 rounded-[10px] border border-white/20 px-4 text-body font-semibold transition-colors hover:border-white/50 ${focus}`}>
              <Phone size={16} className="text-water-2" aria-hidden /> {contact.phone}
            </a>
          </div>
        </div>

        {/* pages, services, contact */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-10 md:grid-cols-12 md:py-12">
          <nav aria-label="Footer" className="md:col-span-3 lg:col-span-2">
            <p className="mb-4 text-body font-semibold text-white">Pages</p>
            <ul className="space-y-2.5">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className={`rounded text-body text-white/70 transition-colors hover:text-white ${focus}`}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4 lg:col-span-3">
            <p className="mb-4 text-body font-semibold text-white">Waterproofing</p>
            <ul className="space-y-2.5">
              {SERVICE_CATEGORIES.map((s) => (
                <li key={s.title}>
                  <Link href={`/services#${slug(s.title)}`} className={`rounded text-body text-white/70 transition-colors hover:text-white ${focus}`}>
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-5 lg:col-span-4 lg:col-start-6">
            <p className="mb-4 text-body font-semibold text-white">Get in touch</p>
            <address className="space-y-3.5 not-italic text-body">
              <a href={tel} className={`group flex items-center gap-3 rounded text-white/80 hover:text-white ${focus}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-white/[0.07] text-water-2"><Phone size={15} /></span>
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className={`group flex items-center gap-3 rounded text-white/80 hover:text-white ${focus}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-white/[0.07] text-water-2"><Mail size={15} /></span>
                <span className="break-all">{contact.email}</span>
              </a>
              <a href={maps} target="_blank" rel="noopener noreferrer" className={`group flex items-start gap-3 rounded text-white/80 hover:text-white ${focus}`}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-white/[0.07] text-water-2"><MapPin size={15} /></span>
                <span className="pt-1.5 leading-relaxed">{contact.address}</span>
              </a>
              <p className="flex items-center gap-3 text-white/60">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-white/[0.07] text-water-2"><Clock size={15} /></span>
                {contact.hours}
              </p>
            </address>
          </div>

          <div className="col-span-2 md:col-span-12 lg:col-span-3 lg:col-start-10">
            <p className="mb-4 text-body font-semibold text-white">Follow us</p>
            <ul className="flex flex-wrap items-center gap-2">
              {contact.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className={`grid h-10 w-10 place-items-center rounded-[10px] bg-white/[0.07] text-white/80 transition-colors hover:bg-water-2 hover:text-night ${focus}`}
                  >
                    <SocialIcon name={s.label} size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-body text-white/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}. Waterproofing and construction in {contact.regions.join(", ")}.
          </p>
          <button type="button" onClick={toTop} className={`inline-flex items-center gap-1.5 self-start rounded hover:text-white md:self-auto ${focus}`}>
            Back to top <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
