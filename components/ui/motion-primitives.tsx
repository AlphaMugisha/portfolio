"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* ------------------------------------------------------------------
   The shared motion language.

   Four rules the whole site obeys, so the animation reads as one system
   rather than a collection of effects:

   1. Everything eases OUT (expo). Content arrives and settles; it never
      bounces, springs past, or draws attention to its own arrival.
   2. Motion enters from below or fades. Never sideways, never rotating.
   3. Durations sit between 0.6s and 1.1s — slow enough to feel deliberate,
      short enough never to hold the reader up.
   4. Every primitive returns a plain static element under reduced motion.
   ------------------------------------------------------------------ */

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------- Reveal ------------------------------------------------ */

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

/**
 * Fade + rise as the element scrolls into view. The workhorse.
 *
 * Driven by `useInView` rather than the `whileInView` prop. They look
 * equivalent and are not: `whileInView` failed to fire when a section was
 * reached by an instant jump — a deep link, or `scrollIntoView` — leaving
 * every heading in that section stuck at `opacity: 0`. `useInView` attaches
 * its observer in an effect and evaluates the element's position when it
 * does, so arriving already-in-view is the normal path rather than an edge
 * case. Everything on this page that already used it never had the bug.
 *
 * The failure mode is what makes this worth the extra ref: a reveal that
 * does not fire is not "unanimated", it is invisible.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-90px" });

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Stagger ----------------------------------------------- */

export function Stagger({
  children,
  className,
  stagger = 0.09,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 22 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Parallax ---------------------------------------------- */

/**
 * Scroll-linked vertical parallax, spring-smoothed so fast scrolling never
 * snaps. `distance` is the travel in px across the full pass; negative reads
 * as foreground, positive as background.
 */
export function Parallax({
  children,
  className,
  distance = 50,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  const y = useSpring(raw, { stiffness: 110, damping: 30, mass: 0.4 });

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* ---------- Media parallax ---------------------------------------- */

/**
 * The agency-website image treatment: the frame is fixed, the media inside is
 * oversized and drifts against the scroll. Reads as depth rather than motion.
 */
export function MediaParallax({
  children,
  className = "",
  amount = 12,
}: {
  children: ReactNode;
  className?: string;
  /** Overscan percentage — also the travel range. */
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${amount}%`, `${amount}%`]
  );
  const y = useSpring(raw, { stiffness: 110, damping: 32, mass: 0.4 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {reduced ? (
        <div className="h-full w-full">{children}</div>
      ) : (
        <motion.div
          style={{ y, height: `${100 + amount * 2}%`, top: `-${amount}%` }}
          className="absolute inset-x-0"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Text reveal ------------------------------------------- */

/**
 * Line-by-line mask reveal. Each line sits in an overflow-hidden box and
 * slides up from beneath it — the clean editorial version, no per-letter
 * confetti.
 */
export function TextReveal({
  lines,
  className = "",
  lineClassName = "",
  delay = 0,
  as: Tag = "h2",
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  // Observe the heading, never the line. A line starts fully below its own
  // overflow-hidden mask, so an observer watching the line sees a clipped,
  // zero-area box, reports "not visible", and never releases it — the reveal
  // would deadlock on its own initial state.
  const inView = useInView(ref, { once: true, margin: "-90px" });

  if (reduced) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className={`block ${lineClassName}`}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement & HTMLParagraphElement & HTMLDivElement>}
      className={className}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : undefined}
            transition={{ duration: 1, delay: delay + i * 0.09, ease: EASE }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* ---------- Masked line ------------------------------------------- */

/**
 * A run of inline items that each rise out of their own mask, released
 * together when the container is reached.
 *
 * Same rule as TextReveal: the observer watches the container. Callers supply
 * the items, so the emphasis can vary word by word.
 */
export function MaskedWords({
  words,
  className = "",
  wordClassName,
  stagger = 0.07,
  delay = 0,
  as: Tag = "h3",
}: {
  words: string[];
  className?: string;
  /** Per-word classes, so emphasis can alternate across the sentence. */
  wordClassName?: (index: number) => string;
  stagger?: number;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "div";
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-90px" });

  if (reduced) {
    return (
      <Tag className={className}>
        {words.map((w, i) => (
          <span key={i} className={`mr-[0.28em] inline-block ${wordClassName?.(i) ?? ""}`}>
            {w}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement & HTMLParagraphElement & HTMLDivElement>}
      className={className}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={`mr-[0.28em] inline-block ${wordClassName?.(i) ?? ""}`}
            initial={{ y: "112%" }}
            animate={inView ? { y: "0%" } : undefined}
            transition={{ duration: 0.95, delay: delay + i * stagger, ease: EASE }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/* ---------- Counter ----------------------------------------------- */

/**
 * Number that counts up once, the first time it enters view.
 *
 * Driven by rAF against elapsed time rather than a per-frame increment, so
 * the duration holds regardless of refresh rate, and eased so it decelerates
 * into the final value instead of stopping dead.
 */
export function Counter({
  value,
  suffix = "",
  className = "",
  duration = 1600,
}: {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(eased * value));
      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}

/* ---------- Zoom ---------------------------------------------------
   Learned from the reference site (tuyishimireeric.github.io), which
   drives everything through AOS with `data-aos="zoom-in"` as its
   dominant move, plus directional variants.

   Two things about AOS's defaults are reproduced here on purpose:
     - it scales up from small rather than only fading, and
     - `once: false`, so the animation REPLAYS every time the element
       re-enters the viewport instead of firing a single time.
   ------------------------------------------------------------------ */

export type ZoomFrom = "center" | "left" | "right" | "up";

const ZOOM_OFFSET: Record<ZoomFrom, { x: number; y: number }> = {
  center: { x: 0, y: 0 },
  left: { x: -46, y: 0 },
  right: { x: 46, y: 0 },
  up: { x: 0, y: 40 },
};

export function Zoom({
  children,
  className,
  from = "center",
  delay = 0,
  scale = 0.72,
  duration = 0.7,
  /** AOS replays by default; keep that unless a one-shot is wanted. */
  once = false,
}: {
  children: ReactNode;
  className?: string;
  from?: ZoomFrom;
  delay?: number;
  scale?: number;
  duration?: number;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px" });

  if (reduced) return <div className={className}>{children}</div>;

  const off = ZOOM_OFFSET[from];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale, x: off.x, y: off.y }}
      animate={
        inView ? { opacity: 1, scale: 1, x: 0, y: 0 } : { opacity: 0, scale, x: off.x, y: off.y }
      }
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Parent for a grid of zooming children — the skills grid uses this. */
export function ZoomStagger({
  children,
  className,
  stagger = 0.045,
  once = false,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  once?: boolean;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export const zoomItem = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};
