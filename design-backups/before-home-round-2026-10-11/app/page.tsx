import type { Metadata } from "next";
import { Footer } from "@/components/contact/Footer";
import { HomeSections } from "@/components/home3/HomeSections";
import { MonsoonHero } from "@/components/home4/MonsoonHero";
import { MethodsIndex } from "@/components/home2/MethodsIndex";
import { Stats } from "@/components/stats/Stats";
import { brand } from "@/lib/content";
import { PRODUCTS } from "@/lib/products";
import { brandInfo } from "@/lib/products/brands";
import { homeLayersMarkup } from "@/lib/products/home";

const title = "Waterproofing Contractors in Erode & Coimbatore | RPC Constructions";
const description =
  "Terrace, bathroom, sump and basement waterproofing in Erode and Coimbatore, plus leak repair and leak-free new homes, offices and factories. Free site inspection.";

/** the home page's own search title and snippet (the layout's stay as the site defaults) */
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: brand.name,
    title,
    description,
    images: [{ url: "/images/og-rpc.png", width: 1200, height: 630, alt: "RPC Constructions: waterproofing and construction in Erode, Coimbatore and across Tamil Nadu" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/og-rpc.png"] },
};

/** what the products section needs: the count, the brands, and the jobs drawn layer by layer, rendered here so the product list stays on the server */
const productsSummary = {
  count: PRODUCTS.length,
  brands: brandInfo(PRODUCTS).map((b) => b.name),
  teaser: homeLayersMarkup(PRODUCTS),
};

/**
 * Home: the monsoon house (a cut-away of a house in the rain: pick a leak, or
 * scroll, and each one is traced and sealed from the terrace down to the
 * sump), the twelve waterproofing methods, then projects, services and about,
 * the products we supply layer by layer (pick a job and see what goes on, in
 * order, and which products do each layer); the site's own performance-record
 * band; the contact close; and the site's own footer.
 */
export default function Home() {
  return (
    <>
      <main id="main" className="relative">
        <MonsoonHero />
        <MethodsIndex serif art />
        <HomeSections parts={["projects", "services", "about", "products"]} products={productsSummary} />
        <Stats index="06" />
        <HomeSections parts={["contact"]} styles={false} />
      </main>
      <Footer />
    </>
  );
}
