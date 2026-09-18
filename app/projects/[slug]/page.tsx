import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import BrowserFrame from "@/components/ui/BrowserFrame";
import { MEASURE } from "@/components/ui/Section";
import { projects, getProject, statusCopy, coverFor } from "@/lib/projects";

/** Static params so every case study is prerendered at build time. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.name,
    description: project.summary,
    openGraph: {
      title: project.name,
      description: project.summary,
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="bg-ink pb-24 pt-28 sm:pt-32">
      <div className={MEASURE}>
        <div className="grid grid-cols-12 items-start gap-x-8 gap-y-10">
          {/* ---- the sticky dossier --------------------------------
              Everything factual about the project, pinned beside the prose.
              On a case study the reader keeps wanting these — year, status,
              what it was built with — and scrolling back up for them is the
              friction a sticky column removes. */}
          <aside className="col-span-12 lg:sticky lg:top-28 lg:col-span-3">
            <Link
              href="/#projects"
              className="group meta inline-flex items-center gap-2 text-text-muted transition-colors hover:text-text-primary"
            >
              <ArrowLeft
                size={14}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
              All projects
            </Link>

            <dl className="mt-8 space-y-5 border-t border-line pt-6">
              <div>
                <dt className="meta text-primary-strong">Year</dt>
                <dd className="mt-1.5 text-sm text-text-primary">
                  {project.year}
                </dd>
              </div>
              <div>
                <dt className="meta text-primary-strong">Status</dt>
                <dd className="mt-1.5 flex items-center gap-2 text-sm text-text-primary">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                  />
                  {statusCopy[project.status]}
                </dd>
              </div>
              <div>
                <dt className="meta text-primary-strong">Focus</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-text-primary">
                  {project.categories.join(" · ")}
                </dd>
              </div>
              <div>
                <dt className="meta text-primary-strong">Built with</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {project.stack.map((t) => (
                    <span
                      key={t}
                      className="chip px-2.5 py-1 font-geometric text-[10.5px] text-text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-depth group mt-7 inline-flex items-center gap-2.5 rounded-pill border border-line-strong bg-surface px-5 py-2.5 font-geometric text-[13px] text-text-primary transition-colors hover:border-primary hover:text-primary-strong"
              >
                <GithubIcon size={14} />
                View source
                <ArrowUpRight
                  size={14}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            )}
          </aside>

          {/* ---- the case study ----------------------------------- */}
          <div className="col-span-12 lg:col-span-9">
            <h1 className="text-mega text-[clamp(2.4rem,6vw,4.5rem)] text-text-primary">
              {project.name}
            </h1>

            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-text-secondary">
              {project.summary}
            </p>

            <BrowserFrame label={project.name} className="mt-10">
              <Image
                src={coverFor(project.slug)}
                alt=""
                width={1600}
                height={900}
                sizes="(max-width: 1024px) 100vw, 60rem"
                priority
                className="aspect-16/9 w-full object-cover"
              />
            </BrowserFrame>

            {project.stats && (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {project.stats.map((s) => (
                  <div key={s.label} className="plate px-5 py-4">
                    <p className="meta text-text-muted">{s.label}</p>
                    <p className="text-display mt-2 text-3xl text-primary">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-14">
              <section>
                <h2 className="eyebrow mb-4 block">The problem</h2>
                <p className="text-pretty leading-relaxed text-text-secondary">
                  {project.problem}
                </p>
              </section>

              <section>
                <h2 className="eyebrow mb-4 block">The approach</h2>
                <p className="text-pretty leading-relaxed text-text-secondary">
                  {project.solution}
                </p>
              </section>
            </div>

            {project.evidence && (
              <p className="mt-12 flex items-start gap-3 rounded-tile border border-line bg-bg-raised p-5 text-[11px] leading-relaxed text-text-muted">
                <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                {project.evidence}
              </p>
            )}

            <nav className="mt-16 border-t border-line pt-8">
              <p className="eyebrow mb-4 block">Next project</p>
              <Link
                href={`/projects/${next.slug}`}
                className="plate lift group flex flex-wrap items-baseline justify-between gap-4 px-6 py-6"
              >
                <span className="text-display text-3xl text-text-primary transition-colors duration-300 group-hover:text-primary-strong sm:text-4xl">
                  {next.name}
                </span>
                <ArrowUpRight
                  size={22}
                  aria-hidden="true"
                  className="text-text-muted transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                />
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </article>
  );
}
