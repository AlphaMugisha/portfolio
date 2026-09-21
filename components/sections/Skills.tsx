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
<div className="space-y-14">
        {skillGroups.map((group, gi) => (
          <Reveal key={group.id} delay={gi * 0.05} y={18}>
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-line pb-4">
              <h3 className="eyebrow">{group.title}</h3>
              <p className="text-text-muted">{group.blurb}</p>
            </div>

            <Stagger
              className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7"
              stagger={0.03}
            >
              {group.skills.map((s) => (
                <StaggerItem key={s.name}>
                  {/* `title` carries what the tool is actually used for —
                      the detail that used to be buried in a chip tooltip. */}
                  {/* The hover tints the whole tile rather than only its
                      border. On a white page a 1px colour change is almost
                      nothing; a wash of the accent at 4% reads instantly and
                      still leaves the logo the brightest thing in the box. */}
                  <div
                    title={s.detail}
                    className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-tile border border-line bg-surface p-3 transition-[border-color,transform,box-shadow,background-color] duration-300 hover:-translate-y-1 hover:border-primary hover:bg-[rgba(10,110,250,0.04)] hover:shadow-[var(--shadow-card)]"
                  >
                    <TechIcon name={s.name} size={30} />
                    <span className="w-full truncate px-1 text-center font-geometric text-[0.8rem] leading-none text-text-secondary transition-colors duration-300 group-hover:text-text-primary">
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
