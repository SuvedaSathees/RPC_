/**
 * Two waterproofing methods in the seam (see seam.ts), from RPC's methods
 * document (lib/methods/data.ts): what kind of method each is, how it works
 * and goes on, where it is used, its strength and what to keep in mind, and
 * the products on RPC's list that are that kind of product.
 */
import { METHOD_GROUPS, ZONES, type Method, type MethodGroup } from "../methods/data";
import { fullName } from "../products/compare";
import type { Product } from "../products/types";
import { seamMedia, seamPreview, seamRows, seamVerdict, type SeamRow, type SeamSide } from "./seam";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const groupOf = (g: MethodGroup) => METHOD_GROUPS.find((x) => x.key === g)!;
/** what each kind of method is, in a few words */
const WHAT: Record<MethodGroup, { one: string; both: string }> = {
  coat: { one: "a coating on the surface", both: "Both are coatings on the surface." },
  sheet: { one: "a sheet laid on site", both: "Both are sheets laid on site." },
  concrete: { one: "part of the concrete itself", both: "Both work inside the concrete itself." },
  joint: { one: "a treatment for joints and cracks", both: "Both deal with joints and cracks." },
};
const zoneLabel = (k: string) => ZONES.find((z) => z.key === k)?.label ?? k;
/** each place in a word or two, for sentences ("tanks and basements") */
const ZONE_SAY: Record<string, string> = { roof: "roofs", wet: "wet areas", tank: "tanks", below: "basements", walls: "external walls", deck: "podiums", joint: "construction joints", crack: "cracks" };
const lowerFirst = (s: string) => (/^[A-Z][a-z]/.test(s) ? s[0]!.toLowerCase() + s.slice(1) : s);
const listing = (xs: readonly string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

export const methodSide = (m: Method): SeamSide => ({ kicker: groupOf(m.group).label, name: m.name, sub: m.areas });

export function methodVerdict(a: Method, b: Method) {
  if (a.key === b.key) return { lead: "The same method on both sides. Pick another for B.", more: "" };
  const lead = a.group === b.group ? WHAT[a.group].both : `${a.short}: ${WHAT[a.group].one}. ${b.short}: ${WHAT[b.group].one}.`;
  const both = a.zones.filter((z) => b.zones.includes(z)).map((z) => ZONE_SAY[z] ?? lowerFirst(zoneLabel(z)));
  const more = both.length ? `Both are used for ${listing(both)}.` : "They are used in different places.";
  return { lead, more };
}

function productsCell(m: Method, by: Map<string, Product>) {
  const ps = m.products.map((s) => by.get(s)).filter((p): p is Product => Boolean(p));
  const rel = (m.related ?? []).map((r) => ({ r, p: by.get(r.slug) })).filter((x): x is { r: { slug: string; why: string }; p: Product } => Boolean(x.p));
  const links = ps.map((p) => `<a href="/products#${p.slug}" data-internal>${esc(fullName(p))}</a>`).join("");
  const also = rel.map(({ r, p }) => `<p class="cx-also">Also useful: <a href="/products#${p.slug}" data-internal>${esc(fullName(p))}</a>, ${esc(lowerFirst(r.why))}.</p>`).join("");
  if (!links) return `<p class="cx-note">None on our list for this method.</p>${also}`;
  return `<div class="cx-links">${links}</div>${also}`;
}

export function methodRows(a: Method, b: Method, products: readonly Product[]): SeamRow[] {
  const by = new Map(products.map((p) => [p.slug, p] as const));
  const ga = groupOf(a.group);
  const gb = groupOf(b.group);
  return [
    { t: "text", k: "Kind", a: esc(ga.label), b: esc(gb.label) },
    { t: "text", k: "How it works", a: esc(a.how), b: esc(b.how) },
    { t: "text", k: "Goes on", a: esc(a.applied), b: esc(b.applied) },
    { t: "venn", k: "Used for", a: a.zones.map(zoneLabel), b: b.zones.map(zoneLabel), empty: "No use in common" },
    { t: "text", k: "Its strength", a: esc(a.notes[0]), b: esc(b.notes[0]) },
    { t: "text", k: "Keep in mind", a: esc(a.notes[1]), b: esc(b.notes[1]) },
    { t: "html", k: "Products we supply", a: productsCell(a, by), b: productsCell(b, by) },
  ];
}

export function methodParts(a: Method, b: Method, products: readonly Product[]) {
  const v = methodVerdict(a, b);
  return {
    previewA: seamPreview(methodSide(a)),
    previewB: seamPreview(methodSide(b)),
    subA: a.areas,
    subB: b.areas,
    media: seamMedia({ key: `m-${a.key}`, fallback: "Picture on its way" }, { key: `m-${b.key}`, fallback: "Picture on its way" }, ""),
    verdict: seamVerdict(v.lead, v.more),
    sheet: seamRows(methodRows(a, b, products)),
  };
}
