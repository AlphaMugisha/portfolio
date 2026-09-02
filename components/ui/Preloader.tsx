"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/lib/site";

/* The curtain ships in the server markup, so it has to be able to lay itself
   out before React is listening. useLayoutEffect on the client hides it ahead
   of first paint for anyone who should not see it at all. */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Below this the curtain reads as a flicker; above it, as a wait. */
const MIN_VISIBLE_MS = 700;
/** A stalled asset must never hold the page hostage. */
const MAX_VISIBLE_MS = 4500;

/**
 * Opening curtain.
 *
 * The figure it shows is the real one: React hydrating, webfonts resolving and
 * the load event each release a share of the total. An honest readout suits a
 * portfolio about instrumented hardware better than a timer pretending to
 * measure something.
 *
 * Shows once per session (sessionStorage), skipped entirely under reduced
 * motion, and backed by a CSS failsafe in globals.css so a dead script cannot
 * leave a visitor staring at a black screen.
 */
export default function Preloader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);

  useIsoLayoutEffect(() => {
    if (reduced || sessionStorage.getItem("intro-seen")) setVisible(false);
  }, [reduced]);

  useEffect(() => {
    if (!visible) return;

    document.body.style.overflow = "hidden";

    let alive = true;
    let finished = false;
    let target = 0;

    /** Idempotent — rAF, the hard stop and a hidden tab can all reach it. */
    const finish = () => {
      if (finished || !alive) return;
      finished = true;
      setPct(100);
      sessionStorage.setItem("intro-seen", "1");
      // Let 100 register before the curtain lifts.
      window.setTimeout(() => {
        if (alive) setVisible(false);
      }, 180);
    };

    const release = (share: number) => {
      if (!alive) return;
      target = Math.min(1, target + share);
      // Background tabs freeze requestAnimationFrame, so the count would never
      // run and the scroll lock would never lift. Nobody is watching a hidden
      // tab anyway — skip the animation and finish.
      if (target >= 1 && document.hidden) finish();
    };

    // Hydration done — the shell on screen is the real one.
    release(0.25);
    // Webfonts resolved, so the headline will not reflow after the reveal.
    if (document.fonts) document.fonts.ready.then(() => release(0.35));
    else release(0.35);
    // Stylesheets and images settled.
    const onLoad = () => release(0.4);
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    const start = performance.now();
    let shown = 0;
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed > MAX_VISIBLE_MS) target = 1;

      // Ease toward the true figure so the readout travels rather than jumps.
      shown += (target - shown) * 0.09;
      setPct(Math.min(100, Math.round(shown * 100)));

      if (target >= 1 && shown > 0.99 && elapsed > MIN_VISIBLE_MS) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Belt and braces: a timer still fires where rAF does not.
    const hardStop = window.setTimeout(finish, MAX_VISIBLE_MS);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(hardStop);
      window.removeEventListener("load", onLoad);
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-preloader
          className="fixed inset-0 z-100 flex items-center justify-center bg-ink"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="overflow-hidden">
            {/* CSS, not motion — this has to be visible on the very first
                paint, before React has hydrated. */}
            <div className="preloader-rise text-center">
              <p className="text-display text-3xl text-text-invert sm:text-4xl">
                {site.name}
              </p>
              <p className="mt-3 font-sans text-[10px] uppercase tracking-[0.28em] text-primary-light">
                {site.location}
              </p>
            </div>
          </div>

          {/* Readout. Sits off-centre against the centred name on purpose —
              the asymmetry is what stops this reading as a splash screen. */}
          <div
            role="progressbar"
            aria-label="Loading"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            className="absolute bottom-5 right-6 flex items-baseline gap-2.5 sm:bottom-7 sm:right-8"
          >
            <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-text-muted">
              Loading
            </span>
            <span className="text-display text-4xl tabular-nums text-text-invert sm:text-5xl">
              {String(pct).padStart(2, "0")}
            </span>
          </div>

          {/* Same figure, read as distance instead of as a number. */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-line">
            <div
              className="h-full origin-left bg-primary transition-transform duration-200 ease-out"
              style={{ transform: `scaleX(${pct / 100})` }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
