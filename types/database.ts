/**
 * Hand-written row types for the tables in `backend/migrations/`.
 *
 * Supabase can generate these from a live database, but that needs the CLI
 * logged into the project; keeping them here means the types exist before the
 * database does, and a column added in a migration is a compile error until it
 * is added here too — which is the right way round.
 */

export type ProjectStatus = "live" | "in-progress" | "prototype" | "concept";
export type TileVariant = "accent" | "accent-bright" | "ink";

export interface ProjectStat {
  label: string;
  value: string;
}

export interface SiteSettingsRow {
  id: boolean;
  name: string;
  short_name: string;
  role: string;
  location: string;
  email: string;
  tagline: string;
  description: string;
  github_url: string | null;
  linkedin_url: string | null;
  cv_path: string | null;
  hero_badge: string;
  hero_line_1: string;
  hero_line_2: string;
  hero_line_3: string;
  hero_intro: string;
  about_body_md: string;
  portrait_path: string;
  portrait_alt: string;
  availability: string;
  updated_at: string;
}

export interface SectionRow {
  key: string;
  eyebrow: string;
  heading: string;
  /** The closing clause of the heading, rendered in amber. */
  accent: string;
  intro: string;
  sort_order: number;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  slug: string;
  name: string;
  year: string;
  summary: string;
  problem: string;
  solution: string;
  evidence: string | null;
  repo_url: string | null;
  status: ProjectStatus;
  categories: string[];
  stack: string[];
  stats: ProjectStat[];
  cover_path: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CapabilityRow {
  id: string;
  title: string;
  description: string;
  /** A lucide icon name, resolved through an allow-list in the UI. */
  icon: string;
  tile: TileVariant;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillGroupRow {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SkillRow {
  id: string;
  group_id: string;
  name: string;
  detail: string;
  sort_order: number;
  created_at: string;
}

export interface JourneyEntryRow {
  id: string;
  period: string;
  title: string;
  discipline: string;
  body: string;
  highlights: string[];
  image_path: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BeyondHighlightRow {
  id: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface MediaRow {
  id: string;
  storage_path: string;
  alt: string;
  width: number;
  height: number;
  bytes: number;
  mime: string;
  created_at: string;
}

/** A skill group with its skills attached, as the toolbox renders it. */
export interface SkillGroupWithSkills extends SkillGroupRow {
  skills: SkillRow[];
}

/* ------------------------------------------------------------------
   The shape `@supabase/supabase-js` wants for `createClient<Database>`.
   Only the parts the app actually uses are described: `Row` for reads and
   `Insert`/`Update` for writes, with generated columns made optional.
   ------------------------------------------------------------------ */

type Writable<T> = Partial<Omit<T, "created_at" | "updated_at">>;

interface Table<Row, Insert = Writable<Row>, Update = Writable<Row>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      site_settings: Table<SiteSettingsRow>;
      sections: Table<SectionRow>;
      projects: Table<ProjectRow>;
      capabilities: Table<CapabilityRow>;
      skill_groups: Table<SkillGroupRow>;
      skills: Table<SkillRow>;
      journey_entries: Table<JourneyEntryRow>;
      beyond_highlights: Table<BeyondHighlightRow>;
      media: Table<MediaRow>;
      admins: Table<{ user_id: string; created_at: string }>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      project_status: ProjectStatus;
      tile_variant: TileVariant;
    };
    CompositeTypes: Record<string, never>;
  };
}
