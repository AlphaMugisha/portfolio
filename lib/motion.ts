"use client";

import { useEffect, useState } from "react";

/**
 * Motion vocabulary.
 *
 * Three curves, each with a job, so the whole site reads as one hand:
 *
 *   SIGNAL  — the house curve. Fast departure, long settle. Everything
 *             that arrives on screen uses it.
 *   SNAP    — short and slightly over-damped, for direct responses to a
 *             click or a hover where lag would feel broken.
 *   DRAW    — near-linear with a soft tail, for strokes being drawn and
 *             scroll-scrubbed values, where an ease-out would make the
 *             scrub feel like it was fighting the wheel.
 */
export const EASE = {
  signal: "cubic-bezier(0.22, 1, 0.36, 1)",
  snap: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  draw: "cubic-bezier(0.4, 0.05, 0.25, 1)",
} as const;

/** The same curves as control-point arrays, for GSAP and Framer Motion. */
export const CUBIC = {
  signal: [0.22, 1, 0.36, 1],
  snap: [0.34, 1.56, 0.64, 1],
  draw: [0.4, 0.05, 0.25, 1],
} as const;

/** GSAP's string form of the house curve. */
export const GSAP_EASE = "power3.out";

/**
 * Reduced-motion preference, tracked live.
 *
 * Returns `false` on the server and on the very first client render so
 * markup matches during hydration, then corrects itself in an effect.
 * Every animated component reads this and renders its END STATE rather
 * than simply skipping the animation — a reduced-motion visitor should
 * see a finished page, never an empty one.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** True once mounted — for anything that must not render during SSR. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Linear interpolation, used by every rAF loop on the site. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Frame-rate independent smoothing factor for a given half-life. */
export function damp(lambda: number, dt: number): number {
  return 1 - Math.exp(-lambda * dt);
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
