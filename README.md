# Portfolio — Alpha Mugisha

Professional personal portfolio for a software engineer — conventional
structure, agency-grade motion.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Lenis.

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

### Palette

Referenced from [tuyishimireeric.github.io](https://tuyishimireeric.github.io/),
whose own CSS variables are:

```css
--main-color:   #f2f2f2;   /* off-white text   */
--third-color:  #828282;   /* muted grey       */
--fith-color:   #FEB002;   /* amber            */
--second-color: #70ff00;   /* lime             */
--dark-color:   #161616;   /* near-black       */
body: linear-gradient(130deg, #000, #272727 58%, #727272);
```

**Kept:** the diagonal charcoal-to-grey ground, the off-white text, the muted
grey, and amber as the accent that carries the page.

**Changed:** amber leads instead of the lime, and the lime is toned to
`#8FDC3C` for small marks only. At full `#70ff00` it reads as the neon hacker
look this site is deliberately not. The gradient is also pulled back (ending
at `#303030` rather than `#727272`) so text at the foot of a long page keeps
its contrast, and it is `background-attachment: fixed` so it reads as a ground
the content moves over rather than a band that scrolls along with it.

Tailwind v4 is CSS-first, so there is **no `tailwind.config.js`**. All tokens
live in the `@theme` block at the top of `app/globals.css`.

| Token | Hex | Role |
|---|---|---|
| `ink` / `bg` | `#0E0E0E` | Deepest ground |
| `bg-raised` | `#191919` | Alternating band |
| `surface` | `#232323` | Cards and panels |
| `paper` | `#F2F2F2` | Light pills, text over imagery |
| `primary` / `amber` | `#FEB002` | Links, fills, active states |
| `on-primary` | `#0E0E0E` | Text sitting **on** an amber fill |
| `accent` / `lime` | `#8FDC3C` | Secondary marks |
| `text-primary` | `#F2F2F2` | Headings and body |
| `text-secondary` | `#B4B4B4` | Secondary copy |
| `text-muted` | `#828282` | Metadata — lightest text permitted |

Contrast measured against `#0E0E0E`:

- `text-primary #F2F2F2` → **17.3:1**
- `text-secondary #B4B4B4` → **9.2:1**
- `text-muted #828282` → **5.0:1**. Nothing lighter is used for text.
- `primary #FEB002` → **10.5:1**, and `#0E0E0E` on an amber fill → **10.5:1**.
- `accent #8FDC3C` → **10.6:1**.

Sections that need separation use the `band` utility — a translucent panel
rather than an opaque fill, so the gradient ground still shows through.

### Typography

**Inter, throughout.** One family covering three roles, separated by weight,
size and tracking rather than by typeface:

| Role | Treatment |
|---|---|
| Display | `text-display` — 600, `-0.028em` tracking, 1.04 leading |
| Body | 400, default tracking |
| Label | `eyebrow` — 600, uppercase, `0.16em` tracking, 11px |

Loaded via `next/font`, self-hosted, no runtime network request. Headings
scale with `clamp()` rather than breakpoints.

A single-family system needs the weight and tracking steps to do all the work
the second typeface used to, which is why the display tracking is negative and
the label tracking strongly positive — that contrast is what keeps hierarchy
legible without a contrasting face.

### Motion

Four rules, applied everywhere, so the animation reads as one system rather
than a collection of effects:

1. Everything **eases out** (`cubic-bezier(0.16, 1, 0.3, 1)`). Content arrives
   and settles — it never bounces or springs past.
2. Motion enters from **below** or fades. Never sideways, never rotating.
3. Durations sit between **0.6s and 1.6s** — deliberate, never a wait.
4. Every primitive returns a **static element** under `prefers-reduced-motion`.

Reduced motion is honoured in three layers: the CSS media query cancels
keyframes, each component checks `useReducedMotion()`, and Lenis smooth-scroll
never initialises at all.

### The signature: `RevealImage`

Every photograph performs the same three-part move, which is what makes the
page read as one idea rather than a catalogue of effects:

1. the frame **unmasks upward** behind a `clip-path` wipe,
2. the photograph **settles** from a slight overscale, and
3. thereafter it **drifts** against the scroll inside the fixed frame.

The drift is what sells depth — the frame holds still while its contents move,
which is how a real parallax plate behaves.

### Structure

Section numbering was removed. The sections are not a sequence a reader must
follow in order, so numbering them decorated rather than informed. Numbers
survive in exactly two places, both carrying real information: the Journey
timeline (chronological) and the project index (`03 / 08` — position in a
curated set).

---

## Architecture

```
app/
  layout.tsx              fonts, metadata/SEO, global chrome
  page.tsx                Hero > About > Skills > Projects > Journey > Contact
  globals.css             @theme tokens + custom utilities
  not-found.tsx           404
  global-error.tsx        root error boundary (inline styles by necessity)
  projects/[slug]/page.tsx  case studies (SSG, one per project)

components/
  ui/
    Nav.tsx               scroll-aware bar, hides down / returns up
    Preloader.tsx         opening curtain, once per session
    PageTransition.tsx    route enter transition
    Chrome.tsx            reading-progress rail
    SmoothScroll.tsx      Lenis
    RevealImage.tsx       the signature image treatment
    motion-primitives.tsx Reveal / Stagger / Parallax / MediaParallax /
                          TextReveal / Counter
    SectionHeading.tsx    eyebrow + self-drawing rule
    BrandIcons.tsx        GitHub / LinkedIn SVGs
  sections/
    Hero / About / Skills / Projects / Journey / Contact (+ footer)

lib/
  site.ts                 identity + links
  projects.ts             project data + coverFor()
  skills.ts               technology groups
  journey.ts              progression entries

scripts/
  generate-placeholders.js  regenerates public/images
```

### Notes on three decisions

**`BrandIcons.tsx` exists because `lucide-react` v1 removed brand icons.**
`Github` and `Linkedin` are no longer exported, so they are inlined as SVG
paths taking the same `size`/`className` props.

**The projects gallery switches layout in CSS, not JavaScript.** Desktop pins
the section and slides the row horizontally; touch gets a native snap
carousel. Switching on a media-query state would serve the carousel and then
snap to the pinned layout after mount — a visible jump on every desktop load.
Here the DOM is identical either way and only the transform value changes.

**Page transitions are enter-only.** A true exit animation needs the outgoing
route to stay mounted, which the App Router will not do without holding
navigation back — a trade that costs real perceived speed for polish nobody
asked for.

---

## Images

`public/images/` currently holds **generated placeholders**, not photographs.
They are real JPEGs, so `next/image` optimises them exactly as it will the
real thing — swapping one in is a file replacement and nothing more.

```
public/images/
  hero.jpg                 2000x1300   hero plate
  portrait.jpg             1200x1500   About portrait (4:5)
  projects/<slug>.jpg      1600x1200   one per project (4:3)
```

Project covers resolve through `coverFor(slug)` in `lib/projects.ts`, so a new
project only needs a matching filename.

Regenerate with `node scripts/generate-placeholders.js` (uses `sharp`, already
a Next.js dependency).

**Replacing them with real photographs:** keep the filenames and aspect ratios
and everything else follows — `RevealImage` and the card grid size them by
CSS, not by intrinsic dimensions.

---

## Content integrity

Nothing here is invented. No fabricated employers, certifications,
testimonials or skill percentages — proficiency bars were deliberately left
out because any number on them would be made up.

Project statistics were read off the running systems, and each case study
carries an `evidence` line naming where its numbers came from. The three
figures in About are countable from this portfolio itself; there is no
invented "years of experience" number anywhere.

`lib/journey.ts` describes the *progression* of the work rather than listing
employers, job titles or institutions, because none were supplied. Add real
ones there when you have them.

---

## Before deploying

Values in `lib/site.ts` marked `PLACEHOLDER`:

- `linkedin` — currently a bare LinkedIn URL. **Replace with your profile.**
- `url` — `https://alphamugisha.dev`; update to the real domain so canonical
  and OpenGraph URLs resolve.

Replace the placeholder imagery (above), and optionally add an OpenGraph image
at `app/opengraph-image.png` (1200x630) — the metadata already declares
`summary_large_image`.
