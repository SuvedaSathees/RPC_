"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { visit } from "@/lib/visit";

/**
 * pages that open with their own loading screen, so the liquid would only get in its way
 * (the home page's plays on arrival and after a refresh; coming back to it, the liquid is used)
 */
const OWN_INTRO = new Set(["/"]);

/** how tall the liquid's moving surface is, in px; half of it shows at the top of the screen as the page opens */
const WAVE = 56;
/** the surface: swells across twice the screen's width, so sliding it by half its width loops without a seam */
const SURFACE = "M0 28 Q180 6 360 28 T720 28 T1080 28 T1440 28 T1800 28 T2160 28 T2520 28 T2880 28";
/** water-blue at the surface, deepening to the site's dark blue */
const DEPTH = "linear-gradient(180deg, rgba(76,201,217,0.97) 0, rgba(11,110,128,0.98) 34%, rgba(11,35,80,0.99) 100%)";

/** bubbles rising through it: across (%), down (vh), size (px) and when each sets off (s); fixed, so the server and the browser agree */
const BUBBLES = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  return Array.from({ length: 30 }, () => ({
    x: Math.round(2 + rnd() * 96),
    y: Math.round(8 + rnd() * 86),
    r: Math.round(5 + rnd() * rnd() * 20),
    d: Math.round(rnd() * 28) / 100,
  }));
})();

/** the surface, one swell set sliding across; `reverse` slides the other way */
function Surface({ fill, crest, reverse, top = 0 }: { fill: string; crest?: string; reverse?: boolean; top?: number }) {
  return (
    <svg
      viewBox="0 0 2880 56"
      preserveAspectRatio="none"
      className="absolute left-0 w-[200%]"
      style={{ top, height: WAVE, animation: reverse ? "lq-slide-back 1.6s linear infinite" : "lq-slide 1.2s linear infinite" }}
    >
      <path d={`${SURFACE} V56 H0Z`} fill={fill} />
      {crest && <path d={SURFACE} fill="none" stroke={crest} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}

/**
 * Moving between pages: the new page opens under a liquid, water-blue at its
 * surface and dark blue below, and the liquid drains away down the screen with
 * its surface rolling and bubbles rising through it, so the page appears from
 * the top. It is all style-sheet animation (keyframes in globals.css), so it
 * starts on the first frame even while the new page is still busy loading.
 * Only opacity is animated on the page itself, and only on the way in: a
 * transform here would break position: fixed / sticky and ScrollTrigger
 * pinning below it. With reduced motion the liquid is not shown.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // decided once per arrival, so the page is never re-wrapped (and remounted) while it is open
  const [own] = useState(() => !!pathname && OWN_INTRO.has(pathname) && !visit.homeShown);
  const [drained, setDrained] = useState(false);
  if (own) return <>{children}</>;
  return (
    <>
      {!drained && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden motion-reduce:hidden">
          <div
            className="absolute inset-x-0 will-change-transform"
            style={{ top: -WAVE / 2, height: `calc(100% + ${WAVE / 2}px)`, animation: "lq-drain 0.9s cubic-bezier(0.3, 0.1, 0.3, 1) both" }}
            onAnimationEnd={(e: React.AnimationEvent<HTMLDivElement>) => {
              if (e.target === e.currentTarget) setDrained(true);
            }}
          >
            <Surface fill="rgba(76,201,217,0.38)" reverse top={-7} />
            <Surface fill="rgba(76,201,217,0.97)" crest="rgba(255,255,255,0.85)" />
            <div className="absolute inset-x-0 bottom-0" style={{ top: WAVE - 1, background: DEPTH }}>
              {BUBBLES.map((b, i) => (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={
                    {
                      left: `${b.x}%`,
                      top: `${b.y}vh`,
                      width: b.r,
                      height: b.r,
                      border: "1.5px solid rgba(255,255,255,0.55)",
                      background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), rgba(255,255,255,0.08) 45%, rgba(255,255,255,0) 70%)",
                      "--rise": `${-50 - b.r * 9}px`,
                      animation: `lq-rise 0.8s ease-out ${b.d}s both`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ animation: "page-in 0.7s ease 0.15s backwards" }}>{children}</div>
    </>
  );
}
