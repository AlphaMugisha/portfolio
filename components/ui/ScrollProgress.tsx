"use client";

import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

/**
 * Reading progress, as a hairline of the accent pinned to the top edge.
 * Spring-smoothed so fast scrolling fills it fluidly rather than in steps.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.3,
  });
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-primary"
    />
  );
}
