"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type RefObject } from "react";
import { LogoMark } from "@/components/navigation/Logo";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";

const ease = [0.76, 0, 0.24, 1] as const;

/** the story the hero tells, read out while its pictures load */
const STAGES = [
  "Reading the slab",
  "Injection grouting",
  "Crystalline treatment",
  "Liquid membrane",
  "Torch-on membrane",
  "Sealed and dry",
];

/** set once the full opening has played, so a return in the same visit is quick */
const INTRO_KEY = "rpc-art-intro";
const MIN_MS = 1700;
const MIN_MS_RETURN = 500;
const MAX_MS = 9000;

export interface LoadProgress {
  /** share of the hero's pictures loaded, 0 … 1 */
  share: number;
  /** everything is in and the scene can start */
  done: boolean;
}

/**
 * Opening card for the "art of waterproofing" home, in the same style as the
 * main home's: the cube mark floating and turning on a drafting grid, the
 * story's stages read out, and a counter that follows the hero's pictures as
 * they load (a time floor keeps it moving on fast connections, so it reads as
 * a deliberate beat rather than a stall). It wipes up off the page; `onReveal`
 * fires as it starts to leave and `onGone` once it has.
 */
export function ArtLoader({ progress, onReveal, onGone }: { progress: RefObject<LoadProgress>; onReveal: () => void; onGone: () => void }) {
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);
  const [stage, setStage] = useState(0);
  const num = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const revealed = useRef(false);

  useEffect(() => {
    // always open at the top of the page
    window.scrollTo(0, 0);
    let minMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 300 : MIN_MS;
    try {
      if (sessionStorage.getItem(INTRO_KEY) === "1") minMs = Math.min(minMs, MIN_MS_RETURN);
    } catch {
      /* storage unavailable: play the full opening */
    }
    const start = performance.now();
    let last = start;
    let raf = 0;
    let shown = 0;
    let lastStage = -1;
    const loop = (now: number) => {
      const t = now - start;
      const dt = Math.min(0.25, Math.max(0, (now - last) / 1000));
      last = now;
      const p = progress.current ?? { share: 0, done: false };
      const timeFloor = Math.min(1, t / minMs);
      // never ahead of time, never ahead of the real loading beyond the first third
      const target = p.done ? timeFloor : Math.min(timeFloor, 0.3 + p.share * 0.65);
      // eased by time, not by frame, so a slow device isn't held longer
      shown += (target - shown) * (1 - Math.exp(-dt / 0.16));
      if (num.current) num.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (line.current) line.current.style.transform = `scaleX(${shown.toFixed(4)})`;
      const st = Math.min(STAGES.length - 1, Math.floor(shown * STAGES.length));
      if (st !== lastStage) {
        lastStage = st;
        setStage(st);
      }
      if ((p.done && t > minMs && shown > 0.992) || t > MAX_MS) {
        try {
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {
          /* fine: the next visit plays the full opening */
        }
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  // the scene starts as the card begins to lift
  useEffect(() => {
    if (done && !revealed.current) {
      revealed.current = true;
      onReveal();
    }
  }, [done, onReveal]);

  useEffect(() => {
    if (!lenis) return;
    if (done) {
      lenis.start();
      // pinned sections measure again now that the page scrolls (as on the main home)
      ScrollTrigger.refresh();
    } else lenis.stop();
  }, [done, lenis]);

  return (
    <AnimatePresence onExitComplete={onGone}>
      {!done && (
        <motion.div
          key="art-pre"
          role="status"
          aria-live="polite"
          aria-label="Loading"
          className="fixed inset-0 z-[80] flex flex-col justify-between overflow-hidden bg-paper p-[var(--gutter)] text-ink"
          initial={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduced ? 0.4 : 1.25, ease }}
        >
          {/* drafting grid — the drawing before the building */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #111316 1px, transparent 1px), linear-gradient(to bottom, #111316 1px, transparent 1px)",
              backgroundSize: "clamp(40px, 6vw, 96px) clamp(40px, 6vw, 96px)",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />

          <motion.div className="relative flex justify-between" exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.5, ease }}>
            <p className="eyebrow">RPC Constructions</p>
            <p className="eyebrow opacity-50">Preparing the slab</p>
          </motion.div>

          {/* the cube mark, floating and turning while the pictures load */}
          <motion.div className="pre-center relative flex flex-col items-center gap-8" exit={{ opacity: 0, scale: 0.92, y: -24 }} transition={{ duration: 0.55, ease }}>
            <div className="pre-mark-box relative grid h-44 w-44 place-items-center md:h-52 md:w-52" style={{ perspective: "900px" }}>
              <div className={reduced ? undefined : "pre-float"}>
                <div className={reduced ? undefined : "pre-turn"}>
                  <div className="pre-mark" style={{ width: "clamp(8rem, 12vw, 11rem)", height: "clamp(8rem, 12vw, 11rem)" }}>
                    <LogoMark className="h-full w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* the stage caption swaps behind a mask as the pictures load */}
            <div className="h-5 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={stage}
                  className="eyebrow text-center"
                  initial={{ y: "110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-110%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="opacity-40">0{stage + 1} — </span>
                  {STAGES[stage]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div className="relative" exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.5, ease }}>
            <div className="flex items-end justify-between">
              <span className="eyebrow opacity-50">Loading the slab</span>
              <span ref={num} className="pre-count display text-7xl tabular-nums md:text-8xl">
                000
              </span>
            </div>
            <div className="mt-4 h-px w-full bg-ink/15">
              <span ref={line} className="block h-full origin-left bg-ink" style={{ transform: "scaleX(0)" }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
