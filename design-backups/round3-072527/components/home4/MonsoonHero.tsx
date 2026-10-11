"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import type { LoadProgress } from "@/components/home3/ArtLoader";
import { DropLoader } from "@/components/home3/DropLoader";
import { contact } from "@/lib/content";
import { MONSOON_CSS, monsoonMarkup, type HeroBrand } from "@/lib/monsoon/markup";
import { mountMonsoon, type MonsoonControls } from "@/lib/monsoon/mount";
import { visit } from "@/lib/visit";

/**
 * Home hero: a cut-away of a house in the monsoon with four leaks in it (a
 * stained ceiling under the terrace, damp under the bathroom, a damp outside
 * wall, a leaking sump). Pick a leak, or scroll, and the story goes down the
 * house from the terrace to the sump, sealing each one, and ends on the dry
 * house and the free inspection (lib/monsoon).
 *
 * Along the foot of the opening screen, the brands we supply, each as a flask
 * filled to its share of our products (worked out on the server and passed in).
 *
 * It opens behind the rain loading screen on arrival and after a refresh;
 * coming back from another page it is simply there, already raining.
 */
export function MonsoonHero({ brands = [] }: { brands?: readonly HeroBrand[] }) {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const html = useMemo(() => monsoonMarkup({ whatsapp: contact.whatsapp, phone: contact.phone, brands }), []);
  const loading = useRef<LoadProgress>({ share: 0, done: false });
  const controls = useRef<MonsoonControls | null>(null);
  // back from another page (not a refresh): no loading screen
  const [resume] = useState(() => visit.homeShown);
  const released = useRef(resume);

  useEffect(() => {
    visit.homeShown = true;
  }, []);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const ctl = mountMonsoon(section, {
      held: !released.current,
      scrollTo: (target) => {
        const l = lenisRef.current;
        if (l) l.scrollTo(target, { duration: 1.5 });
        else target.scrollIntoView({ behavior: "smooth" });
      },
    });
    controls.current = ctl;
    // the drawing is in the page already; only the type faces are worth waiting for
    let live = true;
    const ready = () => {
      if (live) loading.current = { share: 1, done: true };
    };
    if (document.fonts?.ready) document.fonts.ready.then(ready, ready);
    else ready();
    return () => {
      live = false;
      ctl.destroy();
      controls.current = null;
    };
  }, []);

  // the rain and the camera start as the loading screen's water runs off
  const onStart = useCallback(() => {
    released.current = true;
    controls.current?.release();
  }, []);
  const onGone = useCallback(() => {}, []);

  // links to other pages go through the router
  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-internal]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      router.push(a.getAttribute("href")!);
    };
    section.addEventListener("click", onClick);
    return () => section.removeEventListener("click", onClick);
  }, [router]);

  return (
    <>
      {!resume && <DropLoader progress={loading} onStart={onStart} onReveal={onStart} onGone={onGone} pageTone="dark" />}
      <style dangerouslySetInnerHTML={{ __html: MONSOON_CSS }} />
      <section ref={ref} className="mh" aria-label="Where water gets into a house, and how we seal it" data-nav-tone="dark" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
