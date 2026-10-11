/**
 * The inner pages' behaviour in the browser, one small piece per page:
 *   services  (arrival motion only)
 *   projects  a status or a town narrows the showcase; each project rises into
 *             place and opens into a full view (also from /projects#slug)
 *   about     (arrival motion only)
 *   contact   the enquiry form, and whether the office is open right now
 *   blog      topics narrow the list
 *   post      a reading-progress line along the top
 *   products  brand tabs, search and families; the jobs compared across brands (products-behaviour.ts)
 *   methods   a method named on a place's tile is marked once the page reaches it (methods-behaviour.ts)
 * The last two load only on their own pages.
 * Every piece is optional: without scripts the pages read fully.
 */
import { mountContactForm } from "./contact-form";

export type PageKind = "services" | "projects" | "about" | "contact" | "blog" | "post" | "products" | "methods";
export interface PageEnv {
  /** smooth-scroll to a position (the site's scroller when there is one) */
  scrollTo?: (y: number) => void;
  /** hold the page still behind something laid over it (and let it go again) */
  lock?: (on: boolean) => void;
}
type Off = () => void;

const listen = <K extends keyof WindowEventMap>(t: Window | HTMLElement | MediaQueryList, type: K | string, fn: (e: Event) => void, opts?: AddEventListenerOptions): Off => {
  t.addEventListener(type, fn, opts);
  return () => t.removeEventListener(type, fn, opts);
};
/** run `fn` at most once a frame on scroll and resize */
function onFrame(fn: () => void): Off {
  let raf = 0;
  const tick = () => {
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        fn();
      });
  };
  const offs = [listen(window, "scroll", tick, { passive: true }), listen(window, "resize", tick)];
  fn();
  return () => {
    cancelAnimationFrame(raf);
    offs.forEach((f) => f());
  };
}

/* every page: things marked data-rv arrive as they come into view; data-rv-stagger on a parent spaces its children out */
function motion(root: HTMLElement): Off {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-rv]"));
  if (!els.length || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  root.querySelectorAll<HTMLElement>("[data-rv-stagger]").forEach((g) => {
    const step = Number(g.dataset.rvStagger) || 90;
    Array.from(g.children)
      .filter((c): c is HTMLElement => c instanceof HTMLElement && c.hasAttribute("data-rv"))
      .forEach((c, i) => c.style.setProperty("--rvd", `${i * step}ms`));
  });
  els.forEach((e) => e.classList.add("rv-pending"));
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries)
        if (en.isIntersecting) {
          en.target.classList.remove("rv-pending");
          io.unobserve(en.target);
        }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  els.forEach((e) => io.observe(e));
  return () => {
    io.disconnect();
    els.forEach((e) => e.classList.remove("rv-pending"));
  };
}

/* projects: chips narrow the deck by status and town; the boards stack as the page scrolls; each opens into a full view */
const STATUS_WORDS: Record<string, (n: number) => string> = {
  Completed: (n) => `${n} completed ${n === 1 ? "project" : "projects"}`,
  "Under construction": (n) => `${n} ${n === 1 ? "project" : "projects"} under construction`,
  "In design": (n) => `${n} ${n === 1 ? "project" : "projects"} in design`,
};
function projects(root: HTMLElement, env: PageEnv): Off {
  const list = root.querySelector<HTMLElement>(".pj-deck");
  if (!list) return () => {};
  const offs: Off[] = [];
  const items = Array.from(list.querySelectorAll<HTMLElement>(".pj-board"));
  const tools = root.querySelector<HTMLElement>(".pj-tools");
  const statusBtns = Array.from(root.querySelectorAll<HTMLButtonElement>(".pj-tools button[data-status]"));
  const townBtns = Array.from(root.querySelectorAll<HTMLButtonElement>(".pj-tools button[data-town]"));
  const showing = root.querySelector<HTMLElement>(".pj-showing");
  const empty = root.querySelector<HTMLElement>(".pj-empty");
  const dialogs = new Map(Array.from(root.querySelectorAll<HTMLDialogElement>("dialog[data-dlg]")).map((d) => [d.dataset.dlg!, d] as const));

  // with scripts, the filters and the ways into the full view appear
  if (tools) tools.hidden = false;
  root.querySelectorAll<HTMLElement>(".pj-zoom,.pj-view").forEach((b) => (b.hidden = false));
  // on phones the chips scroll sideways: fade the edge that has more, and bring a chosen chip into view
  const edges = () => {
    if (!tools) return;
    const more = tools.scrollWidth - tools.clientWidth - tools.scrollLeft;
    tools.classList.toggle("fade-l", tools.scrollLeft > 4);
    tools.classList.toggle("fade-r", more > 4);
  };
  const reveal = (el: HTMLElement | null) => {
    if (!tools || !el || tools.scrollWidth <= tools.clientWidth) return;
    const t = tools.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.left < t.left + 24) tools.scrollBy({ left: r.left - t.left - 24, behavior: "smooth" });
    else if (r.right > t.right - 24) tools.scrollBy({ left: r.right - t.right + 24, behavior: "smooth" });
  };
  if (tools) offs.push(listen(tools, "scroll", edges, { passive: true }), listen(window, "resize", edges));
  edges();

  // the boards stack as the page scrolls: each one held a little lower than the last, and one being covered eases back.
  // A board too tall for the screen would hide its own foot while held, so it scrolls normally instead.
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fit = () => {
    const room = window.innerHeight - 110 - 14 * items.length;
    items.forEach((it) => it.classList.toggle("is-tall", it.offsetHeight > room));
  };
  const settle = () => {
    const shown = items.filter((it) => !it.hidden);
    const cover = shown.map((it, i) => {
      const next = shown[i + 1];
      if (!next || it.classList.contains("is-tall") || getComputedStyle(it).position !== "sticky") return 0;
      const top = it.getBoundingClientRect().top;
      const h = it.offsetHeight;
      return Math.min(1, Math.max(0, (top + h - next.getBoundingClientRect().top) / Math.max(1, h - 14)));
    });
    let depth = 0;
    for (let i = shown.length - 1; i >= 0; i--) {
      depth = i === shown.length - 1 ? 0 : cover[i]! + depth;
      shown[i]!.style.setProperty("--depth", depth.toFixed(3));
    }
  };
  fit();
  offs.push(listen(window, "resize", fit));
  if (!still) offs.push(onFrame(settle));

  // filters: a status, a town, or both
  let status = "all";
  let town: string | null = null;
  const fits = (it: HTMLElement, st: string, tw: string | null) => (st === "all" || it.dataset.status === st) && (!tw || it.dataset.town === tw);
  const apply = () => {
    const shown = items.filter((it) => fits(it, status, town));
    items.forEach((it) => (it.hidden = !shown.includes(it)));
    // the boards held in the stack step down through what is shown
    shown.forEach((it, i) => it.style.setProperty("--i", String(i)));
    // each chip counts what it would show alongside the other choice
    for (const b of statusBtns) {
      const k = b.dataset.status!;
      const n = items.filter((it) => fits(it, k, town)).length;
      const c = b.querySelector("span");
      if (c) c.textContent = String(n);
      b.classList.toggle("is-zero", n === 0);
      b.setAttribute("aria-pressed", String(k === status));
    }
    for (const b of townBtns) {
      const k = b.dataset.town!;
      const n = items.filter((it) => fits(it, status, k)).length;
      const c = b.querySelector("span");
      if (c) c.textContent = String(n);
      b.classList.toggle("is-zero", n === 0);
      b.setAttribute("aria-pressed", String(k === town));
    }
    if (empty) empty.hidden = shown.length > 0;
    edges();
    if (!still) settle();
    if (showing) {
      const n = shown.length;
      const what = status === "all" ? `${n} ${n === 1 ? "project" : "projects"}` : (STATUS_WORDS[status]?.(n) ?? `${n} ${status.toLowerCase()}`);
      showing.textContent = status === "all" && !town ? `Showing all ${n} projects` : `Showing ${what}${town ? ` in ${town}` : ""}`;
    }
  };

  // the full view; its photo starts loading once a project is pointed at, and the neighbours' once it opens
  const warm = (slug?: string) => {
    if (slug) dialogs.get(slug)?.querySelectorAll<HTMLImageElement>("img[loading='lazy']").forEach((i) => (i.loading = "eager"));
  };
  for (const it of items) offs.push(listen(it, "pointerenter", () => warm(it.id)), listen(it, "focusin", () => warm(it.id)));
  let current: string | null = null;
  let opener: HTMLElement | null = null;
  const order = () => {
    const shown = items.filter((it) => !it.hidden).map((it) => it.id);
    return current && shown.includes(current) ? shown : items.map((it) => it.id);
  };
  const show = (slug: string) => {
    const d = dialogs.get(slug);
    if (!d) return;
    current = slug;
    const ids = order();
    const k = ids.indexOf(slug);
    const pos = d.querySelector<HTMLElement>("[data-pos]");
    if (pos) pos.textContent = `${k + 1} of ${ids.length}`;
    [slug, ids[(k + 1) % ids.length], ids[(k - 1 + ids.length) % ids.length]].forEach(warm);
    d.querySelectorAll<HTMLButtonElement>("[data-go]").forEach((b) => (b.disabled = ids.length < 2));
    if (!d.open) d.showModal();
    d.scrollTop = 0;
    env.lock?.(true);
    history.replaceState(history.state, "", `#${slug}`);
  };
  const open = (slug: string, from: HTMLElement | null) => {
    if (!dialogs.has(slug)) return;
    if (!current) opener = from;
    show(slug);
  };
  // previous / next, through the projects the filters show
  const step = (dir: 1 | -1, fromButton: boolean) => {
    const d = current ? dialogs.get(current) : undefined;
    if (!current || !d?.open) return;
    const ids = order();
    const next = ids[(ids.indexOf(current) + dir + ids.length) % ids.length]!;
    const nd = dialogs.get(next);
    if (!nd || next === current) return;
    current = next;
    d.close();
    nd.classList.add("is-step");
    show(next);
    // a pressed button keeps the focus in the same place; the arrow keys leave it where the view puts it
    if (fromButton) nd.querySelector<HTMLElement>(`[data-go="${dir}"]`)?.focus();
  };
  // once a view is closed: let the page move again, tidy the address, and hand the focus back
  const finish = (slug: string) => {
    if (current !== slug) return; // stepping to another project, or already done
    current = null;
    env.lock?.(false);
    history.replaceState(history.state, "", window.location.pathname + window.location.search);
    opener?.focus({ preventScroll: true });
    opener = null;
  };
  for (const [slug, d] of dialogs) {
    offs.push(
      // the close event arrives a frame later; a late one for a view that is open again (stepped back to, or remounted by React in development) changes nothing
      listen(d, "close", () => {
        if (d.open) return;
        d.classList.remove("is-step");
        finish(slug);
      }),
      // Esc, or the phone's back gesture
      listen(d, "cancel", () => {
        setTimeout(() => {
          if (!d.open) finish(slug);
        }, 0);
      }),
      listen(d, "click", (e) => {
        const t = e.target as HTMLElement;
        if (t === d || t.closest("[data-close]")) {
          d.close();
          finish(slug);
          return;
        }
        const go = t.closest<HTMLElement>("[data-go]");
        if (go) step(go.dataset.go === "-1" ? -1 : 1, true);
      }),
    );
  }

  // one listener for every choice on the page, ahead of the page's own link handling
  offs.push(
    listen(
      root,
      "click",
      (e) => {
        const t = e.target as Element;
        const st = t.closest<HTMLButtonElement>(".pj-tools button[data-status]");
        if (st) {
          status = st.dataset.status!;
          apply();
          reveal(st);
          return;
        }
        const tw = t.closest<HTMLButtonElement>(".pj-tools button[data-town]");
        if (tw) {
          town = town === tw.dataset.town ? null : tw.dataset.town!;
          apply();
          reveal(tw);
          return;
        }
        if (t.closest("[data-reset]")) {
          status = "all";
          town = null;
          apply();
          return;
        }
        const op = t.closest<HTMLElement>("[data-open]");
        if (op && !op.closest("dialog")) {
          e.preventDefault();
          open(op.dataset.open!, op);
        }
      },
      { capture: true },
    ),
  );

  // the arrow keys step through the projects while one is open, wherever the focus is
  offs.push(
    listen(window, "keydown", (e) => {
      const k = (e as KeyboardEvent).key;
      if (!current || (k !== "ArrowLeft" && k !== "ArrowRight")) return;
      e.preventDefault();
      step(k === "ArrowLeft" ? -1 : 1, false);
    }),
  );

  // a project in the address opens it: on arrival (the home page links so), or when only the hash changes
  const fromHash = () => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    if (!current && dialogs.has(slug)) open(slug, document.getElementById(slug)?.querySelector<HTMLElement>(".pj-view") ?? null);
  };
  offs.push(listen(window, "hashchange", fromHash));
  fromHash();

  return () => {
    offs.forEach((f) => f());
    if (current) {
      const d = dialogs.get(current);
      current = null;
      d?.close();
      env.lock?.(false);
    }
  };
}

/* contact: whether the office is open right now (India time) */
const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const clock = (h: number, m: number) => `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
function openNow(root: HTMLElement): Off {
  const el = root.querySelector<HTMLElement>("[data-hours]");
  const text = el?.querySelector<HTMLElement>("[data-open-text]");
  if (!el || !text) return () => {};
  const [d0 = 1, d1 = 6] = (el.dataset.days ?? "1-6").split("-").map(Number);
  const [fh = 8, fm = 30] = (el.dataset.from ?? "08:30").split(":").map(Number);
  const [th = 18, tm = 30] = (el.dataset.to ?? "18:30").split(":").map(Number);
  const isDay = (d: number) => d >= d0 && d <= d1;
  const render = () => {
    const now = new Date();
    const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
    const day = ist.getDay();
    const mins = ist.getHours() * 60 + ist.getMinutes();
    const from = fh * 60 + fm;
    const to = th * 60 + tm;
    const open = isDay(day) && mins >= from && mins < to;
    el.dataset.state = open ? "open" : "closed";
    if (open) {
      text.textContent = `Open now, until ${clock(th, tm)}`;
      return;
    }
    let next = "";
    if (isDay(day) && mins < from) next = "today";
    else {
      for (let k = 1; k <= 7; k++) {
        const d = (day + k) % 7;
        if (isDay(d)) {
          next = k === 1 ? "tomorrow" : DAY[d]!;
          break;
        }
      }
    }
    text.textContent = `Closed now, opens ${next} at ${clock(fh, fm)}`;
  };
  render();
  const id = window.setInterval(render, 60000);
  return () => window.clearInterval(id);
}

/* blog: topics narrow the list */
function blog(root: HTMLElement): Off {
  const bar = root.querySelector<HTMLElement>(".bl-topics");
  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-cat]"));
  const status = root.querySelector<HTMLElement>("[data-topic-status]");
  const empty = root.querySelector<HTMLElement>(".bl-empty");
  if (!bar || !items.length) return () => {};
  return listen(root, "click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-topic]");
    if (!b) return;
    const topic = b.dataset.topic!;
    bar.querySelectorAll<HTMLButtonElement>("button[data-topic]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.topic === topic)));
    let shown = 0;
    for (const it of items) {
      const on = topic === "All" || it.dataset.cat === topic;
      it.hidden = !on;
      if (on) shown++;
    }
    if (empty) empty.hidden = shown > 0;
    if (status) status.textContent = topic === "All" ? `Showing all ${shown} articles` : `Showing ${shown} ${shown === 1 ? "article" : "articles"} about ${topic.toLowerCase()}`;
  });
}

/* article: how far through the text you are, and which part of it the contents list should mark */
function post(root: HTMLElement): Off {
  const bar = root.querySelector<HTMLElement>(".po-progress i");
  const body = root.querySelector<HTMLElement>(".po-body");
  if (!bar || !body) return () => {};
  const offs: Off[] = [
    onFrame(() => {
      const r = body.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / Math.max(1, r.height - window.innerHeight * 0.3)));
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
    }),
  ];
  const links = new Map(Array.from(root.querySelectorAll<HTMLAnchorElement>(".po-toc a")).map((a) => [a.getAttribute("href")!.slice(1), a] as const));
  const secs = Array.from(body.querySelectorAll<HTMLElement>("[data-sec]"));
  if (links.size && secs.length && "IntersectionObserver" in window) {
    const mark = (id: string) => links.forEach((a, k) => (k === id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) mark(en.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    secs.forEach((x) => io.observe(x));
    offs.push(() => io.disconnect());
  }
  return () => offs.forEach((f) => f());
}

export function mountPageBehaviour(kind: PageKind, root: HTMLElement, env: PageEnv = {}): Off {
  const offs: Off[] = [];
  if (kind === "projects") offs.push(projects(root, env));
  if (kind === "contact") offs.push(mountContactForm(root), openNow(root));
  if (kind === "blog") offs.push(blog(root));
  if (kind === "post") offs.push(post(root));
  if (kind === "products" || kind === "methods") {
    let off: Off = () => {};
    let gone = false;
    const load = kind === "products" ? import("./products-behaviour").then((m) => m.mountProducts) : import("./methods-behaviour").then((m) => m.mountMethods);
    void load.then((mount) => {
      if (!gone) off = mount(root, env);
    });
    offs.push(() => {
      gone = true;
      off();
    });
  }
  offs.push(motion(root));
  return () => offs.forEach((f) => f());
}
