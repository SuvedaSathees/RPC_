import type { Metadata } from "next";
import { About } from "@/components/about/About";
import { FinalCTA } from "@/components/contact/FinalCTA";
import { Footer } from "@/components/contact/Footer";
import { Exploded } from "@/components/exploded/Exploded";
import { Hero } from "@/components/hero/Hero";
import { Manifesto } from "@/components/intro/Manifesto";
import { ProjectsShowcase } from "@/components/projects/ProjectsShowcase";
import { Services } from "@/components/services/Services";
import { Stats } from "@/components/stats/Stats";
import { Preloader } from "@/components/transitions/Preloader";
import { Marquee } from "@/components/ui/Marquee";
import { Waterproofing } from "@/components/waterproofing/Waterproofing";
import { services } from "@/lib/content";

/**
 * The previous home page, kept for comparison: one continuous film, the
 * scroll-scrubbed construction footage in the hero, then photographic sections.
 * Not indexed; the home page is "/".
 */
export const metadata: Metadata = {
  title: "Home — classic",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function HomeClassic() {
  return (
    <>
      <Preloader />
      <main id="main" className="relative">
        <Hero />
        <Manifesto />
        <div className="relative z-10 hidden bg-paper md:block">
          <Marquee items={services.map((s) => s.title)} />
        </div>
        <ProjectsShowcase />
        <Exploded />
        <Waterproofing />
        <Services index="05" />
        <About index="06" />
        <Stats index="07" />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
