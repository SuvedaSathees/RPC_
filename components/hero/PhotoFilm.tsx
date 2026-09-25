"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { STAGE_PLATES, plateSrc } from "@/lib/stages";
import { sceneState } from "@/lib/three/store";
import { range, smooth, window4 } from "@/lib/utils/math";

/**
 * Photographic film for the hero — replaces the 3D render as the visual layer.
 *
 * Twelve photographs of one project (lib/stages.ts) are stacked and driven by
 * the same damped hero progress that used to drive the 3D camera, so every
 * caption, the rail, the build meter and the reveal keep their timing. Each
 * plate gets a slow camera move, the incoming plate pulls focus as it
 * dissolves in, the blueprint is drawn over the open plot, and the light
 * warms into golden hour for the handover.
 */
const XF = 0.022; // half-width of each cross-dissolve, in hero progress

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.6'/></svg>\")";

// plan drawn over the plot during the Blueprint chapter (1600×900 sheet)
const COLS = [520, 660, 800, 940, 1080];
const ROWS = [260, 450, 640];

export function PhotoFilm() {
  const plates = useRef<(HTMLImageElement | null)[]>([]);
  const bp = useRef<HTMLDivElement>(null);
  const plan = useRef<SVGSVGElement>(null);
  const warm = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // the WebGL canvas is not needed while the hero is on screen
    window.dispatchEvent(new Event("rpc:scene-visibility"));
    const lines = plan.current ? Array.from(plan.current.querySelectorAll<SVGGeometryElement>("[data-draw]")) : [];
    const ghosts = plan.current ? Array.from(plan.current.querySelectorAll<SVGElement>("[data-ghost]")) : [];

    const tick = () => {
      const p = sceneState.display.hero;
      const px = sceneState.pointerDamped.x;
      const py = sceneState.pointerDamped.y;
      const tod = smooth(range(p, 0.8, 0.97));

      STAGE_PLATES.forEach((s, i) => {
        const img = plates.current[i];
        if (!img) return;
        const [a, b] = s.at;
        const o = i === 0 ? 1 : smooth(range(p, a - XF, a + XF));
        const next = STAGE_PLATES[i + 1];
        const covered = next ? p > next.at[0] + XF : false; // fully hidden under the next plate
        const show = o > 0.001 && !covered;
        img.style.visibility = show ? "visible" : "hidden";
        if (!show) return;
        const t = smooth(range(p, a - XF, b + XF));
        const [s0, x0, y0] = s.move.from;
        const [s1, x1, y1] = s.move.to;
        const sc = s0 + (s1 - s0) * t;
        const x = x0 + (x1 - x0) * t - px * 0.6;
        const y = y0 + (y1 - y0) * t - py * 0.4;
        img.style.opacity = String(o);
        img.style.transform = `translate3d(${x}%, ${y}%, 0) scale(${sc})`;
        // focus pull on the way in; golden hour on the finished building
        const blur = o < 1 ? (1 - o) * 5 : 0;
        const grade = i === STAGE_PLATES.length - 1 ? ` sepia(${0.22 * tod}) saturate(${1 + 0.12 * tod}) brightness(${1 - 0.16 * tod})` : "";
        img.style.filter = blur > 0.05 || grade ? `blur(${blur.toFixed(2)}px)${grade}` : "none";
      });

      // blueprint: the plan is drawn over the real plot
      const blue = smooth(window4(p, 0.1, 0.165, 0.27, 0.335));
      if (bp.current) {
        bp.current.style.opacity = String(blue);
        bp.current.style.visibility = blue > 0.001 ? "visible" : "hidden";
      }
      const draw = range(p, 0.11, 0.215);
      lines.forEach((l, i) => (l.style.strokeDashoffset = String(1 - range(draw, i * 0.02, 0.5 + i * 0.02))));
      const ghost = range(p, 0.17, 0.27);
      ghosts.forEach((g) => (g.style.opacity = String(ghost)));
      if (warm.current) warm.current.style.opacity = String(tod);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const onFirst = () => {
    if (sceneState.ready) return;
    sceneState.ready = true;
    window.dispatchEvent(new Event("rpc:ready"));
  };

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#2b2620]">
      {STAGE_PLATES.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- plates are swapped as plain files; transforms run every frame
        <img
          key={s.file}
          ref={(n) => { plates.current[i] = n; }}
          src={plateSrc(s.file)}
          alt=""
          decoding="async"
          fetchPriority={i === 0 ? "high" : i < 3 ? "auto" : "low"}
          onLoad={i === 0 ? onFirst : undefined}
          onError={i === 0 ? onFirst : undefined}
          className="absolute inset-0 h-full w-full origin-center object-cover will-change-transform"
          style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
        />
      ))}

      {/* blueprint over the plot */}
      <div ref={bp} className="absolute inset-0" style={{ opacity: 0, visibility: "hidden" }}>
        <div className="absolute inset-0 bg-[#0b2350] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[#0b2350]/30" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <svg ref={plan} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" fill="none" stroke="#e8eefc" strokeWidth="1.4">
          {/* footprint + cores */}
          <rect data-draw pathLength={1} strokeDasharray="1" x="500" y="240" width="600" height="420" strokeWidth="2.4" />
          <path data-draw pathLength={1} strokeDasharray="1" d="M500 450 H1100 M800 240 V660 M660 240 V450 M940 450 V660" />
          <rect data-draw pathLength={1} strokeDasharray="1" x="760" y="400" width="80" height="100" />
          {/* dimension lines */}
          <path data-draw pathLength={1} strokeDasharray="1" d="M500 700 H1100 M500 690 V710 M1100 690 V710 M1140 240 V660 M1130 240 H1150 M1130 660 H1150" strokeOpacity="0.7" />
          {/* column grid */}
          <g data-ghost style={{ opacity: 0 }} strokeOpacity="0.55" strokeDasharray="6 8">
            {COLS.map((x) => <line key={x} x1={x} y1={190} x2={x} y2={660} />)}
            {ROWS.map((y) => <line key={y} x1={450} y1={y} x2={1100} y2={y} />)}
          </g>
          <g data-ghost style={{ opacity: 0 }} fontFamily="var(--font-mono)" fontSize="12" fill="#e8eefc" stroke="none" textAnchor="middle">
            {COLS.map((x, i) => (
              <g key={x}>
                <circle cx={x} cy={172} r={14} fill="none" stroke="#e8eefc" />
                <text x={x} y={176}>{i + 1}</text>
              </g>
            ))}
            {ROWS.map((y, i) => (
              <g key={y}>
                <circle cx={432} cy={y} r={14} fill="none" stroke="#e8eefc" />
                <text x={432} y={y + 4}>{"ABC"[i]}</text>
              </g>
            ))}
            {COLS.flatMap((x) => ROWS.map((y) => <rect key={`${x}-${y}`} x={x - 7} y={y - 7} width={14} height={14} fill="#e8eefc" />))}
            <text x={800} y={728} letterSpacing="3">24.00 M</text>
            <text x={1172} y={454} letterSpacing="3" transform="rotate(90 1172 454)">16.80 M</text>
          </g>
        </svg>
      </div>

      {/* golden hour over the finished building */}
      <div ref={warm} className="absolute inset-0 bg-gradient-to-b from-[#f2a45c]/45 via-[#c06a3a]/15 to-[#1b1410]/55 mix-blend-soft-light" style={{ opacity: 0 }} />

      {/* lens: vignette + fine grain */}
      <div className="absolute inset-0 shadow-[inset_0_0_24vmin_rgba(0,0,0,0.45)]" />
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
    </div>
  );
}
