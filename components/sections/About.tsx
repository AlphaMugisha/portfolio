"use client";

import Image from "next/image";
import {
  Reveal,
  Stagger,
  StaggerItem,
  Counter,
} from "@/components/ui/motion-primitives";
import Section from "@/components/ui/Section";
import { site } from "@/lib/site";

/**
 * About.
 *
 * The statement that used to sit here as a second large heading is now the
 * section heading itself. Two display lines stacked — "The person behind the
 * work" and "I build systems where software meets hardware" — were saying
 * the same thing twice at the same size, and the better sentence deserved
 * the bigger position.
 *
 * The portrait is a plain framed image now: no plate padding, no tilt, no
 * 3D response to the pointer. A photograph in a luxury layout is held by its
 * own edge and by the white around it, and every device added on top of that
 * — a mount, a rotation, a glow following the cursor — reads as a widget.
 */

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
  return (
    <Section
      id="about"
      eyebrow="About"
      title="I build systems where"
      accent="software meets hardware."
      description="How I got into this, what I reach for first, and the habits the work came from."
      wash="left"
      className="bg-ink"
    >
      {/* ---- portrait and prose --------------------------------- */}
      <div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-20">
        <div className="relative">
          <Reveal y={22}>
            <div className="relative overflow-hidden rounded-card border border-line-panel">
              <Image
                src="/images/portrait.jpg"
                alt={`Portrait of ${site.name}`}
                width={1200}
                height={1500}
                sizes="(max-width: 1024px) 100vw, 28vw"
                className="aspect-4/5 w-full object-cover"
              />
            </div>
          </Reveal>

          {/* The signature, sitting on the rule under the portrait rather
              than floating over its corner on an angle. */}
          <Reveal delay={0.2}>
            <div className="mt-5 flex items-center gap-4 border-t border-line pt-4">
              <span className="script text-2xl leading-none text-text-primary">
                {site.shortName.toLowerCase()}
              </span>
              <span className="h-5 w-px bg-line" aria-hidden="true" />
              <span className="meta text-text-muted">{site.location}</span>
              <span className="meta ml-auto text-text-primary">
                {new Date().getFullYear()}
              </span>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col justify-center">
          <div className="space-y-6 text-pretty text-text-secondary">
            <Reveal delay={0.05}>
              <p>
                My work begins with the data. Before a screen exists there is a
                schema, a set of roles, and a clear idea of who needs to do
                what. That discipline came from starting with hardware, where a
                system either behaves correctly or visibly does not.
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

          {/* Facts as a spec table, not four boxes. Hairlines are enough
              separation at this size, and boxes here would compete with the
              portrait beside them. */}
          <Stagger
            className="mt-14 grid grid-cols-2 gap-x-10 border-t border-line"
            stagger={0.06}
          >
            {FACTS.map((f) => (
              <StaggerItem key={f.label}>
                <div className="border-b border-line py-5">
                  <p className="meta text-text-primary">{f.label}</p>
                  <p className="text-editorial mt-2 text-lg text-text-primary">
                    {f.value}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>

      {/* ---- the figures ----------------------------------------
          Three numbers on one rule, separated by hairlines. They used to sit
          in a bordered strip of filled cells; at this size the numeral is
          the object, and putting a box around a numeral only makes it a
          statistic on a dashboard. */}
      <div className="mt-24 grid grid-cols-1 border-t border-line sm:grid-cols-3">
        {FIGURES.map((f, i) => (
          <Reveal key={f.label} delay={i * 0.08} className="h-full">
            {/* The divider is decided by the index, not by `first:`. Each cell
                is wrapped in its own Reveal, so every cell IS the first child
                of its wrapper and a `first:` variant would strip the rule off
                all three. */}
            <div
              className={`h-full border-b border-line py-10 sm:border-b-0 sm:py-12 ${
                i > 0 ? "sm:border-l sm:pl-10" : ""
              }`}
            >
              <p className="text-mega text-[clamp(3.2rem,7vw,5.5rem)] text-text-primary">
                <Counter value={f.value} suffix={f.suffix} />
              </p>
              <p className="meta mt-4 text-text-muted">{f.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
