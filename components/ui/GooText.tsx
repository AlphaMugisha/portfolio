"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Poured display type.
 *
 * The reference opens its work section with a huge word that looks like poured
 * liquid — droplets detach from the baseline, fall, and merge back into the
 * strokes. That is a metaball filter: blur everything, then push alpha through
 * a steep contrast curve so anything that overlaps at all fuses into a single
 * silhouette with a soft neck between the parts.
 *
 * The thing that took measuring: the reference's letters stay RAZOR SHARP.
 * Top rules are dead straight, corners are a clean 90°, counters are
 * untouched — every bit of liquid behaviour is confined to roughly the lower
 * quarter of the glyph. Filtering the whole word, which is the obvious
 * implementation, rounds every corner and turns the word into bubbles.
 *
 * So it renders in two layers:
 *
 *   - behind, the filtered layer holding a copy of the word plus the
 *     droplets, masked so it only contributes below the waistline, and
 *   - in front, an unfiltered copy of the word, crisp.
 *
 * The word copy and the droplets share one filtered layer — that is the whole
 * trick. Filter them separately and the droplets never join the letters.
 *
 * Under reduced motion the droplets and the filter are dropped entirely: the
 * effect is decorative, and the heading has to survive without it.
 */

/** Fixed layout so the droplets read as poured rather than sprinkled. Sizes
    and travel are in em, so they stay proportional to the type at any size. */
const DROPS = [
  { left: "9%", size: 0.055, delay: 0, travel: 0.3, duration: 4.2 },
  { left: "17%", size: 0.032, delay: 1.4, travel: 0.24, duration: 3.4 },
  { left: "31%", size: 0.078, delay: 0.7, travel: 0.35, duration: 5.1 },
  { left: "43%", size: 0.04, delay: 2.1, travel: 0.27, duration: 3.8 },
  { left: "52%", size: 0.028, delay: 0.3, travel: 0.22, duration: 3.1 },
  { left: "66%", size: 0.07, delay: 1.8, travel: 0.33, duration: 4.7 },
  { left: "78%", size: 0.036, delay: 0.9, travel: 0.25, duration: 3.6 },
  { left: "90%", size: 0.05, delay: 2.4, travel: 0.29, duration: 4.4 },
];

/* The filtered layer is taller than the word so the droplets have somewhere
   to fall: mask-image only covers the element's own box, so a layer sized to
   the word clips every drop the instant it leaves the baseline.

   Stops are therefore given against the TALL box, not the word. The word
   occupies the top 1/OVERHANG of it, so the waistline at 62% of cap height
   lands at 62/OVERHANG of the box. */
const OVERHANG = 1.45;
const WAIST = `linear-gradient(to bottom, transparent ${(62 / OVERHANG).toFixed(
  1
)}%, #000 ${(76 / OVERHANG).toFixed(1)}%)`;

export default function GooText({
  text,
  className = "",
  colorClassName = "text-primary",
  style,
}: {
  text: string;
  className?: string;
  colorClassName?: string;
  /** For geometry that has to be computed rather than named in a class. */
  style?: React.CSSProperties;
}) {
  const rawId = useId();
  const filterId = `goo-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className={colorClassName}>
        <span className={`block ${className}`} style={style}>
          {text}
        </span>
      </div>
    );
  }

  return (
    // Shrink-to-fit and centred: the droplets are positioned against the
    // word's own box, so a full-width container would strand the drop at
    // "90%" out in the margin with nothing above it to fall from.
    <div className="relative flex justify-center">
      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute h-0 w-0"
      >
        <defs>
          {/* The region has to clear the droplets' whole fall, or they are
              clipped mid-flight at the edge of the element's own box. */}
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            {/* Alpha 32x, offset -15: everything faint disappears, everything
                solid stays, and the narrow band between two near-touching
                shapes becomes the neck that reads as surface tension. */}
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 32 -15"
            />
          </filter>
        </defs>
      </svg>

      <div className={`relative inline-block ${colorClassName}`}>
        {/* ---- Behind: the liquid, masked back to the baseline ---- */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0"
          style={{
            height: `${OVERHANG * 100}%`,
            filter: `url(#${filterId})`,
            maskImage: WAIST,
            WebkitMaskImage: WAIST,
          }}
        >
          <span className={`block ${className}`} style={style}>
            {text}
          </span>

          <div
            className="pointer-events-none absolute inset-x-0 h-0"
            style={{ top: `${(100 / OVERHANG).toFixed(1)}%` }}
          >
            {DROPS.map((d, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-current"
                style={{
                  left: d.left,
                  width: `${d.size}em`,
                  height: `${d.size}em`,
                  marginLeft: `${-d.size / 2}em`,
                }}
                initial={{ y: "-90%", opacity: 1, scale: 1 }}
                animate={{
                  y: ["-90%", `${d.travel * 700}%`, `${d.travel * 1000}%`],
                  scale: [1, 0.62, 0.34],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: d.duration,
                  delay: d.delay,
                  repeat: Infinity,
                  repeatDelay: 1.1,
                  ease: [0.55, 0, 1, 0.45],
                  times: [0, 0.72, 1],
                }}
              />
            ))}
          </div>
        </div>

        {/* ---- In front: the crisp word ---- */}
        <span className={`relative block ${className}`} style={style}>
          {text}
        </span>
      </div>
    </div>
  );
}
