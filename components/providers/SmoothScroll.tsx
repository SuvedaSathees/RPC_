"use client";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneState, tickScene } from "@/lib/three/store";

const LenisCtx = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisCtx);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = (_t: number, dtMs: number) => tickScene(dtMs / 1000);
    gsap.ticker.add(tick);
    // one pointer feed for every parallax layer on the page (hero film, dust, finale)
    const onMove = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (window.matchMedia("(pointer: fine)").matches && !reduced) window.addEventListener("pointermove", onMove, { passive: true });
    // late layout shifts (webfonts, images) → re-measure every trigger once
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });
    if (reduced) {
      return () => {
        gsap.ticker.remove(tick);
        window.removeEventListener("pointermove", onMove);
      };
    }

    const l = new Lenis({ duration: 1.35, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    l.on("scroll", (inst: Lenis) => {
      ScrollTrigger.update();
      sceneState.scrollVelocity = inst.velocity;
    });
    const raf = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      l.destroy();
      setLenis(null);
    };
  }, []);

  // reset scroll on route change (not on first load, which may carry a hash)
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const hash = window.location.hash;
    if (hash && lenis) {
      requestAnimationFrame(() => lenis.scrollTo(hash, { immediate: true }));
    } else {
      lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname, lenis]);

  return <LenisCtx.Provider value={lenis}>{children}</LenisCtx.Provider>;
}
