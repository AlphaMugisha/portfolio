import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { projects, getProject, statusCopy, coverFor } from "@/lib/projects";
import RevealImage from "@/components/ui/RevealImage";
import { Reveal } from "@/components/ui/motion-primitives";

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
    <article className="px-6 pb-24 pt-32 sm:px-8 sm:pt-40">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <Reveal>
          <Link
            href="/#projects"
            className="group mb-14 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            All projects
          </Link>
        </Reveal>

        {/* Header */}
        <header>
          <Reveal>
            <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-text-muted">
                {project.year}
              </span>
              <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                {statusCopy[project.status]}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-display text-[clamp(2.25rem,6.5vw,4.75rem)] text-text-primary">
              {project.name}
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-7 flex flex-wrap gap-2">
              {project.categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-line-strong px-3 py-1 font-sans text-[10px] uppercase tracking-[0.14em] text-accent-text"
                >
                  {c}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-text-secondary">
              {project.summary}
            </p>
          </Reveal>
        </header>

        {/* Visual */}
        <div className="mt-14">
          <RevealImage
            src={coverFor(project.slug)}
            alt=""
            className="aspect-16/9 w-full"
            sizes="(max-width: 1024px) 100vw, 64rem"
            priority
          />
        </div>

        {/* Stats */}
        {project.stats && (
          <Reveal>
            <div className="mt-14 grid grid-cols-2 gap-8 border-y border-line py-10 sm:grid-cols-4">
              {project.stats.map((s) => (
                <div key={s.label}>
                  <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-text-muted">
                    {s.label}
                  </p>
                  <p className="text-display mt-2 text-3xl text-text-primary">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Problem / solution */}
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <section>
              <h2 className="eyebrow mb-5 block">The problem</h2>
              <p className="text-pretty leading-relaxed text-text-secondary">
                {project.problem}
              </p>
            </section>
          </Reveal>

          <Reveal delay={0.06}>
            <section>
              <h2 className="eyebrow mb-5 block">The approach</h2>
              <p className="text-pretty leading-relaxed text-text-secondary">
                {project.solution}
              </p>
            </section>
          </Reveal>
        </div>

        {/* Stack */}
        <Reveal>
          <section className="mt-16">
            <h2 className="eyebrow mb-6 block">Built with</h2>
            <ul className="flex flex-wrap gap-2.5">
              {project.stack.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-line-strong px-4 py-2.5 font-sans text-xs text-text-secondary"
                >
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* Evidence note - keeps the numbers accountable */}
        {project.evidence && (
          <Reveal>
            <p className="mt-12 flex items-start gap-3 rounded-sm border border-line bg-surface/60 p-5 text-[11px] leading-relaxed text-text-muted">
              <Info size={14} className="mt-0.5 shrink-0" />
              {project.evidence}
            </p>
          </Reveal>
        )}

        {/* Repo */}
        {project.repo && (
          <Reveal>
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-10 inline-flex items-center gap-2.5 rounded-full border border-line-strong px-6 py-3 text-sm text-text-primary transition-colors hover:border-primary hover:text-primary"
            >
              <GithubIcon size={14} />
              View source
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </Reveal>
        )}

        {/* Next project */}
        <Reveal>
          <nav className="mt-24 border-t border-line pt-10">
            <p className="eyebrow mb-4 block">Next project</p>
            <Link
              href={`/projects/${next.slug}`}
              className="group flex flex-wrap items-baseline justify-between gap-4"
            >
              <span className="text-display text-3xl text-text-primary transition-colors duration-300 group-hover:text-primary sm:text-5xl">
                {next.name}
              </span>
              <ArrowUpRight
                size={22}
                className="text-text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary"
              />
            </Link>
          </nav>
        </Reveal>
      </div>
    </article>
  );
}
