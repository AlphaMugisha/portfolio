"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import Section from "@/components/ui/Section";
import TechIcon from "@/components/ui/TechIcon";
import { skillGroups } from "@/lib/skills";

/**
 * Expertise — a tool wall.
 *
 * Two earlier attempts failed for the same underlying reason: they made the
 * PROSE the subject. Four boxed cards gave four sentences equal weight and
 * built a wall of copy; a ruled list did the same thing taller. Nobody reads
 * four paragraphs about categories — they scan for logos they recognise.
 *
 * So the logos are the content now. Each layer is a small accent label and a
 * grid of square tiles, and the sentence that used to headline the card is
 * demoted to one quiet line beside the label, where it can be read or
 * skipped without costing anything.
 *
 * The tile is deliberately square and generous. A logo needs room around it
 * to be recognisable at a glance, which is the entire point of showing a
 * logo rather than a word — and the name still sits underneath, because a
 * mark you do not recognise is useless without one.
 */
export default function Skills() {
  const total = skillGroups.reduce((n, g) => n + g.skills.length, 0);

  return (
    <Section
      id="skills"
      eyebrow="Toolbox"
      title="The tools I"
      accent="actually use."
      description={`${total} technologies across four layers of the same craft — and every one of them is used in something on this page, not collected.`}
      aside={<p className="meta text-text-muted">{total} tools</p>}
      className="bg-ink"
    >
<div className="space-y-12">
        {skillGroups.map((group, gi) => (
          <Reveal key={group.id} delay={gi * 0.05} y={18}>
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <h3 className="meta text-primary-strong">{group.title}</h3>
              <p className="text-sm text-text-muted">{group.blurb}</p>
            </div>

            <Stagger
              className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-8"
              stagger={0.03}
            >
              {group.skills.map((s) => (
                <StaggerItem key={s.name}>
                  {/* `title` carries what the tool is actually used for —
                      the detail that used to be buried in a chip tooltip. */}
                  <div
                    title={s.detail}
                    className="group flex aspect-square flex-col items-center justify-center gap-2.5 rounded-tile border border-line bg-surface p-2 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-card)]"
                  >
                    <TechIcon name={s.name} size={24} />
                    <span className="w-full truncate px-1 text-center font-geometric text-[10.5px] leading-none text-text-muted transition-colors duration-300 group-hover:text-text-primary">
                      {s.name}
                    </span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
