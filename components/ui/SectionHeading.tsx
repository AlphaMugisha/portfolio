import ScrollReveal from "./ScrollReveal";
import type { SectionRow } from "@/types/database";

/**
 * Every section opens the same way — index, eyebrow, a two-line heading
 * whose second line carries the signal colour, then an optional intro — so
 * the shape is factored out once rather than repeated eight times.
 */
export default function SectionHeading({
  section,
  index,
  align = "left",
}: {
  section: SectionRow;
  index: string;
  align?: "left" | "center";
}) {
  return (
    <ScrollReveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="eyebrow">
        <span className="font-mono text-text-subtle">{index}</span>
        {section.eyebrow}
      </p>
      <h2 className="mt-5 text-display-md font-display font-semibold text-text">
        {section.heading}
        {section.accent ? <span className="block text-signal">{section.accent}</span> : null}
      </h2>
      {section.intro ? (
        <p className="mt-5 text-lg leading-relaxed text-text-muted">{section.intro}</p>
      ) : null}
    </ScrollReveal>
  );
}
