"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { SETTLE } from "@/lib/motion";

/**
 * Pointer-driven 3D tilt.
 *
 * The card rotates toward the pointer as though it were a physical panel being
 * looked at from an angle, and its contents separate in depth while it does.
 * That second part is what stops this reading as the usual CSS tilt trick: a
 * plate that rotates as one flat rectangle looks like a rotated rectangle,
 * whereas one whose contents sit at different depths looks like an object.
 *
 * Children opt into that separation with `data-depth="0..1"` — 0 stays welded
 * to the card face, 1 floats furthest toward the viewer. The component reads
 * the attribute and drives a CSS custom property, so the depth is declarative
 * at the call site rather than wired up per child.
 *
 * Guards: no tilt on coarse pointers (there is nothing to track) and none under
 * reduced motion. In both cases it renders a plain div and adds no listeners at
 * all, so the cost is zero rather than merely invisible.
 */
export default function Tilt({
  children,
  className = "",
  /** Maximum rotation at the far edge, in degrees. Past ~10 it reads as a gimmick. */
  max = 7,
  /** How far the whole card lifts toward the viewer on hover, in px. */
  lift = 24,
  /** Perspective for this card alone. Omit to inherit the section's stage. */
  perspective,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  lift?: number;
  perspective?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // -1..1 across each axis of the card.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hover = useMotionValue(0);

  const spring = { stiffness: 260, damping: 28, mass: 0.5 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const sh = useSpring(hover, spring);

  // Y rotation follows horizontal travel, X rotation follows vertical, inverted
  // so the edge nearest the pointer comes toward the viewer.
  const rotateY = useTransform(sx, [-1, 1], [-max, max]);
  const rotateX = useTransform(sy, [-1, 1], [max, -max]);
  const z = useTransform(sh, [0, 1], [0, lift]);
  const depth = useTransform(sh, [0, 1], [0, 1]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Coarse pointers fire pointermove on tap; ignore them so a touch never
    // leaves the card stuck at an angle.
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const reset = () => {
    px.set(0);
    py.set(0);
    hover.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerEnter={(e) => e.pointerType === "mouse" && hover.set(1)}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{
        rotateX,
        rotateY,
        z,
        transformStyle: "preserve-3d",
        ...(perspective ? { perspective } : null),
        // Children read this to scale their own translateZ, so one spring
        // drives the whole depth separation.
        ["--tilt-depth" as string]: depth,
      }}
      transition={{ duration: 0.4, ease: SETTLE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * A child of `Tilt` that floats at its own depth as the card lifts.
 *
 * `depth` is a multiplier on the parent's hover progress, so everything moves
 * together and settles together rather than each element running its own timer.
 */
export function TiltLayer({
  children,
  depth = 0.5,
  className = "",
}: {
  children: ReactNode;
  /** 0 sits flat on the card face; 1 floats furthest toward the viewer. */
  depth?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={className}
      style={{
        transformStyle: "preserve-3d",
        transform: `translateZ(calc(var(--tilt-depth, 0) * ${depth * 70}px))`,
      }}
    >
      {children}
    </div>
  );
}
