"use client";

import Image from "next/image";
import {
  Reveal,
  Stagger,
  StaggerItem,
  Counter,
} from "@/components/ui/motion-primitives";
import TiltCard from "@/components/ui/TiltCard";
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
 * The portrait carries a small overlapping plate, the same opposed-tilt
 * device the hero uses, so the two image moments on the page belong to one
 * language rather than being unrelated treatments.
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
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-16">
        <div className="relative">
          {/* The reveal wraps TiltCard rather than sitting inside it.
              Nested within TiltCard's 3D-transformed layer, the viewport
              observer never fired — and a clip-path reveal that never fires
              does not degrade to "unanimated", it leaves the portrait
              permanently invisible. Every other reveal on this page sits
              outside a transformed ancestor and works; this one now does
              too. */}
          <Reveal y={22}>
            <TiltCard tilt={3} className="plate p-2.5 lg:-rotate-1">
              <div className="relative overflow-hidden rounded-tile">
                <Image
                  src="/images/portrait.jpg"
                  alt={`Portrait of ${site.name}`}
                  width={1200}
                  height={1500}
                  sizes="(max-width: 1024px) 100vw, 28vw"
                  className="aspect-4/5 w-full rounded-tile object-cover"
                />
                <span className="meta absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1.5 text-text-secondary backdrop-blur">
                  {site.location}
                </span>
              </div>
            </TiltCard>
          </Reveal>

          {/* The signature plate, leaning against the portrait's tilt —
              the same device the hero uses on its pile. */}
          <Reveal delay={0.25}>
            <div className="plate absolute -bottom-6 -right-3 z-10 flex items-center gap-3 px-4 py-3 lg:rotate-2">
              <span className="script text-2xl leading-none text-text-primary">
                {site.shortName.toLowerCase()}
              </span>
              <span className="h-7 w-px bg-line" aria-hidden="true" />
              <span className="meta text-primary-strong">
                {new Date().getFullYear()}
              </span>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-col justify-center">
          <div className="space-y-5 text-pretty leading-relaxed text-text-secondary">
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
              portrait plate sitting right beside them. */}
          <Stagger
            className="mt-10 grid grid-cols-2 gap-x-8 border-t border-line"
            stagger={0.06}
          >
            {FACTS.map((f) => (
              <StaggerItem key={f.label}>
                <div className="border-b border-line py-4">
                  <p className="meta text-primary-strong">{f.label}</p>
                  <p className="mt-2 leading-snug text-text-primary">
                    {f.value}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>

      {/* ---- the figures, as a strip ---------------------------- */}
      <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line-panel bg-line sm:grid-cols-3">
        {FIGURES.map((f, i) => (
          <Reveal key={f.label} delay={i * 0.08} className="h-full">
            {/* Each cell is opaque over a 1px gap, so the "dividers" are the
                container showing through — one rule between cells, and none
                on the outside where the border already is. */}
            <div className="h-full bg-surface px-6 py-8">
              <p className="text-mega text-[clamp(2.6rem,5.6vw,4rem)] text-primary">
                <Counter value={f.value} suffix={f.suffix} />
              </p>
              <p className="meta mt-3 text-text-muted">{f.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
