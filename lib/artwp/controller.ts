/**
 * Mounts the "art of waterproofing" hero on a rendered section: loads the
 * keyframe stills, then one rAF loop draws the canvas and moves the copy and
 * the progress rail. `getU` returns the scroll position in timeline units.
 *
 * Loading progress is reported through `onProgress`. With `held`, the scene
 * waits behind the page's loading screen until `release()` (the slab fades up
 * and the headline rises as the loading screen leaves).
 */
import { CHAPTERS, FILM_S, STILLS, T, clamp, createArtEngine, readTimeMap, seg, win, type Clear, type Img } from "./engine";
import { CALLS } from "./overlay";

/** the seven stills of the slab, then the six time maps between them */
export function artSources(base: string, small: boolean) {
  const stills = Array.from({ length: STILLS }, (_, i) => `${base}/slab-${i}${small ? "-m" : ""}.webp`);
  const maps = Array.from({ length: STILLS - 1 }, (_, i) => `${base}/t${i + 1}.png`);
  return { stills, maps };
}

function grainURL() {
  const c = document.createElement("canvas");
  c.width = c.height = 160;
  const x = c.getContext("2d")!;
  const d = x.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.random() * 255;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  return c.toDataURL("image/png");
}

/** how long copy takes to fade in or out, in timeline units (one step = 1) */
const FADE = 0.12;
/** air between the copy and the slab, CSS px */
const GAP = 48;
/** room kept for the navigation bar above the slab, CSS px */
const NAV_ROOM = 96;
/** film mode: the opening frame holds this long after the headline rises, ms */
const FILM_LEAD = 520;

/**
 * Film mode: where the story is after t seconds. Each step takes the same time,
 * easing a little into and out of its resting state so the labels can be read.
 */
const filmU = (t: number) => {
  const x = clamp(t / FILM_S) * T;
  const k = Math.min(T - 1, Math.floor(x));
  const f = x - k;
  return Math.min(T, k + 0.45 * f + 0.55 * f * f * (3 - 2 * f));
};

export interface ArtOptions {
  base?: string;
  /** share of the pictures loaded (0 … 1), and whether the scene is ready to show */
  onProgress?: (share: number, done: boolean) => void;
  /** wait for `release()` before the scene starts */
  held?: boolean;
  /** play the story by itself once (phones) instead of following `getU` */
  film?: boolean;
  /** film mode: open on the finished story (coming back to the page), with the replay button */
  atEnd?: boolean;
}

export interface ArtControls {
  release(): void;
  destroy(): void;
}

export function mountArt(section: HTMLElement, getU: () => number, opts: ArtOptions = {}): ArtControls {
  const base = opts.base ?? "/artwp";
  const stage = section.querySelector<HTMLElement>(".aw-stage")!;
  const canvas = section.querySelector<HTMLCanvasElement>("canvas.aw-canvas")!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.matchMedia("(max-width: 767px)").matches;
  const film = !!opts.film;
  let alive = true;
  let raf = 0;
  let visible = true;
  let engine: ReturnType<typeof createArtEngine> | null = null;

  // film grain over the scene
  const grain = document.createElement("div");
  grain.className = "aw-grain";
  grain.style.backgroundImage = `url(${grainURL()})`;
  stage.appendChild(grain);

  // the pictures load; progress goes to the page's loading screen
  let loadedN = 0;
  let loaded = false;
  let released = !opts.held;
  let started = false;
  let ready = false;
  const { stills, maps } = artSources(base, small);
  const total = stills.length + maps.length;
  const load = (src: string) =>
    new Promise<HTMLImageElement>((res, rej) => {
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        loadedN++;
        if (alive) opts.onProgress?.(loadedN / total, false);
        res(im);
      };
      im.onerror = rej;
      im.src = src;
    });
  let t0 = performance.now();
  let shownAt = Infinity;
  const timers: number[] = [];
  const later = (ms: number, f: () => void) => timers.push(window.setTimeout(() => alive && f(), ms));
  // film mode: seconds played, and whether the clock is running
  let filmT = 0;
  let filmOn = false;
  const setFilm = (state: "play" | "end") => (section.dataset.film = state);
  const play = () => {
    filmT = 0;
    filmOn = true;
    setFilm("play");
  };
  /** the scene starts: the slab fades up and the headline rises */
  const start = () => {
    if (started || !loaded || !released) return;
    started = true;
    const now = performance.now();
    t0 = now;
    shownAt = now + (reduced ? 0 : 150);
    later(reduced ? 0 : 380, () => (ready = true));
    if (film) {
      // reduced motion, or back on the page: the finished slab, with the film a tap away
      if (reduced || opts.atEnd) {
        filmT = FILM_S;
        setFilm("end");
      } else later(380 + FILM_LEAD, play);
    }
  };
  const replay = section.querySelector<HTMLButtonElement>(".aw-replay");
  const onReplay = () => started && play();
  replay?.addEventListener("click", onReplay);
  Promise.all([...stills.map(load), ...maps.map(load)])
    .then((all) => {
      if (!alive) return;
      const s = all.slice(0, STILLS) as Img[];
      const m = all.slice(STILLS).map(readTimeMap);
      engine = createArtEngine(canvas, s, m);
      loaded = true;
      opts.onProgress?.(1, true);
      start();
    })
    .catch(() => {
      // a picture failed: let the page through rather than hold it behind the loading screen
      if (!alive) return;
      loaded = true;
      opts.onProgress?.(1, true);
      start();
    });

  // a gentle parallax that follows the pointer (desktop only)
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  const fine = window.matchMedia("(pointer: fine)").matches && !reduced;
  const onMove = (e: PointerEvent) => {
    ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (fine) window.addEventListener("pointermove", onMove, { passive: true });

  const calls = CALLS.map((k) => ({
    k,
    on: false,
    w: 0,
    el: section.querySelector<HTMLElement>(`[data-call="${k.id}"]`)!,
    dot: section.querySelector<HTMLElement>(`[data-dot="${k.id}"]`)!,
    line: section.querySelector<SVGLineElement>(`[data-line="${k.id}"]`)!,
  }));
  const nums = Array.from(section.querySelectorAll<HTMLElement>("[data-num]"));

  const copies = Array.from(section.querySelectorAll<HTMLElement>("[data-win]")).map((el) => {
    const [a, b] = el.dataset.win!.split(",").map(Number) as [number, number];
    return { el, a, b, shown: false, in: false, hero: el.classList.contains("aw-copy--hero") };
  });
  const rail = section.querySelector<HTMLElement>(".aw-rail");
  // film mode: a caption under the picture names the step that is playing (0 = the opening crack)
  const caps = Array.from(section.querySelectorAll<HTMLElement>("[data-cap]"));
  const railItems = Array.from(section.querySelectorAll<HTMLElement>("[data-rail]")).map((el, i) => ({
    el,
    bar: el.querySelector<HTMLElement>("i")!,
    w: CHAPTERS[i]!,
  }));

  const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting), { rootMargin: "100px" });
  io.observe(section);

  // Side by side, the slab is sized from where the copy actually ends; stacked (phones,
  // portrait tablets) the canvas has its own box above the copy and the slab is centred in it.
  const heroCopy = section.querySelector<HTMLElement>(".aw-copy--hero");
  const chapterCopy = section.querySelector<HTMLElement>(".aw-copy--ch");
  let stacked = false;
  let clearCss: { hero: number; story: number } | null = null;
  const textRight = (el: Element | null) => {
    if (!el) return 0;
    const r = document.createRange();
    r.selectNodeContents(el);
    let right = 0;
    for (const rect of Array.from(r.getClientRects())) right = Math.max(right, rect.right);
    return right;
  };
  // film mode: the picture takes whatever height the headline leaves free, so the screen is
  // filled from the nav to the button with no empty band at the bottom; on wide, short
  // phones it gives height back instead, so the button is never pushed off the screen
  const fitFilm = () => {
    if (!heroCopy) return;
    section.style.removeProperty("--aw-cv");
    const H = stage.clientHeight;
    const W = stage.clientWidth;
    const room = H - (heroCopy.offsetTop + heroCopy.offsetHeight) - Math.max(28, H * 0.035);
    if (Math.abs(room) <= 8) return;
    const now = canvas.offsetHeight;
    const cv = Math.max(Math.min(now, Math.max(150, W * 0.42)), Math.min(now + room, W * 1.15));
    section.style.setProperty("--aw-cv", `${Math.round(cv)}px`);
  };
  const measure = () => {
    if (film) fitFilm();
    stacked = canvas.clientHeight < stage.clientHeight - 2;
    if (stacked || !heroCopy || !chapterCopy) {
      clearCss = null;
      return;
    }
    const left = stage.getBoundingClientRect().left;
    // the opening lines as set (they can end well short of the column) and the buttons
    const hero = Math.max(
      ...Array.from(heroCopy.querySelectorAll(".aw-kicker,.aw-h1,.aw-lede")).map(textRight),
      ...Array.from(heroCopy.querySelectorAll<HTMLElement>(".aw-ctas > *")).map((e) => e.getBoundingClientRect().right),
    );
    // film mode keeps the headline up the whole time, so the slab never grows into it
    const heroClear = hero - left + GAP;
    clearCss = {
      hero: heroClear,
      story: film ? heroClear : chapterCopy.offsetLeft + chapterCopy.offsetWidth + GAP,
    };
  };
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(stage);
  document.fonts?.ready.then(() => alive && measure());

  let u = film ? 0 : clamp(getU(), 0, T);
  let lastNow = performance.now();
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.25, Math.max(0, (now - lastNow) / 1000));
    lastNow = now;
    if (!visible) return; // off screen the film waits where it is
    if (film) {
      if (filmOn) {
        filmT += dt;
        if (filmT >= FILM_S) {
          filmT = FILM_S;
          filmOn = false;
          setFilm("end");
        }
      }
      u = filmU(filmT);
    } else {
      const target = clamp(getU(), 0, T);
      u += (target - u) * 0.18;
      if (Math.abs(target - u) < 0.0005) u = target;
    }

    // canvas size follows its box
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.round(canvas.clientWidth * dpr);
    const H = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }
    const time = reduced ? 3 : (now - t0) / 1000;
    const intro = reduced ? 1 : clamp((now - shownAt) / 1600);
    ptr.x += (ptr.tx - ptr.x) * 0.05;
    ptr.y += (ptr.ty - ptr.y) * 0.05;
    const shift = fine ? { x: -ptr.x * 10, y: -ptr.y * 6 } : { x: 0, y: 0 };
    const clear: Clear | null = clearCss ? { hero: clearCss.hero * dpr, story: clearCss.story * dpr, top: NAV_ROOM * dpr } : null;
    if (engine && W > 0 && H > 0) engine.render(u, time, W, H, dpr, intro * intro * (3 - 2 * intro), shift, clear);

    for (const c of copies) {
      // film mode: the headline stays; the method chapters are left out (the caption names each step)
      if (film && !c.hero) continue;
      const o = film ? 1 : c.a <= 0 ? 1 - seg(u, c.b - FADE, c.b) : c.b > T ? seg(u, c.a, c.a + FADE) : win(u, c.a, c.b, FADE);
      const show = o > 0.005;
      if (show !== c.shown) {
        c.shown = show;
        c.el.style.visibility = show ? "visible" : "hidden";
      }
      if (show) {
        c.el.style.opacity = o.toFixed(3);
        const entering = u < (c.a + c.b) / 2;
        c.el.style.setProperty("--dy", `${((1 - o) * (entering ? 22 : -22)).toFixed(1)}px`);
      }
      // headline words rise in once a block is mostly visible, and reset once it has gone
      const want = ready && (c.in ? o > 0.02 : o > 0.4);
      if (want !== c.in) {
        c.in = want;
        c.el.classList.toggle("is-in", want);
      }
    }

    // callouts: a point on the slab, a hairline that draws out, then the label
    if (engine) {
      const ox = canvas.offsetLeft;
      const oy = canvas.offsetTop;
      const phone = W / dpr < 768;
      const k = stacked ? clamp(W / dpr / 1100, 0.42, 0.75) : 1;
      const minY = oy + 14;
      // labels that hang below the slab stop short of the progress bar (or the picture's box when stacked)
      const maxY = stacked ? oy + canvas.clientHeight - 26 : (rail?.offsetTop ?? H / dpr) - 32;
      const vw = stage.clientWidth;
      for (const c of calls) {
        // the film moves faster than a scroll step, so its labels stay up a little longer
        const [wa, wb] = film ? [c.k.win[0] - 0.15, c.k.win[1] + 0.15] : c.k.win;
        const o = ready && (c.k.phone || !phone) ? win(u, wa, wb, film ? 0.15 : 0.2) : 0;
        if (o <= 0.002) {
          if (c.on) {
            c.on = false;
            c.el.style.opacity = "0";
            c.dot.style.opacity = "0";
            c.line.style.opacity = "0";
          }
          continue;
        }
        if (!c.on || !c.w) c.w = c.el.offsetWidth;
        c.on = true;
        const [px, py] = engine.project(c.k.at[0], c.k.at[1]);
        const x = px + ox;
        const y = py + oy;
        const lp = seg(o, 0, 0.65);
        const ty = c.k.dy > 0 ? Math.max(y + 16, Math.min(maxY, y + c.k.dy * k)) : Math.max(minY, y + c.k.dy * k);
        const lx2 = x + c.k.dx * k * lp;
        const ly2 = y + (ty - y) * lp;
        c.dot.style.opacity = `${seg(o, 0, 0.3)}`;
        c.dot.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        c.line.style.opacity = `${o}`;
        c.line.setAttribute("x1", x.toFixed(1));
        c.line.setAttribute("y1", y.toFixed(1));
        c.line.setAttribute("x2", lx2.toFixed(1));
        c.line.setAttribute("y2", ly2.toFixed(1));
        const lo = seg(o, 0.55, 1);
        c.el.style.opacity = `${lo}`;
        const below = c.k.dy > 0;
        // the label hangs off the end of the line, kept inside the screen
        const bx = x + c.k.dx * k;
        const left = Math.max(12, Math.min(vw - 12 - c.w, c.k.dx >= 0 ? bx - 4 : bx + 4 - c.w));
        c.el.style.transform = `translate3d(${left.toFixed(1)}px,${(ty + (below ? 8 : -8) * (1 - lo)).toFixed(1)}px,0) translate(0,${below ? "4px" : "calc(-100% - 2px)"})`;
      }
    }
    // a large, faint chapter numeral
    nums.forEach((n, i) => {
      const w = CHAPTERS[i]!;
      n.style.opacity = `${(win(u, w[0], w[1], 0.15) * 0.07).toFixed(3)}`;
    });

    // the rail: one bar per step, there from the first screen so the four steps are clear,
    // filling as each step plays
    const railO = clamp((now - shownAt - 700) / 900);
    if (rail) rail.style.opacity = railO.toFixed(3);
    let step = 0;
    railItems.forEach((r, i) => {
      r.bar.style.transform = `scaleX(${(film ? seg(u, i, i + 1) : seg(u, i, i + 0.85)).toFixed(3)})`;
      const on = u >= r.w[0] - 0.05 && u <= r.w[1];
      r.el.dataset.on = on ? "1" : "0";
      if (on) step = i + 1;
    });
    // the caption leaving slides up, the next one rises in after it
    if (film) caps.forEach((c, i) => (c.dataset.on = ready && i === step ? "1" : i < step ? "past" : "0"));
  };
  raf = requestAnimationFrame(frame);

  const destroy = () => {
    alive = false;
    cancelAnimationFrame(raf);
    timers.forEach((t) => window.clearTimeout(t));
    io.disconnect();
    ro.disconnect();
    grain.remove();
    window.removeEventListener("pointermove", onMove);
    replay?.removeEventListener("click", onReplay);
    delete section.dataset.film;
    section.style.removeProperty("--aw-cv");
  };
  return {
    release: () => {
      released = true;
      start();
    },
    destroy,
  };
}
