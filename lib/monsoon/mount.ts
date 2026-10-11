/**
 * The monsoon house, alive: rain over the drawing (it lands on the terrace,
 * the parapets and the tank, rings the puddles and is driven against the west
 * wall), a camera that moves to each leak as its step reaches the middle of
 * the screen, and the leaks sealed one by one, top to bottom.
 *
 * The camera is the SVG's viewBox, so the drawing stays sharp at every zoom;
 * the rain is a canvas over it that uses the same camera. Leak buttons are
 * links placed over the drawing in screen pixels, so they keep their size.
 *
 * With reduced motion there is no rain and no camera travel: each step cuts
 * straight to its view, already sealed.
 */
import { H, HOTSPOTS, LAMP, PUDDLE_SCREEN, TANK_SCREEN, TERRACE_FLOOR, VIEWS, VIEWS_PHONE, YARD_PUDDLES, ZONE_KEYS, type ZoneKey } from "./scene";

export interface MonsoonOptions {
  /** wait under the loading screen: no rain or camera move until release() */
  held?: boolean;
  /** move the page to a step (the site's smooth scroller); plain smooth scrolling otherwise */
  scrollTo?: (target: HTMLElement) => void;
}
export interface MonsoonControls {
  release(): void;
  destroy(): void;
}

type View = readonly [number, number, number, number];
/** a camera: the world point at the centre of the screen, and pixels per world unit */
interface Cam {
  x: number;
  y: number;
  s: number;
}
interface Drop {
  x: number;
  y: number;
  /** how far back it falls, 0 (back) … 1 (front): where it lands on the terrace or the yard */
  d: number;
  v: number;
  a: number;
}
interface Splash {
  x: number;
  y: number;
  t: number;
  /** 0 on a floor, 1 against the wall, 2 rings on water */
  k: 0 | 1 | 2;
  r: number;
}

const viewsFor = (v: typeof VIEWS | typeof VIEWS_PHONE): readonly View[] => [v.all, v.terrace, v.bathroom, v.walls, v.sump, v.all];
const STEP_VIEWS = viewsFor(VIEWS);
const PHONE_VIEWS = viewsFor(VIEWS_PHONE);
const LAST = STEP_VIEWS.length - 1;
/** narrow or upright screens stack the story under the drawing (the same test as the style sheet) */
const STACK_MQ = "(max-width: 899px), (max-aspect-ratio: 1/1)";
const WIND = 0.2;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function mountMonsoon(section: HTMLElement, opts: MonsoonOptions = {}): MonsoonControls {
  const stage = section.querySelector<HTMLElement>(".mh-stage");
  const svgs = [...section.querySelectorAll<SVGSVGElement>(".mh-svg")];
  const svg = svgs[0];
  const canvas = section.querySelector<HTMLCanvasElement>(".mh-rain");
  const ctx = canvas?.getContext("2d");
  if (!stage || !svg || !canvas || !ctx) return { release() {}, destroy() {} };
  const steps = [...section.querySelectorAll<HTMLElement>(".mh-step")];
  const spots = new Map<ZoneKey, HTMLAnchorElement>();
  section.querySelectorAll<HTMLAnchorElement>("[data-spot]").forEach((a) => spots.set(a.dataset.spot as ZoneKey, a));
  const rail = new Map<ZoneKey, HTMLAnchorElement>();
  section.querySelectorAll<HTMLAnchorElement>("[data-rail]").forEach((a) => rail.set(a.dataset.rail as ZoneKey, a));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  section.classList.add("mh-js");
  svgs.forEach((el) => el.setAttribute("preserveAspectRatio", "none"));

  let W = 1;
  let Ht = 1;
  let dpr = 1;
  let phone = false;
  let cam: Cam = { x: 800, y: 500, s: 1 };
  let from: Cam = cam;
  let to: Cam = cam;
  let t0 = 0;
  let dur = 0;
  let step = 0;
  let live = false;
  let onScreen = true;
  let raf = 0;
  let last = 0;
  const sealed = new Set<ZoneKey>();
  const timers: number[] = [];
  const drops: Drop[] = [];
  const splashes: Splash[] = [];

  /* ---------------------------------------------------------- camera */

  /** the part of the screen the drawing is framed in, for a step */
  /** the height of the site's header (the contact strip and the bar on wide screens, the bar alone on phones) */
  const navH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || (phone ? 68 : 92);
  function frame(i: number) {
    if (phone) {
      // above the step's card, which sits at the foot of the screen
      const top = navH() + 8;
      const card = steps[i]?.querySelector<HTMLElement>(".mh-card");
      const bottom = Math.min(Ht * 0.62, Ht - 18 - (card?.offsetHeight ?? Ht * 0.45) - 8);
      return { x: 12, y: top, w: Math.max(80, W - 24), h: Math.max(150, bottom - top) };
    }
    const end = i === 0 || i === LAST;
    const left = W * (end ? 0.41 : 0.39);
    const right = end ? W * 0.025 : Math.min(230, W * 0.16);
    const top = navH() + 12;
    return { x: left, y: top, w: Math.max(80, W - left - right), h: Math.max(80, Ht - top - 40) };
  }
  function camFor(i: number): Cam {
    const [x0, y0, x1, y1] = (phone ? PHONE_VIEWS : STEP_VIEWS)[i]!;
    const f = frame(i);
    // big upright screens (tablets) would zoom right in on a phone's tight views: they show more around them instead
    const s = Math.min(f.w / (x1 - x0), f.h / (y1 - y0), phone ? 1.9 : 2.6);
    return { s, x: (x0 + x1) / 2 - (f.x + f.w / 2 - W / 2) / s, y: (y0 + y1) / 2 - (f.y + f.h / 2 - Ht / 2) / s };
  }
  const toScreen = (x: number, y: number): [number, number] => [(x - cam.x) * cam.s + W / 2, (y - cam.y) * cam.s + Ht / 2];
  function apply() {
    const w = W / cam.s;
    const h = Ht / cam.s;
    const vb = `${(cam.x - w / 2).toFixed(2)} ${(cam.y - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
    for (const el of svgs) el.setAttribute("viewBox", vb);
    for (const [z, a] of spots) {
      const [x, y] = toScreen(HOTSPOTS[z][0], HOTSPOTS[z][1]);
      a.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      // keep the label on the screen: it goes to the left of its dot near the right edge
      a.toggleAttribute("data-flip", x > W - 220);
    }
  }
  function moveTo(i: number, ms: number, start?: Cam) {
    from = start ?? cam;
    to = camFor(i);
    t0 = performance.now();
    dur = reduce.matches ? 0 : ms;
    if (!dur) {
      cam = to;
      apply();
      if (live && reduce.matches) still();
    }
    kick();
  }

  /* ---------------------------------------------------------- rain */

  /** where a drop falling at x (at depth d) stops: the terrace, a parapet, the tank or the yard */
  function floorAt(x: number, d: number) {
    if (x >= H.xW - 3 && x <= H.xE + 3) {
      if (x < TERRACE_FLOOR.x0 || x > TERRACE_FLOOR.x1) return H.coping;
      const T = TERRACE_FLOOR;
      let back = T.back;
      if (x < T.bx0) back = T.front - (T.front - T.back) * ((x - T.x0) / (T.bx0 - T.x0));
      else if (x > T.bx1) back = T.front - (T.front - T.back) * ((T.x1 - x) / (T.x1 - T.bx1));
      const y = back + (T.front - back) * d;
      if (x > TANK_SCREEN.x0 && x < TANK_SCREEN.x1 && y < TANK_SCREEN.base) return TANK_SCREEN.top;
      return y;
    }
    return 664 + 36 * d;
  }
  function viewRect() {
    const w = W / cam.s;
    const h = Ht / cam.s;
    return { x0: cam.x - w / 2, y0: cam.y - h / 2, x1: cam.x + w / 2, y1: cam.y + h / 2 };
  }
  function spawn(p: Drop, anywhere: boolean) {
    const v = viewRect();
    const span = v.y1 - v.y0;
    p.d = Math.random();
    p.v = 1050 + Math.random() * 450;
    p.a = 0.14 + Math.random() * Math.random() * 0.4;
    if (anywhere) {
      p.x = v.x0 - span * WIND + Math.random() * (v.x1 - v.x0 + span * WIND);
      const top = v.y0 - 40;
      p.y = top + Math.random() * (Math.min(v.y1, floorAt(p.x, p.d)) - top);
    } else {
      p.y = v.y0 - 30 - Math.random() * span * 0.4;
      p.x = v.x0 - (v.y1 - p.y) * WIND * 0.6 + Math.random() * (v.x1 - v.x0 + span * WIND);
    }
  }
  /** with reduced motion: the rain stands still, one frame of it in the current view */
  function still() {
    for (const p of drops) spawn(p, true);
    splashes.length = 0;
    draw();
  }
  function fill() {
    const want = Math.round(Math.min(phone ? 150 : 420, Math.max(70, (W * Ht) / 3400)));
    while (drops.length < want) {
      const p = { x: 0, y: 0, d: 0, v: 0, a: 0 };
      spawn(p, true);
      drops.push(p);
    }
    drops.length = want;
  }
  const inEllipse = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
  function land(x: number, y: number, k: 0 | 1 | 2) {
    // not every drop throws up a splash: a few are enough to read as rain landing
    if (splashes.length > (phone ? 90 : 220) || (k === 0 && Math.random() < 0.45)) return;
    const v = viewRect();
    if (x < v.x0 - 20 || x > v.x1 + 20 || y < v.y0 - 20 || y > v.y1 + 20) return;
    splashes.push({ x, y, t: 0, k, r: Math.random() });
  }
  function rain(dt: number) {
    const v = viewRect();
    for (const p of drops) {
      const px = p.x;
      p.y += p.v * dt;
      p.x += p.v * WIND * dt;
      // driven against the west wall
      if (px < H.xW && p.x >= H.xW && p.y > H.coping && p.y < H.ground) {
        land(H.xW, p.y, 1);
        spawn(p, false);
        continue;
      }
      const f = floorAt(p.x, p.d);
      if (p.y >= f) {
        let k: 0 | 2 = 0;
        if (!sealed.has("terrace") && inEllipse(p.x, f, PUDDLE_SCREEN.cx, PUDDLE_SCREEN.cy, PUDDLE_SCREEN.rx, PUDDLE_SCREEN.ry)) k = 2;
        else if (f > 660) for (const [cx, cy, rx, ry] of YARD_PUDDLES) if (inEllipse(p.x, f, cx, cy, rx, ry * 2.2)) k = 2;
        land(p.x, f, k);
        spawn(p, false);
        continue;
      }
      if (p.y > v.y1 + 40 || p.x > v.x1 + 80) spawn(p, false);
    }
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i]!;
      s.t += dt;
      if (s.t > (s.k === 2 ? 0.6 : 0.3)) splashes.splice(i, 1);
    }
  }
  function draw() {
    const c = ctx!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, Ht);
    const s = cam.s;
    const len = 0.03 * s;
    const lw = Math.max(0.8, Math.min(1.6, s * 1.1));
    c.lineCap = "round";
    // three strengths of rain, and the drops caught in the street light
    const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    for (const p of drops) {
      const [x, y] = toScreen(p.x, p.y);
      const dx = p.v * WIND * len;
      const dy = p.v * len;
      const lit = Math.hypot(p.x - LAMP.x, p.y - LAMP.y) < LAMP.r * (0.55 + p.d * 0.45);
      const path = paths[lit ? 3 : p.a < 0.22 ? 0 : p.a < 0.34 ? 1 : 2]!;
      path.moveTo(x, y);
      path.lineTo(x - dx, y - dy);
    }
    c.lineWidth = lw;
    c.strokeStyle = "rgba(196,222,232,.2)";
    c.stroke(paths[0]!);
    c.strokeStyle = "rgba(204,228,236,.32)";
    c.stroke(paths[1]!);
    c.strokeStyle = "rgba(214,234,241,.46)";
    c.stroke(paths[2]!);
    c.strokeStyle = "rgba(255,226,170,.62)";
    c.stroke(paths[3]!);
    // splashes
    const dots = new Path2D();
    const rings = new Path2D();
    for (const sp of splashes) {
      const [x, y] = toScreen(sp.x, sp.y);
      if (sp.k === 2) {
        const k = sp.t / 0.6;
        const rx = Math.max(0.2, (1.5 + 9 * k) * s * (0.6 + sp.r * 0.6));
        rings.moveTo(x + rx, y);
        rings.ellipse(x, y, rx, rx * 0.28, 0, 0, Math.PI * 2);
        continue;
      }
      const t = sp.t;
      const side = sp.k === 1;
      for (let j = 0; j < 3; j++) {
        const vx = side ? -(30 + j * 26 + sp.r * 20) : (j - 1) * (34 + sp.r * 30);
        const vy = -(70 + ((j * 37 + sp.r * 90) % 70));
        const x2 = x + vx * t * s;
        const y2 = y + (vy * t + 450 * t * t) * s;
        const rr = Math.max(0.55, Math.min(1.3, 0.7 * s));
        dots.moveTo(x2 + rr, y2);
        dots.arc(x2, y2, rr, 0, Math.PI * 2);
      }
    }
    c.fillStyle = "rgba(220,238,244,.38)";
    c.fill(dots);
    c.lineWidth = Math.max(0.6, 0.8 * s);
    c.strokeStyle = "rgba(200,230,238,.38)";
    c.stroke(rings);
  }

  /* ---------------------------------------------------------- loop */

  function tick(now: number) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    let moving = false;
    if (dur > 0) {
      const k = Math.min(1, (now - t0) / dur);
      const e = ease(k);
      cam = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, s: Math.exp(Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * e) };
      apply();
      if (k >= 1) dur = 0;
      else moving = true;
    }
    const raining = live && !reduce.matches;
    if (raining) {
      rain(dt);
      draw();
    }
    if (onScreen && !document.hidden && (raining || moving)) raf = requestAnimationFrame(tick);
  }
  function kick() {
    if (!raf && onScreen && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  /* ---------------------------------------------------------- steps */

  function setSealed(z: ZoneKey, on: boolean) {
    if (on === sealed.has(z)) return;
    if (on) sealed.add(z);
    else sealed.delete(z);
    for (const el of svgs) el.classList.toggle(`is-${z}`, on);
    section.querySelector(`#leak-${z}`)?.toggleAttribute("data-sealed", on);
    rail.get(z)?.toggleAttribute("data-sealed", on);
  }
  function setStep(i: number, first = false) {
    if (i === step && !first) return;
    step = i;
    stage!.dataset.step = String(i);
    steps.forEach((el, k) => el.classList.toggle("is-on", k === i));
    for (const [z, a] of rail) {
      if (ZONE_KEYS.indexOf(z) + 1 === i) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    }
    timers.forEach((t) => window.clearTimeout(t));
    timers.length = 0;
    // the leaks above this step are sealed; this one once the camera is there; the ones below are open again
    ZONE_KEYS.forEach((z, k) => {
      const n = k + 1;
      if (i === LAST) {
        if (!sealed.has(z)) timers.push(window.setTimeout(() => setSealed(z, true), reduce.matches ? 0 : 300 + k * 260));
      } else if (n < i) setSealed(z, true);
      else if (n === i) timers.push(window.setTimeout(() => setSealed(z, true), reduce.matches ? 0 : 1800));
      else setSealed(z, false);
    });
    if (!first) moveTo(i, 1500);
  }

  // the step crossing the middle of the screen is the one shown
  // the step across the middle of the screen is the one shown; above the story it is the first, past it the last
  let pending = 0;
  const pick = () => {
    pending = 0;
    const mid = window.innerHeight / 2;
    let i = 0;
    for (let k = 0; k < steps.length; k++) if (steps[k]!.getBoundingClientRect().top <= mid) i = k;
    setStep(i);
  };
  const onScroll = () => {
    if (!pending) pending = requestAnimationFrame(pick);
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  // rain only while the section is on screen
  const seen = new IntersectionObserver(
    ([en]) => {
      onScreen = Boolean(en?.isIntersecting);
      if (onScreen) kick();
    },
    { rootMargin: "80px 0px" },
  );
  seen.observe(section);
  const onVisibility = () => {
    if (!document.hidden) kick();
  };
  document.addEventListener("visibilitychange", onVisibility);

  // leak buttons, chips and the gauge move the page to their step
  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#leak-"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const target = section.querySelector<HTMLElement>(a.getAttribute("href")!);
    if (!target) return;
    e.preventDefault();
    if (opts.scrollTo) opts.scrollTo(target);
    else target.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth" });
  };
  section.addEventListener("click", onClick);

  /* ---------------------------------------------------------- size */

  function resize() {
    const r = stage!.getBoundingClientRect();
    // not laid out (hidden, or mid-way through a page change): keep the last good size
    if (r.width < 40 || r.height < 40) return;
    W = r.width;
    Ht = r.height;
    phone = window.matchMedia(STACK_MQ).matches;
    dpr = Math.min(window.devicePixelRatio || 1, phone ? 2 : 1.75);
    canvas!.width = Math.round(W * dpr);
    canvas!.height = Math.round(Ht * dpr);
    cam = to = camFor(step);
    dur = 0;
    apply();
    fill();
    if (live) {
      if (reduce.matches) still();
      else draw();
    }
  }
  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  // on a phone the drawing is framed above each card, so a card that changes size (fonts arriving) reframes it
  section.querySelectorAll(".mh-card").forEach((c) => ro.observe(c));
  resize();
  setStep(0, true);
  pick();

  function release() {
    if (live) return;
    live = true;
    section.classList.add("is-live");
    // a slow push in as the rain starts
    const end = camFor(step);
    moveTo(step, 2600, step === 0 ? { x: end.x + 40 / end.s, y: end.y - 20 / end.s, s: end.s * 0.9 } : cam);
    if (reduce.matches) still();
    kick();
  }
  if (!opts.held) release();

  return {
    release,
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      if (pending) cancelAnimationFrame(pending);
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("scroll", onScroll);
      seen.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      section.removeEventListener("click", onClick);
      section.classList.remove("mh-js", "is-live");
    },
  };
}
