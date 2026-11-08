"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Counter from "@/components/ui/Counter";
import { mediaUrl } from "@/lib/supabase/env";
import { disciplines } from "@/lib/site";
import type { MapTotals } from "@/lib/signal-map";
import type { SectionRow, SiteSettingsRow } from "@/types/database";

/**
 * About, laid out as a component datasheet.
 *
 * Every other section treats Alpha's work as the subject; this one
 * treats Alpha as the part — a device with a photograph, a description
 * and a parameter table. It is the one place the porcelain surface is
 * used, and the contrast flip is deliberate: after a long dark board,
 * a lit page-white panel arriving on a left-to-right curtain is the
 * strongest punctuation available without inventing a second colour.
 *
 * The portrait is an instrument view, not a headshot. Moving the
 * pointer across it drags a readout crosshair with live normalised
 * coordinates, and a sweep runs the frame continuously — it rewards
 * poking at it, which is the whole thesis of the site applied to the
 * one photograph on the page.
 *
 * Every figure in the parameter table is counted from real data at
 * build time (`mapTotals`, the projects array), never typed in.
 */
export default function About({
  section,
  settings,
  projectCount,
  journeyCount,
  totals,
}: {
  section: SectionRow;
  settings: SiteSettingsRow;
  projectCount: number;
  journeyCount: number;
  totals: MapTotals;
}) {
  const paragraphs = settings.about_body_md.split("\n\n").filter(Boolean);

  const params: { k: string; v: string }[] = [
    { k: "Designation", v: settings.role },
    { k: "Location", v: settings.location },
    { k: "Disciplines", v: String(disciplines.length) },
    { k: "Status", v: settings.availability },
  ];

  const figures: { value: string; label: string }[] = [
    { value: String(projectCount), label: "Projects documented" },
    { value: String(totals.tools), label: "Tools in the index" },
    { value: String(totals.connections), label: "Verified tool links" },
    { value: String(journeyCount), label: "Stages of the journey" },
  ];

  return (
    <section id="about" className="relative px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader section={section} index="01" />

        <Reveal variant="curtain" className="mt-12">
          <div className="board board-lg relative bg-porcelain text-porcelain-ink">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[300px_1fr] lg:gap-14">
              <Portrait
                src={mediaUrl(settings.portrait_path)}
                alt={settings.portrait_alt}
                name={settings.short_name}
              />

              <div className="min-w-0">
                <div className="space-y-5">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-lg leading-relaxed text-porcelain-ink/80">
                      {p}
                    </p>
                  ))}
                </div>

                {/* Parameter table — the datasheet proper. */}
                <dl className="mt-9 grid grid-cols-2 gap-px overflow-hidden border border-porcelain-ink/15 bg-porcelain-ink/15 sm:grid-cols-4">
                  {params.map((param) => (
                    <div
                      key={param.k}
                      className="group bg-porcelain px-4 py-3 transition-colors hover:bg-porcelain-bright"
                    >
                      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-porcelain-ink/50">
                        {param.k}
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-porcelain-ink">{param.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Counted figures, back on the dark board. */}
        <Reveal
          variant="stack"
          className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4"
          stagger={0.08}
        >
          {figures.map((figure) => (
            <div key={figure.label} className="board board-sm relative p-5">
              <span className="ticks" />
              <p className="font-display text-4xl font-semibold text-signal">
                <Counter value={figure.value} />
              </p>
              <p className="note mt-2">{figure.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The portrait as an instrument view: a crosshair follows the pointer
 * and reports normalised coordinates, over a continuous sweep.
 *
 * State is only two numbers and only updates while the pointer is
 * inside the frame, so this costs nothing when nobody is touching it.
 * It is purely additive — the photograph is a plain, complete
 * `next/image` underneath, and on touch or reduced motion the overlay
 * simply never appears.
 */
function Portrait({ src, alt, name }: { src: string; alt: string; name: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const [probe, setProbe] = useState<{ x: number; y: number } | null>(null);

  const onMove = (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const box = frame.current?.getBoundingClientRect();
    if (!box) return;
    setProbe({
      x: (event.clientX - box.left) / box.width,
      y: (event.clientY - box.top) / box.height,
    });
  };

  return (
    <figure className="min-w-0">
      <div
        ref={frame}
        onPointerMove={onMove}
        onPointerLeave={() => setProbe(null)}
        className="relative aspect-square w-full overflow-hidden border border-porcelain-ink/20"
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 300px, 100vw"
          className="object-cover"
        />

        <span className="scan-line opacity-60" style={{ animationDuration: "4.5s" }} aria-hidden="true" />

        {probe ? (
          <span aria-hidden="true">
            <span
              className="pointer-events-none absolute inset-y-0 w-px bg-signal/70"
              style={{ left: `${probe.x * 100}%` }}
            />
            <span
              className="pointer-events-none absolute inset-x-0 h-px bg-signal/70"
              style={{ top: `${probe.y * 100}%` }}
            />
            <span className="pointer-events-none absolute bottom-2 left-2 bg-porcelain-ink/80 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-signal">
              {probe.x.toFixed(3)} / {probe.y.toFixed(3)}
            </span>
          </span>
        ) : null}
      </div>

      <figcaption className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-porcelain-ink/55">
        <span>{name}</span>
        <span>Fig. 01</span>
      </figcaption>
    </figure>
  );
}
