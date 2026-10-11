/**
 * The methods page in the browser: the pickers and the swap redraw the
 * comparison; pressing a method's card puts it in as B; choosing a place marks
 * the methods worth considering there and offers to compare the first two;
 * the address keeps the pair (#vs=a,b), and #m-<key> opens one method.
 */
import { methodParts } from "../compare/methods-seam";
import { copyLink, films, reveal, settle } from "../compare/seam-behaviour";
import { METHODS, PLACES, type Method } from "../methods/data";
import { PRODUCTS } from "../products";
import type { PageEnv } from "./behaviour";

type Off = () => void;
const byKey = (k: string) => METHODS.find((m) => m.key === k);
/** a second method for one that arrives alone: the next of its own kind, else the first of another */
const partner = (m: Method) => METHODS.find((x) => x.group === m.group && x.key !== m.key) ?? METHODS.find((x) => x.key !== m.key)!;
/** each method as it reads mid-sentence */
const SAY: Record<string, string> = {
  cementitious: "cementitious",
  "liquid-membrane": "liquid membrane",
  polyurethane: "polyurethane",
  bituminous: "bituminous",
  "torch-on": "APP/SBS torch-on",
  hdpe: "HDPE sheet",
  crystalline: "crystalline",
  acrylic: "acrylic elastomeric",
  polyurea: "polyurea",
  injection: "injection grouting",
  integral: "integral admixtures",
  waterstops: "waterstops",
};
const say = (m: Method) => SAY[m.key] ?? m.short;
const listing = (xs: readonly string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

export function mountMethods(root: HTMLElement, env: PageEnv = {}): Off {
  const offs: Off[] = [];
  const on = (el: EventTarget, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions | boolean) => {
    el.addEventListener(type, fn, opts);
    offs.push(() => el.removeEventListener(type, fn, opts));
  };
  const cx = root.querySelector<HTMLElement>('[data-cx="methods"]');
  if (!cx) return () => {};
  const selA = cx.querySelector<HTMLSelectElement>('select[data-side="a"]')!;
  const selB = cx.querySelector<HTMLSelectElement>('select[data-side="b"]')!;
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".wm-card"));
  const film = films(cx);
  offs.push(film.off);
  let a = byKey(cx.dataset.a ?? "") ?? METHODS[0]!;
  let b = byKey(cx.dataset.b ?? "") ?? METHODS[1]!;

  const mark = () =>
    cards.forEach((c) => {
      const k = c.dataset.m;
      const ab = c.querySelector<HTMLElement>("[data-ab]");
      const side = k === a.key ? "a" : k === b.key ? "b" : "";
      if (side) c.dataset.in = side;
      else delete c.dataset.in;
      if (ab) ab.textContent = side.toUpperCase();
    });
  const draw = (opts: { hash?: boolean } = {}) => {
    const p = methodParts(a, b, PRODUCTS);
    selA.value = a.key;
    selB.value = b.key;
    cx.dataset.a = a.key;
    cx.dataset.b = b.key;
    const set = (sel: string, html: string) => {
      const el = cx.querySelector<HTMLElement>(sel);
      if (el) el.innerHTML = html;
    };
    set('[data-pv="a"]', p.previewA);
    set('[data-pv="b"]', p.previewB);
    const sa = cx.querySelector<HTMLElement>('[data-sub="a"]');
    const sb = cx.querySelector<HTMLElement>('[data-sub="b"]');
    if (sa) sa.textContent = p.subA;
    if (sb) sb.textContent = p.subB;
    set("[data-media]", p.media);
    set("[data-verdict]", p.verdict);
    set("[data-sheet]", p.sheet);
    film.refresh();
    settle(cx);
    mark();
    if (opts.hash !== false) history.replaceState(history.state, "", `#vs=${a.key},${b.key}`);
  };
  const choose = (na: Method, nb: Method, show = true) => {
    a = na;
    b = nb;
    draw();
    if (show) reveal(cx, env.scrollTo);
  };
  mark();

  on(selA, "change", () => {
    const m = byKey(selA.value);
    if (m) {
      a = m;
      draw();
    }
  });
  on(selB, "change", () => {
    const m = byKey(selB.value);
    if (m) {
      b = m;
      draw();
    }
  });
  const swapBtn = cx.querySelector<HTMLButtonElement>("[data-swap]");
  if (swapBtn)
    on(swapBtn, "click", () => {
      swapBtn.classList.toggle("is-turning");
      [a, b] = [b, a];
      draw();
    });
  const share = cx.querySelector<HTMLButtonElement>("[data-share]");
  if (share)
    on(share, "click", () => {
      void copyLink(`${location.origin}${location.pathname}#vs=${a.key},${b.key}`, share.querySelector("[data-share-label]"));
    });

  // a method's card goes in as B (if it is already A, the two swap)
  on(root, "click", (e) => {
    const pick = (e.target as HTMLElement).closest<HTMLElement>("[data-pick]");
    if (!pick) return;
    const m = byKey(pick.dataset.pick ?? "");
    if (!m) return;
    if (m.key === a.key) choose(b, a);
    else if (m.key === b.key) reveal(cx, env.scrollTo);
    else choose(a, m);
  });

  // where is the water getting in?
  const place = root.querySelector<HTMLSelectElement>("[data-place]");
  const board = root.querySelector<HTMLElement>("[data-board]");
  const status = root.querySelector<HTMLElement>("[data-status]");
  const tryBtn = root.querySelector<HTMLButtonElement>("[data-try]");
  let suggested: Method[] = [];
  if (place && board)
    on(place, "change", () => {
      const pl = PLACES.find((p) => p.key === place.value);
      if (!pl) {
        board.classList.remove("is-filtered");
        cards.forEach((c) => c.classList.remove("is-fit"));
        if (status) status.textContent = "All twelve methods are shown.";
        if (tryBtn) tryBtn.hidden = true;
        return;
      }
      suggested = pl.methods.map((n) => METHODS.find((m) => m.no === n)).filter((m): m is Method => Boolean(m));
      const where = pl.label.toLowerCase();
      if (!suggested.length) {
        board.classList.remove("is-filtered");
        cards.forEach((c) => c.classList.remove("is-fit"));
        if (status) status.textContent = `Our methods guide does not name a method for ${where}. Ask us about it.`;
        if (tryBtn) tryBtn.hidden = true;
        return;
      }
      board.classList.add("is-filtered");
      cards.forEach((c) => c.classList.toggle("is-fit", suggested.some((m) => m.key === c.dataset.m)));
      const names = suggested.map(say);
      if (status)
        status.textContent =
          suggested.length === 1
            ? `For ${where}, our methods guide names ${names[0]}.`
            : `For ${where}, our methods guide names ${suggested.length} methods: ${listing(names)}.`;
      if (tryBtn) {
        tryBtn.hidden = suggested.length < 2;
        if (suggested.length >= 2) tryBtn.textContent = `Compare ${say(suggested[0]!)} and ${say(suggested[1]!)}`;
      }
    });
  if (tryBtn)
    on(tryBtn, "click", () => {
      if (suggested.length >= 2) choose(suggested[0]!, suggested[1]!);
    });

  // #vs=a,b opens a pair; #m-<key> opens a method against another of its kind
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("vs=")) {
      const [x, y] = h.slice(3).split(",").map((s) => byKey(s));
      if (x && y && (x.key !== a.key || y.key !== b.key)) {
        a = x;
        b = y;
        draw({ hash: false });
        window.setTimeout(() => reveal(cx, env.scrollTo), 80);
      }
    } else if (h.startsWith("m-")) {
      const m = byKey(h.slice(2));
      if (m) {
        a = m;
        b = partner(m);
        draw();
        window.setTimeout(() => reveal(cx, env.scrollTo), 80);
      }
    }
  };
  fromHash();
  on(window, "hashchange", fromHash);
  // links to a method on this page (the table's names) open it in the comparison
  on(
    root,
    "click",
    (e) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#m-"]');
      if (!link) return;
      const m = byKey((link.getAttribute("href") ?? "").slice(3));
      if (!m) return;
      e.preventDefault();
      e.stopPropagation();
      if (m.key === a.key || m.key === b.key) reveal(cx, env.scrollTo);
      else choose(a, m);
    },
    true,
  );
  return () => offs.forEach((f) => f());
}
