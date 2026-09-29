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
    <article className="bg-ink pb-[90px] pt-32 sm:pb-[133px] sm:pt-44">
      <div className={MEASURE}>
        <div className="grid grid-cols-1 items-start gap-y-12 lg:grid-cols-12 lg:gap-x-10">
          {/* ---- the sticky dossier --------------------------------
              Everything factual about the project, pinned beside the prose.
              On a case study the reader keeps wanting these — year, status,
              what it was built with — and scrolling back up for them is the
              friction a sticky column removes. */}
          <aside className="lg:sticky lg:top-32 lg:col-span-3">
            <Link
              href="/#projects"
              className="group meta inline-flex items-center gap-2.5 text-text-muted transition-colors duration-[400ms] ease-[cubic-bezier(0.7,0,0.3,1)] hover:text-text-primary"
            >
              <ArrowLeft
                size={14}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
              All projects
            </Link>

            <dl className="mt-10 space-y-6 border-t border-line pt-7">
              <div>
                <dt className="meta text-primary-strong">Year</dt>
                <dd className="text-editorial mt-2 text-lg text-text-primary">
                  {project.year}
                </dd>
              </div>
              <div>
                <dt className="meta text-primary-strong">Status</dt>
                <dd className="text-editorial mt-2 flex items-center gap-2.5 text-lg text-text-primary">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  {statusCopy[project.status]}
                </dd>
              </div>
              <div>
                <dt className="meta text-primary-strong">Focus</dt>
                <dd className="text-editorial mt-2 text-lg leading-snug text-text-primary">
                  {project.categories.join(" · ")}
                </dd>
              </div>
              <div>
                <dt className="meta text-primary-strong">Built with</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {project.stack.map((t) => (
                    <span
                      key={t}
                      className="chip px-3 py-1.5 text-[0.6875rem] text-text-muted"
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
                className="btn-depth label-ui group mt-10 inline-flex items-center gap-3 rounded-pill border border-line-strong bg-surface px-6 py-4 text-text-primary hover:border-primary hover:text-primary-strong"
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
          <div className="lg:col-span-9">
            <h1 className="text-mega text-[clamp(2.8rem,7vw,6rem)] text-text-primary">
              {project.name}
            </h1>

            <p className="lead mt-8 max-w-[46ch] text-text-secondary">
              {project.summary}
            </p>

            <BrowserFrame label={project.name} className="mt-14">
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
              <div className="mt-12 grid grid-cols-2 border-t border-line sm:grid-cols-4">
                {project.stats.map((s) => (
                  <div
                    key={s.label}
                    className="border-b border-line py-7 sm:border-b-0 sm:border-l sm:pl-7 sm:first:border-l-0 sm:first:pl-0"
                  >
                    <p className="meta text-text-muted">{s.label}</p>
                    <p className="text-mega mt-3 text-[clamp(2rem,3.4vw,2.8rem)] text-primary">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-20 grid gap-14 lg:grid-cols-2 lg:gap-16">
              <section>
                <h2 className="eyebrow mb-5 block border-b border-line pb-4">
                  The problem
                </h2>
                <p className="text-pretty leading-relaxed text-text-secondary">
                  {project.problem}
                </p>
              </section>

              <section>
                <h2 className="eyebrow mb-5 block border-b border-line pb-4">
                  The approach
                </h2>
                <p className="text-pretty leading-relaxed text-text-secondary">
                  {project.solution}
                </p>
              </section>
            </div>

            {project.evidence && (
              <p className="mt-16 flex items-start gap-3 rounded-tile border border-line bg-bg-raised p-6 text-[11px] leading-relaxed text-text-muted">
                <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
                {project.evidence}
              </p>
            )}

            <nav className="mt-24 border-t border-line pt-8">
              <p className="eyebrow mb-4 block">Next project</p>
              <Link
                href={`/projects/${next.slug}`}
                className="plate lift group flex flex-wrap items-baseline justify-between gap-4 px-8 py-8"
              >
                <span className="text-display text-3xl text-text-primary transition-colors duration-[400ms] ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:text-primary-strong sm:text-5xl">
                  {next.name}
                </span>
                <ArrowUpRight
                  size={22}
                  aria-hidden="true"
                  className="text-text-muted transition-all duration-[400ms] ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                />
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </article>
  );
}
