"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";

import GooText from "@/components/ui/GooText";
import Marquee from "@/components/ui/Marquee";
import RotatingSeal from "@/components/ui/RotatingSeal";
import WorkStatement from "@/components/sections/WorkStatement";
import { projects, statusCopy, coverFor, type Project } from "@/lib/projects";
import { skillGroups } from "@/lib/skills";

/**
 * Selected work, in two movements.
 *
 * First a full screen given over to a single word, poured rather than set —
 * droplets fall off the letters and fuse back into them through a metaball
 * filter — with two tickers running in opposite directions above and below
 * it. It is a hinge: it tells you the section has changed before you read a
 * word of it.
 *
 * Then the statement card, pinned while the project name inside it turns over.
 *
 * Then the case studies, as a stack. Each card is sticky at a slightly lower
 * offset than the one before, so cards do not scroll past each other — they
 * pile up, the covered ones shrinking a few percent as they go under. The
 * scale is what supplies the depth; without it the stack reads as a glitch.
 */

/* ---- The title screen, measured off the reference ----

   Vertical schedule, as fractions of viewport height:
      5.8   top ticker centre — both strips hug the edges
     15.0   label
     36.6   WORK cap top   (cap height 36.7svh, optical centre at 55svh,
     73.3   WORK cap bottom  deliberately below the midline)
     95.5   bottom ticker centre

   The word runs 97.1% of the viewport width — effectively edge to edge, and
   a completely different treatment from the hero's, which holds an 18.7%
   margin. Its O is CIRCULAR (1.07 x cap) where the hero's letters are 4.4x
   taller than wide, so this one is stretched horizontally rather than
   compressed: Anton at 42.67svh, scaleX(1.726).

   Both tickers travel the same way. The contrast between them is a 1.7:1
   SPEED ratio plus a full tonal step, not opposed directions — which was the
   instinctive reading and is simply not what the reel does. */
const ASPECT = 1.629;
const CAP_RATIO = 0.86;
const W_WORK = 2.147; // em

const WORK_CAP = 36.7; // svh
const WORK_SIZE = WORK_CAP / CAP_RATIO;
const WORK_SCALE_X = 97.1 / ((WORK_SIZE * W_WORK) / ASPECT);

/* Same rule as the hero: height-driven until the viewport is narrower than
   the reference aspect, then width-driven, so the word never runs off. */
const WORK_FONT = `min(${WORK_SIZE.toFixed(2)}svh, ${(WORK_SIZE / ASPECT).toFixed(2)}vw)`;

const TECHNOLOGIES = Array.from(
  new Set(skillGroups.flatMap((g) => g.skills.map((s) => s.name)))
).slice(0, 16);

const DISCIPLINES = [
  "Web Platforms",
  "Embedded Systems",
  "API Design",
  "Applied AI",
  "Civic Technology",
  "Data Modelling",
];

function Card({
  project,
  index,
  total,
  progress,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const reduced = useReducedMotion();

  // Each card shrinks only across the span in which it is being covered.
  const targetScale = 1 - (total - index) * 0.02;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  return (
    <div
      className="sticky flex h-svh items-center justify-center px-4 sm:px-8"
      style={{ top: `calc(-3vh + ${index * 20}px)` }}
    >
      <motion.article
        style={reduced ? undefined : { scale }}
        className="group relative grid h-[74svh] w-full max-w-[1400px] origin-top overflow-hidden rounded-sm bg-panel text-on-panel shadow-2xl shadow-black/50 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]"
      >
        {/* ---- Copy ---- */}
        {/* Everything grouped in the upper portion of the card, which is where
            the reference puts it — the lower third is deliberately empty. Both
            spreading the blocks evenly and pinning them to the foot leave a
            void through the middle of a card this tall. */}
        <div className="relative z-10 flex flex-col justify-start p-7 sm:p-10 lg:p-12">
          <div className="flex items-center justify-between">
            <span className="meta text-on-panel-muted">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              <span className="mx-3 opacity-40">—</span>
              {project.year}
            </span>
            <span className="meta flex items-center gap-2 text-on-panel-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {statusCopy[project.status]}
            </span>
          </div>

          <div className="mt-[7svh]">
            <h3 className="text-editorial text-[clamp(1.9rem,4.4vw,3.6rem)] font-medium text-on-panel">
              <Link href={`/projects/${project.slug}`} data-cursor="Read">
                <span className="absolute inset-0 z-20" aria-hidden="true" />
                {project.name}
              </Link>
            </h3>

            <p className="mt-5 max-w-lg text-pretty leading-relaxed text-on-panel-muted">
              {project.summary}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              {project.stack.slice(0, 5).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-line-panel px-3.5 py-1.5 text-[11px] text-on-panel-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Plate ---- */}
        <div className="relative hidden overflow-hidden lg:block">
          <Image
            src={coverFor(project.slug)}
            alt=""
            fill
            sizes="(max-width: 1024px) 0px, 45vw"
            className="media-hover object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
          {/* Feathers the plate into the card so it reads as one surface. */}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-panel to-transparent"
          />
        </div>

        {/* The plate also runs behind the copy on small screens, where there
            is no second column for it to live in. */}
        <div className="absolute inset-0 lg:hidden">
          <Image
            src={coverFor(project.slug)}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <span className="absolute inset-0 bg-panel/75" />
        </div>

        {/* ---- Badge ---- */}
        <div className="absolute bottom-5 right-5 z-10 sm:bottom-7 sm:right-7">
          <RotatingSeal
            tone="panel"
            text="View project"
            className="h-[76px] w-[76px] sm:h-[104px] sm:w-[104px]"
          />
        </div>
      </motion.article>
    </div>
  );
}

export default function Projects() {
  const stackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="projects" className="relative scroll-mt-24">
      {/* ---------- Movement one: the word ---------- */}
      <div
        data-band="dark"
        className="relative flex min-h-svh flex-col justify-between overflow-hidden bg-ink"
      >
        {/* The strips carry no rules in the reference — type on bare ground. */}
        <Marquee
          items={TECHNOLOGIES}
          direction="left"
          duration={46}
          className="mt-[4.4svh]"
          itemClassName="meta text-primary/60"
        />

        <div className="flex flex-1 flex-col items-center justify-start pt-[7svh]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* The label is about 1.7x the ticker type and as bright as the
                lower strip — not another instance of the same small meta. */}
            <p className="meta text-[1.05rem] text-text-primary">
              Scroll to explore my
            </p>

            {/* A hairline with a chevron tip, not an icon. */}
            <motion.span
              aria-hidden="true"
              animate={reduced ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
              className="relative mt-[2svh] block h-[4.4svh] w-px bg-text-muted"
            >
              <span className="absolute -bottom-px left-1/2 block h-[7px] w-[7px] -translate-x-1/2 rotate-45 border-b border-r border-text-muted" />
            </motion.span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-[11.5svh] w-full"
          >
            <GooText
              text="Work"
              className="text-mega block whitespace-nowrap"
              colorClassName="text-primary"
              style={{
                fontSize: WORK_FONT,
                lineHeight: CAP_RATIO,
                transform: `scaleX(${WORK_SCALE_X.toFixed(3)})`,
              }}
            />
          </motion.div>
        </div>

        <Marquee
          items={DISCIPLINES}
          direction="left"
          duration={80}
          className="mb-[4.4svh]"
          itemClassName="meta text-text-primary"
        />
      </div>

      {/* ---------- Movement two: the statement ---------- */}
      <WorkStatement />

      {/* ---------- Movement three: the stack ---------- */}
      <div
        ref={stackRef}
        data-band="dark"
        className="relative bg-ink pb-[18vh]"
      >
        {projects.map((project, i) => (
          <Card
            key={project.slug}
            project={project}
            index={i}
            total={projects.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}
