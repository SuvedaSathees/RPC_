"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";
import { mountDropStory } from "@/lib/dropstory/controller";
import { T } from "@/lib/dropstory/engine";
import { DS_CSS, overlayMarkup } from "@/lib/dropstory/overlay";
import { worldMarkup } from "@/lib/dropstory/world";

/**
 * Home hero (sample): one raindrop followed down through an RPC building —
 * terrace, bathroom, basement, sump — showing the waterproofing method used
 * at each, then the whole building with all four marked.
 */
export function DropStory() {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const lenis = useLenis();
  const svg = useMemo(() => worldMarkup(), []);
  const overlay = useMemo(() => overlayMarkup(), []);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    let progress = 0;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (s) => {
        progress = s.progress;
      },
    });
    progress = st.progress;
    const unmount = mountDropStory(section, () => progress * T);
    return () => {
      st.kill();
      unmount();
    };
  }, []);

  // links inside the injected copy: in-page anchors scroll smoothly, site links route
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-anchor],a[data-internal]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute("href")!;
      e.preventDefault();
      if (a.hasAttribute("data-anchor")) {
        if (lenis) lenis.scrollTo(href, { duration: 1.6 });
        else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      } else router.push(href);
    };
    section.addEventListener("click", onClick);
    return () => section.removeEventListener("click", onClick);
  }, [lenis, router]);

  return (
    <section ref={ref} className="ds-section" data-tone="light" aria-label="How RPC waterproofs a building">
      <style dangerouslySetInnerHTML={{ __html: DS_CSS }} />
      <div className="ds-stage">
        <svg
          className="ds-svg"
          aria-hidden="true"
          focusable="false"
          preserveAspectRatio="xMidYMid slice"
          viewBox="230 -110 960 940"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="ds-ov" dangerouslySetInnerHTML={{ __html: overlay }} />
      </div>
    </section>
  );
}
