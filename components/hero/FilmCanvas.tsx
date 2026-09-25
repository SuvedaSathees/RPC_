"use client";
import { useEffect, useRef } from "react";
import manifest from "@/public/film/manifest.json";
import { gsap } from "@/lib/gsap";
import { sceneState } from "@/lib/three/store";

type FrameSet = { count: number; width: number; height: number; path: string };

/**
 * Virtual camera over the footage, keyed to film seconds (0–10).
 * The hero footage now carries the real camera move itself (shot-by-shot
 * remake of the original 3D path), so this stays at identity. Add rows
 * [sec, zoom, panX, panY] here to layer an extra push-in or drift.
 */
const CAMERA: [number, number, number, number][] = [
  [0, 1, 0, 0],
  [10, 1, 0, 0],
];
const ease = (t: number) => t * t * (3 - 2 * t);
function cameraAt(p: number) {
  const s = p * 10;
  for (let i = 1; i < CAMERA.length; i++) {
    const b = CAMERA[i]!;
    if (s <= b[0]) {
      const a = CAMERA[i - 1]!;
      const t = ease(Math.min(1, Math.max(0, (s - a[0]) / (b[0] - a[0] || 1))));
      return { z: a[1] + (b[1] - a[1]) * t, x: a[2] + (b[2] - a[2]) * t, y: a[3] + (b[3] - a[3]) * t };
    }
  }
  return { z: 1, x: 0, y: 0 };
}

/**
 * Scroll-scrubbed frame sequence (the "Apple product page" technique).
 * Frames are real footage exported by scripts/build-film.py. Neighbouring
 * frames are cross-blended, so a thinned sequence still moves smoothly.
 *
 * `getProgress` is read every tick; drawing only happens when it changes.
 */
export function FilmCanvas({
  getProgress,
  onReady,
  getPullback,
}: {
  getProgress: () => number;
  onReady?: () => void;
  /** 0 → frame fills the screen; 1 → camera pulled back so the whole building shows */
  getPullback?: () => number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;
    const small = window.matchMedia("(max-width: 767px)").matches;
    // single-file embeds (e.g. a hosted preview) may supply frames inline
    const inline = (window as Window & { __RPC_FILM_FRAMES?: string[] }).__RPC_FILM_FRAMES;
    const base: FrameSet = small ? manifest.mobile : manifest.desktop;
    const set: FrameSet = inline ? { ...base, count: inline.length } : base;
    const imgs: (HTMLImageElement | null)[] = new Array(set.count).fill(null);
    const src = (i: number) => inline?.[i] ?? `${set.path}${String(i + 1).padStart(4, "0")}.webp`;
    let alive = true;
    let last = -1;
    let readySent = false;

    // coarse-to-fine loading: every 16th frame first, then 8th, 4th … so any
    // scroll position has a nearby frame almost immediately
    const order: number[] = [];
    const seen = new Set<number>();
    for (let step = 16; step >= 1; step /= 2)
      for (let i = 0; i < set.count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i); }
    if (!seen.has(set.count - 1)) order.push(set.count - 1);
    let cursor = 0;
    let loaded = 0;
    const loadNext = () => {
      if (!alive || cursor >= order.length) return;
      const i = order[cursor++]!;
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        imgs[i] = im;
        last = -1; // redraw with the better frame
        loaded++;
        sceneState.filmLoaded = loaded / order.length;
        if (!readySent && i === 0) { readySent = true; onReady?.(); }
        loadNext();
      };
      im.onerror = () => {
        loaded++;
        sceneState.filmLoaded = loaded / order.length;
        loadNext();
      };
      im.src = src(i);
    };
    for (let k = 0; k < 4; k++) loadNext(); // 4 parallel lanes

    const nearest = (i: number, dir: 1 | -1) => {
      for (let k = i; k >= 0 && k < set.count; k += dir) if (imgs[k]) return k;
      return -1;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = cv.getBoundingClientRect();
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      last = -1;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();

    let pull = 0;
    const drawImg = (im: HTMLImageElement, alpha: number) => {
      const cover = Math.max(cv.width / im.naturalWidth, cv.height / im.naturalHeight);
      const contain = Math.min(cv.width / im.naturalWidth, cv.height / im.naturalHeight);
      // pull back from "cover" towards a framing that shows the full building
      const target = Math.max(contain, cover * 0.66);
      const s = cover + (target - cover) * pull;
      const w = im.naturalWidth * s;
      const h = im.naturalHeight * s;
      ctx.globalAlpha = alpha;
      if (pull > 0.001 && alpha === 1) {
        // soft, dark fill for the space around the pulled-back frame
        ctx.filter = "blur(28px) brightness(0.45)";
        const cw = im.naturalWidth * cover * 1.1;
        const ch = im.naturalHeight * cover * 1.1;
        ctx.drawImage(im, (cv.width - cw) / 2, (cv.height - ch) / 2, cw, ch);
        ctx.filter = "none";
      }
      // keep the frame anchored a little low so the roofline gets headroom
      const y = (cv.height - h) / 2;
      ctx.drawImage(im, (cv.width - w) / 2, y, w, h);
    };

    const tick = () => {
      const p = Math.min(1, Math.max(0, getProgress()));
      const f = p * (set.count - 1);
      const nextPull = getPullback ? Math.min(1, Math.max(0, getPullback())) : 0;
      if (Math.abs(f - last) < 0.002 && Math.abs(nextPull - pull) < 0.002) return;
      last = f;
      pull = nextPull;
      const i = Math.floor(f);
      const a = nearest(i, -1) >= 0 ? nearest(i, -1) : nearest(i, 1);
      if (a < 0) return;
      const b = nearest(Math.min(set.count - 1, i + 1), 1);
      drawImg(imgs[a]!, 1);
      if (b > a && imgs[b]) {
        // mostly show a single, crisp frame; only blend briefly around the
        // midpoint so motion stays smooth without a double-exposed image
        const t = (f - a) / (b - a);
        const k = b - a > 1 ? t : Math.min(1, Math.max(0, (t - 0.35) / 0.3));
        if (k > 0.001) drawImg(imgs[b]!, k * k * (3 - 2 * k));
      }
      ctx.globalAlpha = 1;
    };
    gsap.ticker.add(tick);
    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      ro.disconnect();
    };
  }, [getProgress, onReady, getPullback]);

  return <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />;
}
