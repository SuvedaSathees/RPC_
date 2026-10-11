import type { Metadata } from "next";
import { Footer } from "@/components/contact/Footer";
import { PageScripts } from "@/components/pages/PageScripts";
import { contact } from "@/lib/content";
import { METHODS } from "@/lib/methods/data";
import { KIT_CSS } from "@/lib/pages/kit";
import { METHODS_PAGE_CSS, methodsPageMarkup } from "@/lib/pages/methods";
import { PRODUCTS } from "@/lib/products";
import { ldJson, pageMeta, siteUrl } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "12 Waterproofing Methods Compared | Erode & Coimbatore",
  description:
    "Cementitious, liquid membrane, PU, bituminous, APP/SBS torch-on, HDPE, crystalline, acrylic, polyurea, injection grouting, integral admixtures and waterstops: where each works, and which suits your terrace, bathroom, tank or basement.",
  path: "/waterproofing",
});

const ld = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `${siteUrl}/waterproofing`,
    name: "Twelve waterproofing methods compared",
    about: { "@id": `${siteUrl}/#organization` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: METHODS.length,
      itemListElement: METHODS.map((m) => ({ "@type": "ListItem", position: m.no, name: m.name, description: m.how, url: `${siteUrl}/waterproofing#m-${m.key}` })),
    },
  },
];

/** Waterproofing: where the water gets in (a drawing of a house), the twelve methods in their four kinds, any two compared, twelve more places, the brands, and the close */
export default function WaterproofingPage() {
  return (
    <>
      <main id="main" className="pg">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
        <style dangerouslySetInnerHTML={{ __html: KIT_CSS + METHODS_PAGE_CSS }} />
        <div dangerouslySetInnerHTML={{ __html: methodsPageMarkup({ products: PRODUCTS, contact }) }} />
        <PageScripts root="main" kind="methods" />
      </main>
      <Footer />
    </>
  );
}
