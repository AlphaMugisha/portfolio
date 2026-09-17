"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Reveal,
  Stagger,
  StaggerItem,
  MaskedWords,
  Counter,
  EASE,
} from "@/components/ui/motion-primitives";
import TiltCard from "@/components/ui/TiltCard";
import { site } from "@/lib/site";

/**
 * About — portrait left, statement and facts right. The portrait unmasks
 * upward as it enters, the statement rises word by word, and the figures
 * count up once they are seen.
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
      className="scroll-mt-24 bg-ink px-6 py-24 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="meta flex items-center gap-3 text-text-muted">
            <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
            01 — The person behind the work
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="panel-head mt-6">
            <h2 className="text-display text-[clamp(1.9rem,5.2vw,3.6rem)] text-text-primary">
              About <span className="text-primary">me</span>
            </h2>
            <p className="chip meta px-3 py-1.5 text-text-muted">
              {site.location}
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <TiltCard tilt={3} className="plate p-2.5">
              <motion.div
                className="overflow-hidden rounded-tile"
                initial={
                  reduced ? undefined : { clipPath: "inset(100% 0% 0% 0%)" }
                }
                whileInView={
                  reduced ? undefined : { clipPath: "inset(0% 0% 0% 0%)" }
                }
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 1.1, ease: EASE }}
              >
                <Image
                  src="/images/portrait.jpg"
                  alt={`Portrait of ${site.name}`}
                  width={1200}
                  height={1500}
                  sizes="(max-width: 1024px) 100vw, 34vw"
                  className="aspect-4/5 w-full rounded-tile object-cover"
                />
              </motion.div>
            </TiltCard>
            <Reveal delay={0.2}>
              <div className="mt-4 flex items-center justify-between">
                <span className="meta text-text-muted">Kigali · RW</span>
                <span className="meta text-primary">
                  {new Date().getFullYear()}
                </span>
              </div>
            </Reveal>
          </div>

          <div className="flex flex-col justify-center">
            <MaskedWords
              as="h3"
              words={STATEMENT}
              className="text-editorial text-[clamp(1.5rem,3.8vw,2.8rem)] text-text-primary"
              wordClassName={(i) =>
                STRONG.has(i)
                  ? "font-bold text-text-primary"
                  : "font-light text-text-secondary"
              }
            />

            <div className="mt-8 grid gap-6 text-pretty leading-relaxed text-text-secondary sm:grid-cols-2">
              <Reveal delay={0.05}>
                <p>
                  My work begins with the data. Before a screen exists there is
                  a schema, a set of roles, and a clear idea of who needs to do
                  what. That discipline came from starting with hardware, where
                  a system either behaves correctly or visibly does not.
                </p>
              </Reveal>
              <Reveal delay={0.12}>
                <p>
                  Since then I have built web platforms, REST APIs,
                  administrative dashboards and connected devices — React,
                  Next.js and TypeScript on the front, Node, Laravel and PHP
                  behind them, over PostgreSQL, MySQL and SQLite.
                </p>
              </Reveal>
            </div>

            <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FACTS.map((f) => (
                <StaggerItem key={f.label} className="h-full">
                  <TiltCard tilt={0} glow={170} className="h-full">
                    <div className="plate lift h-full px-4 py-3.5">
                      <p className="meta text-text-muted">{f.label}</p>
                      <p className="mt-2.5 text-sm leading-snug text-text-primary">
                        {f.value}
                      </p>
                    </div>
                  </TiltCard>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {FIGURES.map((f, i) => (
                <Reveal key={f.label} delay={i * 0.08} className="h-full">
                  <div className="plate lift h-full px-4 py-4">
                    <p className="text-display text-[clamp(1.6rem,3.6vw,2.4rem)] text-primary">
                      <Counter value={f.value} suffix={f.suffix} />
                    </p>
                    <p className="meta mt-2 text-text-muted">{f.label}</p>
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
