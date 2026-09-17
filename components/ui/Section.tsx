"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/motion-primitives";

/* ------------------------------------------------------------------
   The page grid.

   Every section is twelve columns on one measure. A narrow left column
   carries the section's number, rule and name, and STICKS while the content
   beside it scrolls past — so you always know which part of the site you are
   in without the heading eating a screen of vertical space each time.

   That is the whole structural idea, and it is why the headings here are
   small. The one enormous display line on the site belongs to the hero;
   repeating it five more times is what made the old page read as five
   identical slabs rather than one document.

   Below `lg` the column simply stacks and stops sticking — a sticky label on
   a phone is a label that covers the content it is labelling.
   ------------------------------------------------------------------ */

/** The shared measure. Everything on the page lines up to this. */
export const MEASURE = "mx-auto w-full max-w-[1320px] px-6 sm:px-10";

export default function Section({
  id,
  index,
  label,
  description,
  children,
  className = "",
  aside,
}: {
  id: string;
  /** The running number in the left column — "01", "02", … */
  index: string;
  label: string;
  /** One line under the heading. Optional; most sections want it. */
  description?: string;
  children: ReactNode;
  className?: string;
  /** Extra content pinned under the label, e.g. a count or a link. */
  aside?: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 py-20 sm:py-28 lg:py-32 ${className}`}
    >
      <div className={MEASURE}>
        <div className="grid grid-cols-12 items-start gap-x-8 gap-y-10">
          {/* ---- the sticky label ---------------------------------- */}
          <header className="col-span-12 lg:sticky lg:top-28 lg:col-span-3">
            <Reveal y={16}>
              <p className="meta text-primary-strong">{index}</p>
              <span
                aria-hidden="true"
                className="mt-4 block h-px w-10 bg-primary"
              />
              <h2 className="text-display mt-5 text-[clamp(1.6rem,2.6vw,2.1rem)] text-text-primary">
                {label}
              </h2>
              {description && (
                <p className="mt-4 max-w-[26ch] text-pretty text-sm leading-relaxed text-text-muted">
                  {description}
                </p>
              )}
              {aside && <div className="mt-6">{aside}</div>}
            </Reveal>
          </header>

          {/* ---- the content -------------------------------------- */}
          <div className="col-span-12 lg:col-span-9">{children}</div>
        </div>
      </div>
    </section>
  );
}
