"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Masked line reveal. Each direct child line slides up from behind a mask as
 * it enters the viewport. Reliable native IntersectionObserver ensures lines
 * never get stuck hidden behind pinned section layout shifts.
 */
export function RevealLines({
  lines,
  as: Tag = "div",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.08,
}: {
  lines: ReactNode[];
  as?: "div" | "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    // Check if already in or near viewport on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 100px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const T = Tag as "div";
  return (
    <T ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span
            data-line
            className={cn("block will-change-transform transition-transform duration-1000 ease-[var(--ease-film)]", lineClassName)}
            style={{
              transform: revealed ? "translate3d(0, 0, 0)" : "translate3d(0, 105%, 0)",
              transitionDelay: `${delay + i * stagger}s`,
            }}
          >
            {l}
          </span>
        </span>
      ))}
    </T>
  );
}

/** Simple fade/rise for blocks of UI copy. */
export function Reveal({ children, className, delay = 0, y = 20 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 80) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 80px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("transition-all duration-900 ease-[var(--ease-film)]", className)}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "none" : `translate3d(0, ${y}px, 0)`,
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
