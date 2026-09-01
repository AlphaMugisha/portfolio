"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { Zoom } from "@/components/ui/motion-primitives";
import { journey } from "@/lib/journey";

/**
 * Journey — a conventional vertical timeline.
 *
 * The rail fills as the section scrolls, and each entry's marker fills when it
 * reaches the reading line. That single scroll-linked value is what makes a
 * static CV block feel alive without any element moving.
 */
export default function Journey() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.65"],
  });

  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="journey"
      className="relative scroll-mt-32 overflow-hidden px-6 py-28 sm:px-10 sm:py-36"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-bg-invert/70" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          invert
          eyebrow="Journey"
          title="How the work developed"
          lead="A progression from physical systems to software platforms — each stage built on the constraints learned in the one before it."
        />

        <div ref={ref} className="relative mt-16 lg:mt-20">
          {/* Rail */}
          <div
            className="absolute left-[7px] top-3 h-[calc(100%-2rem)] w-px bg-line-invert lg:left-[calc(22%+7px)]"
            aria-hidden="true"
          >
            <motion.div
              style={{ scaleY: reduced ? 1 : railScale }}
              className="h-full w-full origin-top bg-gradient-to-b from-primary to-accent"
            />
          </div>

          <ol className="space-y-14 lg:space-y-20">
            {journey.map((entry, i) => (
              <li key={entry.title}>
                <Zoom from="left" delay={i * 0.05} scale={0.9}>
                  <div className="grid gap-4 lg:grid-cols-[22%_minmax(0,1fr)] lg:gap-0">
                    {/* Period */}
                    <div className="lg:pr-12 lg:text-right">
                      <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-primary-light">
                        {entry.period}
                      </p>
                      <p className="mt-2 hidden font-sans text-[10px] uppercase tracking-[0.16em] text-text-invert-muted lg:block">
                        {entry.discipline}
                      </p>
                    </div>

                    {/* Entry */}
                    <div className="relative pl-8 lg:pl-12">
                      {/* Marker */}
                      <span
                        className="absolute left-0 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-line-invert bg-bg-invert lg:left-0"
                        aria-hidden="true"
                      >
                        <motion.span
                          initial={reduced ? undefined : { scale: 0 }}
                          whileInView={reduced ? undefined : { scale: 1 }}
                          viewport={{ once: true, margin: "-45% 0px -45% 0px" }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="h-1.5 w-1.5 rounded-full bg-primary-light"
                        />
                      </span>

                      <h3 className="text-display text-xl text-text-invert sm:text-2xl">
                        {entry.title}
                      </h3>

                      <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-text-invert-muted">
                        {entry.body}
                      </p>

                      <ul className="mt-5 flex flex-wrap gap-2">
                        {entry.highlights.map((h) => (
                          <li
                            key={h}
                            className="rounded-full border border-line-invert px-3 py-1 font-sans text-[10px] tracking-wide text-text-invert-muted transition-colors duration-300 hover:border-primary-light hover:text-text-invert"
                          >
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Zoom>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
