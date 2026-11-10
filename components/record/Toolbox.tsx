import Masthead from "./Masthead";
import Reveal from "@/components/ui/Reveal";
import type { SkillGroupWithSkills } from "@/types/database";

/**
 * The toolbox, as a parts list.
 *
 * Every portfolio wants to put a percentage next to a technology. A
 * percentage is a number nobody measured, which on this site is the
 * one thing that is not allowed — so each entry carries what the thing
 * is actually used FOR instead. `Prisma — Schema / Migrations` says
 * more than `Prisma — 80%` and has the advantage of being true.
 *
 * Set as a bill of materials: name on the left, use on the right, a
 * hairline between each. That is the form the content already had.
 */
export default function Toolbox({ groups }: { groups: SkillGroupWithSkills[] }) {
  const total = groups.reduce((n, g) => n + g.skills.length, 0);

  return (
    <section
      aria-label="The toolbox"
      className="border-t border-rule bg-ink-raised px-6 py-28 sm:px-12 sm:py-36 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <Masthead
          id="toolbox"
          index="03"
          title="The toolbox"
          lead={`${total} things I build with, and what each one is for.`}
          note="No proficiency bars and no percentages — those would be numbers nobody measured. What a technology is used for is checkable; how good I am at it is not."
        />

        <div className="mt-20 grid gap-x-16 gap-y-20 md:grid-cols-2">
          {groups.map((group, i) => (
            <Reveal key={group.id} variant="stack" delay={i * 0.04}>
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl font-semibold tracking-tight text-text">
                    <span className="mr-4 font-mono text-[11px] font-normal tracking-[0.3em] text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {group.title}
                  </h3>
                  <span className="font-mono text-[11px] tabular-nums text-text-subtle">
                    {String(group.skills.length).padStart(2, "0")}
                  </span>
                </div>

                <p className="mt-3 text-[14px] leading-relaxed text-text-muted">{group.blurb}</p>

                <dl className="mt-7">
                  {group.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="group/row flex items-baseline justify-between gap-6 border-t border-rule py-3 transition-colors duration-300 hover:border-signal/40"
                    >
                      <dt className="shrink-0 text-[15px] text-text transition-colors duration-300 group-hover/row:text-signal">
                        {skill.name}
                      </dt>
                      <dd className="min-w-0 truncate text-right font-mono text-[10px] uppercase tracking-[0.16em] text-text-subtle">
                        {skill.detail}
                      </dd>
                    </div>
                  ))}
                  <div className="border-t border-rule" />
                </dl>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
