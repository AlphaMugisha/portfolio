"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { lerp } from "@/lib/motion";

/**
 * A control that leans toward the pointer.
 *
 * Within `radius` of the element's centre the child is pulled a fraction
 * of the way toward the pointer, and released on a spring when the
 * pointer leaves. Paired with the cursor ring locking onto the same
 * centre (see `Cursor`), the two meet and the control feels grabbed
 * rather than merely hovered.
 *
 * The pull is capped at `strength` of the distance and the element never
 * moves more than a few pixels, which matters: a button that runs away
 * from the pointer is a worse button. The hit area does not move at all —
 * only the visual child is transformed — so clicking still works exactly
 * where it looks like it should.
 *
 * Disabled entirely for coarse pointers and reduced motion.
 */
export default function Magnetic({
  children,
  className = "",
  strength = 0.32,
  radius = 90,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const child = inner.current;
    if (!el || !child) return;

    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;
    let running = false;

    const tick = () => {
      current.x = lerp(current.x, target.x, 0.18);
      current.y = lerp(current.y, target.y, 0.18);
      child.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;

      // Park the loop once it has effectively arrived at rest, so an
      // idle page is not burning a rAF per magnetic control.
      if (Math.abs(current.x - target.x) < 0.05 && Math.abs(current.y - target.y) < 0.05) {
        current.x = target.x;
        current.y = target.y;
        child.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const distance = Math.hypot(dx, dy);
      const reach = Math.max(radius, box.width * 0.6, box.height * 0.6);

      if (distance > reach) {
        target.x = 0;
        target.y = 0;
      } else {
        const falloff = 1 - distance / reach;
        target.x = dx * strength * falloff;
        target.y = dy * strength * falloff;
      }
      start();
    };

    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      start();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      child.style.transform = "";
    };
  }, [strength, radius]);

  return (
    <span ref={wrap} className={`inline-block ${className}`} data-magnetic>
      <span ref={inner} className="inline-block will-change-transform">
        {children}
      </span>
    </span>
  );
}
