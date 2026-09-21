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
      className="bg-ink"
    >
      <Reveal>
        <Reader current={current} reduced={!!reduced} />
      </Reveal>

      <div className="mt-12 space-y-14">
        {skillGroups.map((group, gi) => (
          <Reveal key={group.id} delay={gi * 0.05} y={18}>
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-line pb-4">
              <h3 className="eyebrow">{group.title}</h3>
              <p className="text-text-muted">{group.blurb}</p>
            </div>

            <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
              {group.skills.map((s) => {
                const ref = toolIndex[s.name];
                const used = ref.projects.length;
                const on = active === s.name;
                return (
                  <li key={s.name}>
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
                      className={`relative flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-tile border p-3 transition-[border-color,transform,box-shadow,background-color] duration-300 ${
                        on
                          ? "-translate-y-1 border-primary bg-[rgba(10,110,250,0.06)] shadow-[var(--shadow-card)]"
                          : "border-line bg-surface hover:-translate-y-1 hover:border-primary hover:bg-[rgba(10,110,250,0.04)] hover:shadow-[var(--shadow-card)]"
                      }`}
                    >
                      {/* The count is visible without interaction, so the
                          cross-reference is scannable rather than hidden
                          behind a hover nobody knows to try. */}
                      {used > 0 && (
                        <span
                          aria-hidden="true"
                          className={`absolute right-2 top-2 grid h-5 min-w-5 place-items-center rounded-full px-1 font-geometric text-[0.65rem] font-semibold transition-colors ${
                            on
                              ? "bg-primary text-on-primary"
                              : "bg-bg-raised text-text-muted"
                          }`}
                        >
                          {used}
                        </span>
                      )}
                      <TechIcon name={s.name} size={30} />
                      <span
                        className={`w-full truncate px-1 text-center font-geometric text-[0.8rem] leading-none transition-colors duration-300 ${
                          on ? "text-text-primary" : "text-text-secondary"
                        }`}
                      >
                        {s.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
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
