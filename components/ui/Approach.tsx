"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCapability } from "@/components/ui/useCapability";

/**
 * The section-to-section grammar.
 *
 * Rule 14 of the redesign brief: no SECTION → fade → SECTION. The page is one
 * camera move, so content does not appear — it APPROACHES. Entering the
 * viewport it dollies up from slightly behind the focal plane; leaving, it
 * passes the camera: a touch larger, softer, dimmer. Wrapped around every
 * non-pinned section's content, this one device is what makes six separate
 * sections read as fixtures passed in a single travelling shot.
 *
 * The pinned scenes (rack, constellation, dolly timeline) are excluded on
 * purpose — their internal scroll choreography IS their approach, and a
 * second transform underneath a sticky viewport fights the pin.
 *
 * Scale-and-blur rather than perspective translateZ, deliberately: this
 * wrapper sits OUTSIDE each section's own stage, where a shared ancestor
 * perspective would re-project every interior layer, and scale composites on
 * the GPU everywhere. Blur is the expensive half, so it is reserved for
 * high-tier devices with a fine pointer; everyone else keeps the dolly and
 * loses only the focus pull.
 */
export default function Approach({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cap = useCapability();

  // Finished well before the section top reaches the header, so anything
  // sticky inside engages at rest. Exit begins only in the last stretch.
  const { scrollYProgress: enter } = useScroll({
    target: ref,
    offset: ["start end", "start 0.42"],
  });
  const { scrollYProgress: exit } = useScroll({
    target: ref,
    offset: ["end 0.58", "end start"],
  });

  const eScale = useTransform(enter, [0, 1], [0.955, 1]);
  const xScale = useTransform(exit, [0, 1], [1, 1.03]);
  const scale = useTransform(() => eScale.get() * xScale.get());

  const eY = useTransform(enter, [0, 1], [64, 0]);
  const xY = useTransform(exit, [0, 1], [0, -44]);
  const y = useTransform(() => eY.get() + xY.get());

  const eO = useTransform(enter, [0, 1], [0.42, 1]);
  const xO = useTransform(exit, [0, 1], [1, 0.5]);
  const opacity = useTransform(() => eO.get() * xO.get());

  const eB = useTransform(enter, [0, 1], [9, 0]);
  const xB = useTransform(exit, [0, 1], [0, 5]);
  const filter = useTransform(() => {
    const b = eB.get() + xB.get();
    return b < 0.08 ? "none" : `blur(${b.toFixed(2)}px)`;
  });

  // The focus pull is a luxury; the dolly is the language.
  const withBlur = cap.ready && cap.tier === "high" && cap.finePointer;

  if (cap.ready && cap.reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={
          withBlur
            ? { scale, y, opacity, filter, willChange: "transform" }
            : { scale, y, opacity, willChange: "transform" }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
