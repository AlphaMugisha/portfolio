"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/**
 * The site's signature image treatment.
 *
 * Three things happen at once, and they are deliberately the SAME three
 * everywhere an image appears, so the page reads as one idea rather than a
 * catalogue of effects:
 *
 *   1. the frame unmasks upward behind a clip-path wipe,
 *   2. the photograph settles from a slight overscale, and
 *   3. thereafter it drifts against the scroll inside the fixed frame.
 *
 * The drift is what sells depth — the frame holds still while its contents
 * move, which is how a real parallax plate behaves.
 *
 * The entrance is driven by an explicit `useInView` on the frame rather than
 * by `whileInView` on the animated elements. Two reasons: viewport margins
 * here are px (a percentage margin is rejected outright and the observer
 * never fires at all), and the element that decides "am I visible" is the
 * frame, which never moves — not the plate inside it, which does.
 */
export default function RevealImage({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
  drift = 10,
  rounded = "rounded-sm",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Overscan and travel, as a percentage of frame height. */
  drift?: number;
  rounded?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-90px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [`-${drift}%`, `${drift}%`]);
  const y = useSpring(rawY, { stiffness: 105, damping: 32, mass: 0.45 });

  if (reduced) {
    return (
      <div ref={ref} className={`relative overflow-hidden ${rounded} ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      animate={inView ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
      transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden ${rounded} ${className}`}
    >
      <motion.div
        style={{ y, height: `${100 + drift * 2}%`, top: `-${drift}%` }}
        className="absolute inset-x-0"
      >
        <motion.div
          initial={{ scale: 1.12 }}
          animate={inView ? { scale: 1 } : undefined}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full w-full"
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
