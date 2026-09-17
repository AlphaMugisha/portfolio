"use client";

import { Reveal } from "@/components/ui/motion-primitives";
import Section from "@/components/ui/Section";
import TechIcon from "@/components/ui/TechIcon";
import { skillGroups } from "@/lib/skills";

/**
 * Expertise — a ruled list, not a grid of cards.
 *
 * Four boxed cards gave four capabilities equal visual weight and turned the
 * section into a wall. A list avoids exactly that: a row is only as tall as
 * its content needs, the rules line everything up, and the eye runs down one
 * column instead of ping-ponging around a 2×2.
 *
 * Each row is the group's number and name on the left, its sentence and its
 * tools on the right. Every chip's `title` says what the technology is used
 * for; there are no proficiency bars, because any number on them would be
 * invented.
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
      <ul className="border-t border-line">
        {skillGroups.map((group, i) => (
          <li key={group.id}>
            <Reveal delay={i * 0.06} y={18}>
              {/* The row is one group, so the number and the name both light
                  up when the pointer is anywhere along it — not only when it
                  happens to be over the words. */}
              <div className="group grid gap-x-10 gap-y-5 border-b border-line py-8 sm:grid-cols-[minmax(0,0.34fr)_minmax(0,1fr)] sm:py-10">
                <div className="flex items-baseline gap-4">
                  <span className="meta shrink-0 text-primary-strong">
                    {group.index}
                  </span>
                  <h3 className="text-display text-[clamp(1.3rem,2.4vw,1.85rem)] text-text-primary transition-colors duration-300 group-hover:text-primary-strong">
                    {group.title}
                  </h3>
                </div>

                <div>
                  <p className="max-w-xl text-pretty leading-relaxed text-text-secondary">
                    {group.blurb}
                  </p>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {group.skills.map((s) => (
                      <li key={s.name}>
                        <span
                          title={s.detail}
                          className="chip flex items-center gap-2 px-3 py-1.5 font-geometric text-[11px] text-text-secondary transition-[color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary-strong"
                        >
                          <TechIcon name={s.name} size={12} />
                          {s.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
