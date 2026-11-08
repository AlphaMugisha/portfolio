import SectionHeading from "@/components/ui/SectionHeading";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ProjectCard from "@/components/ui/ProjectCard";
import type { ProjectRow, SectionRow } from "@/types/database";

export default function ProjectGrid({
  section,
  projects,
}: {
  section: SectionRow;
  projects: ProjectRow[];
}) {
  return (
    <section id="work-grid" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading section={section} index="04" />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project, i) => (
            <ScrollReveal key={project.id} delay={(i % 4) * 0.06}>
              <ProjectCard project={project} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
