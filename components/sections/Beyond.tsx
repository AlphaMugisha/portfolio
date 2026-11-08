import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import type { BeyondHighlightRow, SectionRow } from "@/types/database";

/**
 * Operating principles — the short beat between the journey and the
 * live feed.
 *
 * Deliberately the quietest section on the page. Three statements set
 * against oversized index numerals, no imagery, no interaction beyond
 * a rule that extends on hover. After the rack, the map and the
 * scrubbed rail, the page needs somewhere to stop moving, and the
 * content here is a set of claims about rigour — which would be
 * undercut by decorating them.
 */
export default function Beyond({
  section,
  highlights,
}: {
  section: SectionRow;
  highlights: BeyondHighlightRow[];
}) {
  return (
    <section id="beyond" className="relative px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader section={section} index="07" />

        <Reveal
          variant="stack"
          className="mt-14 grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-3"
          stagger={0.1}
        >
          {highlights.map((highlight, i) => (
            <article
              key={highlight.id}
              className="group relative bg-ink p-7 transition-colors duration-500 hover:bg-ink-raised lg:p-9"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-4 font-display text-[5.5rem] font-semibold leading-none text-text/[0.045] transition-colors duration-500 group-hover:text-signal/10"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <Icon name={highlight.icon} size={20} className="relative text-signal" />

              <h3 className="relative mt-6 font-display text-lg font-semibold text-text">
                {highlight.title}
              </h3>

              <span
                aria-hidden="true"
                className="relative mt-3 block h-px w-8 bg-signal transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-20"
              />

              <p className="relative mt-3 text-sm leading-relaxed text-text-muted">
                {highlight.description}
              </p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
