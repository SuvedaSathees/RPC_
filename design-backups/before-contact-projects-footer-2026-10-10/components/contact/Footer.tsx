"use client";

import Link from "next/link";
import { ArrowUp, Clock, Mail, MapPin } from "lucide-react";
import { Wordmark } from "@/components/navigation/Logo";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { brand, contact, nav, services } from "@/lib/content";
import { SERVICE_CATEGORIES } from "@/lib/methods/doc";

/** a service's place on the services page */
const slug = (t: string) => t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * The footer, in the logo's dark blue like the nav bar, rising into the page
 * above with a waterline. First the logo, what we do and the towns we work in,
 * beside the number to call; then every page and service; then the name, large
 * and faint, as if under water; then the small print.
 */
export function Footer() {
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const tel = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.mapQuery)}`;
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water-2";
  const head = "mb-4 text-body font-semibold text-water-2";
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
          {/* who we are, and the number to call */}
          <div className="grid gap-10 pb-10 pt-6 md:pb-14 md:pt-8 lg:grid-cols-12 lg:items-start lg:gap-8">
            <div className="lg:col-span-6">
              <Link href="/" aria-label={`${brand.name} — home`} className={`inline-block rounded-[12px] ${focus}`}>
                <span className="block md:hidden"><Wordmark size="lg" /></span>
                <span className="hidden md:block"><Wordmark size="xl" /></span>
              </Link>
              <p className="mt-5 max-w-[30rem] text-body leading-relaxed text-white/70">
                Waterproofing contractors and builders in Erode since 2012. We find where water gets in, seal it, and build homes, offices and factories that stay dry.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Towns we work in">
                {contact.regions.map((r) => (
                  <li key={r} className="inline-flex h-8 items-center rounded-[8px] bg-white/[0.07] px-3 text-body text-white/80">
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[18px] bg-white/[0.05] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] md:p-8 lg:col-span-6">
              <p className="text-body font-semibold text-water-2">Call an engineer</p>
              <a href={tel} className={`mt-2 block w-fit rounded font-display text-title font-medium leading-tight tracking-[-0.02em] text-white transition-colors hover:text-water-2 ${focus}`}>
                {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} className={`mt-3 flex w-fit max-w-full items-center gap-2 rounded text-body font-medium text-white/85 transition-colors hover:text-white sm:text-sub ${focus}`}>
                <Mail size={18} aria-hidden className="shrink-0 text-water-2" /> <span className="min-w-0 break-all">{contact.email}</span>
              </a>
              <div className="mt-6 grid gap-3 border-t border-white/10 pt-5 text-body text-white/70 sm:grid-cols-2">
                <a href={maps} target="_blank" rel="noopener noreferrer" className={`flex items-start gap-2.5 rounded hover:text-white ${focus}`}>
                  <MapPin size={16} aria-hidden className="mt-0.5 shrink-0 text-water-2" />
                  <span className="leading-relaxed">{contact.address}</span>
                </a>
                <p className="flex items-start gap-2.5">
                  <Clock size={16} aria-hidden className="mt-0.5 shrink-0 text-water-2" />
                  <span className="leading-relaxed">{contact.hours}</span>
                </p>
              </div>
            </div>
          </div>

          {/* every page and service */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-white/10 py-10 md:grid-cols-12 md:py-12">
            <nav aria-label="Footer" className="md:col-span-3 lg:col-span-2">
              <p className={head}>Explore</p>
              <ul className="space-y-2.5">
                {nav.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className={link}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="md:col-span-5 lg:col-span-4">
              <p className={head}>Waterproofing</p>
              <ul className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {SERVICE_CATEGORIES.map((s) => (
                  <li key={s.title}>
                    <Link href={`/services#${slug(s.title)}`} className={link}>
                      {s.title.replace(" waterproofing", "")}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4 lg:col-span-3">
              <p className={head}>Building</p>
              <ul className="space-y-2.5">
                {services.slice(1).map((s) => (
                  <li key={s.id}>
                    <Link href={`/services#${slug(s.title)}`} className={link}>
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-12 lg:col-span-3">
              <p className={head}>Follow us</p>
              <ul className="flex flex-wrap items-center gap-2">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className={`grid h-11 w-11 place-items-center rounded-[10px] bg-white/[0.07] text-white/80 transition-colors hover:bg-water-2 hover:text-night ${focus}`}
                    >
                      <SocialIcon name={s.label} size={17} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* the name, large and faint, as if under water */}
        <div aria-hidden="true" className="gutter mx-auto max-w-[1600px] select-none">
          <svg viewBox="0 0 1000 74" className="block w-full" focusable="false">
            <defs>
              <linearGradient id="ft-sink" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity=".13" />
                <stop offset="1" stopColor="#ffffff" stopOpacity=".02" />
              </linearGradient>
            </defs>
            <text x="0" y="70" textLength="1000" lengthAdjust="spacing" fill="url(#ft-sink)" style={{ fontFamily: "var(--font-instrument), 'Segoe UI', sans-serif", fontWeight: 700, fontSize: 91 }}>
              RPC CONSTRUCTIONS
            </text>
          </svg>
        </div>

        <div className="gutter mx-auto max-w-[1600px]">
          <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-body text-white/50 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} {brand.name}. All rights reserved.
            </p>
            <button type="button" onClick={toTop} className={`inline-flex items-center gap-1.5 self-start rounded hover:text-white md:self-auto ${focus}`}>
              Back to top <ArrowUp size={14} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
