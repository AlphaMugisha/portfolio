"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/motion-primitives";
import { journey } from "@/lib/journey";

/**
 * Journey.
 *
 * The one section on the page where order is real, so it is the one section
 * that gets numbered. A single rail fills as the section scrolls and each
 * marker fills as it reaches the reading line — one scroll-linked value doing
 * all the work, with nothing on screen actually moving.
 *
 * Kept in the dark run's typographic language: a condensed label, an
 * editorial headline per entry, and the technologies as plain marks rather
 * than badges.
 */
export default function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.62"],
  });

  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="journey"
      data-band="dark"
      className="relative scroll-mt-24 overflow-hidden bg-ink px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <p className="meta flex items-center gap-3 text-text-muted">
            <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
            03 — How it developed
          </p>
        </Reveal>

        <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 xl:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <h2 className="text-mega text-[clamp(2.6rem,7.5vw,6rem)] leading-[0.86] text-text-primary">
                The
                <br />
                <span className="text-primary">Journey</span>
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-8 max-w-md text-pretty leading-relaxed text-text-secondary">
                A progression from physical systems to software platforms —
                each stage built on the constraints learned in the one before
                it, and none of it abandoned along the way.
              </p>
            </Reveal>
          </div>

          <div ref={ref} className="relative">
            {/* Rail */}
            <div
              aria-hidden="true"
              className="absolute left-[6px] top-2 h-[calc(100%-3rem)] w-px bg-line"
            >
              <motion.div
                style={{ scaleY: reduced ? 1 : railScale }}
                className="h-full w-full origin-top bg-gradient-to-b from-primary to-accent"
              />
            </div>

            <ol>
              {journey.map((entry, i) => (
                <li key={entry.title} className="relative pb-14 pl-10 last:pb-0 sm:pl-14">
                  {/* Marker */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-line-strong bg-ink"
                  >
                    <motion.span
                      initial={reduced ? undefined : { scale: 0 }}
                      whileInView={reduced ? undefined : { scale: 1 }}
                      viewport={{ once: true, margin: "-45% 0px -45% 0px" }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                  </span>

                  <Reveal delay={i * 0.04}>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="meta text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="meta text-text-muted">{entry.period}</span>
                      <span className="meta text-text-muted opacity-50">
                        {entry.discipline}
                      </span>
                    </div>

                    <h3 className="text-editorial mt-4 text-[clamp(1.4rem,3vw,2.3rem)] font-medium text-text-primary">
                      {entry.title}
                    </h3>

                    <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-text-secondary">
                      {entry.body}
                    </p>

                    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
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
      </div>
    </section>
  );
}
