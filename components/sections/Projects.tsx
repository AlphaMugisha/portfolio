import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { projects, coverFor, statusCopy } from "@/lib/projects";

/**
 * Selected work — a plain card grid. Cover, name, year and status, summary,
 * the first few stack items, and a link to the case study. Nothing moves
 * except a gentle hover lift.
 */
export default function Projects() {
  return (
    <section
      id="projects"
      data-band="dark"
      className="scroll-mt-24 bg-ink px-6 py-24 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <p className="meta flex items-center gap-3 text-text-muted">
          <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
          03 — Selected work
        </p>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-display text-[clamp(1.9rem,5.2vw,3.6rem)] text-text-primary">
            My <span className="text-primary">work</span>
          </h2>
          <p className="meta text-text-muted">{projects.length} projects</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {projects.map((p, i) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="plate btn-depth group block p-2.5 transition-colors hover:border-primary"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={coverFor(p.slug)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="media-hover object-cover"
                />
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="meta text-text-muted">
                    {String(i + 1).padStart(2, "0")} / {p.year}
                  </span>
                  <span className="meta flex items-center gap-2 text-text-secondary">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                    {statusCopy[p.status]}
                  </span>
                </div>

                <h3 className="text-editorial mt-3 flex items-baseline justify-between gap-3 text-2xl text-text-primary transition-colors group-hover:text-primary">
                  {p.name}
                  <ArrowUpRight
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </h3>

                <p className="mt-3 text-pretty text-sm leading-relaxed text-text-secondary">
                  {p.summary}
                </p>

                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.stack.slice(0, 4).map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-line px-3 py-1 text-[11px] text-text-muted"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
