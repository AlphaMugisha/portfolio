"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * A figure that counts up to its value when it scrolls into view.
 *
 * The important part is what it renders BEFORE any of that happens.
 *
 * This component used to initialise at "0" and only reach the real
 * number once JavaScript had hydrated and an observer had fired. That
 * put `0` into the server-rendered HTML for every statistic on the
 * site — "0 projects documented", "0 tools in the index" — which is not
 * a loading state, it is a false statement. Anything reading the page
 * without running it (crawlers, social unfurls, reader modes, a visitor
 * on a slow connection) got numbers that were wrong rather than absent.
 *
 * So the truth is the initial state, and the animation is the
 * enhancement layered on top:
 *
 *   1. Server and first client render emit the REAL value.
 *   2. On mount, if motion is allowed and the element is still below
 *      the fold, it is knocked back to zero and armed — nobody has seen
 *      it yet, so there is nothing to flash.
 *   3. If it is already on screen at mount, the real value simply
 *      stays. Resetting it would be a visible glitch, and an animation
 *      nobody asked for is not worth corrupting a number the reader is
 *      already looking at.
 *
 * Non-numeric values ("Multi", "Yes", "Staff / Student / Admin") are
 * passed straight through; this never invents a number.
 */
export default function Counter({ value, duration = 1.2 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  // `value.match()` allocates a new array every render, so using the
  // match itself as an effect dependency restarted the rAF loop on every
  // tick and the count never climbed.
  const parsed = useMemo(() => {
    const m = value.match(/^(\d+)(.*)$/);
    return m ? { target: parseInt(m[1], 10), suffix: m[2] } : null;
  }, [value]);

  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parsed || reduced) return;

    // Already visible at mount: leave the real number alone.
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

    setDisplay(`0${parsed.suffix}`);

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
