"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { mediaUrl } from "@/lib/supabase/env";
import type { JourneyEntryRow, SectionRow } from "@/types/database";

/**
 * The hero's trace continues here as a vertical spine: it draws itself down
 * the page as you scroll, and each stage is a node branching off it — the
 * same idea ("this is one continuous system") applied to time instead of
 * disciplines, instead of a generic dotted timeline.
 */
export default function Journey({
  section,
  entries,
}: {
  section: SectionRow;
  entries: JourneyEntryRow[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.4"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.3 });

  return (
    <section id="journey" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <SectionHeading section={section} index="06" align="center" />

        <div ref={ref} className="relative mt-16 pl-10 sm:pl-14">
          <div className="absolute left-0 top-0 h-full w-px bg-rule sm:left-[3px]" />
          <motion.div
            className="absolute left-0 top-0 w-px origin-top bg-signal sm:left-[3px]"
            style={{ scaleY: progress, height: "100%" }}
          />

          <div className="space-y-16">
            {entries.map((entry, i) => (
              <ScrollReveal key={entry.id} className="relative" delay={0}>
                <span className="absolute -left-10 top-1 flex h-2 w-2 -translate-x-1/2 items-center justify-center rounded-full bg-signal sm:-left-[11px]" />

                <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal-dim">
                  {String(i + 1).padStart(2, "0")} · {entry.period}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-text sm:text-3xl">
                  {entry.title}
                </h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-text-subtle">
                  {entry.discipline}
                </p>
                <p className="mt-4 max-w-xl leading-relaxed text-text-muted">{entry.body}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {entry.highlights.map((h) => (
                    <span key={h} className="tag">
                      {h}
                    </span>
                  ))}
                </div>

                {entry.image_path ? (
                  <div className="relative mt-6 aspect-[16/9] w-full max-w-sm overflow-hidden border border-rule">
                    <Image src={mediaUrl(entry.image_path)} alt="" fill sizes="384px" className="object-cover" />
                  </div>
                ) : null}
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
