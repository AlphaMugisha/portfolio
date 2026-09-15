"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useReducedMotion } from "framer-motion";
import Stage from "@/components/three/Stage";
import PlateRack from "@/components/three/PlateRack";
import RotatingSeal from "@/components/ui/RotatingSeal";
import Tilt, { TiltLayer } from "@/components/ui/Tilt";
import { projects, statusCopy, coverFor } from "@/lib/projects";
import { SETTLE, DUR } from "@/lib/motion";

/**
 * The case studies, as a rack of plates the camera travels down.
 *
 * Scroll drives one number — which plate is being read — and everything else is
 * derived from it: the camera's position in the aisle, which photograph is
 * fully saturated, where the gold light sits, and which project's copy is on
 * screen. One source of truth means the 3D and the DOM can never disagree about
 * what the reader is looking at.
 *
 * The division of labour is deliberate and matches the rest of the site: WebGL
 * carries photography and depth, the DOM carries every word. The project name
 * is a real heading inside a real link, the summary is real text, and the whole
 * section remains readable, selectable and crawlable with the canvas removed.
 *
 * Without WebGL the same content renders as tilting cards on the flat page —
 * the depth becomes CSS perspective instead of geometry, which is a quieter
 * version of the same idea rather than a different design.
 */

/** Scroll length per project. Long enough that a plate can be read. */
const VH_PER_PLATE = 90;

export default function ProjectRack() {
  const ref = useRef<HTMLDivElement>(null);
  // The sticky viewport doubles as the raycast surface: R3F reads pointer
  // events from it, so plates can answer hover while the canvas stays
  // pointer-transparent under the real links.
  const stickyRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", setProgress);

  // Fractional plate index. The last plate is held rather than scrolled past,
  // so the run ends on a project instead of on empty aisle.
  const active = Math.max(
    0,
    Math.min(projects.length - 1, progress * projects.length - 0.5)
  );
  const current = projects[Math.round(active)] ?? projects[0];

  const plates = projects.map((p) => ({ slug: p.slug, cover: coverFor(p.slug) }));

  return (
    <div
      ref={ref}
      data-band="dark"
      className="relative bg-ink"
      style={{ height: `${projects.length * VH_PER_PLATE}svh` }}
    >
      <div ref={stickyRef} className="sticky top-0 h-svh overflow-hidden">
        {/* The word the plates pass in front of. Set at the work title's own
            stretch, in the panel colour on the ground — a shape you feel
            rather than read, which is why it is hidden from assistive tech. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
        >
          <span
            className="text-mega whitespace-nowrap text-panel/70"
            style={{
              fontSize: "min(34svh, 20.9vw)",
              lineHeight: 0.86,
              transform: "scaleX(1.726)",
            }}
          >
            {current.name.split(" ")[0]}
          </span>
        </div>

        <Stage
          className="pointer-events-none absolute inset-0 z-10"
          fov={32}
          position={[0, 0, 7.4]}
          eventSource={stickyRef}
          fallback={<FlatRack />}
        >
          <PlateRack
            plates={plates}
            active={active}
            progress={progress}
            reduced={!!reduced}
          />
        </Stage>

        {/* ---- The copy. Always DOM, never drawn. ---- */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center">
          <div className="w-full max-w-[1600px] px-6 sm:px-10">
            <Tilt max={3} lift={10} className="pointer-events-auto max-w-md">
            <motion.article
              key={current.slug}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.settle, ease: SETTLE }}
              className="rounded-sm border border-line bg-ink/80 p-6 backdrop-blur-md sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="meta text-text-muted">
                  {String(Math.round(active) + 1).padStart(2, "0")} /{" "}
                  {String(projects.length).padStart(2, "0")}
                  <span className="mx-3 opacity-40">—</span>
                  {current.year}
                </span>
                <span className="meta flex items-center gap-2 text-text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {statusCopy[current.status]}
                </span>
              </div>

              <h3 className="text-editorial mt-6 text-[clamp(1.7rem,3.4vw,2.8rem)] font-medium text-text-primary">
                <Link
                  href={`/projects/${current.slug}`}
                  data-cursor="Read"
                  className="transition-colors duration-300 hover:text-primary"
                >
                  {current.name}
                </Link>
              </h3>

              <p className="mt-4 text-pretty leading-relaxed text-text-secondary">
                {current.summary}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {current.stack.slice(0, 5).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line px-3.5 py-1.5 text-[11px] text-text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.article>
            </Tilt>
          </div>
        </div>

        {/* Position in the run, as a datum rule with one tick per project —
            the flat progress ticks from the old stack, kept as the reader's
            orientation in a space that otherwise has no landmarks. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-6 bottom-8 z-20 flex items-center gap-1.5 sm:inset-x-10"
        >
          {projects.map((p, i) => (
            <span
              key={p.slug}
              className={`h-px flex-1 transition-colors duration-500 ${
                i <= Math.round(active) ? "bg-primary" : "bg-line-strong"
              }`}
            />
          ))}
        </div>

        <div className="absolute bottom-14 right-6 z-20 sm:bottom-16 sm:right-10">
          <RotatingSeal
            tone="dark"
            text="Scroll the rack"
            className="h-[76px] w-[76px] sm:h-[100px] sm:w-[100px]"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The no-WebGL rack.
 *
 * Not a placeholder: the same eight projects as tilting plates on the flat
 * page, so the section still reads as an archive of mounted work rather than
 * as a list. Depth comes from CSS perspective instead of geometry.
 */
function FlatRack() {
  return (
    <div className="stage absolute inset-0 flex items-center overflow-hidden">
      <div className="flex w-full gap-6 overflow-x-auto px-6 pb-6 [scrollbar-width:none] sm:px-10 [&::-webkit-scrollbar]:hidden">
        {projects.map((p) => (
          <Tilt
            key={p.slug}
            max={6}
            lift={18}
            className="layer group relative w-[70vw] shrink-0 sm:w-[340px]"
          >
            <div className="relative aspect-4/3 overflow-hidden rounded-sm border border-line bg-panel p-2.5 elevate">
              <TiltLayer depth={0.8} className="relative h-full w-full">
                <Image
                  src={coverFor(p.slug)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 70vw, 340px"
                  className="media-hover object-cover"
                />
              </TiltLayer>
            </div>
            <TiltLayer depth={0.35}>
              <p className="meta mt-4 text-text-muted">{p.year}</p>
              <h3 className="text-editorial mt-1 text-xl text-text-primary">
                <Link href={`/projects/${p.slug}`} data-cursor="Read">
                  {p.name}
                </Link>
              </h3>
            </TiltLayer>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
