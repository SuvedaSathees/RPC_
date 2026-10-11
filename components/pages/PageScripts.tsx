"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useLenis } from "@/components/providers/SmoothScroll";
import { mountPageBehaviour, type PageKind } from "@/lib/pages/behaviour";

/**
 * The behaviour the inner pages' server-rendered markup needs: links to other
 * pages go through the router, jumps within the page glide (stopping short of
 * the navigation bar), and each page's own piece (see lib/pages/behaviour.ts).
 */
export function PageScripts({ root, kind }: { root: string; kind: PageKind }) {
  const router = useRouter();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useEffect(() => {
    const el = document.getElementById(root);
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest<HTMLAnchorElement | SVGAElement>("a[href]");
      if (!a || a.getAttribute("target") === "_blank") return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("#")) {
        const target = document.getElementById(decodeURIComponent(href.slice(1)));
        if (!target) return;
        e.preventDefault();
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        if (lenisRef.current) lenisRef.current.scrollTo(target, { offset: -margin });
        else target.scrollIntoView({ behavior: "smooth" });
        history.replaceState(history.state, "", href);
        return;
      }
      if (a.hasAttribute("data-internal")) {
        e.preventDefault();
        router.push(href);
      }
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [root, router]);

  // the page's own behaviour, mounted once
  useEffect(() => {
    const el = document.getElementById(root);
    if (!el) return;
    return mountPageBehaviour(kind, el, {
      scrollTo: (y) => (lenisRef.current ? lenisRef.current.scrollTo(y) : window.scrollTo({ top: y, behavior: "smooth" })),
      lock: (on) => (on ? lenisRef.current?.stop() : lenisRef.current?.start()),
    });
  }, [root, kind]);

  return null;
}
