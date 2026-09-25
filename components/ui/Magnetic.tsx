"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

/**
 * Magnetic pull: within `radius` px the wrapped element drifts toward the
 * pointer (a third of the way), then springs back when it leaves. Applied to
 * the pill buttons so they feel like physical controls. Fine pointers only.
 */
export function Magnetic({
  children,
  className,
  radius = 56,
  strength = 0.32,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const toX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const toY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    let inside = false;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const ox = e.clientX - cx;
      const oy = e.clientY - cy;
      const within = Math.abs(ox) < r.width / 2 + radius && Math.abs(oy) < r.height / 2 + radius;
      if (within) {
        inside = true;
        toX(ox * strength);
        toY(oy * strength);
      } else if (inside) {
        inside = false;
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.45)", overwrite: "auto" });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(el);
    };
  }, [radius, strength]);

  return (
    <span ref={ref} className={cn("inline-block will-change-transform", className)}>
      {children}
    </span>
  );
}
