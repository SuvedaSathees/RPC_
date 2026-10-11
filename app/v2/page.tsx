import type { Metadata } from "next";
import { About } from "@/components/about/About";
import { FinalCTA } from "@/components/contact/FinalCTA";
import { Footer } from "@/components/contact/Footer";
import { DropStory } from "@/components/home2/DropStory";
import { MethodsIndex } from "@/components/home2/MethodsIndex";
import { ProjectsShowcase } from "@/components/projects/ProjectsShowcase";
import { Services } from "@/components/services/Services";
import { Stats } from "@/components/stats/Stats";

/**
 * Sample of a new home page: the drop story as the hero, then all twelve
 * waterproofing methods, then the existing sections. Not indexed until it
 * replaces "/".
 */
export const metadata: Metadata = {
  title: "Home — new sample",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function HomeSample() {
  return (
    <>
      <main id="main" className="relative">
        <DropStory />
        <MethodsIndex />
        <ProjectsShowcase />
        <Services index="03" />
        <About index="04" />
        <Stats index="05" />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
