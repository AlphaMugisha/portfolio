"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin reading-progress rail pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 380,
    damping: 42,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-60 h-[2px] origin-left bg-primary"
      aria-hidden="true"
    />
  );
}
