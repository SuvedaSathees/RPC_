import type { Metadata } from "next";
import { Footer } from "@/components/contact/Footer";
import { PageScripts } from "@/components/pages/PageScripts";
import { company, contact, principles, process } from "@/lib/content";
import { ABOUT_CSS, ABOUT_TRAIL, aboutBottomMarkup, aboutTopMarkup, type AboutData } from "@/lib/pages/about";
import { KIT_CSS } from "@/lib/pages/kit";
import { breadcrumbLd, ldJson, pageMeta, siteUrl } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "About Us – Waterproofing & Construction, Erode",
  description:
    "Founded in Erode in 2012, RPC Constructions waterproofs and builds homes, offices and factories across Coimbatore, Tiruppur, Salem and Chennai. See how we work.",
  path: "/about",
  image: "/images/waterproofing/terrace-slab-cutaway.jpg",
  imageAlt: "Cutaway of a terrace slab showing its waterproofing layers and a rainwater outlet",
});

const DATA: AboutData = { story: company.story, vision: company.vision, mission: company.mission, principles, process, contact };

const ld = [
  breadcrumbLd(ABOUT_TRAIL),
  { "@context": "https://schema.org", "@type": "AboutPage", url: `${siteUrl}/about`, name: "About RPC Constructions", about: { "@id": `${siteUrl}/#organization` } },
];

/** About: who we are with three photographs, the story, vision and commitments, the six values, how we waterproof in six steps, and the close */
export default function AboutPage() {
  return (
    <>
      <main id="main" className="pg">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
        <style dangerouslySetInnerHTML={{ __html: KIT_CSS + ABOUT_CSS }} />
        <div dangerouslySetInnerHTML={{ __html: aboutTopMarkup(DATA) + aboutBottomMarkup(DATA) }} />
        <PageScripts root="main" kind="about" />
      </main>
      <Footer />
    </>
  );
}
