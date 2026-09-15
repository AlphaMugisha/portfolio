"use client";

import { motion, useReducedMotion } from "framer-motion";

import GooText from "@/components/ui/GooText";
import Marquee from "@/components/ui/Marquee";
import Approach from "@/components/ui/Approach";
import Deep, { DeepLayer } from "@/components/ui/Deep";
import WorkStatement from "@/components/sections/WorkStatement";
import ProjectRack from "@/components/sections/ProjectRack";
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


export default function Projects() {
  const reduced = useReducedMotion();

  return (
    <section id="projects" className="relative scroll-mt-24">
      {/* ---------- Movement one: the word ---------- */}
      <div
        data-band="dark"
        className="relative min-h-svh overflow-hidden bg-ink"
      >
        <Approach>
        <Deep
          tilt={1.0}
          innerClassName="flex min-h-svh flex-col justify-between"
        >
        {/* The strips are ribbons in the room now — each tipped a few degrees
            out of the page plane and set at its own depth, so the pair reads
            as bands the word hangs between rather than printed rules. */}
        <DeepLayer depth={110} drift={0.45}>
          <div style={{ transform: "rotateX(-7deg)" }}>
            <Marquee
              items={TECHNOLOGIES}
              direction="left"
              duration={46}
              className="mt-[4.4svh]"
              itemClassName="meta text-primary/60"
            />
          </div>
        </DeepLayer>

        <DeepLayer
          depth={34}
          drift={0.25}
          className="flex flex-1 flex-col items-center justify-start pt-[7svh]"
        >
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
        </DeepLayer>

        <DeepLayer depth={-30} drift={-0.2}>
          <div style={{ transform: "rotateX(7deg)" }}>
            <Marquee
              items={DISCIPLINES}
              direction="left"
              duration={80}
              className="mb-[4.4svh]"
              itemClassName="meta text-text-primary"
            />
          </div>
        </DeepLayer>
        </Deep>
        </Approach>
      </div>

      {/* ---------- Movement two: the statement ---------- */}
      <WorkStatement />

      {/* ---------- Movement three: the rack ---------- */}
      <ProjectRack />
    </section>
  );
}
