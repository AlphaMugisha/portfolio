"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/motion-primitives";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  className?: string;
  /** Set on the inverted (ink) band. */
  invert?: boolean;
}

/**
 * Section header: eyebrow, a rule that draws itself across as the section
 * enters, then the title.
 *
 * No 01/02/03 numbering — the sections are not a sequence the reader has to
 * follow in order, so numbering them would decorate rather than inform.
 * Numbers appear only in Journey, where the order is real.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  className = "",
  invert = false,
}: SectionHeadingProps) {
  const reduced = useReducedMotion();

  return (
    <div className={className}>
      <Reveal>
        <span className={invert ? "eyebrow-invert" : "eyebrow"}>{eyebrow}</span>
      </Reveal>

      <motion.div
        initial={reduced ? undefined : { scaleX: 0 }}
        whileInView={reduced ? undefined : { scaleX: 1 }}
        viewport={{ once: true, margin: "-90px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className={`mt-5 h-px w-full origin-left ${
          invert ? "bg-line-invert" : "bg-line-strong"
        }`}
      />

      <Reveal delay={0.08} className="mt-8">
        <h2
          className={`text-display max-w-3xl text-[clamp(2rem,4.6vw,3.5rem)] ${
            invert ? "text-text-invert" : "text-text-primary"
          }`}
        >
          {title}
        </h2>
      </Reveal>

      {lead && (
        <Reveal delay={0.14}>
          <p
            className={`mt-6 max-w-2xl text-pretty leading-relaxed ${
              invert ? "text-text-invert-muted" : "text-text-secondary"
            }`}
          >
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  );
}
