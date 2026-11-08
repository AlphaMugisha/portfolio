"use client";

import { useEffect, useRef, useState } from "react";
import { lerp } from "@/lib/motion";

/**
 * The pointer, rebuilt as an instrument probe.
 *
 * Two parts with different jobs, which is the whole reason it is worth
 * replacing the native cursor at all:
 *
 *   - the PROBE is a hard 5px dot that tracks the pointer exactly. It is
 *     the thing you aim with, so it never lags; losing precision would
 *     make the site harder to use, not more impressive.
 *   - the RING trails behind on a spring and carries the state. It grows
 *     over anything interactive, fills when you press, and — over an
 *     element that declares `data-cursor-label` — opens into a labelled
 *     readout ("OPEN", "DRAG", "EMAIL") so the pointer tells you what the
 *     thing under it will do before you click it.
 *
 * Over an element marked `data-magnetic`, the ring LOCKS to that
 * element's centre instead of following the pointer. Combined with the
 * element's own magnetic pull (see `Magnetic`), the two meet in the
 * middle and the control feels physically grabbed.
 *
 * Three guards keep this from ever being a liability:
 *   - it mounts only for a fine pointer with hover, so touch is untouched;
 *   - `cursor: none` is applied through a class this component adds to
 *     <html> only AFTER it is mounted and has received a real pointer
 *     position, so a JS failure can never leave a page with no cursor;
 *   - everything is written straight to `transform`, never through React
 *     state, because a cursor that re-renders on mousemove is a cursor
 *     that lags.
 */

type CursorState = "default" | "active" | "labelled";

export default function Cursor() {
  const probeRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [state, setState] = useState<CursorState>("default");
  const [enabled, setEnabled] = useState(false);

  // Read inside the rAF loop; kept in refs so changing them never
  // re-renders and never restarts the loop.
  const pointer = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const lock = useRef<{ x: number; y: number } | null>(null);
  const pressed = useRef(false);
  const visible = useRef(false);

  useEffect(() => {
    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const probe = probeRef.current;
    const ring = ringRef.current;
    if (!probe || !ring) return;

    const root = document.documentElement;
    let raf = 0;
    let armed = false;

    const onMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;

      if (!armed) {
        // First real position: jump the ring there so it does not fly in
        // from 0,0, then hand the page over to the custom cursor.
        armed = true;
        ringPos.current.x = event.clientX;
        ringPos.current.y = event.clientY;
        visible.current = true;
        root.classList.add("has-cursor");
        probe.style.opacity = "1";
        ring.style.opacity = "1";
      }

      const target = event.target as HTMLElement | null;
      const hit = target?.closest?.(
        "a,button,[role=button],input,textarea,select,summary,label,[data-cursor]",
      ) as HTMLElement | null;

      if (!hit) {
        lock.current = null;
        setState("default");
        setLabel("");
        return;
      }

      const text = hit.dataset.cursorLabel ?? "";
      setLabel(text);
      setState(text ? "labelled" : "active");

      if (hit.hasAttribute("data-magnetic")) {
        const box = hit.getBoundingClientRect();
        lock.current = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      } else {
        lock.current = null;
      }
    };

    const onDown = () => (pressed.current = true);
    const onUp = () => (pressed.current = false);

    const onLeave = () => {
      visible.current = false;
      probe.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = () => {
      if (!armed) return;
      visible.current = true;
      probe.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const tick = () => {
      const { x: px, y: py } = pointer.current;
      const aim = lock.current ?? pointer.current;

      // The ring eases toward its aim; a locked ring catches up faster so
      // the snap onto a button reads as deliberate rather than floaty.
      const k = lock.current ? 0.32 : 0.17;
      ringPos.current.x = lerp(ringPos.current.x, aim.x, k);
      ringPos.current.y = lerp(ringPos.current.y, aim.y, k);

      probe.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) scale(${
        pressed.current ? 0.5 : 1
      })`;
      ring.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%) scale(${
        pressed.current ? 0.88 : 1
      })`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      root.classList.remove("has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringSize = state === "labelled" ? 76 : state === "active" ? 46 : 28;

  return (
    <div aria-hidden="true">
      <div
        ref={probeRef}
        className="cursor-layer h-[5px] w-[5px] rounded-full bg-signal opacity-0"
        style={{ transition: "opacity 220ms linear" }}
      />
      <div
        ref={ringRef}
        className="cursor-layer grid place-items-center rounded-full border opacity-0"
        style={{
          width: ringSize,
          height: ringSize,
          borderColor: state === "default" ? "rgb(254 176 2 / 0.5)" : "rgb(254 176 2 / 0.95)",
          background: state === "labelled" ? "rgb(254 176 2 / 0.16)" : "transparent",
          backdropFilter: state === "default" ? "none" : "invert(4%)",
          transition:
            "width 420ms cubic-bezier(0.22,1,0.36,1), height 420ms cubic-bezier(0.22,1,0.36,1), background 300ms linear, border-color 300ms linear, opacity 220ms linear",
        }}
      >
        <span
          className="font-mono text-[9px] uppercase tracking-[0.14em] text-signal"
          style={{
            opacity: state === "labelled" ? 1 : 0,
            transition: "opacity 200ms linear",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
