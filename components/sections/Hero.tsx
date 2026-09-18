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
import TechIcon from "@/components/ui/TechIcon";
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
const LINE_TWO = "Engineer.";

/** Marks floating beside the composition — the stack, at a glance. */
const FLOATERS = [
  { name: "React", className: "-left-5 top-[18%]", delay: 0 },
  { name: "ESP32", className: "-right-4 top-[8%]", delay: 0.8 },
  { name: "PostgreSQL", className: "-right-6 bottom-[26%]", delay: 1.6 },
] as const;

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
 * Two soft colour fields and nothing else.
 *
 * There was a survey grid here. On a white page it read as graph paper —
 * a texture the rest of the site never repeats, competing with the type it
 * was supposed to sit behind. What the hero actually needs from a backdrop
 * is a suggestion that the white is lit rather than blank, and two very wide
 * washes do that without drawing a single line.
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

/* ---------- floating mark ------------------------------------------ */

/** A logo on a small card, drifting. Decorative; the stack is listed for
    real in Expertise, so these are hidden from assistive technology. */
function Floater({
  name,
  className,
  delay,
}: {
  name: string;
  className: string;
  delay: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={`absolute z-20 grid h-14 w-14 place-items-center rounded-tile border border-line bg-surface shadow-[var(--shadow-card)] ${className}`}
      animate={reduced ? undefined : { y: [0, -9, 0] }}
      transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <TechIcon name={name} size={24} />
    </motion.div>
  );
}

/* ---------- hero ---------------------------------------------------- */

/**
 * Hero — an asymmetric split with a layered composition.
 *
 * Seven columns of introduction, five of a stack: an abstract panel, the
 * newest project overlapping its corner, and three marks from the toolkit
 * drifting around the edges. The tilts are small and opposed — the panel
 * leans one way, the card the other — which is what makes two rectangles
 * read as a pile rather than a mistake.
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
  const typeDriftX = useTransform(px, [-1, 1], [-9, 9]);
  const artDriftX = useTransform(px, [-1, 1], [14, -14]);
  const artDriftY = useTransform(py, [-1, 1], [10, -10]);

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
          <div className="grid grid-cols-12 items-center gap-x-8 gap-y-16">
            {/* ---- introduction ---------------------------------- */}
            <div className="col-span-12 lg:col-span-7">
              <Beat at={OPEN.badge}>
                <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface py-2 pl-3 pr-4 shadow-[var(--shadow-card)]">
                  <span className="relative grid h-2 w-2 place-items-center">
                    {!reduced && (
                      <span className="absolute h-2 w-2 animate-ping rounded-full bg-primary opacity-60" />
                    )}
                    <span className="relative h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="meta text-text-secondary">
                    Open to new work — {site.location}
                  </span>
                </p>
              </Beat>

              <motion.div style={reduced ? undefined : { y: headlineY, x: typeDriftX }}>
                <h1 className="text-mega mt-7 text-[clamp(2.9rem,8vw,6.5rem)]">
                  <SplitText text={LINE_ONE} delay={OPEN.headline} stagger={OPEN.letter} />
                  <br />
                  <SplitText
                    text={LINE_TWO}
                    delay={LINE_TWO_AT}
                    stagger={OPEN.letter}
                    letterClassName="text-primary"
                  />
                </h1>
              </motion.div>

              <Tail>
                <TailItem>
                  <p className="mt-7 max-w-lg text-pretty text-lg leading-relaxed text-on-band-muted">
                    {site.tagline} I build web platforms, embedded electronics
                    and applied AI systems from {site.location}.
                  </p>
                </TailItem>

                <TailItem className="mt-9 flex flex-wrap items-center gap-4">
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

            {/* ---- the pile -------------------------------------- */}
            <Beat at={TAIL_AT} className="col-span-12 lg:col-span-5">
              <motion.div
                className="relative mx-auto max-w-sm lg:max-w-none"
                style={reduced ? undefined : { y: artY, x: artDriftX }}
              >
                {/* The panel, leaning one way. */}
                <motion.div
                  style={reduced ? undefined : { y: artDriftY }}
                  className="plate overflow-hidden p-2.5 lg:-rotate-2"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-tile">
                    <Image
                      src="/images/hero/primary.jpg"
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 24rem, 36vw"
                      priority
                      className="object-cover"
                    />
                  </div>
                </motion.div>

                {/* The newest project, leaning the other — which is what
                    makes two rectangles read as a pile and not a mistake. */}
                <Link
                  href={`/projects/${featured.slug}`}
                  className="plate lift group absolute -bottom-8 -left-4 z-10 w-[72%] p-2 lg:rotate-[2.5deg]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[11px]">
                    <Image
                      src={coverFor(featured.slug)}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 18rem, 26vw"
                      className="media-hover object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
                    <div className="min-w-0">
                      <p className="meta truncate text-text-muted">
                        {featured.year} · {statusCopy[featured.status]}
                      </p>
                      <p className="truncate font-geometric text-sm font-medium text-text-primary transition-colors group-hover:text-primary-strong">
                        {featured.name}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 text-text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </div>
                </Link>

                {FLOATERS.map((f) => (
                  <Floater key={f.name} {...f} />
                ))}
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
            duration={34}
            className="border-t border-line py-4"
            itemClassName="meta text-on-band-muted"
          />
        </motion.div>
      </Beat>
    </section>
  );
}
