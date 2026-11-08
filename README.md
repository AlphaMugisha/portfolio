# Portfolio — Alpha Mugisha

Personal portfolio for a software engineer who also builds hardware. The
site is designed as **one continuous signal travelling through a system** —
off a physical sensor edge, through logic, into a model, out to people —
because that is literally the span of the work it documents.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Three.js /
React Three Fiber (hero only, lazy) · GSAP ·
Lenis · Supabase (optional).

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

Alpha's original identity, recovered from commit `9d3243d` and documented
with its provenance in **[PALETTE.md](PALETTE.md)**. Amber leads; lime is
reserved for small marks; the page is dark throughout and builds rhythm by
stepping the greys rather than flipping to a light surface.

| Token | Value | Role |
|---|---|---|
| `--color-ink` | `#0E0E0E` | the ground; page background |
| `--color-ink-deep` | `#080808` | wells, overlays, the menu shutter |
| `--color-ink-raised` / `-band` / `-high` | `#161616` / `#191919` / `#232323` | the rhythm ramp |
| `--color-signal` | `#FEB002` | **amber — "the accent that carries the page"** (10.5:1) |
| `--color-signal-bright` | `#FFC23A` | hover / lit step |
| `--color-signal-deep` | `#6B4A00` | the same hue walked down, for hairline traces |
| `--color-lime` | `#8FDC3C` | secondary — small technical marks only (10.6:1) |
| `--color-text` / `-muted` / `-subtle` | `#F2F2F2` / `#B4B4B4` / `#828282` | 17.3:1 / 9.2:1 / 5.0:1 |

Where four disciplines must be told apart (the Signal Map), they are
separated by **stroke pattern, node geometry and intensity** — circles for
tools, squares for projects, dashed hollow for "no shipped reference" —
never by inventing a second hue.

### Typography

- **Space Grotesk** — display. Enough engineered character to carry the name
  at 11rem.
- **IBM Plex Sans** — body. Reads long-form without fighting the display face.
- **Space Mono** — the instrument face: every annotation, register and readout.

All three are self-hosted through `next/font`, so there is no render-blocking
request to a font CDN and no layout shift when they land.

### Shape

Chamfered corners (`.board`), hairline rules, and registration ticks
(`.ticks`) drawn with gradients rather than extra DOM. No rounded floating
cards, no blobs, no glass.

### Motion

Three curves, each with a job (`lib/motion.ts`): `signal` (the house curve,
everything that arrives), `snap` (direct responses to input), `draw`
(strokes and scroll scrubs).

`Reveal` provides a *vocabulary* rather than one fade-up — `rise`, `stack`,
`wipe`, `curtain`, `scale`, `unmask` — matched to what is being revealed.
Reveal start states live in CSS behind a `.js` class added before first
paint, so there is no flash before hydration and **no JavaScript means
nothing is ever hidden**.

Every animated component checks `prefers-reduced-motion` and renders its
**end state**, never an empty one. Under reduced motion: no preloader, no
Lenis, no pins or scrubs, no looping ambient motion, custom cursor disabled.

---

## Architecture

```
app/
  layout.tsx                fonts, metadata/SEO, boot + scroll + cursor systems
  page.tsx                  the one scroll, 00..08 + contact
  globals.css               @theme tokens + utilities + reveal start states
  opengraph-image.tsx       social card, generated at build (fonts: lib/og-fonts)
  not-found.tsx             404
  global-error.tsx          root error boundary (inline styles by necessity)
  projects/[slug]/page.tsx  case studies (SSG, one per project)

components/
  system/
    Boot.tsx                power-on sequence; publishes `ready` via context
    SmoothScroll.tsx        Lenis driven by GSAP's ticker (one clock)
    Cursor.tsx              probe + trailing ring, magnetic, labelled
  three/
    HeroStage.tsx           picks 3D or 2D; owns every capability gate
    EngineeringCore.tsx     the custom 3D artifact (lazy, ssr:false)
  sections/
    Hero.tsx                the composition; waits on Boot's `ready`
    ReactiveBoard.tsx       the 2D canvas lattice — also the WebGL fallback
    About.tsx               the datasheet, on the #191919 step
    Capabilities.tsx        the channel rail (0fr->1fr height transition)
    WorkRack.tsx            pinned horizontal rack; software vs hardware frames
    ProjectIndex.tsx        the directory + cursor-trailing preview plate
    SignalMap.tsx           the bipartite trace diagram (the claim checker)
    Journey.tsx             scrubbed rail + sticky stage readout
    Beyond.tsx              operating principles — the quiet beat
    GithubActivity.tsx      live repos, framed as command output
    Contact.tsx             closing type + live Kigali clock
  ui/
    KineticText.tsx         per-character masked type build
    Reveal.tsx              the scroll-entrance vocabulary
    Magnetic.tsx            controls that lean toward the pointer
    MenuCurtain.tsx         the full-screen index (GSAP enter/exit)
    Navbar.tsx              progress rail + live section readout
    Footer.tsx              wordmark with a pointer-tracked beam
    Counter.tsx, SectionHeader.tsx, Marquee.tsx, TechIcon.tsx, ...

lib/
  gsap.ts                   one registration point for ScrollTrigger
  motion.ts                 easing vocabulary + reduced-motion hook
  signal-map.ts             builds the diagram from DB rows (derived, never authored)
  tool-usage.ts             the tool <-> project matcher (exact + alias)
  github.ts                 live GitHub read, returns null on any failure
  db/public.ts              Supabase reads with static fallback
  site.ts, projects.ts, skills.ts, journey.ts
```

Runtime dependencies: `next`, `react`, `react-dom`, `three`,
`@react-three/fiber`, `@react-three/drei`, `gsap`, `@gsap/react`, `lenis`,
`lucide-react`, `simple-icons`, `@supabase/*`, `zod`. The homepage ships
~221 kB of first-load JS — three.js is **not** in that figure because the
3D scene is a lazy `next/dynamic` chunk fetched only when a device passes
the gates below.

### Notes on a few decisions

**The 3D hero is genuinely optional.** `HeroStage` gates it on reduced
motion, viewport width, WebGL availability, and core/memory on touch
devices; anything that fails falls through to `ReactiveBoard`, the 2D
canvas built for this same hero. Nothing about the HTML, the first paint,
or any other section depends on WebGL.

**Phones get the 2D hero on purpose.** A layered stack framed for a wide
canvas fills a 390px portrait viewport and cuts across the headline — the
2D version is simply better at that size, and costs no GPU time. "Adapted
for mobile" means shipping the version that is actually better there.

**Every object in the scene is generated from primitives.** Plates,
traces, vias, chips, capacitors, pin headers and LEDs are all code — no
downloaded model, no texture standing in for geometry. Repeated elements
are single `InstancedMesh`es, so the whole scene is a handful of draw
calls.

**Materials are near-zero metalness.** `meshStandardMaterial` takes its
metallic response from reflections, and the scene has no environment map,
so any real metalness rendered the plates black. Point lights use
`decay={0}` for the same reason — physically-correct falloff left the
object unlit at this distance.

**One scroll clock.** Lenis is driven by GSAP's ticker and calls
`ScrollTrigger.update` itself, with `lagSmoothing(0)`. Without that sync the
two run on different clocks and every pinned section drifts.

**Touch is not a scaled-down desktop.** The work rack pins and scrubs
horizontally on pointer devices and becomes a native scroll-snap carousel on
touch; the Signal Map is an SVG diagram from `md` up and a patch list below
it. `gsap.matchMedia` owns the switch, so rotating a tablet rebuilds the
correct behaviour.

**`BrandIcons.tsx` exists because `lucide-react` v1 removed brand icons.**
`Github` and `Linkedin` are no longer exported, so they are inlined as SVG
paths taking the same `size`/`className` props.

**Framer Motion was removed.** Its last job was the menu's exit animation;
doing that by hand (holding `mounted` true until the outbound timeline
finishes) dropped ~48 kB from every page.

---

## Images

`public/images/` currently holds **generated placeholders**, not photographs,
except `portrait.jpg` which is real. They are real JPEGs, so `next/image`
optimises them exactly as it will the real thing — swapping one in is a file
replacement and nothing more.

```
public/images/
  hero.jpg                 2000x1300   spare hero plate
  portrait.jpg             1200x1500   About portrait (4:5)
  projects/<slug>.jpg      1600x1200   one per project (4:3)
  journey/<stage>.jpg      stage imagery
```

Project covers resolve through `cover_path` (DB) or `coverFor(slug)` in
`lib/projects.ts`, so a new project only needs a matching filename.

---

## Content integrity

Nothing here is invented. No fabricated employers, certifications,
testimonials or skill percentages — proficiency bars were deliberately left
out because any number on them would be made up.

Project statistics were read off the running systems, and each case study
carries an `evidence` line naming where its numbers came from. The figures in
About are **counted from the data at build time**, not typed in. The Signal
Map's edges are derived by matching each tool against the `stack` array every
project already declares, so the diagram cannot flatter the case studies — a
tool with no shipped reference is drawn hollow and the header counts the gap.

GitHub activity is read live and shows an explicit unavailable state on
failure rather than stale or invented numbers.

`lib/journey.ts` describes the *progression* of the work rather than listing
employers, job titles or institutions, because none were supplied. Add real
ones there when you have them.

### Originality

Every component, token and interaction here is original to this project. An
earlier iteration had been reskinned from another developer's downloaded
source; that work was removed in full and rebuilt clean-room. Do not
reintroduce reference material from other portfolios.

---

## Before deploying

Values in `lib/site.ts` marked `PLACEHOLDER`:

- `linkedin` — currently a bare LinkedIn URL. **Replace with your profile.**
- `url` — `https://alphamugisha.dev`; update to the real domain so canonical
  and OpenGraph URLs resolve.
- `cv` — drop the real file at `public/alpha-mugisha-cv.pdf` and the
  Download CV button works as-is.

Replace the placeholder imagery (above). The OpenGraph card is generated at
build time from `app/opengraph-image.tsx` — it picks up site settings
automatically, so it needs no edits when the values above change.

Supabase is optional: with no `.env.local` the site renders from the static
modules in `lib/`. See `backend/README.md` to connect a database.

## Mission and Goals

**Mission:** Present Alpha Mugisha's software engineering work in a clear, fast, accessible portfolio that helps visitors understand the projects, technologies, and thinking behind them.

**Goals:**
- Make projects and case studies easy to discover and review.
- Explain skills and learning progress honestly, without unsupported claims.
- Provide clear ways to connect and discuss potential collaboration.
- Keep the experience responsive, accessible, and lightweight.

## Project maintenance

Keep project descriptions, links, screenshots, and contact details aligned with the current implementation. Replace any clearly marked placeholder content before public launch.
