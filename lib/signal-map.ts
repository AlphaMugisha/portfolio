import { matches } from "@/lib/tool-usage";
import type { ProjectRow, SkillGroupWithSkills } from "@/types/database";

/**
 * Layout data for the Signal Map.
 *
 * Built from whatever the data layer returned — Supabase rows when the
 * database is configured, the static fallback when it is not — rather
 * than from the static modules directly, so editing a project's stack
 * in the admin reshapes the diagram without a deploy.
 *
 * Every edge is DERIVED, never authored: a tool is wired to a project
 * only if that project's own `stack` array names it (through the exact
 * + alias matcher in `tool-usage.ts`). Nobody curates the connections,
 * so the diagram cannot flatter the case studies, and a tool that has
 * genuinely not shipped in any of them simply has no edge.
 */

export interface MapTool {
  id: string;
  name: string;
  detail: string;
  projects: { slug: string; name: string }[];
}

export interface MapProject {
  slug: string;
  name: string;
}

export interface MapGroup {
  id: string;
  title: string;
  blurb: string;
  tools: MapTool[];
  /** Every project reachable from this group's tools, de-duplicated. */
  projects: MapProject[];
  edges: { tool: string; project: string }[];
}

export interface MapTotals {
  tools: number;
  linked: number;
  connections: number;
}

export function buildSignalMap(
  skillGroups: SkillGroupWithSkills[],
  projects: ProjectRow[],
): { groups: MapGroup[]; totals: MapTotals } {
  const groups: MapGroup[] = skillGroups.map((group) => {
    const tools: MapTool[] = group.skills.map((skill) => ({
      id: `${group.id}:${skill.name}`,
      name: skill.name,
      detail: skill.detail,
      projects: projects
        .filter((project) => project.stack.some((entry) => matches(skill.name, entry)))
        .map((project) => ({ slug: project.slug, name: project.name })),
    }));

    const seen = new Map<string, MapProject>();
    for (const tool of tools) {
      for (const project of tool.projects) {
        if (!seen.has(project.slug)) seen.set(project.slug, project);
      }
    }

    const edges = tools.flatMap((tool) =>
      tool.projects.map((project) => ({ tool: tool.id, project: project.slug })),
    );

    return {
      id: group.id,
      title: group.title,
      blurb: group.blurb,
      tools,
      projects: [...seen.values()],
      edges,
    };
  });

  return {
    groups,
    totals: {
      tools: groups.reduce((n, g) => n + g.tools.length, 0),
      linked: groups.reduce((n, g) => n + g.tools.filter((t) => t.projects.length).length, 0),
      connections: groups.reduce((n, g) => n + g.edges.length, 0),
    },
  };
}
