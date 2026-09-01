"use client";

import { motion, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { ZoomStagger, zoomItem } from "@/components/ui/motion-primitives";
import TechIcon from "@/components/ui/TechIcon";
import { skillGroups } from "@/lib/skills";

/**
 * Skills, as a grid of technology logos.
 *
 * Modelled on the reference site (tuyishimireeric.github.io), whose skills
 * section is a plain `grid-template-columns: repeat(8, auto)` of 100px logos,
 * each carrying `data-aos="zoom-in"`, stepping down 8 → 6 → 5 → 4 columns as
 * the viewport narrows. The same column counts and the same zoom-in entrance
 * are reproduced here.
 *
 * One deliberate difference: the reference shows logos alone. Each tile here
 * also carries its name, because a logo grid is unreadable to anyone who does
 * not already recognise all thirty-five marks — and unusable to a screen
 * reader. The name is small and muted so the logos still lead.
 */
export default function Skills() {
  const reduced = useReducedMotion();

  const all = skillGroups.flatMap((g) =>
    g.skills.map((s) => ({ ...s, group: g.title }))
  );

  return (
    <section
      id="skills"
      className="relative scroll-mt-32 overflow-hidden px-6 py-28 sm:px-10 sm:py-36"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 band" />

      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Skills"
          title="Technologies I work with"
          lead="Grouped by discipline in the source, shown here as one set. Hover any mark for what I use it for."
        />

        {/* 8 / 6 / 5 / 4 columns — the reference's own breakpoints */}
        <ZoomStagger
          className="mt-16 grid grid-cols-4 gap-x-4 gap-y-10 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8"
          stagger={0.035}
        >
          {all.map((skill) => (
            <motion.div
              key={skill.name}
              variants={reduced ? undefined : zoomItem}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative">
                {/* Amber halo blooms behind the mark on hover */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 scale-50 rounded-full bg-primary/25 opacity-0 blur-xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100"
                />
                <motion.div
                  whileHover={reduced ? undefined : { scale: 1.18, y: -4 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="grid h-16 w-16 place-items-center rounded-sm border border-line bg-surface/40 transition-colors duration-400 group-hover:border-primary/50 sm:h-[72px] sm:w-[72px]"
                >
                  <TechIcon name={skill.name} size={30} />
                </motion.div>
              </div>

              <p className="mt-3 text-[11px] font-medium leading-tight text-text-secondary transition-colors duration-300 group-hover:text-primary">
                {skill.name}
              </p>

              {/* Detail rises in on hover, in place, so the grid never reflows */}
              <p className="mt-1 h-8 text-[9.5px] leading-tight text-text-muted opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                {skill.detail}
              </p>
            </motion.div>
          ))}
        </ZoomStagger>

        {/* Disciplines named once, beneath — the grouping is still real */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 border-t border-line pt-8">
          {skillGroups.map((g) => (
            <span key={g.id} className="text-[10px] uppercase tracking-[0.16em] text-text-muted">
              {g.title}
              <span className="ml-2 text-accent">{g.skills.length}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
