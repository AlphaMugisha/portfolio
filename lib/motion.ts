/**
 * The motion system, in one place.
 *
 * Durations and curves were scattered as literals across a dozen components,
 * which is how a motion language drifts: someone types 0.6 instead of 0.85 and
 * one card now settles differently from every other card on the page. These are
 * the canonical values; components import them rather than retyping numbers.
 *
 * Both curves are measured off the reference recording, not chosen:
 *
 *   SETTLE  — everything that arrives. Content eases out and comes to rest; it
 *             never bounces, springs past, or draws attention to its own
 *             arrival. This is the site's voice and it covers almost everything.
 *   CURTAIN — things that cover and uncover: the menu, the preloader wipe, the
 *             page transition. Sharper at both ends because a curtain should
 *             feel driven rather than eased.
 *
 * If a third curve ever seems necessary, the honest question is usually whether
 * the element is really a curtain.
 */

/* ---------- curves ---------- */

/** framer-motion form. `as const` so it types as a cubic-bezier tuple. */
export const SETTLE = [0.16, 1, 0.3, 1] as const;
export const CURTAIN = [0.76, 0, 0.24, 1] as const;

/** CSS form, matching `--ease-out-expo` / `--ease-in-out-quart` in globals.css. */
export const SETTLE_CSS = "cubic-bezier(0.16, 1, 0.3, 1)";
export const CURTAIN_CSS = "cubic-bezier(0.76, 0, 0.24, 1)";

/* ---------- durations, in seconds ---------- */

/**
 * Named by the job, not by the number, so call sites read as intent. A hover
 * state and a section reveal should never share a duration just because 0.4
 * happened to look fine in both.
 */
export const DUR = {
  /** Colour and opacity on hover. Below this a hover feels broken, above it laggy. */
  hover: 0.28,
  /** Menu open and close. Measured off the reference. */
  curtain: 0.28,
  /** Buttons, chips, small state changes. */
  quick: 0.4,
  /** The workhorse: an element fading and rising as it reaches the reading line. */
  settle: 0.85,
  /** Display type: a per-letter mask reveal, or a headline line. */
  display: 1.1,
  /** Plates and images unmasking. Slow enough to read as a reveal. */
  plate: 1.25,
} as const;

/* ---------- stagger ---------- */

export const STAGGER = {
  /** Between letters of a display word. */
  letter: 0.05,
  /** Between lines of a headline. */
  line: 0.09,
  /** Between siblings in a grid or list. */
  item: 0.07,
} as const;

/* ---------- viewport ---------- */

/**
 * The single viewport config for scroll-triggered reveals.
 *
 * The margin is in PIXELS on purpose. A percentage margin is rejected outright
 * by IntersectionObserver — the observer is never constructed and the animation
 * silently never fires. This has cost real debugging time on this project.
 */
export const VIEWPORT = { once: true, margin: "-90px" } as const;

/* ---------- section personalities ---------- */

/**
 * Each section moves at its own pace. Animating everything at one speed is what
 * makes a long page feel like a list rather than a sequence, so the scroll-linked
 * scenes read their pacing from here.
 *
 * `depth` is how far the section's parallax layers separate, in scene units.
 * `drift` is the ambient speed multiplier for anything that moves on its own.
 */
export const PACE = {
  /** Slow and atmospheric. The opening should feel held. */
  hero: { depth: 1.0, drift: 0.35, lag: 0.08 },
  /** Layered and elegant; the portrait plate leads the copy. */
  about: { depth: 0.6, drift: 0.2, lag: 0.12 },
  /** Interactive and technical — responds faster than it drifts. */
  skills: { depth: 0.8, drift: 0.5, lag: 0.05 },
  /** The high-energy stretch. Most depth, most travel. */
  projects: { depth: 1.4, drift: 0.6, lag: 0.06 },
  /** Structured but moving: a path the reader is walked along. */
  journey: { depth: 0.5, drift: 0.15, lag: 0.14 },
  /** Minimal and cinematic. Almost nothing moves; what does, moves slowly. */
  contact: { depth: 0.9, drift: 0.12, lag: 0.1 },
} as const;

export type PaceKey = keyof typeof PACE;

/* ---------- helpers ---------- */

/** The standard fade-and-rise, so it is declared once. */
export const rise = (delay = 0, y = 24) => ({
  initial: { opacity: 0, y },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT,
  transition: { duration: DUR.settle, delay, ease: SETTLE },
});
