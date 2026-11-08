"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { lerp } from "@/lib/motion";
import { mediaUrl } from "@/lib/supabase/env";
import { STATUS_LABEL } from "@/lib/utils/format";
import type { ProjectRow, SectionRow } from "@/types/database";

/**
 * Everything, as an index.
 *
 * The rack above is the guided tour; this is the directory, and it is
 * deliberately the opposite shape — a dense ruled table of every
 * project with its year, categories, stack depth and status, the way
 * you would actually scan a body of work rather than browse it.
 *
 * The images come back on demand: hovering a row flies the cover in on
 * a plate that trails the pointer and tilts with the direction of
 * travel. All covers live in one stacked container that is moved by a
 * single rAF loop writing one transform — not one element per row —
 * so the cost does not grow with the number of projects.
 *
 * Below `md` the plate is dropped (there is no hover to trail) and the
 * rows become cards carrying their own thumbnail, which is the right
 * shape for a thumb rather than a shrunken table.
 */
export default function ProjectIndex({
  section,
  projects,
}: {
  section: SectionRow;
  projects: ProjectRow[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const plate = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = plate.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const pointer = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let lastX = 0;
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const tick = () => {
      current.x = lerp(current.x, pointer.x, 0.13);
      current.y = lerp(current.y, pointer.y, 0.13);
      // Tilt proportional to horizontal velocity — the plate banks into
      // the movement and settles level, which reads as weight.
      const velocity = current.x - lastX;
      lastX = current.x;
      const tilt = Math.max(-12, Math.min(12, velocity * 0.6));
      el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section id="work-grid" className="relative px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader section={section} index="04" />
          <p className="note hidden md:block">
            {String(projects.length).padStart(2, "0")} entries · hover to preview
          </p>
        </div>

        {/* ------------ index table (md and up) ------------ */}
        <div ref={list} className="mt-12 hidden md:block" onPointerLeave={() => setHovered(null)}>
          <div className="grid grid-cols-[48px_1fr_90px_1fr_130px_40px] gap-4 border-b border-rule-strong pb-3">
            {["", "Project", "Year", "Domain", "Status", ""].map((head, i) => (
              <span key={i} className="note">
                {head}
              </span>
            ))}
          </div>

          <Reveal variant="stack" stagger={0.05}>
            {projects.map((project, i) => {
              const on = hovered === i;
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  onPointerEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  data-cursor-label="Open"
                  className="group relative grid grid-cols-[48px_1fr_90px_1fr_130px_40px] items-center gap-4 border-b border-rule py-5"
                >
                  {/* Row energises from the left on approach. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-12px] inset-y-0 origin-left bg-signal/[0.06] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: `scaleX(${on ? 1 : 0})` }}
                  />

                  <span
                    className={`relative font-mono text-xs transition-colors ${
                      on ? "text-signal" : "text-text-subtle"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`relative font-display text-xl font-semibold transition-all duration-500 ${
                      on ? "translate-x-1 text-signal" : "text-text"
                    }`}
                  >
                    {project.name}
                  </span>

                  <span className="relative font-mono text-xs text-text-muted">{project.year}</span>

                  <span className="relative truncate text-sm text-text-muted">
                    {project.categories.slice(0, 2).join(", ")}
                  </span>

                  <span className="relative">
                    <span className={`reg ${on ? "reg-signal" : ""}`}>
                      {STATUS_LABEL[project.status]}
                    </span>
                  </span>

                  <span
                    className={`relative justify-self-end transition-all duration-500 ${
                      on ? "translate-x-0 text-signal opacity-100" : "-translate-x-2 opacity-0"
                    }`}
                  >
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
              );
            })}
          </Reveal>
        </div>

        {/* ------------ cards (below md) ------------ */}
        <Reveal variant="stack" className="mt-10 grid gap-4 sm:grid-cols-2 md:hidden" stagger={0.06}>
          {projects.map((project, i) => {
            const cover = mediaUrl(project.cover_path);
            return (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="board board-sm relative block overflow-hidden"
              >
                <span className="ticks" />
                <div className="relative m-2.5 aspect-[16/10] overflow-hidden border border-rule">
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 45vw, 92vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-4 pt-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold text-text">{project.name}</h3>
                    <span className="font-mono text-[10px] text-text-subtle">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-text-muted">
                    {project.summary}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="reg reg-signal">{STATUS_LABEL[project.status]}</span>
                    <span className="reg">{project.year}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </Reveal>
      </div>

      {/* The trailing preview plate. Fixed, pointer-events-none, and
          only ever one in the DOM regardless of row count. */}
      <div
        ref={plate}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-[240px] w-[330px] md:block"
        style={{
          opacity: hovered === null ? 0 : 1,
          scale: hovered === null ? "0.9" : "1",
          transition: "opacity 420ms cubic-bezier(0.22,1,0.36,1), scale 420ms cubic-bezier(0.22,1,0.36,1)",
          clipPath:
            "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
        }}
      >
        {projects.map((project, i) => {
          const cover = mediaUrl(project.cover_path);
          if (!cover) return null;
          return (
            <Image
              key={project.id}
              src={cover}
              alt=""
              fill
              sizes="330px"
              className="object-cover transition-opacity duration-300"
              style={{ opacity: hovered === i ? 1 : 0 }}
            />
          );
        })}
        <span className="absolute inset-0 border border-signal/40" />
      </div>
    </section>
  );
}
