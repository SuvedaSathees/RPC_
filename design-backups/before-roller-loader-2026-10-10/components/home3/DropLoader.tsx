"use client";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";
import { DROP_CSS, dropLoaderMarkup, mountDropLoader } from "@/lib/loader/drop";
import type { LoadProgress } from "./ArtLoader";

/**
 * Opening screen for the home page: one roof terrace, pictured at each step of
 * its waterproofing, the pictures changing as the page loads (see
 * lib/loader/drop.ts). Same contract as the earlier loaders: `onReveal` as it
 * starts to lift, `onGone` once it has.
 */
export function DropLoader({ progress, onReveal, onGone }: { progress: RefObject<LoadProgress>; onReveal: () => void; onGone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const html = useMemo(() => dropLoaderMarkup(), []);
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);
  // the latest callbacks, without re-mounting the screen
  const cb = useRef({ onReveal, onGone });
  cb.current = { onReveal, onGone };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mountDropLoader(el, {
      getProgress: () => progress.current,
      onReveal: () => {
        setOpen(true);
        cb.current.onReveal();
      },
      onGone: () => {
        setGone(true);
        cb.current.onGone();
      },
    });
  }, [progress]);

  // the page holds still until the screen lifts
  useEffect(() => {
    if (!lenis) return;
    if (open) {
      lenis.start();
      ScrollTrigger.refresh();
    } else lenis.stop();
  }, [open, lenis]);

  if (gone) return null;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DROP_CSS }} />
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
