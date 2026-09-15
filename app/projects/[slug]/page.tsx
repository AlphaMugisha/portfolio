import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { projects, getProject, statusCopy, coverFor } from "@/lib/projects";
import RevealImage from "@/components/ui/RevealImage";
import Tilt, { TiltLayer } from "@/components/ui/Tilt";
import Deep, { DeepLayer, DeepWord } from "@/components/ui/Deep";
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
    <article
      data-band="dark"
      className="overflow-hidden bg-ink px-6 pb-24 pt-32 sm:px-8 sm:pt-40"
    >
      <div className="mx-auto max-w-5xl">
        {/* Back — a plate, because it is a control you press to travel. */}
        <Reveal>
          <Link
            href="/#projects"
            data-cursor="Back"
            className="plate btn-depth group mb-14 inline-flex items-center gap-2 px-4 py-2.5 meta text-text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            All projects
          </Link>
        </Reveal>

        {/* Header — the same room as the rack the reader came from: the
            project's first word deep on the wall, the title at the focal
            plane, the cover as a mounted plate one step in. */}
        <Deep tilt={1.0} className="relative">
        <DeepWord word={project.name.split(" ")[0]} depth={620} drift={1.1} />
        <header className="relative">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="meta text-text-muted">
                {project.year}
              </span>
              <span className="meta flex items-center gap-2 text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
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
                  className="plate btn-depth meta rounded-full px-3.5 py-1.5 text-primary"
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

        {/* Visual — a physical plate, tilting to meet the pointer, its
            photograph parallaxing inside the mount. */}
        <DeepLayer depth={36} drift={0.35}>
          <div className="mt-14">
            <Tilt max={4} lift={16} className="group relative">
              <span className="pool-light" aria-hidden="true" />
              <div className="plate elevate-high p-2.5 sm:p-3">
                <TiltLayer depth={0.45} className="relative">
                  <RevealImage
                    src={coverFor(project.slug)}
                    alt=""
                    className="aspect-16/9 w-full"
                    sizes="(max-width: 1024px) 100vw, 64rem"
                    priority
                  />
                </TiltLayer>
              </div>
            </Tilt>
          </div>
        </DeepLayer>
        </Deep>

        {/* Stats — small plates, the site's unit of dimensional fact. */}
        {project.stats && (
          <Reveal>
            <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {project.stats.map((s) => (
                <div key={s.label} className="plate btn-depth px-5 py-4">
                  <p className="meta text-text-muted">
                    {s.label}
                  </p>
                  <p className="text-display mt-2.5 text-3xl text-primary">
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
                  className="plate btn-depth rounded-full px-4 py-2.5 text-xs text-text-secondary"
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
              className="plate btn-depth group mt-10 inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm text-text-primary transition-colors hover:border-primary hover:text-primary"
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

        {/* Next project — the next plate down the rack, as a door. */}
        <Reveal>
          <nav className="mt-24 border-t border-line pt-10">
            <p className="eyebrow mb-4 block">Next project</p>
            <Link
              href={`/projects/${next.slug}`}
              data-cursor="Next"
              className="plate btn-depth group flex flex-wrap items-baseline justify-between gap-4 px-6 py-6 hover:border-primary"
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
