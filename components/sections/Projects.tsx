"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import Section from "@/components/ui/Section";
import TiltCard from "@/components/ui/TiltCard";
import BrowserFrame from "@/components/ui/BrowserFrame";
import { projects, coverFor, statusCopy } from "@/lib/projects";

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
      wash="left"
      className="bg-ink"
    >
      {lead && (
        <Reveal>
          <TiltCard tilt={2}>
            <Link
              href={`/projects/${lead.slug}`}
              className="plate lift group block p-2"
            >
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
                {/* The cover sits in window chrome. A gradient in a rounded
                    box is a swatch; the same gradient behind an address bar
                    is a screenshot of something that exists — which is the
                    claim a work section is making. */}
                <BrowserFrame
                  as="div"
                  label={lead.name}
                  className="relative sm:min-h-[360px]"
                >
                  <div className="relative aspect-[16/10] sm:absolute sm:inset-0 sm:top-[37px] sm:aspect-auto">
                    <Image
                      src={coverFor(lead.slug)}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 45vw"
                      className="media-hover object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <Badge>Featured</Badge>
                </BrowserFrame>

                <div className="flex flex-col justify-center px-4 py-6 sm:px-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="meta text-text-muted">
                        {lead.year} · {statusCopy[lead.status]}
                      </p>
                      <h3 className="text-display mt-2 text-[clamp(1.7rem,3.3vw,2.6rem)] text-text-primary transition-colors group-hover:text-primary-strong">
                        {lead.name}
                      </h3>
                    </div>
                    <Arrow size={22} className="mt-2" />
                  </div>

                  <p className="mt-4 text-pretty text-lg leading-relaxed text-text-secondary">
                    {lead.summary}
                  </p>

                  <Stack items={lead.stack.slice(0, 5)} />

                  <span className="btn-depth mt-7 inline-flex w-fit items-center gap-2 rounded-pill bg-primary px-5 py-3 font-geometric text-[0.9rem] font-medium text-on-primary">
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
              {/* Built to the hero card's proportions: p-2 around the media,
                  a badge sitting on the image, then a tight meta-over-name
                  row with the arrow held at the right edge. The inner radius
                  is the card's 22px minus its 8px padding, which is what
                  keeps the image corner concentric with the card corner
                  instead of drifting inside it. */}
              <Link
                href={`/projects/${p.slug}`}
                className="plate lift group flex h-full flex-col p-2"
              >
                <BrowserFrame as="div" compact label={p.name} className="relative">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={coverFor(p.slug)}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="media-hover object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  </div>
                  <Badge>{String(i + 2).padStart(2, "0")}</Badge>
                </BrowserFrame>

                <div className="flex flex-1 flex-col px-3 pb-2 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="meta truncate text-text-muted">
                        {p.year} · {statusCopy[p.status]}
                      </p>
                      <h3 className="mt-1.5 truncate font-geometric text-xl font-medium text-text-primary transition-colors group-hover:text-primary-strong">
                        {p.name}
                      </h3>
                    </div>
                    <Arrow size={18} className="mt-1.5" />
                  </div>

                  <p className="mt-3 text-pretty leading-relaxed text-text-secondary">
                    {p.summary}
                  </p>

                  <Stack items={p.stack.slice(0, 3)} className="mt-auto pt-5" />
                </div>
              </Link>
            </TiltCard>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/** The pill the hero sits on its cover. */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="meta absolute right-3 top-2.5 z-10 rounded-full bg-primary px-3 py-1 text-on-primary">
      {children}
    </span>
  );
}

/** The corner arrow, with the hero's lift-and-slide on hover. */
function Arrow({ size, className = "" }: { size: number; className?: string }) {
  return (
    <ArrowUpRight
      size={size}
      aria-hidden="true"
      className={`shrink-0 text-text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary ${className}`}
    />
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
