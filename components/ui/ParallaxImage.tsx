"use client";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

const useIso = typeof window !== "undefined" ? useLayoutEffect : () => {};

/** Image that drifts inside its frame while scrolling — depth, not decoration. */
export function ParallaxImage({
  src,
  alt,
  className,
  sizes = "100vw",
  amount = 12,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  amount?: number;
  priority?: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLDivElement>(null);
  useIso(() => {
    if (!wrap.current || !img.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 767px)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        img.current,
        { yPercent: -amount / 2 },
        { yPercent: amount / 2, ease: "none", scrollTrigger: { trigger: wrap.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
    return () => ctx.revert();
  }, [amount]);
  return (
    <div ref={wrap} className={cn("relative overflow-hidden", className)}>
      <div ref={img} className="absolute inset-x-0 will-change-transform" style={{ top: `-${amount / 2 + 1}%`, bottom: `-${amount / 2 + 1}%` }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    </div>
  );
}
