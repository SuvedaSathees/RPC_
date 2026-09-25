import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/navigation/Nav";
import { QualityProvider } from "@/components/providers/QualityProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { brand, contact } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const serif = localFont({
  src: [
    { path: "../public/fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument",
  display: "swap",
});
const sans = localFont({
  src: "../public/fonts/inter-tight-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter-tight",
  display: "swap",
});
const mono = localFont({
  src: "../public/fonts/geist-mono-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
  display: "swap",
});

const description =
  "RPC Constructions is a design-and-build construction company in Erode, Tamil Nadu — residential, commercial and industrial construction, renovation, interiors and project management since 2012.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RPC Constructions — Building Contractors in Erode, Tamil Nadu",
    template: `%s | ${brand.name}`,
  },
  description,
  applicationName: brand.name,
  keywords: [
    "construction company in Erode",
    "building contractors Erode",
    "civil contractors Tamil Nadu",
    "turnkey house construction",
    "commercial construction Coimbatore",
    "industrial shed construction Perundurai",
    "design and build contractor",
    "RPC Constructions",
  ],
  authors: [{ name: brand.name, url: siteUrl }],
  creator: brand.name,
  publisher: brand.name,
  category: "construction",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: brand.name,
    title: "RPC Constructions — Building what lasts",
    description,
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "A completed RPC Constructions building at dusk" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RPC Constructions — Building what lasts",
    description,
    images: ["/images/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: { icon: "/logo.png", apple: "/logo.png" },
  formatDetection: { telephone: true, email: true, address: true },
  // PLACEHOLDER — paste the Google Search Console verification token here
  // verification: { google: "..." },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  "@id": `${siteUrl}/#organization`,
  name: brand.name,
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  image: `${siteUrl}/images/og.jpg`,
  description,
  foundingDate: "2012",
  email: contact.email,
  telephone: contact.phone.replace(/\s/g, ""),
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "142 Perundurai Road",
    addressLocality: "Erode",
    addressRegion: "Tamil Nadu",
    postalCode: "638011",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: contact.geo.lat, longitude: contact.geo.lng },
  areaServed: contact.regions.map((r) => ({ "@type": "City", name: r })),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:30",
      closes: "18:30",
    },
  ],
  sameAs: contact.socials.map((s) => s.href).filter((h) => h.startsWith("http")),
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: brand.name,
  inLanguage: "en-IN",
  publisher: { "@id": `${siteUrl}/#organization` },
};

export const viewport: Viewport = {
  themeColor: "#eeeae3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationLd, websiteLd]) }} />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <QualityProvider>
          <SmoothScroll>
            <Nav />
            {children}
          </SmoothScroll>
        </QualityProvider>
      </body>
    </html>
  );
}
