-- 0002_rls.sql
-- Row Level Security.
--
-- The shape is the same everywhere: anonymous visitors may SELECT what the
-- public site needs, and only an administrator may write anything. The site
-- reads with the publishable key, so these policies — not the application —
-- are what actually stop a stranger editing the portfolio.
--
-- Idempotent: every policy is dropped before it is created.

alter table public.site_settings     enable row level security;
alter table public.sections          enable row level security;
alter table public.projects          enable row level security;
alter table public.capabilities      enable row level security;
alter table public.skill_groups      enable row level security;
alter table public.skills            enable row level security;
alter table public.journey_entries   enable row level security;
alter table public.beyond_highlights enable row level security;
alter table public.media             enable row level security;
alter table public.admins            enable row level security;

-- ---------- site_settings ----------
-- One row, entirely public: it is the name, role and links already printed on
-- every page. There is no INSERT policy because 0001 creates the only row.
drop policy if exists site_settings_select on public.site_settings;
create policy site_settings_select on public.site_settings for select
  using (true);

drop policy if exists site_settings_update on public.site_settings;
create policy site_settings_update on public.site_settings for update
  using (public.is_admin()) with check (public.is_admin());

-- ---------- sections ----------
drop policy if exists sections_select on public.sections;
create policy sections_select on public.sections for select
  using (true);

drop policy if exists sections_write on public.sections;
create policy sections_write on public.sections for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- projects ----------
-- An unpublished project is invisible to the public but visible to the admin,
-- which is what makes "save as draft, publish later" work.
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects for select
  using (is_published or public.is_admin());

drop policy if exists projects_write on public.projects;
create policy projects_write on public.projects for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- capabilities ----------
drop policy if exists capabilities_select on public.capabilities;
create policy capabilities_select on public.capabilities for select
  using (is_published or public.is_admin());

drop policy if exists capabilities_write on public.capabilities;
create policy capabilities_write on public.capabilities for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- skill_groups ----------
drop policy if exists skill_groups_select on public.skill_groups;
create policy skill_groups_select on public.skill_groups for select
  using (true);

drop policy if exists skill_groups_write on public.skill_groups;
create policy skill_groups_write on public.skill_groups for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- skills ----------
drop policy if exists skills_select on public.skills;
create policy skills_select on public.skills for select
  using (true);

drop policy if exists skills_write on public.skills;
create policy skills_write on public.skills for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- journey_entries ----------
drop policy if exists journey_select on public.journey_entries;
create policy journey_select on public.journey_entries for select
  using (true);

drop policy if exists journey_write on public.journey_entries;
create policy journey_write on public.journey_entries for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- beyond_highlights ----------
drop policy if exists beyond_select on public.beyond_highlights;
create policy beyond_select on public.beyond_highlights for select
  using (true);

drop policy if exists beyond_write on public.beyond_highlights;
create policy beyond_write on public.beyond_highlights for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- media ----------
-- The bucket is public, so the rows describing it may as well be: hiding the
-- metadata for a file anyone can fetch by URL buys nothing.
drop policy if exists media_select on public.media;
create policy media_select on public.media for select
  using (true);

drop policy if exists media_write on public.media;
create policy media_write on public.media for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- admins ----------
-- Readable only by administrators, and never written through the API — adding
-- an admin is a deliberate SQL statement (see 0005_admin_user.sql). There is
-- no write policy at all, so even an authenticated admin cannot promote
-- somebody else from the browser.
drop policy if exists admins_select on public.admins;
create policy admins_select on public.admins for select
  using (public.is_admin());
