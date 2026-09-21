import { projects } from "@/lib/projects";
import { skillGroups } from "@/lib/skills";

/**
 * Cross-reference between the toolbox and the case studies.
 *
 * Every project already declares the stack it was built on, so the claim
 * "I use this" can be checked against the claim "this was used here" without
 * anyone writing the link by hand. The section renders whatever this file
 * computes; nothing is curated.
 *
 * Matching is EXACT on a normalised name, plus a short alias table. An
 * earlier substring version was looser and immediately wrong: "CSS" matched
 * every project using "Tailwind CSS", inflating its count to four. A tool
 * that appears in no stack simply shows no reference — the project `stack`
 * arrays list the handful of technologies that define each build, not
 * everything that was touched, so absence here is not evidence of disuse and
 * the section says so.
 */

export interface ToolRef {
  name: string;
  detail: string;
  group: string;
  projects: { slug: string; name: string }[];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#]/g, "");

/** Names that are written differently in a stack than in the toolbox. */
const ALIASES: Record<string, string[]> = {
  "Arduino Uno": ["Arduino"],
  "C / C++": ["C++", "C"],
  "Git / GitHub": ["GitHub", "Git"],
  "Node.js": ["Node", "Express"],
  "Tailwind CSS": ["Tailwind"],
  "REST APIs": ["REST API"],
  Sensors: ["DHT Sensor", "Sensors"],
  Supabase: ["Supabase"],
};

function matches(tool: string, stackEntry: string) {
  const a = norm(tool);
  const b = norm(stackEntry);
  if (a === b) return true;
  return (ALIASES[tool] ?? []).some((alias) => norm(alias) === b);
}

export const toolIndex: Record<string, ToolRef> = {};

for (const group of skillGroups) {
  for (const skill of group.skills) {
    toolIndex[skill.name] = {
      name: skill.name,
      detail: skill.detail,
      group: group.title,
      projects: projects
        .filter((p) => p.stack.some((t) => matches(skill.name, t)))
        .map((p) => ({ slug: p.slug, name: p.name })),
    };
  }
}

/** How many tools could be tied back to at least one case study. */
export const referencedCount = Object.values(toolIndex).filter(
  (t) => t.projects.length > 0
).length;
