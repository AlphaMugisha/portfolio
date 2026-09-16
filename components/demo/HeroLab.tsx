"use client";

import { useState } from "react";
import Link from "next/link";
import Hero from "@/components/sections/Hero";
import HeroBefore from "@/components/demo/HeroBefore";

type Variant = "after" | "before";

const NOTES: { variant: Variant; label: string; points: string[] }[] = [
  {
    variant: "after",
    label: "After",
    points: [
      "Fills the viewport, so the band has room to come apart as it leaves.",
      "A survey grid and tonal wash sit behind the type and lag the scroll.",
      "The grid drifts against the pointer; the headline leans the other way.",
      "Scrolling separates the layers — grid lags, type leads, ticker sinks.",
      "Entry delays all derive from one set of beats, not four typed numbers.",
    ],
  },
  {
    variant: "before",
    label: "Before",
    points: [
      "Content-height band — it simply scrolls away as one flat piece.",
      "No backdrop, so there is nothing for parallax to read against.",
      "No pointer response.",
      "No scroll-linked motion of any kind.",
      "Four hand-tuned delays: 0.05, 0.75, 0.9, 1.05.",
    ],
  },
];

/**
 * Side-by-side rig for the hero rebuild.
 *
 * Both versions mount into the real page shell — same header, same fonts,
 * same tokens — because a hero judged outside its own site tells you very
 * little. Switching remounts the section under a fresh `key` so the entry
 * sequence replays from the top rather than showing its settled state.
 */
export default function HeroLab() {
  const [variant, setVariant] = useState<Variant>("after");
  const [run, setRun] = useState(0);

  const show = (v: Variant) => {
    setVariant(v);
    setRun((r) => r + 1);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const notes = NOTES.find((n) => n.variant === variant)!;

  return (
    <>
      {/* Remounting on every switch and every replay is the whole point —
          without a changing key you would only ever see the settled frame. */}
      {variant === "after" ? (
        <Hero key={`after-${run}`} />
      ) : (
        <HeroBefore key={`before-${run}`} />
      )}

      {/* Scroll room. The departure is only visible if there is somewhere to
          depart to. */}
      <section
        data-band="dark"
        className="relative min-h-[140vh] bg-bg px-6 pt-32 pb-40 sm:px-10"
      >
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Hero lab</p>
          <h2 className="text-display mt-5 text-[clamp(2rem,6vw,4rem)] text-text-primary">
            Scroll back up slowly
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            The layering reads on the way out, not at rest. Scroll up and down
            across the boundary above and watch the grid fall behind the
            headline.
          </p>

          <p className="meta mt-16 text-text-muted">
            Showing — {notes.label}
          </p>
          <ul className="mt-6 space-y-4">
            {notes.points.map((p) => (
              <li
                key={p}
                className="flex gap-4 text-base leading-relaxed text-text-secondary"
              >
                <span aria-hidden="true" className="mt-2.5 h-px w-6 shrink-0 bg-primary" />
                {p}
              </li>
            ))}
          </ul>

          <p className="mt-16 text-sm text-text-muted">
            This page is a scratch rig, not part of the site.{" "}
            <Link href="/" className="text-primary underline underline-offset-4">
              Back to the portfolio
            </Link>
          </p>
        </div>
      </section>

      {/* Controls. Fixed low and centred so they never sit over the headline. */}
      <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {/* Solid rather than `glass`: the bar floats over Anton set at 9rem,
            and a translucent panel lets the counters show through it. */}
        <div className="flex items-center gap-1 rounded-sm border border-line-strong bg-bg-raised/95 p-1.5 shadow-[0_18px_40px_rgba(4,6,10,0.6)] backdrop-blur-md">
          {NOTES.map((n) => {
            const active = variant === n.variant;
            return (
              <button
                key={n.variant}
                type="button"
                onClick={() => show(n.variant)}
                aria-pressed={active}
                className={`meta btn-depth rounded-sm px-5 py-2.5 transition-colors ${
                  active
                    ? "bg-primary text-on-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {n.label}
              </button>
            );
          })}
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-line-strong" />
          <button
            type="button"
            onClick={() => show(variant)}
            className="meta btn-depth rounded-sm px-5 py-2.5 text-text-secondary hover:text-text-primary"
          >
            Replay
          </button>
        </div>
      </div>
    </>
  );
}
