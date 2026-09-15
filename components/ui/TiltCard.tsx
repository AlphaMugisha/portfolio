"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";

/**
 * The card treatment: a subtle pointer tilt plus a pool of the accent light
 * that follows the cursor across the surface.
 *
 * The tilt is capped low on purpose — it should read as the card noticing
 * the pointer, not as a gimbal. The glow is the same idea as a hover border,
 * but continuous: attention lands exactly where the pointer is.
 *
 * Both effects need a fine pointer to mean anything and both are motion, so
 * on touch devices and under reduced motion this renders a plain div and
 * attaches no listeners at all. `tilt={0}` keeps the glow alone for small
 * plates, where rotation reads as jitter.
 */
export default function TiltCard({
  children,
  className = "",
  /** Maximum rotation in degrees. 0 disables tilt and keeps the glow. */
  tilt = 4,
  /** Radius of the pointer glow in px. */
  glow = 260,
}: {
  children: ReactNode;
  className?: string;
  tilt?: number;
  glow?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [fine, setFine] = useState(false);

  useEffect(() => {
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const opacity = useMotionValue(0);

  const spring = { stiffness: 190, damping: 22, mass: 0.5 };
  const rx = useSpring(useMotionValue(0), spring);
  const ry = useSpring(useMotionValue(0), spring);
  const glowOpacity = useSpring(opacity, { stiffness: 160, damping: 28 });

  const background = useMotionTemplate`radial-gradient(${glow}px circle at calc(${px} * 100%) calc(${py} * 100%), rgba(84, 209, 219, 0.09), transparent 70%)`;

  const active = fine && !reduced;

  if (!active) {
    return <div className={className}>{children}</div>;
  }

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    px.set(x);
    py.set(y);
    opacity.set(1);
    rx.set((0.5 - y) * 2 * tilt);
    ry.set((x - 0.5) * 2 * tilt);
  };

  const onLeave = () => {
    opacity.set(0);
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 900,
      }}
      className={`relative ${className}`}
    >
      {children}
      <motion.div
        aria-hidden="true"
        style={{ background, opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0"
      />
    </motion.div>
  );
}
