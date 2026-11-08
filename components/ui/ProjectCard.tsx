import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { mediaUrl } from "@/lib/supabase/env";
import { STATUS_LABEL } from "@/lib/utils/format";
import type { ProjectRow } from "@/types/database";

/**
 * A project as a panel: the cover photograph inset inside the chamfered
 * frame, trace-bracket marks at its corners, then the name, the one-liner
 * and the stack. The arrow rotates and the image creeps up on hover — two
 * cheap gestures that make the card read as one object responding.
 */
export default function ProjectCard({
  project,
  priority = false,
}: {
  project: ProjectRow;
  priority?: boolean;
}) {
  const cover = mediaUrl(project.cover_path);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="panel lift group relative flex h-full flex-col overflow-hidden"
    >
      <span className="panel-marks" />

      <div className="relative m-3 mb-0 overflow-hidden border border-rule bg-ink-overlay">
        <div className="relative aspect-[4/3]">
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              priority={priority}
              sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.2em] text-text-subtle">
              No cover yet
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold tracking-tight text-text">
            {project.name}
          </h3>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-rule text-text-muted transition-all duration-300 group-hover:rotate-45 group-hover:border-signal group-hover:text-signal">
            <ArrowUpRight size={14} />
          </span>
        </div>

        <p className="mt-2 leading-relaxed text-text-muted">{project.summary}</p>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          <span className="tag tag-signal">{STATUS_LABEL[project.status]}</span>
          <span className="tag">{project.year}</span>
          <span className="ml-auto font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-text-subtle">
            {project.stack.slice(0, 2).join(" · ")}
            {project.stack.length > 2 ? ` +${project.stack.length - 2}` : ""}
          </span>
        </div>
      </div>
    </Link>
  );
}
