/**
 * The waterproofing page in the browser:
 *
 *   - "Where is the water getting in?": picking a place (on the drawing or in
 *     the row of names, which also answers the arrow keys) marks it on the
 *     drawing and opens its panel. A link to #a-<place> opens it too.
 *   - the twelve methods can be narrowed to one kind
 *   - two methods side by side: the two lists, the swap button, and the
 *     methods in the "at a glance" table, which join the comparison in place of
 *     the one chosen longer ago
 *   - a method named elsewhere on the page is marked for a moment once the page
 *     has glided to it (the glide itself is the pages' shared link handling)
 *
 * Without scripts the links still jump, the first place shows, and the
 * comparison shows its first pair.
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

/** one kind of method at a time; returns "show them all again" for the page's other links */
function methodFilter(root: HTMLElement): { off: Off; showAll: () => void } {
  const bar = root.querySelector<HTMLElement>("[data-wpx-filter]");
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".wp-m[data-group]"));
  if (!bar || !cards.length) return { off: () => {}, showAll: () => {} };
  const chips = Array.from(bar.querySelectorAll<HTMLButtonElement>("[data-filter]"));
  const list = cards[0]!.parentElement;
  const apply = (g: string) => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === g)));
    cards.forEach((c) => (c.hidden = g !== "all" && c.dataset.group !== g));
    if (list && list.scrollWidth > list.clientWidth) list.scrollTo({ left: 0 });
  };
  const onClick = (e: Event) => {
    const c = (e.target as Element).closest<HTMLButtonElement>("[data-filter]");
    if (c) apply(c.dataset.filter!);
  };
  bar.hidden = false;
  bar.addEventListener("click", onClick);
  return {
    off: () => {
      bar.removeEventListener("click", onClick);
      apply("all");
      bar.hidden = true;
    },
    showAll: () => apply("all"),
  };
}

/** two methods side by side, and the table of all twelve */
function compare(root: HTMLElement, env: PageEnv): Off {
  const sec = root.querySelector<HTMLElement>("[data-wpx-compare]");
  const json = sec?.querySelector("script[data-wpx-data]")?.textContent;
  const rows = sec?.querySelector<HTMLElement>("[data-cmp-rows]");
  const selA = sec?.querySelector<HTMLSelectElement>('select[data-slot="a"]');
  const selB = sec?.querySelector<HTMLSelectElement>('select[data-slot="b"]');
  if (!sec || !json || !rows || !selA || !selB) return () => {};
  let data: CmpMethod[] = [];
  try {
    data = JSON.parse(json) as CmpMethod[];
  } catch {
    return () => {};
  }
  const by = new Map(data.map((m) => [m.key, m]));
  const table = sec.querySelector<HTMLElement>("[data-cmp]");
  const picks = Array.from(sec.querySelectorAll<HTMLButtonElement>("[data-pick]"));
  const nameA = sec.querySelector<HTMLElement>('[data-name="a"]');
  const nameB = sec.querySelector<HTMLElement>('[data-name="b"]');
  let a = selA.value;
  let b = selB.value;
  /** the side a method picked from the table replaces: the one chosen longer ago */
  let older: "a" | "b" = "b";

  const render = () => {
    const ma = by.get(a);
    const mb = by.get(b);
    if (!ma || !mb) return;
    selA.value = a;
    selB.value = b;
    if (nameA) nameA.textContent = ma.short;
    if (nameB) nameB.textContent = mb.short;
    rows.innerHTML = compareRowsHtml(ma, mb);
    picks.forEach((p) => {
      const k = p.dataset.pick!;
      p.setAttribute("aria-pressed", String(k === a || k === b));
      const tr = p.closest("tr");
      tr?.classList.toggle("is-a", k === a);
      tr?.classList.toggle("is-b", k === b);
    });
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

  const onChange = (e: Event) => {
    const s = e.target as HTMLSelectElement;
    if (s === selA) choose("a", s.value);
    else if (s === selB) choose("b", s.value);
  };
  const onClick = (e: Event) => {
    const t = e.target as Element;
    if (t.closest("[data-swap]")) {
      [a, b] = [b, a];
      older = older === "a" ? "b" : "a";
      render();
      return;
    }
    const p = t.closest<HTMLButtonElement>("[data-pick]");
    if (!p) return;
    const key = p.dataset.pick!;
    if (key !== a && key !== b) choose(older, key);
    // bring the comparison into view if it is off the screen
    if (table) {
      const r = table.getBoundingClientRect();
      const bar = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-bar")) || 80;
      if (r.top < bar || r.top > window.innerHeight * 0.6) {
        const y = r.top + window.scrollY - bar - 16;
        if (env.scrollTo) env.scrollTo(y);
        else window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  // the table of all twelve: the column under the pointer is shaded
  const gtable = sec.querySelector<HTMLTableElement>(".wpx-gtable");
  let col = -1;
  const shade = (i: number) => {
    if (!gtable || i === col) return;
    col = i;
    gtable.querySelectorAll(".is-col").forEach((c) => c.classList.remove("is-col"));
    if (i < 1) return;
    Array.from(gtable.rows).forEach((r) => r.cells[i]?.classList.add("is-col"));
  };
  const onOver = (e: Event) => {
    const cell = (e.target as Element).closest<HTMLTableCellElement>("td, th");
    shade(cell && gtable?.contains(cell) ? cell.cellIndex : -1);
  };
  const onLeave = () => shade(-1);

  sec.addEventListener("change", onChange);
  sec.addEventListener("click", onClick);
  gtable?.addEventListener("pointerover", onOver);
  gtable?.addEventListener("pointerleave", onLeave);
  return () => {
    sec.removeEventListener("change", onChange);
    sec.removeEventListener("click", onClick);
    gtable?.removeEventListener("pointerover", onOver);
    gtable?.removeEventListener("pointerleave", onLeave);
  };
}

export function mountMethods(root: HTMLElement, env: PageEnv = {}): () => void {
  const filter = methodFilter(root);
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
  // before the page glides to a method, make sure it is not filtered out of sight
  const onClickFirst = (e: Event) => {
    const a = (e.target as Element).closest<HTMLElement>("[data-m-go]");
    if (!a) return;
    const card = root.querySelector<HTMLElement>(`#m-${CSS.escape(a.dataset.mGo!)}`);
    if (card?.hidden) filter.showAll();
  };
  const onClick = (e: Event) => {
    const a = (e.target as Element).closest<HTMLElement>("[data-m-go]");
    if (a) flash(a.dataset.mGo!);
  };
  root.addEventListener("click", onClickFirst, true);
  root.addEventListener("click", onClick);
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("m-")) flash(h.slice(2));
  };
  fromHash();
  const offs = [placeMap(root, env), compare(root, env), filter.off];
  return () => {
    root.removeEventListener("click", onClickFirst, true);
    root.removeEventListener("click", onClick);
    window.clearTimeout(t);
    offs.forEach((f) => f());
  };
}
