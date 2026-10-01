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

const EASE = [0.4, 0, 0.2, 1] as const;

const TICKER = [
  "Software",
  "Hardware",
  "Applied AI",
  "Web platforms",
  "Embedded systems",
  "Kigali, Rwanda",
];

const LINE_ONE = "Software";
const LINE_TWO = "Engineer.";

/* ------------------------------------------------------------------
   The opening timeline. One set of beats rather than a hand-tuned delay on
   every element: the second headline line is placed relative to the first,
   and the tail hangs off the end of that. Change the letter stagger and the
   sequence still holds its shape.
   ------------------------------------------------------------------ */
const OPEN = { badge: 0.05, headline: 0.18, letter: 0.042 } as const;

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
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
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
      transition={{ duration: 0.5, delay: at, ease: EASE }}
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
 * Two soft colour fields and nothing else.
 *
 * What the hero needs from a backdrop is a suggestion that the white is lit
 * rather than blank, and two very wide washes do that without drawing a
 * single line. They are fainter than they were: under a light serif at 7rem,
 * anything you can actually see behind the type reads as dirt.
 */
function Backdrop() {
  return (
    <div
      className="absolute inset-[-25%]"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 52% 48% at 22% 26%, var(--grid-wash-accent), transparent 68%)," +
          "radial-gradient(ellipse 46% 44% at 84% 68%, var(--grid-wash-ink), transparent 66%)",
      }}
    />
  );
}

/* ---------- hero ---------------------------------------------------- */

/**
 * Hero — an asymmetric split, squared up.
 *
 * Seven columns of introduction and five of image, with the newest project
 * sitting across the foot of the panel. The previous version tilted both
 * plates a couple of degrees against each other and scattered three logo
 * chips around the edges; both belong to a product page. Here nothing
 * rotates and nothing floats — the composition is held by the grid and by
 * the rules drawn across it, which is what lets a light serif at this size
 * stay the loudest thing on screen.
 *
 * Motion is two systems that never touch. ENTRY is time-driven: the headline
 * builds glyph by glyph and the tail staggers behind it, once, on mount.
 * DEPARTURE is scroll-driven: as the band leaves, its layers separate.
 *
 * One `useScroll` feeds one spring and every layer is a `useTransform` off
 * it, so the whole parallax field costs a single scroll subscription and no
 * React renders. Only `transform` and `opacity` animate, and every layer
 * collapses to a static element under reduced motion.
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
  const artY = useTransform(p, [0, 1], [0, -40]);

  // Deliberately the mildest layer: the ticker sits on the band's bottom
  // edge, so travel there is clipped by the section rather than read as
  // depth — pushed as hard as the rest it just vanishes.
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
  const typeDriftX = useTransform(px, [-1, 1], [-6, 6]);
  const artDriftX = useTransform(px, [-1, 1], [10, -10]);
  const artDriftY = useTransform(py, [-1, 1], [8, -8]);

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

      <div className="relative flex flex-1 items-center pb-24 pt-32 sm:pt-40">
        <motion.div
          className={MEASURE}
          style={
            reduced
              ? undefined
              : { y: contentY, opacity: contentFade, visibility: departed }
          }
        >
          {/* One column until `lg`, twelve after. A twelve-track grid does
              not collapse on a phone just because every child spans all of
              it: the eleven 40px gaps are still laid out, so the grid's own
              minimum width is 440px — wider than the 342px a 390px screen
              actually has, and the whole band overflowed by a hundred
              pixels. The tracks only exist where they are used. */}
          <div className="grid grid-cols-1 items-center gap-y-24 lg:grid-cols-12 lg:gap-x-10">
            {/* ---- introduction ---------------------------------- */}
            <div className="lg:col-span-7">
              <Beat at={OPEN.badge}>
                {/* A rule with a label on it, not a pill. A floating capsule
                    is a notification; a hairline carrying the availability in
                    tracked capitals is a masthead. */}
                <p className="flex items-center gap-3 border-t border-line pt-5">
                  <span className="relative grid h-1.5 w-1.5 place-items-center">
                    {!reduced && (
                      <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-primary opacity-60" />
                    )}
                    <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <span className="meta text-text-secondary">
                    Open to new work — {site.location}
                  </span>
                </p>
              </Beat>

              <motion.div style={reduced ? undefined : { y: headlineY, x: typeDriftX }}>
                <h1 className="text-mega mt-10 text-[clamp(3.2rem,9.5vw,7.1rem)]">
                  <SplitText text={LINE_ONE} delay={OPEN.headline} stagger={OPEN.letter} />
                  <br />
                  {/* The second line is the italic clause the whole page is
                      built on — the same move every section heading makes,
                      established here first. */}
                  <SplitText
                    text={LINE_TWO}
                    delay={LINE_TWO_AT}
                    stagger={OPEN.letter}
                    letterClassName="text-clause"
                  />
                </h1>
              </motion.div>

              <Tail>
                <TailItem>
                  <p className="lead mt-10 max-w-[44ch] text-on-band-muted">
                    {site.tagline} I build web platforms, embedded electronics
                    and applied AI systems from {site.location}.
                  </p>
                </TailItem>

                <TailItem className="mt-12 flex flex-wrap items-center gap-4">
                  <Magnetic pull={6} contentPull={3} radius={90}>
                    <Link
                      href="#projects"
                      className="btn-depth label-ui group inline-flex items-center gap-3 rounded-pill bg-primary px-8 py-4 text-on-primary hover:bg-primary-strong"
                    >
                      See my work
                      <motion.span
                        aria-hidden="true"
                        animate={reduced ? undefined : { y: [0, 3, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex"
                      >
                        <ArrowDown size={14} />
                      </motion.span>
                    </Link>
                  </Magnetic>
                  <Magnetic pull={6} contentPull={3} radius={90}>
                    <Link
                      href="#contact"
                      className="btn-depth label-ui inline-flex items-center rounded-pill border border-line-strong bg-surface px-8 py-4 text-on-band hover:border-text-primary hover:text-text-primary"
                    >
                      Get in touch
                    </Link>
                  </Magnetic>
                </TailItem>
              </Tail>
            </div>

            {/* ---- the panel ------------------------------------- */}
            <Beat at={TAIL_AT} className="lg:col-span-5">
              <motion.div
                className="relative mx-auto max-w-sm lg:max-w-none"
                style={reduced ? undefined : { y: artY, x: artDriftX }}
              >
                <motion.div
                  style={reduced ? undefined : { y: artDriftY }}
                  className="relative aspect-4/5 overflow-hidden rounded-card border border-line-panel"
                >
                  <Image
                    src="/images/hero/primary.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 24rem, 36vw"
                    priority
                    className="object-cover"
                  />
                </motion.div>

                {/* The newest project, as a caption across the foot of the
                    panel. Squared to the panel's own edge rather than tilted
                    against it: the overlap is what reads as depth, and the
                    rotation was only ever noise on top of it. */}
                <Link
                  href={`/projects/${featured.slug}`}
                  className="plate lift group absolute -bottom-10 left-0 right-10 z-10 flex items-center gap-4 p-3"
                >
                  <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-tile sm:w-20">
                    <Image
                      src={coverFor(featured.slug)}
                      alt=""
                      fill
                      sizes="5rem"
                      className="media-hover object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="meta truncate text-text-muted">
                      {featured.year} · {statusCopy[featured.status]}
                    </p>
                    <p className="text-editorial mt-1 truncate text-xl text-text-primary transition-colors duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:text-text-primary">
                      {featured.name}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    aria-hidden="true"
                    className="mr-2 shrink-0 text-text-muted transition-all duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary"
                  />
                </Link>
              </motion.div>
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
            duration={48}
            className="border-t border-line py-5"
            itemClassName="meta text-on-band-muted"
          />
        </motion.div>
      </Beat>
    </section>
  );
}
