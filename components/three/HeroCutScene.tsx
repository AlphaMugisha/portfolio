"use client";

import { useEffect, useState } from "react";
import { useCapability } from "@/components/ui/useCapability";
import { fieldFromElement, type Field } from "@/lib/sdf";
import Stage from "@/components/three/Stage";
import CutSheet, { CutDust } from "@/components/three/CutSheet";

/**
 * Drives the hero's cut-sheet treatment.
 *
 * Owns three things the scene itself should not care about:
 *
 *  1. MEASURING THE WORD. The distance field is generated from the live
 *     heading, so this waits for fonts to settle and re-measures on resize.
 *     Anton arriving after first paint would otherwise bake a fallback face's
 *     letterforms into the cut.
 *
 *  2. THE HANDOFF. The flat word animates in letter by letter, and no shader
 *     can match that per-letter reveal. So the DOM word plays its entrance
 *     normally and only then hands over: the ink fades out as the cut opens.
 *     The word becomes a hole rather than being swapped for one, and the
 *     synchronisation problem disappears instead of being solved.
 *
 *  3. DECIDING NOT TO RUN. If the field cannot be built — no fonts, no layout,
 *     an empty heading — nothing mounts and the flat word simply stays. The
 *     failure mode is the existing design, not a blank band.
 */

/** The flat word's own entrance: 8 letters, 0.05s apart, 1.1s each, +0.15 delay. */
const ENTRANCE_MS = 1750;

export default function HeroCutScene({
  /** The hero section. The canvas fills it and the heading is found inside it. */
  hostRef,
  /** Which element inside the host to cut. */
  targetSelector = "[data-liquid-target]",
  /** 0..1 — how far the hero has scrolled away. Deepens the room. */
  scrolled = 0,
  /** Fires when the cut takes over, so the flat word's own melt can stand down. */
  onActive,
}: {
  hostRef: React.RefObject<HTMLElement | null>;
  targetSelector?: string;
  scrolled?: number;
  onActive?: (active: boolean) => void;
}) {
  const cap = useCapability();

  /* Resolved from the DOM rather than taken as a ref: the heading is rendered
     by SplitText, which owns its own ref for view detection and does not
     forward one. Querying keeps that component's API unchanged. */
  const target = () =>
    hostRef.current?.querySelector<HTMLElement>(targetSelector) ?? null;
  const [field, setField] = useState<Field | null>(null);
  const [reveal, setReveal] = useState(0);
  const [melt, setMelt] = useState(0);

  // ---- measure ----
  useEffect(() => {
    if (!cap.ready || !cap.render3D) return;

    let alive = true;

    const measure = async () => {
      if (!alive) return;
      const el = target();
      const host = hostRef.current;
      if (!el || !host) return;
      // Rasterising is synchronous and happens now, against the layout as it
      // stands; the transform behind it is off-thread and lands later. The
      // `alive` check has to be repeated after the await — a resize during
      // the transform, or an unmount, both resolve into this callback.
      const next = await fieldFromElement(el, host.getBoundingClientRect());
      if (next && alive) setField(next);
    };

    // Fonts first: measuring before Anton resolves bakes the fallback face's
    // letterforms into the field, and the cut would then never match the type.
    const start = document.fonts?.ready ?? Promise.resolve();
    start.then(() => {
      if (!alive) return;
      measure();
    });

    // Resize changes the clamp, which changes the type, which changes the cut.
    let debounce = 0;
    const onResize = () => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(measure, 180);
    };
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      window.clearTimeout(debounce);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cap.ready, cap.render3D, hostRef, targetSelector]);

  // ---- handoff ----
  useEffect(() => {
    if (!field) return;
    // Under reduced motion there is no entrance to wait for, so the cut is
    // simply already open.
    if (cap.reducedMotion) {
      setReveal(1);
      return;
    }
    const t = window.setTimeout(() => setReveal(1), ENTRANCE_MS);
    return () => window.clearTimeout(t);
  }, [field, cap.reducedMotion]);

  // Once the cut is open the DOM ink must not double up with it. This is a
  // class rather than inline style so the fallback path never touches the word.
  useEffect(() => {
    const el = target();
    if (!el) return;
    const active = reveal > 0 && !!field;
    el.classList.toggle("word-cut", active);
    onActive?.(active);
    return () => {
      el.classList.remove("word-cut");
      onActive?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reveal, field]);

  // ---- melt ----
  useEffect(() => {
    if (!field || cap.reducedMotion || !cap.finePointer) return;
    const el = target();
    if (!el) return;
    const enter = () => setMelt(1);
    const leave = () => setMelt(0);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field, cap.reducedMotion, cap.finePointer]);

  if (!field) return null;

  return (
    <Stage
      // Orthographic on purpose. The word's identity is a set of measured
      // ratios, and a perspective camera renders a letter nearer the lens
      // wider — which destroys the one constant that IS the signature.
      orthographic
      // If the scene goes away — context loss, or a shader that will not build
      // — the cut closes and the flat ink returns. The word is never left invisible.
      onSceneLost={() => setReveal(0)}
      className="pointer-events-none absolute inset-0 z-0"
      // There is no fallback markup: the flat word IS the fallback, and it is
      // already on the page underneath this.
      fallback={null}
    >
      <CutSheet
        field={field}
        reveal={reveal}
        melt={melt}
        depth={26 + scrolled * 100}
        reduced={cap.reducedMotion}
      />
      {/* The room behind the sheet has air in it. Same dust the whole dark
          run breathes — the first glimpse of the space the site happens in. */}
      <CutDust field={field} reveal={reveal} reduced={cap.reducedMotion} />
    </Stage>
  );
}
