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
/** the pages in the bar; Contact has its own button at the right */
const links = nav.filter((n) => n.href !== "/contact");

/**
 * Fixed navigation: one full-width bar that keeps the same size and layout
 * while the page scrolls — logo left, links centre, Contact right. A soft
 * frosted veil always sits behind it, so it reads over any page, and the
 * page you are on is marked. No rule underneath.
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
  // the classic home keeps the bar hidden until its opening film has played
  const filmHome = pathname === "/classic";

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
          if (tag === "IMG" || tag === "CANVAS" || tag === "VIDEO" || tag === "IFRAME") {
            // a section can say what its pictures look like behind the bar
            const hint = el.closest<HTMLElement>("[data-nav-tone]")?.dataset.navTone;
            if (hint === "light" || hint === "dark") tone = hint;
            break;
          }
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
  const veil = !open; // a soft frosted veil always sits behind the bar, a little firmer once the page has scrolled
  const dark = light && !open; // dark type over light sections; the veil follows the section under it
  const isActive = (href: string) => (href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href)));

  return (
    <>
      <header
        className="gutter pointer-events-none fixed inset-x-0 top-0 z-50 flex pb-2 pt-2 transition-[transform,opacity] duration-700 ease-[var(--ease-film)] md:pb-2.5 md:pt-3"
        style={{ transform: visible ? "none" : "translateY(-140%)", opacity: visible ? 1 : 0 }}
        aria-hidden={!visible}
        data-site-nav
        data-nav-tone={dark ? "light" : "dark"}
      >
        {/* frosted veil behind the full-width bar, fading out at its lower edge so there is no rule underneath */}
        <div
          aria-hidden
          className={`absolute inset-0 backdrop-blur-xl backdrop-saturate-150 transition-[opacity,background-color] duration-500 [mask-image:linear-gradient(to_bottom,#000_65%,transparent)] ${
            dark ? (scrolled ? "bg-paper/85" : "bg-paper/60") : scrolled ? "bg-night/60" : "bg-night/35"
          } ${veil ? "opacity-100" : "opacity-0"}`}
        />
        {/* logo in the left corner, links centred, call to action in the right corner — always the same size */}
        <div
          className={`pointer-events-auto relative mx-auto flex h-12 w-full items-center justify-between gap-4 transition-colors duration-500 ${
            dark ? "text-ink" : "text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]"
          }`}
        >
          <Link href="/" aria-label={`${brand.name} — home`} tabIndex={visible ? 0 : -1} className="-ml-1 shrink-0 rounded-full py-1 pl-1 pr-2">
            <Wordmark size="sm" />
          </Link>

          <nav aria-label="Primary" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex">
            {links.map((n) => {
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  tabIndex={visible ? 0 : -1}
                  aria-current={active ? "page" : undefined}
                  className={`group relative rounded-full px-3 py-1.5 text-body font-medium transition-[opacity,background-color] duration-300 xl:px-3.5 ${
                    active ? (dark ? "bg-ink/[0.08] opacity-100" : "bg-white/[0.16] opacity-100") : "opacity-75 hover:opacity-100"
                  }`}
                >
                  {n.label}
                  <span
                    aria-hidden
                    className={`absolute bottom-[1px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-water-2 transition-opacity duration-300 ${
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/contact"
              tabIndex={visible ? 0 : -1}
              aria-current={isActive("/contact") ? "page" : undefined}
              className={`group hidden h-9 items-center gap-2 rounded-full pl-4 pr-1 text-body font-semibold transition-colors duration-300 [text-shadow:none] md:inline-flex ${
                dark ? "bg-ink text-white hover:bg-water" : "bg-white text-ink hover:bg-[#e3f4f6]"
              } ${isActive("/contact") ? (dark ? "ring-2 ring-water/60 ring-offset-2 ring-offset-paper" : "ring-2 ring-water-2/70 ring-offset-2 ring-offset-night") : ""}`}
            >
              <span>Contact</span>
              <span className={`grid h-7 w-7 place-items-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${dark ? "bg-white text-ink" : "bg-ink text-white"}`}>
                <ArrowUpRight size={13} strokeWidth={1.8} />
              </span>
            </Link>
            <button
              type="button"
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors lg:hidden ${dark ? "bg-ink/10 hover:bg-ink/20" : "bg-white/15 hover:bg-white/25"}`}
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
            className="gutter fixed inset-0 z-40 flex flex-col bg-night pb-10 pt-24 text-paper lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.9, ease }}
          >
            <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-1">
              {links.map((n, i) => (
                <div key={n.href} className="overflow-hidden">
                  <motion.div initial={{ y: "105%" }} animate={{ y: 0 }} exit={{ y: "105%" }} transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.06 }}>
                    <Link href={n.href} className="display flex items-baseline gap-4 py-1 text-title" onClick={() => setOpen(false)}>
                      <span className={isActive(n.href) ? "italic text-water-2" : ""}>{n.label}</span>
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mb-6 inline-flex h-12 items-center justify-between gap-3 self-start rounded-full bg-paper pl-5 pr-1.5 text-body font-semibold text-ink"
            >
              Contact
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-paper"><ArrowUpRight size={15} /></span>
            </Link>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="grid gap-4 border-t border-white/15 pt-6 text-body sm:grid-cols-2">
              <a href={`mailto:${contact.email}`} className="flex items-center gap-3"><Mail size={16} className="opacity-60" />{contact.email}</a>
              <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-3"><Phone size={16} className="opacity-60" />{contact.phone}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
