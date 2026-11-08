"use client";

import KineticText from "./KineticText";
import Reveal from "./Reveal";
import type { SectionRow } from "@/types/database";

/**
 * Every section opens the same way — a numbered annotation on a rule,
 * then a two-line heading whose second line carries the signal colour.
 * Factored out so the rhythm is identical in eight places rather than
 * approximately identical.
 *
 * The heading builds character by character on scroll; the annotation
 * and intro use the quieter rise. Keeping the loud treatment for the
 * heading alone is what stops the page becoming exhausting — if
 * everything performs, nothing reads as emphasis.
 */
export default function SectionHeader({
  section,
  index,
  align = "left",
  className = "",
}: {
  section: SectionRow;
  index: string;
  align?: "left" | "center";
  className?: string;
}) {
  const centred = align === "center";

  return (
    <div className={`${centred ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}>
      <Reveal variant="rise">
        <div
          className={`flex items-center gap-4 ${centred ? "justify-center" : ""}`}
        >
          <span className="note note-signal shrink-0">
            <span className="text-text-subtle">{index}</span> {section.eyebrow}
          </span>
          <span className="h-px flex-1 bg-rule" aria-hidden="true" />
        </div>
      </Reveal>

      <h2 className="mt-6 text-display-sm font-display font-semibold text-text">
        <KineticText text={section.heading} as="span" trigger="scroll" className="block" />
        {section.accent ? (
          <KineticText
            text={section.accent}
            as="span"
            trigger="scroll"
            delay={0.12}
            className="block text-signal"
          />
        ) : null}
      </h2>

      {section.intro ? (
        <Reveal variant="rise" delay={0.15}>
          <p className="mt-5 text-lg leading-relaxed text-text-muted">{section.intro}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
