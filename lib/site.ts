/**
 * Production URL — used for canonical links, the sitemap and structured data.
 * Set NEXT_PUBLIC_SITE_URL in the hosting environment if the domain differs.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.rpcconstructions.com").replace(/\/$/, "");
