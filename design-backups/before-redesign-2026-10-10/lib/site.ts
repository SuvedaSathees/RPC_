import type { Metadata } from "next";

/**
 * Production URL — used for canonical links, the sitemap and structured data.
 * Set NEXT_PUBLIC_SITE_URL in the hosting environment if the domain differs.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.rpcconstructions.com").replace(/\/$/, "");

const BRAND = "RPC Constructions";
const DEFAULT_IMAGE = { url: "/images/og.jpg", width: 1200, height: 630, alt: "A completed RPC Constructions building at dusk" };

/**
 * An inner page's search title, snippet, canonical link and share card. The
 * layout's title template adds " | RPC Constructions" to `title`; the share
 * card is given whole, because a page's openGraph replaces the layout's.
 */
export function pageMeta(p: { title: string; description: string; path: string; image?: string; imageAlt?: string }): Metadata {
  const full = `${p.title} | ${BRAND}`;
  const image = p.image ? { url: p.image, alt: p.imageAlt ?? "" } : DEFAULT_IMAGE;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.path },
    openGraph: { type: "website", locale: "en_IN", siteName: BRAND, url: p.path, title: full, description: p.description, images: [image] },
    twitter: { card: "summary_large_image", title: full, description: p.description, images: [image.url] },
  };
}

/** BreadcrumbList structured data for a trail such as Home › Services */
export function breadcrumbLd(trail: readonly { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: `${siteUrl}${t.href === "/" ? "/" : t.href}` })),
  };
}

/** a JSON-LD script's contents, safe to put inside <script> */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
