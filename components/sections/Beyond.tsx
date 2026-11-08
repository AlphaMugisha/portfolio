import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import type { BeyondHighlightRow, SectionRow } from "@/types/database";

/**
 * Operating principles — and the page's second lit surface.
 *
 * NOTE: an earlier version lit this band page-white. The original
 * palette is dark throughout, so the band is now the #161616 step
 * against the #0E0E0E page, with its cards stepped again to #232323.
 *
 * The site had nine consecutive near-black sections and used porcelain
 * exactly once, in About. That is a palette with no rhythm: by the time
 * a reader reaches the back half, every section has the same
 * temperature and they stop registering as separate places. Lighting
 * this one turns a single contrast event into a structure — dark,
 * lit, dark, lit, dark — and gives the eye somewhere to rest before
 * the live feed and the closing.
 *
 * This section earns the treatment specifically because it is the
 * quietest: three statements about rigour, no imagery, no interaction
 * beyond a rule that extends on hover. Full bleed, so the lit band
 * reads as a change in the page rather than a large card sitting on it.
 */
export default function Beyond({
  section,
  highlights,
}: {
  section: SectionRow;
  highlights: BeyondHighlightRow[];
}) {
  return (
    <section
      id="beyond"
      className="relative bg-ink-raised px-6 py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* The header's own tokens are tuned for the dark board, so the
            heading is set locally here rather than reusing SectionHeader
            with a pile of overrides. */}
        <Reveal variant="rise">
          <div className="flex items-center gap-4">
            <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-subtle">
              <span className="text-text-subtle/60">07</span>
              {section.eyebrow}
            </span>
            <span className="h-px flex-1 bg-rule" aria-hidden="true" />
          </div>
        </Reveal>

        <Reveal variant="rise" delay={0.08}>
          <h2 className="mt-6 max-w-2xl text-display-sm font-display font-semibold text-text">
            {section.heading}
            {section.accent ? (
              <span className="block text-signal">{section.accent}</span>
            ) : null}
          </h2>
          {section.intro ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-text-muted">
              {section.intro}
            </p>
          ) : null}
        </Reveal>

        <Reveal
          variant="stack"
          className="mt-14 grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-3"
          stagger={0.1}
        >
          {highlights.map((highlight, i) => (
            <article
              key={highlight.id}
              className="group relative bg-ink-high p-7 transition-colors duration-500 hover:bg-ink-band lg:p-9"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-4 font-display text-[5.5rem] font-semibold leading-none text-text/[0.05] transition-colors duration-500 group-hover:text-signal/[0.14]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <Icon name={highlight.icon} size={20} className="relative text-text" />

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
