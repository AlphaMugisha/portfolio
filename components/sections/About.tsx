"use client";

import { Reveal, TextReveal, Counter, Zoom } from "@/components/ui/motion-primitives";
import RevealImage from "@/components/ui/RevealImage";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * About — a conventional two-column introduction with a portrait plate.
 *
 * Every figure below is countable from the work in this portfolio. There is
 * no invented "years of experience" number and no self-assessed proficiency,
 * because neither would be verifiable.
 */
const figures = [
  { value: 8, suffix: "", label: "Systems in this portfolio" },
  { value: 4, suffix: "", label: "Database engines used" },
  { value: 30, suffix: "+", label: "Technologies worked with" },
];

export default function About() {
  return (
    <section id="about" className="relative scroll-mt-32 px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="About" title="A short introduction" />

        <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-24">
          <div>
            <TextReveal
              as="h3"
              className="text-display text-[clamp(1.5rem,2.9vw,2.3rem)] text-text-primary"
              lines={["I build complete systems,", "not just interfaces."]}
            />

            <div className="mt-8 space-y-6 text-pretty leading-relaxed text-text-secondary">
              <Reveal delay={0.05}>
                <p>
                  My work begins with the data. Before a screen exists there is a
                  schema, a set of roles, and a clear idea of who needs to do
                  what. That discipline came from starting with hardware, where a
                  system either behaves correctly or visibly does not.
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <p>
                  Since then I have built web platforms, REST APIs,
                  administrative dashboards and connected devices — React,
                  Next.js and TypeScript on the front, Node, Laravel and PHP
                  behind them, over PostgreSQL, MySQL and SQLite.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <p>
                  I care about software that holds up in use: clear structure,
                  honest data, and interfaces that stay usable on an ordinary
                  connection.
                </p>
              </Reveal>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-line pt-10">
              {figures.map((f, i) => (
                <Reveal key={f.label} delay={i * 0.08}>
                  <div>
                    <p className="text-display text-4xl text-text-primary sm:text-5xl">
                      <Counter value={f.value} suffix={f.suffix} />
                    </p>
                    <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.14em] text-text-muted">
                      {f.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Portrait */}
          <Zoom from="right" className="relative" scale={0.85}>
            <RevealImage
              src="/images/portrait.jpg"
              alt="Portrait of Alpha Mugisha"
              className="aspect-4/5 w-full"
              sizes="(max-width: 1024px) 100vw, 40vw"
              drift={9}
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-4 -left-4 -z-10 h-full w-full rounded-sm border border-primary/35"
            />
          </Zoom>
        </div>
      </div>
    </section>
  );
}
