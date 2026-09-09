/**
 * The measured palette, in a form WebGL can use.
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
 * Every value was sampled from the reference recording with colour histograms
 * rather than picked, which is why they are odd numbers. Do not round them.
 */

/** Hex strings, for CSS-side use and for `new THREE.Color()`. */
export const PALETTE = {
  /** --color-ink — the ground under every dark section. */
  ink: "#141518",
  /** --color-void — the full-screen menu, and nothing else. */
  void: "#030407",
  /** --color-panel — case-study cards, which sit on the ground. */
  panel: "#303233",
  /** --color-panel-mid — the statement card. */
  panelMid: "#74767a",
  /** --color-paper — the light band's fill AND the light type on dark. */
  paper: "#acaaa6",
  /** --color-primary — the single accent. */
  gold: "#928769",
  /** --color-primary-light — the same gold lifted. */
  goldLight: "#a29d85",
  /** --color-on-band — ink on the light band. */
  onBand: "#16171a",
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
  gold: "--color-primary",
  goldLight: "--color-primary-light",
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
