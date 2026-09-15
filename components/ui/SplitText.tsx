"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/**
 * Per-letter entrance for the display type.
 *
 * The reference builds its opening word one glyph at a time — each letter
 * rises out of a mask and settles, left to right, over about a second. Every
 * other reveal on the site is line-level; this is the only place a per-letter
 * treatment is warranted, because the word IS the composition.
 *
 * `trigger` decides when it runs. The opening word fires on mount; anything
 * further down the page fires when it is reached, and the observed element is
 * the wrapper — never the letters. A letter starts fully below its own
 * overflow-hidden mask, so an observer watching the letter would see a
 * clipped, zero-area box, report "not visible", and never release it.
 *
 * The word is exposed to assistive technology as a single string via
 * `aria-label`, with the glyph spans hidden, so it is never read out one
 * letter at a time.
 */
export default function SplitText({
  text,
  className = "",
  letterClassName = "",
  delay = 0,
  stagger = 0.055,
  trigger = "mount",
  style,
  as: Tag = "span",
  ...rest
}: {
  text: string;
  className?: string;
  letterClassName?: string;
  delay?: number;
  stagger?: number;
  trigger?: "mount" | "view";
  /** For geometry that has to be computed rather than named in a class. */
  style?: React.CSSProperties;
  as?: "h1" | "h2" | "h3" | "span" | "div";
  /* Anything else — notably `data-*` hooks — reaches the rendered element.
     Without this the component silently swallows unknown props, which is how
     `data-liquid-target` went missing and took the melt effect with it: the
     attribute was in the source, never in the DOM, and the effect that looks
     for it simply never engaged. */
} & Omit<React.HTMLAttributes<HTMLElement>, "style" | "className">) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-90px" });
  const go = trigger === "mount" || inView;

  if (reduced) {
    return (
      <Tag className={className} style={style} {...rest}>
        {text}
      </Tag>
    );
  }

  const letters = Array.from(text);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement & HTMLSpanElement & HTMLDivElement>}
      className={className}
      style={style}
      aria-label={text}
      {...rest}
    >
      {letters.map((char, i) => (
        <span
          key={`${char}-${i}`}
          aria-hidden="true"
          // The mask box. `pb` gives descenders and the vertical scale room to
          // travel without being clipped at rest.
          className="inline-block overflow-hidden pb-[0.06em] align-bottom"
        >
          <motion.span
            className={`inline-block ${letterClassName}`}
            initial={{ y: "108%" }}
            animate={go ? { y: "0%" } : undefined}
            transition={{
              duration: 1.1,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {char === " " ? " " : char}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
