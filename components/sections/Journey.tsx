"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { Reveal, EASE } from "@/components/ui/motion-primitives";
import TiltCard from "@/components/ui/TiltCard";
import { journey } from "@/lib/journey";

/**
 * Journey — travelled sideways.
 *
 * The one section where order is real, so the one that reads as a road:
 * the stages stand left to right, each with its own image, and on desktop
 * the section pins while vertical scroll drives the row past the camera.
 * The stage you are on is named twice — a turning counter in the header and
 * a ghost period word behind the cards — so you always know where on the
 * road you are.
 *
 * On touch, small screens and under reduced motion there is no pinning at
 * all: the same row is a native snap carousel, swiped by hand. Identical
 * cards, different engine.
 */

const n = journey.length;

/** The turning counter: the active number rolls in from below. */
function Counter({ active }: { active: number }) {
  return (
    <p className="meta flex items-baseline gap-1.5 text-text-muted">
      <span className="relative block h-[1.4em] w-[2ch] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={active}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute inset-0 text-primary"
          >
            {String(active + 1).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </span>
      / {String(n).padStart(2, "0")}
    </p>
  );
}

function StageCard({ entry, index }: { entry: (typeof journey)[number]; index: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.li
      initial={reduced ? undefined : { opacity: 0, x: 70 }}
      whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "0px -60px 0px 0px" }}
      transition={{ duration: 0.9, ease: EASE }}
      className="w-[80vw] shrink-0 snap-start sm:w-[440px] lg:w-[480px]"
    >
      <TiltCard tilt={3} className="group h-full">
        <article className="plate h-full p-2.5 transition-colors duration-300 group-hover:border-primary">
          <div className="relative aspect-[16/10] overflow-hidden">
            <motion.div
              initial={reduced ? undefined : { clipPath: "inset(0% 100% 0% 0%)" }}
              whileInView={reduced ? undefined : { clipPath: "inset(0% 0% 0% 0%)" }}
              viewport={{ once: true, margin: "0px -40px 0px 0px" }}
              transition={{ duration: 1.0, delay: 0.15, ease: EASE }}
              className="absolute inset-0"
            >
              <Image
                src={entry.image}
                alt=""
                fill
                sizes="(max-width: 640px) 80vw, 480px"
                className="media-hover object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
            </motion.div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="meta text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="meta text-text-muted">{entry.period}</span>
              <span className="meta text-text-muted opacity-60">
                {entry.discipline}
              </span>
            </div>

            <h3 className="text-editorial mt-3 text-xl font-medium text-text-primary sm:text-2xl">
              {entry.title}
            </h3>

            <p className="mt-3 text-pretty text-sm leading-relaxed text-text-secondary">
              {entry.body}
            </p>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {entry.highlights.map((h) => (
                <li key={h} className="meta text-text-muted">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </TiltCard>
    </motion.li>
  );
}

export default function Journey() {
  const reduced = useReducedMotion();
  /* useScroll's target must exist in BOTH layouts or framer throws
     "target ref is defined but not hydrated" — the carousel attaches it to
     its own section, where the progress is simply never read. */
  const outer = useRef<HTMLElement | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  /* The server renders the carousel — it works everywhere with no JS. After
     mount, wide fine-pointer screens upgrade to the pinned road. */
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);
  const [range, setRange] = useState(0);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const decide = () => setPinned(wide.matches && !reduced);
    decide();
    wide.addEventListener("change", decide);
    return () => wide.removeEventListener("change", decide);
  }, [reduced]);

  // How far the row must travel: its full width minus the window it shows in.
  useEffect(() => {
    if (!pinned) return;
    const measure = () => {
      if (!track.current || !host.current) return;
      setRange(
        Math.max(0, track.current.scrollWidth - host.current.clientWidth)
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    if (host.current) ro.observe(host.current);
    return () => ro.disconnect();
  }, [pinned]);

  const { scrollYProgress } = useScroll({
    target: outer,
    offset: ["start start", "end end"],
  });
  /* The self-tracking form, not useTransform(value, fn): the two-argument
     form keeps its first transformer forever, so it would multiply by the
     range measured before layout — zero — for the life of the page. */
  const x = useTransform(() => -scrollYProgress.get() * range);
  const rail = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (pinned) setActive(Math.max(0, Math.min(n - 1, Math.round(v * (n - 1)))));
  });

  // In the carousel, the swipe position drives the same counter.
  const onCarouselScroll = () => {
    const el = host.current;
    if (!el || pinned) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return;
    setActive(
      Math.max(0, Math.min(n - 1, Math.round((el.scrollLeft / max) * (n - 1))))
    );
  };

  const header = (
    <div className="mx-auto w-full max-w-5xl px-6 sm:px-10">
      <Reveal>
        <p className="meta flex items-center gap-3 text-text-muted">
          <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
          04 — How it developed
        </p>
      </Reveal>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <Reveal delay={0.06}>
          <h2 className="text-display text-[clamp(1.9rem,5.2vw,3.6rem)] text-text-primary">
            The <span className="text-primary">journey</span>
          </h2>
        </Reveal>
        <Counter active={active} />
      </div>

      <div className="relative mt-6 h-px w-full bg-line">
        <motion.div
          style={{ scaleX: pinned ? rail : (active + 1) / n }}
          className="absolute inset-0 origin-left bg-primary"
        />
      </div>
    </div>
  );

  const cards = journey.map((entry, i) => (
    <StageCard key={entry.title} entry={entry} index={i} />
  ));

  if (pinned) {
    return (
      <section
        id="journey"
        data-band="dark"
        className="relative scroll-mt-24 bg-ink"
      >
        <div
          ref={(el) => {
            outer.current = el;
          }}
          className="relative"
          style={{ height: `${(n - 1) * 85 + 100}svh` }}
        >
          <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
            {/* The era under the wheels, felt rather than read. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={active}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="text-mega whitespace-nowrap text-panel/50"
                  style={{ fontSize: "min(30svh, 17vw)" }}
                >
                  {journey[active].period}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="relative">{header}</div>

            <div ref={host} className="relative mt-10 w-full overflow-hidden">
              <motion.ul
                ref={track}
                style={{ x }}
                className="flex w-max gap-6 px-6 sm:px-10"
              >
                {cards}
              </motion.ul>
            </div>

            <motion.p
              aria-hidden="true"
              style={{ opacity: hintOpacity }}
              className="meta absolute bottom-8 right-6 text-text-muted sm:right-10"
            >
              Scroll — the road runs right
            </motion.p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="journey"
      ref={(el) => {
        outer.current = el;
      }}
      data-band="dark"
      className="scroll-mt-24 bg-ink py-24 sm:py-28"
    >
      {header}

      <div
        ref={host}
        onScroll={onCarouselScroll}
        className="mt-10 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex w-max gap-6 px-6 sm:px-10">{cards}</ul>
      </div>

      <p className="meta mt-8 px-6 text-text-muted sm:px-10">
        Swipe — the road runs right
      </p>
    </section>
  );
}
