import { createPublicClient } from "@/lib/supabase/public";
import type {
  BeyondHighlightRow,
  CapabilityRow,
  JourneyEntryRow,
  ProjectRow,
  SectionRow,
  SiteSettingsRow,
  SkillGroupWithSkills,
} from "@/types/database";

import { site as staticSite } from "@/lib/site";
import { projects as staticProjects } from "@/lib/projects";
import { skillGroups as staticSkillGroups } from "@/lib/skills";
import { journey as staticJourney } from "@/lib/journey";

/**
 * The public read layer.
 *
 * Every function here answers the same way whether or not a database exists.
 * When Supabase is configured the content comes from Postgres; when it is not —
 * a fresh clone, a preview build with no secrets, a misconfigured deploy — it
 * comes from the static modules in `lib/`, which are the same values the seed
 * migration loaded in the first place.
 *
 * That fallback is not just for convenience. A portfolio that renders a blank
 * page because an environment variable is missing is worse than one that
 * renders slightly stale content, and this way a failure in the database is
 * never a failure of the site.
 *
 * The same applies to errors, not only to missing configuration: if a query
 * throws — table not migrated yet, network down, RLS misconfigured — the
 * fallback is used and the reason is logged on the server.
 */

/* ------------------------------------------------------------------
   Fallbacks: the static content, shaped like database rows.
   ------------------------------------------------------------------ */

const NOW = "1970-01-01T00:00:00.000Z";

const FALLBACK_SETTINGS: SiteSettingsRow = {
  id: true,
  name: staticSite.name,
  short_name: staticSite.shortName,
  role: staticSite.role,
  location: staticSite.location,
  email: staticSite.email,
  tagline: staticSite.tagline,
  description: staticSite.description,
  github_url: staticSite.github,
  linkedin_url: staticSite.linkedin,
  cv_path: staticSite.cv,
  hero_badge: "Open to new work",
  hero_line_1: "Software",
  hero_line_2: "that actually",
  hero_line_3: "works.",
  hero_intro: `${staticSite.tagline} I build web platforms, embedded electronics and applied AI systems from ${staticSite.location}.`,
  about_body_md:
    "My work begins with the data. Before a screen exists there is a schema, a set of roles, and a clear idea of who needs to do what. That discipline came from starting with hardware, where a system either behaves correctly or visibly does not.\n\nSince then I have built web platforms, REST APIs, administrative dashboards and connected devices — React, Next.js and TypeScript on the front, Node, Laravel and PHP behind them, over PostgreSQL, MySQL and SQLite.",
  portrait_path: "/images/portrait.jpg",
  portrait_alt: `${staticSite.name}, ${staticSite.role}`,
  availability: "Open to new work",
  updated_at: NOW,
};

const FALLBACK_SECTIONS: SectionRow[] = [
  ["about", `Meet ${staticSite.shortName}`, "Hello, I'm", `${staticSite.shortName}.`, "", 10],
  [
    "what-i-do",
    "What I do",
    "Built across the whole",
    "stack, and below it.",
    "From a database schema to a relay on a breadboard. I take ideas from concept to prototype to something other people can actually use, learning whatever the project needs on the way.",
    20,
  ],
  ["work", "Selected work", "Real projects,", "really shipped.", "", 30],
  ["work-grid", "Everything", "Click one to see how it was built.", "", "", 40],
  [
    "toolbox",
    "Toolbox",
    "The tools I",
    "actually use.",
    "No percentages anywhere — a rating out of ten would be invented, so each one says what it is used for instead.",
    50,
  ],
  [
    "journey",
    "How it developed",
    "How I got",
    "here.",
    "Four stages, in the order they happened. Each one is still in use — the hardware habits did not stop being useful once the work moved to the web.",
    60,
  ],
  [
    "beyond",
    "How I work",
    "Start with the data.",
    "Finish with what ships.",
    "Every metric on this site was read off a running system, not estimated. If a project has no verified numbers, it shows none — which is the same standard I hold the code to.",
    70,
  ],
  [
    "github",
    "On GitHub",
    "What I've been",
    "shipping lately.",
    "Read live from the GitHub API — not a curated list.",
    75,
  ],
  [
    "contact",
    "Contact",
    "Let's build",
    "something.",
    "Freelance work, full-time roles, collaboration, or a question about how something here was built. I reply.",
    80,
  ],
].map(([key, eyebrow, heading, accent, intro, sort_order]) => ({
  key: key as string,
  eyebrow: eyebrow as string,
  heading: heading as string,
  accent: accent as string,
  intro: intro as string,
  sort_order: sort_order as number,
  updated_at: NOW,
}));

const FALLBACK_PROJECTS: ProjectRow[] = staticProjects.map((p, i) => ({
  id: p.slug,
  slug: p.slug,
  name: p.name,
  year: p.year,
  summary: p.summary,
  problem: p.problem,
  solution: p.solution,
  evidence: p.evidence ?? null,
  repo_url: p.repo ?? null,
  status: p.status,
  categories: [...p.categories],
  stack: [...p.stack],
  stats: p.stats ? p.stats.map((s) => ({ ...s })) : [],
  cover_path: `/images/projects/${p.slug}.jpg`,
  is_featured: p.featured,
  is_published: true,
  sort_order: (i + 1) * 10,
  published_at: NOW,
  created_at: NOW,
  updated_at: NOW,
}));

const FALLBACK_CAPABILITIES: CapabilityRow[] = (
  [
    [
      "Full-stack web",
      "Next.js, React and TypeScript over PostgreSQL and Prisma. Auth, uploads, dashboards and the unglamorous parts that make an app real.",
      "Code2",
      "accent",
    ],
    [
      "Embedded systems",
      "ESP32 and Arduino with real sensors and actuators. Firmware that reads its environment, decides, and reports back to something online.",
      "Cpu",
      "ink",
    ],
    [
      "Applied AI",
      "Models as engineering tools, not a talking point: API integration, coding agents, local inference and tool protocols like MCP.",
      "Sparkles",
      "accent-bright",
    ],
    [
      "Databases & APIs",
      "Schemas with real constraints, role-scoped access, versioned REST endpoints and migrations that survive contact with production.",
      "Database",
      "ink",
    ],
    [
      "Robotics & IoT",
      "Microcontrollers, relays, servos and RFID. Physical systems that move, with the cloud side built to match.",
      "Bot",
      "accent",
    ],
    [
      "Systems for institutions",
      "School portals, libraries, point-of-sale. Small organisations rarely get purpose-built software — several of these were built so they could.",
      "Workflow",
      "accent-bright",
    ],
  ] as const
).map(([title, description, icon, tile], i) => ({
  id: `fallback-capability-${i}`,
  title,
  description,
  icon,
  tile,
  sort_order: (i + 1) * 10,
  is_published: true,
  created_at: NOW,
  updated_at: NOW,
}));

const FALLBACK_SKILL_GROUPS: SkillGroupWithSkills[] = staticSkillGroups.map((g, i) => ({
  id: g.id,
  slug: g.id,
  title: g.title,
  blurb: g.blurb,
  sort_order: (i + 1) * 10,
  created_at: NOW,
  updated_at: NOW,
  skills: g.skills.map((s, j) => ({
    id: `${g.id}-${j}`,
    group_id: g.id,
    name: s.name,
    detail: s.detail,
    sort_order: (j + 1) * 10,
    created_at: NOW,
  })),
}));

const FALLBACK_JOURNEY: JourneyEntryRow[] = staticJourney.map((j, i) => ({
  id: `fallback-journey-${i}`,
  period: j.period,
  title: j.title,
  discipline: j.discipline,
  body: j.body,
  highlights: [...j.highlights],
  image_path: j.image,
  sort_order: (i + 1) * 10,
  created_at: NOW,
  updated_at: NOW,
}));

const FALLBACK_BEYOND: BeyondHighlightRow[] = (
  [
    ["Hardware first", "Circuits before screens — a system either behaves or visibly does not.", "Cpu"],
    ["Built for institutions", "Schools, a library, a church, a restaurant. Real users, real constraints.", "Workflow"],
    ["Still learning", "Every project adds a technology I had not shipped before.", "Sparkles"],
  ] as const
).map(([title, description, icon], i) => ({
  id: `fallback-beyond-${i}`,
  title,
  description,
  icon,
  sort_order: (i + 1) * 10,
  created_at: NOW,
}));

/* ------------------------------------------------------------------
   Query helper
   ------------------------------------------------------------------ */

/**
 * Runs `query` against Supabase and returns `fallback` if anything at all goes
 * wrong — not configured, query error, or an empty result.
 *
 * Empty counts as a failure on purpose. A table that exists but has not been
 * seeded should render the default content, not an empty section: a page with
 * a heading and no cards under it looks broken, where the defaults look
 * intentional.
 */
type PublicClient = NonNullable<ReturnType<typeof createPublicClient>>;
type QueryResult = { data: unknown; error: { message: string } | null };

async function read<T>(
  label: string,
  // PromiseLike, not Promise: a postgrest query builder is a thenable that only
  // becomes a real Promise once it is awaited.
  query: (client: PublicClient) => PromiseLike<QueryResult>,
  fallback: T,
): Promise<T> {
  const client = createPublicClient();
  if (!client) return fallback;

  try {
    const { data, error } = await query(client);
    if (error) {
      console.warn(`[db] ${label} failed, using static content: ${error.message}`);
      return fallback;
    }
    if (data === null || (Array.isArray(data) && data.length === 0)) return fallback;
    // The client is untyped by design (see lib/supabase/public.ts); the row
    // shapes are asserted here, against the hand-written types that mirror
    // backend/migrations/0001_init.sql.
    return data as T;
  } catch (cause) {
    console.warn(`[db] ${label} threw, using static content:`, cause);
    return fallback;
  }
}

/* ------------------------------------------------------------------
   Reads
   ------------------------------------------------------------------ */

export async function getSiteSettings(): Promise<SiteSettingsRow> {
  return read(
    "site_settings",
    (c) => c.from("site_settings").select("*").limit(1).maybeSingle(),
    FALLBACK_SETTINGS,
  );
}

/** Section copy keyed by its slug, so callers can do `sections["toolbox"]`. */
export async function getSections(): Promise<Record<string, SectionRow>> {
  const rows = await read(
    "sections",
    (c) => c.from("sections").select("*").order("sort_order"),
    FALLBACK_SECTIONS,
  );
  return Object.fromEntries(rows.map((r) => [r.key, r]));
}

export async function getProjects(): Promise<ProjectRow[]> {
  return read(
    "projects",
    (c) => c.from("projects").select("*").eq("is_published", true).order("sort_order"),
    FALLBACK_PROJECTS,
  );
}

export async function getProject(slug: string): Promise<ProjectRow | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getFeaturedProjects(): Promise<ProjectRow[]> {
  const all = await getProjects();
  const featured = all.filter((p) => p.is_featured);
  return featured.length ? featured : all.slice(0, 1);
}

export async function getCapabilities(): Promise<CapabilityRow[]> {
  return read(
    "capabilities",
    (c) => c.from("capabilities").select("*").eq("is_published", true).order("sort_order"),
    FALLBACK_CAPABILITIES,
  );
}

export async function getSkillGroups(): Promise<SkillGroupWithSkills[]> {
  return read(
    "skill_groups",
    async (c) => {
      const { data, error } = await c
        .from("skill_groups")
        .select("*, skills(*)")
        .order("sort_order");
      if (error) return { data: null, error };
      // PostgREST returns embedded rows unordered; sort them here rather than
      // relying on whatever order they come back in.
      const groups = ((data ?? []) as SkillGroupWithSkills[]).map((g) => ({
        ...g,
        skills: [...(g.skills ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      }));
      return { data: groups, error: null };
    },
    FALLBACK_SKILL_GROUPS,
  );
}

export async function getJourney(): Promise<JourneyEntryRow[]> {
  return read(
    "journey_entries",
    (c) => c.from("journey_entries").select("*").order("sort_order"),
    FALLBACK_JOURNEY,
  );
}

export async function getBeyondHighlights(): Promise<BeyondHighlightRow[]> {
  return read(
    "beyond_highlights",
    (c) => c.from("beyond_highlights").select("*").order("sort_order"),
    FALLBACK_BEYOND,
  );
}

/** Total number of skills across every group — the figure the toolbox quotes. */
export function countSkills(groups: SkillGroupWithSkills[]): number {
  return groups.reduce((n, g) => n + g.skills.length, 0);
}
