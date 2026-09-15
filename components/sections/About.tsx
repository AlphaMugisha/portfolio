"use client";

import { motion, useReducedMotion } from "framer-motion";
import RevealImage from "@/components/ui/RevealImage";
import Tilt, { TiltLayer } from "@/components/ui/Tilt";
import Approach from "@/components/ui/Approach";
import Deep, { DeepLayer, DeepWord } from "@/components/ui/Deep";
import { Reveal, Counter, MaskedWords } from "@/components/ui/motion-primitives";
import { site } from "@/lib/site";

/**
 * About — the first room inside the cut.
 *
 * The reference's arrangement survives (centred label, framed portrait left,
 * alternating-weight statement right, facts underneath) but it no longer sits
 * ON the page; it stands IN the room the hero opened. The whole section is a
 * Deep stage: the name hangs far back as a fixture, the portrait is a mounted
 * plate that answers the pointer, the prose sits a plane behind the statement,
 * and the facts float just in front of everything as small plates. Scroll
 * separates the planes — real perspective doing the parallax, not assigned
 * speeds — and the stage leans a degree toward the cursor, the same lean the
 * WebGL scenes give their cameras.
 */

const STATEMENT = ["I build", "systems", "where", "software", "meets", "hardware."];
const STRONG = new Set([0, 2, 4]);

const FACTS = [
  { label: "Based", value: site.location },
  { label: "Role", value: site.role },
  { label: "Focus", value: "Platforms · Embedded · AI" },
  { label: "Status", value: "Open to new work" },
];

/** Every figure here is countable from the work in this portfolio. */
const FIGURES = [
  { value: 8, suffix: "", label: "Systems shipped" },
  { value: 4, suffix: "", label: "Database engines" },
  { value: 30, suffix: "+", label: "Technologies used" },
];

export default function About() {
  const reduced = useReducedMotion();

  return (
    <section
      id="about"
      data-band="dark"
      className="relative scroll-mt-24 overflow-hidden bg-ink px-6 py-24 sm:px-10 sm:py-32"
    >
      <Approach>
        <Deep tilt={1.1} className="relative mx-auto max-w-[1600px]">
          {/* The fixture on the far wall. */}
          <DeepWord word={site.shortName} depth={640} drift={1.2} />

          {/* ---- Label ---- */}
          <DeepLayer depth={0} className="relative flex flex-col items-center text-center">
            <Reveal>
              <p className="meta flex items-center gap-3 text-text-muted">
                <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
                01 — The person behind the work
                <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <h2 className="text-display mt-6 text-[clamp(1.9rem,5.2vw,4rem)] text-primary">
                About me
              </h2>
            </Reveal>

            <motion.div
              initial={reduced ? undefined : { scaleX: 0 }}
              whileInView={reduced ? undefined : { scaleX: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 h-px w-full max-w-3xl origin-center bg-line-strong"
            />
          </DeepLayer>

          {/* ---- Body ---- */}
          <div className="relative mt-16 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
            {/* Portrait: a mounted plate one step into the room, tilting to
                meet the pointer, its photograph and caption at separate
                depths so the object has an inside. */}
            <DeepLayer depth={46} drift={0.4} className="relative pl-10 sm:pl-14">
              <p
                className="meta absolute left-0 top-0 origin-top-left translate-y-full -rotate-90 whitespace-nowrap text-text-muted"
                aria-hidden="true"
              >
                {site.name}
              </p>

              <Tilt max={5} lift={20} className="group relative">
                <span className="pool-light" aria-hidden="true" />
                <div className="plate elevate relative p-2.5 sm:p-3">
                  <TiltLayer depth={0.55} className="relative">
                    <RevealImage
                      src="/images/portrait.jpg"
                      alt={`Portrait of ${site.name}`}
                      className="aspect-4/5 w-full"
                      sizes="(max-width: 1024px) 100vw, 34vw"
                      drift={8}
                    />
                  </TiltLayer>
                </div>

                <TiltLayer depth={0.3}>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="meta text-text-muted">Kigali · RW</span>
                    <span className="meta text-primary">
                      {new Date().getFullYear()}
                    </span>
                  </div>
                </TiltLayer>
              </Tilt>
            </DeepLayer>

            {/* Statement + prose + facts, on three planes. */}
            <div className="relative flex flex-col justify-center">
              <DeepLayer depth={0}>
                <MaskedWords
                  as="h3"
                  words={STATEMENT}
                  className="text-editorial text-[clamp(1.6rem,4.4vw,3.4rem)] text-text-primary"
                  wordClassName={(i) =>
                    STRONG.has(i)
                      ? "font-bold text-text-primary"
                      : "font-light text-text-secondary"
                  }
                />
              </DeepLayer>

              <DeepLayer depth={70} drift={0.55}>
                <div className="mt-10 grid gap-8 text-pretty leading-relaxed text-text-secondary sm:grid-cols-2">
                  <Reveal delay={0.05}>
                    <p>
                      My work begins with the data. Before a screen exists there
                      is a schema, a set of roles, and a clear idea of who needs
                      to do what. That discipline came from starting with
                      hardware, where a system either behaves correctly or
                      visibly does not.
                    </p>
                  </Reveal>

                  <Reveal delay={0.11}>
                    <p>
                      Since then I have built web platforms, REST APIs,
                      administrative dashboards and connected devices — React,
                      Next.js and TypeScript on the front, Node, Laravel and PHP
                      behind them, over PostgreSQL, MySQL and SQLite.
                    </p>
                  </Reveal>
                </div>
              </DeepLayer>

              {/* Facts float just in front of the focal plane, as the small
                  plates every dimensional object on this site is made of. */}
              <DeepLayer depth={-34} drift={-0.28}>
                <dl className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {FACTS.map((f, i) => (
                    <Reveal key={f.label} delay={i * 0.06}>
                      <div className="plate btn-depth h-full px-4 py-3.5">
                        <dt className="meta text-text-muted">{f.label}</dt>
                        <dd className="mt-2.5 text-sm leading-snug text-text-primary">
                          {f.value}
                        </dd>
                      </div>
                    </Reveal>
                  ))}
                </dl>
              </DeepLayer>

              <DeepLayer depth={26} drift={0.3}>
                <div className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-10">
                  {FIGURES.map((f, i) => (
                    <Reveal key={f.label} delay={i * 0.07}>
                      <div>
                        <p className="text-display text-[clamp(1.8rem,4vw,3rem)] text-primary">
                          <Counter value={f.value} suffix={f.suffix} />
                        </p>
                        <p className="meta mt-2.5 text-text-muted">{f.label}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </DeepLayer>
            </div>
          </div>
        </Deep>
      </Approach>
    </section>
  );
}
