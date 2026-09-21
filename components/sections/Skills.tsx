"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/motion-primitives";
import Section from "@/components/ui/Section";
import TechIcon from "@/components/ui/TechIcon";
import { skillGroups } from "@/lib/skills";
import { toolIndex, referencedCount, type ToolRef } from "@/lib/tool-usage";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Expertise — a toolbox that cross-references itself against the work.
 *
 * A wall of logos is a claim. This one can be checked: every project already
 * declares the stack it was built on, so picking up a tool shows the case
 * studies that actually name it, as links you can follow. None of that
 * mapping is written by hand — `lib/tool-usage` computes it from the two
 * datasets, so it cannot drift out of step with the projects.
 *
 * The reader is a fixed slot above the grid rather than a tooltip. A tooltip
 * would cover the neighbouring tiles at the exact moment you are comparing
 * them, it has nowhere to put links you can click, and it cannot be
 * announced as it changes. A live region can.
 *
 * Hover drives it on a mouse; tap and keyboard focus drive it everywhere
 * else, which is why each tile is a real button rather than a div.
 */
export default function Skills() {
  const [active, setActive] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const total = Object.keys(toolIndex).length;
  const current = active ? toolIndex[active] : null;

  return (
    <Section
      id="skills"
      eyebrow="Toolbox"
      title="The tools I"
      accent="actually use."
      description={`${total} technologies across four layers of the same craft. Pick one up and it will show you the case studies that name it.`}
      aside={<p className="meta text-text-muted">{total} tools</p>}
      wash="right"
      className="bg-ink"
    >
      <Reveal>
        <Reader current={current} reduced={!!reduced} />
      </Reveal>

      {/* Category cards of rows, not a grid of square tiles. A row gives a
          name room to be read in full — the tiles were truncating "Tailwind
          CSS" and "Arduino Uno" at the exact moment the point was
          recognition — and it leaves space on the right for the count. */}
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {skillGroups.map((group, gi) => (
          <Reveal key={group.id} delay={gi * 0.05} y={18} className="h-full">
            <section className="plate h-full p-6 sm:p-7">
              <h3 className="eyebrow">{group.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                {group.blurb}
              </p>

              <ul className="mt-5">
                {group.skills.map((s) => {
                  const used = toolIndex[s.name].projects.length;
                  const on = active === s.name;
                  return (
                    <li key={s.name} className="border-b border-line last:border-0">
                      <button
                        type="button"
                        onMouseEnter={() => setActive(s.name)}
                        onFocus={() => setActive(s.name)}
                        onClick={() => setActive(on ? null : s.name)}
                        aria-pressed={on}
                        aria-label={
                          used
                            ? `${s.name} — named in ${used} case ${
                                used === 1 ? "study" : "studies"
                              }`
                            : s.name
                        }
                        className={`flex w-full items-center gap-3 rounded-pill px-2 py-2.5 text-left transition-colors duration-200 ${
                          on ? "bg-[rgba(10,110,250,0.07)]" : "hover:bg-bg-raised"
                        }`}
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center">
                          <TechIcon name={s.name} size={20} />
                        </span>

                        <span
                          className={`min-w-0 flex-1 truncate font-geometric text-[0.95rem] transition-colors ${
                            on ? "text-primary-strong" : "text-text-primary"
                          }`}
                        >
                          {s.name}
                        </span>

                        {/* Real data on the right, where his proficiency pill
                            sits. A self-assessed "Strong" would be a claim
                            nobody has made; a project count is checkable. */}
                        {used > 0 && (
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 font-geometric text-[0.7rem] font-medium transition-colors ${
                              on
                                ? "bg-primary text-on-primary"
                                : "bg-bg-raised text-text-muted"
                            }`}
                          >
                            {used} {used === 1 ? "project" : "projects"}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>

      <p className="mt-12 max-w-3xl text-sm leading-relaxed text-text-muted">
        {referencedCount} of these {total} can be traced to a case study on
        this site. The rest are real but unlisted — a project&rsquo;s stack
        names the handful of technologies that define the build, not
        everything it touched.
      </p>
    </Section>
  );
}

/**
 * The reader.
 *
 * A fixed slot, not a tooltip: it never covers the tiles being compared, it
 * can hold links, and `aria-live` lets it be announced as it changes. The
 * height is pinned so swapping tools cannot shunt the grid up and down under
 * the pointer that is driving it.
 */
function Reader({
  current,
  reduced,
}: {
  current: ToolRef | null;
  reduced: boolean;
}) {
  return (
    <div
      className="plate flex min-h-[148px] items-center px-6 py-5 sm:min-h-[124px]"
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        {current ? (
          <motion.div
            key={current.name}
            initial={reduced ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="flex w-full flex-wrap items-center gap-x-8 gap-y-4"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-tile border border-line bg-bg-raised">
              <TechIcon name={current.name} size={26} />
            </span>

            <div className="min-w-[14rem] flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-geometric text-lg font-medium text-text-primary">
                  {current.name}
                </p>
                <span className="meta text-text-muted">{current.group}</span>
              </div>
              <p className="mt-1 text-pretty leading-snug text-text-secondary">
                {current.detail}
              </p>
            </div>

            {current.projects.length > 0 ? (
              <div className="flex min-w-0 flex-col gap-2">
                <span className="meta text-primary-strong">
                  Named in {current.projects.length} case{" "}
                  {current.projects.length === 1 ? "study" : "studies"}
                </span>
                <ul className="flex flex-wrap gap-2">
                  {current.projects.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/projects/${p.slug}`}
                        className="chip group inline-flex items-center gap-1.5 px-3 py-1.5 text-text-secondary transition-colors hover:border-primary hover:text-primary-strong"
                      >
                        {p.name}
                        <ArrowUpRight
                          size={13}
                          aria-hidden="true"
                          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="max-w-[17rem] text-sm leading-snug text-text-muted">
                Not named in a case-study stack — those list only what defines
                each build.
              </p>
            )}
          </motion.div>
        ) : (
          <motion.p
            key="idle"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="text-pretty text-text-muted"
          >
            Hover, tap or tab through a tool below to see what it is for and
            which case studies name it.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
