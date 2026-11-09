"use client";

import type { Chapter } from "@/lib/chapters";

/**
 * The content interface: words, directly in the composition.
 *
 * There is no card, panel, pill or rectangle anywhere in this file.
 * Hierarchy comes from size, weight, colour and negative space — a
 * statement at display scale, a thin rule, one or two supporting
 * lines, and a lot of air. The 3D world shows through everything.
 *
 * Opacity and drift are written to these nodes directly from the
 * drive's rAF loop (see `Drive.tsx`), never through React state, so
 * scrolling does not re-render the tree.
 *
 * The one concession to legibility is a soft vignette behind the type
 * — a radial gradient with no edge, not a box. Without it the amber
 * loses contrast whenever a lit rail passes under a word.
 */

function Statement({ chapter }: { chapter: Chapter }) {
  const accent = chapter.accent?.toLowerCase();

  return (
    <h2 className="font-display text-[clamp(2.4rem,6.6vw,6.6rem)] font-semibold leading-[0.86] tracking-[-0.045em] text-text">
      {chapter.statement.map((line, i) => {
        // Lift the accent word without wrapping the line in anything.
        const words = line.split(" ");
        return (
          <span key={i} className="block">
            {words.map((word, j) => {
              const bare = word.replace(/[.,]/g, "").toLowerCase();
              const isAccent =
                !!accent && (bare === accent.replace(/[.,]/g, "") || word.toLowerCase() === accent);
              return (
                <span key={j} className={isAccent ? "text-signal" : undefined}>
                  {word}
                  {j < words.length - 1 ? " " : ""}
                </span>
              );
            })}
          </span>
        );
      })}
    </h2>
  );
}

export function ChapterBlock({
  chapter,
  nodeRef,
  children,
}: {
  chapter: Chapter;
  nodeRef: (el: HTMLDivElement | null) => void;
  /** Interactive content (the contact chapter's links) sits here. */
  children?: React.ReactNode;
}) {
  const align = chapter.align ?? "left";
  const place =
    align === "center"
      ? "items-center text-center"
      : align === "right"
        ? "items-end text-right"
        : "items-start text-left";

  const support = (chapter.support ?? []).filter(Boolean);

  return (
    <div
      ref={nodeRef}
      data-chapter={chapter.id}
      className="absolute inset-0 flex flex-col justify-center px-6 opacity-0 sm:px-12 lg:px-20"
      // `pointerEvents` is toggled by the journey loop: a chapter only
      // becomes clickable once it is actually legible, so an invisible
      // block can never swallow a click meant for the one on screen.
      style={{ willChange: "opacity, transform", pointerEvents: "none" }}
    >
      {/* Soft vignette, not a panel: no edge, no corner, no border. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            align === "right"
              ? "radial-gradient(70% 70% at 78% 50%, rgba(14,14,14,0.82) 0%, rgba(14,14,14,0.45) 45%, transparent 75%)"
              : align === "center"
                ? "radial-gradient(70% 70% at 50% 50%, rgba(14,14,14,0.82) 0%, rgba(14,14,14,0.45) 45%, transparent 75%)"
                : "radial-gradient(70% 70% at 22% 50%, rgba(14,14,14,0.82) 0%, rgba(14,14,14,0.45) 45%, transparent 75%)",
        }}
      />

      <div className={`relative mx-auto flex w-full max-w-5xl flex-col ${place}`}>
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-signal">
          {chapter.index}
          <span className="ml-3 text-text-subtle">{chapter.label}</span>
        </span>

        <div className="mt-6">
          <Statement chapter={chapter} />
        </div>

        {support.length ? (
          <div
            className={`mt-8 max-w-xl space-y-3 ${align === "center" ? "mx-auto" : ""}`}
          >
            <span
              aria-hidden="true"
              className={`block h-px w-16 bg-signal/60 ${align === "right" ? "ml-auto" : align === "center" ? "mx-auto" : ""}`}
            />
            {support.map((line, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-text-muted sm:text-[17px]">
                {line}
              </p>
            ))}
          </div>
        ) : null}

        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </div>
  );
}
