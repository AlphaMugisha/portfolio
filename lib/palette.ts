/**
 * The palette, in a form WebGL can use.
 *
 * `app/globals.css` is the source of truth: it declares these as Tailwind v4
 * `@theme` tokens, which is what every CSS rule and utility resolves against.
 * Three.js cannot read those — a material needs a number at construction time,
 * and `getComputedStyle` on every frame is not an option — so the values are
 * mirrored here.
 *
 * Two guards against the mirror drifting out of step with the CSS:
 *   - every constant names the token it mirrors, so a grep finds both, and
 *   - `assertPaletteInSync()` re-reads the real custom properties in the
 *     browser during development and warns if any pair disagrees.
 *
 * The two lights have fixed roles, and the scenes are where the rule bites:
 * CYAN is the accent ink — attention, hover, the constellation's signal.
 * EMBER is never an ink; it exists only as light in the depth — the bounce
 * inside the hero cut, the key light riding the rack, a few warm motes.
 */

/** Hex strings, for CSS-side use and for `new THREE.Color()`. */
export const PALETTE = {
  /** --color-ink — the ground under every dark section. */
  ink: "#0B0E14",
  /** --color-void — the full-screen menu, and nothing else. */
  void: "#04060A",
  /** --color-panel — case-study cards, which sit on the ground. */
  panel: "#242B3A",
  /** --color-panel-mid — the statement card. */
  panelMid: "#6E7A8E",
  /** --color-paper — the light band's fill AND the light type on dark. */
  paper: "#B9C7D2",
  /** --color-primary — instrument cyan, the accent ink. */
  cyan: "#54D1DB",
  /** --color-primary-light — the lifted cyan. */
  cyanLight: "#8BE0E8",
  /** --color-ember — tungsten counterlight. Light only, never an ink. */
  ember: "#FFB466",
  /** --color-on-band — ink on the light band. */
  onBand: "#0E1319",
} as const;

export type PaletteKey = keyof typeof PALETTE;

/** The same values as 0xRRGGBB, which is what Three.js constructors prefer. */
export const HEX: Record<PaletteKey, number> = Object.fromEntries(
  Object.entries(PALETTE).map(([k, v]) => [k, Number.parseInt(v.slice(1), 16)])
) as Record<PaletteKey, number>;

/** Which CSS custom property each key mirrors, for the drift check below. */
const MIRRORS: Record<PaletteKey, string> = {
  ink: "--color-ink",
  void: "--color-void",
  panel: "--color-panel",
  panelMid: "--color-panel-mid",
  paper: "--color-paper",
  cyan: "--color-primary",
  cyanLight: "--color-primary-light",
  ember: "--color-ember",
  onBand: "--color-on-band",
};

/**
 * Development-only: warn if this file and globals.css have drifted apart.
 *
 * Silent drift is the real risk with a mirrored palette — the CSS changes, the
 * WebGL keeps rendering the old colour, and nobody notices until the two are
 * side by side on screen.
 */
export function assertPaletteInSync() {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") return;

  const root = getComputedStyle(document.documentElement);
  const drift: string[] = [];

  for (const [key, prop] of Object.entries(MIRRORS) as [PaletteKey, string][]) {
    const css = root.getPropertyValue(prop).trim().toLowerCase();
    if (!css) continue; // token not defined — nothing to compare against
    if (css !== PALETTE[key].toLowerCase()) {
      drift.push(`${prop} is ${css} in CSS but ${PALETTE[key]} in lib/palette.ts`);
    }
  }

  if (drift.length) {
    console.warn(
      "[palette] lib/palette.ts has drifted from app/globals.css:\n  " +
        drift.join("\n  ")
    );
  }
}
