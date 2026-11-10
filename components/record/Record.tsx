import Link from "next/link";
import Masthead from "./Masthead";
import Reveal from "@/components/ui/Reveal";
import type { ProjectRow } from "@/types/database";
import type { ProjectStat } from "@/types/database";

/**
 * The record.
 *
 * This is where the site stops being atmosphere and starts being
 * information. The drive above it gives you the shape of the work;
 * this gives you the work.
 *
 * The organising idea is the one claim the whole site rests on — that
 * every figure here was read off a running system. So the figures are
 * the typography. A project's headline is not a photograph or a name
 * in a box, it is `43 / DATA MODELS`, `622 / COMMITS`, set large, with
 * the line underneath saying exactly where those came from. A number
 * without a provenance line is not allowed to appear, which is why
 * projects with nothing measured simply show none.
 *
 * Deliberately no cards: each project is a band between two hairlines,
 * full measure, so eight of them read as a ledger you can scan rather
 * than a grid you have to shop.
 */

const STATUS: Record<string, { label: string; tone: string }> = {
  live: { label: "Live", tone: "text-lime" },
  "in-progress": { label: "In progress", tone: "text-signal" },
  prototype: { label: "Prototype", tone: "text-text-muted" },
  concept: { label: "Concept", tone: "text-text-subtle" },
};

/**
 * Most figures are counts and want to be set huge. A few are words —
 * `Multi`, `Yes`, `Staff / Student / Admin` — and setting those at
 * numeral scale would wrap into nonsense.
 *
 * The decision is made once per project rather than per figure: a row
 * reading `Multi` at body size beside `Yes` at display size looks like
 * a rendering fault, not a choice. If anything in the set is a word,
 * the whole set is set small.
 */
function Figure({ stat, big }: { stat: ProjectStat; big: boolean }) {
  return (
    <div className="min-w-0">
      <p
        className={
          big
            ? "font-display text-[clamp(2.4rem,4.6vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-text tabular-nums"
            : "font-display text-[clamp(1.1rem,1.9vw,1.4rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-text"
        }
      >
        {stat.value}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase leading-snug tracking-[0.22em] text-text-subtle">
        {stat.label}
      </p>
    </div>
  );
}

function Entry({ project, n }: { project: ProjectRow; n: number }) {
  const status = STATUS[project.status] ?? STATUS.concept;
  const stats = project.stats ?? [];
  const big = stats.every((s) => s.value.length <= 4);
  const measured = stats.length > 0;

  return (
    <Reveal variant="rise" as="article">
      <div
        id={`project-${project.slug}`}
        className="group scroll-mt-24 border-t border-rule py-12 transition-colors duration-500 hover:border-signal/50 sm:py-16"
      >
        {/* Slug line. */}
        <div className="flex items-baseline justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.24em]">
          <span className="text-text-subtle">
            {String(n).padStart(2, "0")}
            <span className={`ml-5 ${status.tone}`}>{status.label}</span>
          </span>
          <span className="text-text-subtle">{project.year}</span>
        </div>

        <div
          className={`mt-7 grid gap-10 lg:gap-16 ${
            measured ? "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" : "lg:grid-cols-1"
          }`}
        >
          {/* Left: what it is. */}
          <div className="min-w-0">
            <h3 className="font-display text-[clamp(1.9rem,3.6vw,3rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-text">
              <Link
                href={`/projects/${project.slug}`}
                className="transition-colors duration-300 hover:text-signal focus-visible:text-signal"
              >
                {project.name}
              </Link>
            </h3>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-text-muted sm:text-[16px]">
              {project.summary}
            </p>

            {project.categories?.length ? (
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-text-subtle">
                {project.categories.join("  ·  ")}
              </p>
            ) : null}

            {!measured ? (
              <p className="mt-6 max-w-xl border-l border-rule-strong pl-4 text-[12px] leading-relaxed text-text-subtle">
                Nothing on this one has been measured off a running instance yet, so it shows no
                figures rather than an estimate.
              </p>
            ) : null}
          </div>

          {/* Right: what it measures. */}
          {measured ? (
            <div className="min-w-0">
              <div
                className={`grid gap-x-10 gap-y-8 ${
                  stats.length > 2 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
                }`}
              >
                {stats.map((s) => (
                  <Figure key={s.label} stat={s} big={big} />
                ))}
              </div>

              {project.evidence ? (
                <p className="mt-8 flex gap-3 border-l border-lime/50 pl-4 text-[12px] leading-relaxed text-text-subtle">
                  <span aria-hidden="true" className="font-mono text-lime">
                    ↳
                  </span>
                  {project.evidence}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Foot: what it is made of, and the way in. */}
        <div className="mt-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <p className="max-w-2xl font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-text-subtle">
            {project.stack.join("  ·  ")}
          </p>
          <Link
            href={`/projects/${project.slug}`}
            className="group/link shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-signal transition-colors hover:text-signal-bright"
          >
            Open the case study
            <span
              aria-hidden="true"
              className="ml-3 inline-block transition-transform duration-300 group-hover/link:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

export default function Record({ projects }: { projects: ProjectRow[] }) {
  const figures = projects.reduce((n, p) => n + (p.stats?.length ?? 0), 0);
  const live = projects.filter((p) => p.status === "live").length;

  return (
    <section
      aria-label="The record"
      className="border-t border-rule bg-ink px-6 py-28 sm:px-12 sm:py-36 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <Masthead
          id="record"
          index="02"
          title="The record"
          lead={`${projects.length} systems. ${figures} figures. Every one read off something that runs.`}
          note={`${live} of them are live. The rest are in progress or at prototype, and they say which. Where a project has nothing measured, it shows no numbers rather than an estimate.`}
        />

        {/* The manifest. Eight tall bands are thorough but not
            scannable; this is the whole list in one line, so you can
            see what is here before deciding how far to read. */}
        <Reveal variant="rise" delay={0.1}>
          <p className="mt-12 flex flex-wrap gap-x-5 gap-y-2 border-t border-rule pt-7 font-mono text-[11px] uppercase tracking-[0.18em]">
            {projects.map((p, i) => (
              <span key={p.id} className="text-text-muted">
                <a
                  href={`#project-${p.slug}`}
                  className="transition-colors hover:text-signal"
                >
                  {p.name}
                </a>
                {i < projects.length - 1 ? (
                  <span aria-hidden="true" className="ml-5 text-text-subtle">
                    ·
                  </span>
                ) : null}
              </span>
            ))}
          </p>
        </Reveal>

        <div className="mt-20">
          {projects.map((p, i) => (
            <Entry key={p.id} project={p} n={i + 1} />
          ))}
          <div className="border-t border-rule" />
        </div>
      </div>
    </section>
  );
}
