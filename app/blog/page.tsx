import type { Metadata } from "next";
import { Footer } from "@/components/contact/Footer";
import { PageScripts } from "@/components/pages/PageScripts";
import { blogPosts } from "@/lib/blog";
import { contact } from "@/lib/content";
import { BLOG_CSS, blogIndexMarkup } from "@/lib/pages/articles";
import { KIT_CSS } from "@/lib/pages/kit";
import { ldJson, pageMeta, siteUrl } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Waterproofing & Leak Repair Advice",
  description:
    "Guides from RPC Constructions' engineers on terrace, bathroom, sump and basement waterproofing, leak repair and pre-monsoon checks for buildings in Erode and Coimbatore.",
  path: "/blog",
});

const ld = [
  {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "RPC Constructions Blog",
    url: `${siteUrl}/blog`,
    publisher: { "@id": `${siteUrl}/#organization` },
    blogPost: blogPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      url: `${siteUrl}/blog/${p.slug}`,
      datePublished: p.date,
      image: `${siteUrl}/images/og-rpc.png`,
    })),
  },
];

/** Blog: a masthead, topics to narrow the list, the latest article as a dark feature and the rest as cards, then the close */
export default function BlogPage() {
  return (
    <>
      <main id="main" className="pg">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
        <style dangerouslySetInnerHTML={{ __html: KIT_CSS + BLOG_CSS }} />
        <div dangerouslySetInnerHTML={{ __html: blogIndexMarkup({ posts: blogPosts, contact }) }} />
        <PageScripts root="main" kind="blog" />
      </main>
      <Footer />
    </>
  );
}
