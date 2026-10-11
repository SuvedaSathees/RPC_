import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/contact/Footer";
import { PageScripts } from "@/components/pages/PageScripts";
import { blogPosts, getPost } from "@/lib/blog";
import { contact } from "@/lib/content";
import { BLOG_CSS, BLOG_TRAIL, postMarkup } from "@/lib/pages/articles";
import { KIT_CSS } from "@/lib/pages/kit";
import { breadcrumbLd, ldJson, siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const title = `${post.title} | RPC Constructions`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      locale: "en_IN",
      siteName: "RPC Constructions",
      url: `/blog/${post.slug}`,
      title,
      description: post.excerpt,
      images: [{ url: "/images/og-rpc.png", width: 1200, height: 630, alt: "RPC Constructions: waterproofing and construction in Erode, Coimbatore and across Tamil Nadu" }],
      publishedTime: post.date,
      authors: [post.author],
      section: post.category,
    },
    twitter: { card: "summary_large_image", title, description: post.excerpt, images: ["/images/og-rpc.png"] },
  };
}

/** An article: title, cover, the text with its contents and a call to action beside it, then related reading */
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const url = `${siteUrl}/blog/${post.slug}`;
  const ld = [
    breadcrumbLd([...BLOG_TRAIL, { name: post.title, href: `/blog/${post.slug}` }]),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: `${siteUrl}/images/og-rpc.png`,
      datePublished: post.date,
      dateModified: post.date,
      articleSection: post.category,
      author: { "@type": "Organization", name: post.author, url: siteUrl },
      publisher: { "@id": `${siteUrl}/#organization` },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
    },
  ];

  return (
    <>
      <main id="main" className="pg">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
        <style dangerouslySetInnerHTML={{ __html: KIT_CSS + BLOG_CSS }} />
        <div dangerouslySetInnerHTML={{ __html: postMarkup({ post, related, contact }) }} />
        <PageScripts root="main" kind="post" />
      </main>
      <Footer />
    </>
  );
}
