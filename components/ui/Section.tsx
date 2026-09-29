"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/motion-primitives";
import Wash from "@/components/ui/Wash";

/* ------------------------------------------------------------------
   The section header.

   A hairline across the full measure, the section name and any aside
   sitting on it as small tracked capitals, then the heading in the display
   serif with its closing clause in italic, then one supporting line.

   The rule is the part that does the work. It is what every luxury
   property and fashion site opens a section with, and it is why the header
   reads as a masthead rather than as a large paragraph: the reader sees the
   division of the page before they read a word of it.

   The heading is a SENTENCE, not a label. "Work" tells a reader what the
   section is filed under; "Things I have built and shipped" tells them what
   they are about to look at, and the italic on the closing clause is what
   stops a long serif heading reading as prose.
   ------------------------------------------------------------------ */

/** The shared measure. Everything on the page lines up to this. */
export const MEASURE = "mx-auto w-full max-w-[1320px] px-6 sm:px-10";

/** The vertical rhythm. 90 / 133 / 180 — the reference's top three steps. */
export const SECTION_PAD = "py-[90px] sm:py-[133px] lg:py-[180px]";

export default function Section({
  id,
  eyebrow,
  title,
  accent,
  description,
  children,
  className = "",
  aside,
  wash = "left",
}: {
  id: string;
  /** Small accent label on the rule — "Toolbox", "Selected work". */
  eyebrow: string;
  /** The heading, up to the italic clause. */
  title: string;
  /** The closing clause, set in italic serif and the accent colour. */
  accent: string;
  /** One supporting line under the heading. */
  description?: string;
  children: ReactNode;
  className?: string;
  /** Sits opposite the section name on the rule — a count, a link. */
  aside?: ReactNode;
  /** Which way the background wash leans. Alternate it down the page. */
  wash?: "left" | "right";
}) {
  return (
    <section
      id={id}
      className={`relative scroll-mt-24 ${SECTION_PAD} ${className}`}
    >
      <Wash side={wash} />

      <div className={`relative ${MEASURE}`}>
        <header>
          <Reveal y={10}>
            {/* Name and aside sit ON the rule, not above it. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2 border-t border-line pt-5">
              <p className="eyebrow">{eyebrow}</p>
              {aside}
            </div>
          </Reveal>

          <Reveal delay={0.06} y={16}>
            <h2 className="text-mega mt-10 max-w-[19ch] text-[clamp(2.6rem,7vw,7.1rem)] text-text-primary sm:mt-14">
              {title} <span className="text-clause">{accent}</span>
            </h2>
          </Reveal>

          {description && (
            <Reveal delay={0.12} y={14}>
              {/* Held to the right of the heading's left edge on wide
                  screens — the offset is what keeps a two-part header from
                  stacking into one block of flush-left text. */}
              <p className="lead mt-8 max-w-[46ch] text-text-secondary lg:ml-[34%]">
                {description}
              </p>
            </Reveal>
          )}
        </header>

        <div className="mt-16 sm:mt-24">{children}</div>
      </div>
    </section>
  );
}
