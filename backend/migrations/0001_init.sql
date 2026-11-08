-- 0001_init.sql
-- Core schema: enums, tables, triggers, indexes.
--
-- Run in the Supabase SQL editor (Dashboard -> SQL Editor -> New query ->
-- paste -> Run), or with `psql` against the project's connection string.
-- Every statement is idempotent, so re-running this file is safe.

-- ============================================================
-- Enums
-- ============================================================

-- Mirrors `statusCopy` in lib/projects.ts. Stored as an enum rather than free
-- text so a typo in the admin form fails at the database rather than rendering
-- a blank chip on the public site.
do $$ begin
  create type project_status as enum ('live', 'in-progress', 'prototype', 'concept');
exception when duplicate_object then null; end $$;

-- Which fill a capability card's icon tile takes. Named rather than free-form
-- so the admin cannot introduce a colour outside the palette.
do $$ begin
  create type tile_variant as enum ('accent', 'accent-bright', 'ink');
exception when duplicate_object then null; end $$;

-- ============================================================
-- Helpers
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================
-- site_settings  (exactly one row)
--
-- The `id boolean primary key default true check (id)` trick is what pins this
-- to a single row: the only value that satisfies the check is `true`, and the
-- primary key stops a second one being inserted. No application code has to
-- remember there is meant to be one.
-- ============================================================

create table if not exists public.site_settings (
  id              boolean primary key default true check (id),

  -- identity
  name            text not null default 'Alpha Mugisha',
  short_name      text not null default 'Alpha',
  role            text not null default 'Software Engineer',
  location        text not null default 'Kigali, Rwanda',
  email           text not null default 'tigerkev07@gmail.com',
  tagline         text not null default 'I''m still learning — but I''m already building.',
  description     text not null default '',

  -- links
  github_url      text,
  linkedin_url    text,
  cv_path         text,

  -- hero
  hero_badge      text not null default 'Open to new work',
  hero_line_1     text not null default 'Software',
  hero_line_2     text not null default 'that actually',
  hero_line_3     text not null default 'works.',
  hero_intro      text not null default '',

  -- about
  about_body_md   text not null default '',
  portrait_path   text not null default '/images/portrait.jpg',
  portrait_alt    text not null default 'Alpha Mugisha',

  -- availability line in the dark panel and the footer
  availability    text not null default 'Open to new work',

  updated_at      timestamptz not null default now(),

  constraint site_settings_email_format check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint site_settings_name_len check (char_length(name) between 1 and 80)
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================
-- sections
--
-- Every section header on the page — eyebrow, heading, the amber tail of the
-- heading, and the paragraph under it. Keyed by a stable slug rather than
-- given a column each on site_settings, so adding a section later is an INSERT
-- and not a migration.
-- ============================================================

create table if not exists public.sections (
  key         text primary key,
  eyebrow     text not null default '',
  heading     text not null default '',
  -- The closing clause, rendered in amber. Split from `heading` because the
  -- two are styled differently, not because they are different sentences.
  accent      text not null default '',
  intro       text not null default '',
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now(),
  constraint sections_key_format check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

drop trigger if exists sections_set_updated_at on public.sections;
create trigger sections_set_updated_at before update on public.sections
  for each row execute function public.set_updated_at();

-- ============================================================
-- projects
-- ============================================================

create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  -- Free text rather than an integer: real entries read "2025 - 2026".
  year          text not null default '',
  summary       text not null default '',
  problem       text not null default '',
  solution      text not null default '',
  -- Where the numbers came from. The site shows no figure without one.
  evidence      text,
  repo_url      text,
  status        project_status not null default 'concept',
  categories    text[] not null default '{}',
  stack         text[] not null default '{}',
  -- [{ "label": "Data models", "value": "43" }, ...]
  stats         jsonb not null default '[]'::jsonb,
  cover_path    text not null default '',
  is_featured   boolean not null default false,
  is_published  boolean not null default true,
  sort_order    integer not null default 0,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_name_len check (char_length(name) between 1 and 80),
  constraint projects_summary_len check (char_length(summary) <= 400),
  constraint projects_stats_array check (jsonb_typeof(stats) = 'array')
);

create index if not exists projects_published_sort_idx on public.projects (is_published, sort_order);
create index if not exists projects_featured_idx on public.projects (sort_order) where is_featured and is_published;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create or replace function public.set_published_at()
returns trigger language plpgsql as $$
begin
  if new.is_published and coalesce(old.is_published, false) = false and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end $$;

drop trigger if exists projects_set_published_at on public.projects;
create trigger projects_set_published_at before update on public.projects
  for each row execute function public.set_published_at();

-- ============================================================
-- capabilities  (the "What I do" cards)
-- ============================================================

create table if not exists public.capabilities (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  -- A lucide icon name, resolved through an allow-list in the UI. Storing the
  -- name rather than markup keeps arbitrary SVG out of the database.
  icon         text not null default 'Sparkles',
  tile         tile_variant not null default 'accent',
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint capabilities_title_len check (char_length(title) between 1 and 60)
);

create index if not exists capabilities_sort_idx on public.capabilities (sort_order) where is_published;

drop trigger if exists capabilities_set_updated_at on public.capabilities;
create trigger capabilities_set_updated_at before update on public.capabilities
  for each row execute function public.set_updated_at();

-- ============================================================
-- skill_groups + skills
-- ============================================================

create table if not exists public.skill_groups (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  blurb       text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint skill_groups_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

drop trigger if exists skill_groups_set_updated_at on public.skill_groups;
create trigger skill_groups_set_updated_at before update on public.skill_groups
  for each row execute function public.set_updated_at();

create table if not exists public.skills (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.skill_groups (id) on delete cascade,
  name        text not null,
  -- What the technology is used FOR. Deliberately not a score: a rating out of
  -- ten would be invented, and the site says so out loud.
  detail      text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (group_id, name)
);

create index if not exists skills_group_sort_idx on public.skills (group_id, sort_order);

-- ============================================================
-- journey_entries
-- ============================================================

create table if not exists public.journey_entries (
  id          uuid primary key default gen_random_uuid(),
  period      text not null,
  title       text not null,
  discipline  text not null default '',
  body        text not null default '',
  highlights  text[] not null default '{}',
  image_path  text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists journey_sort_idx on public.journey_entries (sort_order);

drop trigger if exists journey_set_updated_at on public.journey_entries;
create trigger journey_set_updated_at before update on public.journey_entries
  for each row execute function public.set_updated_at();

-- ============================================================
-- beyond_highlights  (the three cards in the dark "how I work" panel)
-- ============================================================

create table if not exists public.beyond_highlights (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  icon        text not null default 'Sparkles',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists beyond_sort_idx on public.beyond_highlights (sort_order);

-- ============================================================
-- media  (registry of everything uploaded to the storage bucket)
-- ============================================================

create table if not exists public.media (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt          text not null default '',
  width        integer not null default 0,
  height       integer not null default 0,
  bytes        integer not null default 0,
  mime         text not null default 'image/jpeg',
  created_at   timestamptz not null default now()
);

create index if not exists media_created_idx on public.media (created_at desc);

-- ============================================================
-- admins
--
-- Membership of this table is what makes a signed-in user an administrator.
-- `is_admin()` is SECURITY DEFINER so the RLS policies below can consult it
-- without the caller needing read access to the table itself — otherwise every
-- policy that calls it would recurse through the admins policy.
-- ============================================================

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
