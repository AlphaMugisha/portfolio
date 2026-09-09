"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

/**
 * Cursor-tethered preview plate.
 *
 * The reference's expertise list has no thumbnails in the layout at all —
 * hovering a row summons the image to the pointer and it follows on a lag.
 * That keeps the list itself as pure typography while still showing the work.
 *
 * The plate is `position: fixed` and driven by two springs so it trails the
 * pointer rather than sticking to it; the lag is the entire effect. It is
 * decorative and duplicative of the row's own text, so it is `aria-hidden`
 * and never mounts on touch or under reduced motion.
 */
export default function HoverPreview({
  src,
  alt = "",
  width = 300,
  height = 200,
}: {
  /** null hides the plate. Changing it swaps the image in place. */
  src: string | null;
  alt?: string;
  width?: number;
  height?: number;
}) {
  const reduced = useReducedMotion();

  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 220, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 28, mass: 0.6 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, x, y]);

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
    >
      <AnimatePresence>
        {src && (
          <motion.div
            key={src}
            initial={{ opacity: 0, scale: 0.86, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2 }}
            className="relative overflow-hidden rounded-sm border border-line-strong bg-surface shadow-2xl shadow-black/60"
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="300px"
              className="object-cover"
            />
            <span className="absolute inset-0 bg-ink/15" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
