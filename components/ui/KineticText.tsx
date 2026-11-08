"use client";

import { useRef, type ElementType } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

/**
 * Display type that builds itself.
 *
 * Each line sits in its own mask and every character is a separate
 * transform, so the words climb out from under their own baseline with
 * a slight rotation — type being set, rather than text being faded in.
 *
 * Splitting per CHARACTER (not per word) is what makes this read as
 * deliberate at display sizes: at 11rem a word-level stagger is four
 * huge blocks arriving, while a character-level one is a wave crossing
 * the line. Word boundaries are preserved as real spaces inside
 * non-breaking groups so the line still wraps like text.
 *
 * Accessibility: the split is decorative. The wrapper carries the whole
 * string as `aria-label` and every generated span is `aria-hidden`, so
 * assistive tech reads one clean phrase rather than a letter salad.
 *
 * Under reduced motion it renders the finished line as plain text with
 * no spans at all.
 */
export default function KineticText({
  text,
  as: Tag = "span",
  className = "",
  charClassName = "",
  play = true,
  trigger = "mount",
  delay = 0,
  stagger = 0.028,
  from = "start",
}: {
  text: string;
  as?: ElementType;
  className?: string;
  charClassName?: string;
  /** Gate for `trigger="mount"` — lets the hero wait for the boot shutter. */
  play?: boolean;
  trigger?: "mount" | "scroll";
  delay?: number;
  stagger?: number;
  from?: "start" | "end" | "center" | "edges";
}) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const chars = gsap.utils.toArray<HTMLElement>("[data-char]", root.current);
      if (!chars.length) return;

      const build = () =>
        gsap.fromTo(
          chars,
          { yPercent: 118, rotate: 4, opacity: 0 },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: 1.05,
            ease: "power4.out",
            stagger: { each: stagger, from },
            delay,
          },
        );

      if (trigger === "scroll") {
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top 86%",
          once: true,
          onEnter: build,
        });
        return () => st.kill();
      }

      if (!play) return;
      const tween = build();
      return () => {
        tween.kill();
      };
    },
    { scope: root, dependencies: [reduced, play, trigger, delay, stagger, from] },
  );

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  // Split on spaces but keep them: each word is an inline-block so it
  // never breaks mid-word, and the space between words is its own
  // inline-block of the same width.
  const words = text.split(" ");

  return (
    <Tag ref={root} className={`kinetic-line ${className}`} aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap" aria-hidden="true">
          {Array.from(word).map((char, ci) => (
            <span
              key={`${char}-${ci}`}
              data-char
              className={`kinetic-char ${charClassName}`}
            >
              {char}
            </span>
          ))}
          {wi < words.length - 1 ? (
            <span data-char className="kinetic-char">
              &nbsp;
            </span>
          ) : null}
        </span>
      ))}
    </Tag>
  );
}
