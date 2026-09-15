# Portfolio — Alpha Mugisha

Personal portfolio for a software engineer — conventional structure,
agency-grade motion, and a WebGL depth layer that degrades to a designed
flat composition rather than an empty box.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · Lenis · Three.js (React Three Fiber + drei).

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

The design's structure was measured off a reference reel (`inspo.mp4`) —
type ratios, motion curves, the palette's contrast architecture — and its
hues were then re-graded into the site's own look; every value in the code
carries a comment saying which of the two it is. `app/globals.css` is the source
of truth for tokens; Tailwind v4 is CSS-first, so there is **no
`tailwind.config.js`** — everything lives in the `@theme` block there.

### Palette

The reel supplied the structure (one ground, one void, one double-duty light
value, one accent, and the contrast floors); the hues are this site's own
grade — a machine hall at night:

| Token | Hex | Role |
|---|---|---|
| `ink` / `bg` | `#0B0E14` | The page ground — charcoal pulled toward blue |
| `void` | `#04060A` | Menu overlay — the only thing deeper than the ground |
| `panel` | `#242B3A` | Case-study panels, sitting ON the ground |
| `paper` / `band-light` | `#B9C7D2` | Porcelain, two roles: the opening band's fill AND the light type on the dark ground |
| `cyan` / `primary` | `#54D1DB` | Instrument cyan — the one accent ink. Links, active states, the constellation |
| `ember` | `#FFB466` | Tungsten counterlight. Never an ink — it exists only as light inside the WebGL depth |

Contrast rules that shape the layout: the lightest text permitted on any
ground is `text-muted #7A8892` at **5.30:1**; the cyan clears **10.6:1** on
the ground but sits at **1.06:1** on the light band — so the band carries
dark type only (`on-band #0E1319`), the same rule as the reel, harder.

### Typography

Four faces, each earning its slot:

| Face | Role |
|---|---|
| **Inter** | Body, navigation, every small tracked label (`meta`, 0.2em tracking, uppercase) |
| **Anton** | The display face — `text-mega`, uppercase, 0.78 leading. The opening word is set enormous and compressed with a measured `scaleX`; no Inter weight survives at 20vw |
| **Poppins 700** | The menu overlay only — a different voice from both, and the overlay is prominent enough to justify the one extra weight |
| **Mrs Saint Delafield** | The signature: wordmark, corner credit, preloader greeting |

All loaded via `next/font`, self-hosted, no runtime network request.

### Motion

Canonical values live in `lib/motion.ts` so no component retypes a duration.
Two curves, both measured off the reel:

- **SETTLE** — everything that arrives. Eases out and comes to rest; never
  bounces or springs past. This is the site's voice.
- **CURTAIN** — things that cover and uncover: the menu, the preloader wipe.

Reduced motion is honoured in three layers: the CSS media query cancels
keyframes, each component checks `useReducedMotion()`, and Lenis
smooth-scroll never initialises at all. The WebGL layer adds a fourth:
`useCapability` reports the lowest tier until the client has measured, so
the server render and the first paint always agree.

### The depth system

The page is staged as one room the camera travels through, built from two
cooperating halves:

**DOM depth** — `Deep` establishes a real CSS perspective stage and each
`DeepLayer` sits at a true `translateZ`, so the browser's own projection does
the physics: deeper layers render smaller and travel less per pixel of
parallax, automatically. `Approach` wraps every non-pinned section so content
dollies up from behind the focal plane instead of fading in — the
section-to-section grammar.

**WebGL depth** — every scene mounts inside `Stage`
(`components/three/Stage.tsx`), which decides whether the device earned a
canvas at all (everyone else gets a designed flat fallback), pauses rendering
offscreen, and survives context loss. The scenes:

- `HeroCutScene` + `CutSheet` — the opening word shaded as an aperture cut
  through the light band. The letterforms come from a signed distance field
  (`lib/sdf.ts`) rasterised from the **live heading** — same face, same
  clamp, same compression — with the expensive exact distance transform
  (`lib/edt.ts`, 8SSEDT) run in a Worker (`lib/sdf.worker.ts`).
- `Atmosphere` — a fixed, full-viewport dust field that persists from the
  hero cut to the foot of the page. Sections come and go; the air stays.
- `PlateRack` (driven by `sections/ProjectRack`) — the gallery as mounted
  plates receding into the dark; each photograph sits oversized *behind* a
  real aperture, so the parallax is geometry, not a transform faking it.
  The hall around it is drawn with a floor grid that pools around the
  camera and a tungsten halo that blooms behind the plate being read.
- `SkillField` — the skill groups as constellations strung into depth along
  the same aisle the rack uses, joined hub to hub by a sagging cyan
  filament that brightens on the leg being travelled.

The Journey dolly stays pure CSS, but its ground is real: the footer's
floor grid, streaming toward the camera at dolly speed.

The division of labour is fixed: **WebGL carries photography and space, the
DOM carries every word.** Headings, summaries and links are real, selectable,
crawlable markup in all of these; the canvas can be removed and the page
still reads.

One pointer serves all of it: `lib/pointer.ts` attaches a single listener
and publishes MotionValues; anything that leans, tilts or glows toward the
cursor subscribes without a React re-render. `lib/palette.ts` mirrors the
CSS tokens for Three.js materials and asserts in development that the mirror
has not drifted from `globals.css`.

---

## Architecture

```
app/
  layout.tsx                fonts, metadata/SEO, global chrome, Atmosphere
  page.tsx                  Hero > About > Skills > Projects > Journey > Contact
  globals.css               @theme tokens + custom utilities (source of truth)
  opengraph-image.tsx       social card, generated at build (fonts: lib/og-fonts)
  not-found.tsx             404
  global-error.tsx          root error boundary (inline styles by necessity)
  projects/[slug]/page.tsx  case studies (SSG, one per project)

components/
  three/
    Stage.tsx               the shell every scene mounts in (gating, pausing)
    HeroCutScene.tsx        drives the hero cut: measuring, handoff, quality
    CutSheet.tsx            the word as an aperture, shaded not modelled
    Atmosphere.tsx (+Lazy)  the persistent dust field
    PlateRack.tsx           project covers as plates with real apertures
    SkillField.tsx          skills as constellations in depth
  ui/
    Header.tsx              floating band-aware header (ink follows the page)
    Preloader.tsx           opening curtain, once per session
    PageTransition.tsx      route enter transition
    Chrome.tsx              reading-progress rail
    SmoothScroll.tsx        Lenis
    Cursor.tsx              dot + lagging ring, data-cursor labels
    Deep.tsx                true CSS perspective stages (Deep/DeepLayer/DeepWord)
    Approach.tsx            the section-to-section approach grammar
    RevealImage.tsx         the flat image signature (unmask, settle, drift)
    LiquidText.tsx          the melting headline (SVG displacement on live text)
    SplitText.tsx           per-letter entrance for the display type
    GooText.tsx             the poured WORK title (metaball filter, lower quarter)
    Tilt.tsx                pointer tilt with per-child depth separation
    Magnetic.tsx            magnetic pull, label travels further than hit area
    Marquee.tsx             seamless ticker (same direction, 1.7:1 speeds)
    HoverPreview.tsx        cursor-tethered preview plate
    RotatingSeal.tsx        circular set type around a fixed glyph
    TechIcon.tsx            simple-icons brands + lucide fallbacks
    motion-primitives.tsx   Reveal / Stagger / Parallax / TextReveal / Counter
    BrandIcons.tsx          GitHub / LinkedIn SVGs
    useCapability.ts        one decision: canWebGL, tier, reducedMotion, pointer
  sections/
    Hero / About / Skills / Projects / Journey / Contact (+ footer)
    WorkStatement.tsx       the pinned statement card with the turning name
    ProjectRack.tsx         scroll -> one number -> camera + DOM copy

lib/
  site.ts                   identity + links
  projects.ts               project data + coverFor()
  skills.ts                 technology groups
  journey.ts                progression entries
  motion.ts                 the canonical curves and durations
  palette.ts                CSS tokens mirrored for WebGL, with a drift assert
  pointer.ts                one shared pointer as MotionValues
  sdf.ts / edt.ts / sdf.worker.ts   the hero word's distance field
  og-fonts/                 vendored TTFs for the OpenGraph card (OFL)

scripts/
  generate-placeholders.js  regenerates public/images
```

### Notes on three decisions

**`BrandIcons.tsx` exists because `lucide-react` v1 removed brand icons.**
`Github` and `Linkedin` are no longer exported, so they are inlined as SVG
paths taking the same `size`/`className` props.

**Scroll drives one number in the pinned scenes.** In `ProjectRack` the
scroll position resolves to "which plate is being read", and the camera, the
lighting, the saturation and the DOM copy are all derived from that single
value — so the 3D and the text can never disagree about what the reader is
looking at.

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
and everything else follows — `RevealImage` and the rack size them by CSS and
texture cover math, not by intrinsic dimensions.

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
