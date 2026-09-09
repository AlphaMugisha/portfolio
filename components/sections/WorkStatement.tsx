"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useReducedMotion,
} from "framer-motion";
import RotatingSeal from "@/components/ui/RotatingSeal";
import { projects, coverFor } from "@/lib/projects";

/**
 * The statement card.
 *
 * The reel's hinge between the work title and the case studies, and the one
 * piece of it that is a genuine mechanic rather than a layout: a card pinned
 * for a few screens, holding a sentence whose middle line is a project name
 * that swaps as you scroll. The outgoing name does not simply leave — it
 * stays a moment behind the incoming one, ghosted, so the swap reads as a
 * counter turning over rather than a crossfade.
 *
 * The frame words are set in near-black on a grey panel and the name in
 * near-white on the same panel, which is what makes the name the only thing
 * that moves and the only thing that reads first.
 *
 * Scroll drives an index, not a timer. That matters: the sentence is a
 * response to the reader's own scrolling, so it cannot get ahead of them or
 * finish while they are still reading it.
 */
export default function WorkStatement() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // The last slice is left long on purpose: the final name should still be
    // on screen as the card releases, rather than flicking over at the exit.
    const next = Math.min(
      projects.length - 1,
      Math.max(0, Math.floor(p * projects.length))
    );
    setIndex((prev) => {
      if (next !== prev) setDir(next > prev ? 1 : -1);
      return next;
    });
  });

  const project = projects[index];

  /* The reference's project names are all about this long ("Creative
     Portfolio"), so its type scale never has to move. Ours run from
     "Tembera" to "School & Community Systems", which would overrun the line
     and get clipped by the mask. Scaling by character count is coarser than
     measuring, but it is deterministic, matches on the server, and costs no
     layout pass on a line that changes while the reader is scrolling. */
  const TUNED_FOR = 18;
  const fit = Math.min(1, TUNED_FOR / project.name.length).toFixed(3);

  return (
    <div ref={ref} className="relative h-[320svh]" data-band="dark">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center px-4 sm:px-8">
        <p className="text-display mb-6 text-center text-sm text-primary-light sm:mb-8 sm:text-base">
          My work
        </p>

        <article className="relative w-full max-w-[1400px] overflow-hidden rounded-sm bg-panel-mid text-on-panel-mid">
          <div className="relative grid min-h-[62svh] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
            {/* ---- The sentence ---- */}
            <div className="relative z-10 flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <p className="meta text-on-panel-mid/70">
                Selected work — {String(index + 1).padStart(2, "0")} /{" "}
                {String(projects.length).padStart(2, "0")}
              </p>

              <h2 className="mt-6">
                <span className="sr-only">
                  I build {project.name}, and systems like it, that hold up.
                </span>

                <span
                  aria-hidden="true"
                  className="text-mega block text-[clamp(2.2rem,7vw,5.5rem)] text-on-panel-mid"
                >
                  I build
                </span>

                {/* The swapping line. Two layers: the incoming name, and the
                    one it displaced held a beat longer at low opacity. */}
                <span
                  aria-hidden="true"
                  className="relative block h-[clamp(2.6rem,7.6vw,6rem)] overflow-hidden"
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={project.slug}
                      initial={
                        reduced ? { opacity: 0 } : { y: `${dir * 105}%`, opacity: 0 }
                      }
                      animate={reduced ? { opacity: 1 } : { y: "0%", opacity: 1 }}
                      exit={
                        reduced
                          ? { opacity: 0 }
                          : { y: `${dir * -55}%`, opacity: 0, filter: "blur(3px)" }
                      }
                      transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        fontSize: `calc(clamp(2rem, 6.4vw, 5rem) * ${fit})`,
                      }}
                      className="text-editorial absolute inset-x-0 top-0 whitespace-nowrap font-normal text-on-panel-mid-lift"
                    >
                      {project.name}
                    </motion.span>
                  </AnimatePresence>
                </span>

                <span
                  aria-hidden="true"
                  className="text-mega block text-[clamp(2.2rem,7vw,5.5rem)] text-on-panel-mid"
                >
                  that hold up.
                </span>
              </h2>

              <p className="mt-7 max-w-md text-pretty text-sm leading-relaxed text-on-panel-mid/80">
                {project.summary}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {project.stack.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-on-panel-mid/25 px-3 py-1 text-[11px] text-on-panel-mid/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ---- The plate ---- */}
            <div className="relative hidden overflow-hidden lg:block">
              <AnimatePresence initial={false}>
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={coverFor(project.slug)}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 0px, 34vw"
                    className="object-cover grayscale"
                  />
                </motion.div>
              </AnimatePresence>
              {/* Feathered into the panel so the plate reads as part of the
                  card rather than a window cut into it. */}
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-panel-mid to-transparent"
              />
            </div>
          </div>

          <div className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7">
            <RotatingSeal
              tone="light"
              text="Scroll on"
              className="h-[68px] w-[68px] sm:h-[92px] sm:w-[92px]"
            />
          </div>
        </article>

        {/* Position within the run, as ticks rather than a number. */}
        <div
          aria-hidden="true"
          className="mt-6 flex w-full max-w-[1400px] items-center gap-1.5"
        >
          {projects.map((p, i) => (
            <span
              key={p.slug}
              className={`h-px flex-1 origin-left transition-colors duration-500 ${
                i <= index ? "bg-primary-light" : "bg-line-strong"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
