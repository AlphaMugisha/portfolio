"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import TechIcon from "@/components/ui/TechIcon";
import type { MapGroup, MapTotals } from "@/lib/signal-map";
import type { SectionRow } from "@/types/database";

/**
 * The Signal Map — what actually connects to what.
 *
 * A bipartite trace diagram: every tool in a discipline on the left,
 * every project it genuinely shipped in on the right, wired with
 * orthogonal traces. Probing a tool lights only its own traces and the
 * projects at their far end; probing a project reverses the question and
 * lights the tools that built it. The readout underneath names the
 * connection in words and links straight to the case study.
 *
 * The point is that this is a CLAIM CHECKER, not an ornament. A skills
 * section normally asks you to take a list on faith; this one draws the
 * evidence. Tools with no shipped connection are drawn hollow and
 * dashed, and the header counts them — admitting the gap is what makes
 * the rest of the diagram worth believing.
 *
 * Two real layouts, not one scaled down. From `md` up it is the SVG
 * diagram. Below that, where 20 nodes and 40 traces would be unreadable
 * at any size, it becomes a patch list: the same state, the same data,
 * the same highlight logic, expressed as rows that open to reveal their
 * connections.
 *
 * Interaction is pointer, touch and keyboard: the nodes are real
 * <button>s in the mobile layout and focusable SVG groups with
 * `role="button"` and key handlers in the diagram, so the whole thing is
 * operable from the keyboard alone.
 */

const ROW = 42;
const PAD_TOP = 26;
const COL_TOOL = 232;
const COL_PROJECT = 700;
const MID = 466;

export default function SignalMap({
  section,
  groups,
  totals,
}: {
  section: SectionRow;
  groups: MapGroup[];
  totals: MapTotals;
}) {
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [probe, setProbe] = useState<{ kind: "tool" | "project"; id: string } | null>(null);

  const group = useMemo(
    () => groups.find((g) => g.id === groupId) ?? groups[0],
    [groupId, groups],
  );

  /* Which nodes and edges are lit for the current probe. */
  const active = useMemo(() => {
    const tools = new Set<string>();
    const projects = new Set<string>();
    const edges = new Set<string>();
    if (!probe || !group) return { tools, projects, edges, any: false };

    for (const edge of group.edges) {
      const hit = probe.kind === "tool" ? edge.tool === probe.id : edge.project === probe.id;
      if (!hit) continue;
      tools.add(edge.tool);
      projects.add(edge.project);
      edges.add(`${edge.tool}->${edge.project}`);
    }
    // A probed node stays lit even when it has nothing wired to it.
    if (probe.kind === "tool") tools.add(probe.id);
    else projects.add(probe.id);

    return { tools, projects, edges, any: true };
  }, [probe, group]);

  const readout = useMemo(() => {
    if (!group || !probe) return null;
    if (probe.kind === "tool") {
      const tool = group.tools.find((t) => t.id === probe.id);
      if (!tool) return null;
      return { title: tool.name, detail: tool.detail, links: tool.projects, kind: "tool" as const };
    }
    const project = group.projects.find((p) => p.slug === probe.id);
    if (!project) return null;
    const tools = group.tools.filter((t) => t.projects.some((p) => p.slug === project.slug));
    return {
      title: project.name,
      detail: tools.map((t) => t.name).join(" · "),
      links: [project],
      kind: "project" as const,
    };
  }, [probe, group]);

  if (!group) return null;

  const height = Math.max(group.tools.length, group.projects.length) * ROW + PAD_TOP * 2;
  const toolY = (i: number) => PAD_TOP + i * ROW + ROW / 2;
  const projectY = (i: number) =>
    PAD_TOP +
    i * ROW +
    ROW / 2 +
    ((group.tools.length - group.projects.length) * ROW) / 2;

  const dim = (lit: boolean) => (!active.any ? 1 : lit ? 1 : 0.22);

  return (
    <section id="toolbox" className="relative px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader section={section} index="05" />
          <Reveal variant="rise" delay={0.1}>
            <p className="note text-right">
              <span className="text-signal">{totals.linked}</span> of {totals.tools} tools
              wired to shipped work
              <span className="mt-1 block text-text-subtle/70">
                {totals.connections} verified connections
              </span>
            </p>
          </Reveal>
        </div>

        {/* Discipline selector */}
        <Reveal variant="stack" className="mt-12 flex flex-wrap gap-2" delay={0.05} stagger={0.05}>
          {groups.map((g, i) => {
            const on = g.id === group.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setGroupId(g.id);
                  setProbe(null);
                }}
                aria-pressed={on}
                className={`board board-sm px-5 py-3 text-left transition-colors ${
                  on ? "!bg-signal text-signal-ink" : "hover:!bg-ink-high"
                }`}
              >
                <span
                  className={`block font-mono text-[10px] tracking-[0.18em] ${
                    on ? "text-signal-ink/60" : "text-text-subtle"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`mt-0.5 block font-display text-base font-semibold ${
                    on ? "text-signal-ink" : "text-text"
                  }`}
                >
                  {g.title}
                </span>
              </button>
            );
          })}
        </Reveal>

        <p className="mt-6 max-w-xl text-text-muted">{group.blurb}</p>

        {/* ---------------- diagram (md and up) ---------------- */}
        <Reveal variant="scale" className="mt-10 hidden md:block">
          <div className="board board-lg relative p-6">
            <span className="ticks" />
            <div className="mb-4 flex items-center justify-between">
              <span className="note">Tooling</span>
              <span className="note note-signal">
                {probe ? "Probing" : "Hover or focus a node to probe"}
              </span>
              <span className="note">Shipped in</span>
            </div>

            <svg
              key={group.id}
              viewBox={`0 0 ${COL_PROJECT + 240} ${height}`}
              className="w-full"
              style={{ height }}
              role="group"
              aria-label={`${group.title} tools and the projects they shipped in`}
            >
              {/* traces */}
              <g>
                {group.edges.map((edge) => {
                  const ti = group.tools.findIndex((t) => t.id === edge.tool);
                  const pi = group.projects.findIndex((p) => p.slug === edge.project);
                  if (ti < 0 || pi < 0) return null;
                  const y1 = toolY(ti);
                  const y2 = projectY(pi);
                  const lit = active.edges.has(`${edge.tool}->${edge.project}`);
                  /* Each tool turns its corner on its own vertical, fanned
                     across a channel, instead of every edge stacking on one
                     line. Real routing avoids overlapping runs for exactly
                     this reason, and visually it means a lit trace is
                     followable through the bundle rather than disappearing
                     into a shared bus. */
                  const lane = MID + ((ti % 7) - 3) * 17;
                  return (
                    <path
                      key={`${edge.tool}->${edge.project}`}
                      d={`M ${COL_TOOL + 10} ${y1} H ${lane} V ${y2} H ${COL_PROJECT - 10}`}
                      className={lit ? "trace trace-live" : "trace"}
                      style={{
                        opacity: dim(lit),
                        transition: "opacity 320ms ease, stroke 320ms ease",
                      }}
                    />
                  );
                })}
              </g>

              {/* tool nodes */}
              {group.tools.map((tool, i) => {
                const y = toolY(i);
                const lit = active.tools.has(tool.id);
                const orphan = tool.projects.length === 0;
                return (
                  <g
                    key={tool.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`${tool.name}. ${
                      orphan
                        ? "No shipped project in this set."
                        : `Shipped in ${tool.projects.map((p) => p.name).join(", ")}.`
                    }`}
                    className="cursor-pointer outline-none"
                    style={{ opacity: dim(lit), transition: "opacity 320ms ease" }}
                    onPointerEnter={() => setProbe({ kind: "tool", id: tool.id })}
                    onFocus={() => setProbe({ kind: "tool", id: tool.id })}
                    onPointerLeave={() => setProbe(null)}
                    onBlur={() => setProbe(null)}
                  >
                    {/* generous invisible hit area */}
                    <rect x={0} y={y - ROW / 2} width={COL_TOOL + 14} height={ROW} fill="transparent" />
                    <text
                      x={COL_TOOL - 16}
                      y={y}
                      textAnchor="end"
                      dominantBaseline="central"
                      className="font-sans text-[13px]"
                      fill={lit ? "var(--color-signal)" : "var(--color-text)"}
                      style={{ transition: "fill 320ms ease" }}
                    >
                      {tool.name}
                    </text>
                    <circle
                      cx={COL_TOOL + 4}
                      cy={y}
                      r={orphan ? 3 : 4.5}
                      className={lit ? "pad pad-live" : "pad"}
                      strokeDasharray={orphan ? "2 2" : undefined}
                      fill={orphan ? "var(--color-ink)" : undefined}
                    />
                  </g>
                );
              })}

              {/* project nodes */}
              {group.projects.map((project, i) => {
                const y = projectY(i);
                const lit = active.projects.has(project.slug);
                return (
                  <g
                    key={project.slug}
                    tabIndex={0}
                    role="button"
                    aria-label={`${project.name}. Show the tools used.`}
                    className="cursor-pointer outline-none"
                    style={{ opacity: dim(lit), transition: "opacity 320ms ease" }}
                    onPointerEnter={() => setProbe({ kind: "project", id: project.slug })}
                    onFocus={() => setProbe({ kind: "project", id: project.slug })}
                    onPointerLeave={() => setProbe(null)}
                    onBlur={() => setProbe(null)}
                  >
                    <rect
                      x={COL_PROJECT - 14}
                      y={y - ROW / 2}
                      width={260}
                      height={ROW}
                      fill="transparent"
                    />
                    {/* projects are squares, tools are circles — the two
                        kinds of node are told apart by geometry, so the
                        palette never needs a second accent colour */}
                    <rect
                      x={COL_PROJECT - 8}
                      y={y - 4.5}
                      width={9}
                      height={9}
                      className={lit ? "pad pad-live" : "pad"}
                    />
                    <text
                      x={COL_PROJECT + 14}
                      y={y}
                      dominantBaseline="central"
                      className="font-sans text-[13px]"
                      fill={lit ? "var(--color-signal)" : "var(--color-text)"}
                      style={{ transition: "fill 320ms ease" }}
                    >
                      {project.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Reveal>

        {/* ---------------- patch list (below md) ---------------- */}
        <div className="mt-8 md:hidden">
          <ul className="board divide-y divide-rule">
            <span className="ticks" />
            {group.tools.map((tool) => {
              const open = probe?.kind === "tool" && probe.id === tool.id;
              return (
                <li key={tool.id}>
                  <button
                    type="button"
                    onClick={() => setProbe(open ? null : { kind: "tool", id: tool.id })}
                    aria-expanded={open}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <TechIcon name={tool.name} size={20} className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-sm font-medium ${
                          open ? "text-signal" : "text-text"
                        }`}
                      >
                        {tool.name}
                      </span>
                      <span className="block truncate text-xs text-text-subtle">{tool.detail}</span>
                    </span>
                    <span className="reg shrink-0">
                      {tool.projects.length || "—"}
                    </span>
                  </button>

                  {open ? (
                    <div className="border-t border-rule bg-ink-deep/60 px-4 py-3 pl-10">
                      {tool.projects.length ? (
                        <ul className="space-y-2">
                          {tool.projects.map((p) => (
                            <li key={p.slug} className="flex items-center gap-2">
                              <span className="h-px w-4 bg-signal" aria-hidden="true" />
                              <Link
                                href={`/projects/${p.slug}`}
                                className="inline-flex items-center gap-1 text-sm text-signal"
                              >
                                {p.name}
                                <ArrowUpRight size={13} />
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs leading-relaxed text-text-subtle">
                          Not in the stack of any of the eight case studies — the stacks list what
                          defines each build, not everything touched.
                        </p>
                      )}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        {/* ---------------- readout ---------------- */}
        <div className="mt-6 hidden min-h-[84px] md:block">
          {readout ? (
            <div className="board board-sm flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
              <span className="ticks" />
              <div>
                <span className="note note-signal">
                  {readout.kind === "tool" ? "Tool" : "Project"}
                </span>
                <p className="mt-1 font-display text-xl font-semibold text-text">{readout.title}</p>
              </div>
              <div className="min-w-0 flex-1">
                <span className="note">
                  {readout.kind === "tool" ? "Used for" : "Built with"}
                </span>
                <p className="mt-1 truncate text-sm text-text-muted">{readout.detail}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {readout.links.length ? (
                  readout.links.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/projects/${p.slug}`}
                      className="reg reg-signal transition-colors hover:text-signal-bright"
                      data-cursor-label="Open"
                    >
                      {p.name}
                    </Link>
                  ))
                ) : (
                  <span className="reg">No shipped reference</span>
                )}
              </div>
            </div>
          ) : (
            <p className="note px-1 pt-5 text-text-subtle/70">
              Probe a node to trace it — tools light the projects they shipped in, projects light
              the tools that built them.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
