"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand, contact, nav } from "@/lib/content";
import { sceneState } from "@/lib/three/store";
import { useLenis } from "@/components/providers/SmoothScroll";
import { SocialIcon } from "@/components/ui/SocialIcons";
import { Wordmark } from "./Logo";

const ease = [0.22, 1, 0.36, 1] as const;
/** the pages in the bar; Contact has its own button at the right */
const links = nav.filter((n) => n.href !== "/contact");
const tel = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;

/**
 * The header: one solid band of the logo's dark blue across the top of every
 * page. On wide screens a thin contact strip (hours, phone, email, WhatsApp)
 * sits above the bar and folds away once the page scrolls; the bar keeps the
 * large logo on the left, the pages in the middle (the one you are on marked
 * with a small water-blue dot) and the free inspection on the right. Phones
 * get the logo, a call button and the menu.
 *
 * On the classic home the header stays out of the way while the construction
 * film plays and arrives together with the closing "RPC Constructions" reveal.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const [heroNavVisible, setHeroNavVisible] = useState(() => sceneState.heroNavVisible || false);
  const [pastHero, setPastHero] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();
  const filmHome = pathname === "/classic";

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [pathname]);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open, lenis]);

  useEffect(() => {
    if (!filmHome) return;
    const check = () => {
      const hero = document.querySelector("section[aria-label*='RPC Constructions']");
      setPastHero(hero ? hero.getBoundingClientRect().bottom <= 120 : window.scrollY > window.innerHeight * 4);
    };
    check();
    const onHeroNav = (e: Event) => {
      const ce = e as CustomEvent<{ visible: boolean }>;
      if (typeof ce.detail?.visible === "boolean") setHeroNavVisible(ce.detail.visible);
    };
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("rpc:hero-nav", onHeroNav);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("rpc:hero-nav", onHeroNav);
    };
  }, [filmHome]);

  if (pathname?.startsWith("/studio")) return null;

  const visible = open || !filmHome || pastHero || heroNavVisible;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href)));
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water-2";

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 text-white transition-[transform,opacity] duration-700 ease-[var(--ease-film)]"
        style={{ transform: visible ? "none" : "translateY(-140%)", opacity: visible ? 1 : 0 }}
        aria-hidden={!visible}
        data-site-nav
        data-nav-tone="dark"
      >
        {/* contact strip: wide screens only, folds away once the page moves */}
        <div className={`hidden overflow-hidden bg-[#081a3e] transition-[height] duration-500 ease-[var(--ease-film)] lg:block ${scrolled ? "h-0" : "h-9"}`}>
          <div className="gutter mx-auto flex h-9 max-w-[1600px] items-center justify-between gap-6 text-body leading-none text-white/72">
            <p className="truncate">Waterproofing and construction in Erode, Coimbatore and across Tamil Nadu</p>
            <div className="flex shrink-0 items-center gap-6">
              <span className="hidden items-center gap-2 xl:inline-flex">
                <Clock size={14} className="text-water-2" aria-hidden /> {contact.hours.replace(" IST", "")}
              </span>
              <a href={tel} tabIndex={visible ? 0 : -1} className={`inline-flex items-center gap-2 hover:text-white ${focus}`}>
                <Phone size={14} className="text-water-2" aria-hidden /> {contact.phone}
              </a>
              <a href={`mailto:${contact.email}`} tabIndex={visible ? 0 : -1} className={`hidden items-center gap-2 hover:text-white xl:inline-flex ${focus}`}>
                <Mail size={14} className="text-water-2" aria-hidden /> {contact.email}
              </a>
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" tabIndex={visible ? 0 : -1} className={`inline-flex items-center gap-2 hover:text-white ${focus}`}>
                <SocialIcon name="WhatsApp" size={14} className="text-water-2" /> WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* the bar */}
        <div className={`border-b border-white/10 bg-night transition-shadow duration-500 ${scrolled ? "shadow-[0_14px_32px_-20px_rgba(4,12,30,0.75)]" : ""}`}>
          <div className="gutter mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-4 lg:h-20">
            <Link href="/" aria-label={`${brand.name} — home`} tabIndex={visible ? 0 : -1} className={`shrink-0 rounded-[12px] ${focus}`}>
              <span className="block xl:hidden"><Wordmark size="md" /></span>
              <span className="hidden xl:block"><Wordmark size="xl" /></span>
            </Link>

            <nav aria-label="Primary" className="hidden items-center lg:flex">
              {links.map((n) => {
                const active = isActive(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    tabIndex={visible ? 0 : -1}
                    aria-current={active ? "page" : undefined}
                    className={`group relative rounded-md px-2.5 py-3 text-body font-medium leading-none transition-colors duration-300 xl:px-3.5 ${focus} ${
                      active ? "text-white" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {n.label}
                    <span
                      aria-hidden
                      className={`absolute bottom-0 left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-water-2 transition-[opacity,transform] duration-300 ${
                        active ? "scale-100 opacity-100" : "scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-60"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <a href={tel} tabIndex={visible ? 0 : -1} aria-label={`Call ${contact.phone}`} className={`grid h-11 w-11 place-items-center rounded-[10px] bg-white/[0.08] text-white transition-colors hover:bg-white/[0.16] lg:hidden ${focus}`}>
                <Phone size={18} aria-hidden />
              </a>
              <Link
                href="/contact"
                tabIndex={visible ? 0 : -1}
                aria-current={isActive("/contact") ? "page" : undefined}
                className={`group hidden h-12 items-center gap-2.5 rounded-[10px] bg-water-2 pl-4 pr-1.5 text-body font-semibold text-night transition-colors duration-300 hover:bg-[#7fe0ea] md:inline-flex ${focus}`}
              >
                <span className="xl:hidden">Contact</span>
                <span className="hidden xl:inline">Book a free inspection</span>
                <span className="grid h-9 w-9 place-items-center rounded-[8px] bg-night text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={16} strokeWidth={1.8} />
                </span>
              </Link>
              <button
                type="button"
                className={`grid h-11 w-11 place-items-center rounded-[10px] transition-colors lg:hidden ${focus} ${open ? "bg-white/15" : "bg-white/[0.08] hover:bg-white/[0.16]"}`}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((o) => !o)}
              >
                <span className="relative block h-3 w-5">
                  <span className="absolute left-0 top-0 h-[2px] w-full rounded bg-current transition-transform duration-500" style={{ transform: open ? "translateY(5px) rotate(45deg)" : "none" }} />
                  <span className="absolute bottom-0 left-0 h-[2px] w-full rounded bg-current transition-transform duration-500" style={{ transform: open ? "translateY(-5px) rotate(-45deg)" : "none" }} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="gutter fixed inset-0 z-40 flex flex-col overflow-y-auto bg-night pb-8 pt-24 text-white lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease }}
          >
            <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center">
              {[...links, { label: "Contact", href: "/contact" }].map((n, i) => (
                <div key={n.href} className="overflow-hidden border-b border-white/10">
                  <motion.div initial={{ y: "105%" }} animate={{ y: 0 }} exit={{ y: "105%" }} transition={{ duration: 0.8, ease, delay: 0.12 + i * 0.05 }}>
                    <Link href={n.href} className="flex items-center justify-between py-3.5 text-sub font-medium" style={{ fontFamily: "var(--font-display)" }} onClick={() => setOpen(false)}>
                      <span className={isActive(n.href) ? "text-water-2" : ""}>{n.label}</span>
                      <ArrowUpRight size={18} className="opacity-50" aria-hidden />
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.45, duration: 0.5 }} className="mt-8 grid gap-3 text-body">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex h-12 items-center justify-between rounded-[10px] bg-water-2 pl-5 pr-1.5 font-semibold text-night"
              >
                Book a free inspection
                <span className="grid h-9 w-9 place-items-center rounded-[8px] bg-night text-white"><ArrowUpRight size={16} /></span>
              </Link>
              <a href={tel} className="flex items-center gap-3 text-white/85"><Phone size={16} className="text-water-2" />{contact.phone}</a>
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-white/85"><Mail size={16} className="text-water-2" />{contact.email}</a>
              <p className="flex items-center gap-3 text-white/60"><Clock size={16} className="text-water-2" />{contact.hours}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
