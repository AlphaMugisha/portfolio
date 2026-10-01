import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Blob from "@/components/ui/Blob";
import TechIcon from "@/components/ui/TechIcon";
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
    openGraph: { title: project.name, description: project.summary },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="px-6 pb-28 pt-36 lg:pt-44">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#work"
          className="group inline-flex items-center gap-2.5 text-sm font-semibold text-ink-subtle transition-colors hover:text-ink dark:text-ink-invert-muted dark:hover:text-ink-invert"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          All projects
        </Link>

        <ScrollReveal className="mt-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip chip-accent">{statusCopy[project.status]}</span>
            <span className="chip">{project.year}</span>
            {project.categories.slice(0, 2).map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </div>

          <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink md:text-7xl dark:text-ink-invert">
            {project.name}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-ink-muted dark:text-ink-invert-muted">
            {project.summary}
          </p>

          {project.repo ? (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost mt-8 px-7 py-4"
            >
              <GithubIcon size={18} /> View the repository
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ) : null}
        </ScrollReveal>

        <ScrollReveal className="mt-14">
          <div className="glass-card relative overflow-hidden p-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.3rem]">
              <Image
                src={coverFor(project.slug)}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-20 grid gap-12 md:grid-cols-2">
          <ScrollReveal>
            <p className="eyebrow">The problem</p>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted dark:text-ink-invert-muted">
              {project.problem}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <p className="eyebrow">The approach</p>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted dark:text-ink-invert-muted">
              {project.solution}
            </p>
          </ScrollReveal>
        </div>

        {project.stats?.length ? (
          <ScrollReveal className="mt-20">
            <p className="eyebrow">By the numbers</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {project.stats.map((s, i) => (
                <div key={s.label} className="glass-card relative overflow-hidden p-6">
                  <Blob index={i} className="h-28 w-28 -right-6 -top-8" />
                  <p className="relative font-display text-3xl font-semibold text-ink dark:text-ink-invert">
                    {s.value}
                  </p>
                  <p className="relative mt-2 text-[11px] font-bold uppercase tracking-[0.15em] text-ink-subtle dark:text-ink-invert-subtle">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            {project.evidence ? (
              <p className="mt-6 flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white px-5 py-4 text-sm leading-relaxed text-ink-subtle dark:border-white/10 dark:bg-panel-dark dark:text-ink-invert-muted">
                <Info size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                {project.evidence}
              </p>
            ) : null}
          </ScrollReveal>
        ) : null}

        <ScrollReveal className="mt-20">
          <p className="eyebrow">Built with</p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-sm font-semibold text-ink dark:border-white/10 dark:bg-panel-dark dark:text-ink-invert"
              >
                <TechIcon name={tech} size={20} />
                {tech}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal className="mt-24">
          <p className="eyebrow">Next project</p>
          <Link
            href={`/projects/${next.slug}`}
            className="glass-card lift group mt-5 flex items-center justify-between gap-6 p-8"
          >
            <span>
              <span className="block font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl dark:text-ink-invert">
                {next.name}
              </span>
              <span className="mt-2 block text-ink-subtle dark:text-ink-invert-muted">
                {next.summary}
              </span>
            </span>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight size={20} aria-hidden="true" />
            </span>
          </Link>
        </ScrollReveal>
      </div>
    </article>
  );
}
