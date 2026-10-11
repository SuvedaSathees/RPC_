/**
 * The waterproofing page in the browser: a method named on a place's tile is
 * marked for a moment once the page has glided to it (the glide itself is the
 * pages' shared link handling). Without scripts the links still jump there.
 */
import type { PageEnv } from "./behaviour";

export function mountMethods(root: HTMLElement, _env: PageEnv = {}): () => void {
  let t = 0;
  const flash = (key: string) => {
    const el = root.querySelector<HTMLElement>(`#m-${CSS.escape(key)}`);
    if (!el) return;
    window.clearTimeout(t);
    root.querySelectorAll(".wp-m.is-hit").forEach((x) => x.classList.remove("is-hit"));
    el.classList.add("is-hit");
    // on phones the methods sit side by side: bring this one into view across as well
    const row = el.parentElement;
    if (row && row.scrollWidth > row.clientWidth + 4) row.scrollTo({ left: el.offsetLeft - row.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft || "0"), behavior: "smooth" });
    t = window.setTimeout(() => el.classList.remove("is-hit"), 2200);
  };
  const onClick = (e: Event) => {
    const a = (e.target as Element).closest<HTMLElement>("[data-m-go]");
    if (a) flash(a.dataset.mGo!);
  };
  root.addEventListener("click", onClick);
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("m-")) flash(h.slice(2));
  };
  fromHash();
  return () => {
    root.removeEventListener("click", onClick);
    window.clearTimeout(t);
  };
}
