"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand, contact, nav } from "@/lib/content";
import { sceneState } from "@/lib/three/store";
import { useLenis } from "@/components/providers/SmoothScroll";
import { Wordmark } from "./Logo";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Floating navigation: a single compact glass bar, centred and capped in
 * width — logo left, links centre, call to action right. No rule underneath.
 *
 * On the home page the whole nav stays out of the way while the construction
 * film plays and arrives together with the closing "RPC Constructions" reveal.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const [heroNavVisible, setHeroNavVisible] = useState(() => sceneState.heroNavVisible || false);
  const [pastHero, setPastHero] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // what the bar is floating over: light paper sections switch it to dark type
  const [light, setLight] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();
  const isHome = pathname === "/";

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let raf = 0;
    const sample = () => {
      raf = 0;
      setScrolled(window.scrollY > 40);
      // look at what sits just under the bar (ignoring the header itself)
      const y = 34;
      const xs = [window.innerWidth * 0.25, window.innerWidth * 0.5, window.innerWidth * 0.75];
      let lightVotes = 0;
      for (const x of xs) {
        const stack = document.elementsFromPoint(x, y).filter((el) => !el.closest("[data-site-nav]"));
        let tone: "light" | "dark" = "dark";
        for (const el of stack) {
          const tag = el.tagName;
          if (tag === "IMG" || tag === "CANVAS" || tag === "VIDEO" || tag === "IFRAME") break;
          const bg = getComputedStyle(el).backgroundColor;
          const m = bg.match(/rgba?\(([^)]+)\)/);
          if (!m) continue;
          const [r, g, b, a = "1"] = m[1]!.split(",").map((v) => v.trim());
          if (Number(a) < 0.5) continue;
          const lum = (0.2126 * Number(r) + 0.7152 * Number(g) + 0.0722 * Number(b)) / 255;
          tone = lum > 0.6 ? "light" : "dark";
          break;
        }
        if (tone === "light") lightVotes++;
      }
      setLight(lightVotes >= 2);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sample);
    };
    sample();
    const id = window.setInterval(onScroll, 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearInterval(id);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open, lenis]);

  useEffect(() => {
    if (!isHome) return;
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
  }, [isHome]);

  if (pathname?.startsWith("/studio")) return null;

  const visible = open || !isHome || pastHero || heroNavVisible;
  const solid = scrolled && !open; // once scrolled, the nav becomes a frosted pill
  const dark = light && !open; // dark type over light sections; the pill follows the section under it
  const isActive = (href: string) => (href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href)));

  return (
    <>
      <header
        className={`gutter pointer-events-none fixed inset-x-0 top-0 z-50 flex transition-[transform,opacity,padding] duration-700 ease-[var(--ease-film)] ${solid ? "pt-2.5" : "pt-3 md:pt-5"}`}
        style={{ transform: visible ? "none" : "translateY(-140%)", opacity: visible ? 1 : 0 }}
        aria-hidden={!visible}
        data-site-nav
        data-nav-tone={dark ? "light" : "dark"}
      >
        {/* logo in the left corner, links centred, call to action in the right corner */}
        <div
          style={{ maxWidth: solid ? 1080 : 4000 }}
          className={`pointer-events-auto relative mx-auto flex w-full items-center justify-between gap-4 rounded-full border transition-all duration-700 ease-[var(--ease-film)] ${
            solid
              ? dark
                ? "h-[54px] border-ink/10 bg-[#f4f1ec]/90 pl-3 pr-1.5 text-ink shadow-[0_18px_40px_-22px_rgba(17,19,22,0.45)] backdrop-blur-xl backdrop-saturate-150"
                : "h-[54px] border-white/10 bg-[#0b111c]/55 pl-3 pr-1.5 text-white shadow-[0_18px_40px_-22px_rgba(0,0,0,0.7)] backdrop-blur-xl backdrop-saturate-150"
              : `h-16 border-transparent px-0 ${dark ? "text-ink" : "text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]"}`
          }`}
        >
          <Link href="/" aria-label={`${brand.name} — home`} tabIndex={visible ? 0 : -1} className="-ml-1 shrink-0 rounded-full py-1 pl-1 pr-2">
            <Wordmark size="sm" />
          </Link>

          <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
            {nav.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  tabIndex={visible ? 0 : -1}
                  aria-current={active ? "page" : undefined}
                  className={`group relative rounded-full px-3.5 py-1.5 text-[13.5px] font-medium tracking-[0.01em] transition-all duration-300 ${
                    solid
                      ? dark
                        ? active
                          ? "bg-ink text-paper"
                          : "text-ink/70 hover:bg-ink/[0.06] hover:text-ink"
                        : active
                          ? "bg-white text-ink"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      : active
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {n.label}
                  <span
                    aria-hidden
                    className={`absolute -bottom-0.5 left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#5b8cff] transition-opacity duration-300 ${
                      solid ? "opacity-0" : active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/contact#enquiry"
              tabIndex={visible ? 0 : -1}
              className={`group hidden h-10 items-center gap-2 rounded-full pl-4 pr-1 text-[13px] font-semibold transition-colors duration-300 [text-shadow:none] md:inline-flex ${
                dark ? "bg-ink text-white hover:bg-rpc" : "bg-white text-ink hover:bg-[#eef2ff]"
              }`}
            >
              <span>Start a project</span>
              <span className={`grid h-8 w-8 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${dark ? "bg-white text-ink" : "bg-ink text-white"}`}>
                <ArrowUpRight size={14} strokeWidth={1.8} />
              </span>
            </Link>
            <button
              type="button"
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden ${dark ? "bg-ink/10 hover:bg-ink/20" : "bg-white/15 hover:bg-white/25"}`}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-2.5 w-5">
                <span className="absolute left-0 top-0 h-[1.5px] w-full rounded bg-current transition-transform duration-500" style={{ transform: open ? "translateY(4.5px) rotate(45deg)" : "none" }} />
                <span className="absolute bottom-0 left-0 h-[1.5px] w-full rounded bg-current transition-transform duration-500" style={{ transform: open ? "translateY(-4.5px) rotate(-45deg)" : "none" }} />
              </span>
            </button>
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
            className="gutter fixed inset-0 z-40 flex flex-col bg-night pb-10 pt-32 text-paper lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.9, ease }}
          >
            <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-1">
              {nav.map((n, i) => (
                <div key={n.href} className="overflow-hidden">
                  <motion.div initial={{ y: "105%" }} animate={{ y: 0 }} exit={{ y: "105%" }} transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.06 }}>
                    <Link href={n.href} className="display flex items-baseline gap-4 py-1 text-[13vw] sm:text-[9vw]" onClick={() => setOpen(false)}>
                      <span className="eyebrow !text-[10px] opacity-50">0{i + 1}</span>
                      <span className={isActive(n.href) ? "italic" : ""}>{n.label}</span>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <Link
              href="/contact#enquiry"
              onClick={() => setOpen(false)}
              className="mb-6 inline-flex h-12 items-center justify-between gap-3 self-start rounded-full bg-paper pl-5 pr-1.5 text-sm font-semibold text-ink"
            >
              Start a project
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper"><ArrowUpRight size={15} /></span>
            </Link>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="grid gap-4 border-t border-white/15 pt-6 text-sm sm:grid-cols-2">
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3"><Mail size={16} className="opacity-60" />{contact.email}</a>
              <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-3"><Phone size={16} className="opacity-60" />{contact.phone}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
