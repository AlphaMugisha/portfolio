"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import Section from "@/components/ui/Section";
import TiltCard from "@/components/ui/TiltCard";
import { projects, coverFor, statusCopy, type Project } from "@/lib/projects";

/**
 * Selected work.
 *
 * The first project after the hero's gets a full-width landscape row of its
 * own; everything after it sits in a two-up grid. A page where every project
 * is the same size tells a visitor nothing about which one to read, and that
 * was the flaw in the uniform grid this replaces.
 *
 * The hero already carries `projects[0]`, so this starts at [1] — the same
 * cover twice on one screen reads as a bug.
 */
export default function Projects() {
  const [lead, ...rest] = projects.slice(1);

  return (
    <Section
      id="projects"
      eyebrow="Selected work"
      title="Things I have"
      accent="built and shipped."
      description="Platforms, connected hardware and applied AI — built for real organisations, not for a tutorial."
      aside={<p className="meta text-text-muted">{projects.length} projects</p>}
      className="bg-ink"
    >
      {lead && (
        <Reveal>
          <TiltCard tilt={2}>
            <Link
              href={`/projects/${lead.slug}`}
              className="plate lift group block p-2.5"
            >
              <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-tile sm:aspect-auto sm:min-h-[340px]">
                  <Image
                    src={coverFor(lead.slug)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 45vw"
                    className="media-hover object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>

                <div className="flex flex-col justify-center p-5 sm:p-8">
                  <Meta project={lead} number="01" />

                  <h3 className="text-display mt-4 text-[clamp(1.7rem,3.3vw,2.6rem)] text-text-primary transition-colors group-hover:text-primary-strong">
                    {lead.name}
                  </h3>

                  <p className="mt-4 text-pretty text-lg leading-relaxed text-text-secondary">
                    {lead.summary}
                  </p>

                  <Stack items={lead.stack.slice(0, 5)} />

                  <span className="mt-7 inline-flex items-center gap-2 font-geometric text-[0.95rem] font-medium text-primary-strong">
                    Read the case study
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </Link>
          </TiltCard>
        </Reveal>
      )}

      <Stagger className="mt-6 grid gap-6 sm:grid-cols-2" stagger={0.09}>
        {rest.map((p, i) => (
          <StaggerItem key={p.slug} className="h-full">
            <TiltCard tilt={4} className="h-full">
              <Link
                href={`/projects/${p.slug}`}
                className="plate lift group flex h-full flex-col p-2.5"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-tile">
                  <Image
                    src={coverFor(p.slug)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="media-hover object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <Meta project={p} number={String(i + 2).padStart(2, "0")} />

                  <h3 className="text-editorial mt-3 flex items-baseline justify-between gap-3 text-2xl text-text-primary transition-colors group-hover:text-primary-strong">
                    {p.name}
                    <ArrowUpRight
                      size={17}
                      aria-hidden="true"
                      className="shrink-0 text-text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </h3>

                  <p className="mt-2.5 text-pretty leading-relaxed text-text-secondary">
                    {p.summary}
                  </p>

                  <Stack items={p.stack.slice(0, 3)} className="mt-auto pt-4" />
                </div>
              </Link>
            </TiltCard>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/** Number, year and status — the same line on every card. */
function Meta({ project, number }: { project: Project; number: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="meta text-text-muted">
        {number} / {project.year}
      </span>
      <span className="meta flex items-center gap-2 text-text-secondary">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
        {statusCopy[project.status]}
      </span>
    </div>
  );
}

function Stack({
  items,
  className = "mt-6",
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((t) => (
        <li
          key={t}
          className="chip px-3.5 py-1.5 font-geometric text-text-muted"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}
