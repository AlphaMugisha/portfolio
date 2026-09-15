import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
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
    <article
      data-band="dark"
      className="bg-ink px-6 pb-24 pt-28 sm:px-8 sm:pt-32"
    >
      <div className="mx-auto max-w-4xl">
        <Link
          href="/#projects"
          className="plate btn-depth group mb-14 inline-flex items-center gap-2 px-4 py-2.5 meta text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft
            size={14}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-x-0.5"
          />
          All projects
        </Link>

        <header>
          <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="meta text-text-muted">{project.year}</span>
            <span className="meta flex items-center gap-2 text-text-secondary">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
              {statusCopy[project.status]}
            </span>
          </div>

          <h1 className="text-display text-[clamp(2.25rem,6.5vw,4.5rem)] text-text-primary">
            {project.name}
          </h1>

          <div className="mt-7 flex flex-wrap gap-2">
            {project.categories.map((c) => (
              <span
                key={c}
                className="plate meta rounded-full px-3.5 py-1.5 text-primary"
              >
                {c}
              </span>
            ))}
          </div>

          <p className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-text-secondary">
            {project.summary}
          </p>
        </header>

        <div className="plate mt-12 p-2.5 sm:p-3">
          <Image
            src={coverFor(project.slug)}
            alt=""
            width={1600}
            height={900}
            sizes="(max-width: 1024px) 100vw, 56rem"
            priority
            className="aspect-16/9 w-full object-cover"
          />
        </div>

        {project.stats && (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {project.stats.map((s) => (
              <div key={s.label} className="plate px-5 py-4">
                <p className="meta text-text-muted">{s.label}</p>
                <p className="text-display mt-2.5 text-3xl text-primary">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <section>
            <h2 className="eyebrow mb-5 block">The problem</h2>
            <p className="text-pretty leading-relaxed text-text-secondary">
              {project.problem}
            </p>
          </section>

          <section>
            <h2 className="eyebrow mb-5 block">The approach</h2>
            <p className="text-pretty leading-relaxed text-text-secondary">
              {project.solution}
            </p>
          </section>
        </div>

        <section className="mt-14">
          <h2 className="eyebrow mb-6 block">Built with</h2>
          <ul className="flex flex-wrap gap-2.5">
            {project.stack.map((t) => (
              <li
                key={t}
                className="plate rounded-full px-4 py-2.5 text-xs text-text-secondary"
              >
                {t}
              </li>
            ))}
          </ul>
        </section>

        {project.evidence && (
          <p className="mt-12 flex items-start gap-3 rounded-sm border border-line bg-surface/60 p-5 text-[11px] leading-relaxed text-text-muted">
            <Info size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
            {project.evidence}
          </p>
        )}

        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="plate btn-depth group mt-10 inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm text-text-primary transition-colors hover:border-primary hover:text-primary"
          >
            <GithubIcon size={14} />
            View source
            <ArrowUpRight
              size={14}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        )}

        <nav className="mt-20 border-t border-line pt-10">
          <p className="eyebrow mb-4 block">Next project</p>
          <Link
            href={`/projects/${next.slug}`}
            className="plate btn-depth group flex flex-wrap items-baseline justify-between gap-4 px-6 py-6 transition-colors hover:border-primary"
          >
            <span className="text-display text-3xl text-text-primary transition-colors duration-300 group-hover:text-primary sm:text-4xl">
              {next.name}
            </span>
            <ArrowUpRight
              size={22}
              aria-hidden="true"
              className="text-text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary"
            />
          </Link>
        </nav>
      </div>
    </article>
  );
}
