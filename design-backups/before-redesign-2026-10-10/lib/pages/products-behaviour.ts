/**
 * The products page in the browser: the two pickers and the swap redraw the
 * comparison; a ready-made pair or a product's "Compare" button puts it in;
 * the address keeps the pair (#vs=a,b) so it can be shared; a link to
 * #<slug> opens that product against a sensible partner. Below, the list's
 * search, family and brand filters.
 */
import { productParts } from "../compare/products-seam";
import { copyLink, films, reveal, settle } from "../compare/seam-behaviour";
import { PRODUCTS, productBySlug, type Product } from "../products";
import { partnerFor } from "../products/compare";
import type { PageEnv } from "./behaviour";

type Off = () => void;

export function mountProducts(root: HTMLElement, env: PageEnv = {}): Off {
  const offs: Off[] = [];
  const on = (el: EventTarget, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions | boolean) => {
    el.addEventListener(type, fn, opts);
    offs.push(() => el.removeEventListener(type, fn, opts));
  };
  const cx = root.querySelector<HTMLElement>('[data-cx="products"]');
  if (cx) offs.push(compare(root, cx, env, on));
  offs.push(list(root, on));
  return () => offs.forEach((f) => f());
}

type On = (el: EventTarget, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions | boolean) => void;

function compare(root: HTMLElement, cx: HTMLElement, env: PageEnv, on: On): Off {
  const wa = cx.dataset.wa ?? "";
  const selA = cx.querySelector<HTMLSelectElement>('select[data-side="a"]')!;
  const selB = cx.querySelector<HTMLSelectElement>('select[data-side="b"]')!;
  const film = films(cx);
  let a = productBySlug(cx.dataset.a ?? "") ?? PRODUCTS[0]!;
  let b = productBySlug(cx.dataset.b ?? "") ?? PRODUCTS[1]!;

  const draw = (opts: { hash?: boolean } = {}) => {
    const p = productParts(a, b, wa);
    selA.value = a.slug;
    selB.value = b.slug;
    cx.dataset.a = a.slug;
    cx.dataset.b = b.slug;
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
    cx.querySelector<HTMLAnchorElement>("[data-both]")?.setAttribute("href", p.both);
    film.refresh();
    settle(cx);
    if (opts.hash !== false) history.replaceState(history.state, "", `#vs=${a.slug},${b.slug}`);
  };
  const choose = (na: Product, nb: Product, show = true) => {
    a = na;
    b = nb;
    draw();
    if (show) reveal(cx, env.scrollTo);
  };

  on(selA, "change", () => {
    const p = productBySlug(selA.value);
    if (p) {
      a = p;
      draw();
    }
  });
  on(selB, "change", () => {
    const p = productBySlug(selB.value);
    if (p) {
      b = p;
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
      const url = `${location.origin}${location.pathname}#vs=${a.slug},${b.slug}`;
      void copyLink(url, share.querySelector("[data-share-label]"));
    });

  // ready-made pairs, and "Compare" in the list (it goes in as B; if it is already A, the two swap)
  on(root, "click", (e) => {
    const el = e.target as HTMLElement;
    const pair = el.closest<HTMLElement>("[data-pair]");
    if (pair) {
      const [x, y] = (pair.dataset.pair ?? "").split(",").map((s) => productBySlug(s));
      if (x && y) choose(x, y);
      return;
    }
    const cmp = el.closest<HTMLElement>("[data-cmp]");
    if (cmp) {
      const p = productBySlug(cmp.dataset.cmp ?? "");
      if (!p) return;
      if (p.slug === a.slug) choose(b, a);
      else if (p.slug === b.slug) reveal(cx, env.scrollTo);
      else choose(a, p);
    }
  });

  // #vs=a,b opens a pair; #<slug> opens a product against a sensible partner
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    if (h.startsWith("vs=")) {
      const [x, y] = h.slice(3).split(",").map((s) => productBySlug(s));
      if (x && y && (x.slug !== a.slug || y.slug !== b.slug)) {
        a = x;
        b = y;
        draw({ hash: false });
        window.setTimeout(() => reveal(cx, env.scrollTo), 80);
      }
      return;
    }
    const p = productBySlug(h);
    if (p) {
      a = p;
      b = partnerFor(p, PRODUCTS);
      draw();
      window.setTimeout(() => reveal(cx, env.scrollTo), 80);
    }
  };
  fromHash();
  on(window, "hashchange", fromHash);
  // links to a product on this page (#slug) open it in the comparison rather than jumping to its row
  on(
    root,
    "click",
    (e) => {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const slug = decodeURIComponent((link.getAttribute("href") ?? "").slice(1));
      const p = productBySlug(slug);
      if (!p) return;
      e.preventDefault();
      e.stopPropagation();
      choose(p, partnerFor(p, PRODUCTS));
    },
    true,
  );
  return () => film.off();
}

/* ------------------------------------------------------------ the list */

function list(root: HTMLElement, on: On): Off {
  const tools = root.querySelector<HTMLElement>("[data-tools]");
  if (!tools) return () => {};
  const rows = Array.from(root.querySelectorAll<HTMLElement>(".pr-row"));
  const groups = Array.from(root.querySelectorAll<HTMLElement>(".pr-group"));
  const chips = Array.from(tools.querySelectorAll<HTMLButtonElement>("[data-fam]"));
  const search = tools.querySelector<HTMLInputElement>("[data-search]");
  const brandSel = tools.querySelector<HTMLSelectElement>("[data-brandsel]");
  const status = root.querySelector<HTMLElement>("[data-status]");
  const empty = root.querySelector<HTMLElement>("[data-empty]");
  let fam = "all";
  let timer = 0;

  const apply = () => {
    const words = (search?.value ?? "").toLowerCase().trim().split(/\s+/).filter(Boolean);
    const brand = brandSel?.value ?? "all";
    let shown = 0;
    for (const r of rows) {
      const ok = (fam === "all" || r.dataset.family === fam) && (brand === "all" || r.dataset.brand === brand) && words.every((w) => (r.dataset.q ?? "").includes(w));
      r.hidden = !ok;
      if (ok) shown++;
    }
    for (const g of groups) {
      const n = g.querySelectorAll(".pr-row:not([hidden])").length;
      g.hidden = n === 0;
      const c = g.querySelector<HTMLElement>("[data-gcount]");
      if (c) c.textContent = `${n} ${n === 1 ? "product" : "products"}`;
    }
    if (empty) empty.hidden = shown > 0;
    if (status) status.textContent = shown === rows.length ? `Showing all ${rows.length} products.` : `Showing ${shown} of ${rows.length} products.`;
  };
  chips.forEach((c) =>
    on(c, "click", () => {
      fam = c.dataset.fam ?? "all";
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      apply();
    }),
  );
  if (search)
    on(search, "input", () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(apply, 120);
    });
  if (brandSel) on(brandSel, "change", apply);
  const clear = root.querySelector<HTMLElement>("[data-clear]");
  if (clear)
    on(clear, "click", (e) => {
      e.preventDefault();
      if (search) search.value = "";
      if (brandSel) brandSel.value = "all";
      fam = "all";
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.fam === "all")));
      apply();
    });
  return () => window.clearTimeout(timer);
}
