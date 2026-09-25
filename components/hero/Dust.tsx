"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { sceneState } from "@/lib/three/store";

interface Mote {
  x: number;
  y: number;
  r: number;
  a: number;
  vy: number;
  vx: number;
  ph: number;
  depth: number;
}

/**
 * Site dust: slow motes drifting up through the light, each on its own depth
 * so the layer parallaxes with the pointer. Cheap 2D canvas, paused offscreen.
 */
export function Dust({ count = 70, active = true }: { count?: number; active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv || !active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const motes: Mote[] = [];
    const seed = (m: Mote, fresh: boolean) => {
      m.depth = 0.35 + Math.random() * 0.65;
      m.x = Math.random() * w;
      m.y = fresh ? h + 10 : Math.random() * h;
      m.r = (0.6 + Math.random() * 1.6) * m.depth;
      m.a = (0.12 + Math.random() * 0.4) * m.depth;
      m.vy = -(6 + Math.random() * 14) * m.depth;
      m.vx = (Math.random() - 0.5) * 6;
      m.ph = Math.random() * Math.PI * 2;
    };
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = cv.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes.length = 0;
      for (let i = 0; i < count; i++) {
        const m = {} as Mote;
        seed(m, false);
        motes.push(m);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; }, { threshold: 0 });
    io.observe(cv);

    let t = 0;
    const tick = (_time: number, dtMs: number) => {
      if (!visible) return;
      const dt = Math.min(dtMs, 50) / 1000;
      t += dt;
      const px = sceneState.pointerDamped.x;
      const py = sceneState.pointerDamped.y;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff4e4";
      for (const m of motes) {
        m.y += m.vy * dt;
        m.x += (m.vx + Math.sin(t * 0.7 + m.ph) * 6) * dt;
        if (m.y < -10 || m.x < -10 || m.x > w + 10) seed(m, true);
        const ox = -px * 26 * m.depth;
        const oy = -py * 16 * m.depth;
        ctx.globalAlpha = m.a * (0.7 + 0.3 * Math.sin(t * 1.3 + m.ph));
        ctx.beginPath();
        ctx.arc(m.x + ox, m.y + oy, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
    };
  }, [count, active]);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
