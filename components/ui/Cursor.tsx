"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

/**
 * Cursor follower.
 *
 * A small dot that tracks the pointer exactly, and a ring that lags behind it
 * on a spring. Over anything interactive the ring expands and fills; over an
 * element carrying `data-cursor="<label>"` it expands further and shows that
 * label, which is how the project cards say "View" without adding chrome.
 *
 * Guards, in order of importance:
 *  - never mounts on coarse pointers (touch), where there is no cursor
 *  - never mounts under prefers-reduced-motion
 *  - the native cursor is only hidden AFTER this mounts, via a class on
 *    <html>, so a JS failure can never leave the page with no cursor at all
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // The ring lags; the dot does not.
  const ringX = useSpring(x, { stiffness: 380, damping: 34, mass: 0.35 });
  const ringY = useSpring(y, { stiffness: 380, damping: 34, mass: 0.35 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      const el = (e.target as HTMLElement)?.closest?.(
        "a, button, [data-cursor], input, textarea, select, [role='tab']"
      ) as HTMLElement | null;

      setActive(Boolean(el));
      setLabel(el?.dataset?.cursor ?? null);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-100">
      {/* Ring */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="absolute left-0 top-0"
      >
        <motion.div
          animate={{
            width: label ? 76 : active ? 44 : 26,
            height: label ? 76 : active ? 44 : 26,
            opacity: visible ? 1 : 0,
            backgroundColor: label
              ? "rgba(254,176,2,0.92)"
              : active
                ? "rgba(254,176,2,0.14)"
                : "rgba(254,176,2,0)",
            borderColor: active ? "rgba(254,176,2,0.9)" : "rgba(242,242,242,0.45)",
          }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border"
        >
          <AnimatePresence>
            {label && (
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-primary"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Dot — hidden while a label is showing, it would sit on top of it */}
      <motion.div
        style={{ x, y }}
        className="absolute left-0 top-0"
      >
        <motion.div
          animate={{ opacity: visible && !label ? 1 : 0, scale: active ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
        />
      </motion.div>
    </div>
  );
}
