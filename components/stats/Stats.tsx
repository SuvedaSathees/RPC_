"use client";

import { useEffect, useRef, useState } from "react";
import { SectionMarker } from "@/components/ui/Primitives";
import { stats } from "@/lib/content";

const NOTES = ["Built & waterproofed", "Building across Tamil Nadu", "Families & businesses served", "Towns and cities"];

/**
 * Performance record — a compact band (about 40% of the viewport) with the
 * four headline figures counting up as it enters.
 */
export function Stats({ index = "06" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  const [k, setK] = useState(1);

  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setK(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / 1800);
          setK(1 - Math.pow(1 - p, 3));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={root}
      aria-label="Performance record"
      className="relative z-10 flex items-center overflow-hidden bg-night py-12 text-paper md:min-h-[40svh] md:py-16"
    >
      <div aria-hidden className="pointer-events-none absolute -right-40 top-1/2 h-[28rem] w-[40rem] -translate-y-1/2 rounded-full bg-rpc/15 blur-[120px]" />
      <div className="gutter relative grid w-full gap-6 md:gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-4">
          <SectionMarker index={index} label="Performance record" className="text-paper/70" />
          <h2 className="display mt-4 text-[2.3rem] leading-[1] md:mt-5 md:text-5xl">
            Built on scale. <em className="text-paper/80">Proven by longevity.</em>
          </h2>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 md:rounded-sm lg:col-span-8 lg:grid-cols-4">
          {stats.map((s, i) => {
            const v = typeof s.value === "number" ? Math.round(s.value * k) : s.value;
            return (
              <div key={s.label} className="flex flex-col bg-night px-5 py-6 md:px-7 md:py-7">
                <dt className="eyebrow order-2 mt-3 text-paper/90 md:mt-4">{s.label}</dt>
                <dd className="order-1 display text-5xl leading-none tabular-nums md:text-7xl">
                  {v}
                  <span className="text-[0.55em] text-rpc">{s.suffix}</span>
                </dd>
                <dd className="order-3 mt-1 text-[11.5px] leading-snug text-paper/50 md:mt-1.5 md:text-xs">{NOTES[i]}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
