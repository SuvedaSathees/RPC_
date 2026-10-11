/**
 * The products page in the browser: the brand tabs, the search and a brand's
 * families narrow the catalogue; the brand tiles open their brand; the jobs
 * table keeps one job open at a time; and a link to a product, a brand or a
 * job (from this page or another) opens it. Without scripts every brand is
 * listed in full and every job opens on its own.
 */
import type { PageEnv } from "./behaviour";

type Off = () => void;

export function mountProducts(root: HTMLElement, env: PageEnv = {}): Off {
  const offs: Off[] = [];
  const on = (t: EventTarget, type: string, fn: (e: Event) => void, o?: AddEventListenerOptions) => {
    t.addEventListener(type, fn, o);
    offs.push(() => t.removeEventListener(type, fn, o));
  };
  const tools = root.querySelector<HTMLElement>("[data-tools]");
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>(".cb-tab"));
  const panels = Array.from(root.querySelectorAll<HTMLElement>(".cb-brand"));
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".pc"));
  const famBox = root.querySelector<HTMLElement>("[data-fams]");
  const status = root.querySelector<HTMLElement>("[data-status]");
  const empty = root.querySelector<HTMLElement>("[data-empty]");
  const input = root.querySelector<HTMLInputElement>("[data-search]");
  const catalogue = root.querySelector<HTMLElement>("#catalogue");
  const jobsEls = Array.from(root.querySelectorAll<HTMLDetailsElement>("details.jb-row"));
  if (!tabs.length || !panels.length) return () => {};

  if (tools) tools.hidden = false;
  if (famBox) famBox.hidden = false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const panelOf = (c: HTMLElement) => c.closest<HTMLElement>(".cb-brand");
  const famInfo = new Map<string, { label: string; tint: string }>();
  for (const c of cards) {
    const k = c.dataset.family ?? "";
    if (!famInfo.has(k)) famInfo.set(k, { label: c.querySelector(".pc-fam")?.textContent ?? k, tint: c.style.getPropertyValue("--tint") });
  }
  const brandName = (k: string) => tabs.find((t) => t.dataset.tab === k)?.firstChild?.textContent?.trim() ?? k;

  let brand = tabs.find((t) => t.getAttribute("aria-selected") === "true")?.dataset.tab ?? "all";
  let fam = "all";
  let q = "";
  /** brands opened in full; the rest show their first few products and a button for the others */
  const expanded = new Set<string>();
  const narrow = window.matchMedia("(max-width: 599px)");

  const apply = () => {
    tabs.forEach((t) => {
      const yes = t.dataset.tab === brand;
      t.setAttribute("aria-selected", String(yes));
      t.tabIndex = yes ? 0 : -1;
    });
    const scope = cards.filter((c) => brand === "all" || panelOf(c)?.dataset.brand === brand);
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const hit = (c: HTMLElement) => words.every((w) => (c.dataset.q ?? "").includes(w));
    const matched = scope.filter(hit);
    // the families of what is in view, for the chips
    const counts = new Map<string, number>();
    for (const c of matched) counts.set(c.dataset.family ?? "", (counts.get(c.dataset.family ?? "") ?? 0) + 1);
    if (fam !== "all" && !counts.has(fam)) fam = "all";
    const shown = matched.filter((c) => fam === "all" || c.dataset.family === fam);
    cards.forEach((c) => (c.hidden = !shown.includes(c)));
    panels.forEach((p) => (p.hidden = !shown.some((c) => p.contains(c))));
    // with no search or family chosen, a long brand shows its first few products and a button for the rest
    const cap = narrow.matches ? 6 : 12;
    for (const p of panels) {
      const more = p.querySelector<HTMLElement>("[data-more]");
      const mine = shown.filter((c) => p.contains(c));
      const capped = !q && fam === "all" && !expanded.has(p.dataset.brand ?? "") && mine.length > cap;
      if (capped) mine.slice(cap).forEach((c) => (c.hidden = true));
      if (more) more.hidden = !capped;
    }
    if (famBox) {
      const chips = [`<button type="button" class="cb-fam" data-fam="all" aria-pressed="${fam === "all"}">All <span>${matched.length}</span></button>`];
      for (const [k, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
        const f = famInfo.get(k);
        chips.push(`<button type="button" class="cb-fam" data-fam="${k}" aria-pressed="${fam === k}"><i style="background:${f?.tint ?? "#888"}"></i>${f?.label ?? k} <span>${n}</span></button>`);
      }
      famBox.innerHTML = counts.size > 1 ? chips.join("") : "";
    }
    if (empty) empty.hidden = shown.length > 0;
    if (status) {
      const where = brand === "all" ? "" : ` from ${brandName(brand)}`;
      const what = fam === "all" ? "" : ` in ${famInfo.get(fam)?.label.toLowerCase() ?? fam}`;
      status.textContent = q ? `${shown.length} ${shown.length === 1 ? "product matches" : "products match"} “${q}”${where}${what}.` : fam !== "all" ? `Showing ${shown.length}${what}${where}.` : "";
    }
  };

  const toCatalogue = () => {
    if (!catalogue) return;
    const y = catalogue.getBoundingClientRect().top + window.scrollY - 24;
    if (env.scrollTo) env.scrollTo(y);
    else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  };
  const toEl = (el: HTMLElement, gap = 120) => {
    const y = el.getBoundingClientRect().top + window.scrollY - gap;
    if (env.scrollTo) env.scrollTo(y);
    else window.scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  };
  const pickBrand = (k: string, scroll: boolean, full = false) => {
    brand = k;
    if (full) expanded.add(k);
    fam = "all";
    q = "";
    if (input) input.value = "";
    apply();
    history.replaceState(history.state, "", k === "all" ? location.pathname + location.search : `#brand-${k}`);
    if (scroll) toCatalogue();
  };
  const openJob = (k: string, scroll: boolean) => {
    const d = jobsEls.find((x) => x.dataset.job === k);
    if (!d) return;
    d.open = true;
    if (scroll) requestAnimationFrame(() => toEl(d, 100));
  };
  const showProduct = (slug: string) => {
    const c = cards.find((x) => x.id === slug);
    if (!c) return;
    brand = panelOf(c)?.dataset.brand ?? "all";
    expanded.add(brand);
    fam = "all";
    q = "";
    if (input) input.value = "";
    apply();
    requestAnimationFrame(() => {
      toEl(c, 150);
      c.classList.remove("is-hit");
      void c.offsetWidth;
      c.classList.add("is-hit");
    });
  };

  // tabs: click, and the arrow keys along the row
  tabs.forEach((t, i) => {
    on(t, "click", () => pickBrand(t.dataset.tab!, false));
    on(t, "keydown", (e) => {
      const k = (e as KeyboardEvent).key;
      const n = k === "ArrowRight" ? 1 : k === "ArrowLeft" ? -1 : 0;
      if (!n) return;
      e.preventDefault();
      const next = tabs[(i + n + tabs.length) % tabs.length]!;
      next.focus();
      pickBrand(next.dataset.tab!, false);
    });
  });
  if (input)
    on(input, "input", () => {
      q = input.value.trim();
      if (q && brand !== "all") brand = "all";
      apply();
    });
  on(root, "click", (e) => {
    const t = e.target as Element;
    const chip = t.closest<HTMLButtonElement>(".cb-fam");
    if (chip) {
      fam = chip.dataset.fam ?? "all";
      apply();
      return;
    }
    if (t.closest("[data-clear]")) {
      pickBrand(brand, false);
      return;
    }
    const more = t.closest<HTMLElement>("[data-more]");
    if (more) {
      const k = panelOf(more)?.dataset.brand;
      if (k) expanded.add(k);
      apply();
      return;
    }
    const go = t.closest<HTMLElement>("[data-brand-go]");
    if (go) {
      e.preventDefault();
      pickBrand(go.dataset.brandGo!, true, true);
      return;
    }
    const job = t.closest<HTMLElement>("[data-job-go]");
    if (job) {
      e.preventDefault();
      openJob(job.dataset.jobGo!, true);
      history.replaceState(history.state, "", `#job-${job.dataset.jobGo}`);
      return;
    }
    const prod = t.closest<HTMLElement>("[data-product-go]");
    if (prod) {
      e.preventDefault();
      showProduct(prod.dataset.productGo!);
      history.replaceState(history.state, "", `#${prod.dataset.productGo}`);
    }
  }, { capture: true });

  // one job open at a time
  jobsEls.forEach((d) =>
    on(d, "toggle", () => {
      if (d.open) jobsEls.forEach((x) => x !== d && (x.open = false));
    }),
  );

  // a product, a brand or a job in the address
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    if (h.startsWith("brand-") && tabs.some((t) => t.dataset.tab === h.slice(6))) pickBrand(h.slice(6), true);
    else if (h.startsWith("job-")) openJob(h.slice(4), true);
    else if (cards.some((c) => c.id === h)) showProduct(h);
  };
  on(window, "hashchange", fromHash);
  on(narrow, "change", apply);

  apply();
  fromHash();
  return () => offs.forEach((f) => f());
}
