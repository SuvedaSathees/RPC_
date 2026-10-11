/**
 * The waterproofing page in the browser:
 *
 *   - "Where is the water getting in?": picking a place (on the drawing or in
 *     the row of names, which also answers the arrow keys) marks it on the
 *     drawing and opens its panel. A link to #a-<place> opens it too.
 *   - a method named elsewhere on the page (or in the address, #m-<key>) is
 *     opened in the list and marked for a moment as the page glides to it (the
 *     glide itself is the pages' shared link handling)
 *   - two methods side by side: the two lists and the swap button; "Compare
 *     with another method" under a method puts it in the comparison, in place
 *     of the one chosen longer ago
 *
 * Without scripts the links still jump, every method still opens, the first
 * place shows, and the comparison shows its first pair.
 */
import type { PageEnv } from "./behaviour";
import { compareRowsHtml, type CmpMethod } from "./methods-compare";

type Off = () => void;

/** "Where is the water getting in?" */
function placeMap(root: HTMLElement, env: PageEnv): Off {
  const map = root.querySelector<HTMLElement>("[data-wpx-map]");
  if (!map) return () => {};
  const tabs = Array.from(map.querySelectorAll<HTMLButtonElement>(".wpx-tab"));
  const keys = tabs.map((t) => t.dataset.place!);
  const spots = Array.from(map.querySelectorAll<HTMLElement>(".wpx-spot"));
  const parts = Array.from(map.querySelectorAll<SVGGElement>(".wpx-part"));
  const panels = Array.from(map.querySelectorAll<HTMLElement>(".wpx-panel"));

  const select = (key: string, focus = false) => {
    if (!keys.includes(key)) return;
    tabs.forEach((t) => {
      const on = t.dataset.place === key;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    spots.forEach((s) => s.classList.toggle("is-on", s.dataset.place === key));
    parts.forEach((p) => p.classList.toggle("is-on", p.dataset.zone === key));
    panels.forEach((p) => (p.hidden = p.id !== `wpx-p-${key}`));
    // on phones the names sit in one sideways row: keep the chosen one in view
    const tab = tabs[keys.indexOf(key)];
    const row = tab?.parentElement;
    if (tab && row && row.scrollWidth > row.clientWidth + 4) {
      const r = row.getBoundingClientRect();
      const t = tab.getBoundingClientRect();
      row.scrollTo({ left: row.scrollLeft + (t.left - r.left) - (r.width - t.width) / 2, behavior: "smooth" });
    }
  };

  const onClick = (e: Event) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-place]");
    if (b && map.contains(b)) select(b.dataset.place!);
  };
  const onKey = (e: KeyboardEvent) => {
    const i = tabs.indexOf(e.target as HTMLButtonElement);
    if (i < 0) return;
    const n = tabs.length;
    const to = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    select(keys[to]!, true);
  };
  map.addEventListener("click", onClick);
  map.addEventListener("keydown", onKey);

  // /waterproofing#a-terrace and the like: open that place and bring the drawing into view
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h.startsWith("a-") || !keys.includes(h.slice(2))) return;
    select(h.slice(2));
    const margin = parseFloat(getComputedStyle(map).scrollMarginTop) || 0;
    const y = map.getBoundingClientRect().top + window.scrollY - margin;
    if (env.scrollTo) env.scrollTo(y);
    else window.scrollTo({ top: y, behavior: "smooth" });
  };
  fromHash();
  window.addEventListener("hashchange", fromHash);
  return () => {
    map.removeEventListener("click", onClick);
    map.removeEventListener("keydown", onKey);
    window.removeEventListener("hashchange", fromHash);
  };
}

/** two methods side by side; `add` puts a method from elsewhere on the page into it */
function compare(root: HTMLElement): { off: Off; add: (key: string) => void } {
  const none = { off: () => {}, add: () => {} };
  const sec = root.querySelector<HTMLElement>("[data-wpx-compare]");
  const json = sec?.querySelector("script[data-wpx-data]")?.textContent;
  const rows = sec?.querySelector<HTMLElement>("[data-cmp-rows]");
  const selA = sec?.querySelector<HTMLSelectElement>('select[data-slot="a"]');
  const selB = sec?.querySelector<HTMLSelectElement>('select[data-slot="b"]');
  if (!sec || !json || !rows || !selA || !selB) return none;
  let data: CmpMethod[] = [];
  try {
    data = JSON.parse(json) as CmpMethod[];
  } catch {
    return none;
  }
  const by = new Map(data.map((m) => [m.key, m]));
  const nameA = sec.querySelector<HTMLElement>('[data-name="a"]');
  const nameB = sec.querySelector<HTMLElement>('[data-name="b"]');
  let a = selA.value;
  let b = selB.value;
  /** the side a method added from elsewhere replaces: the one chosen longer ago */
  let older: "a" | "b" = "b";
  let t = 0;

  /** draw the pair; `fresh` is the side that just changed, outlined for a moment */
  const render = (fresh?: "a" | "b") => {
    const ma = by.get(a);
    const mb = by.get(b);
    if (!ma || !mb) return;
    selA.value = a;
    selB.value = b;
    if (nameA) nameA.textContent = ma.short;
    if (nameB) nameB.textContent = mb.short;
    rows.innerHTML = compareRowsHtml(ma, mb);
    window.clearTimeout(t);
    sec.querySelectorAll(".wpx-pick.is-new").forEach((x) => x.classList.remove("is-new"));
    const box = fresh ? sec.querySelector<HTMLElement>(`[data-pickbox="${fresh}"]`) : null;
    if (box) {
      box.classList.add("is-new");
      t = window.setTimeout(() => box.classList.remove("is-new"), 1800);
    }
  };
  const choose = (side: "a" | "b", key: string) => {
    const other = side === "a" ? b : a;
    // choosing the method already on the other side swaps the two
    if (key === other) [a, b] = [b, a];
    else if (side === "a") a = key;
    else b = key;
    older = side === "a" ? "b" : "a";
    render();
  };
  const add = (key: string) => {
    if (!by.has(key)) return;
    if (key === a || key === b) return render(key === a ? "a" : "b");
    const side = older;
    if (side === "a") a = key;
    else b = key;
    older = side === "a" ? "b" : "a";
    render(side);
  };

  const onChange = (e: Event) => {
    const s = e.target as HTMLSelectElement;
    if (s === selA) choose("a", s.value);
    else if (s === selB) choose("b", s.value);
  };
  const onClick = (e: Event) => {
    if (!(e.target as Element).closest("[data-swap]")) return;
    [a, b] = [b, a];
    older = older === "a" ? "b" : "a";
    render();
  };
  sec.addEventListener("change", onChange);
  sec.addEventListener("click", onClick);
  return {
    off: () => {
      window.clearTimeout(t);
      sec.removeEventListener("change", onChange);
      sec.removeEventListener("click", onClick);
    },
    add,
  };
}

export function mountMethods(root: HTMLElement, env: PageEnv = {}): () => void {
  const cmp = compare(root);
  let t = 0;
  /** open a method's row, and return it */
  const open = (key: string) => {
    const row = root.querySelector<HTMLElement>(`#m-${CSS.escape(key)}`);
    const d = row?.querySelector<HTMLDetailsElement>("details");
    if (d && !d.open) d.open = true;
    return row;
  };
  const flash = (key: string) => {
    const row = open(key);
    if (!row) return;
    window.clearTimeout(t);
    root.querySelectorAll(".wp-row.is-hit").forEach((x) => x.classList.remove("is-hit"));
    row.classList.add("is-hit");
    t = window.setTimeout(() => row.classList.remove("is-hit"), 2200);
  };
  // before the page glides anywhere: open the method a link names, or put one in the comparison
  const onClickFirst = (e: Event) => {
    const el = e.target as Element;
    const go = el.closest<HTMLElement>("[data-m-go]");
    if (go) open(go.dataset.mGo!);
    const add = el.closest<HTMLElement>("[data-cmp-add]");
    if (add) cmp.add(add.dataset.cmpAdd!);
  };
  const onClick = (e: Event) => {
    const go = (e.target as Element).closest<HTMLElement>("[data-m-go]");
    if (go) flash(go.dataset.mGo!);
  };
  root.addEventListener("click", onClickFirst, true);
  root.addEventListener("click", onClick);
  // /waterproofing#m-crystalline and the like
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("m-")) flash(h.slice(2));
  };
  fromHash();
  window.addEventListener("hashchange", fromHash);
  const offs = [placeMap(root, env), cmp.off];
  return () => {
    root.removeEventListener("click", onClickFirst, true);
    root.removeEventListener("click", onClick);
    window.removeEventListener("hashchange", fromHash);
    window.clearTimeout(t);
    offs.forEach((f) => f());
  };
}
