# Style reference

The design system this portfolio runs on. Every value here is lifted from
`app/globals.css` as it stands today — if the two disagree, the CSS is right
and this file is stale.

- **Tokens** — `app/globals.css`
- **Page grid and section header** — `components/ui/Section.tsx`
- **Reveal primitives** — `components/ui/motion-primitives.tsx`

---

## Colour

Sampled from the reference video, then measured. Ratios are against white.
The lightest ink permitted anywhere is 6.00:1, comfortably past the 4.5:1
floor for body text.

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--color-bg`, `--color-surface` | `#FFFFFF` | Ground **and** card — the page is plain white | — |
| `--color-bg-raised` | `#F4F6F8` | Chips, wells, the toolbox reader | — |
| `--color-void` | `#FAFBFC` | Footer, a half-step off white | — |
| `--color-primary` | `#0A6EFA` | Accent: fills, borders, large type | 4.54:1 |
| `--color-primary-strong` | `#0B5ED1` | The same blue darkened — small text only | 5.94:1 |
| `--color-primary-light` | `#E7F0FD` | Active pills, tinted states | — |
| `--color-text-primary` | `#393A3D` | Headings, primary text | 11.37:1 |
| `--color-text-secondary` | `#55585E` | Body copy, supporting lines | 7.13:1 |
| `--color-text-muted` | `#61636A` | Labels, captions — lightest allowed | 6.00:1 |
| `--color-line` | `#DADBE0` | Hairlines, dividers | — |
| `--color-line-panel` | `#DFE3EA` | The card edge specifically | — |
| `--color-line-strong` | `#C6CAD4` | Secondary button borders | — |

**Why there are two blues.** The sampled `#0A6EFA` clears 4.54:1 on white,
which is fine for fills and large type. At label size it drops to 3.73:1 on
the ground and 3.95:1 on its own active pill — both short of AA. Small accent
text uses `#0B5ED1` instead: same hue, one step darker, 5.94:1.

**Why the card edge is darker than the hairline.** A white card on a white
ground has nothing to contrast against, so `--color-line-panel` has to hold
the card's shape on its own. A normal hairline is too faint for that job.

### Background washes

Two very wide, very faint radial fields sit behind every section
(`components/ui/Wash.tsx`), alternating side down the page so consecutive
sections don't look like the same image repeated.

```
--grid-wash-accent: rgba(10, 110, 250, 0.10)
--grid-wash-ink:    rgba(124, 92, 255, 0.07)
```

They exist so the white reads as *lit* rather than blank. There used to be a
survey grid here as well; on a white page it read as graph paper — a texture
nothing else on the site repeats, competing with the type it sat behind.

---

## Typography

Four faces, one job each. A face with no job does not appear.

| Face | Variable | Job |
|---|---|---|
| Space Grotesk | `--font-display` | Display headings |
| Inter | `--font-sans` | Running text |
| Poppins | `--font-geometric` | Chrome: labels, nav, buttons, counts |
| Mrs Saint Delafield | `--font-script` | The wordmark and signature plate, nowhere else |

### Scale

| Utility | Face | Weight | Tracking | Leading | Used for |
|---|---|---|---|---|---|
| `.text-mega` | Space Grotesk | 700 | −0.038em | 0.95 | Hero line, section headings |
| `.text-display` | Space Grotesk | 600 | −0.025em | 1.06 | Project titles, card headings |
| `.text-editorial` | Inter | 300 | −0.022em | 1.14 | Statement lines |
| `body` | Inter | 400 | — | 1.65 | Running text, **17px** |
| `.eyebrow` | Poppins | 600 | 0.14em | — | 0.8rem, uppercase, accent-strong |
| `.meta` | Poppins | 500 | 0.11em | — | 0.75rem, uppercase, muted |
| `.script` | Delafield | 400 | 0.01em | — | Wordmark |

**Headings are mixed case.** The previous display face (Anton) only worked in
capitals, which forced every heading on the site to shout.

**Headings are sentences, not labels.** "Work" says what a section is filed
under; "Things I have built and shipped" says what you are about to look at.
The closing clause takes the accent colour.

---

## Geometry and elevation

| Token | Value | Used for |
|---|---|---|
| `--radius-card` | `22px` | Cards, panels, the big email button |
| `--radius-tile` | `15px` | Media inside a card, icon tiles |
| `--radius-pill` | `11px` | Buttons, nav rows |
| — | `999px` | Chips, badges, status pills |

```css
--shadow-card: 0 1px 2px  rgba(30,41,59,.05),   /* contact — seats the card */
               0 6px 16px rgba(30,41,59,.06),   /* near lift */
               0 18px 40px rgba(30,41,59,.05);  /* far lift */

--shadow-lift: 0 2px 4px   rgba(30,41,59,.05),
               0 10px 20px rgba(30,41,59,.07),
               0 28px 56px rgba(10,110,250,.12); /* tinted on hover */

--ring-hover:  rgba(10,110,250,.38);             /* what actually reads */
```

On a light ground a shadow alone is nearly invisible on hover. The **tinted
hairline** is what the eye picks up; the shadow only supports it.

---

## Motion

| Token | Value |
|---|---|
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-in-out-quart` | `cubic-bezier(0.76, 0, 0.24, 1)` |

Durations: **0.2s** colour · **0.35s** transform · **0.85s** entrance.

Everything eases *out* — content arrives and settles, it never bounces.
Motion enters from below or fades; never sideways, never rotating. Every
primitive returns a plain static element under `prefers-reduced-motion`.

---

## Rules worth keeping

Each of these was a bug or a bad result first. They are the parts of the
system most likely to be undone by accident.

### Tracking falls as size rises

Wide letterspacing is what makes tiny caps legible; at a larger size the same
value only looks loose. The eyebrow went `0.6875rem / 0.18em` →
`0.8rem / 0.14em`. Bigger **and** tighter.

### Inner radius = outer radius − padding

A card at 22px with `p-2` (8px) needs a **14px** inner radius on its image, or
the image corner drifts inside the card corner instead of sitting concentric
with it.

### Type size goes on `body`, never `html`

The spacing scale is rem-based. Moving the root inflates every margin, gap and
padding on the site along with the type — the page grows rather than reads
larger.

### Never nest a reveal inside `TiltCard`

Its 3D-transformed layer stops the viewport observer firing. Wrap `TiltCard`
**in** the reveal instead of putting the reveal inside it.

### Reveals use `useInView`, not `whileInView`

They look equivalent and are not. `whileInView` does not fire when a section
is reached by an instant jump — a deep link, or `scrollIntoView` — leaving
every heading in that section stuck at `opacity: 0`. `useInView` attaches its
observer in an effect and evaluates the element's position when it does, so
arriving already-in-view is the normal path rather than an edge case.

> Both of the above matter more than a missing animation: **a reveal that
> never runs is not "unanimated", it is invisible.** A whole section rendered
> blank because of this.

### Faded out is not gone

An `opacity: 0` button still takes clicks, still takes tab focus, and is still
announced by a screen reader. The hero flips `visibility` at the end of its
fade because those controls stay on screen for roughly 200px afterwards.

### Shadows are grey-blue, never black

A black shadow on a light ground reads as dirt.

### Don't invent claims

Two things were deliberately left out because nobody supplied them:

- **No proficiency levels.** The reference site labels each skill
  Strong / Comfortable / Learning. Those are self-assessments; the project
  count sits in that slot instead, because it can be checked.
- **No fabricated counts.** `lib/tool-usage.ts` matches tools to case studies
  by exact normalised name plus a small alias table. An earlier substring
  version claimed "CSS" was used in four projects — it was matching
  "Tailwind CSS". 17 of 35 tools trace to a case study, and the section says
  so rather than implying the rest are unused.

---

## Outstanding

- `public/images/portrait.jpg` is generated gradient art, but its alt text
  says "Portrait of Alpha Mugisha". Correct for the final state, wrong today.
  Drop a real photo at that path.
- `public/alpha-mugisha-cv.pdf` does not exist yet; the CV buttons link to it.
- Project covers and hero art are mesh gradients from
  `scripts/generate-hero-art.js` and `scripts/generate-placeholders.js`.
  Replace the files at the same paths and nothing else changes.
