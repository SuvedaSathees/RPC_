"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand, contact, nav } from "@/lib/content";
import { sceneState } from "@/lib/three/store";
import { useLenis } from "@/components/providers/SmoothScroll";
import { Wordmark } from "./Logo";

const ease = [0.22, 1, 0.36, 1] as const;
/** the pages in the bar; Contact has its own button at the right */
const links = nav.filter((n) => n.href !== "/contact");
const tel = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;

/**
 * The header: a slim band of the logo's dark blue across the top (48px on
 * laptops, about half the old bar), with the logo on a badge that hangs below
 * it, edged in water blue, until the page scrolls; then the badge folds up into
 * the band and the logo shrinks to fit. The pages sit beside the badge (the one
 * you are on lit in water blue) and the free inspection at the right. Phones
 * get the badge, a call button and the menu.
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
        {/* the band */}
        <div className={`border-b border-white/10 bg-night transition-shadow duration-500 ${scrolled ? "shadow-[0_12px_28px_-18px_rgba(4,12,30,0.8)]" : ""}`}>
          <div className="gutter mx-auto flex h-[52px] max-w-[1600px] items-center gap-4 lg:h-12 lg:gap-5 xl:gap-7">
            {/* the logo on its badge: hanging below the band at the top of the page, folded into it once the page scrolls */}
            <Link
              href="/"
              aria-label={`${brand.name} — home`}
              tabIndex={visible ? 0 : -1}
              className={`relative z-10 flex shrink-0 items-center self-start rounded-b-[18px] bg-night pl-2.5 pr-4 transition-[height,box-shadow] duration-500 ease-[var(--ease-film)] lg:pl-3.5 lg:pr-5 ${focus} ${
                scrolled ? "h-[52px] shadow-none lg:h-12" : "h-16 shadow-[0_18px_30px_-18px_rgba(4,12,30,0.9),inset_0_-3px_0_#4cc9d9] lg:h-[84px]"
              }`}
            >
              <span className={`block origin-left transition-transform duration-500 ease-[var(--ease-film)] ${scrolled ? "scale-[0.82] lg:scale-[0.72]" : "scale-100"}`}>
                <span className="block lg:hidden"><Wordmark size="sm" /></span>
                <span className="hidden lg:block xl:hidden"><Wordmark size="md" /></span>
                <span className="hidden xl:block"><Wordmark size="lg" /></span>
              </span>
            </Link>

            <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
              {links.map((n) => {
                const active = isActive(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    tabIndex={visible ? 0 : -1}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-[8px] px-2 py-2 text-body font-medium leading-none transition-colors duration-300 xl:px-3 ${focus} ${
                      active ? "bg-water-2/[0.18] text-white shadow-[inset_0_0_0_1px_rgba(76,201,217,0.45)]" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex shrink-0 items-center gap-1.5">
              <a href={tel} tabIndex={visible ? 0 : -1} aria-label={`Call ${contact.phone}`} className={`grid h-10 w-10 place-items-center rounded-[10px] bg-white/[0.08] text-white transition-colors hover:bg-white/[0.16] lg:hidden ${focus}`}>
                <Phone size={17} aria-hidden />
              </a>
              <Link
                href="/contact"
                tabIndex={visible ? 0 : -1}
                aria-current={isActive("/contact") ? "page" : undefined}
                className={`group hidden h-10 items-center gap-2 rounded-[10px] bg-water-2 pl-3.5 pr-1 text-body font-semibold text-night transition-colors duration-300 hover:bg-[#7fe0ea] md:inline-flex lg:h-9 ${focus}`}
              >
                <span className="xl:hidden">Contact</span>
                <span className="hidden xl:inline">Book a free inspection</span>
                <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-night text-white transition-transform duration-300 group-hover:rotate-45 lg:h-7 lg:w-7">
                  <ArrowUpRight size={15} strokeWidth={1.8} />
                </span>
              </Link>
              <button
                type="button"
                className={`grid h-10 w-10 place-items-center rounded-[10px] transition-colors lg:hidden ${focus} ${open ? "bg-white/15" : "bg-white/[0.08] hover:bg-white/[0.16]"}`}
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
