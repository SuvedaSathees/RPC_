"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Building2, Clock, Droplet, House, Mail, Package, Phone, Users, Wrench, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { brand, contact, nav } from "@/lib/content";
import { sceneState } from "@/lib/three/store";
import { useLenis } from "@/components/providers/SmoothScroll";
import { Wordmark } from "./Logo";

const ease = [0.22, 1, 0.36, 1] as const;
/** the pages in the bar; Contact has its own button at the right */
const links = nav.filter((n) => n.href !== "/contact");
const tel = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;
/** a small picture for each page, above its name */
const ICON: Record<string, LucideIcon> = {
  "/": House,
  "/about": Users,
  "/products": Package,
  "/waterproofing": Droplet,
  "/projects": Building2,
  "/services": Wrench,
  "/blog": BookOpen,
  "/contact": Phone,
};
/** the page's sand, for the tab of the page you are on */
const SAND = "#ece6da";

/**
 * The header: one band of the logo's dark blue across the top with the logo
 * at the left, the pages as tabs at the right (a small picture above each
 * name), and the free inspection at the far right. The page you are on is a
 * sand tab that runs down into the page below, as a folder's tab does, and
 * slides across to the next page when you move. Phones get the logo, the
 * call button and the menu.
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

  // moving to another page, the sand tab slides across from the page you left (measured inside the bar, so the page's scroll never moves it)
  const row = useRef<HTMLDivElement>(null);
  const lastTab = useRef<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const cur = row.current?.querySelector<HTMLElement>('a[aria-current="page"]');
    const sand = cur?.querySelector<HTMLElement>("[data-tab]");
    const from = lastTab.current;
    lastTab.current = cur ? { left: cur.offsetLeft, width: cur.offsetWidth } : null;
    if (!cur || !sand || !from || !sand.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (from.left === cur.offsetLeft) return;
    sand.animate(
      [
        { left: `${from.left - cur.offsetLeft}px`, width: `${from.width}px` },
        { left: "0px", width: `${cur.offsetWidth}px` },
      ],
      { duration: 460, easing: "cubic-bezier(0.3, 1.2, 0.5, 1)" },
    );
  }, [pathname]);

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

  /** a page's tab: its picture above its name; the page you are on is the sand tab */
  const tab = (n: (typeof links)[number]) => {
    const active = isActive(n.href);
    const Icon = ICON[n.href] ?? House;
    return (
      <Link
        key={n.href}
        href={n.href}
        tabIndex={visible ? 0 : -1}
        aria-current={active ? "page" : undefined}
        className={`relative flex h-[52px] flex-col items-center justify-center gap-[5px] rounded-t-[12px] px-2.5 text-body font-medium leading-none transition-colors duration-300 xl:px-3.5 ${focus} ${
          active ? "text-night" : "text-white/70 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        {active && (
          <span data-tab aria-hidden className="absolute inset-y-0 left-0 w-full rounded-t-[12px]" style={{ background: SAND }}>
            {/* the tab's feet curve out into the page */}
            <span className="absolute -left-3 bottom-0 h-3 w-3" style={{ background: `radial-gradient(circle at 0 0, transparent 11.5px, ${SAND} 12px)` }} />
            <span className="absolute -right-3 bottom-0 h-3 w-3" style={{ background: `radial-gradient(circle at 100% 0, transparent 11.5px, ${SAND} 12px)` }} />
          </span>
        )}
        <Icon size={19} strokeWidth={1.7} aria-hidden className="relative" />
        <span className="relative">{n.label}</span>
      </Link>
    );
  };

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
        <div className={`bg-night transition-shadow duration-500 ${scrolled ? "shadow-[0_12px_28px_-18px_rgba(4,12,30,0.8)]" : ""}`}>
          <nav aria-label="Primary" className="gutter mx-auto flex h-[60px] max-w-[1600px] items-center gap-3 lg:h-16 lg:items-end">
            {/* the logo, at the left */}
            <Link href="/" aria-label={`${brand.name} — home`} tabIndex={visible ? 0 : -1} className={`shrink-0 rounded-[12px] lg:self-center ${focus}`}>
              <Wordmark size="sm" />
            </Link>

            {/* the pages, as tabs along the band's lower edge */}
            <div ref={row} className="relative ml-auto hidden items-end gap-0.5 lg:flex">
              {links.map((n) => tab(n))}
            </div>

            {/* the free inspection; the call button and the menu on phones and tablets */}
            <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-4 lg:self-center xl:ml-6">
              <a href={tel} tabIndex={visible ? 0 : -1} aria-label={`Call ${contact.phone}`} className={`grid h-10 w-10 place-items-center rounded-[10px] bg-white/[0.08] text-white transition-colors hover:bg-white/[0.16] lg:hidden ${focus}`}>
                <Phone size={17} aria-hidden />
              </a>
              <Link
                href="/contact"
                tabIndex={visible ? 0 : -1}
                aria-current={isActive("/contact") ? "page" : undefined}
                className={`group hidden h-10 items-center gap-2 rounded-[10px] bg-water-2 pl-3.5 pr-1 text-body font-semibold text-night transition-colors duration-300 hover:bg-[#7fe0ea] md:inline-flex ${focus}`}
              >
                <span className="xl:hidden">Contact</span>
                <span className="hidden xl:inline">Book a free inspection</span>
                <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-night text-white transition-transform duration-300 group-hover:rotate-45">
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
            <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center">
              {[...links, { label: "Contact", href: "/contact" }].map((n, i) => {
                const Icon = ICON[n.href] ?? House;
                const active = isActive(n.href);
                return (
                  <div key={n.href} className="overflow-hidden border-b border-white/10">
                    <motion.div initial={{ y: "105%" }} animate={{ y: 0 }} exit={{ y: "105%" }} transition={{ duration: 0.8, ease, delay: 0.12 + i * 0.05 }}>
                      <Link
                        href={n.href}
                        aria-current={active ? "page" : undefined}
                        className="flex items-center gap-3.5 py-3.5 text-sub font-medium"
                        style={{ fontFamily: "var(--font-display)" }}
                        onClick={() => setOpen(false)}
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${active ? "bg-paper text-night" : "bg-white/[0.07] text-water-2"}`}>
                          <Icon size={18} strokeWidth={1.7} aria-hidden />
                        </span>
                        <span className={`flex-1 ${active ? "text-white" : "text-white/85"}`}>{n.label}</span>
                        <ArrowUpRight size={18} className="opacity-50" aria-hidden />
                      </Link>
                    </motion.div>
                  </div>
                );
              })}
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
