/**
 * One pointer, shared.
 *
 * Rule 16 of the redesign brief: the cursor interacts with the WHOLE site,
 * not just the hero. The wrong way to honour that is one pointermove listener
 * per section — a dozen components each doing their own getBoundingClientRect
 * arithmetic on every mouse move. This module attaches exactly one listener
 * and publishes the normalised position as MotionValues; anything that wants
 * to lean, tilt or glow toward the pointer subscribes.
 *
 * MotionValues on purpose: subscribers animate from them without a single
 * React re-render, which is the difference between "the site follows the
 * cursor" and "the site re-renders on mouse move".
 *
 * The listener lives for the life of the page. That is not a leak — it is
 * the page's own sense organ, and removing it would only ever be followed by
 * re-adding it.
 */

import { motionValue } from "framer-motion";

/** -1..1 across the viewport, left to right. 0 before the pointer moves. */
export const pointerX = motionValue(0);
/** -1..1 down the viewport, top to bottom. */
export const pointerY = motionValue(0);

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );

  // When the pointer leaves the window the world settles back to centre —
  // otherwise everything holds a lean toward wherever the mouse exited.
  document.addEventListener("pointerleave", () => {
    pointerX.set(0);
    pointerY.set(0);
  });
}
