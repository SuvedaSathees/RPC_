import type { Metadata } from "next";
import { Footer } from "@/components/contact/Footer";
import { PageScripts } from "@/components/pages/PageScripts";
import { contact, engagementModels, services } from "@/lib/content";
import { KIT_CSS, serviceSlug } from "@/lib/pages/kit";
import { SERVICES_CSS, SERVICES_TRAIL, servicesPageMarkup } from "@/lib/pages/services";
import { breadcrumbLd, ldJson, pageMeta, siteUrl } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Waterproofing & Building Services in Erode",
  description:
    "Terrace, bathroom, sump and basement waterproofing, leak repair, turnkey homes, commercial and industrial buildings, interiors and project management in Erode and Coimbatore.",
  path: "/services",
  image: "/film/wp-final.jpg",
  imageAlt: "A house with its terraces, bathrooms, sump and pool highlighted where they are waterproofed",
});

const ld = [
  breadcrumbLd(SERVICES_TRAIL),
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Construction and waterproofing services by RPC Constructions",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.body,
        url: `${siteUrl}/services#${serviceSlug(s.title)}`,
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: contact.regions.map((r) => ({ "@type": "City", name: r })),
      },
    })),
  },
];

/** Services: the opening with an index of the seven, waterproofing as a dark feature, the other six as cards, the three ways to work with RPC, and the close */
export default function ServicesPage() {
  return (
    <>
      <main id="main" className="pg">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
        <style dangerouslySetInnerHTML={{ __html: KIT_CSS + SERVICES_CSS }} />
        <div dangerouslySetInnerHTML={{ __html: servicesPageMarkup({ services, engagement: engagementModels, contact }) }} />
        <PageScripts root="main" kind="services" />
      </main>
      <Footer />
    </>
  );
}
