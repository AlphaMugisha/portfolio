"use client";

import type { ReactNode } from "react";

/**
 * Infinite ticker.
 *
 * The reference runs two of these around its work section — a technology
 * strip above and a discipline strip below. They travel the SAME way: what
 * separates them is a 1.7:1 speed ratio and a full tonal step, not opposed
 * directions. (Opposed directions was the instinctive reading of the reel and
 * is measurably not what it does.)
 *
 * The content is duplicated once and the pair translates by exactly -50%, so
 * the loop point lands on an identical frame and the seam is never visible.
 *
 * `aria-hidden` on the duplicate, so a screen reader hears the list once.
 * Pauses on hover, and stops entirely under reduced motion (the CSS rule
 * lives in globals.css) — leaving the first copy legible and static.
 */
export default function Marquee({
  items,
  direction = "left",
  duration = 38,
  separator = "·",
  className = "",
  itemClassName = "",
}: {
  items: ReactNode[];
  direction?: "left" | "right";
  /** Seconds for one full pass. Larger = slower. */
  duration?: number;
  separator?: ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="flex shrink-0 items-center">
          <span className={itemClassName}>{item}</span>
          <span
            className="mx-[4.5vw] select-none opacity-40"
            aria-hidden="true"
          >
            {separator}
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`marquee relative overflow-hidden ${className}`}>
      <div
        className="marquee-track"
        data-direction={direction}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
