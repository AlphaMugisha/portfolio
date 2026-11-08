/**
 * Generates `backend/migrations/0004_seed.sql` from the static data the site
 * shipped with before it had a database.
 *
 * Writing that SQL by hand would mean retyping eight case studies, four
 * journey entries and thirty-five skills into string literals, and a single
 * missed apostrophe would be a syntax error at the far end of a 400-line file.
 * Generating it means the seed cannot drift from `lib/` and every value is
 * escaped by one function that is easy to check.
 *
 * Node 24 strips the TypeScript types on import, so the data modules are read
 * directly rather than compiled first.
 *
 *   node scripts/generate-seed.mjs
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const { projects } = await import("../lib/projects.ts");
const { skillGroups } = await import("../lib/skills.ts");
const { journey } = await import("../lib/journey.ts");
const { site } = await import("../lib/site.ts");

/* ---------- escaping ---------- */

/** A single-quoted SQL string literal, or NULL. */
const s = (v) =>
  v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`;

/** A Postgres text[] literal. */
const arr = (list) =>
  list?.length ? `array[${list.map(s).join(", ")}]::text[]` : `'{}'::text[]`;

/** A jsonb literal. */
const json = (v) => `${s(JSON.stringify(v ?? []))}::jsonb`;

/* ---------- section copy ----------
   These strings live in the components today. The seed lifts them into the
   database so the first thing the admin shows is the site exactly as it
   already reads, rather than a set of empty fields. */
const SECTIONS = [
  {
    key: "about",
    eyebrow: `Meet ${site.shortName}`,
    heading: "Hello, I'm",
    accent: `${site.shortName}.`,
    intro: "",
    sort_order: 10,
  },
  {
    key: "what-i-do",
    eyebrow: "What I do",
    heading: "Built across the whole",
    accent: "stack, and below it.",
    intro:
      "From a database schema to a relay on a breadboard. I take ideas from concept to prototype to something other people can actually use, learning whatever the project needs on the way.",
    sort_order: 20,
  },
  {
    key: "work",
    eyebrow: "Selected work",
    heading: "Real projects,",
    accent: "really shipped.",
    intro: "",
    sort_order: 30,
  },
  {
    key: "work-grid",
    eyebrow: "Everything",
    heading: "Click one to see how it was built.",
    accent: "",
    intro: "",
    sort_order: 40,
  },
  {
    key: "toolbox",
    eyebrow: "Toolbox",
    heading: "The tools I",
    accent: "actually use.",
    intro:
      "No percentages anywhere — a rating out of ten would be invented, so each one says what it is used for instead.",
    sort_order: 50,
  },
  {
    key: "journey",
    eyebrow: "How it developed",
    heading: "How I got",
    accent: "here.",
    intro:
      "Four stages, in the order they happened. Each one is still in use — the hardware habits did not stop being useful once the work moved to the web.",
    sort_order: 60,
  },
  {
    key: "beyond",
    eyebrow: "How I work",
    heading: "Start with the data.",
    accent: "Finish with what ships.",
    intro:
      "Every metric on this site was read off a running system, not estimated. If a project has no verified numbers, it shows none — which is the same standard I hold the code to.",
    sort_order: 70,
  },
  {
    key: "github",
    eyebrow: "On GitHub",
    heading: "What I've been",
    accent: "shipping lately.",
    intro: "Read live from the GitHub API — not a curated list.",
    sort_order: 75,
  },
  {
    key: "contact",
    eyebrow: "Contact",
    heading: "Let's build",
    accent: "something.",
    intro:
      "Freelance work, full-time roles, collaboration, or a question about how something here was built. I reply.",
    sort_order: 80,
  },
];

const CAPABILITIES = [
  ["Full-stack web", "Next.js, React and TypeScript over PostgreSQL and Prisma. Auth, uploads, dashboards and the unglamorous parts that make an app real.", "Code2", "accent"],
  ["Embedded systems", "ESP32 and Arduino with real sensors and actuators. Firmware that reads its environment, decides, and reports back to something online.", "Cpu", "ink"],
  ["Applied AI", "Models as engineering tools, not a talking point: API integration, coding agents, local inference and tool protocols like MCP.", "Sparkles", "accent-bright"],
  ["Databases & APIs", "Schemas with real constraints, role-scoped access, versioned REST endpoints and migrations that survive contact with production.", "Database", "ink"],
  ["Robotics & IoT", "Microcontrollers, relays, servos and RFID. Physical systems that move, with the cloud side built to match.", "Bot", "accent"],
  ["Systems for institutions", "School portals, libraries, point-of-sale. Small organisations rarely get purpose-built software — several of these were built so they could.", "Workflow", "accent-bright"],
];

const BEYOND = [
  ["Hardware first", "Circuits before screens — a system either behaves or visibly does not.", "Cpu"],
  ["Built for institutions", "Schools, a library, a church, a restaurant. Real users, real constraints.", "Workflow"],
  ["Still learning", "Every project adds a technology I had not shipped before.", "Sparkles"],
];

const ABOUT_BODY = `My work begins with the data. Before a screen exists there is a schema, a set of roles, and a clear idea of who needs to do what. That discipline came from starting with hardware, where a system either behaves correctly or visibly does not.

Since then I have built web platforms, REST APIs, administrative dashboards and connected devices — React, Next.js and TypeScript on the front, Node, Laravel and PHP behind them, over PostgreSQL, MySQL and SQLite.`;

const HERO_INTRO = `${site.tagline} I build web platforms, embedded electronics and applied AI systems from ${site.location}.`;

/* ---------- emit ---------- */

const out = [];
const w = (line = "") => out.push(line);

w("-- 0004_seed.sql");
w("--");
w("-- The site's current content, lifted out of `lib/` and into the database.");
w("-- GENERATED by scripts/generate-seed.mjs — edit the data modules and");
w("-- re-run that script rather than editing this file by hand.");
w("--");
w("-- Every statement is an upsert keyed on a natural key (slug, section key,");
w("-- title), so re-running the file restores the seed without duplicating it");
w("-- and without touching rows that were added later in the admin.");
w();

/* site_settings — the single row created by 0001 is updated, not inserted. */
w("-- ============================================================");
w("-- site_settings");
w("-- ============================================================");
w("update public.site_settings set");
w(`  name          = ${s(site.name)},`);
w(`  short_name    = ${s(site.shortName)},`);
w(`  role          = ${s(site.role)},`);
w(`  location      = ${s(site.location)},`);
w(`  email         = ${s(site.email)},`);
w(`  tagline       = ${s(site.tagline)},`);
w(`  description   = ${s(site.description)},`);
w(`  github_url    = ${s(site.github)},`);
w(`  linkedin_url  = ${s(site.linkedin)},`);
w(`  cv_path       = ${s(site.cv)},`);
w(`  hero_badge    = ${s("Open to new work")},`);
w(`  hero_line_1   = ${s("Software")},`);
w(`  hero_line_2   = ${s("that actually")},`);
w(`  hero_line_3   = ${s("works.")},`);
w(`  hero_intro    = ${s(HERO_INTRO)},`);
w(`  about_body_md = ${s(ABOUT_BODY)},`);
w(`  portrait_path = ${s("/images/portrait.jpg")},`);
w(`  portrait_alt  = ${s(`${site.name}, ${site.role}`)},`);
w(`  availability  = ${s("Open to new work")}`);
w("where id;");
w();

/* sections */
w("-- ============================================================");
w("-- sections");
w("-- ============================================================");
w("insert into public.sections (key, eyebrow, heading, accent, intro, sort_order) values");
w(
  SECTIONS.map(
    (x) =>
      `  (${s(x.key)}, ${s(x.eyebrow)}, ${s(x.heading)}, ${s(x.accent)}, ${s(x.intro)}, ${x.sort_order})`,
  ).join(",\n"),
);
w("on conflict (key) do update set");
w("  eyebrow = excluded.eyebrow, heading = excluded.heading,");
w("  accent = excluded.accent, intro = excluded.intro, sort_order = excluded.sort_order;");
w();

/* projects */
w("-- ============================================================");
w("-- projects");
w("-- ============================================================");
w(
  "insert into public.projects (slug, name, year, summary, problem, solution, evidence, repo_url, status, categories, stack, stats, cover_path, is_featured, is_published, sort_order) values",
);
w(
  projects
    .map(
      (p, i) =>
        `  (${s(p.slug)}, ${s(p.name)}, ${s(p.year)}, ${s(p.summary)}, ${s(p.problem)}, ${s(p.solution)}, ${s(p.evidence)}, ${s(p.repo)}, ${s(p.status)}::project_status, ${arr(p.categories)}, ${arr(p.stack)}, ${json(p.stats)}, ${s(`/images/projects/${p.slug}.jpg`)}, ${p.featured}, true, ${(i + 1) * 10})`,
    )
    .join(",\n"),
);
w("on conflict (slug) do update set");
w("  name = excluded.name, year = excluded.year, summary = excluded.summary,");
w("  problem = excluded.problem, solution = excluded.solution, evidence = excluded.evidence,");
w("  repo_url = excluded.repo_url, status = excluded.status, categories = excluded.categories,");
w("  stack = excluded.stack, stats = excluded.stats, cover_path = excluded.cover_path,");
w("  is_featured = excluded.is_featured, sort_order = excluded.sort_order;");
w();

/* capabilities */
w("-- ============================================================");
w("-- capabilities");
w("-- ============================================================");
w("-- `title` is not unique in the schema, so the upsert is expressed as a");
w("-- delete-then-insert of the seeded titles only. Rows added in the admin");
w("-- with other titles are left alone.");
w(
  `delete from public.capabilities where title in (${CAPABILITIES.map((c) => s(c[0])).join(", ")});`,
);
w("insert into public.capabilities (title, description, icon, tile, sort_order) values");
w(
  CAPABILITIES.map(
    (c, i) => `  (${s(c[0])}, ${s(c[1])}, ${s(c[2])}, ${s(c[3])}::tile_variant, ${(i + 1) * 10})`,
  ).join(",\n"),
);
w(";");
w();

/* skill groups + skills */
w("-- ============================================================");
w("-- skill_groups + skills");
w("-- ============================================================");
w("insert into public.skill_groups (slug, title, blurb, sort_order) values");
w(
  skillGroups
    .map((g, i) => `  (${s(g.id)}, ${s(g.title)}, ${s(g.blurb)}, ${(i + 1) * 10})`)
    .join(",\n"),
);
w("on conflict (slug) do update set");
w("  title = excluded.title, blurb = excluded.blurb, sort_order = excluded.sort_order;");
w();

for (const group of skillGroups) {
  w(`insert into public.skills (group_id, name, detail, sort_order)`);
  w(`select g.id, v.name, v.detail, v.sort_order`);
  w(`from public.skill_groups g, (values`);
  w(
    group.skills
      .map((sk, i) => `  (${s(sk.name)}, ${s(sk.detail)}, ${(i + 1) * 10})`)
      .join(",\n"),
  );
  w(`) as v(name, detail, sort_order)`);
  w(`where g.slug = ${s(group.id)}`);
  w(`on conflict (group_id, name) do update set`);
  w(`  detail = excluded.detail, sort_order = excluded.sort_order;`);
  w();
}

/* journey */
w("-- ============================================================");
w("-- journey_entries");
w("-- ============================================================");
w("-- `period` is the natural key for the seed but is not unique in the schema,");
w("-- so the seeded periods are cleared first.");
w(`delete from public.journey_entries where period in (${journey.map((j) => s(j.period)).join(", ")});`);
w("insert into public.journey_entries (period, title, discipline, body, highlights, image_path, sort_order) values");
w(
  journey
    .map(
      (j, i) =>
        `  (${s(j.period)}, ${s(j.title)}, ${s(j.discipline)}, ${s(j.body)}, ${arr(j.highlights)}, ${s(j.image)}, ${(i + 1) * 10})`,
    )
    .join(",\n"),
);
w(";");
w();

/* beyond */
w("-- ============================================================");
w("-- beyond_highlights");
w("-- ============================================================");
w(`delete from public.beyond_highlights where title in (${BEYOND.map((b) => s(b[0])).join(", ")});`);
w("insert into public.beyond_highlights (title, description, icon, sort_order) values");
w(BEYOND.map((b, i) => `  (${s(b[0])}, ${s(b[1])}, ${s(b[2])}, ${(i + 1) * 10})`).join(",\n"));
w(";");
w();

const dest = join(root, "backend", "migrations", "0004_seed.sql");
writeFileSync(dest, out.join("\n") + "\n", "utf8");
console.log(
  `0004_seed.sql  ${out.length} lines  ` +
    `(${projects.length} projects, ${skillGroups.length} skill groups, ` +
    `${skillGroups.reduce((n, g) => n + g.skills.length, 0)} skills, ` +
    `${journey.length} journey entries, ${SECTIONS.length} sections)`,
);
