"use client";
import Image from "next/image";
import { ArrowUpRight, Droplet, Phone } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQualityContext } from "@/components/providers/QualityProvider";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ArrowLink } from "@/components/ui/Primitives";
import { contact, waterproofSteps } from "@/lib/content";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/three/store";
import { range } from "@/lib/utils/math";
import { Dust } from "./Dust";
import { FilmCanvas } from "./FilmCanvas";

/**
 * "Land to Roof" waterproofing hero.
 *
 * 8 scroll steps (intro · six waterproofing stages · finale), one film clip per
 * step. Inside each step the first SCRUB share of the scroll plays the clip and
 * the rest holds its last frame so the copy can be read.
 *
 * Frames: public/film/wp (desktop) and wp-m (mobile), 8 × 36, built from the
 * Google Flow clips by scripts/build-hero-frames.mjs. FILM_MAX is the share of
 * the sequence to use (1 = all of it).
 */
const FILM_MAX = 1;
const SCRUB = 0.78;
const STEPS = waterproofSteps;
const N = STEPS.length;
const FADE = 0.022; // share of the whole hero scroll used to fade copy in/out
const WATER = "#8fc6e8";

const filmAt = (p: number) => {
  const s = Math.min(N - 1, Math.floor(p * N));
  const local = p * N - s;
  return ((s + Math.min(1, local / SCRUB)) / N) * FILM_MAX;
};

export function Hero() {
  const quality = useQualityContext();
  const [mobile, setMobile] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  if (mobile === null) return <section aria-label="RPC Constructions" className="relative bg-night" style={{ height: "100svh" }} />;
  // phones get the film as a normal autoplaying video, with the stage copy following along
  if (mobile) return <MobileVideoHero />;
  if (quality === "static") return <StaticHero />;
  return <FilmHero ready={quality !== null} low={quality === "low"} mobile={mobile} />;
}

function FilmHero({ ready, low, mobile }: { ready: boolean; low: boolean; mobile: boolean }) {
  const section = useRef<HTMLElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const railFill = useRef<HTMLSpanElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLDivElement>(null);
  const fore = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const lenis = useLenis();

  const getProgress = useCallback(() => filmAt(sceneState.display.hero), []);
  const onReady = useCallback(() => {
    if (sceneState.ready) return;
    sceneState.ready = true;
    window.dispatchEvent(new Event("rpc:ready"));
  }, []);

  useEffect(() => {
    if (!ready || !section.current) return;
    const el = section.current;
    const drive = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => (sceneState.target.hero = s.progress),
    });
    window.dispatchEvent(new Event("rpc:scene-visibility"));

    const fine = window.matchMedia("(pointer: fine)").matches && !low;
    let lastNav: boolean | null = null;
    let lastStep = -1;

    const tick = () => {
      const p = sceneState.display.hero;

      if (fine) {
        const { x, y } = sceneState.pointerDamped;
        if (film.current) film.current.style.transform = `translate3d(${-x * 10}px, ${-y * 6}px, 0) scale(1.02)`;
        if (fore.current) fore.current.style.transform = `translate3d(${x * 8}px, ${y * 5}px, 0)`;
      }

      const s = Math.min(N - 1, Math.floor(p * N));
      const local = Math.min(1, p * N - s);
      if (s !== lastStep) { lastStep = s; setActive(s); }

      // nav: always on phones; on desktop it joins the finale
      const nav = mobile || s === N - 1;
      if (nav !== lastNav) {
        lastNav = nav;
        sceneState.heroNavVisible = nav;
        window.dispatchEvent(new CustomEvent("rpc:hero-nav", { detail: { visible: nav, progress: p } }));
      }

      STEPS.forEach((_, i) => {
        const c = panels.current[i];
        if (!c) return;
        const a = i / N;
        const b = (i + 1) / N;
        const inO = i === 0 ? 1 : range(p, a, a + FADE);
        const outO = i === N - 1 ? 1 : 1 - range(p, b - FADE, b);
        const o = Math.min(inO, outO);
        c.style.opacity = String(o);
        c.style.transform = `translate3d(0, ${(1 - o) * (inO < 1 ? 26 : -26)}px, 0)`;
        c.style.visibility = o <= 0.001 ? "hidden" : "visible";
        c.style.pointerEvents = o > 0.6 ? "auto" : "none";
      });

      if (railFill.current) railFill.current.style.transform = `scaleY(${p})`;
      bars.current.forEach((b, i) => {
        if (b) b.style.transform = `scaleX(${i < s ? 1 : i === s ? local : 0})`;
      });
      if (cue.current) cue.current.style.opacity = String(0.9 * (1 - range(p, 0, 0.03)));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      drive.kill();
      sceneState.heroNavVisible = true;
      window.dispatchEvent(new CustomEvent("rpc:hero-nav", { detail: { visible: true } }));
    };
  }, [ready, low, mobile]);

  const goTo = (i: number) => {
    const el = section.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + total * ((i + (i === 0 ? 0 : 0.5)) / N);
    if (lenis) lenis.scrollTo(top, { duration: 1.6 });
    else window.scrollTo({ top, behavior: "smooth" });
  };

  const stageNo = active >= 1 && active <= 6 ? active : null;

  return (
    <section
      ref={section}
      aria-label="RPC Constructions — waterproofing from land to roof"
      className="relative"
      style={{ height: mobile ? `${N * 90}svh` : `${N * 100}vh` }}
    >
      <div data-tone="dark" className="sticky top-0 h-[100svh] overflow-hidden bg-night text-paper">
        {/* phones: the film sits in the top ~60% (far less side-crop of the 16:9 footage) and the copy below it; md+: full-bleed */}
        <div ref={film} aria-hidden className="absolute inset-x-0 top-0 h-[60svh] will-change-transform md:inset-0 md:h-auto" style={{ transform: "scale(1.02)" }}>
          <FilmCanvas getProgress={getProgress} onReady={onReady} />
        </div>
        <Dust count={low || mobile ? 24 : 60} active={ready} />

        {/* legibility */}
        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_22vmin_rgba(0,0,0,0.4)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[34svh] h-[27svh] bg-gradient-to-b from-transparent via-night/70 to-night md:hidden" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent md:block" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-3/5 bg-gradient-to-r from-black/50 via-black/15 to-transparent md:block" />

        {/* stage counter */}
        <div
          aria-hidden
          className="gutter absolute right-0 top-28 hidden font-mono text-sm tracking-[0.2em] transition-opacity duration-500 md:block"
          style={{ opacity: stageNo ? 0.85 : 0 }}
        >
          <span style={{ color: WATER }}>{String(stageNo ?? 1).padStart(2, "0")}</span>
          <span className="opacity-50"> / 06</span>
        </div>

        {/* phone progress: 8 segments under the header */}
        <div aria-hidden className="absolute inset-x-4 top-[88px] flex gap-1 md:hidden">
          {STEPS.map((s, i) => (
            <span key={s.key} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/20">
              <span
                ref={(el) => { bars.current[i] = el; }}
                className="absolute inset-0 origin-left rounded-full"
                style={{ background: WATER, transform: "scaleX(0)" }}
              />
            </span>
          ))}
        </div>

        {/* desktop rail */}
        <nav aria-label="Waterproofing stages" className="absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 md:block lg:right-12">
          <div className="relative flex flex-col gap-6 pr-6">
            <span aria-hidden className="absolute bottom-2 right-[3px] top-2 w-px bg-white/20" />
            <span ref={railFill} aria-hidden className="absolute bottom-2 right-[3px] top-2 w-px origin-top" style={{ background: WATER, transform: "scaleY(0)" }} />
            {STEPS.map((s, i) => {
              const on = i === active;
              const done = i < active;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={on ? "step" : undefined}
                  aria-label={`${i >= 1 && i <= 6 ? `Stage ${i}: ` : ""}${s.rail}`}
                  className="group relative flex h-3 items-center justify-end"
                >
                  <span
                    className={`eyebrow !text-[10px] whitespace-nowrap transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`}
                  >
                    {s.rail}
                  </span>
                  <span
                    aria-hidden
                    className="absolute -right-6 h-[7px] w-[7px] rounded-full border transition-all duration-500"
                    style={{
                      borderColor: on || done ? WATER : "rgba(255,255,255,0.5)",
                      background: done ? WATER : on ? "var(--color-night)" : "var(--color-night)",
                      transform: `scale(${on ? 1.55 : 1})`,
                      boxShadow: on ? `0 0 0 4px rgba(143,198,232,0.18)` : "none",
                    }}
                  />
                </button>
              );
            })}
          </div>
        </nav>

        {/* copy — one panel per step, faded by the ticker */}
        <div ref={fore} className="absolute inset-0 will-change-transform">
          {STEPS.map((s, i) => {
            const big = i === 0 || i === N - 1;
            const Title = i === 0 ? "h1" : "h2";
            return (
              <div
                key={s.key}
                ref={(el) => { panels.current[i] = el; }}
                className="gutter absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] will-change-transform md:bottom-[9svh] md:right-40 [@media(min-width:768px)_and_(max-height:620px)]:bottom-6"
                style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
              >
                <div className={big ? "max-w-[54rem]" : "max-w-[46rem]"}>
                  <p className="eyebrow mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-paper/80 md:mb-4">
                    {i >= 1 && i <= 6 && (
                      <>
                        <span style={{ color: WATER }}>Stage {String(i).padStart(2, "0")}</span>
                        <span className="h-px w-8 bg-current opacity-40" />
                      </>
                    )}
                    <span>{s.eyebrow}</span>
                  </p>
                  <Title
                    className={`display drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)] ${big ? "leading-[0.84]" : "leading-[0.95]"}`}
                    style={{ fontSize: big ? "clamp(2.6rem, min(8vw, 11svh), 9.5rem)" : "clamp(1.85rem, min(4.4vw, 6.5svh), 4.6rem)" }}
                  >
                    {s.title}
                    {s.titleEm && <em className="block">{s.titleEm}</em>}
                  </Title>

                  {s.technique && (
                    <p
                      className="mt-3 inline-flex items-center gap-2 rounded-full border bg-black/35 px-3 py-1.5 md:mt-5 md:px-3.5 font-mono text-[10.5px] uppercase leading-snug tracking-[0.14em] backdrop-blur-md md:text-[11.5px]"
                      style={{ borderColor: "rgba(143,198,232,0.45)", color: WATER }}
                    >
                      <Droplet size={13} aria-hidden className="shrink-0" />
                      {s.technique}
                    </p>
                  )}

                  {s.process && (
                    <ol className="mt-4 grid gap-x-10 gap-y-1.5 text-[13px] leading-snug text-paper/85 sm:grid-cols-2 md:mt-5 md:gap-y-2.5 md:text-[15px] [@media(max-height:620px)]:mt-3 [@media(max-height:620px)]:gap-y-1 [@media(max-height:620px)]:text-[12px]">
                      {s.process.map((line, k) => (
                        <li key={line} className="flex gap-3 border-t border-white/15 pt-1.5 md:pt-2.5 [@media(max-height:620px)]:pt-1">
                          <span className="font-mono text-[10.5px] leading-[1.7] text-paper/45">{String(k + 1).padStart(2, "0")}</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  {s.body && <p className="mt-4 max-w-md md:mt-5 [@media(max-height:480px)]:hidden text-[15px] leading-relaxed text-paper/80 md:text-base">{s.body}</p>}

                  {i === N - 1 && (
                    <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5 md:mt-7 md:gap-3">
                      <div className="col-span-2 [&>*]:!block sm:[&>*]:!inline-block [&_.btn]:w-full [&_.btn]:justify-between sm:[&_.btn]:w-auto">
                        <ArrowLink href="/contact" variant="light">Free site inspection</ArrowLink>
                      </div>
                      <a href={`tel:${contact.phone.replace(/\s/g, "")}`} aria-label={`Call ${contact.phone}`} className="btn btn-ghost justify-between border-white/40 bg-black/40 !px-4 text-paper backdrop-blur-md hover:bg-black/60 sm:!px-[1.4rem]">
                        <span>Call<span className="hidden sm:inline"> {contact.phone}</span></span>
                        <span className="btn-icon" aria-hidden><Phone size={14} strokeWidth={1.5} /></span>
                      </a>
                      <a
                        href={`${contact.whatsapp}?text=${encodeURIComponent("Hi RPC, I'd like a waterproofing plan for my site.")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost justify-between border-white/40 bg-black/40 !px-4 text-paper backdrop-blur-md hover:bg-black/60 sm:!px-[1.4rem]"
                      >
                        <span>WhatsApp</span>
                        <span className="btn-icon" aria-hidden><Droplet size={14} strokeWidth={1.5} /></span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* scroll cue */}
        <div ref={cue} className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-paper md:flex" style={{ opacity: 0.9 }}>
          <span aria-hidden className="relative block h-10 w-6 rounded-full border-2" style={{ borderColor: "rgba(255,255,255,0.85)" }}>
            <span className="absolute left-1/2 top-2 block h-2 w-1 -translate-x-1/2 rounded-full bg-current" style={{ animation: "wheel 1.8s cubic-bezier(0.65,0,0.35,1) infinite" }} />
          </span>
          <span className="eyebrow !text-[10px] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Scroll to build</span>
        </div>
      </div>
    </section>
  );
}


/**
 * Phone hero: the waterproofing film plays as a muted, inline, autoplaying video
 * (public/film/hero-wp-mobile.mp4 — 7 s total: 0.75 s intro + 7 clips sped up
 * to 0.875 s each, built from the same Flow clips; shown full-frame 16:9, no crop). The copy below follows the video's time; tapping a segment
 * jumps to that stage. It plays once and rests on the finale with the CTAs.
 */
const MOBILE_VIDEO = "/film/hero-wp-mobile.mp4";
const MOBILE_POSTER = "/film/hero-wp-mobile-poster.jpg";
/** start time (s) of each of the 8 steps in the mobile video, and its length */
const STEP_START = [0, 0.75, 1.625, 2.5, 3.375, 4.25, 5.125, 6];
const VIDEO_END = 6.875;

/** Short copy for phones — the whole step has to fit on one screen */
const MOBILE_COPY: Record<string, { chip?: string; line: string; title?: string }> = {
  intro: { title: "Marking out the plot", line: "6 stages of protection, built in — not patched on." },
  land: { chip: "Anti-termite + HDPE membrane", line: "Excavate → PCC base → anti-termite → sealed HDPE sheet" },
  foundation: { chip: "Crystalline + PVC waterstops", line: "Waterstops at joints → crystalline concrete → slurry coat" },
  plinth: { chip: "Damp Proof Course (DPC)", line: "40 mm DPC concrete → bitumen coat → full cure" },
  structure: { chip: "Integral waterproof admixture", line: "Admixture in every pour → dense slabs → waterproof plaster" },
  wet: { chip: "2-part coating + epoxy grout", line: "Seal pipes → 2 coats → 48 h pond test → epoxy-grouted tiles" },
  roof: { chip: "PU membrane + elastomeric paint", line: "PU roof membrane → heat-reflective coat → façade paint" },
  finale: { title: "Built to stay dry", line: "Get a stage-wise waterproofing plan for your site." },
};

function MobileVideoHero() {
  const video = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    sceneState.filmLoaded = 1;
    if (!sceneState.ready) {
      sceneState.ready = true;
      window.dispatchEvent(new Event("rpc:ready"));
    }
    sceneState.heroNavVisible = true;
    window.dispatchEvent(new CustomEvent("rpc:hero-nav", { detail: { visible: true } }));

    const v = video.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    const tryPlay = () => {
      if (!v.paused || v.ended) return;
      v.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
    };
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    window.addEventListener("touchstart", tryPlay, { once: true, passive: true });
    const onTime = () => {
      const t = v.currentTime;
      let s = 0;
      for (let i = 0; i < STEP_START.length; i++) if (t >= STEP_START[i]!) s = i;
      setStep(s);
    };
    const onEnded = () => setEnded(true);
    const onPlay = () => { setEnded(false); setBlocked(false); };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnded);
    v.addEventListener("play", onPlay);
    const io = new IntersectionObserver(([en]) => {
      if (!en) return;
      if (en.isIntersecting) { if (!v.ended) v.play().catch(() => {}); } else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("canplay", tryPlay);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("play", onPlay);
    };
  }, []);

  const replay = () => {
    const v = video.current;
    if (!v) return;
    if (v.ended) v.currentTime = 0;
    v.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
  };

  const st = STEPS[step]!;
  const no = step >= 1 && step <= 6 ? String(step).padStart(2, "0") : step === 0 ? "00" : "07";

  // same layout as the original phone hero: tall film on top, brand copy below
  return (
    <section aria-label="RPC Constructions — waterproofing from land to roof" className="relative bg-night text-paper">
      <div className="relative overflow-hidden" style={{ height: "64svh", minHeight: 420 }}>
        <video
          ref={video}
          className="absolute inset-0 h-full w-full object-cover"
          src={MOBILE_VIDEO}
          poster={MOBILE_POSTER}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden
        />
        <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(to top, var(--color-night), transparent)" }} />
        <p className="absolute bottom-5 left-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] backdrop-blur-md">
          <span className="font-mono text-paper/60">{no}</span>
          <span>{st.rail}</span>
        </p>
        {(blocked || ended) && (
          <button
            type="button"
            onClick={replay}
            className="absolute bottom-5 right-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] backdrop-blur-md"
          >
            <span aria-hidden>{ended ? "↺" : "▶"}</span>
            {ended ? "Replay" : "Play"}
          </button>
        )}
      </div>
      <div className="gutter pb-12 pt-4">
        <p className="eyebrow text-paper/70">Waterproofing · Land to Roof</p>
        <h1 className="display mt-3 leading-[0.9]" style={{ fontSize: "12.5vw" }}>
          Waterproofed from <em className="text-paper/90">land to roof.</em>
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-paper/80">
          Six stages of protection, built into the construction itself — from the soil under the raft to the roof above.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <Link href="/contact" className="inline-flex h-12 items-center justify-between whitespace-nowrap rounded-full bg-paper pl-5 pr-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-ink">
            Free Inspection
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/10"><ArrowUpRight size={14} /></span>
          </Link>
          <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="inline-flex h-12 items-center justify-between rounded-full border border-white/40 bg-white/5 pl-5 pr-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-paper">
            Call Us
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10"><Phone size={14} /></span>
          </a>
        </div>
      </div>
    </section>
  );
}

/** Reduced motion: one composed still with the whole waterproofing story in text. */
function StaticHero() {
  useEffect(() => {
    sceneState.ready = true;
    window.dispatchEvent(new Event("rpc:ready"));
    window.dispatchEvent(new CustomEvent("rpc:hero-nav", { detail: { visible: true } }));
  }, []);
  const intro = STEPS[0]!;
  return (
    <section aria-label="RPC Constructions — waterproofing from land to roof" className="relative min-h-[100svh] overflow-hidden bg-night text-paper">
      <Image src="/film/wp-final.jpg" alt="Completed RPC building in monsoon rain" fill priority sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
      <div className="gutter relative flex min-h-[100svh] flex-col justify-end pb-12 pt-32">
        <p className="eyebrow mb-5 opacity-80">{intro.eyebrow}</p>
        <h1 className="display text-[14vw] leading-[0.84] md:text-[7vw]">
          {intro.title} <em>{intro.titleEm}</em>
        </h1>
        <ol className="mt-8 grid max-w-5xl gap-3 text-sm text-paper/85 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.slice(1, 7).map((s, i) => (
            <li key={s.key} className="border-t border-white/20 pt-3">
              <span className="font-mono text-[11px]" style={{ color: WATER }}>0{i + 1} · {s.eyebrow}</span>
              <span className="mt-1 block">{s.technique}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <ArrowLink href="/contact" variant="light">Free site inspection</ArrowLink>
        </div>
      </div>
    </section>
  );
}
