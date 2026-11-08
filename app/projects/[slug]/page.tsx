import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import Reveal from "@/components/ui/Reveal";
import KineticText from "@/components/ui/KineticText";
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

/**
 * A case study, laid out as a specification sheet.
 *
 * The page answers the eight questions in a fixed order — what it is,
 * the problem, the approach, the verified numbers, what it was built
 * with, its status, and where to see the source — so the eight studies
 * are comparable against each other rather than each being its own
 * shape. The sheet header carries the registers; the body carries the
 * argument.
 *
 * Numbers only appear where the project actually has them, and each
 * set is followed by the note saying where they were read from. A
 * project with nothing verified shows no figures rather than filler.
 */
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
          className="group inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.12em] text-text-muted transition-colors hover:text-signal"
          data-cursor-label="Back"
        >
          <ArrowLeft
            size={15}
            className="transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          All projects
        </Link>

        {/* Sheet header */}
        <header className="mt-10">
          <div className="flex items-center gap-4">
            <span className="note note-signal shrink-0">
              <span className="text-text-subtle">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(all.length).padStart(2, "0")}
              </span>{" "}
              Case study
            </span>
            <span className="h-px flex-1 bg-rule" aria-hidden="true" />
          </div>

          <h1 className="mt-6 text-display-md font-display font-semibold text-text">
            <KineticText text={project.name} as="span" />
          </h1>

          <Reveal variant="rise" delay={0.25}>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-text-muted">
              {project.summary}
            </p>

            <dl className="mt-9 grid grid-cols-2 gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-4">
              {[
                { k: "Status", v: STATUS_LABEL[project.status], signal: true },
                { k: "Year", v: project.year },
                { k: "Domain", v: project.categories[0] ?? "—" },
                { k: "Stack depth", v: `${project.stack.length} technologies` },
              ].map((row) => (
                <div key={row.k} className="bg-ink px-4 py-3.5">
                  <dt className="note">{row.k}</dt>
                  <dd
                    className={`mt-1 text-sm font-medium ${
                      row.signal ? "text-signal" : "text-text"
                    }`}
                  >
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>

            {project.repo_url ? (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost mt-8"
                data-cursor-label="GitHub"
              >
                <GithubIcon size={16} />
                <span>View the repository</span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            ) : null}
          </Reveal>
        </header>

        <Reveal variant="unmask" className="mt-14 overflow-hidden">
          <div className="board board-lg relative p-3">
            <span className="ticks" />
            <div className="relative aspect-[16/10] overflow-hidden border border-rule">
              {cover ? (
                <Image
                  src={cover}
                  alt={`${project.name} cover`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 960px, 100vw"
                  className="object-cover"
                />
              ) : null}
            </div>
          </div>
        </Reveal>

        <div className="mt-20 grid gap-12 md:grid-cols-2">
          <Reveal variant="rise">
            <p className="note note-signal">The problem</p>
            <p className="mt-5 text-lg leading-relaxed text-text-muted">{project.problem}</p>
          </Reveal>
          <Reveal variant="rise" delay={0.1}>
            <p className="note note-signal">The approach</p>
            <p className="mt-5 text-lg leading-relaxed text-text-muted">{project.solution}</p>
          </Reveal>
        </div>

        {project.stats.length ? (
          <section className="mt-20">
            <Reveal variant="rise">
              <p className="note note-signal">By the numbers</p>
            </Reveal>
            <Reveal
              variant="stack"
              className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              stagger={0.08}
            >
              {project.stats.map((stat) => (
                <div key={stat.label} className="board board-sm relative p-6">
                  <span className="ticks" />
                  <p className="font-display text-3xl font-semibold text-signal">
                    <Counter value={stat.value} />
                  </p>
                  <p className="note mt-2">{stat.label}</p>
                </div>
              ))}
            </Reveal>
            {project.evidence ? (
              <Reveal variant="rise" delay={0.1}>
                <p className="mt-6 flex items-start gap-3 border border-rule bg-ink-raised px-5 py-4 text-sm leading-relaxed text-text-muted">
                  <Info size={16} className="mt-0.5 shrink-0 text-signal" aria-hidden="true" />
                  {project.evidence}
                </p>
              </Reveal>
            ) : null}
          </section>
        ) : null}

        <section className="mt-20">
          <Reveal variant="rise">
            <p className="note note-signal">Built with</p>
          </Reveal>
          <Reveal variant="stack" className="mt-6 flex flex-wrap gap-3" stagger={0.04}>
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="group flex items-center gap-3 border border-rule bg-ink-raised px-4 py-3 text-sm font-medium text-text transition-colors hover:border-signal-deep"
              >
                <TechIcon name={tech} size={19} />
                {tech}
              </span>
            ))}
          </Reveal>
        </section>

        <section className="mt-24">
          <Reveal variant="rise">
            <p className="note note-signal">Next project</p>
          </Reveal>
          <Reveal variant="wipe" delay={0.08}>
            <Link
              href={`/projects/${next.slug}`}
              className="board board-lg group relative mt-5 flex items-center justify-between gap-6 p-8 transition-colors hover:bg-ink-high"
              data-cursor-label="Open"
            >
              <span className="ticks" />
              <span>
                <span className="block font-display text-3xl font-semibold tracking-tight text-text transition-colors group-hover:text-signal sm:text-4xl">
                  {next.name}
                </span>
                <span className="mt-2 block max-w-xl text-text-muted">{next.summary}</span>
              </span>
              <span className="grid h-12 w-12 shrink-0 place-items-center border border-rule text-text-muted transition-all duration-500 group-hover:rotate-45 group-hover:border-signal group-hover:text-signal">
                <ArrowUpRight size={20} aria-hidden="true" />
              </span>
            </Link>
          </Reveal>
        </section>
      </div>
    </article>
  );
}
