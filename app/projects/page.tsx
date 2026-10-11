import type { Metadata } from "next";
import { Footer } from "@/components/contact/Footer";
import { PageScripts } from "@/components/pages/PageScripts";
import { contact, projects } from "@/lib/content";
import { KIT_CSS } from "@/lib/pages/kit";
import { PROJECTS_CSS, projectsPageMarkup } from "@/lib/pages/projects";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Waterproofed Building Projects, Erode & Coimbatore",
  description:
    "Apartments, villas, offices and factories by RPC Constructions in Erode, Coimbatore, Perundurai and Chennai, with the waterproofing specified for each one.",
  path: "/projects",
});

/** Projects: the opening with filters by status and town, a deck of project boards, the full view of each, and the close */
export default function ProjectsPage() {
  return (
    <>
      <main id="main" className="pg">
        <style dangerouslySetInnerHTML={{ __html: KIT_CSS + PROJECTS_CSS }} />
        <div dangerouslySetInnerHTML={{ __html: projectsPageMarkup({ projects, contact }) }} />
        <PageScripts root="main" kind="projects" />
      </main>
      <Footer />
    </>
  );
}
