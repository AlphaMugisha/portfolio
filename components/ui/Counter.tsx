"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * Counts up to a numeric value once it scrolls into view.
 *
 * Values that are not purely numeric — "Multi", "Yes",
 * "Staff / Student / Admin" — render as static text. This never invents
 * a number that was not in the data, which is the whole premise of the
 * figures on this site.
 *
 * The parsed value is memoised on the string. `value.match()` allocates
 * a fresh array on every render, so using the match directly as an
 * effect dependency restarted the rAF loop on every tick's re-render
 * and the count never climbed past its first frame.
 */
export default function Counter({ value, duration = 1.2 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const parsed = useMemo(() => {
    const m = value.match(/^(\d+)(.*)$/);
    return m ? { target: parseInt(m[1], 10), suffix: m[2] } : null;
  }, [value]);

  const [display, setDisplay] = useState(parsed ? `0${parsed.suffix}` : value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parsed) return;

    if (reduced) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / (duration * 1000));
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(parsed.target * eased) + parsed.suffix);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [parsed, value, duration, reduced]);

  // `tabular-nums` so the box does not jitter as digits change width.
  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  );
}
