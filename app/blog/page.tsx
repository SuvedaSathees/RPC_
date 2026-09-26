import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/BlogCards";
import { Footer } from "@/components/contact/Footer";
import { PageHeader } from "@/components/transitions/PageHeader";
import { blogPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog — Construction Advice for Homes, Offices & Factories in Tamil Nadu",
  description:
    "Practical advice from RPC Constructions' engineers on planning, budgeting, foundations, waterproofing and industrial buildings in Erode and across Tamil Nadu.",
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog" },
};

const blogLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "RPC Constructions Blog",
  url: `${siteUrl}/blog`,
  blogPost: blogPosts.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    url: `${siteUrl}/blog/${p.slug}`,
    datePublished: p.date,
    image: `${siteUrl}${p.cover}`,
  })),
};

export default function BlogPage() {
  return (
    <>
      <main id="main" className="bg-paper">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }} />
        <PageHeader
          index="05"
          label="Blog"
          variant="plain"
          lines={["Notes from", <em key="s">the site.</em>]}
          intro="Practical advice from our engineers on planning, building and looking after homes, offices and factories in Tamil Nadu."
        />
        <BlogIndex />
      </main>
      <Footer />
    </>
  );
}
