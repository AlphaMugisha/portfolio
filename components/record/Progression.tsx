import Masthead from "./Masthead";
import Reveal from "@/components/ui/Reveal";
import type { JourneyEntryRow } from "@/types/database";

/**
 * How the work developed.
 *
 * Four stages on one rail. Not a CV: there are no employers, titles or
 * institutions here, because none were supplied and inventing them is
 * the single easiest lie a portfolio can tell. What IS here is the
 * order the disciplines arrived in, which is verifiable from the
 * projects themselves — hardware first, then server-rendered
 * applications, then typed platforms, then applied AI.
 *
 * The rail is the device: one hairline with four stops, so the reader
 * sees a sequence rather than four paragraphs that happen to be near
 * each other. It turns vertical on narrow screens, where a horizontal
 * rail would compress into nothing.
 */
export default function Progression({ entries }: { entries: JourneyEntryRow[] }) {
  return (
    <section
      aria-label="The progression"
      className="border-t border-rule bg-ink px-6 py-28 sm:px-12 sm:py-36 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <Masthead
          id="progression"
          index="04"
          title="The progression"
          lead="Hardware first. Everything since has been built on that."
          note="No employers, titles or dates here — none were supplied, and this site does not invent them. What follows is the order the disciplines arrived in, which the projects themselves show."
        />

        <div className="relative mt-20">
          {/* The rail. Horizontal on wide screens, vertical below. */}
          <span
            aria-hidden="true"
            className="absolute left-[5px] top-2 h-full w-px bg-rule-strong lg:left-0 lg:top-[5px] lg:h-px lg:w-full"
          />

          <ol className="grid gap-14 lg:grid-cols-4 lg:gap-10">
            {entries.map((entry, i) => (
              <Reveal key={entry.id} variant="rise" as="li" delay={i * 0.07}>
                <div className="relative pl-9 lg:pl-0 lg:pt-10">
                  {/* The stop. */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-[3px] block h-[11px] w-[11px] rounded-full border lg:top-0 ${
                      i === entries.length - 1
                        ? "border-signal bg-signal"
                        : "border-rule-strong bg-ink"
                    }`}
                  />

                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-signal">
                    {entry.period}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-text-subtle">
                    {entry.discipline}
                  </p>

                  <h3 className="mt-5 font-display text-[1.3rem] font-semibold leading-[1.15] tracking-[-0.02em] text-text">
                    {entry.title}
                  </h3>

                  <p className="mt-4 text-[14px] leading-relaxed text-text-muted">{entry.body}</p>

                  {entry.highlights?.length ? (
                    <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
                      {entry.highlights.map((h) => (
                        <li
                          key={h}
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-subtle"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
