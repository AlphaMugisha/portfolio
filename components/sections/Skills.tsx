"use client";

import {
  Reveal,
  Stagger,
  StaggerItem,
} from "@/components/ui/motion-primitives";
import TechIcon from "@/components/ui/TechIcon";
import { skillGroups } from "@/lib/skills";

/**
 * Skills — four group cards that rise in sequence, each filling with its
 * chips in a second, finer stagger. Every chip's `title` says what the
 * technology is used for; no proficiency bars, because any number on them
 * would be invented.
 */
export default function Skills() {
  return (
    <section
      id="skills"
      data-band="dark"
      className="scroll-mt-24 bg-ink px-6 py-24 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="meta flex items-center gap-3 text-text-muted">
            <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
            02 — What I do
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="text-display mt-6 text-[clamp(1.9rem,5.2vw,3.6rem)] text-text-primary">
            My <span className="text-primary">expertise</span>
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 md:grid-cols-2" stagger={0.12}>
          {skillGroups.map((group) => (
            <StaggerItem key={group.id}>
              <article className="plate h-full p-6 transition-colors duration-300 hover:border-primary sm:p-7">
                <div className="flex items-baseline justify-between">
                  <span className="meta text-primary">{group.index}</span>
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

                <Stagger className="mt-5 flex flex-wrap gap-2" stagger={0.025}>
                  {group.skills.map((s) => (
                    <StaggerItem key={s.name}>
                      <span
                        title={s.detail}
                        className="plate flex items-center gap-2 px-3 py-1.5 text-[11px] text-text-secondary transition-colors duration-300 hover:border-primary hover:text-primary"
                      >
                        <TechIcon name={s.name} size={12} />
                        {s.name}
                      </span>
                    </StaggerItem>
                  ))}
                </Stagger>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
