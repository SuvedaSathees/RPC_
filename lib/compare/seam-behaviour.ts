/**
 * The seam in the browser, the parts both pages share: films play only while
 * they are on screen (and wait for a press when the visitor prefers less
 * motion), and the moment a side changes is marked so the rows can settle in.
 */
type Off = () => void;

/** films in `root`: loaded and played while visible, paused when not; call refresh() after redrawing */
export function films(root: HTMLElement): { refresh: () => void; off: Off } {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seen = new WeakSet<HTMLVideoElement>();
  const load = (v: HTMLVideoElement) => {
    if (v.dataset.src && !v.getAttribute("src")) {
      v.src = v.dataset.src;
      v.load();
    }
  };
  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            for (const en of entries) {
              const v = en.target as HTMLVideoElement;
              if (en.isIntersecting) {
                load(v);
                if (!reduced) void v.play().catch(() => {});
              } else v.pause();
            }
          },
          { threshold: 0.35 },
        )
      : null;
  const refresh = () => {
    root.querySelectorAll<HTMLVideoElement>("video.cx-film").forEach((v) => {
      if (seen.has(v)) return;
      seen.add(v);
      if (reduced) {
        const b = v.parentElement?.querySelector<HTMLButtonElement>(".cx-play");
        if (b) {
          b.hidden = false;
          b.addEventListener("click", () => {
            load(v);
            if (v.paused) {
              void v.play().catch(() => {});
              b.setAttribute("aria-label", "Pause the film");
            } else {
              v.pause();
              b.setAttribute("aria-label", "Play the film");
            }
          });
        }
      }
      if (io) io.observe(v);
      else load(v);
    });
  };
  refresh();
  return { refresh, off: () => io?.disconnect() };
}

/** mark the change so the rows and pictures settle in (CSS does the rest) */
export function settle(cx: HTMLElement) {
  cx.classList.remove("is-changing");
  void cx.offsetWidth;
  cx.classList.add("is-changing");
  window.setTimeout(() => cx.classList.remove("is-changing"), 900);
}

/** bring the comparison into view if it is not mostly on screen */
export function reveal(cx: HTMLElement, scrollTo?: (y: number) => void) {
  const r = cx.getBoundingClientRect();
  if (r.top >= 0 && r.top < window.innerHeight * 0.35) return;
  const margin = parseFloat(getComputedStyle(cx).scrollMarginTop) || 80;
  const y = window.scrollY + r.top - margin;
  if (scrollTo) scrollTo(y);
  else window.scrollTo({ top: y, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

/** copy a link, with a short confirmation on the button */
export async function copyLink(url: string, label: HTMLElement | null, done = "Link copied") {
  const was = label?.textContent ?? "";
  try {
    await navigator.clipboard.writeText(url);
    if (label) label.textContent = done;
  } catch {
    if (label) label.textContent = "Copy failed: use the address bar";
  }
  window.setTimeout(() => {
    if (label) label.textContent = was;
  }, 2200);
}
