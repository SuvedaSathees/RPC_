import type { Metadata } from "next";
import { Footer } from "@/components/contact/Footer";
import { PageHeader } from "@/components/transitions/PageHeader";
import { ProjectsDirectory } from "@/components/projects/ProjectsDirectory";
import { ArrowLink } from "@/components/ui/Primitives";
import { projects } from "@/lib/content";

export const metadata: Metadata = {
  title: "Projects — Residential, Commercial & Industrial Construction in Tamil Nadu",
  description:
    "Selected construction projects by RPC Constructions across Erode, Coimbatore, Perundurai and Chennai — apartments, villas, office buildings, factories and mixed-use developments.",
  alternates: { canonical: "/projects" },
  openGraph: { url: "/projects", images: ["/images/project-01.jpg"] },
};

export default function ProjectsPage() {
  const cities = new Set(projects.map((p) => p.location.split(",").pop()?.trim()));
  return (
    <>
      <main id="main" className="bg-paper">
        <PageHeader
          index="02"
          label="Projects"
          lines={["Selected", <em key="w">work.</em>]}
          intro="A curated collection of residential, commercial, industrial and mixed-use architecture — each engineered with technical rigour, honest materials, and built to endure."
          aside={<ArrowLink href="/contact#enquiry" variant="solid">Discuss your project</ArrowLink>}
          variant="plain"
          facts={[
            ["Featured projects", String(projects.length).padStart(2, "0")],
            ["Typologies", "05"],
            ["Cities", String(cities.size).padStart(2, "0")],
            ["Region", "Tamil Nadu"],
          ]}
        />
        <ProjectsDirectory />
      </main>
      <Footer />
    </>
  );
}
