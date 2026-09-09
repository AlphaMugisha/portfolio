"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Liquid display type.
 *
 * The reference's signature move: the giant headline melts and ripples while
 * the pointer is over it, then settles back to crisp. It is an SVG filter —
 * fractal noise driving a displacement map — applied to live HTML text, so
 * the word stays selectable, searchable and readable to a screen reader.
 *
 * Four things about the reference's melt, each of which is a decision here:
 *
 *  1. It FLOWS, it does not boil. Frames 33ms apart keep the same ribbon
 *     structure, displaced slightly — one coherent noise field being moved.
 *     So the seed is FIXED and the field is dragged across the word with an
 *     feOffset instead. Stepping the seed per frame, the obvious approach,
 *     generates an uncorrelated lattice every frame and reads as TV static.
 *  2. The features are tall ribbons, not wide bands — noise coherence is long
 *     in Y and short in X, so the X frequency is the HIGHER of the two.
 *  3. The amplitude is about one stroke width: enough to sever the arm of an
 *     E. That only holds at one type size, so it is derived from the measured
 *     font size rather than hard-coded, and stays proportional as the clamp
 *     shrinks the word.
 *  4. The settle is time-based, not per-frame, so a 120Hz display does not
 *     halve the duration.
 *
 * The rAF loop only runs while there is something to animate, and the filter
 * is detached entirely once the word is crisp again — an identity filter
 * still forces the giant word through the raster pipeline for the whole
 * session.
 *
 * Guards: never engages on coarse pointers (nothing hovers on a phone) or
 * under prefers-reduced-motion. In both cases the text renders unfiltered.
 */

/** Time constants for the melt easing, in seconds. Out is a touch faster. */
const TAU_IN = 0.15;
const TAU_OUT = 0.11;

/** Anton's cap height as a fraction of its em, measured in the browser
    (canvas actualBoundingBoxAscent on a flat-topped cap). Used to size the
    noise, so an assumed value would put every wavelength out by its error. */
const CAP_RATIO = 0.86;

export default function LiquidText({
  children,
  className = "",
  /** Peak displacement as a fraction of the rendered font size. */
  intensity = 0.24,
  /** Dominant noise wavelength as a fraction of cap height. */
  wavelength = 0.5,
  /** How much narrower the features are across than down. */
  anisotropy = 2.2,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  wavelength?: number;
  anisotropy?: number;
}) {
  const rawId = useId();
  const filterId = `liquid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const [enabled, setEnabled] = useState(false);
  // Font size drives amplitude and wavelength, so it is state: a resize has
  // to re-render the filter primitives with new values.
  const [fontSize, setFontSize] = useState(0);

  const hostRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<SVGFEOffsetElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  // Kept in refs, not state: these change every frame and must never
  // re-render the giant headline.
  const target = useRef(0);
  const current = useRef(0);
  const frame = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
  }, []);

  // Measure the rendered type. The clamp means this changes with the
  // viewport, and every filter value below is derived from it.
  useEffect(() => {
    if (!enabled) return;
    const host = hostRef.current;
    if (!host) return;

    const measure = () => {
      // NOT querySelector("*"): the <svg> holding the filter is rendered
      // before {children}, so as soon as a first measurement makes it appear,
      // "*" starts matching the SVG instead of the headline — and an SVG only
      // inherits font-size, so every later measurement would report 16px and
      // the amplitude would collapse on the first resize.
      const child = host.querySelector<HTMLElement>("[data-liquid-target]");
      if (!child) return;
      const size = parseFloat(getComputedStyle(child).fontSize);
      if (Number.isFinite(size) && size > 0) setFontSize(size);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, [enabled]);

  const capHeight = fontSize * CAP_RATIO;
  const scale = fontSize * intensity;
  // Wavelength is expressed in px; feTurbulence wants its reciprocal.
  const freqY = capHeight > 0 ? 1 / (capHeight * wavelength) : 0.008;
  const freqX = freqY * anisotropy;
  /** How far the field is dragged. Sized to the type so the flow reads the
      same at any viewport width, and kept well inside the filter region's
      bleed below — offset far enough and feTurbulence's own clipped edge gets
      dragged into the sampled area, where transparent decodes as a hard
      -scale/2 shove and prints a seam across the word. */
  const drift = capHeight * 0.2;

  useEffect(() => {
    if (!enabled || !fontSize) return;
    const host = hostRef.current;
    if (!host) return;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime.current) / 1000, 0.05);
      lastTime.current = now;

      // Ease toward the target in real time, so entering and leaving the word
      // both read as the ink settling regardless of refresh rate.
      const tau = target.current > current.current ? TAU_IN : TAU_OUT;
      current.current += (target.current - current.current) * (1 - Math.exp(-dt / tau));

      const disp = dispRef.current;
      const off = offsetRef.current;

      if (disp) disp.setAttribute("scale", current.current.toFixed(2));

      // Drag the (fixed-seed) noise field across the word on two different
      // periods, so the ribbons slide and the motion never visibly loops.
      if (off) {
        const t = now / 1000;
        off.setAttribute("dx", (Math.sin(t / 0.573) * drift).toFixed(1));
        off.setAttribute("dy", (Math.cos(t / 0.78) * drift).toFixed(1));
      }

      // Settled and crisp — detach the filter and stop burning frames.
      if (target.current === 0 && current.current < 0.15) {
        current.current = 0;
        if (disp) disp.setAttribute("scale", "0");
        host.style.filter = "";
        frame.current = 0;
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame.current) return;
      host.style.filter = `url(#${filterId})`;
      lastTime.current = performance.now();
      frame.current = requestAnimationFrame(tick);
    };

    const onEnter = () => {
      target.current = scale;
      start();
    };
    const onLeave = () => {
      target.current = 0;
      start();
    };

    // Bind to the type, not the host: the host is a full-width block, so
    // hovering the empty margin beside the word would melt it. The target
    // carries the scaleX and hit testing uses transformed geometry, so its box
    // is exactly the word as painted.
    const hit = host.querySelector<HTMLElement>("[data-liquid-target]") ?? host;
    hit.addEventListener("pointerenter", onEnter);
    hit.addEventListener("pointerleave", onLeave);

    return () => {
      hit.removeEventListener("pointerenter", onEnter);
      hit.removeEventListener("pointerleave", onLeave);
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
      host.style.filter = "";
    };
  }, [enabled, fontSize, scale, drift, filterId]);

  return (
    <div ref={hostRef} className={className}>
      {enabled && fontSize > 0 && (
        <svg
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute h-0 w-0"
        >
          <defs>
            {/* sRGB, not the linearRGB default: near-black type converted to
                linear and back lightens its antialiased edges and leaves a
                halo the reference does not have — and it would apply even at
                scale 0, so the resting word would be affected too. */}
            {/* Bleed has to exceed drift + peak displacement on both axes.
                Vertical gets much more of it than horizontal because the box
                is wide and short, so the same percentage buys far fewer
                pixels down than across. */}
            <filter
              id={filterId}
              x="-15%"
              y="-60%"
              width="130%"
              height="220%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency={`${freqX.toFixed(5)} ${freqY.toFixed(5)}`}
                /* Three octaves gives f, 2f, 4f — the big syrupy lobe plus the
                   fine crenellation that bites into the stroke edges. */
                numOctaves={3}
                seed={7}
                result="noise"
              />
              <feOffset ref={offsetRef} in="noise" dx="0" dy="0" result="drift" />
              <feDisplacementMap
                ref={dispRef}
                in="SourceGraphic"
                in2="drift"
                scale={0}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}
      {children}
    </div>
  );
}
