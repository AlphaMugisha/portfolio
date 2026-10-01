import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Check,
  Code2,
  Cpu,
  Database,
  Mail,
  MapPin,
  Sparkles,
  Workflow,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import FeatureCard from "@/components/ui/FeatureCard";
import ProjectCard from "@/components/ui/ProjectCard";
import LaptopMockup from "@/components/ui/LaptopMockup";
import TechIcon from "@/components/ui/TechIcon";
import Blob, { BLOB_SHAPES } from "@/components/ui/Blob";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { projects, featuredProjects, coverFor } from "@/lib/projects";
import { skillGroups } from "@/lib/skills";
import { journey } from "@/lib/journey";
import { site } from "@/lib/site";

/* ============================================================
   ABOUT
   ============================================================ */

export function About() {
  const technologies = skillGroups.reduce((n, g) => n + g.skills.length, 0);
  const stats = [
    { v: String(projects.length).padStart(2, "0"), l: "Projects shipped" },
    { v: String(technologies), l: "Technologies" },
    { v: "04", l: "Disciplines" },
  ];

  return (
    <section id="about" className="scroll-mt-28 px-6 pt-24 lg:pt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <ScrollReveal direction="right" className="relative">
          {/* The splash sits BEHIND the portrait and slightly larger than it,
              so a sliver of colour shows at every edge. That halo is what
              stops a square photograph reading as a stock image dropped on
              the page. */}
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 bg-accent/35 dark:bg-accent/20"
            style={{ borderRadius: BLOB_SHAPES[1] }}
          />
          <div className="relative overflow-hidden rounded-[2.5rem] border border-black/[0.06] shadow-[var(--shadow-float-lg)] dark:border-white/10">
            <Image
              src="/images/portrait.jpg"
              alt={`${site.name}, ${site.role}`}
              width={920}
              height={920}
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-6 inline-flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 text-xs font-semibold text-ink shadow-xl dark:border-white/10 dark:bg-panel-dark dark:text-ink-invert">
            <MapPin size={14} className="text-accent" /> {site.location}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="left">
          <p className="eyebrow">Meet {site.shortName}</p>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-tight text-ink md:text-6xl dark:text-ink-invert">
            Hello, I&apos;m{" "}
            <span className="text-accent-deep dark:text-accent">{site.shortName}.</span>
          </h2>

          <div className="mt-7 max-w-xl space-y-5 text-lg leading-relaxed text-ink-muted dark:text-ink-invert-muted">
            <p>
              My work begins with the data. Before a screen exists there is a schema, a
              set of roles, and a clear idea of who needs to do what. That discipline
              came from starting with hardware, where a system either behaves correctly
              or visibly does not.
            </p>
            <p>
              Since then I have built web platforms, REST APIs, administrative
              dashboards and connected devices — React, Next.js and TypeScript on the
              front, Node, Laravel and PHP behind them, over PostgreSQL, MySQL and
              SQLite.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-panel-dark"
              >
                <p className="font-display text-3xl font-semibold text-ink dark:text-ink-invert">
                  {s.v}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-ink-subtle dark:text-ink-invert-subtle">
                  {s.l}
                </p>
              </div>
            ))}
          </div>

          <Link href="/#journey" className="btn-dark group mt-9 py-4 pl-8 pr-5">
            The full story
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-ink transition-transform group-hover:rotate-45">
              <ArrowUpRight size={16} />
            </span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ============================================================
   WHAT I DO
   ============================================================ */

const AREAS = [
  {
    icon: <Code2 />,
    title: "Full-stack web",
    desc: "Next.js, React and TypeScript over PostgreSQL and Prisma. Auth, uploads, dashboards and the unglamorous parts that make an app real.",
    tile: "bg-accent text-accent-ink",
  },
  {
    icon: <Cpu />,
    title: "Embedded systems",
    desc: "ESP32 and Arduino with real sensors and actuators. Firmware that reads its environment, decides, and reports back to something online.",
    tile: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
  },
  {
    icon: <Sparkles />,
    title: "Applied AI",
    desc: "Models as engineering tools, not a talking point: API integration, coding agents, local inference and tool protocols like MCP.",
    tile: "bg-accent-bright text-accent-ink",
  },
  {
    icon: <Database />,
    title: "Databases & APIs",
    desc: "Schemas with real constraints, role-scoped access, versioned REST endpoints and migrations that survive contact with production.",
    tile: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
  },
  {
    icon: <Bot />,
    title: "Robotics & IoT",
    desc: "Microcontrollers, relays, servos and RFID. Physical systems that move, with the cloud side built to match.",
    tile: "bg-accent text-accent-ink",
  },
  {
    icon: <Workflow />,
    title: "Systems for institutions",
    desc: "School portals, libraries, point-of-sale. Small organisations rarely get purpose-built software — several of these were built so they could.",
    tile: "bg-accent-bright text-accent-ink",
  },
];

export function WhatIDo() {
  return (
    <section id="what-i-do" className="scroll-mt-28 px-6 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="max-w-3xl">
          <p className="eyebrow">What I do</p>
          <h2 className="mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink md:text-7xl dark:text-ink-invert">
            Built across the whole{" "}
            <span className="text-accent-deep dark:text-accent">stack, and below it.</span>
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-ink-muted dark:text-ink-invert-muted">
            From a database schema to a relay on a breadboard. I take ideas from concept
            to prototype to something other people can actually use, learning whatever
            the project needs on the way.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a, i) => (
            <ScrollReveal key={a.title} delay={(i % 3) * 0.08}>
              <FeatureCard
                icon={a.icon}
                title={a.title}
                desc={a.desc}
                index={i}
                tile={a.tile}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SELECTED WORK
   ============================================================ */

export function SelectedWork() {
  const lead = featuredProjects[0] ?? projects[0];
  const points = projects.slice(0, 3);

  return (
    <section id="work" className="scroll-mt-28 px-6 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <ScrollReveal direction="right">
          <p className="eyebrow">Selected work</p>
          <h2 className="mb-8 mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink md:text-6xl dark:text-ink-invert">
            Real projects,{" "}
            <span className="text-accent-deep dark:text-accent">really shipped.</span>
          </h2>

          <div className="space-y-7">
            {points.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="group flex gap-4">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-[0_8px_20px_-6px_rgba(254,176,2,0.7)]">
                  <Check size={16} strokeWidth={3} />
                </span>
                <div>
                  <h3 className="mb-1 font-display text-xl font-semibold text-ink transition-colors group-hover:text-accent-deep dark:text-ink-invert dark:group-hover:text-accent">
                    {p.name}
                  </h3>
                  <p className="leading-relaxed text-ink-subtle dark:text-ink-invert-muted">
                    {p.summary}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="left" className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 bg-accent/30 dark:bg-accent/15"
            style={{ borderRadius: BLOB_SHAPES[2] }}
          />
          <LaptopMockup
            src={coverFor(lead.slug)}
            alt={`${lead.name} cover`}
            label={lead.name}
          />
        </ScrollReveal>
      </div>
    </section>
  );
}

/* ============================================================
   PROJECT GRID
   ============================================================ */

export function ProjectGrid() {
  return (
    <section className="px-6 py-12 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Everything</p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl dark:text-ink-invert">
              Click one to see how it was built.
            </h2>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-subtle dark:text-ink-invert-subtle">
            {projects.length} projects
          </p>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ScrollReveal key={p.slug} delay={(i % 3) * 0.08} className="h-full">
              <ProjectCard project={p} index={i} priority={i < 3} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TOOLBOX
   ============================================================ */

export function Toolbox() {
  const total = skillGroups.reduce((n, g) => n + g.skills.length, 0);

  return (
    <section id="toolbox" className="scroll-mt-28 px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="max-w-3xl">
          <p className="eyebrow">Toolbox</p>
          <h2 className="mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink md:text-6xl dark:text-ink-invert">
            The tools I{" "}
            <span className="text-accent-deep dark:text-accent">actually use.</span>
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-ink-muted dark:text-ink-invert-muted">
            {total} technologies across four disciplines. No percentages anywhere —
            a rating out of ten would be invented, so each one says what it is used
            for instead.
          </p>
        </ScrollReveal>

        <div className="mt-14 flex flex-col gap-12">
          {skillGroups.map((group, gi) => (
            <ScrollReveal key={group.id} delay={(gi % 3) * 0.06}>
              <div className="flex items-baseline gap-4">
                <span className="eyebrow">{group.title}</span>
                <span className="rule-fade flex-1" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-subtle dark:text-ink-invert-subtle">
                  {group.index}
                </span>
              </div>
              <p className="mt-3 text-ink-subtle dark:text-ink-invert-muted">
                {group.blurb}
              </p>

              <ul className="mt-6 flex flex-wrap gap-3" aria-label={group.title}>
                {group.skills.map((skill) => (
                  <li key={skill.name} className="group/tech relative">
                    <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[1.3rem] border border-black/[0.06] bg-white text-ink shadow-[0_18px_40px_-30px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:-translate-y-1.5 dark:border-white/10 dark:bg-panel-dark dark:text-ink-invert">
                      <TechIcon name={skill.name} size={34} />
                    </div>
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 transition-opacity group-hover/tech:opacity-100 group-focus-within/tech:opacity-100 dark:bg-white dark:text-neutral-900">
                      {skill.name} — {skill.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   JOURNEY
   ============================================================ */

export function Journey() {
  return (
    <section id="journey" className="scroll-mt-28 px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="max-w-3xl">
          <p className="eyebrow">How it developed</p>
          <h2 className="mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink md:text-6xl dark:text-ink-invert">
            How I got <span className="text-accent-deep dark:text-accent">here.</span>
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-ink-muted dark:text-ink-invert-muted">
            Four stages, in the order they happened. Each one is still in use — the
            hardware habits did not stop being useful once the work moved to the web.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {journey.map((entry, i) => (
            <ScrollReveal key={entry.period} delay={(i % 2) * 0.08} className="h-full">
              <article className="glass-card lift relative flex h-full flex-col overflow-hidden">
                <Blob index={i + 2} />

                <div className="relative m-4 mb-0 overflow-hidden rounded-[1.3rem]">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={entry.image}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-ink">
                      {entry.period}
                    </span>
                  </div>
                </div>

                <div className="relative flex flex-1 flex-col p-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-subtle dark:text-ink-invert-subtle">
                    {entry.discipline}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink dark:text-ink-invert">
                    {entry.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-ink-subtle dark:text-ink-invert-muted">
                    {entry.body}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    {entry.highlights.map((h) => (
                      <span key={h} className="chip">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BEYOND — the one dark panel inside the light theme
   ============================================================ */

export function Beyond() {
  const highlights = [
    {
      title: "Hardware first",
      description: "Circuits before screens — a system either behaves or visibly does not.",
      icon: <Cpu size={15} />,
    },
    {
      title: "Built for institutions",
      description: "Schools, a library, a church, a restaurant. Real users, real constraints.",
      icon: <Workflow size={15} />,
    },
    {
      title: "Still learning",
      description: "Every project adds a technology I had not shipped before.",
      icon: <Sparkles size={15} />,
    },
  ];

  return (
    <section id="beyond" className="scroll-mt-28 px-6 py-20 lg:py-28">
      <ScrollReveal className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-neutral-900 to-black px-8 py-16 text-white md:p-16 lg:p-20">
          {/* Two wide amber glows and a dot grid. On a near-black panel this
              is the one place the accent can be used at full strength as pure
              light rather than as a fill with something written on it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 right-10 h-[440px] w-[440px] rounded-full bg-accent/25 blur-[130px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-[440px] w-[440px] rounded-full bg-accent/10 blur-[130px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:22px_22px]"
          />

          <div className="relative z-10 grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
                <Sparkles size={14} /> How I work
              </p>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-[0.98] tracking-tight md:text-6xl">
                Start with the data.<br />Finish with what ships.
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-300">
                Every metric on this site was read off a running system, not estimated.
                If a project has no verified numbers, it shows none — which is the same
                standard I hold the code to.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {highlights.map((h) => (
                  <span
                    key={h.title}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-neutral-200"
                  >
                    <span className="text-accent">{h.icon}</span>
                    {h.title}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-sm lg:ml-auto">
              <div className="rounded-[1.9rem] border border-white/15 bg-white/[0.05] p-7 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <div className="mb-7 flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>
                <div className="space-y-4">
                  {highlights.map((h) => (
                    <div
                      key={h.title}
                      className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink">
                        {h.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-100">{h.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">
                          {h.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-neutral-400">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={12} className="text-accent" /> {site.location}
                  </span>
                  <span className="font-semibold text-neutral-200">Open to new work</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}

/* ============================================================
   CLOSING CTA
   ============================================================ */

export function ClosingCta() {
  return (
    <section id="contact" className="scroll-mt-28 px-6 pb-32 pt-10 text-center">
      <ScrollReveal className="mx-auto max-w-3xl">
        <h2 className="font-display text-5xl font-semibold leading-[0.95] tracking-tight text-ink md:text-7xl dark:text-ink-invert">
          Let&apos;s build{" "}
          <span className="text-accent-deep dark:text-accent">something.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-xl leading-relaxed text-ink-muted dark:text-ink-invert-muted">
          Freelance work, full-time roles, collaboration, or a question about how
          something here was built. I reply.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <a href={`mailto:${site.email}`} className="btn-accent px-12 py-5 text-lg">
            <span className="relative z-10 inline-flex items-center gap-2">
              <Mail size={20} /> {site.email}
            </span>
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost px-10 py-5 text-lg"
          >
            <GithubIcon size={20} /> GitHub
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
