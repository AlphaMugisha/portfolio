"use client";

import { motion, useReducedMotion } from "framer-motion";
import RevealImage from "@/components/ui/RevealImage";
import { Reveal, Counter, MaskedWords } from "@/components/ui/motion-primitives";
import { site } from "@/lib/site";

/**
 * About.
 *
 * The reference's arrangement, which is worth copying because it works: a
 * centred gold label under a hairline rule, then a framed portrait held on
 * the left with the name set vertically down its edge, and to the right a
 * statement whose emphasis alternates word by word, two columns of prose,
 * and a strip of hard facts underneath.
 */

/* The alternating weight is the whole reason the statement can be set this
   large without shouting: the eye reads the bold words as the sentence and
   the light ones as the connective tissue. Indices, not flags, so the
   pattern is stated once. */
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
      <div className="mx-auto max-w-[1600px]">
        {/* ---- Label ---- */}
        <div className="flex flex-col items-center text-center">
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
        </div>

        {/* ---- Body ---- */}
        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
          {/* Portrait, held in a frame with the name down its edge */}
          <div className="relative pl-10 sm:pl-14">
            <p
              className="meta absolute left-0 top-0 origin-top-left translate-y-full -rotate-90 whitespace-nowrap text-text-muted"
              aria-hidden="true"
            >
              {site.name}
            </p>

            <div className="relative border border-line p-2.5 sm:p-3">
              <RevealImage
                src="/images/portrait.jpg"
                alt={`Portrait of ${site.name}`}
                className="aspect-4/5 w-full"
                sizes="(max-width: 1024px) 100vw, 34vw"
                drift={8}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="meta text-text-muted">Kigali · RW</span>
              <span className="meta text-primary">{new Date().getFullYear()}</span>
            </div>
          </div>

          {/* Statement + prose + facts */}
          <div className="flex flex-col justify-center">
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

            <div className="mt-10 grid gap-8 text-pretty leading-relaxed text-text-secondary sm:grid-cols-2">
              <Reveal delay={0.05}>
                <p>
                  My work begins with the data. Before a screen exists there is a
                  schema, a set of roles, and a clear idea of who needs to do
                  what. That discipline came from starting with hardware, where a
                  system either behaves correctly or visibly does not.
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

            {/* Hard facts */}
            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-line pt-10 sm:grid-cols-4">
              {FACTS.map((f, i) => (
                <Reveal key={f.label} delay={i * 0.06}>
                  <div>
                    <dt className="meta text-text-muted">{f.label}</dt>
                    <dd className="mt-2.5 text-sm leading-snug text-text-primary">
                      {f.value}
                    </dd>
                  </div>
                </Reveal>
              ))}
            </dl>

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
          </div>
        </div>
      </div>
    </section>
  );
}
