"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { mediaUrl } from "@/lib/supabase/env";
import type { JourneyEntryRow, SectionRow } from "@/types/database";

/**
 * The journey, as a signal advancing down a rail.
 *
 * The hero's trace becomes a spine here, and scroll drives it: the rail
 * fills under a scrub, each stage's node latches as the fill reaches
 * it, and a sticky readout on the left keeps the current stage number
 * enormous while the detail scrolls past on the right. The argument the
 * copy makes — that these are four phases of one continuous practice,
 * not four unrelated hobbies — is carried by the fact that the line is
 * never broken between them.
 *
 * The numeral swap is the one piece of state here; everything else is
 * transform and opacity driven straight off the scrub, so the whole
 * section costs one ScrollTrigger plus one per stage.
 *
 * Reduced motion: the rail is painted full, every node reads as latched
 * and the readout simply shows the first stage. No scrubs are created.
 */
export default function Journey({
  section,
  entries,
}: {
  section: SectionRow;
  entries: JourneyEntryRow[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const railEl = rail.current;
        const rootEl = root.current;
        if (!railEl || !rootEl) return;

        gsap.fromTo(
          railEl,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: rootEl,
              start: "top 62%",
              end: "bottom 78%",
              scrub: 0.5,
            },
          },
        );

        const triggers = gsap.utils
          .toArray<HTMLElement>("[data-stage]", rootEl)
          .map((stage, i) =>
            ScrollTrigger.create({
              trigger: stage,
              start: "top 62%",
              end: "bottom 62%",
              onEnter: () => setActive(i),
              onEnterBack: () => setActive(i),
            }),
          );

        return () => triggers.forEach((t) => t.kill());
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="journey" className="relative px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader section={section} index="06" />

        <div ref={root} className="mt-16 grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-20">
          {/* Sticky readout */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <span className="note note-signal">
                Stage {String(active + 1).padStart(2, "0")} of{" "}
                {String(entries.length).padStart(2, "0")}
              </span>

              <p
                key={active}
                className="mt-4 font-display text-[9rem] font-semibold leading-none text-signal"
                style={{ animation: "stage-swap 520ms cubic-bezier(0.22,1,0.36,1)" }}
              >
                {String(active + 1).padStart(2, "0")}
              </p>

              <p className="mt-2 font-display text-2xl font-semibold text-text">
                {entries[active]?.period}
              </p>
              <p className="note mt-2">{entries[active]?.discipline}</p>

              <ul className="mt-8 space-y-2.5">
                {entries.map((entry, i) => (
                  <li key={entry.id} className="flex items-center gap-3">
                    <span
                      className={`h-px transition-all duration-500 ${
                        i === active ? "w-8 bg-signal" : "w-4 bg-rule-strong"
                      }`}
                    />
                    <span
                      className={`font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-500 ${
                        i === active ? "text-signal" : "text-text-subtle"
                      }`}
                    >
                      {entry.period}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* The rail and the stages */}
          <div className="relative pl-10 sm:pl-14">
            <span className="absolute left-0 top-0 h-full w-px bg-rule sm:left-1" aria-hidden="true" />
            <span
              ref={rail}
              className="absolute left-0 top-0 h-full w-px origin-top bg-signal sm:left-1"
              aria-hidden="true"
              style={{ boxShadow: "0 0 8px rgb(254 176 2 / 0.45)" }}
            />

            <div className="space-y-16">
              {entries.map((entry, i) => {
                const latched = i <= active;
                return (
                  <div key={entry.id} data-stage className="relative">
                    {/* node */}
                    <span
                      aria-hidden="true"
                      className={`absolute -left-10 top-1.5 grid h-4 w-4 -translate-x-1/2 place-items-center rounded-full border transition-all duration-500 sm:-left-[55px] ${
                        latched
                          ? "border-signal bg-ink shadow-[0_0_12px_rgba(84,209,219,0.6)]"
                          : "border-rule-strong bg-ink"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                          latched ? "bg-signal" : "bg-rule-strong"
                        }`}
                      />
                    </span>

                    <Reveal variant="rise">
                      <p className="note note-signal lg:hidden">
                        {String(i + 1).padStart(2, "0")} · {entry.period}
                      </p>

                      <h3 className="mt-2 font-display text-2xl font-semibold text-text sm:text-3xl lg:mt-0">
                        {entry.title}
                      </h3>
                      <p className="note mt-2">{entry.discipline}</p>

                      <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-text-muted">
                        {entry.body}
                      </p>

                      <ul className="mt-5 flex flex-wrap gap-2">
                        {entry.highlights.map((highlight) => (
                          <li key={highlight} className="reg">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </Reveal>

                    {entry.image_path ? (
                      <Reveal variant="unmask" className="mt-7 max-w-md overflow-hidden">
                        <div className="relative aspect-[16/9] w-full border border-rule">
                          <Image
                            src={mediaUrl(entry.image_path)}
                            alt=""
                            fill
                            sizes="(min-width: 640px) 448px, 90vw"
                            className="object-cover"
                          />
                        </div>
                      </Reveal>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
