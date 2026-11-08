"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Counts up to a numeric value once it scrolls into view. Values that are
 * not purely numeric (e.g. "Multi", "Staff / Student / Admin") render as
 * static text — this never invents a number that was not in the data.
 */
export default function Counter({ value, duration = 1.1 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  // `value.match(...)` returns a new array every render; memoizing on the
  // string keeps the effect below from seeing a "new" dependency on every
  // tick's re-render, which previously restarted the rAF loop from t=0 on
  // every frame and left the count stuck near zero forever.
  const parsed = useMemo(() => {
    const m = value.match(/^(\d+)(.*)$/);
    return m ? { target: parseInt(m[1], 10), suffix: m[2] } : null;
  }, [value]);

  const [display, setDisplay] = useState(parsed ? "0" : value);

  useEffect(() => {
    if (!parsed || !inView) return;
    if (reduced) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(parsed.target * eased) + parsed.suffix);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, parsed, value, duration, reduced]);

  return (
    <motion.span ref={ref} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {display}
    </motion.span>
  );
}
