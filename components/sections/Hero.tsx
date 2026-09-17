"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
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
import { MEASURE } from "@/components/ui/Section";
import { projects, coverFor, statusCopy } from "@/lib/projects";
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
   hangs off the end of that. Change the letter stagger and the whole
   sequence still holds its shape.
   ------------------------------------------------------------------ */
const OPEN = { meta: 0.05, headline: 0.18, letter: 0.042 } as const;

const LINE_TWO_AT = OPEN.headline + LINE_ONE.length * OPEN.letter + 0.14;
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

  const spring = { stiffness: 55, damping: 20, mass: 0.7 };
  return { px: useSpring(x, spring), py: useSpring(y, spring) };
}

/* ---------- backdrop ----------------------------------------------- */

/**
 * The depth behind the type: a tonal wash and a fine survey grid, inked
 * through CSS variables so both invert with the theme. Oversized by 25% on
 * every side — parallax translates it, and an exactly-sized layer would
 * slide its own edge into view. The overscan has to stay ahead of the travel
 * in `backdropY`.
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
            "radial-gradient(ellipse 60% 50% at 30% 32%, var(--grid-wash-accent), transparent 70%)," +
            "radial-gradient(ellipse 50% 46% at 78% 72%, var(--grid-wash-ink), transparent 68%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, var(--grid-line) 0 1px, transparent 1px 92px)," +
            "repeating-linear-gradient(to bottom, var(--grid-line-soft) 0 1px, transparent 1px 92px)",
        }}
      />
    </div>
  );
}

/* ---------- hero ---------------------------------------------------- */

/**
 * Hero — an asymmetric split rather than a wall of type over an empty field.
 *
 * Seven columns of introduction, five of the newest piece of work. The
 * featured card is the reason the right-hand side exists: a portfolio should
 * put a real project on screen before a visitor has scrolled once, and the
 * previous layout spent that space on nothing.
 *
 * Motion is two systems that never touch each other. ENTRY is time-driven —
 * the headline builds glyph by glyph and the tail staggers out behind it,
 * once, on mount. DEPARTURE is scroll-driven — as the band leaves, its
 * layers separate; the backdrop lags and swells, the type leads, the ticker
 * sinks.
 *
 * One `useScroll` feeds one spring and every layer is a `useTransform` off
 * it, so the whole parallax field costs a single scroll subscription and no
 * React renders. Only `transform` and `opacity` are ever animated, and every
 * layer collapses to a static element under reduced motion.
 */
export default function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const featured = projects[0];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const p = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.35,
  });

  const backdropY = useTransform(p, [0, 1], [0, 210]);
  const backdropScale = useTransform(p, [0, 1], [1, 1.16]);
  const contentY = useTransform(p, [0, 1], [0, -158]);
  const headlineY = useTransform(p, [0, 1], [0, -72]);

  // Deliberately the mildest layer: the ticker sits on the band's bottom
  // edge, so travel there is clipped by the section rather than read as
  // depth — pushed as hard as the rest it just vanishes, leaving a dead
  // strip of empty ground behind it.
  const marqueeY = useTransform(p, [0, 1], [0, 58]);

  const contentFade = useTransform(p, [0, 0.58], [1, 0]);
  const marqueeFade = useTransform(p, [0, 0.82], [1, 0]);

  // Faded-out is not gone: an opacity-0 link still takes clicks, tab focus
  // and screen-reader announcement, and these stay on screen for ~200px
  // after they finish fading.
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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {reduced ? (
          <Backdrop />
        ) : (
          <motion.div
            className="absolute inset-0"
            style={{ y: backdropY, scale: backdropScale }}
          >
            <motion.div className="absolute inset-0" style={{ x: driftX, y: driftY }}>
              <Backdrop />
            </motion.div>
          </motion.div>
        )}
      </div>

      <div className="relative flex flex-1 items-center pt-28 pb-16 sm:pt-32">
        <motion.div
          className={MEASURE}
          style={
            reduced
              ? undefined
              : { y: contentY, opacity: contentFade, visibility: departed }
          }
        >
          <div className="grid grid-cols-12 items-center gap-x-8 gap-y-12">
            {/* ---- introduction ---------------------------------- */}
            <div className="col-span-12 lg:col-span-7">
              <Beat at={OPEN.meta}>
                <p className="meta text-on-band-muted">
                  {site.name} — {site.location}
                </p>
              </Beat>

              <motion.div style={reduced ? undefined : { y: headlineY, x: typeDriftX }}>
                <h1 className="text-mega mt-6 text-[clamp(2.8rem,8.5vw,7rem)]">
                  <SplitText text={LINE_ONE} delay={OPEN.headline} stagger={OPEN.letter} />
                  <br />
                  <SplitText text={LINE_TWO} delay={LINE_TWO_AT} stagger={OPEN.letter} />
                </h1>
              </motion.div>

              <Tail>
                <TailItem>
                  <p className="mt-8 max-w-lg text-pretty text-lg leading-relaxed text-on-band-muted">
                    {site.tagline} I build web platforms, embedded electronics
                    and applied AI systems from {site.location}.
                  </p>
                </TailItem>

                <TailItem className="mt-10 flex flex-wrap items-center gap-4">
                  <Magnetic pull={8} contentPull={4} radius={90}>
                    <Link
                      href="#projects"
                      className="btn-depth group inline-flex items-center gap-2.5 rounded-pill bg-primary px-6 py-3.5 font-geometric text-sm font-medium text-on-primary"
                    >
                      See my work
                      <motion.span
                        aria-hidden="true"
                        animate={reduced ? undefined : { y: [0, 3, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex"
                      >
                        <ArrowDown size={15} />
                      </motion.span>
                    </Link>
                  </Magnetic>
                  <Magnetic pull={8} contentPull={4} radius={90}>
                    <Link
                      href="#contact"
                      className="btn-depth inline-flex items-center rounded-pill border border-line-strong bg-surface px-6 py-3.5 font-geometric text-sm font-medium text-on-band"
                    >
                      Get in touch
                    </Link>
                  </Magnetic>
                </TailItem>
              </Tail>
            </div>

            {/* ---- the newest piece of work ----------------------- */}
            <Beat at={TAIL_AT + TAIL_STEP} className="col-span-12 lg:col-span-5">
              <Link
                href={`/projects/${featured.slug}`}
                className="plate lift group block p-2.5"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-tile">
                  <Image
                    src={coverFor(featured.slug)}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                    className="media-hover object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="meta absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1.5 text-text-secondary backdrop-blur">
                    Latest
                  </span>
                </div>

                <div className="px-3 pb-2 pt-4">
                  <div className="flex items-center gap-x-4">
                    <span className="meta text-text-muted">{featured.year}</span>
                    <span className="meta flex items-center gap-2 text-text-secondary">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                      />
                      {statusCopy[featured.status]}
                    </span>
                  </div>

                  <h2 className="text-editorial mt-2.5 flex items-baseline justify-between gap-3 text-xl text-text-primary transition-colors group-hover:text-primary-strong">
                    {featured.name}
                    <ArrowUpRight
                      size={17}
                      aria-hidden="true"
                      className="shrink-0 text-text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </h2>

                  <p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-text-secondary">
                    {featured.summary}
                  </p>
                </div>
              </Link>
            </Beat>
          </div>
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
