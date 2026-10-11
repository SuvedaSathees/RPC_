"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { METHODS_CSS, methodsMarkup, mountMethods } from "@/lib/dropstory/methods";

/**
 * All twelve waterproofing methods, grouped by where they go in a building.
 * `featured` tags the methods the page above shows; `serif` sets the heading
 * in the serif of the "art of waterproofing" hero; `art` is the home page's
 * layout (a grid of cards with the building in a card of its own).
 */
export function MethodsIndex({ featured, serif = false, art = false }: { featured?: Record<string, string>; serif?: boolean; art?: boolean } = {}) {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const html = useMemo(() => methodsMarkup({ featured, art }), [featured, art]);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const unmount = mountMethods(section);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-internal]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      router.push(a.getAttribute("href")!);
    };
    section.addEventListener("click", onClick);
    return () => {
      unmount();
      section.removeEventListener("click", onClick);
    };
  }, [router]);

  return (
    <section
      ref={ref}
      id="methods"
      className={["mx-section", serif && "mx-section--serif", art && "mx-section--art"].filter(Boolean).join(" ")}
      {...(art ? { "aria-labelledby": "methods-title" } : { "aria-label": "Waterproofing methods" })}
    >
      <style dangerouslySetInnerHTML={{ __html: METHODS_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
