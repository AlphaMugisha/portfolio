# Backend

The site's content lives in Supabase: Postgres for the copy, Storage for the
images, and Supabase Auth for the one administrator account.

Everything under `migrations/` is **idempotent** — re-running a file restores
what it describes without duplicating rows or failing on objects that already
exist. Run them in order the first time; after that, run whichever one you
changed.

## Setting it up

### 1. Create the project

[supabase.com](https://supabase.com) → **New project**. Any region; Europe
(Frankfurt) is the closest to Kigali of the usual choices. Keep the database
password somewhere safe — it is not needed for the site, only for `psql`.

### 2. Run the migrations

Dashboard → **SQL Editor** → **New query** → paste each file → **Run**, in
this order:

| File | What it does |
|------|--------------|
| `0001_init.sql` | Enums, tables, indexes, triggers, `is_admin()` |
| `0002_rls.sql` | Row Level Security: public reads, admin-only writes |
| `0003_storage.sql` | The public `media` bucket and its policies |
| `0004_seed.sql` | The site's current content |
| `0005_admin_user.sql` | Promotes one auth user to administrator |

`0005` needs a user to exist first — it explains the two dashboard clicks at
the top of the file.

### 3. Wire the keys

Dashboard → **Settings → API**. Copy the project URL and the **publishable**
key (the one labelled `anon` / `publishable`), then:

```bash
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

The publishable key is designed to ship to browsers — RLS is what protects the
data, not secrecy of that key. **Do not** put the `service_role` key in this
project; nothing here needs it, and it bypasses RLS entirely.

### 4. Sign in

`npm run dev`, then <http://localhost:3000/admin>. Use the address and password
from step 2.

## Regenerating the seed

`0004_seed.sql` is generated, not hand-written:

```bash
node scripts/generate-seed.mjs
```

It reads `lib/projects.ts`, `lib/skills.ts`, `lib/journey.ts` and
`lib/site.ts` — the static data the site shipped with — and emits the SQL with
every value escaped. Edit those modules and re-run it rather than editing the
`.sql` by hand.

Once content is being edited in the admin, the database is the source of truth
and the seed is only useful for rebuilding from scratch.

## Schema at a glance

| Table | Rows | Holds |
|-------|------|-------|
| `site_settings` | exactly 1 | Name, role, links, hero copy, portrait |
| `sections` | one per section | Eyebrow, heading, amber tail, intro |
| `projects` | one per case study | Copy, stack, categories, stats, cover |
| `capabilities` | the "What I do" cards | Title, description, icon, tile colour |
| `skill_groups` / `skills` | the toolbox | Groups and what each tool is used for |
| `journey_entries` | the four stages | Period, title, body, highlights, photo |
| `beyond_highlights` | the dark panel's cards | Title, description, icon |
| `media` | one per upload | Storage path, alt, dimensions |
| `admins` | exactly 1 | Which auth user may write |

`projects.is_published` and `capabilities.is_published` are enforced in RLS,
not in application code: an unpublished row is invisible to an anonymous
reader even if a query asks for it.
