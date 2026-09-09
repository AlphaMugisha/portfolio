"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/motion-primitives";
import HoverPreview from "@/components/ui/HoverPreview";
import TechIcon from "@/components/ui/TechIcon";
import { skillGroups } from "@/lib/skills";

/**
 * Expertise.
 *
 * The reference splits this section in two and pins the left half: a heading
 * that stays put while a list of disciplines scrolls past it on the right.
 * The list carries no imagery of its own — hovering a row summons a preview
 * to the pointer instead, which is what lets the rows stay as pure
 * typography.
 *
 * Loose brand marks drift around the pinned column. They are the only
 * ornament in the dark run, and they are still doing work: they name the
 * tools the rows are talking about.
 */

/** Marks that drift in the open space below the pinned copy. Hand-placed
    within their own block, so they can never land on top of a sentence. */
const FLOATERS = [
  { name: "React", top: "6%", left: "4%", size: 34, delay: 0, drift: 16 },
  { name: "TypeScript", top: "48%", left: "17%", size: 26, delay: 1.1, drift: 12 },
  { name: "ESP32", top: "14%", left: "30%", size: 38, delay: 0.5, drift: 20 },
  { name: "Next.js", top: "62%", left: "40%", size: 24, delay: 0.9, drift: 18 },
  { name: "Prisma", top: "8%", left: "52%", size: 24, delay: 0.3, drift: 13 },
  { name: "Arduino Uno", top: "52%", left: "63%", size: 28, delay: 2.2, drift: 11 },
  { name: "PostgreSQL", top: "12%", left: "76%", size: 30, delay: 1.8, drift: 14 },
  { name: "Tailwind CSS", top: "58%", left: "87%", size: 24, delay: 1.5, drift: 15 },
];

export default function Skills() {
  const reduced = useReducedMotion();
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <section
      id="skills"
      data-band="dark"
      className="relative scroll-mt-24 overflow-hidden bg-ink px-6 py-24 sm:px-10 sm:py-32"
    >
      <HoverPreview src={preview} />

      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <p className="meta flex items-center gap-3 text-text-muted">
            <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
            02 — What I do
          </p>
        </Reveal>

        <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16 xl:gap-24">
          {/* ---- Pinned column ---- */}
          <div className="relative lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <h2 className="text-mega text-[clamp(2.6rem,7.5vw,6rem)] leading-[0.86] text-text-primary">
                My
                <br />
                <span className="text-primary">Expertise</span>
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-8 max-w-md text-pretty leading-relaxed text-text-secondary">
                I design and build systems where the data model, the service and
                the interface are one piece of work — and where, often enough,
                the last mile is a sensor on a bench rather than a screen.
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-md text-pretty leading-relaxed text-text-muted">
                From server-rendered admin systems to typed APIs and firmware
                that has to keep running when nobody is watching.
              </p>
            </Reveal>

            {/* Drifting marks. Decorative, and duplicative of the row copy —
                hidden from assistive technology and dropped on small screens,
                where the column has no spare height for them to drift in. */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative mt-14 hidden h-52 lg:block"
            >
              {FLOATERS.map((f) => (
                <motion.span
                  key={f.name}
                  className="absolute opacity-70"
                  style={{ top: f.top, left: f.left }}
                  animate={
                    reduced
                      ? undefined
                      : { y: [0, -f.drift, 0], rotate: [0, 6, 0] }
                  }
                  transition={{
                    duration: 7 + f.drift * 0.2,
                    delay: f.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <TechIcon name={f.name} size={f.size} />
                </motion.span>
              ))}
            </div>
          </div>

          {/* ---- The list ---- */}
          <ul className="border-t border-line">
            {skillGroups.map((group, i) => (
              <li key={group.id}>
                <Reveal delay={i * 0.05}>
                  <div
                    className="group relative border-b border-line py-8 sm:py-10"
                    onPointerEnter={() => setPreview(group.preview)}
                    onPointerLeave={() => setPreview(null)}
                  >
                    {/* Amber floods in from the left on hover — the row's
                        entire hover state, no borders moving. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 -left-4 -right-4 -z-10 origin-left scale-x-0 bg-surface/70 transition-transform duration-600 ease-out group-hover:scale-x-100"
                    />

                    <div className="flex items-start gap-5 sm:gap-8">
                      <span className="meta mt-1.5 shrink-0 text-primary">
                        {group.index}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-display text-[clamp(1.25rem,2.6vw,2rem)] text-text-primary transition-colors duration-400 group-hover:text-primary">
                          {group.title}
                        </h3>

                        <p className="mt-3 max-w-lg text-pretty leading-relaxed text-text-secondary">
                          {group.blurb}
                        </p>

                        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                          {group.skills.map((s) => (
                            <li
                              key={s.name}
                              title={s.detail}
                              className="flex items-center gap-2 text-[11px] text-text-muted transition-colors duration-300 group-hover:text-text-secondary"
                            >
                              <TechIcon name={s.name} size={13} />
                              {s.name}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <span className="meta mt-1.5 hidden shrink-0 text-text-muted sm:block">
                        {group.skills.length}
                      </span>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
