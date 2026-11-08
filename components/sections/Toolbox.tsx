import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TechIcon from "@/components/ui/TechIcon";
import { toolIndex, referencedCount } from "@/lib/tool-usage";
import type { SectionRow, SkillGroupWithSkills } from "@/types/database";

/**
 * Each tool links back to the project(s) it was actually used in — computed
 * in `lib/tool-usage.ts` from the projects' own stack lists, not curated by
 * hand. A tool with no shipped reference shows none rather than a fabricated
 * one.
 */
export default function Toolbox({
  section,
  groups,
}: {
  section: SectionRow;
  groups: SkillGroupWithSkills[];
}) {
  const total = groups.reduce((n, g) => n + g.skills.length, 0);

  return (
    <section id="toolbox" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading section={section} index="05" />
          <p className="font-mono text-xs text-text-subtle">
            {referencedCount} / {total} tied to a shipped project
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          {groups.map((group, gi) => (
            <ScrollReveal key={group.id} delay={gi * 0.08}>
              <div className="panel p-7">
                <span className="panel-marks" />
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm text-signal-dim">
                    {String(gi + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-text">{group.title}</h3>
                </div>
                <p className="mt-2 text-sm text-text-muted">{group.blurb}</p>

                <ul className="mt-6 divide-y divide-rule">
                  {group.skills.map((skill) => {
                    const ref = toolIndex[skill.name];
                    return (
                      <li key={skill.id} className="group flex items-center gap-4 py-3">
                        <TechIcon name={skill.name} size={22} className="shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-text">{skill.name}</p>
                          <p className="truncate text-xs text-text-subtle">{skill.detail}</p>
                        </div>
                        {ref && ref.projects.length ? (
                          <Link
                            href={`/projects/${ref.projects[0].slug}`}
                            className="shrink-0 font-mono text-[11px] text-signal-dim transition-colors hover:text-signal"
                          >
                            {ref.projects.length > 1
                              ? `${ref.projects.length} projects`
                              : ref.projects[0].name}
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
