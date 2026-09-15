"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal, EASE } from "@/components/ui/motion-primitives";
import { journey } from "@/lib/journey";

/**
 * Journey — the timeline draws itself: the rail grows downward as it enters,
 * each marker pops on arrival, and every entry rises in turn. The numbering
 * is real information here: the entries are chronological.
 */
export default function Journey() {
  const reduced = useReducedMotion();

  return (
    <section
      id="journey"
      data-band="dark"
      className="scroll-mt-24 bg-ink px-6 py-24 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="meta flex items-center gap-3 text-text-muted">
            <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
            04 — How it developed
          </p>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal delay={0.06}>
              <h2 className="text-display text-[clamp(1.9rem,5.2vw,3.6rem)] text-text-primary">
                The <span className="text-primary">journey</span>
              </h2>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 max-w-md text-pretty leading-relaxed text-text-secondary">
                A progression from physical systems to software platforms —
                each stage built on the constraints learned in the one before
                it, and none of it abandoned along the way.
              </p>
            </Reveal>
          </div>

          <ol className="relative">
            <motion.span
              aria-hidden="true"
              initial={reduced ? undefined : { scaleY: 0 }}
              whileInView={reduced ? undefined : { scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, ease: EASE }}
              className="absolute left-[6px] top-2 h-[calc(100%-3rem)] w-px origin-top bg-gradient-to-b from-primary via-line-strong to-line"
            />

            {journey.map((entry, i) => (
              <li
                key={entry.title}
                className="relative pb-14 pl-10 last:pb-0 sm:pl-14"
              >
                <motion.span
                  aria-hidden="true"
                  initial={reduced ? undefined : { scale: 0 }}
                  whileInView={reduced ? undefined : { scale: 1 }}
                  viewport={{ once: true, margin: "-90px" }}
                  transition={{
                    duration: 0.55,
                    delay: 0.15,
                    ease: EASE,
                  }}
                  className="absolute left-0 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-line-strong bg-ink"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </motion.span>

                <Reveal delay={i * 0.04}>
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="meta text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="meta text-text-muted">{entry.period}</span>
                    <span className="meta text-text-muted opacity-60">
                      {entry.discipline}
                    </span>
                  </div>

                  <h3 className="text-editorial mt-3 text-xl font-medium text-text-primary sm:text-2xl">
                    {entry.title}
                  </h3>

                  <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-text-secondary">
                    {entry.body}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {entry.highlights.map((h) => (
                      <li key={h} className="meta text-text-muted">
                        {h}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
