"use client";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";
import { DROP_CSS, dropLoaderMarkup, mountDropLoader } from "@/lib/loader/drop";
import type { LoadProgress } from "./ArtLoader";

/**
 * Opening screen for the home page: bare concrete, and a roller laying a
 * waterproof coat over it in a few passes that uncover the page (see
 * lib/loader/drop.ts). `onStart` as the first pass starts (the page underneath
 * can begin), `onReveal` as the last one starts, `onGone` once the screen has
 * gone; the page holds still until then.
 */
export function DropLoader({
  progress,
  onStart,
  onReveal,
  onGone,
}: {
  progress: RefObject<LoadProgress>;
  onStart?: () => void;
  onReveal: () => void;
  onGone: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const html = useMemo(() => dropLoaderMarkup(), []);
  const [gone, setGone] = useState(false);
  // the latest callbacks, without re-mounting the screen
  const cb = useRef({ onStart, onReveal, onGone });
  cb.current = { onStart, onReveal, onGone };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mountDropLoader(el, {
      getProgress: () => progress.current,
      onStart: () => cb.current.onStart?.(),
      onReveal: () => cb.current.onReveal(),
      onGone: () => {
        setGone(true);
        cb.current.onGone();
      },
    });
  }, [progress]);

  // the page holds still until the screen has gone
  useEffect(() => {
    if (!lenis) return;
    if (gone) {
      lenis.start();
      ScrollTrigger.refresh();
    } else lenis.stop();
  }, [gone, lenis]);

  if (gone) return null;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DROP_CSS }} />
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
