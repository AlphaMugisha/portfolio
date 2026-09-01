"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { projects, statusCopy, coverFor, type Project } from "@/lib/projects";

/**
 * Selected work, as a horizontal gallery.
 *
 * Desktop pins the section and slides the row right-to-left, driven by
 * vertical scroll. Touch and reduced motion get a native snap carousel.
 *
 * The layout switch is CSS (`lg:` variants), not a JS tree swap — swapping on
 * a media-query state would serve the carousel and then snap to the pinned
 * layout after mount, a visible jump on every desktop load. Here the DOM is
 * identical either way and only the transform value changes.
 */

function useHorizontalMode() {
  const [enabled, setEnabled] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setEnabled(false);
      return;
    }
    const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduced]);

  return enabled;
}

function Card({ project, index }: { project: Project; index: number }) {
  return (
    <article className="group relative flex w-[80vw] shrink-0 snap-start flex-col sm:w-[430px] lg:w-[500px] lg:snap-align-none">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-sm bg-surface">
        <Image
          src={coverFor(project.slug)}
          alt=""
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 430px, 500px"
          className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.05]"
        />

        {/* Ink veil deepens on hover so the action reads clearly */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent opacity-70 transition-opacity duration-600 group-hover:opacity-95" />

        {/* Index — position in a curated set, so the number carries meaning */}
        <span className="absolute left-5 top-5 font-sans text-[10px] tracking-[0.2em] text-paper/70">
          {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </span>

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
          <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-paper/85">
            {project.categories[0]}
          </span>
          <span className="flex translate-y-2 items-center gap-2 rounded-full bg-paper px-4 py-2 text-xs font-medium text-ink opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            Case study
            <ArrowUpRight size={12} />
          </span>
        </div>
      </div>

      <div className="pt-6">
        <div className="mb-3 flex items-center gap-3">
          <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-text-muted">
            {statusCopy[project.status]} · {project.year}
          </span>
        </div>

        <h3 className="text-display text-2xl text-text-primary transition-colors duration-400 group-hover:text-primary sm:text-[1.7rem]">
          <Link href={`/projects/${project.slug}`}>
            <span className="absolute inset-0 z-10" aria-hidden="true" />
            {project.name}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-2 max-w-md leading-relaxed text-text-secondary">
          {project.summary}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
          {project.stack.slice(0, 4).map((t) => (
            <span key={t} className="font-sans text-[10px] text-text-muted">
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontal = useHorizontalMode();

  const { scrollYProgress } = useScroll({ target: containerRef });
  const rawX = useTransform(scrollYProgress, [0.06, 0.94], ["1%", "-74%"]);
  const x = useSpring(rawX, { stiffness: 110, damping: 28, mass: 0.5 });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  return (
    <section id="projects" className="relative scroll-mt-32">
      <div className="mx-auto max-w-7xl px-6 pt-28 sm:px-10 sm:pt-36">
        <SectionHeading
          eyebrow="Selected work"
          title="Projects"
          lead="Systems built end to end — data model, backend and interface. Every figure quoted in these case studies was read from the running application."
        />

        <div className="mt-10 flex items-center gap-3 font-sans text-[10px] uppercase tracking-[0.16em] text-text-muted">
          <span className="lg:hidden">Swipe to browse</span>
          <span className="hidden lg:inline">Continue scrolling to browse</span>
          <ArrowRight size={13} className="text-primary" />
        </div>
      </div>

      <div ref={containerRef} className="relative mt-12 lg:mt-0 lg:h-[400vh]">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:overflow-hidden">
          <motion.div
            style={horizontal ? { x } : undefined}
            className="flex snap-x snap-mandatory items-start gap-6 overflow-x-auto px-6 pb-4 sm:gap-10 sm:px-10 lg:snap-none lg:overflow-x-visible lg:pb-0 lg:pl-[max(2.5rem,calc((100vw-80rem)/2))] lg:pr-[28vw] lg:will-change-transform [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {projects.map((project, i) => (
              <Card key={project.slug} project={project} index={i} />
            ))}
          </motion.div>

          <div className="mx-auto mt-12 hidden h-px w-[min(80rem,calc(100vw-5rem))] bg-line lg:block">
            <motion.div
              style={{ scaleX: progress }}
              className="h-full origin-left bg-primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
