"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { sceneState } from "@/lib/three/store";
import { cn } from "@/lib/utils/cn";

/**
 * Endless strip of disciplines. It runs on its own, speeds up with the
 * scroll and reverses when the visitor scrolls back — the page feels like
 * one continuous mechanism rather than a stack of static bands.
 */
export function Marquee({ items, className, speed = 60 }: { items: string[]; className?: string; speed?: number }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let boost = 0;
    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(dtMs, 50) / 1000;
      boost += (sceneState.scrollVelocity * 0.9 - boost) * 0.08;
      x -= (speed + boost) * dt;
      const half = el.scrollWidth / 2;
      if (half > 0) {
        if (x <= -half) x += half;
        if (x > 0) x -= half;
      }
      el.style.transform = `translate3d(${x}px, 0, 0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [speed]);

  const row = [...items, ...items];
  return (
    <div className={cn("relative overflow-hidden whitespace-nowrap border-y border-ink/10 py-5 md:py-6", className)} aria-hidden>
      <div ref={track} className="inline-flex will-change-transform">
        {row.map((it, i) => (
          <span key={i} className="display inline-flex items-center gap-8 pr-8 text-4xl leading-none text-ink/85 md:text-5xl">
            {it}
            <span className="h-2 w-2 rounded-full bg-rpc" />
          </span>
        ))}
      </div>
    </div>
  );
}
