"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { contact } from "@/lib/content";
import { LANDING_CSS, landingMarkup, type LandingBrand } from "@/lib/landing/markup";

/**
 * Home page opening (lib/landing/markup.ts): the words on the left and an
 * architect's section through a house with the four surfaces we waterproof,
 * then the brands we supply. Plain markup with no animation; links to other
 * pages go through the router. The brands and the product count are worked out
 * on the server, so the product list never travels to the browser.
 */
export function Landing({ brands, productCount }: { brands: readonly LandingBrand[]; productCount: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const html = useMemo(() => landingMarkup({ whatsapp: contact.whatsapp, phone: contact.phone, brands, productCount }), []);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-internal]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      router.push(a.getAttribute("href")!);
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [router]);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
