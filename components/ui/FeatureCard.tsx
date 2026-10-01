"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import Blob from "./Blob";

/**
 * The capability card: a floating panel with a splash behind it, an icon
 * tile, a title and a line of copy.
 *
 * The lift is a spring rather than a duration — a card that rises on a
 * timed curve arrives and stops dead, where a spring overshoots a hair and
 * settles, which is what makes it read as a physical object being picked up.
 */
export default function FeatureCard({
  icon,
  title,
  desc,
  index = 0,
  tile = "bg-accent text-accent-ink",
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  index?: number;
  /** Fill + ink for the icon tile. */
  tile?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="glass-card relative h-full overflow-hidden p-8"
    >
      <Blob index={index} />
      <div className="relative">
        <div
          className={`mb-7 flex h-16 w-16 items-center justify-center rounded-[1.3rem] shadow-[0_14px_30px_-10px_rgba(0,0,0,0.45)] ${tile}`}
        >
          {icon}
        </div>
        <h3 className="mb-2 font-display text-2xl font-semibold tracking-tight text-ink dark:text-ink-invert">
          {title}
        </h3>
        <p className="leading-relaxed text-ink-subtle dark:text-ink-invert-muted">{desc}</p>
      </div>
    </motion.div>
  );
}
