"use client";

import Link from "next/link";
import { ArrowUp, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Wordmark } from "@/components/navigation/Logo";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { brand, contact, nav } from "@/lib/content";
import { SERVICE_CATEGORIES } from "@/lib/methods/doc";

/** a service's place on the services page */
const slug = (t: string) => t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
/** "a, b and c" */
const listed = (xs: readonly string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/**
 * The footer, in the logo's dark blue like the nav bar, rising into the page
 * above with a waterline. The logo with a line on what we do and the social
 * links; then three rows, each one line across the page: the pages, the
 * waterproofing services, and how to reach us; then the small print.
 */
export function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const tel = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapQuery)}`;
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water-2";
  const row = "grid gap-x-8 gap-y-2 border-b border-white/10 py-3.5 md:grid-cols-[9.5rem_minmax(0,1fr)] md:items-center";
  const label = "text-body font-semibold text-water-2";
  const items = "flex flex-wrap items-center gap-x-6 gap-y-2";
  const link = `rounded text-body text-white/72 transition-colors hover:text-white ${focus}`;
  const socials = contact.socials.filter((s) => s.label !== "WhatsApp");

  return (
    <footer className="relative z-10 -mt-8 text-[#f5f0e6] md:-mt-10">
      {/* the waterline: the footer's blue rises into the page above */}
      <svg aria-hidden="true" focusable="false" className="pointer-events-none block h-8 w-full text-night md:h-10" viewBox="0 0 1440 40" preserveAspectRatio="none">
        <path d="M0 24C160 10 320 8 480 18s320 20 480 12 320-22 480-14V40H0Z" fill="currentColor" />
        <path d="M0 24C160 10 320 8 480 18s320 20 480 12 320-22 480-14" fill="none" stroke="#4cc9d9" strokeOpacity=".45" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="bg-night">
        <div className="gutter mx-auto max-w-[1600px]">
          {/* who we are */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pb-5 pt-2 md:flex-nowrap md:gap-x-8 md:pt-4">
            <div className="flex min-w-0 items-center gap-x-7">
              <Link href="/" aria-label={`${brand.name} — home`} className={`shrink-0 rounded-[12px] ${focus}`}>
                <span className="block md:hidden"><Wordmark size="sm" /></span>
                <span className="hidden md:block"><Wordmark size="md" /></span>
              </Link>
              <p className="hidden max-w-[36rem] text-body leading-relaxed text-white/70 md:block">
                Waterproofing contractors and builders in Erode since 2012, working across {listed(contact.regions.slice(1))}.
              </p>
            </div>
            <ul className="flex shrink-0 items-center gap-1.5" aria-label="Follow us">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className={`grid h-9 w-9 place-items-center rounded-[10px] bg-white/[0.07] text-white/80 transition-colors hover:bg-water-2 hover:text-night md:h-10 md:w-10 ${focus}`}
                  >
                    <SocialIcon name={s.label} size={16} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* three rows, each one line across */}
          <div className="border-t border-white/10">
            <nav aria-label="Footer" className={row}>
              <p className={label}>Explore</p>
              <ul className={items}>
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className={link}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={row}>
              <p className={label}>Waterproofing</p>
              <ul className={items}>
                {SERVICE_CATEGORIES.map((s) => (
                  <li key={s.title}>
                    <Link href={`/services#${slug(s.title)}`} className={link}>
                      {s.title.replace(" waterproofing", "").replace(" treatment", "")}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <address className={`${row} not-italic`}>
              <p className={label}>Get in touch</p>
              <ul className={`${items} text-white/72`}>
                <li>
                  <a href={tel} className={`flex items-center gap-2 rounded font-semibold text-white transition-colors hover:text-water-2 ${focus}`}>
                    <Phone size={15} aria-hidden className="shrink-0 text-water-2" /> {contact.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${contact.email}`} className={`flex items-center gap-2 rounded transition-colors hover:text-white ${focus}`}>
                    <Mail size={15} aria-hidden className="shrink-0 text-water-2" /> <span className="min-w-0 break-all">{contact.email}</span>
                  </a>
                </li>
                <li>
                  <a href={maps} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 rounded transition-colors hover:text-white ${focus}`}>
                    <MapPin size={15} aria-hidden className="shrink-0 text-water-2" /> 142 Perundurai Road, Erode
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Clock size={15} aria-hidden className="shrink-0 text-water-2" /> {contact.hours.replace(" IST", "")}
                </li>
              </ul>
            </address>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4 text-body text-white/50">
            <p>
              © {new Date().getFullYear()} {brand.name}.<span className="hidden sm:inline"> All rights reserved.</span>
            </p>
            <button type="button" onClick={toTop} className={`inline-flex items-center gap-1.5 rounded transition-colors hover:text-white ${focus}`}>
              Back to top <ArrowUp size={14} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
