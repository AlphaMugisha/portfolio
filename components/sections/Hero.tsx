"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import SplitText from "@/components/ui/SplitText";
import Marquee from "@/components/ui/Marquee";
import Magnetic from "@/components/ui/Magnetic";
import { site } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

const TICKER = [
  "Software",
  "Hardware",
  "Applied AI",
  "Web platforms",
  "Embedded systems",
  "Kigali, Rwanda",
];

const LINE_ONE = "Software";
const LINE_TWO = "Engineer";

/* ------------------------------------------------------------------
   The opening timeline.

   One set of beats rather than a hand-tuned delay on every element. The
   second headline line is placed relative to the first — it starts once the
   first line has released all its glyphs plus a short breath — and the tail
   (paragraph, buttons, ticker) hangs off the end of that. Change the letter
   stagger and the whole sequence still holds its shape, which is the point:
   the numbers below are the only ones in the file.
   ------------------------------------------------------------------ */
const OPEN = {
  meta: 0.05,
  headline: 0.18,
  letter: 0.042,
} as const;

const LINE_TWO_AT = OPEN.headline + LINE_ONE.length * OPEN.letter + 0.14;
/** The tail overlaps the second line deliberately — waiting for the headline
    to fully settle reads as a stall, not as pacing. */
const TAIL_AT = LINE_TWO_AT + 0.2;
const TAIL_STEP = 0.12;
const MARQUEE_AT = TAIL_AT + TAIL_STEP * 2;

const TAIL = {
  hidden: {},
  shown: { transition: { delayChildren: TAIL_AT, staggerChildren: TAIL_STEP } },
};

const TAIL_ITEM = {
  hidden: { opacity: 0, y: 22 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};

/* ---------- orchestration helpers --------------------------------- */

/** Stagger parent for the tail. Variants propagate, so the children below
    carry no delays of their own. */
function Tail({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={TAIL} initial="hidden" animate="shown">
      {children}
    </motion.div>
  );
}

function TailItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={TAIL_ITEM}>
      {children}
    </motion.div>
  );
}

/** A single element on the opening timeline, outside the tail's stagger. */
function Beat({
  children,
  at,
  className,
}: {
  children: ReactNode;
  at: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, delay: at, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- pointer drift ------------------------------------------ */

/**
 * Pointer position as two springs in [-1, 1], relative to the viewport.
 *
 * Never attaches on a coarse pointer or under reduced motion — a touch
 * device would otherwise carry a listener that can never fire. The values
 * are MotionValues, so moving the pointer never re-renders the hero.
 */
function usePointerDrift(enabled: boolean) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      x.set((e.clientX / window.innerWidth - 0.5) * 2);
      y.set((e.clientY / window.innerHeight - 0.5) * 2);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, x, y]);

  // Slack springs: the backdrop should trail the pointer, not track it.
  const spring = { stiffness: 55, damping: 20, mass: 0.7 };
  return { px: useSpring(x, spring), py: useSpring(y, spring) };
}

/* ---------- backdrop ----------------------------------------------- */

/**
 * The depth behind the type: a tonal wash and a fine survey grid, both
 * inked from the band rather than from white so the porcelain never goes
 * milky. Oversized by 25% on every side — parallax translates it, and an
 * exactly-sized layer would slide its own edge into view. The overscan has
 * to stay ahead of the travel in `backdropY`, or the top edge surfaces at
 * the end of the scroll.
 */
function Backdrop() {
  return (
    <div
      className="absolute inset-[-25%]"
      style={{
        maskImage:
          "radial-gradient(ellipse 78% 68% at 50% 42%, #000 38%, transparent 76%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 78% 68% at 50% 42%, #000 38%, transparent 76%)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 30% 32%, rgba(14,19,25,0.07), transparent 70%)," +
            "radial-gradient(ellipse 50% 46% at 78% 72%, rgba(14,19,25,0.05), transparent 68%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, rgba(14,19,25,0.055) 0 1px, transparent 1px 92px)," +
            "repeating-linear-gradient(to bottom, rgba(14,19,25,0.042) 0 1px, transparent 1px 92px)",
        }}
      />
    </div>
  );
}

/* ---------- hero ---------------------------------------------------- */

/**
 * Hero — the porcelain band, opened with a per-letter rise and layered for
 * depth.
 *
 * Motion here is two systems that never touch each other:
 *
 *   ENTRY is time-driven — the headline builds glyph by glyph and the tail
 *   staggers out behind it, once, on mount.
 *
 *   DEPARTURE is scroll-driven — as the band leaves, its layers separate.
 *   The backdrop lags and swells, the type leads, the ticker sinks. Nothing
 *   here is a second entrance; it is the same composition coming apart.
 *
 * One `useScroll` feeds one spring, and every layer is a `useTransform` off
 * that spring. So the whole parallax field costs a single scroll
 * subscription and zero React renders — the values are written straight to
 * the compositor. Only `transform` and `opacity` are ever animated.
 *
 * The band still carries dark type only (the cyan is invisible on porcelain
 * at 1.06:1), and every layer collapses to a static element under reduced
 * motion.
 */
export default function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // 0 while the band fills the viewport, 1 once it has fully left the top.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // The single smoothed source. Springing here rather than per-layer keeps
  // fast scrolling fluid without paying for six springs.
  const p = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.35,
  });

  // Layers, back to front. Positive y lags behind the scroll and reads as
  // depth; negative y leads it and reads as foreground.
  const backdropY = useTransform(p, [0, 1], [0, 210]);
  const backdropScale = useTransform(p, [0, 1], [1, 1.16]);
  const contentY = useTransform(p, [0, 1], [0, -158]);
  const headlineY = useTransform(p, [0, 1], [0, -72]);
  // Deliberately the mildest layer. The ticker sits on the band's bottom
  // edge, so travel here is clipped away by the section rather than read as
  // depth — push it as hard as the rest and it just vanishes, leaving a
  // dead strip of empty porcelain behind it.
  const marqueeY = useTransform(p, [0, 1], [0, 58]);

  // The band clears out well before it has finished leaving. The header is
  // fixed, so anything still lit as it passes underneath ghosts across the
  // nav; finishing the fade early keeps that overlap to a moment.
  const contentFade = useTransform(p, [0, 0.58], [1, 0]);
  const marqueeFade = useTransform(p, [0, 0.82], [1, 0]);

  // Faded-out is not gone: an opacity-0 button still takes clicks, still
  // takes tab focus, and is still announced. Flipping visibility at the end
  // of the fade retires the whole block from all three at once, and scroll
  // position restores it — so tabbing back to the top brings the links back.
  const departed = useTransform(p, (v) => (v >= 0.58 ? "hidden" : "visible"));
  const marqueeGone = useTransform(p, (v) => (v >= 0.82 ? "hidden" : "visible"));

  const { px, py } = usePointerDrift(!reduced);
  const driftX = useTransform(px, [-1, 1], [30, -30]);
  const driftY = useTransform(py, [-1, 1], [22, -22]);
  const typeDriftX = useTransform(px, [-1, 1], [-9, 9]);

  return (
    <section
      ref={ref}
      id="hero"
      data-band="light"
      className="relative flex min-h-svh flex-col overflow-hidden bg-band-light text-on-band"
    >
      {/* Depth. Scroll parallax on the outer layer, pointer drift on the
          inner one — nesting composes the two transforms without having to
          sum MotionValues by hand. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {reduced ? (
          <Backdrop />
        ) : (
          <motion.div
            className="absolute inset-0"
            style={{ y: backdropY, scale: backdropScale }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ x: driftX, y: driftY }}
            >
              <Backdrop />
            </motion.div>
          </motion.div>
        )}
      </div>

      <div className="relative flex flex-1 items-center pt-32 pb-16 sm:pt-40">
        <motion.div
          className="mx-auto w-full max-w-5xl px-6 sm:px-10"
          style={
            reduced
              ? undefined
              : { y: contentY, opacity: contentFade, visibility: departed }
          }
        >
          <Beat at={OPEN.meta}>
            <p className="meta text-on-band-muted">
              {site.name} — {site.location}
            </p>
          </Beat>

          {/* The headline leads the rest of the content out and leans a few
              pixels against the pointer — enough to sit in front of the grid,
              not enough to notice as an effect. */}
          <motion.div
            style={reduced ? undefined : { y: headlineY, x: typeDriftX }}
          >
            <h1 className="text-mega mt-6 text-[clamp(3rem,12vw,9rem)]">
              <SplitText
                text={LINE_ONE}
                delay={OPEN.headline}
                stagger={OPEN.letter}
              />
              <br />
              <SplitText
                text={LINE_TWO}
                delay={LINE_TWO_AT}
                stagger={OPEN.letter}
              />
            </h1>
          </motion.div>

          <Tail>
            <TailItem>
              <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-on-band-muted">
                {site.tagline} I build web platforms, embedded electronics and
                applied AI systems from {site.location}.
              </p>
            </TailItem>

            <TailItem className="mt-10 flex flex-wrap items-center gap-4">
              <Magnetic pull={8} contentPull={4} radius={90}>
                <Link
                  href="#projects"
                  className="btn-depth group inline-flex items-center gap-2.5 rounded-sm bg-on-band px-6 py-3.5 text-sm font-medium text-band-light"
                >
                  See my work
                  <motion.span
                    aria-hidden="true"
                    animate={reduced ? undefined : { y: [0, 3, 0] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="inline-flex"
                  >
                    <ArrowDown size={15} />
                  </motion.span>
                </Link>
              </Magnetic>
              <Magnetic pull={8} contentPull={4} radius={90}>
                <Link
                  href="#contact"
                  className="btn-depth inline-flex items-center rounded-sm border border-line-band px-6 py-3.5 text-sm font-medium text-on-band"
                >
                  Get in touch
                </Link>
              </Magnetic>
            </TailItem>
          </Tail>
        </motion.div>
      </div>

      <Beat at={MARQUEE_AT} className="relative">
        <motion.div
          style={
            reduced
              ? undefined
              : { y: marqueeY, opacity: marqueeFade, visibility: marqueeGone }
          }
        >
          <Marquee
            items={TICKER}
            duration={34}
            className="border-t border-line-band py-4"
            itemClassName="meta text-on-band-muted"
          />
        </motion.div>
      </Beat>
    </section>
  );
}
