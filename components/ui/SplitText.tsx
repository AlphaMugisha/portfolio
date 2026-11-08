"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

/**
 * Builds a heading word by word, each one masked by its own overflow-hidden
 * span so it rises from underneath its own baseline rather than fading in
 * place. Splitting on words (not letters) keeps it legible mid-animation and
 * cheap: one motion node per word, not per glyph.
 */
export default function SplitText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger: step = 0.05,
}: {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom"
          // Descenders (g, y, p…) sit below the glyph's natural line box; a
          // hard overflow-hidden edge right at that box's foot clips through
          // their anti-aliased pixels and reads as a stray underline. Padding
          // the mask and pulling it back with an equal negative margin gives
          // descenders room without shifting the surrounding layout.
          style={{ paddingBottom: "0.2em", marginBottom: "-0.2em" }}
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.7, delay: delay + i * step, ease: EASE }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
