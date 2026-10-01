"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode, RefObject } from "react";

/**
 * A sticker that hovers in the air.
 *
 * Two motions are stacked deliberately, on two separate elements:
 *
 *   outer — drag, and the pointer reactions (grow on hover, squash on press)
 *   inner — the endless slow bob, plus the resting tilt
 *
 * They have to be separate. Framer writes `transform` on whatever element it
 * animates, so a drag offset and a looping `y` on the SAME node fight over
 * one property and the sticker snaps back to centre mid-drag. Split across
 * two nodes, the drag translates the parent while the bob translates the
 * child, and the browser composes them.
 *
 * Each instance takes its own `float` distance and `duration` so a group of
 * these never pulses in lockstep — the moment two stickers share a period
 * the whole arrangement reads as one animated block rather than as several
 * objects loose in the air.
 *
 * Under `prefers-reduced-motion` the bob and the drag are both dropped and
 * the sticker is simply placed at its resting angle.
 */
export default function Floaty({
  className,
  rotate = 0,
  float = 12,
  duration = 7,
  delay = 0,
  z = 20,
  constraints,
  children,
}: {
  className?: string;
  /** Resting tilt in degrees. */
  rotate?: number;
  /** How far it rises at the top of the bob, in px. */
  float?: number;
  /** Seconds for one full bob. */
  duration?: number;
  delay?: number;
  z?: number;
  constraints?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div style={{ zIndex: z }} className={`absolute ${className ?? ""}`}>
        <div style={{ transform: `rotate(${rotate}deg)` }}>{children}</div>
      </div>
    );
  }

  return (
    <motion.div
      drag
      dragConstraints={constraints as RefObject<Element>}
      dragElastic={0.15}
      dragMomentum
      dragTransition={{ bounceStiffness: 300, bounceDamping: 22 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.97 }}
      whileDrag={{ scale: 1.12, zIndex: 60 }}
      style={{ zIndex: z }}
      className={`pointer-events-auto absolute touch-none cursor-grow ${className ?? ""}`}
    >
      <motion.div
        style={{ rotate }}
        animate={{ y: [0, -float, 0] }}
        transition={{ repeat: Infinity, duration, ease: "easeInOut", delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
