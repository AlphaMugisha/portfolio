"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import SectionHeader from "@/components/ui/SectionHeader";
import Counter from "@/components/ui/Counter";
import { mediaUrl } from "@/lib/supabase/env";
import { STATUS_LABEL } from "@/lib/utils/format";
import type { ProjectRow, SectionRow } from "@/types/database";

/**
 * Selected work, as a rack you travel along.
 *
 * On a pointer device the section pins and the rack moves sideways
 * under vertical scroll, so the featured projects are something you
 * travel THROUGH rather than a column you fall past. Each panel's
 * cover counter-scrolls inside its frame, which is what gives the
 * movement depth instead of making it a sliding strip.
 *
 * On touch the pin is dropped entirely and the same markup becomes a
 * native scroll-snap carousel. That is not a fallback — a pinned,
 * scrubbed horizontal scroll fights a touch surface that already has
 * momentum physics, so the right adaptation is to hand the gesture back
 * to the OS. `gsap.matchMedia` owns the switch, so rotating a tablet
 * rebuilds the correct behaviour rather than leaving a stale pin.
 *
 * The two treatments are the point of the layout:
 *   SOFTWARE projects are framed as a running application — a viewport
 *     with a chrome bar and the verified counts read out beneath it.
 *   HARDWARE projects are framed as a board — the cover sits between
 *     two pin headers labelled with the actual components from the
 *     project's own stack, because a greenhouse controller is not a web
 *     app and should not be presented as a screenshot of one.
 */

const HARDWARE = new Set(["Embedded Systems", "IoT", "Robotics"]);

function isHardware(project: ProjectRow) {
  return project.categories.some((c) => HARDWARE.has(c));
}

export default function WorkRack({
  section,
  projects,
}: {
  section: SectionRow;
  projects: ProjectRow[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const trackEl = track.current;
          const rootEl = root.current;
          if (!trackEl || !rootEl) return;

          // Measured in a function so `invalidateOnRefresh` re-reads it
          // after a resize or a late font load instead of pinning to a
          // stale width and leaving dead space at the end of the rack.
          const distance = () => Math.max(0, trackEl.scrollWidth - window.innerWidth);

          const drive = gsap.to(trackEl, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: rootEl,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              anticipatePin: 1,
              onUpdate: (self) => {
                if (progress.current) {
                  progress.current.style.transform = `scaleX(${self.progress})`;
                }
              },
            },
          });

          // Covers counter-scroll within their frames. Driven by
          // `containerAnimation`, which is how a ScrollTrigger reads
          // position along a horizontal tween rather than the page.
          const covers = gsap.utils.toArray<HTMLElement>("[data-cover]", trackEl);
          covers.forEach((cover) => {
            gsap.fromTo(
              cover,
              { xPercent: -8 },
              {
                xPercent: 8,
                ease: "none",
                scrollTrigger: {
                  trigger: cover.parentElement!,
                  containerAnimation: drive,
                  start: "left right",
                  end: "right left",
                  scrub: true,
                },
              },
            );
          });

          const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", trackEl);
          panels.forEach((panel) => {
            gsap.from(panel.querySelectorAll("[data-panel-in]"), {
              opacity: 0,
              y: 26,
              duration: 0.7,
              stagger: 0.07,
              ease: "power3.out",
              scrollTrigger: {
                trigger: panel,
                containerAnimation: drive,
                start: "left 78%",
                once: true,
              },
            });
          });

          return () => {
            drive.kill();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  // Keep measurements honest when images finish decoding.
  useGSAP(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 450);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <section id="work" className="relative">
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-20 lg:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader section={section} index="03" />
          <p className="note hidden md:block">
            Drag or scroll — {projects.length} featured
          </p>
        </div>
      </div>

      <div ref={root} className="relative">
        <div
          ref={viewport}
          className="
            flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-14
            md:h-[100svh] md:items-center md:gap-0 md:overflow-hidden md:px-0 md:pb-0
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
          "
        >
          <div ref={track} className="flex gap-5 md:gap-8 md:pl-[6vw] md:pr-[12vw]">
            {projects.map((project, i) => (
              <Panel key={project.id} project={project} index={i} total={projects.length} />
            ))}
          </div>
        </div>

        {/* Position through the rack. */}
        <div className="pointer-events-none absolute inset-x-6 bottom-8 hidden items-center gap-4 md:flex">
          <span className="note shrink-0">Rack</span>
          <span className="h-px flex-1 bg-rule">
            <span
              ref={progress}
              className="block h-full origin-left scale-x-0 bg-signal"
            />
          </span>
          <span className="note shrink-0">{String(projects.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}

function Panel({
  project,
  index,
  total,
}: {
  project: ProjectRow;
  index: number;
  total: number;
}) {
  const hardware = isHardware(project);
  const cover = mediaUrl(project.cover_path);
  // The components a hardware build is actually made of, as pin labels.
  const pins = project.stack.slice(0, 6);

  return (
    <article
      data-panel
      className="
        w-[86vw] shrink-0 snap-center
        sm:w-[70vw] md:w-[62vw] lg:w-[52vw] xl:w-[46vw]
      "
    >
      <div className="board board-lg relative p-5 sm:p-7">
        <span className="ticks" />

        <header data-panel-in className="mb-5 flex items-start justify-between gap-4">
          <div>
            <span className="note note-signal">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              {project.name}
            </h3>
          </div>
          <span className="reg reg-signal shrink-0">{STATUS_LABEL[project.status]}</span>
        </header>

        {hardware ? (
          <HardwareFrame cover={cover} pins={pins} name={project.name} />
        ) : (
          <SoftwareFrame cover={cover} slug={project.slug} name={project.name} />
        )}

        <p data-panel-in className="mt-5 text-[15px] leading-relaxed text-text-muted">
          {project.summary}
        </p>

        {project.stats.length ? (
          <dl data-panel-in className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {project.stats.slice(0, 4).map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="note">{stat.label}</dt>
                <dd className="font-display text-2xl font-semibold text-signal">
                  <Counter value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <footer data-panel-in className="mt-6 flex items-center justify-between gap-4">
          <span className="note truncate">{project.stack.slice(0, 3).join(" · ")}</span>
          <Link
            href={`/projects/${project.slug}`}
            className="group inline-flex shrink-0 items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-signal"
            data-cursor-label="Open"
          >
            Case study
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </footer>
      </div>
    </article>
  );
}

/** A running application: viewport with chrome. */
function SoftwareFrame({
  cover,
  slug,
  name,
}: {
  cover: string;
  slug: string;
  name: string;
}) {
  return (
    <div data-panel-in className="border border-rule bg-ink-deep">
      <div className="flex items-center gap-2 border-b border-rule px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-text-subtle/50" />
          <span className="h-1.5 w-1.5 rounded-full bg-text-subtle/50" />
          <span className="h-1.5 w-1.5 rounded-full bg-signal/60" />
        </span>
        <span className="truncate font-mono text-[10px] tracking-[0.1em] text-text-subtle">
          /{slug}
        </span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">
        {cover ? (
          <Image
            data-cover
            src={cover}
            alt={`${name} interface`}
            fill
            sizes="(min-width: 1280px) 46vw, (min-width: 768px) 62vw, 86vw"
            className="scale-[1.15] object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}

/** A board: cover between two labelled pin headers. */
function HardwareFrame({
  cover,
  pins,
  name,
}: {
  cover: string;
  pins: string[];
  name: string;
}) {
  const left = pins.filter((_, i) => i % 2 === 0);
  const right = pins.filter((_, i) => i % 2 === 1);

  return (
    <div data-panel-in className="flex items-stretch gap-2 border border-rule bg-ink-deep p-2">
      <PinHeader pins={left} side="left" />
      <div className="relative aspect-[4/3] flex-1 overflow-hidden">
        {cover ? (
          <Image
            data-cover
            src={cover}
            alt={`${name} hardware`}
            fill
            sizes="(min-width: 1280px) 40vw, (min-width: 768px) 54vw, 78vw"
            className="scale-[1.15] object-cover"
          />
        ) : null}
        {/* A faint read-sweep, marking this as an instrument view
            rather than a product screenshot. */}
        <span className="scan-line" style={{ animationDuration: "5s" }} aria-hidden="true" />
      </div>
      <PinHeader pins={right} side="right" />
    </div>
  );
}

function PinHeader({ pins, side }: { pins: string[]; side: "left" | "right" }) {
  return (
    <ul
      className="flex w-7 shrink-0 flex-col justify-around sm:w-9"
      aria-hidden="true"
    >
      {pins.map((pin) => (
        <li key={pin} className="flex items-center gap-1.5">
          {side === "right" ? (
            <span className="flex-1 text-right font-mono text-[7px] uppercase leading-tight tracking-tight text-text-subtle sm:text-[8px]">
              {pin}
            </span>
          ) : null}
          <span className="h-2 w-2 shrink-0 border border-signal-deep bg-ink" />
          {side === "left" ? (
            <span className="flex-1 font-mono text-[7px] uppercase leading-tight tracking-tight text-text-subtle sm:text-[8px]">
              {pin}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
