import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import type { BeyondHighlightRow, SectionRow } from "@/types/database";

/**
 * Operating principles — and the page's second lit surface.
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
      className="relative bg-porcelain px-6 py-20 text-porcelain-ink lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        {/* The header's own tokens are tuned for the dark board, so the
            heading is set locally here rather than reusing SectionHeader
            with a pile of overrides. */}
        <Reveal variant="rise">
          <div className="flex items-center gap-4">
            <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-porcelain-ink/55">
              <span className="text-porcelain-ink/35">07</span>
              {section.eyebrow}
            </span>
            <span className="h-px flex-1 bg-porcelain-ink/15" aria-hidden="true" />
          </div>
        </Reveal>

        <Reveal variant="rise" delay={0.08}>
          <h2 className="mt-6 max-w-2xl text-display-sm font-display font-semibold text-porcelain-ink">
            {section.heading}
            {section.accent ? (
              <span className="block text-porcelain-ink/45">{section.accent}</span>
            ) : null}
          </h2>
          {section.intro ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-porcelain-ink/70">
              {section.intro}
            </p>
          ) : null}
        </Reveal>

        <Reveal
          variant="stack"
          className="mt-14 grid gap-px overflow-hidden border border-porcelain-ink/15 bg-porcelain-ink/15 sm:grid-cols-3"
          stagger={0.1}
        >
          {highlights.map((highlight, i) => (
            <article
              key={highlight.id}
              className="group relative bg-porcelain p-7 transition-colors duration-500 hover:bg-porcelain-bright lg:p-9"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-4 font-display text-[5.5rem] font-semibold leading-none text-porcelain-ink/[0.07] transition-colors duration-500 group-hover:text-porcelain-ink/[0.12]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <Icon name={highlight.icon} size={20} className="relative text-porcelain-ink" />

              <h3 className="relative mt-6 font-display text-lg font-semibold text-porcelain-ink">
                {highlight.title}
              </h3>

              <span
                aria-hidden="true"
                className="relative mt-3 block h-px w-8 bg-porcelain-ink/60 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-20"
              />

              <p className="relative mt-3 text-sm leading-relaxed text-porcelain-ink/70">
                {highlight.description}
              </p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
