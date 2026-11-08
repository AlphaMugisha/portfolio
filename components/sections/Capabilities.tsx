"use client";

import { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import type { CapabilityRow, SectionRow } from "@/types/database";

/**
 * What I do — a rail of channels, not a grid of cards.
 *
 * Six identical rectangles is the single most predictable thing a
 * portfolio can do with this content, so this is a rail instead: full-
 * width rows that open on approach. The active row's title crosses to
 * the signal colour, the signal itself wipes across the row from the
 * left edge like a channel being energised, and the description opens
 * underneath it.
 *
 * Height is animated with `grid-template-rows: 0fr -> 1fr`, which is
 * the only way to transition to an element's intrinsic height without
 * measuring it in JavaScript and hard-coding a pixel value that goes
 * stale the moment the text reflows.
 *
 * One row is open by default so the section never reads as a bare list
 * of headings, and the interaction model covers all three input types:
 * pointer enters, focus moves, or tap toggles.
 */
export default function Capabilities({
  section,
  capabilities,
}: {
  section: SectionRow;
  capabilities: CapabilityRow[];
}) {
  const [open, setOpen] = useState(0);

  return (
    <section id="what-i-do" className="relative px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader section={section} index="02" />

        <Reveal variant="stack" className="mt-14 border-t border-rule" stagger={0.06}>
          {capabilities.map((capability, i) => {
            const active = open === i;
            return (
              <div key={capability.id} className="border-b border-rule">
                <button
                  type="button"
                  aria-expanded={active}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setOpen(i);
                  }}
                  onFocus={() => setOpen(i)}
                  onClick={() => setOpen(active ? -1 : i)}
                  className="group relative flex w-full items-center gap-5 overflow-hidden px-2 py-6 text-left sm:gap-8 sm:px-4"
                >
                  {/* The channel energising — a wipe, not a fade. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 origin-left bg-signal/[0.07] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ transform: `scaleX(${active ? 1 : 0})` }}
                  />

                  <span
                    className={`relative shrink-0 font-mono text-xs transition-colors duration-500 ${
                      active ? "text-signal" : "text-text-subtle"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`relative grid h-11 w-11 shrink-0 place-items-center border transition-colors duration-500 ${
                      active
                        ? "border-signal text-signal"
                        : "border-rule text-text-subtle"
                    }`}
                  >
                    <Icon name={capability.icon} size={19} />
                  </span>

                  <span className="relative min-w-0 flex-1">
                    <span
                      className={`block font-display text-xl font-semibold transition-colors duration-500 sm:text-2xl ${
                        active ? "text-signal" : "text-text"
                      }`}
                    >
                      {capability.title}
                    </span>

                    {/* 0fr -> 1fr: a real height transition with no JS measuring. */}
                    <span
                      className="grid transition-[grid-template-rows] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ gridTemplateRows: active ? "1fr" : "0fr" }}
                    >
                      <span className="overflow-hidden">
                        <span
                          className="block max-w-2xl pt-3 text-[15px] leading-relaxed text-text-muted transition-opacity duration-500"
                          style={{ opacity: active ? 1 : 0 }}
                        >
                          {capability.description}
                        </span>
                      </span>
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className={`relative hidden h-px shrink-0 bg-signal transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] sm:block ${
                      active ? "w-16 opacity-100" : "w-6 opacity-30"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
