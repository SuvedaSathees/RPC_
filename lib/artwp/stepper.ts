/**
 * Four scrolls through the hero. Inside the pinned section every wheel flick,
 * swipe or key press plays exactly one step (one method) and settles on it;
 * a slow drag of the scrollbar settles on the nearest step. Past the last
 * step, or above the first, scrolling is ordinary again.
 *
 * Positions are measured in steps: q = 0 is the opening frame, q = 1 … steps
 * are the resting states, spaced one screen apart.
 */
import type Lenis from "lenis";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** seconds for one full step */
const STEP_S = 1.6;
/** wheel events closer together than this belong to the same gesture */
const GESTURE_GAP_MS = 200;
/** a slow scroll that never speeds up still steps once it has moved this far (px) */
const DRIFT_PX = 150;

export function mountStepper(section: HTMLElement, lenis: Lenis, steps: number) {
  let busy = false;
  let busyTimer = 0;
  let stepEnded = 0;
  let lastWheel = 0;
  let lastAbs = 0;
  let gestureUsed = false;
  let afterPause = false;
  let drift = 0;
  let idle = 0;

  const geo = () => {
    const start = section.getBoundingClientRect().top + window.scrollY;
    const len = Math.max(1, section.offsetHeight - window.innerHeight);
    return { start, gap: len / steps };
  };
  const posAt = (y: number) => {
    const { start, gap } = geo();
    return (y - start) / gap;
  };
  const inside = (q: number) => q > -0.01 && q < steps + 0.01;

  /** the step a move in this direction settles on, or null to scroll normally */
  const targetFor = (dir: number, q: number) => {
    if (!inside(q)) return null;
    if (dir > 0) return q >= steps - 0.01 ? null : Math.min(steps, Math.floor(q + 0.02) + 1);
    return q <= 0.01 ? null : Math.max(0, Math.ceil(q - 0.02) - 1);
  };

  const done = () => {
    if (!busy) return;
    busy = false;
    stepEnded = performance.now();
    window.clearTimeout(busyTimer);
  };
  const go = (target: number, from: number) => {
    if (lenis.isStopped) return;
    const { start, gap } = geo();
    const duration = Math.min(2, 0.45 + (STEP_S - 0.45) * Math.abs(target - from));
    busy = true;
    drift = 0;
    window.clearTimeout(busyTimer);
    // a safety net in case the scroll is interrupted and never reports back
    busyTimer = window.setTimeout(done, duration * 1000 + 300);
    lenis.scrollTo(Math.round(start + target * gap), { duration, easing: ease, lock: true, onComplete: done });
  };
  const swallow = (e: Event) => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
  };

  // wheel and trackpad: caught before the smooth scroller sees them
  /** the page holds still while the loading screen is up */
  const loading = () => section.dataset.loading !== undefined;

  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || lenis.isStopped) return;
    if (loading()) return swallow(e);
    const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : 0;
    if (!d) return;
    const now = performance.now();
    const abs = Math.abs(d);
    // Is this a new gesture? Only asked once the current step has landed: everything
    // during a step belongs to the gesture that started it. Trackpad momentum only ever
    // fades, so after a pause a new gesture has to pick up speed again (or be a firm
    // wheel notch); a fading tail that arrives late on a slow frame never counts. A wheel
    // spun without pause moves on again once the step has landed.
    if (now - lastWheel > GESTURE_GAP_MS) afterPause = true;
    if (!busy) {
      if (afterPause && (abs >= 40 || abs > lastAbs * 2 + 4)) {
        afterPause = false;
        gestureUsed = false;
      } else if (now - stepEnded > 250 && abs >= 40 && abs >= lastAbs) gestureUsed = false;
      // a slow, steady scroll counts too, once it has travelled far enough one way
      if (gestureUsed && now - stepEnded > 250) {
        drift = Math.sign(d) === Math.sign(drift) ? drift + d : d;
        if (Math.abs(drift) > DRIFT_PX) gestureUsed = false;
      }
    }
    lastWheel = now;
    lastAbs = abs;
    const q = posAt(lenis.targetScroll);
    if (!inside(q)) return;
    const t = targetFor(Math.sign(d), q);
    if (busy) return swallow(e);
    if (t === null) {
      // leaving the hero: let it go, unless this is momentum from the step that just landed
      if (gestureUsed) swallow(e);
      return;
    }
    swallow(e);
    if (gestureUsed) return;
    gestureUsed = true;
    afterPause = false;
    go(t, q);
  };

  // keyboard
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || lenis.isStopped) return;
    const el = e.target as HTMLElement | null;
    if (el?.closest?.("input,textarea,select,[contenteditable='true'],[role='dialog']")) return;
    let dir = 0;
    if (e.key === "ArrowDown" || e.key === "PageDown") dir = 1;
    else if (e.key === "ArrowUp" || e.key === "PageUp") dir = -1;
    else if (e.key === " " && !el?.closest?.("button,a")) dir = e.shiftKey ? -1 : 1;
    if (!dir) return;
    if (loading()) return e.preventDefault();
    const q = posAt(lenis.targetScroll);
    const t = targetFor(dir, q);
    if (t === null) return;
    e.preventDefault();
    if (busy || e.repeat) return;
    go(t, q);
  };

  // touch: decide on the first move whether this swipe steps or scrolls
  let touching = false;
  let ty = 0;
  let decided: "step" | "native" | null = null;
  let fired = false;
  const onTouchStart = (e: TouchEvent) => {
    touching = e.touches.length === 1;
    ty = e.touches[0]?.clientY ?? 0;
    decided = null;
    fired = false;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!touching || e.touches.length !== 1) return;
    if (loading()) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    const dy = ty - e.touches[0]!.clientY; // > 0: finger moves up, page would scroll down
    if (decided === null) {
      if (dy === 0) return;
      const q = posAt(window.scrollY);
      decided = lenis.isStopped || (!busy && targetFor(Math.sign(dy), q) === null) ? "native" : "step";
    }
    if (decided === "native") return;
    if (e.cancelable) e.preventDefault();
    if (fired || busy || Math.abs(dy) < 28) return;
    const q = posAt(window.scrollY);
    const t = targetFor(Math.sign(dy), q);
    if (t === null) return;
    fired = true;
    go(t, q);
  };
  const onTouchEnd = () => {
    touching = false;
    decided = null;
  };

  // anything else (scrollbar, momentum from below): settle on the nearest step once still
  const settle = () => {
    if (busy || touching || lenis.isStopped || loading()) return;
    if (lenis.isScrolling) {
      idle = window.setTimeout(settle, 120);
      return;
    }
    const q = posAt(window.scrollY);
    if (q <= 0.005 || q >= steps - 0.005) return;
    const n = Math.round(q);
    if (Math.abs(q - n) > 0.01) go(n, q);
  };
  const onScroll = () => {
    window.clearTimeout(idle);
    idle = window.setTimeout(settle, 180);
  };

  window.addEventListener("wheel", onWheel, { capture: true, passive: false });
  window.addEventListener("keydown", onKey);
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("touchcancel", onTouchEnd, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  idle = window.setTimeout(settle, 600); // a reload can restore the page mid-step

  return () => {
    window.clearTimeout(idle);
    window.clearTimeout(busyTimer);
    window.removeEventListener("wheel", onWheel, { capture: true });
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove, { capture: true });
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
