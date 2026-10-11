/**
 * Mounts the drop story on a rendered section: one rAF loop draws the scene
 * and moves the copy, callouts, pins and progress rail. `getU` returns the
 * scroll position in timeline units (0 … T).
 */
import { CALLOUTS, T, WINDOWS, clamp, createEngine, seg, win } from "./engine";
import { ANCHORS, C } from "./world";

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const SKY = hex(C.sky);
const SOIL = hex(C.soil);
const mix = (t: number) => `rgb(${SKY.map((v, i) => Math.round(v + (SOIL[i]! - v) * t)).join(",")})`;

export function mountDropStory(section: HTMLElement, getU: () => number) {
  const svg = section.querySelector<SVGSVGElement>("svg.ds-svg")!;
  const stage = section.querySelector<HTMLElement>(".ds-stage")!;
  const engine = createEngine(svg);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const copies = Array.from(section.querySelectorAll<HTMLElement>("[data-win]")).map((el) => {
    const [a, b] = el.dataset.win!.split(",").map(Number) as [number, number];
    return { el, a, b, shown: false };
  });
  const scrim = section.querySelector<HTMLElement>(".ds-scrim");
  const floor = section.querySelector<HTMLElement>(".ds-floor");
  const callouts = CALLOUTS.map((c) => ({
    c,
    el: section.querySelector<HTMLElement>(`[data-callout="${c.id}"]`)!,
    dot: section.querySelector<HTMLElement>(`[data-dot="${c.id}"]`)!,
    line: section.querySelector<SVGLineElement>(`[data-leader="${c.id}"]`)!,
  }));
  const pins = Array.from(section.querySelectorAll<HTMLElement>("[data-pin]")).map((el, i) => ({
    el,
    at: ANCHORS[el.dataset.pin as keyof typeof ANCHORS],
    i,
  }));
  const rail = section.querySelector<HTMLElement>(".ds-rail");
  const railItems = Array.from(section.querySelectorAll<HTMLElement>("[data-rail]")).map((el, i) => ({
    el,
    bar: el.querySelector<HTMLElement>("i")!,
    w: [WINDOWS.s1, WINDOWS.s2, WINDOWS.s3, WINDOWS.s4][i]!,
  }));

  let u = clamp(getU(), 0, T);
  let visible = true;
  let tone = "";
  let raf = 0;
  const t0 = performance.now();

  const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting), { rootMargin: "100px" });
  io.observe(section);

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const target = clamp(getU(), 0, T);
    u += (target - u) * 0.2;
    if (Math.abs(target - u) < 0.0005) u = target;

    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const mobile = W < 768;
    const time = reduced ? 0 : (now - t0) / 1000;
    const v = engine.render(u, time, W, H, mobile);

    // light above ground, dark below it
    const bg = mix(v.tone);
    section.style.setProperty("--ds-bg", bg);
    const t = v.tone > 0.5 ? "dark" : "light";
    if (t !== tone) {
      tone = t;
      section.dataset.tone = t;
      section.style.backgroundColor = t === "dark" ? C.soil : C.sky;
    }

    // copy blocks
    let scrimO = 0;
    for (const c of copies) {
      const o = c.a <= 0 ? 1 - seg(u, c.b - 0.35, c.b) : c.b > T ? seg(u, c.a, c.a + 0.35) : win(u, c.a, c.b, 0.35);
      const show = o > 0.005;
      if (show !== c.shown) {
        c.shown = show;
        c.el.style.visibility = show ? "visible" : "hidden";
      }
      if (show) {
        c.el.style.opacity = o.toFixed(3);
        const entering = u < (c.a + c.b) / 2;
        c.el.style.setProperty("--dy", `${((1 - o) * (entering ? 18 : -18)).toFixed(1)}px`);
      }
      const isFinal = c.el.classList.contains("ds-copy--final");
      if (!c.el.classList.contains("ds-copy--hero") && (!isFinal || mobile)) scrimO = Math.max(scrimO, o);
    }
    if (scrim) scrim.style.opacity = scrimO.toFixed(3);

    // callouts
    const k = mobile ? 0.72 : 1;
    for (const { c, el, dot, line } of callouts) {
      const o = win(u, c.win[0], c.win[1], 0.3);
      if (o <= 0.005) {
        if (el.style.opacity !== "0") {
          el.style.opacity = "0";
          dot.style.opacity = "0";
          line.style.opacity = "0";
        }
        continue;
      }
      const [x, y] = engine.project(c.at[0], c.at[1]);
      const lx = x + c.dx * k;
      const ly = y + c.dy * k;
      el.style.opacity = `${o}`;
      el.style.transform = `translate3d(${lx.toFixed(1)}px,${ly.toFixed(1)}px,0) translate(-50%,-50%)`;
      dot.style.opacity = `${o}`;
      dot.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      line.style.opacity = `${o}`;
      line.setAttribute("x1", x.toFixed(1));
      line.setAttribute("y1", y.toFixed(1));
      line.setAttribute("x2", lx.toFixed(1));
      line.setAttribute("y2", ly.toFixed(1));
    }

    // numbered pins on the final pull-back
    for (const p of pins) {
      const o = seg(u, 21.7 + p.i * 0.12, 22.1 + p.i * 0.12);
      p.el.style.opacity = `${o}`;
      if (o > 0) {
        const [x, y] = engine.project(p.at[0], p.at[1]);
        p.el.style.transform = `translate3d(${x.toFixed(1)}px,${(y + (1 - o) * 10).toFixed(1)}px,0)`;
      }
    }

    // progress rail
    const railO = win(u, 2.2, 21.4, 0.4);
    if (rail) rail.style.opacity = `${railO}`;
    if (floor) floor.style.opacity = `${railO * 0.92}`;
    for (const r of railItems) {
      const p = seg(u, r.w[0] + 0.2, r.w[1] - 0.2);
      r.bar.style.transform = `scaleX(${p.toFixed(3)})`;
      r.el.dataset.on = u >= r.w[0] - 0.2 && u <= r.w[1] ? "1" : "0";
    }
  };
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    engine.destroy();
  };
}
