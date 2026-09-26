import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/projects`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...blogPosts.map((p) => ({ url: `${siteUrl}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: "yearly" as const, priority: 0.6 })),
  ];
}
