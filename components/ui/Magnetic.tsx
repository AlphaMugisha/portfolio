"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * Magnetic pull.
 *
 * Within a radius of the pointer the element leans toward it, then springs back
 * when the pointer leaves. The effect is small by design — it should register as
 * the interface being attentive, not as the button running away.
 *
 * Two details separate this from the usual implementation:
 *
 *   - The label can travel further than its own hit area, via `contentPull`.
 *     Moving the whole button means the cursor and the target chase each other
 *     and the click target drifts out from under the pointer; moving the label
 *     more than the box keeps the hit area honest while still reading as pull.
 *   - The listener is on `window`, not the element, so the pull begins before
 *     the pointer arrives. Attaching to the element means nothing happens until
 *     hover, which is precisely too late for a magnet.
 *
 * Guards: never engages on coarse pointers or under reduced motion, and in both
 * cases no listener is attached at all.
 */
export default function Magnetic({
  children,
  className = "",
  /** How far away the pull starts, in px beyond the element's own box. */
  radius = 90,
  /** Maximum travel of the box itself, in px. */
  pull = 10,
  /** Extra travel for the contents, so the box stays under the pointer. */
  contentPull = 6,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
  pull?: number;
  contentPull?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);

  const spring = { stiffness: 280, damping: 22, mass: 0.4 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const scx = useSpring(cx, spring);
  const scy = useSpring(cy, spring);

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const midX = r.left + r.width / 2;
      const midY = r.top + r.height / 2;
      const dx = e.clientX - midX;
      const dy = e.clientY - midY;

      // Distance measured from the element's edge, not its centre, so a wide
      // button does not need the pointer near its middle to respond.
      const edgeX = Math.max(0, Math.abs(dx) - r.width / 2);
      const edgeY = Math.max(0, Math.abs(dy) - r.height / 2);
      const dist = Math.hypot(edgeX, edgeY);

      if (dist > radius) {
        x.set(0);
        y.set(0);
        cx.set(0);
        cy.set(0);
        return;
      }

      // Falls off toward the edge of the radius rather than being uniform, so
      // approaching the button feels like entering a field.
      const strength = 1 - dist / radius;
      const nx = Math.max(-1, Math.min(1, dx / (r.width / 2 + radius)));
      const ny = Math.max(-1, Math.min(1, dy / (r.height / 2 + radius)));

      x.set(nx * pull * strength);
      y.set(ny * pull * strength);
      cx.set(nx * contentPull * strength);
      cy.set(ny * contentPull * strength);
    };

    const onLeave = () => {
      x.set(0);
      y.set(0);
      cx.set(0);
      cy.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, radius, pull, contentPull, x, y, cx, cy]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }} className={className}>
      <motion.div style={{ x: scx, y: scy }}>{children}</motion.div>
    </motion.div>
  );
}
