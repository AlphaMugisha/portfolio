import { journey } from "@/lib/journey";

/**
 * Journey — a plain vertical timeline. The numbering is real information
 * here: the entries are chronological.
 */
export default function Journey() {
  return (
    <section
      id="journey"
      data-band="dark"
      className="scroll-mt-24 bg-ink px-6 py-24 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <p className="meta flex items-center gap-3 text-text-muted">
          <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
          04 — How it developed
        </p>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-display text-[clamp(1.9rem,5.2vw,3.6rem)] text-text-primary">
              The <span className="text-primary">journey</span>
            </h2>

            <p className="mt-6 max-w-md text-pretty leading-relaxed text-text-secondary">
              A progression from physical systems to software platforms — each
              stage built on the constraints learned in the one before it, and
              none of it abandoned along the way.
            </p>
          </div>

          <ol className="relative">
            <span
              aria-hidden="true"
              className="absolute left-[6px] top-2 h-[calc(100%-3rem)] w-px bg-line"
            />

            {journey.map((entry, i) => (
              <li
                key={entry.title}
                className="relative pb-14 pl-10 last:pb-0 sm:pl-14"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-line-strong bg-ink"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </span>

                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="meta text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="meta text-text-muted">{entry.period}</span>
                  <span className="meta text-text-muted opacity-60">
                    {entry.discipline}
                  </span>
                </div>

                <h3 className="text-editorial mt-3 text-xl font-medium text-text-primary sm:text-2xl">
                  {entry.title}
                </h3>

                <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-text-secondary">
                  {entry.body}
                </p>

                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {entry.highlights.map((h) => (
                    <li key={h} className="meta text-text-muted">
                      {h}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
