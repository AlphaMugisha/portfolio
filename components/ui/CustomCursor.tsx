"use client";

import { MousePointer2 } from "lucide-react";
import { useEffect, useRef } from "react";

/**
 * A global cursor shaped like the arrow sticker in the hero. It follows the
 * pointer, hides the native cursor, grows over anything interactive, and is
 * recoloured per theme through CSS variables (amber on black, black on grey).
 *
 * Three guards keep it from being a liability:
 *   - it only engages for a fine pointer with hover, so touch devices are
 *     untouched;
 *   - the native cursor is only hidden once this one is mounted and moving,
 *     via the `has-custom-cursor` class, so a JS failure can never leave a
 *     page with no cursor at all;
 *   - it is driven by writing `transform` directly rather than through
 *     React state, because a cursor that re-renders on mousemove is a cursor
 *     that lags.
 */
export default function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine =
      window.matchMedia("(pointer: fine)").matches &&
      window.matchMedia("(hover: hover)").matches;
    if (fine === false) return;

    const el = ref.current;
    if (!el) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const interactive =
      "a,button,[role=button],input,textarea,select,summary,label,.cursor-grow";

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (el.style.opacity !== "1") el.style.opacity = "1";
      const target = e.target as Element | null;
      el.classList.toggle("is-hover", Boolean(target?.closest?.(interactive)));
    };
    const onDown = () => el.classList.add("is-down");
    const onUp = () => el.classList.remove("is-down");
    const onLeave = () => (el.style.opacity = "0");
    const onEnter = () => (el.style.opacity = "1");

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  return (
    <div ref={ref} className="custom-cursor" aria-hidden="true">
      <MousePointer2 size={30} strokeWidth={1.5} />
    </div>
  );
}
