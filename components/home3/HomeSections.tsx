"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { brand, contact, highlights, projects, services, stats } from "@/lib/content";
import { HOME_CSS, HOME_PRODUCTS_CSS, homeSectionsMarkup, mountHome, type HomeData, type HomePart } from "@/lib/home/sections";

const DATA: HomeData = { projects, services, points: highlights, stats, contact, brand };
type ProductsSummary = NonNullable<HomeData["products"]>;

/** links inside the markup: pages through the router, the rest as normal links */
function useLinks(ref: RefObject<HTMLElement | null>) {
  const router = useRouter();
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
  }, [ref, router]);
}

/**
 * Home page sections below the hero and the methods, in the hero's visual
 * language. `parts` picks which ones (page order is kept); `styles` adds the
 * shared style sheet, needed once per page; `products` is the short summary
 * the products section needs (worked out on the server, so the full product
 * list never has to travel to the browser).
 */
export function HomeSections({ parts, styles = true, products }: { parts?: readonly HomePart[]; styles?: boolean; products?: ProductsSummary } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const key = parts?.join(",") ?? "all";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const html = useMemo(() => homeSectionsMarkup({ ...DATA, products }, {}, parts), [key]);
  useLinks(ref);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mountHome(el);
  }, []);
  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: HOME_CSS + (products ? HOME_PRODUCTS_CSS : "") }} />}
      <div ref={ref} className="hm" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
