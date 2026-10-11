"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";
import { mountArt, type ArtControls } from "@/lib/artwp/controller";
import { FILM_MQ, STEPS, T } from "@/lib/artwp/engine";
import { ART_CSS, artOverlayMarkup } from "@/lib/artwp/overlay";
import { mountStepper } from "@/lib/artwp/stepper";
import { visit } from "@/lib/visit";
import type { LoadProgress } from "./ArtLoader";
import { DropLoader } from "./DropLoader";

/**
 * Home hero (sample): "The art of waterproofing". A crack opens in a white
 * concrete surface; PU grout fills it, crystalline treatment works inside the
 * concrete, a liquid membrane spreads over it, a torch-on membrane covers the
 * roof slab, and the finished structure closes the story.
 *
 * Exactly four scrolls: each one plays a single method and settles on it.
 * On phones it plays by itself instead, as a five-second film with a caption
 * per step and a replay button, and the page scrolls on normally.
 * It opens behind a loading screen (a terrace pictured at each step of its
 * waterproofing) that follows its pictures as they load; ArtLoader is the
 * earlier, lighter loading card.
 * The loading screen plays on arrival and after a refresh only: coming back
 * from another page, the story is shown at once, where it was left.
 */
export function ArtHero() {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const lenis = useLenis();
  const overlay = useMemo(() => artOverlayMarkup(), []);
  const loading = useRef<LoadProgress>({ share: 0, done: false });
  const controls = useRef<ArtControls | null>(null);
  // back from another page (not a refresh): no loading screen, the page carries on where it was
  const [resume] = useState(() => visit.homeShown);
  const revealed = useRef(resume);
  // phones get the film; known only in the browser, so nothing mounts until it is
  const [film, setFilm] = useState<boolean | null>(null);

  useEffect(() => {
    visit.homeShown = true;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(FILM_MQ);
    const on = () => setFilm(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const section = ref.current;
    if (!section || film === null) return;
    let progress = 0;
    const st = film
      ? null
      : ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (s) => {
            progress = s.progress;
          },
        });
    if (st) progress = st.progress;
    const ctl = mountArt(section, () => progress * T, {
      held: !resume,
      film,
      atEnd: resume,
      onProgress: (share, done) => {
        loading.current = { share, done };
      },
    });
    controls.current = ctl;
    if (revealed.current) ctl.release();
    return () => {
      st?.kill();
      ctl.destroy();
      controls.current = null;
    };
  }, [film, resume]);

  // the slab and headline start as the loading card lifts; scrolling is held until it has gone
  const onReveal = useCallback(() => {
    revealed.current = true;
    controls.current?.release();
  }, []);
  const onGone = useCallback(() => {
    if (ref.current) delete ref.current.dataset.loading;
  }, []);

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

  // one scroll = one step (no smooth scroller when reduced motion is on: plain scrolling then);
  // phones scroll normally, the film plays by itself
  useEffect(() => {
    const section = ref.current;
    if (!section || !lenis || film !== false) return;
    return mountStepper(section, lenis, STEPS);
  }, [lenis, film]);

  return (
    <>
      {!resume && <DropLoader progress={loading} onReveal={onReveal} onGone={onGone} />}
      <section ref={ref} className="aw-section" aria-label="The art of waterproofing" data-nav-tone="light" data-loading={resume ? undefined : ""}>
        <style dangerouslySetInnerHTML={{ __html: ART_CSS }} />
        <div className="aw-stage">
          <canvas className="aw-canvas" aria-hidden="true" />
          <div className="aw-ov" dangerouslySetInnerHTML={{ __html: overlay }} />
        </div>
      </section>
    </>
  );
}
