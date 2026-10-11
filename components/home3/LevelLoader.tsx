"use client";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";
import { LEVEL_CSS, levelLoaderMarkup, mountLevelLoader } from "@/lib/loader/level";
import type { LoadProgress } from "./ArtLoader";

/**
 * Opening screen for the home page: RPC drawn in outline and filled floor by
 * floor as the hero's pictures load, a laser level climbing with the pour,
 * then a waterproof sheen and the screen parting onto the page. Same contract
 * as ArtLoader: `onReveal` as it starts to open, `onGone` once it has.
 */
export function LevelLoader({ progress, onReveal, onGone }: { progress: RefObject<LoadProgress>; onReveal: () => void; onGone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const html = useMemo(() => levelLoaderMarkup(), []);
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);
  // the latest callbacks, without re-mounting the screen
  const cb = useRef({ onReveal, onGone });
  cb.current = { onReveal, onGone };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mountLevelLoader(el, {
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

  // the page holds still until the screen opens
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
      <style dangerouslySetInnerHTML={{ __html: LEVEL_CSS }} />
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
