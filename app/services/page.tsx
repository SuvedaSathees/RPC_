import type { Metadata } from "next";
import { Footer } from "@/components/contact/Footer";
import { ServicesDirectory } from "@/components/services/ServicesDirectory";
import { TechnicalCapabilities } from "@/components/services/TechnicalCapabilities";
import { PageHeader } from "@/components/transitions/PageHeader";
import { ArrowLink } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "Services — Waterproofing, Residential, Commercial & Industrial Construction",
  description:
    "Land-to-roof waterproofing, leak repair and turnkey residential, commercial and industrial construction, interiors and project management in Erode, Coimbatore and across Tamil Nadu.",
  alternates: { canonical: "/services" },
  openGraph: { url: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <main id="main" className="bg-paper">
        <PageHeader
          variant="plain"
          index="03"
          label="Services"
          lines={["What we", <em key="b">build.</em>]}
          intro="From soil test and structural design to finishes and handover — six disciplines delivered by one accountable team."
          aside={<ArrowLink href="/contact#enquiry" variant="solid">Get a consultation</ArrowLink>}
          facts={[
            ["Disciplines", "06"],
            ["Delivery", "Turnkey"],
            ["Standards", "IS codes"],
            ["Region", "Tamil Nadu"],
          ]}
        />
        <ServicesDirectory />
        <div className="h-16 md:h-24" />
        <TechnicalCapabilities index="04" />

        <div className="bg-paper py-12 md:py-20">
          <div className="gutter flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="display text-4xl md:text-5xl">Have a project brief ready?</p>
              <p className="mt-2 text-sm text-ink-2">Discuss scope, budget and programme with our engineers.</p>
            </div>
            <ArrowLink href="/contact" variant="solid">Talk to RPC</ArrowLink>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
