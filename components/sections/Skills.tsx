"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useReducedMotion,
} from "framer-motion";
import { Reveal } from "@/components/ui/motion-primitives";
import HoverPreview from "@/components/ui/HoverPreview";
import TechIcon from "@/components/ui/TechIcon";
import RotatingSeal from "@/components/ui/RotatingSeal";
import Stage from "@/components/three/Stage";
import SkillField, { type HoverTarget } from "@/components/three/SkillField";
import { useCapability } from "@/components/ui/useCapability";
import { skillGroups } from "@/lib/skills";

/**
 * Expertise — the stack as a place.
 *
 * On capable devices this is a travelling shot down a run of constellations:
 * each discipline is a cluster of nodes around a wireframe hub, strung into
 * depth along the same weaving aisle as the project rack. Scroll carries the
 * camera from software, to hardware, to AI, to data — the next discipline
 * always faintly visible deeper in the room. The DOM keeps every word: the
 * left column names the active cluster and lists its technologies as plates,
 * and hovering a chip lights its node in the field. Two directions, one
 * source of truth.
 *
 * Everyone else gets the flat composition this section always had — pinned
 * heading, typographic rows, drifting marks — which remains a designed page,
 * not a downgrade notice. It is also what the server renders, so the full
 * skill index is in the HTML regardless of what the client can draw.
 */

/** Scroll length per discipline. Long enough that a cluster can be read. */
const VH_PER_GROUP = 95;

export default function Skills() {
  const cap = useCapability();
  // The flat layout is the server render AND the first client paint; the
  // constellation mounts only after the device has measured capable. The two
  // agree until then, so hydration never mismatches.
  if (!cap.ready || !cap.render3D) return <FlatSkills />;
  return <SkillSpace />;
}

/* ================================================================
   The constellation run.
   ================================================================ */

function SkillSpace() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [hover, setHover] = useState<HoverTarget | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", setProgress);

  const active = Math.max(
    0,
    Math.min(skillGroups.length - 1, progress * skillGroups.length - 0.5)
  );
  const group = skillGroups[Math.round(active)] ?? skillGroups[0];

  return (
    <section
      id="skills"
      data-band="dark"
      className="relative scroll-mt-24 bg-ink"
    >
      <div
        ref={ref}
        className="relative"
        style={{ height: `${skillGroups.length * VH_PER_GROUP}svh` }}
      >
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* The discipline the camera is on, felt rather than read — the
              same backdrop-word fixture as the rack and every Deep stage. */}
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
              {group.title.split(" ")[0]}
            </span>
          </div>

          <Stage
            className="pointer-events-none absolute inset-0 z-10"
            fov={32}
            position={[0, 0, 5.6]}
            // The flat page already exists beneath this component's branch;
            // if the context dies mid-visit the copy column carries on and
            // the canvas simply goes quiet.
            fallback={null}
          >
            <SkillField
              groups={skillGroups}
              active={active}
              hover={hover}
              reduced={!!reduced}
            />
          </Stage>

          {/* ---- The copy. Always DOM, never drawn. ---- */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center">
            <div className="w-full max-w-[1600px] px-6 sm:px-10">
              <div className="pointer-events-auto max-w-lg">
                <p className="meta flex items-center gap-3 text-text-muted">
                  <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
                  02 — What I do
                </p>

                <h2 className="text-mega mt-6 text-[clamp(2.2rem,6vw,4.6rem)] leading-[0.86] text-text-primary">
                  My
                  <br />
                  <span className="text-primary">Expertise</span>
                </h2>

                <motion.article
                  key={group.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="plate elevate mt-8 p-6 backdrop-blur-none sm:p-7"
                >
                  <div className="flex items-baseline justify-between">
                    <span className="meta text-primary">{group.index}</span>
                    <span className="meta text-text-muted">
                      {group.skills.length} tools
                    </span>
                  </div>

                  <h3 className="text-display mt-4 text-[clamp(1.3rem,2.6vw,2rem)] text-text-primary">
                    {group.title}
                  </h3>

                  <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-text-secondary">
                    {group.blurb}
                  </p>

                  {/* The chips are the interaction surface: hover or focus
                      one and its node takes the gold out in the field. */}
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {group.skills.map((s, si) => (
                      <li key={s.name}>
                        <button
                          type="button"
                          title={s.detail}
                          onPointerEnter={() =>
                            setHover({ group: Math.round(active), skill: si })
                          }
                          onPointerLeave={() => setHover(null)}
                          onFocus={() =>
                            setHover({ group: Math.round(active), skill: si })
                          }
                          onBlur={() => setHover(null)}
                          className={`plate btn-depth flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors duration-300 ${
                            hover?.skill === si &&
                            hover.group === Math.round(active)
                              ? "border-primary text-primary"
                              : "text-text-secondary"
                          }`}
                        >
                          <TechIcon name={s.name} size={12} />
                          {s.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.article>
              </div>
            </div>
          </div>

          {/* Position in the run — the site's shared datum-ticks device. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-6 bottom-8 z-20 flex items-center gap-1.5 sm:inset-x-10"
          >
            {skillGroups.map((g, i) => (
              <span
                key={g.id}
                className={`h-px flex-1 transition-colors duration-500 ${
                  i <= Math.round(active) ? "bg-primary" : "bg-line-strong"
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-14 right-6 z-20 sm:bottom-16 sm:right-10">
            <RotatingSeal
              tone="dark"
              text="Scroll the stack"
              className="h-[76px] w-[76px] sm:h-[100px] sm:w-[100px]"
            />
          </div>
        </div>
      </div>

      {/* The full index, for readers the canvas cannot reach. */}
      <div className="sr-only">
        {skillGroups.map((g) => (
          <div key={g.id}>
            <h3>{g.title}</h3>
            <p>{g.blurb}</p>
            <ul>
              {g.skills.map((s) => (
                <li key={s.name}>
                  {s.name} — {s.detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ================================================================
   The flat composition — server render, first paint, and every
   device that did not earn the constellation.
   ================================================================ */

/** Marks that drift in the open space below the pinned copy. Hand-placed
    within their own block, so they can never land on top of a sentence. */
const FLOATERS = [
  { name: "React", top: "6%", left: "4%", size: 34, delay: 0, drift: 16 },
  { name: "TypeScript", top: "48%", left: "17%", size: 26, delay: 1.1, drift: 12 },
  { name: "ESP32", top: "14%", left: "30%", size: 38, delay: 0.5, drift: 20 },
  { name: "Next.js", top: "62%", left: "40%", size: 24, delay: 0.9, drift: 18 },
  { name: "Prisma", top: "8%", left: "52%", size: 24, delay: 0.3, drift: 13 },
  { name: "Arduino Uno", top: "52%", left: "63%", size: 28, delay: 2.2, drift: 11 },
  { name: "PostgreSQL", top: "12%", left: "76%", size: 30, delay: 1.8, drift: 14 },
  { name: "Tailwind CSS", top: "58%", left: "87%", size: 24, delay: 1.5, drift: 15 },
];

function FlatSkills() {
  const reduced = useReducedMotion();
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <section
      id="skills"
      data-band="dark"
      className="relative scroll-mt-24 overflow-hidden bg-ink px-6 py-24 sm:px-10 sm:py-32"
    >
      <HoverPreview src={preview} />

      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <p className="meta flex items-center gap-3 text-text-muted">
            <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
            02 — What I do
          </p>
        </Reveal>

        <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16 xl:gap-24">
          {/* ---- Pinned column ---- */}
          <div className="relative lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <h2 className="text-mega text-[clamp(2.6rem,7.5vw,6rem)] leading-[0.86] text-text-primary">
                My
                <br />
                <span className="text-primary">Expertise</span>
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-8 max-w-md text-pretty leading-relaxed text-text-secondary">
                I design and build systems where the data model, the service and
                the interface are one piece of work — and where, often enough,
                the last mile is a sensor on a bench rather than a screen.
              </p>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-md text-pretty leading-relaxed text-text-muted">
                From server-rendered admin systems to typed APIs and firmware
                that has to keep running when nobody is watching.
              </p>
            </Reveal>

            {/* Drifting marks. Decorative, and duplicative of the row copy —
                hidden from assistive technology and dropped on small screens,
                where the column has no spare height for them to drift in. */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative mt-14 hidden h-52 lg:block"
            >
              {FLOATERS.map((f) => (
                <motion.span
                  key={f.name}
                  className="absolute opacity-70"
                  style={{ top: f.top, left: f.left }}
                  animate={
                    reduced
                      ? undefined
                      : { y: [0, -f.drift, 0], rotate: [0, 6, 0] }
                  }
                  transition={{
                    duration: 7 + f.drift * 0.2,
                    delay: f.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <TechIcon name={f.name} size={f.size} />
                </motion.span>
              ))}
            </div>
          </div>

          {/* ---- The list ---- */}
          <ul className="border-t border-line">
            {skillGroups.map((group, i) => (
              <li key={group.id}>
                <Reveal delay={i * 0.05}>
                  <div
                    className="group relative border-b border-line py-8 sm:py-10"
                    onPointerEnter={() => setPreview(group.preview)}
                    onPointerLeave={() => setPreview(null)}
                  >
                    {/* Amber floods in from the left on hover — the row's
                        entire hover state, no borders moving. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 -left-4 -right-4 -z-10 origin-left scale-x-0 bg-surface/70 transition-transform duration-600 ease-out group-hover:scale-x-100"
                    />

                    <div className="flex items-start gap-5 sm:gap-8">
                      <span className="meta mt-1.5 shrink-0 text-primary">
                        {group.index}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-display text-[clamp(1.25rem,2.6vw,2rem)] text-text-primary transition-colors duration-400 group-hover:text-primary">
                          {group.title}
                        </h3>

                        <p className="mt-3 max-w-lg text-pretty leading-relaxed text-text-secondary">
                          {group.blurb}
                        </p>

                        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                          {group.skills.map((s) => (
                            <li
                              key={s.name}
                              title={s.detail}
                              className="flex items-center gap-2 text-[11px] text-text-muted transition-colors duration-300 group-hover:text-text-secondary"
                            >
                              <TechIcon name={s.name} size={13} />
                              {s.name}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <span className="meta mt-1.5 hidden shrink-0 text-text-muted sm:block">
                        {group.skills.length}
                      </span>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
