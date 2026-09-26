import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock, Lightbulb, MessageCircle, Phone } from "lucide-react";
import { PostCard } from "@/components/blog/BlogCards";
import { Footer } from "@/components/contact/Footer";
import { blogPosts, formatDate, getPost } from "@/lib/blog";
import { contact } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", url: `/blog/${post.slug}`, title: post.title, description: post.excerpt, images: [post.cover], publishedTime: post.date },
  };
}

const anchor = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const toc = post.sections.filter((s) => s.heading).map((s) => s.heading!);
  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${siteUrl}${post.cover}`,
    datePublished: post.date,
    author: { "@type": "Organization", name: "RPC Constructions" },
    publisher: { "@type": "Organization", name: "RPC Constructions", logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` } },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <>
      <main id="main" className="bg-paper">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

        <article className="gutter pb-16 pt-24 md:pb-24 md:pt-32">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="mx-auto flex max-w-5xl items-center gap-2 text-[12.5px] text-mute">
            <Link href="/blog" className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 font-medium text-ink ring-1 ring-ink/10 transition-colors hover:bg-ink hover:text-paper">
              <ArrowLeft size={13} /> Blog
            </Link>
            <span aria-hidden>/</span>
            <span>{post.category}</span>
          </nav>

          {/* cover with the title set on it */}
          <header className="relative mx-auto mt-4 max-w-5xl overflow-hidden rounded-2xl bg-night text-paper md:mt-5">
            <div className="relative aspect-[4/5] sm:aspect-[16/10] md:aspect-[21/10]">
              <Image src={post.cover} alt={post.coverAlt} fill priority sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0b111c] via-[#0b111c]/55 to-[#0b111c]/5" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-10">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#7da2f0]" /> {post.category}
              </p>
              <h1 className="display mt-3 max-w-3xl leading-[1.02] md:mt-4" style={{ fontSize: "clamp(2rem, 4.6vw, 4.25rem)" }}>
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-paper/75 md:mt-6">
                <span className="inline-flex items-center gap-2 font-medium text-paper">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white">
                    <Image src="/images/logo.png" alt="" width={20} height={20} className="h-5 w-5 object-contain" />
                  </span>
                  {post.author}
                </span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span className="inline-flex items-center gap-1"><Clock size={12} /> {post.readMinutes} min read</span>
              </div>
            </div>
          </header>

          {/* standfirst */}
          <p className="mx-auto mt-8 max-w-5xl border-l-2 border-rpc pl-4 text-[16px] leading-relaxed text-ink md:mt-12 md:pl-6 md:text-xl md:leading-relaxed">
            <span className="block max-w-3xl">{post.excerpt}</span>
          </p>

          {/* body + sidebar */}
          <div className="mx-auto mt-8 grid max-w-5xl gap-10 md:mt-10 lg:grid-cols-[1fr_17rem] lg:gap-14">
            <div className="min-w-0 max-w-3xl">
              {post.sections.map((s, i) => (
                <section key={i} id={s.heading ? anchor(s.heading) : undefined} className="scroll-mt-28 [&+&]:mt-8">
                  {s.heading && <h2 className="display text-2xl leading-tight md:text-3xl">{s.heading}</h2>}
                  {s.paragraphs?.map((p) => (
                    <p key={p} className="mt-3 text-[15.5px] leading-[1.75] text-ink-2 md:text-[17px]">{p}</p>
                  ))}
                  {s.list && (
                    <ul className="mt-4 space-y-2.5">
                      {s.list.map((li) => (
                        <li key={li} className="flex gap-3 text-[15px] leading-relaxed text-ink-2 md:text-[16.5px]">
                          <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-rpc" />
                          {li}
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.tip && (
                    <p className="mt-5 flex gap-3 rounded-xl bg-rpc/[0.07] p-4 text-[14px] leading-relaxed text-ink ring-1 ring-rpc/15">
                      <Lightbulb size={18} className="mt-0.5 shrink-0 text-rpc" />
                      {s.tip}
                    </p>
                  )}
                </section>
              ))}
              <p className="mt-10 text-[12px] leading-relaxed text-mute">
                This article is general guidance. Every site is different — speak to a qualified engineer before making decisions about your project.
              </p>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              {toc.length > 1 && (
                <nav aria-label="In this article" className="mb-5 hidden lg:block">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">In this article</p>
                  <ul className="mt-3 space-y-2 border-l border-ink/10 pl-4 text-[13.5px]">
                    {toc.map((h) => (
                      <li key={h}>
                        <a href={`#${anchor(h)}`} className="text-ink-2 hover:text-ink">{h}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <div className="rounded-2xl bg-night p-5 text-paper md:p-6">
                <p className="display text-2xl leading-tight">Planning a project?</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-paper/70">Talk to an RPC engineer — free first consultation at our office or on your site.</p>
                <Link href="/contact#enquiry" className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-paper text-[13.5px] font-semibold text-ink">
                  Start a project <ArrowUpRight size={14} />
                </Link>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-white/10 text-[12.5px]">
                    <Phone size={13} /> Call
                  </a>
                  <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-white/10 text-[12.5px]">
                    <MessageCircle size={13} /> WhatsApp
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {/* related */}
        <section aria-label="More articles" className="gutter border-t border-ink/10 py-12 md:py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="display text-3xl md:text-4xl">More from the <em>blog.</em></h2>
            <Link href="/blog" className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-ink-2 hover:text-ink">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
            {related.map((p, i) => (
              <li key={p.slug} className={`h-full ${i === 2 ? "hidden md:block" : ""}`}>
                <PostCard post={p} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
