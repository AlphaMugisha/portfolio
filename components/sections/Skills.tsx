"use client";

import { Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import TechIcon from "@/components/ui/TechIcon";
import TiltCard from "@/components/ui/TiltCard";
import Section from "@/components/ui/Section";
import { skillGroups } from "@/lib/skills";

/**
 * Skills — four group cards that rise in sequence, each filling with its
 * chips in a second, finer stagger. Every chip's `title` says what the
 * technology is used for; no proficiency bars, because any number on them
 * would be invented.
 */
export default function Skills() {
  return (
    <Section
      id="skills"
      index="02"
      label="Expertise"
      description="Four layers of the same craft, from the schema underneath to the board on the bench."
      aside={
        <p className="meta text-text-muted">
          {skillGroups.reduce((n, g) => n + g.skills.length, 0)} tools
        </p>
      }
      className="bg-ink"
    >
      <Stagger className="grid gap-5 md:grid-cols-2" stagger={0.1}>
        {skillGroups.map((group) => (
          <StaggerItem key={group.id} className="h-full">
            <TiltCard tilt={2.5} className="h-full">
              <article className="plate lift flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-baseline justify-between">
                  <span className="meta text-primary-strong">{group.index}</span>
                  <span className="meta text-text-muted">
                    {group.skills.length} tools
                  </span>
                </div>

                <h3 className="text-display mt-4 text-2xl text-text-primary">
                  {group.title}
                </h3>

                <p className="mt-3 text-pretty text-sm leading-relaxed text-text-secondary">
                  {group.blurb}
                </p>

                <Stagger
                  className="mt-auto flex flex-wrap gap-2 pt-5"
                  stagger={0.025}
                >
                  {group.skills.map((s) => (
                    <StaggerItem key={s.name}>
                      <span
                        title={s.detail}
                        className="chip flex -translate-y-0 items-center gap-2 px-3 py-1.5 font-geometric text-[11px] text-text-secondary transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary-strong"
                      >
                        <TechIcon name={s.name} size={12} />
                        {s.name}
                      </span>
                    </StaggerItem>
                  ))}
                </Stagger>
              </article>
            </TiltCard>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
