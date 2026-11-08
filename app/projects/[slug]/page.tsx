import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Counter from "@/components/ui/Counter";
import TechIcon from "@/components/ui/TechIcon";
import { getProject, getProjects } from "@/lib/db/public";
import { mediaUrl } from "@/lib/supabase/env";
import { STATUS_LABEL } from "@/lib/utils/format";
import { projects as staticProjects } from "@/lib/projects";

/** Static params so every case study is prerendered at build time. */
export function generateStaticParams() {
  return staticProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.name,
    description: project.summary,
    openGraph: { title: project.name, description: project.summary },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();

  const index = all.findIndex((p) => p.slug === slug);
  const next = all[(index + 1) % all.length];
  const cover = mediaUrl(project.cover_path);

  return (
    <article className="px-6 pb-28 pt-32 lg:pt-40">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#work-grid"
          className="group inline-flex items-center gap-2.5 font-mono text-sm text-text-muted transition-colors hover:text-signal"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          All projects
        </Link>

        <ScrollReveal className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="tag tag-signal">{STATUS_LABEL[project.status]}</span>
            <span className="tag">{project.year}</span>
            {project.categories.slice(0, 2).map((c) => (
              <span key={c} className="tag">
                {c}
              </span>
            ))}
          </div>

          <h1 className="mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-text md:text-7xl">
            {project.name}
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-relaxed text-text-muted">{project.summary}</p>

          {project.repo_url ? (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-8">
              <GithubIcon size={18} /> View the repository
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ) : null}
        </ScrollReveal>

        <ScrollReveal className="mt-14">
          <div className="panel relative overflow-hidden p-3">
            <span className="panel-marks" />
            <div className="relative aspect-[16/10] overflow-hidden border border-rule">
              {cover ? (
                <Image src={cover} alt="" fill priority sizes="(min-width: 1024px) 960px, 100vw" className="object-cover" />
              ) : null}
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-20 grid gap-12 md:grid-cols-2">
          <ScrollReveal>
            <p className="eyebrow">The problem</p>
            <p className="mt-5 text-lg leading-relaxed text-text-muted">{project.problem}</p>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <p className="eyebrow">The approach</p>
            <p className="mt-5 text-lg leading-relaxed text-text-muted">{project.solution}</p>
          </ScrollReveal>
        </div>

        {project.stats.length ? (
          <ScrollReveal className="mt-20">
            <p className="eyebrow">By the numbers</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {project.stats.map((s) => (
                <div key={s.label} className="panel relative overflow-hidden p-6">
                  <span className="panel-marks" />
                  <p className="relative font-display text-3xl font-semibold text-signal">
                    <Counter value={s.value} />
                  </p>
                  <p className="relative mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-text-subtle">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
            {project.evidence ? (
              <p className="mt-6 flex items-start gap-3 border border-rule bg-ink-panel px-5 py-4 text-sm leading-relaxed text-text-muted">
                <Info size={16} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                {project.evidence}
              </p>
            ) : null}
          </ScrollReveal>
        ) : null}

        <ScrollReveal className="mt-20">
          <p className="eyebrow">Built with</p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {project.stack.map((tech) => (
              <li key={tech} className="flex items-center gap-3 border border-rule bg-ink-panel px-4 py-3 text-sm font-medium text-text">
                <TechIcon name={tech} size={20} />
                {tech}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal className="mt-24">
          <p className="eyebrow">Next project</p>
          <Link href={`/projects/${next.slug}`} className="panel lift group mt-5 flex items-center justify-between gap-6 p-8">
            <span className="panel-marks" />
            <span>
              <span className="block font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                {next.name}
              </span>
              <span className="mt-2 block text-text-muted">{next.summary}</span>
            </span>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-rule text-text-muted transition-all duration-300 group-hover:rotate-45 group-hover:border-signal group-hover:text-signal">
              <ArrowUpRight size={20} aria-hidden="true" />
            </span>
          </Link>
        </ScrollReveal>
      </div>
    </article>
  );
}
