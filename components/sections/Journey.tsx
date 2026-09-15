"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { Reveal } from "@/components/ui/motion-primitives";
import RotatingSeal from "@/components/ui/RotatingSeal";
import { useCapability } from "@/components/ui/useCapability";
import { pointerX, pointerY } from "@/lib/pointer";
import { journey } from "@/lib/journey";

/**
 * Journey — travelled, not read.
 *
 * The one section where order is real, so the one where scroll becomes
 * literal travel: the milestones stand along a path receding into the room,
 * and scrolling dollies the camera forward through them. Each stage of the
 * progression is a place you arrive at — it resolves out of the depth ahead,
 * holds the focal plane while you read it, then slips past the camera as the
 * next one comes up. The path is CSS perspective, no canvas: four floating
 * plates and a translateZ on their track, which is why it costs nothing and
 * runs everywhere, phones included.
 *
 * Under reduced motion the dolly would be exactly the kind of motion being
 * declined, so the section falls back to its original flat form: the rail,
 * the markers, the numbered entries. Same words, still page.
 */

const STEP = 760;
const VH_PER_STOP = 85;

/** Clamp a ramp to the [0,1] progress window. Scroll progress can be driven
    as a native (WAAPI) animation, and its keyframe offsets must be a
    non-decreasing sequence inside [0,1] — breakpoints hung off the first and
    last milestones land outside that. Evaluate the ramp at each window edge
    and keep only the interior stops, so the curve is unchanged where it is
    reachable and well-formed everywhere. */
function windowRamp(p: number[], v: number[]) {
  const valueAt = (t: number) => {
    if (t <= p[0]) return v[0];
    for (let k = 1; k < p.length; k++) {
      if (t <= p[k]) {
        const f = (t - p[k - 1]) / (p[k] - p[k - 1]);
        return v[k - 1] + f * (v[k] - v[k - 1]);
      }
    }
    return v[v.length - 1];
  };
  const P: number[] = [0];
  const V: number[] = [valueAt(0)];
  for (let k = 0; k < p.length; k++) {
    if (p[k] > 0 && p[k] < 1) {
      P.push(p[k]);
      V.push(v[k]);
    }
  }
  P.push(1);
  V.push(valueAt(1));
  return { p: P, v: V };
}

/** Per-milestone keyframes in track-progress space. The milestone is at the
    camera plane at p = i/(n-1); the ramps are hung off that moment. */
function ramps(i: number, n: number) {
  const span = 1 / Math.max(1, n - 1);
  const at = (d: number) => (i + d) * span; // d in STEP units, + = ahead
  const p = [at(-2.3), at(-1.15), at(0), at(0.34)];
  return {
    // Resolves out of the deep, fully present on arrival, gone once passed.
    opacity: windowRamp(p, [0, 0.5, 1, 0]),
    blur: windowRamp(p, [7, 3, 0, 5]),
  };
}

function Milestone({
  entry,
  index,
  count,
  progress,
  withBlur,
}: {
  entry: (typeof journey)[number];
  index: number;
  count: number;
  progress: MotionValue<number>;
  withBlur: boolean;
}) {
  const r = ramps(index, count);
  const opacity = useTransform(progress, r.opacity.p, r.opacity.v);
  const blur = useTransform(progress, r.blur.p, r.blur.v);
  const filter = useTransform(blur, (b) =>
    b < 0.08 ? "none" : `blur(${b.toFixed(2)}px)`
  );

  // The same weave as the rack and the constellations: stops alternate off
  // the centre line, so the dolly is always turning slightly.
  const lateral = index % 2 ? "9vw" : "-9vw";
  const rise = index % 2 ? "-3svh" : "2svh";

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={
        withBlur
          ? { z: -index * STEP, opacity, filter }
          : { z: -index * STEP, opacity }
      }
    >
      <div style={{ transform: `translate(${lateral}, ${rise})` }}>
        <article className="plate elevate-high relative max-w-xl p-7 sm:p-9">
          {/* The post that grounds the plate on the path. */}
          <span
            aria-hidden="true"
            className="absolute -bottom-14 left-10 h-14 w-px bg-line-strong"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-14 left-10 h-1.5 w-1.5 -translate-x-[2.5px] translate-y-1 rounded-full bg-primary"
          />

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="meta text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="meta text-text-muted">{entry.period}</span>
            <span className="meta text-text-muted opacity-50">
              {entry.discipline}
            </span>
          </div>

          <h3 className="text-editorial mt-4 text-[clamp(1.4rem,3vw,2.3rem)] font-medium text-text-primary">
            {entry.title}
          </h3>

          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-text-secondary">
            {entry.body}
          </p>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {entry.highlights.map((h) => (
              <li key={h} className="meta text-text-muted">
                {h}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </motion.div>
  );
}

export default function Journey() {
  const reduced = useReducedMotion();
  if (reduced) return <FlatJourney />;
  return <JourneyPath />;
}

function JourneyPath() {
  const ref = useRef<HTMLDivElement>(null);
  const cap = useCapability();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const n = journey.length;
  const trackZ = useTransform(scrollYProgress, [0, 1], [0, (n - 1) * STEP]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    setActive(Math.max(0, Math.min(n - 1, Math.round(p * (n - 1)))));
  });

  // The focus pull is reserved for machines that can afford per-frame blur.
  const withBlur = cap.ready && cap.tier === "high" && cap.finePointer;

  // The path answers the pointer with the same one-degree lean as every
  // other stage on the site — the camera grammar, kept.
  const spring = { stiffness: 46, damping: 16, mass: 0.6 };
  const leanX = useSpring(useTransform(pointerY, [-1, 1], [1.2, -1.2]), spring);
  const leanY = useSpring(useTransform(pointerX, [-1, 1], [-1.2, 1.2]), spring);
  const lean = cap.ready && cap.finePointer;

  return (
    <section id="journey" data-band="dark" className="relative scroll-mt-24 bg-ink">
      <div
        ref={ref}
        className="relative"
        style={{ height: `${n * VH_PER_STOP}svh` }}
      >
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* The stage of the travel. Perspective lives here so the track's
              translateZ reads as the camera moving, not the page scaling. */}
          <div
            className="absolute inset-0"
            style={{ perspective: "1100px", perspectiveOrigin: "50% 46%" }}
          >
            {/* Which era the camera is in, felt rather than read. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
            >
              <span
                className="text-mega whitespace-nowrap text-panel/60"
                style={{
                  fontSize: "min(26svh, 16vw)",
                  lineHeight: 0.86,
                  transform: "scaleX(1.726)",
                }}
              >
                {journey[active].period}
              </span>
            </div>

            <motion.div
              className="absolute inset-0 z-10"
              style={
                lean
                  ? {
                      z: trackZ,
                      rotateX: leanX,
                      rotateY: leanY,
                      transformStyle: "preserve-3d",
                    }
                  : { z: trackZ, transformStyle: "preserve-3d" }
              }
            >
              {journey.map((entry, i) => (
                <Milestone
                  key={entry.title}
                  entry={entry}
                  index={i}
                  count={n}
                  progress={scrollYProgress}
                  withBlur={withBlur}
                />
              ))}
            </motion.div>
          </div>

          {/* ---- The chrome. Flat against the lens, like the rack's. ---- */}
          <div className="pointer-events-none absolute left-6 top-24 z-20 sm:left-10 sm:top-28">
            <Reveal>
              <p className="meta flex items-center gap-3 text-text-muted">
                <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
                03 — How it developed
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="text-mega mt-5 text-[clamp(2rem,5vw,3.6rem)] leading-[0.86] text-text-primary">
                The
                <br />
                <span className="text-primary">Journey</span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-6 max-w-xs text-pretty text-sm leading-relaxed text-text-secondary">
                A progression from physical systems to software platforms —
                each stage built on the constraints learned in the one before
                it.
              </p>
            </Reveal>
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-x-6 bottom-8 z-20 flex items-center gap-1.5 sm:inset-x-10"
          >
            {journey.map((entry, i) => (
              <span
                key={entry.title}
                className={`h-px flex-1 transition-colors duration-500 ${
                  i <= active ? "bg-primary" : "bg-line-strong"
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-14 right-6 z-20 sm:bottom-16 sm:right-10">
            <RotatingSeal
              tone="dark"
              text="Scroll the path"
              className="h-[76px] w-[76px] sm:h-[100px] sm:w-[100px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   The flat form — reduced motion's version of the same story.
   ================================================================ */

function FlatJourney() {
  return (
    <section
      id="journey"
      data-band="dark"
      className="relative scroll-mt-24 overflow-hidden bg-ink px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-[1600px]">
        <p className="meta flex items-center gap-3 text-text-muted">
          <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
          03 — How it developed
        </p>

        <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 xl:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-mega text-[clamp(2.6rem,7.5vw,6rem)] leading-[0.86] text-text-primary">
              The
              <br />
              <span className="text-primary">Journey</span>
            </h2>

            <p className="mt-8 max-w-md text-pretty leading-relaxed text-text-secondary">
              A progression from physical systems to software platforms — each
              stage built on the constraints learned in the one before it, and
              none of it abandoned along the way.
            </p>
          </div>

          <div className="relative">
            {/* Rail */}
            <div
              aria-hidden="true"
              className="absolute left-[6px] top-2 h-[calc(100%-3rem)] w-px bg-line"
            >
              <div className="h-full w-full origin-top bg-gradient-to-b from-primary to-accent" />
            </div>

            <ol>
              {journey.map((entry, i) => (
                <li
                  key={entry.title}
                  className="relative pb-14 pl-10 last:pb-0 sm:pl-14"
                >
                  {/* Marker */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full border border-line-strong bg-ink"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>

                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="meta text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="meta text-text-muted">{entry.period}</span>
                    <span className="meta text-text-muted opacity-50">
                      {entry.discipline}
                    </span>
                  </div>

                  <h3 className="text-editorial mt-4 text-[clamp(1.4rem,3vw,2.3rem)] font-medium text-text-primary">
                    {entry.title}
                  </h3>

                  <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-text-secondary">
                    {entry.body}
                  </p>

                  <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                    {entry.highlights.map((h) => (
                      <li key={h} className="meta text-text-muted">
                        {h}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
