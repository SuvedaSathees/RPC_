"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/navigation/Logo";
import { useQualityContext } from "@/components/providers/QualityProvider";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/three/store";

const ease = [0.76, 0, 0.24, 1] as const;

/** The film's chapters, read out while the frames decode. */
const STAGES = [
  "Surveying the site",
  "Drawing the blueprint",
  "Pouring foundations",
  "Raising the structure",
  "Closing the envelope",
  "Ready for handover",
];

/** Frames needed before scrolling feels continuous (coarse pass = every 4th frame). */
const FRAMES_NEEDED = 0.3;
const MIN_MS = 1700;
const MAX_MS = 12000;

/**
 * Opening card. The counter is honest: it tracks the hero film actually
 * decoding (`sceneState.filmLoaded`) and never runs ahead of it, while a
 * time floor keeps it moving on fast connections so the card reads as a
 * deliberate beat rather than a stall.
 */
export function Preloader() {
  const quality = useQualityContext();
  const lenis = useLenis();
  const [done, setDone] = useState(false);
  const [stage, setStage] = useState(0);
  const num = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (quality === null) return;
    if (quality === "static") {
      setDone(true);
      return;
    }
    const start = performance.now();
    let raf = 0;
    let shown = 0;
    let lastStage = -1;
    const loop = () => {
      const t = performance.now() - start;
      const timeFloor = Math.min(1, t / MIN_MS);
      const real = Math.min(1, sceneState.filmLoaded / FRAMES_NEEDED);
      const ready = sceneState.ready && real >= 1;
      // never ahead of time, never ahead of the real decode beyond the first third
      const target = ready ? timeFloor : Math.min(timeFloor, 0.34 + real * 0.6);
      shown += (target - shown) * 0.1;
      if (num.current) num.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      if (line.current) line.current.style.transform = `scaleX(${shown})`;
      if (ring.current) ring.current.style.strokeDashoffset = String(283 * (1 - shown));
      const st = Math.min(STAGES.length - 1, Math.floor(shown * STAGES.length));
      if (st !== lastStage) {
        lastStage = st;
        setStage(st);
      }
      if ((ready && t > MIN_MS && shown > 0.992) || t > MAX_MS) {
        setDone(true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [quality]);

  useEffect(() => {
    if (!lenis) return;
    if (done) {
      lenis.start();
      ScrollTrigger.refresh();
    } else {
      window.scrollTo(0, 0);
      lenis.stop();
    }
  }, [done, lenis]);

  if (quality === "static") return null;
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="pre"
          role="status"
          aria-live="polite"
          aria-label="Loading"
          className="fixed inset-0 z-[80] flex flex-col justify-between overflow-hidden bg-paper p-[var(--gutter)] text-ink"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.25, ease }}
        >
          {/* drafting grid — the blueprint before the building */}
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

          <motion.div
            className="relative flex justify-between"
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.5, ease }}
          >
            <p className="eyebrow">RPC Constructions</p>
            <p className="eyebrow opacity-50">Preparing site</p>
          </motion.div>

          {/* the cube mark, floating and turning while the film loads */}
          <motion.div
            className="relative flex flex-col items-center gap-8"
            exit={{ opacity: 0, scale: 0.92, y: -24 }}
            transition={{ duration: 0.55, ease }}
          >
            <div className="relative grid h-44 w-44 place-items-center md:h-52 md:w-52" style={{ perspective: "900px" }}>
              <div className="pre-float">
                <div className="pre-turn">
                  <LogoMark className="h-32 w-32 md:h-40 md:w-40" />
                </div>
              </div>
            </div>

            {/* chapter caption swaps behind a mask as the film decodes */}
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
              <span className="eyebrow opacity-50">Loading the film</span>
              <span ref={num} className="display text-7xl tabular-nums md:text-8xl">
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
