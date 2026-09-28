import type { Metadata } from "next";
import { CompanyStory, FounderMessage, Values, VisionMission } from "@/components/about/AboutSections";
import { Footer } from "@/components/contact/Footer";
import { Process } from "@/components/process/Process";
import { Stats } from "@/components/stats/Stats";
import { PageHeader } from "@/components/transitions/PageHeader";
import { ArrowLink } from "@/components/ui/Primitives";

export const metadata: Metadata = {
  title: "About Us — Construction Company in Erode, Tamil Nadu",
  description:
    "RPC Constructions is an Erode-based design-and-build construction and waterproofing company founded in 2012. Our story, vision, mission, founder and the values behind every project.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <main id="main">
        <PageHeader
          index="01"
          label="About RPC"
          lines={["Built on", <em key="t">trust.</em>]}
          intro="Founded in Erode in 2012, RPC Constructions unites architectural ambition with structural engineering — for clients who value buildings that last."
          aside={<ArrowLink href="/contact#enquiry" variant="solid">Talk to our team</ArrowLink>}
          image="/stages/06-structural-frame.jpg"
          imageAlt="Reinforced concrete frame of a multi-storey building under construction by RPC Constructions"
          variant="split"
          badge={
            <div className="flex items-center gap-5">
              <div>
                <p className="display text-3xl leading-none">2012</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-paper/60">Founded in Erode</p>
              </div>
              <span className="h-10 w-px bg-white/20" />
              <div>
                <p className="display text-3xl leading-none">Design<em>&amp;</em>Build</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-paper/60">One accountable team</p>
              </div>
            </div>
          }
        />
        <CompanyStory index="02" />
        <VisionMission index="03" />
        <FounderMessage index="04" />
        <Values index="05" />
        <Stats index="06" />
        <Process index="07" />

        <div className="border-t border-ink/15 bg-paper py-12 md:py-20">
          <div className="gutter flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="display text-4xl md:text-5xl">Ready to build something enduring?</p>
              <p className="mt-2 text-sm text-ink-2">Meet our engineers for a first consultation — at our office or on your site.</p>
            </div>
            <ArrowLink href="/contact#enquiry" variant="solid">Start a project</ArrowLink>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
