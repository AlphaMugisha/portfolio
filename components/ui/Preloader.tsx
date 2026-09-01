"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/lib/site";

/**
 * Opening curtain.
 *
 * Deliberately brief — a loader that outstays its welcome is a cost, not a
 * flourish. It shows once per session (sessionStorage), never blocks input,
 * and is skipped entirely under reduced motion.
 */
export default function Preloader() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(true);

  useEffect(() => {
    if (reduced) return;
    if (sessionStorage.getItem("intro-seen")) return;

    setDone(false);
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      sessionStorage.setItem("intro-seen", "1");
      setDone(true);
      document.body.style.overflow = "";
    }, 1500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-ink"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="overflow-hidden">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <p className="text-display text-3xl text-text-invert sm:text-4xl">
                {site.name}
              </p>
              <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.28em] text-primary-light">
                {site.location}
              </p>
            </motion.div>
          </div>

          {/* Progress hairline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-0 h-px w-full origin-left bg-gradient-to-r from-primary-light to-accent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
