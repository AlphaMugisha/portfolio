"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* The curtain ships in the server markup, so it has to lay itself out before
   React is listening. useLayoutEffect on the client hides it ahead of first
   paint for anyone who should not see it at all. */
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Below this the counter reads as a flicker; above it, as a wait. */
const MIN_VISIBLE_MS = 900;
/** A stalled asset must never hold the page hostage. */
const MAX_VISIBLE_MS = 5000;

/** The reel holds an EMPTY dark field between the counter clearing and the
    first pen mark. It is a deliberate pause, not a crossfade, and skipping it
    is what made the old sequence feel rushed. */
const EMPTY_MS = 1150;
/** Greeting: drawn, then allowed to just sit there finished. The reel runs
    roughly 3:2 draw-to-hold, and the hold is longer than instinct suggests. */
const DRAW_MS = 2400;
const HOLD_MS = 1600;
const GREET_MS = DRAW_MS + HOLD_MS;
/** Greeting exit, then the cross wipe. */
const LEAVE_MS = 500;
const OPEN_MS = 850;

/**
 * Opening sequence, in three beats.
 *
 *   1. COUNT — a real percentage, not a timer. React hydrating, webfonts
 *      resolving and the load event each release a share of the total, and
 *      the arc beneath the number reads the same figure as distance.
 *   2. GREET — the counter clears and a handwritten "hello" draws itself in.
 *   3. OPEN — a cross grows out of the centre and floods the screen in the
 *      colour of the section behind it, so the curtain does not lift so much
 *      as get overtaken.
 *
 * Shows once per session (sessionStorage), skipped entirely under reduced
 * motion, and backed by a CSS failsafe in globals.css so a dead script cannot
 * leave a visitor staring at a black screen.
 */
type Phase = "count" | "greet" | "open";

/* Arm width 26% of the shape, measured off the reel — at 50% the shape never
   reads as a cross at all, it reads as a growing square. Thin arms need a
   larger final scale to flood the corners, hence CROSS_SCALE. */
const CROSS =
  "polygon(37% 0%, 63% 0%, 63% 37%, 100% 37%, 100% 63%, 63% 63%, 63% 100%, 37% 100%, 37% 63%, 0% 63%, 0% 37%, 37% 37%)";
const CROSS_SCALE = 3.9;

/* The ring is chunky, and its track is a hairline about a fifth of its
   weight — they read as two objects, a faint guide and a band riding on it. */
const R = 43;
const CIRC = 2 * Math.PI * R;
/* The reel's arc is an INDETERMINATE spinner: its sweep and start angle bear
   no relation to the percentage (~180° at 20%, ~150° at 68%, ~300° at 95%).
   Only the numeral reports progress. */
const SWEEP = CIRC * 0.34;

export default function Preloader() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [phase, setPhase] = useState<Phase>("count");
  const [pct, setPct] = useState(0);
  const timers = useRef<number[]>([]);

  useIsoLayoutEffect(() => {
    if (reduced || sessionStorage.getItem("intro-seen")) setVisible(false);
  }, [reduced]);

  useEffect(() => {
    if (!visible) return;

    document.body.style.overflow = "hidden";

    let alive = true;
    let finished = false;
    let target = 0;

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => alive && fn(), ms);
      timers.current.push(id);
    };

    /** Idempotent — rAF, the hard stop and a hidden tab can all reach it. */
    const finish = () => {
      if (finished || !alive) return;
      finished = true;
      setPct(100);
      sessionStorage.setItem("intro-seen", "1");

      // Beat 2 after an empty pause, then beat 3, then out.
      later(() => setPhase("greet"), EMPTY_MS);
      later(() => setPhase("open"), EMPTY_MS + GREET_MS);
      later(() => setVisible(false), EMPTY_MS + GREET_MS + LEAVE_MS + OPEN_MS);
    };

    const release = (share: number) => {
      if (!alive) return;
      target = Math.min(1, target + share);
      // Background tabs freeze rAF, so the count would never run and the
      // scroll lock would never lift. Nobody is watching a hidden tab.
      if (target >= 1 && document.hidden) finish();
    };

    // Hydration done — the shell on screen is the real one.
    release(0.25);
    // Webfonts resolved, so the display type will not reflow after the reveal.
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
      shown += (target - shown) * 0.085;
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
      for (const id of timers.current) clearTimeout(id);
      timers.current = [];
      window.removeEventListener("load", onLoad);
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-preloader
          className="fixed inset-0 z-100 overflow-hidden bg-ink"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* ---- Beat 1: the readout ----
              Every mark in the reel's opening is the same light warm tone —
              numeral, arc and greeting alike. Setting them in the gold was a
              guess; the measured luminance is the paper colour. */}
          <AnimatePresence>
            {phase === "count" && (
              <motion.div
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 grid place-items-center"
              >
                <div
                  role="progressbar"
                  aria-label="Loading"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  className="flex flex-col items-center"
                >
                  <div className="overflow-hidden">
                    {/* CSS, not motion — this has to be visible on the very
                        first paint, before React has hydrated. */}
                    <p className="preloader-rise text-mega text-[13.6svh] tabular-nums text-text-primary">
                      {pct}%
                    </p>
                  </div>

                  {/* Not a progress arc. The reel's ring is an indeterminate
                      spinner whose sweep is unrelated to the number above it —
                      it keeps turning even while the readout is pinned at 99.
                      The numeral carries the progress; this carries the sense
                      that something is still working. */}
                  <svg
                    viewBox="0 0 100 100"
                    className="mt-[4.5svh] h-[22svh] max-h-44 min-h-24 w-[22svh] min-w-24 max-w-44 animate-[seal-spin_1.4s_linear_infinite]"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r={R}
                      fill="none"
                      stroke="var(--color-line-strong)"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={R}
                      fill="none"
                      stroke="var(--color-text-primary)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${SWEEP} ${CIRC - SWEEP}`}
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- Beat 2: the greeting ---- */}
          <AnimatePresence>
            {phase === "greet" && (
              <motion.div
                initial={{ opacity: 1 }}
                /* The reel does not fade the word out — it translates it
                   straight up and off, accelerating, with its horizontal
                   extent fixed the whole way. */
                exit={{ y: "-60vh" }}
                transition={{ duration: LEAVE_MS / 1000, ease: [0.7, 0, 0.84, 0] }}
                className="absolute inset-0 grid place-items-center"
              >
                {/* Drawn rather than unmasked by a rectangle: the reveal edge
                    is a soft slanted band that travels across the word, so ink
                    appears under a moving nib instead of behind a vertical
                    cut. A true stroke-dash draw would need the greeting as a
                    single monoline path; this keeps it as live text. */}
                <motion.p
                  /* Only the standard property is animated: framer types the
                     prefixed one out, and every browser that supports masking
                     on text also honours the unprefixed name. The prefixed
                     mask-image below is kept for the older WebKit that needs
                     it to show the mask at all. */
                  initial={{ maskPosition: "120% 0%" }}
                  animate={{ maskPosition: "-20% 0%" }}
                  transition={{ duration: DRAW_MS / 1000, ease: [0.42, 0, 0.35, 1] }}
                  style={{
                    maskImage:
                      "linear-gradient(100deg, #000 42%, rgba(0,0,0,0.55) 49%, transparent 56%)",
                    WebkitMaskImage:
                      "linear-gradient(100deg, #000 42%, rgba(0,0,0,0.55) 49%, transparent 56%)",
                    maskSize: "260% 100%",
                    WebkitMaskSize: "260% 100%",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                  }}
                  className="script text-[clamp(4rem,13vw,9rem)] leading-none text-text-primary"
                >
                  hello
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ---- Beat 3: the cross wipe ----
              Arms are 26% of the shape, so it reads as a cross the whole way
              rather than as a growing square, and the horizontal axis leads
              the vertical by about a third of the duration. Its colour is the
              hero band, so the last frame of the curtain and the first frame
              of the page are the same flat field. */}
          {phase === "open" && (
            <motion.div
              aria-hidden="true"
              initial={{ scaleX: 0, scaleY: 0 }}
              animate={{ scaleX: CROSS_SCALE, scaleY: CROSS_SCALE }}
              transition={{
                scaleX: { duration: 0.55, ease: [0.76, 0, 0.24, 1] },
                scaleY: { duration: 0.8, delay: 0.25, ease: [0.76, 0, 0.24, 1] },
              }}
              style={{ clipPath: CROSS, WebkitClipPath: CROSS }}
              className="absolute left-1/2 top-1/2 h-[100vmax] w-[100vmax] -translate-x-1/2 -translate-y-1/2 bg-band-light"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
