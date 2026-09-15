# Portfolio — Alpha Mugisha

Personal portfolio for a software engineer. Deliberately simple: server-first
pages, plain scrolling, no WebGL, no scroll-driven choreography — it opens
instantly and reads the same on any device.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4.

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm start       # serve the build
npm run lint    # eslint
```

> **Do not run `dev` and `build` at the same time.** They share `.next`, and
> Turbopack and the production bundler write incompatible artifacts there.
> Doing so corrupts the client manifest and every module appears "missing".
> If that happens: stop every Node process for this project, delete `.next`,
> then start one server.

---

## Design system

`app/globals.css` is the source of truth for tokens; Tailwind v4 is
CSS-first, so there is **no `tailwind.config.js`** — everything lives in the
`@theme` block there.

### Palette

A machine-hall grade: blue-black ground, one porcelain light value doing
double duty, one accent.

| Token | Hex | Role |
|---|---|---|
| `ink` / `bg` | `#0B0E14` | The page ground — charcoal pulled toward blue |
| `void` | `#04060A` | Reserved deepest value |
| `panel` | `#242B3A` | Cards and panels sitting ON the ground |
| `paper` / `band-light` | `#B9C7D2` | Porcelain, two roles: the hero band's fill AND the light type on the dark ground |
| `cyan` / `primary` | `#54D1DB` | The one accent — links, active states, marks |
| `ember` | `#FFB466` | A warm counterpoint, used only inside imagery |

Contrast rules that shape the layout: the lightest text permitted on any
ground is `text-muted #7A8892` at **5.30:1**; the cyan clears **10.6:1** on
the ground but sits at **1.06:1** on the light band — so the hero band
carries dark type only (`on-band #0E1319`).

### Typography

| Face | Role |
|---|---|
| **Inter** | Body, navigation, every small tracked label (`meta`) |
| **Anton** | The display face — `text-display` / `text-mega`, uppercase |
| **Mrs Saint Delafield** | The signature: the wordmark and the corner credit |

All loaded via `next/font`, self-hosted, no runtime network request.

### Motion

Almost none, on purpose. The only movement is CSS transitions on hover
(`btn-depth` lift, `media-hover` image lift, color changes) and the loading
skeleton's shimmer — all cancelled under `prefers-reduced-motion`.

---

## Architecture

```
app/
  layout.tsx                fonts, metadata/SEO, header
  page.tsx                  Hero > About > Skills > Projects > Journey > Contact
  globals.css               @theme tokens + a small set of utilities
  opengraph-image.tsx       social card, generated at build (fonts: lib/og-fonts)
  not-found.tsx             404
  global-error.tsx          root error boundary (inline styles by necessity)
  projects/[slug]/page.tsx  case studies (SSG, one per project)

components/
  ui/
    Header.tsx              fixed bar; ink follows the light/dark band under it
    TechIcon.tsx            simple-icons brands + lucide fallbacks
    BrandIcons.tsx          GitHub / LinkedIn SVGs
  sections/
    Hero.tsx                light panel, one statement, two buttons
    About.tsx               portrait, statement, facts, countable figures
    Skills.tsx              four plain group cards with chips
    Projects.tsx            card grid, one card per project
    Journey.tsx             vertical timeline
    Contact.tsx             email, details, footer

lib/
  site.ts                   identity + links
  projects.ts               project data + coverFor()
  skills.ts                 technology groups
  journey.ts                progression entries
  og-fonts/                 vendored TTFs for the OpenGraph card (OFL)

scripts/
  generate-placeholders.js  regenerates public/images
```

Dependencies: `next`, `react`, `react-dom`, `lucide-react`, `simple-icons`.
That is the whole list. Every section except the header is a server
component; the homepage ships ~144 kB of first-load JS.

### Notes on two decisions

**`BrandIcons.tsx` exists because `lucide-react` v1 removed brand icons.**
`Github` and `Linkedin` are no longer exported, so they are inlined as SVG
paths taking the same `size`/`className` props.

**The header reads the page under it.** Every section declares
`data-band="light"` or `data-band="dark"`, and a one-pixel observation strip
level with the header decides whether its ink is dark (over the hero band)
or light (everywhere else).

---

## Images

`public/images/` currently holds **generated placeholders**, not photographs.
They are real JPEGs, so `next/image` optimises them exactly as it will the
real thing — swapping one in is a file replacement and nothing more.

```
public/images/
  hero.jpg                 2000x1300   spare hero plate
  portrait.jpg             1200x1500   About portrait (4:5)
  projects/<slug>.jpg      1600x1200   one per project (4:3)
```

Project covers resolve through `coverFor(slug)` in `lib/projects.ts`, so a new
project only needs a matching filename.

Regenerate with `node scripts/generate-placeholders.js` (uses `sharp`, already
a Next.js dependency).

---

## Content integrity

Nothing here is invented. No fabricated employers, certifications,
testimonials or skill percentages — proficiency bars were deliberately left
out because any number on them would be made up.

Project statistics were read off the running systems, and each case study
carries an `evidence` line naming where its numbers came from. The figures in
About are countable from this portfolio itself; there is no invented "years
of experience" number anywhere.

`lib/journey.ts` describes the *progression* of the work rather than listing
employers, job titles or institutions, because none were supplied. Add real
ones there when you have them.

---

## Before deploying

Values in `lib/site.ts` marked `PLACEHOLDER`:

- `linkedin` — currently a bare LinkedIn URL. **Replace with your profile.**
- `url` — `https://alphamugisha.dev`; update to the real domain so canonical
  and OpenGraph URLs resolve.

Replace the placeholder imagery (above). The OpenGraph card is generated at
build time from `app/opengraph-image.tsx` — it picks up `lib/site.ts`
automatically, so it needs no edits when the values above change.
