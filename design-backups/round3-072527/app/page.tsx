import type { Metadata } from "next";
import { Footer } from "@/components/contact/Footer";
import { HomeSections } from "@/components/home3/HomeSections";
import { MonsoonHero } from "@/components/home4/MonsoonHero";
import { brand } from "@/lib/content";
import { PRODUCTS } from "@/lib/products";
import { brandInfo, brandMark } from "@/lib/products/brands";
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

/** the brands for the hero's rail: name, how many products, and its mark's colour (worked out here, so the product list stays on the server) */
const heroBrands = brandInfo(PRODUCTS).map((b) => ({ key: b.key, name: b.name, count: b.count, color: brandMark(b.name) }));

/** what the products section needs: the count, the brands, and the jobs drawn layer by layer, rendered here so the product list stays on the server */
const productsSummary = {
  count: PRODUCTS.length,
  brands: brandInfo(PRODUCTS).map((b) => b.name),
  teaser: homeLayersMarkup(PRODUCTS),
};

/**
 * Home: the monsoon house (a cut-away of a house in the rain: pick a leak, or
 * scroll, and each one is traced and sealed from the terrace down to the
 * sump, with the brands we supply along its foot), then five sections:
 * projects, services, about, the products we supply layer by layer, and the
 * contact close; and the site's own footer.
 */
export default function Home() {
  return (
    <>
      <main id="main" className="relative">
        <MonsoonHero brands={heroBrands} />
        <HomeSections parts={["projects", "services", "about", "products", "contact"]} products={productsSummary} />
      </main>
      <Footer />
    </>
  );
}
