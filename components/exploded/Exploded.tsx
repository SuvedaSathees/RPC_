"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { SectionMarker } from "@/components/ui/Primitives";
import { anatomy } from "@/lib/content";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const useIso = typeof window !== "undefined" ? useLayoutEffect : () => {};

/**
 * Anatomy of a building, told in photographs of the same building from the
 * same camera: finished → walls and envelope → bare frame → foundations. Scrolling
 * peels one layer away at a time; the six-system list follows the reveal
 * (roof and envelope first, the ground last).
 */
const PLATES = [
  { src: "/images/anatomy-complete.jpg", alt: "The finished building: roof, glazing, walls and landscape", caption: "Assembled" },
  { src: "/images/anatomy-cutaway.jpg", alt: "The building with its brick walls going up inside the concrete frame, before plaster and glazing", caption: "Envelope" },
  { src: "/images/anatomy-frame.jpg", alt: "Reinforced concrete frame of the building under construction", caption: "Structure" },
  { src: "/images/anatomy-foundation.jpg", alt: "Foundation footings and reinforcement in the excavated plot", caption: "Foundation" },
];

// which list item is "live" for each plate (anatomy order: roof, windows, walls, interior, structure, foundation)
const LIVE: number[][] = [[0, 1, 2], [3], [4], [5]];

export function Exploded({ index = "03" }: { index?: string } = {}) {
  const root = useRef<HTMLElement>(null);

  useIso(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const plates = gsap.utils.toArray<HTMLElement>("[data-plate]");
      const items = gsap.utils.toArray<HTMLElement>("[data-sys]");
      const caption = el.querySelector<HTMLElement>("[data-caption]");
      const bar = el.querySelector<HTMLElement>("[data-bar]");
      const setStage = (s: number) => {
        items.forEach((li, i) => {
          const done = LIVE.slice(0, s + 1).flat().includes(i);
          const now = LIVE[s]!.includes(i);
          li.toggleAttribute("data-active", now);
          li.toggleAttribute("data-done", done && !now);
        });
        if (caption) caption.textContent = `${String(s + 1).padStart(2, "0")} / 04 · ${PLATES[s]!.caption}`;
      };
      setStage(0);
      if (reduced) {
        gsap.set(plates.slice(1), { autoAlpha: 0 });
        return;
      }
      gsap.set(plates.slice(1), { clipPath: "inset(0 0 100% 0)" });
      if (window.matchMedia("(max-width: 767px)").matches) {
        // phones: no pinned, scroll-driven peel — one screen, layers play on a loop
        el.style.height = "auto";
        const pin = el.firstElementChild as HTMLElement | null;
        if (pin) pin.style.position = "relative";
        const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true, defaults: { ease: "power2.inOut" } });
        loop.call(() => setStage(0), [], 0);
        plates.slice(1).forEach((plate, i) => {
          const at = 1.6 + i * 2.2;
          loop.call(() => setStage(i + 1), [], at);
          loop.to(plate, { clipPath: "inset(0 0 0% 0)", duration: 0.9 }, at);
        });
        loop.to(plates.slice(1), { clipPath: "inset(0 0 100% 0)", duration: 0.01 }, "+=2");
        if (bar) bar.style.transform = "scaleY(1)";
        ScrollTrigger.create({ trigger: el, start: "top 80%", end: "bottom 20%", onToggle: (st) => (st.isActive ? loop.play() : loop.pause()) });
        return;
      }
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          onUpdate: (st) => {
            setStage(Math.min(3, Math.floor(st.progress * 3.999 + 0.08)));
            if (bar) bar.style.transform = `scaleY(${st.progress})`;
          },
        },
      });
      plates.slice(1).forEach((plate, i) => {
        const at = 0.35 + i;
        const img = plate.querySelector("img");
        // each layer is uncovered top-down, like a section being cut through the building
        tl.to(plate, { clipPath: "inset(0 0 0% 0)", duration: 0.7 }, at);
        if (img) tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1, ease: "power2.out" }, at);
      });
      tl.to({}, { duration: 0.35 });
      // slow push-in over the whole sequence
      tl.fromTo("[data-stage]", { scale: 1 }, { scale: 1.05, duration: tl.duration() }, 0);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="anatomy" aria-label="Anatomy of a building" className="relative z-10 h-[220vh] bg-night text-paper">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -left-40 top-1/3 h-[30rem] w-[36rem] rounded-full bg-rpc/15 blur-[130px]" />
        <div className="gutter relative flex h-full flex-col gap-5 pb-6 pt-24 md:grid md:grid-cols-12 md:gap-10 md:pb-14 md:pt-32">
          {/* Copy + systems list */}
          <div className="flex shrink-0 flex-col justify-between md:col-span-4">
            <div>
              <SectionMarker index={index} label="Anatomy" className="text-paper/70" />
              <h2 className="display mt-4 text-4xl leading-[0.95] md:mt-6 md:text-6xl lg:text-[4.4vw]">
                Six systems.
                <br />
                <em className="text-paper/80">One building.</em>
              </h2>
              <p className="mt-5 hidden max-w-sm text-sm leading-relaxed text-paper/65 md:block md:text-[15px]">
                Scroll to take a finished RPC building apart — layer by layer, down to the footings that carry it.
              </p>
            </div>
            <ol className="mt-4 flex flex-wrap gap-1.5 md:mt-6 md:block md:max-w-sm md:space-y-1">
              {anatomy.map((a, i) => (
                <li
                  key={a.key}
                  data-sys
                  className="group relative flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1 text-paper/40 md:gap-4 md:rounded-sm md:border-0 md:px-3 md:py-2.5 transition-all duration-500 data-[active]:bg-white/[0.07] data-[active]:text-paper data-[done]:text-paper/70"
                >
                  <span className="absolute inset-y-2 left-0 hidden w-0.5 scale-y-0 md:block bg-rpc transition-transform duration-500 group-data-[active]:scale-y-100" />
                  <span className="font-mono text-[10px] md:text-[11px]">0{i + 1}</span>
                  <span className="flex flex-col">
                    <span className="text-[13px] font-medium md:text-[15px]">{a.label}</span>
                    <span className="hidden text-[11px] text-paper/50 group-data-[active]:text-paper/70 md:inline">{a.note}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Plates */}
          <div className="relative min-h-0 flex-1 md:col-span-8">
            <div className="relative h-full overflow-hidden rounded-sm border border-white/10 bg-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
              <div data-stage className="absolute inset-0 origin-center will-change-transform">
                {PLATES.map((p, i) => (
                  <div key={p.src} data-plate className="absolute inset-0" style={{ zIndex: i }}>
                    <Image
                      src={p.src}
                      alt={p.alt}
                      fill
                      sizes="(min-width: 768px) 66vw, 92vw"
                      className="object-cover"
                      loading={i === 0 ? undefined : "eager"}
                    />
                  </div>
                ))}
              </div>
              <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-black/70 to-transparent" />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/45 to-transparent" />
              <span className="eyebrow absolute left-4 top-4 z-20 !text-[9px] md:left-5 md:top-5 md:!text-[10.5px] rounded-full bg-black/40 px-3 py-1.5 text-paper/85 backdrop-blur-md">
                Section through an RPC building
              </span>
              <p data-caption className="display absolute bottom-4 left-4 z-20 text-2xl text-white md:bottom-7 md:left-7 md:text-5xl">
                01 / 04 · Assembled
              </p>
              {/* scroll progress, like a section line being drawn down the sheet */}
              <div aria-hidden className="absolute inset-y-5 right-5 z-20 w-px bg-white/25 md:right-7">
                <div data-bar className="h-full w-full origin-top scale-y-0 bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
