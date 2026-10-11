"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { brand, contact, nav } from "@/lib/content";
import { sceneState } from "@/lib/three/store";
import { useLenis } from "@/components/providers/SmoothScroll";
import { Wordmark } from "./Logo";

const ease = [0.22, 1, 0.36, 1] as const;
/** the pages in the bar; Contact has its own button at the end of it */
const links = nav.filter((n) => n.href !== "/contact");
const tel = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;
/** the page's sand, for the pill behind the page you are on */
const SAND = "#ece6da";
/** pages that open on a dark picture, where the logo's name is drawn in white */
const DARK_TOP = new Set(["/", "/classic"]);

/**
 * The header, in two separate parts. The logo sits on the page itself, at its
 * top left, with no box round it, and scrolls away with the page (in white on
 * the home page's dark opening, in the logo's dark blue everywhere else). The
 * pages are in a small rounded bar of the logo's dark blue that floats at the
 * top right with a gap above it and stays in view: the pages in plain text,
 * then Contact. The page you are on sits in a sand pill, which slides across
 * to the next page when you move. Phones get the logo, and a small floating
 * bar with the call button and the menu.
 *
 * On the classic home the header stays out of the way while the construction
 * film plays and arrives together with the closing "RPC Constructions" reveal.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const [heroNavVisible, setHeroNavVisible] = useState(() => sceneState.heroNavVisible || false);
  const [pastHero, setPastHero] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();
  const filmHome = pathname === "/classic";

  useEffect(() => setOpen(false), [pathname]);

  // moving to another page, the sand pill slides across from the page you left (measured inside the bar, so the page's scroll never moves it)
  const row = useRef<HTMLDivElement>(null);
  const lastPill = useRef<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const cur = row.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    const pill = cur?.querySelector<HTMLElement>("[data-pill]");
    const from = lastPill.current;
    lastPill.current = cur ? { left: cur.offsetLeft, width: cur.offsetWidth } : null;
    if (!cur || !pill || !from || !pill.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (from.left === cur.offsetLeft) return;
    pill.animate(
      [
        { left: `${from.left - cur.offsetLeft}px`, width: `${from.width}px` },
        { left: "0px", width: `${cur.offsetWidth}px` },
      ],
      { duration: 460, easing: "cubic-bezier(0.3, 1.2, 0.5, 1)" },
    );
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
  const darkTop = DARK_TOP.has(pathname ?? "");
  const isActive = (href: string) => (href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href)));
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water-2";

  /** a page in the bar, in plain text; the page you are on sits in the sand pill */
  const pageLink = (n: (typeof links)[number]) => {
    const active = isActive(n.href);
    return (
      <Link
        key={n.href}
        href={n.href}
        tabIndex={visible ? 0 : -1}
        aria-current={active ? "page" : undefined}
        className={`relative rounded-[9px] px-2.5 py-[9px] text-body font-medium leading-none transition-colors duration-300 xl:px-3 ${focus} ${
          active ? "text-night" : "text-white/75 hover:bg-white/[0.07] hover:text-white"
        }`}
      >
        {active && <span data-pill aria-hidden className="absolute inset-y-0 left-0 w-full rounded-[9px]" style={{ background: SAND }} />}
        <span className="relative">{n.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* the logo, on the page itself: it scrolls away with the page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 transition-opacity duration-700" style={{ opacity: visible ? 1 : 0 }} aria-hidden={!visible}>
        {/* big, and level with the middle of the floating bar */}
        <div className="gutter mx-auto max-w-[1600px]">
          <Link
            href="/"
            aria-label={`${brand.name} — home`}
            tabIndex={visible ? 0 : -1}
            className={`pointer-events-auto inline-flex h-16 items-center rounded-[14px] lg:h-[74px] ${darkTop ? "text-white" : "text-night"} ${focus}`}
          >
            <span className="flex md:hidden">
              <Wordmark size="lg" tile={darkTop} />
            </span>
            <span className="hidden md:flex lg:hidden">
              <Wordmark size="xl" tile={darkTop} />
            </span>
            <span className="hidden lg:flex">
              <Wordmark size="xxl" tile={darkTop} />
            </span>
          </Link>
        </div>
      </div>

      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 text-white transition-[transform,opacity] duration-700 ease-[var(--ease-film)]"
        style={{ transform: visible ? "none" : "translateY(-140%)", opacity: visible ? 1 : 0 }}
        aria-hidden={!visible}
        data-site-nav
        data-nav-tone="dark"
      >
        <div className="gutter mx-auto flex max-w-[1600px] justify-end pt-2 lg:pt-3">
          {/* the pages, in a small bar that floats at the top right, ending in Contact; the call button and the menu on phones */}
          <nav
            aria-label="Primary"
            className="pointer-events-auto flex h-12 items-center gap-1 rounded-[14px] bg-night px-1.5 shadow-[0_16px_34px_-20px_rgba(4,12,30,0.8)] ring-1 ring-white/[0.06] lg:h-[50px] lg:px-[7px]"
          >
            <div ref={row} className="relative hidden items-center gap-0.5 lg:flex">
              {links.map((n) => pageLink(n))}
            </div>
            <span aria-hidden className="mx-1 hidden h-5 w-px bg-white/15 lg:block" />
            <a href={tel} tabIndex={visible ? 0 : -1} aria-label={`Call ${contact.phone}`} className={`grid h-9 w-9 place-items-center rounded-[10px] bg-white/[0.08] text-white transition-colors hover:bg-white/[0.16] lg:hidden ${focus}`}>
              <Phone size={16} aria-hidden />
            </a>
            <Link
              href="/contact"
              tabIndex={visible ? 0 : -1}
              aria-current={isActive("/contact") ? "page" : undefined}
              className={`group hidden h-9 items-center gap-2 rounded-[10px] bg-water-2 pl-3 pr-1 text-body font-semibold text-night transition-colors duration-300 hover:bg-[#7fe0ea] md:inline-flex ${focus}`}
            >
              Contact
              <span className="grid h-7 w-7 place-items-center rounded-[7px] bg-night text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={14} strokeWidth={1.8} />
              </span>
            </Link>
            <button
              type="button"
              className={`grid h-9 w-9 place-items-center rounded-[10px] transition-colors lg:hidden ${focus} ${open ? "bg-white/15" : "bg-white/[0.08] hover:bg-white/[0.16]"}`}
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
          </nav>
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
            <Link href="/" aria-label={`${brand.name} — home`} onClick={() => setOpen(false)} className={`absolute left-[var(--gutter)] top-0 inline-flex h-16 items-center rounded-[14px] ${focus}`}>
              <span className="flex md:hidden">
                <Wordmark size="lg" />
              </span>
              <span className="hidden md:flex">
                <Wordmark size="xl" />
              </span>
            </Link>
            <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center">
              {[...links, { label: "Contact", href: "/contact" }].map((n, i) => (
                <div key={n.href} className="overflow-hidden border-b border-white/10">
                  <motion.div initial={{ y: "105%" }} animate={{ y: 0 }} exit={{ y: "105%" }} transition={{ duration: 0.8, ease, delay: 0.12 + i * 0.05 }}>
                    <Link
                      href={n.href}
                      aria-current={isActive(n.href) ? "page" : undefined}
                      className="flex items-center justify-between py-3.5 text-sub font-medium"
                      style={{ fontFamily: "var(--font-display)" }}
                      onClick={() => setOpen(false)}
                    >
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
