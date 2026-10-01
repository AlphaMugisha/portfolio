"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion-primitives";
import Section from "@/components/ui/Section";
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
 * Each entry is a catalogue plate: a framed cover, then the facts underneath
 * on a hairline — index, year, status, the name in the display serif. The
 * pointer does one thing and one thing only, over a second and a half: the
 * cover comes back to full colour and creeps up in scale. Nothing rotates,
 * nothing lifts, no light follows the cursor across the surface.
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
          <Link
            href={`/projects/${lead.slug}`}
            className="plate lift group block overflow-hidden"
          >
            <div className="grid sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="relative overflow-hidden border-b border-line-panel sm:border-b-0 sm:border-r">
                <div className="relative aspect-16/10 sm:h-full sm:min-h-[420px]">
                  <Image
                    src={coverFor(lead.slug)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 45vw"
                    className="media-hover object-cover group-hover:scale-[1.03]"
                  />
                </div>
                <Badge>Featured</Badge>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-12">
                <div className="flex items-start justify-between gap-6 border-b border-line pb-4">
                  <p className="meta text-text-muted">
                    {lead.year} · {statusCopy[lead.status]}
                  </p>
                  <Arrow size={20} />
                </div>

                <h3 className="text-display mt-7 text-[clamp(2rem,3.6vw,3.2rem)] text-text-primary transition-colors duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-text-primary">
                  {lead.name}
                </h3>

                <p className="mt-5 max-w-[46ch] text-pretty text-text-secondary">
                  {lead.summary}
                </p>

                <Stack items={lead.stack.slice(0, 5)} />

                <span className="btn-depth label-ui mt-10 inline-flex w-fit items-center gap-3 rounded-pill bg-primary px-7 py-4 text-on-primary group-hover:bg-primary-strong">
                  Read the case study
                  <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      )}

      <Stagger className="mt-8 grid gap-8 sm:grid-cols-2" stagger={0.09}>
        {rest.map((p, i) => (
          <StaggerItem key={p.slug} className="h-full">
            <Link
              href={`/projects/${p.slug}`}
              className="group flex h-full flex-col"
            >
              <BrowserFrame
                as="div"
                compact
                label={p.name}
                className="lift relative"
              >
                <div className="relative aspect-16/10 overflow-hidden">
                  <Image
                    src={coverFor(p.slug)}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="media-hover object-cover group-hover:scale-[1.04]"
                  />
                </div>
              </BrowserFrame>

              {/* The facts sit on a rule below the frame rather than inside a
                  second box — the plate holds the image, the page holds the
                  caption. */}
              <div className="flex flex-1 flex-col border-t border-line pt-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="meta truncate text-text-muted">
                    <span className="text-text-primary">
                      {String(i + 2).padStart(2, "0")}
                    </span>{" "}
                    · {p.year} · {statusCopy[p.status]}
                  </p>
                  <Arrow size={16} />
                </div>

                <h3 className="text-display mt-3 text-2xl text-text-primary transition-colors duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-text-primary sm:text-3xl">
                  {p.name}
                </h3>

                <p className="mt-3 text-pretty text-text-secondary">
                  {p.summary}
                </p>

                <Stack items={p.stack.slice(0, 3)} className="mt-auto pt-6" />
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/** The mark on the lead cover. Square-cornered, like everything else. */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="meta absolute left-4 top-4 z-10 rounded-pill bg-primary px-3 py-1.5 text-on-primary">
      {children}
    </span>
  );
}

/** The corner arrow, with the site's lift-and-slide on hover. */
function Arrow({ size, className = "" }: { size: number; className?: string }) {
  return (
    <ArrowUpRight
      size={size}
      aria-hidden="true"
      className={`shrink-0 text-text-muted transition-all duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary ${className}`}
    />
  );
}

function Stack({
  items,
  className = "mt-7",
}: {
  items: string[];
  className?: string;
}) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((t) => (
        <li key={t} className="chip px-3.5 py-2 text-text-muted">
          {t}
        </li>
      ))}
    </ul>
  );
}
