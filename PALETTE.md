# Alpha Mugisha — original colour identity

Recovered from git history, not reconstructed from memory.

**Source of truth:** commit `9d3243d` (2026-09-02, "adding this to main") —
the first real version of this site, before any of the subsequent
restyles. The token block there is fully semantic and carries its own
contrast ratios, so these are the authored values, not values sampled
off a screenshot.

## The palette

### Ground
| Token | Hex | Role |
|---|---|---|
| `--color-ink` / `--color-bg` | `#0E0E0E` | deepest ground, page background |
| `--color-bg-invert` | `#161616` | the alternating band |
| `--color-bg-raised` | `#191919` | raised band |
| `--color-surface` | `#232323` | cards, panels |
| `--color-surface-invert` | `#242424` | panels on the inverted band |

Note the original's own comment: *"on a dark site this is a second,
deeper tone rather than a light one, so the rhythm still reads."* The
site was dark throughout and created rhythm by **stepping the greys**,
not by flipping to a light surface.

### Type
| Token | Hex | Contrast on `#0E0E0E` |
|---|---|---|
| `--color-text-primary` / `--color-paper` | `#F2F2F2` | 17.3:1 |
| `--color-text-secondary` | `#B4B4B4` | 9.2:1 |
| `--color-text-muted` | `#828282` | 5.0:1 — the lightest text permitted |

### The accent — amber
| Token | Hex | Role |
|---|---|---|
| `--color-amber` / `--color-primary` | `#FEB002` | **the accent that carries the page** (10.5:1) |
| `--color-primary-hover` | `#FFC23A` | hover / lit step |
| `--color-on-primary` | `#0E0E0E` | ink on an amber fill (10.5:1) |

### The secondary — lime
| Token | Hex | Role |
|---|---|---|
| `--color-lime` / `--color-accent` | `#8FDC3C` | small marks only (10.6:1) |

The original explicitly toned this down from `#70FF00`, with the
reason recorded: *"At full #70ff00 it reads as the neon hacker look
this site is deliberately not."*

### Lines
| Token | Value |
|---|---|
| `--color-line` | `rgba(242, 242, 242, 0.10)` |
| `--color-line-strong` | `rgba(242, 242, 242, 0.20)` |
| `--color-line-invert` | `rgba(242, 242, 242, 0.14)` |

### Ground gradient
The body carried `linear-gradient(130deg, #000, #272727 58%, #727272)` —
a charcoal-to-grey wash rather than a flat fill.

## The rule the original set for itself

> Amber leads. Lime is toned to `#8FDC3C` for small marks only.

## What went wrong

`#54D1DB` (cyan) is **not** part of this identity. It was introduced on
2026-09-15 in commit `8647181` ("Re-grade the site into the machine-hall
look"), carried through every restyle since, and is what currently ships.
Amber last appeared in `05af9bf` and was removed in the November rebuilds.

So the complaint is accurate and specific: the deployed site contains
none of the original palette.

## Provenance note

The original token block records that these values were *referenced from
`tuyishimireeric.github.io`*. Colour values alone are not the kind of
thing the originality rule in this repo protects against (unlike layout
and source code), and this palette has been treated as Alpha's identity
across the project's whole history — but the lineage is recorded here
rather than quietly dropped.

---

## Status: restored

Applied in full on 2026-11-08. `app/globals.css` now resolves to exactly
the values above; cyan and the porcelain light panels are gone from the
codebase (`grep -r "54d1db\|porcelain"` returns only historical notes).

Where the design needed a value the original did not define — a dim
amber for hairline traces — it was derived by walking **the same hue**
down the luminance ramp (`--color-signal-deep: #6B4A00`), never by
introducing a new one.

The 3D hero draws from the same set: amber emissive on traces, vias and
the key light; lime on three indicator LEDs only; substrate greys from
the page ramp.
