"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/motion-primitives";

/* ------------------------------------------------------------------
   The section header.

   Three lines, stacked, then the content at full width beneath:

     a small accent eyebrow naming the section,
     a real sentence for a heading with its closing clause in the accent,
     one supporting line.

   The heading is a SENTENCE, not a label. "Work" tells a reader what the
   section is filed under; "Things I have built and shipped" tells them what
   they are about to look at, and the accent on the closing clause is what
   stops a long heading reading as a paragraph.

   This replaces a sticky label column. That version kept the section name on
   screen the whole way down, but it spent a quarter of every row on a word
   and pushed all the content into the remaining three-quarters — so nothing
   ever got the full measure, and the page never opened up.
   ------------------------------------------------------------------ */

/** The shared measure. Everything on the page lines up to this. */
export const MEASURE = "mx-auto w-full max-w-[1320px] px-6 sm:px-10";

export default function Section({
  id,
  eyebrow,
  title,
  accent,
  description,
  children,
  className = "",
  aside,
}: {
  id: string;
  /** Small accent label above the heading — "Toolbox", "Selected work". */
  eyebrow: string;
  /** The heading, up to the accent clause. */
  title: string;
  /** The closing clause, set in the accent colour. */
  accent: string;
  /** One supporting line under the heading. */
  description?: string;
  children: ReactNode;
  className?: string;
  /** Sits opposite the heading on wide screens — a count, a link. */
  aside?: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 py-20 sm:py-28 lg:py-32 ${className}`}
    >
      <div className={MEASURE}>
        <header>
          <Reveal y={14}>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <Reveal delay={0.05} y={18}>
              <h2 className="text-mega max-w-4xl text-[clamp(2.2rem,5.6vw,4.2rem)] text-text-primary">
                {title}{" "}
                <span className="text-primary">{accent}</span>
              </h2>
            </Reveal>

            {aside && (
              <Reveal delay={0.12} y={14}>
                {aside}
              </Reveal>
            )}
          </div>

          {description && (
            <Reveal delay={0.14} y={16}>
              <p className="mt-6 max-w-2xl text-pretty text-xl leading-relaxed text-text-secondary">
                {description}
              </p>
            </Reveal>
          )}
        </header>

        <div className="mt-12 sm:mt-16">{children}</div>
      </div>
    </section>
  );
}
