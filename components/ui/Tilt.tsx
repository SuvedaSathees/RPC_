"use client";
import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Pointer-driven 3D tilt with a travelling specular sheen. The element leans
 * toward the cursor like a card lifted off a table; on leave it settles back
 * over a longer curve. Pure CSS variables — no re-renders while moving.
 */
export function Tilt({
  children,
  className,
  max = 7,
  sheen = true,
  scale = 1.015,
  style,
}: {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  max?: number;
  sheen?: boolean;
  scale?: number;
  style?: CSSProperties;
}) {
  const root = useRef<HTMLDivElement>(null);
  const enabled = useRef(false);

  useEffect(() => {
    enabled.current =
      window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = root.current;
      if (!el || !enabled.current) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--ry", `${(px - 0.5) * 2 * max}deg`);
      el.style.setProperty("--rx", `${(0.5 - py) * 2 * max}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      el.style.setProperty("--tz", "1");
      el.style.setProperty("--ts", String(scale));
      el.classList.add("is-tilting");
    },
    [max, scale],
  );

  const onLeave = useCallback(() => {
    const el = root.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--tz", "0");
    el.style.setProperty("--ts", "1");
    el.classList.remove("is-tilting");
  }, []);

  return (
    <div
      ref={root}
      className={cn("tilt", className)}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onPointerCancel={onLeave}
    >
      <div className="tilt-inner">
        {children}
        {sheen && <span aria-hidden className="tilt-sheen" />}
      </div>
    </div>
  );
}
