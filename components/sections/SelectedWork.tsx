import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Counter from "@/components/ui/Counter";
import { mediaUrl } from "@/lib/supabase/env";
import { STATUS_LABEL } from "@/lib/utils/format";
import type { ProjectRow, SectionRow } from "@/types/database";

export default function SelectedWork({
  section,
  projects,
}: {
  section: SectionRow;
  projects: ProjectRow[];
}) {
  return (
    <section id="work" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading section={section} index="03" />

        <div className="mt-16 space-y-20">
          {projects.map((project, i) => {
            const flipped = i % 2 === 1;
            const cover = mediaUrl(project.cover_path);
            return (
              <ScrollReveal key={project.id}>
                <div
                  className={`grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14 ${
                    flipped ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    className="panel group relative block overflow-hidden"
                  >
                    <span className="panel-marks" />
                    <div className="relative m-3 aspect-[16/11] overflow-hidden border border-rule">
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 560px, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      ) : null}
                    </div>
                  </Link>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="tag tag-signal">{STATUS_LABEL[project.status]}</span>
                      <span className="tag">{project.year}</span>
                    </div>

                    <Link href={`/projects/${project.slug}`} className="group mt-5 block">
                      <h3 className="inline-flex items-center gap-3 font-display text-3xl font-semibold tracking-tight text-text transition-colors group-hover:text-signal sm:text-4xl">
                        {project.name}
                        <ArrowUpRight
                          size={22}
                          className="shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                        />
                      </h3>
                    </Link>

                    <p className="mt-4 leading-relaxed text-text-muted">{project.summary}</p>

                    {project.stats.length ? (
                      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                        {project.stats.slice(0, 3).map((s) => (
                          <div key={s.label}>
                            <p className="font-display text-2xl font-semibold text-signal">
                              <Counter value={s.value} />
                            </p>
                            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-subtle">
                              {s.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <p className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-text-subtle">
                      {project.stack.join(" · ")}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
