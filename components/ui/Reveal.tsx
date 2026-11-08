"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

/**
 * Scroll entrances, with a vocabulary instead of one fade-up.
 *
 * The brief for this site is that sections should not all arrive the
 * same way, so each variant is matched to what it is revealing:
 *
 *   rise     text and small clusters — the quiet default, used least
 *   stack    a group whose children should arrive in sequence
 *   wipe     a panel, uncovered bottom-to-top like a shutter opening
 *   curtain  a wide lit band, drawn across left-to-right
 *   scale    a single focal object settling into place
 *   unmask   photography: the frame opens while the image inside
 *            de-zooms, so the picture resolves rather than appears
 *
 * Start states live in CSS (see globals.css) so there is no flash
 * before hydration and no blank page without JavaScript. Each instance
 * fires once; re-animating on every pass stops reading as arrival and
 * starts reading as a glitch.
 */

type Variant = "rise" | "stack" | "wipe" | "curtain" | "scale" | "unmask";

const DURATION: Record<Variant, number> = {
  rise: 0.95,
  stack: 0.9,
  wipe: 1.1,
  curtain: 1.25,
  scale: 1.05,
  unmask: 1.3,
};

export default function Reveal({
  children,
  as: Tag = "div",
  variant = "rise",
  className = "",
  delay = 0,
  stagger = 0.085,
  start = "top 85%",
}: {
  children: ReactNode;
  as?: ElementType;
  variant?: Variant;
  className?: string;
  delay?: number;
  stagger?: number;
  start?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      // Reduced motion: clear the CSS start state immediately and do not
      // build a trigger at all.
      if (reduced) {
        gsap.set(el, { clearProps: "all" });
        gsap.set(el.children, { clearProps: "all" });
        return;
      }

      const duration = DURATION[variant];
      const ease = variant === "curtain" || variant === "wipe" ? "power4.inOut" : "power3.out";

      /**
       * Clipping must be REMOVED at the end, not cleared.
       *
       * `clearProps: "clipPath"` deletes the inline value GSAP was
       * animating, which hands control straight back to the
       * `.js [data-reveal="…"]` rule in globals.css — the fully-clipped
       * start state. The element animates open and then silently snaps
       * shut again. Setting `clip-path: none` keeps an inline value that
       * outranks the stylesheet, and drops the clip entirely so a
       * scaled child (unmask) is not cropped afterwards.
       */
      const settle = () => {
        gsap.set(el, { clipPath: "none", willChange: "auto" });
      };

      const run = () => {
        switch (variant) {
          case "stack":
            gsap.to(el.children, {
              opacity: 1,
              y: 0,
              duration,
              delay,
              ease,
              stagger,
              clearProps: "willChange",
            });
            break;
          case "wipe":
            gsap.to(el, {
              clipPath: "inset(0 0 0% 0)",
              duration,
              delay,
              ease,
              onComplete: settle,
            });
            break;
          case "curtain":
            gsap.to(el, {
              clipPath: "inset(0 0% 0 0)",
              duration,
              delay,
              ease,
              onComplete: settle,
            });
            break;
          case "scale":
            gsap.to(el, {
              opacity: 1,
              scale: 1,
              duration,
              delay,
              ease,
              clearProps: "willChange",
            });
            break;
          case "unmask":
            gsap
              .timeline({ delay, onComplete: settle })
              .to(el, { clipPath: "inset(0 0 0% 0)", duration, ease: "power4.inOut" })
              .to(el.children, { scale: 1, duration: duration * 1.15, ease: "power3.out" }, 0);
            break;
          default:
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration,
              delay,
              ease,
              clearProps: "willChange",
            });
        }
      };

      const st = ScrollTrigger.create({ trigger: el, start, once: true, onEnter: run });
      return () => st.kill();
    },
    { scope: root, dependencies: [reduced, variant, delay, stagger, start] },
  );

  return (
    <Tag ref={root} data-reveal={variant} className={className}>
      {children}
    </Tag>
  );
}
