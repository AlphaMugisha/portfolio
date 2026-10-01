import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Blob from "./Blob";
import { coverFor, statusCopy, type Project } from "@/lib/projects";

/**
 * A project, as a floating panel: the cover photograph inset inside the
 * card's own padding, then the name, the one-liner and the stack.
 *
 * The cover is inset rather than bled to the card edge so the white frame
 * reads as a mount around a photograph. The arrow rotates 45° on hover and
 * the image creeps up 2% — two small, cheap gestures that make the whole
 * card feel like one object responding, instead of a link that happens to
 * contain a picture.
 */
export default function ProjectCard({
  project,
  index = 0,
  priority = false,
}: {
  project: Project;
  index?: number;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="glass-card lift group relative flex h-full flex-col overflow-hidden"
    >
      <Blob index={index} />

      <div className="relative m-4 mb-0 overflow-hidden rounded-[1.3rem] border border-black/[0.06] bg-white dark:border-white/10 dark:bg-black">
        <div className="relative aspect-[4/3]">
          <Image
            src={coverFor(project.slug)}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-7">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-ink dark:text-ink-invert">
            {project.name}
          </h3>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight size={16} />
          </span>
        </div>

        <p className="mt-2 leading-relaxed text-ink-subtle dark:text-ink-invert-muted">
          {project.summary}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          <span className="chip chip-accent">{statusCopy[project.status]}</span>
          <span className="chip">{project.year}</span>
          <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-subtle dark:text-ink-invert-subtle">
            {project.stack.slice(0, 2).join(" · ")}
            {project.stack.length > 2 ? ` +${project.stack.length - 2}` : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
