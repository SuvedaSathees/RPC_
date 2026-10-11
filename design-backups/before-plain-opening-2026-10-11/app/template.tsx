"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { visit } from "@/lib/visit";

/**
 * pages that open with their own loading screen, so the water would only get in its way
 * (the home page's plays on arrival and after a refresh; coming back to it, the water is used)
 */
const OWN_INTRO = new Set(["/"]);

/** how long the sheet of water takes to run off the screen, and its curve: a slow start, then it gathers speed (keep in step with globals.css) */
const DUR = 0.8;
const EASE: readonly [number, number, number, number] = [0.4, 0, 0.6, 0.7];
/** the band at the top of the sheet that holds its uneven edge, in px */
const BAND = 44;
/** the edge is drawn in pixels across a width wider than any screen, so its ripples keep their size on a phone and on a wide monitor */
const SPAN = 4000;

/** a fixed sequence of random numbers, so the server and the browser draw the same water */
function random(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** the waterline: smooth and uneven, never repeating across the screen */
const EDGE = (() => {
  const rnd = random(11);
  const ph = [rnd(), rnd(), rnd(), rnd()].map((v) => v * Math.PI * 2);
  const pts: [number, number][] = [];
  for (let x = 0; x <= SPAN; x += 20) {
    const y =
      22 +
      7 * Math.sin((x / 900) * Math.PI * 2 + ph[0]!) +
      4.5 * Math.sin((x / 380) * Math.PI * 2 + ph[1]!) +
      2.4 * Math.sin((x / 170) * Math.PI * 2 + ph[2]!) +
      1.2 * Math.sin((x / 80) * Math.PI * 2 + ph[3]!);
    pts.push([x, Math.round(y * 10) / 10]);
  }
  return {
    clip: `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(", ")}, ${SPAN}px 100%, 0px 100%)`,
    line: pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" "),
    shade: pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${Math.round((y + 2.6) * 10) / 10}`).join(" "),
  };
})();

/** when the sheet's edge has run a share p of the way down (the curve above, solved for time) */
function timeAt(p: number) {
  const [p1x, p1y, p2x, p2y] = EASE;
  const cx = 3 * p1x, bx = 3 * (p2x - p1x) - cx, ax = 1 - cx - bx;
  const cy = 3 * p1y, by = 3 * (p2y - p1y) - cy, ay = 1 - cy - by;
  const X = (t: number) => ((ax * t + bx) * t + cx) * t;
  const Y = (t: number) => ((ay * t + by) * t + cy) * t;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (Y(m) < p) lo = m;
    else hi = m;
  }
  return X((lo + hi) / 2);
}

/** beads left on the coated surface as the water runs off: across (%), down (%), size (px), when the edge passes them (s) and how far they slide (px) */
const BEADS = (() => {
  const rnd = random(23);
  const H = 860; // a typical screen height, for when the edge reaches each bead
  return Array.from({ length: 44 }, () => {
    const x = 2 + rnd() * 96;
    const y = 7 + rnd() * 90;
    const r = rnd();
    const s = Math.round(r < 0.6 ? 4 + rnd() * 5 : r < 0.9 ? 8 + rnd() * 8 : 15 + rnd() * 9);
    const at = DUR * timeAt(Math.min(1, ((y / 100) * H + BAND / 2) / (H + BAND))) + 0.02;
    return { x: x.toFixed(1), y: y.toFixed(1), s, at: at.toFixed(3), run: Math.round(4 + s * 0.9) };
  });
})();

/**
 * Moving between pages: the new page opens behind a clear sheet of water,
 * as if just rinsed, and the water runs off down the screen like water off a
 * waterproof coat: its uneven edge catches the light, the page shows sharp
 * above it and softened through it, and a few beads are left behind that
 * slide and dry away. The navigation bar stays above it. It is all style-sheet
 * animation (the lq- keyframes in globals.css), so it starts on the first
 * frame even while the new page is still busy loading, and nothing on the page
 * itself is moved, so position: fixed and sticky below keep working. With
 * reduced motion it is not shown.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // decided once per arrival, so the page is never re-wrapped (and remounted) while it is open
  const [own] = useState(() => !!pathname && OWN_INTRO.has(pathname) && !visit.homeShown);
  const [dry, setDry] = useState(false);
  if (own) return <>{children}</>;
  return (
    <>
      {!dry && (
        <div
          aria-hidden
          className="lq motion-reduce:hidden"
          onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) setDry(true);
          }}
        >
          <div className="lq-sheet" style={{ top: -BAND, height: `calc(100% + ${BAND}px)`, animation: `lq-drain ${DUR}s cubic-bezier(${EASE.join(", ")}) both` }}>
            <div className="lq-film" style={{ clipPath: EDGE.clip }} />
            <svg className="lq-rim" width={SPAN} height={BAND} viewBox={`0 0 ${SPAN} ${BAND}`}>
              <path d={EDGE.shade} fill="none" stroke="rgba(18,34,59,0.16)" strokeWidth={3} />
              <path d={EDGE.line} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.4} />
            </svg>
          </div>
          {BEADS.map((b, i) => (
            <span
              key={i}
              className="lq-bead"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: Math.round(b.s * 1.06), animationDelay: `${b.at}s`, "--run": `${b.run}px` } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      {children}
    </>
  );
}
