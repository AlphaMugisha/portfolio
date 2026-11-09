/**
 * Camera framings, one per chapter.
 *
 * No two chapters may look like the same scene, and the camera is the
 * main instrument for that. Each entry places the camera relative to
 * the core's own travelling frame, so the same object reads completely
 * differently from chapter to chapter while the route never cuts.
 *
 *   back      distance behind the core. NEGATIVE puts the camera ahead
 *             of it on the route, so the core drives toward the lens
 *   lift      height above the deck. Negative goes underneath it
 *   side      lateral offset; large values swing out for a wide shot
 *   lookAhead how far down the route the aim point sits, in curve
 *             units. 0 stares straight at the core; larger values look
 *             into the distance and let the core sit low in frame
 *   lookLift  raises the aim point, dropping the horizon and making a
 *             shot feel tall
 *
 * Lift values are generous on purpose. The deck is nearly four units
 * wide, so a camera close to its surface fills the frame with black
 * slab and buries the core — every shot here sits clear above or well
 * out to the side of the roadway.
 */

export interface Shot {
  back: number;
  lift: number;
  side: number;
  lookAhead: number;
  lookLift: number;
}

export type ShotName =
  | "approach"
  | "side"
  | "tunnel"
  | "detail"
  | "reveal"
  | "bridge"
  | "elevated"
  | "wide";

export const SHOTS: Record<ShotName, Shot> = {
  /** 01 — high and wide behind; the route recedes, the core sits low
      and right so the opening statement owns the upper left. */
  approach: { back: 9.0, lift: 5.5, side: -7.0, lookAhead: 0.03, lookLift: 1.2 },

  /** 02 — swung out to the side, tracking it across open ground. */
  side: { back: 1.0, lift: 2.4, side: 9.0, lookAhead: 0.004, lookLift: 0.3 },

  /** 03 — tucked in behind and low, ribs closing overhead. */
  tunnel: { back: 5.5, lift: 1.5, side: 0.4, lookAhead: 0.02, lookLift: 0.7 },

  /** 04 — close enough to read the plates and the vias. */
  detail: { back: 3.0, lift: 1.9, side: 2.3, lookAhead: 0.001, lookLift: 0.5 },

  /** 05 — falls back and wide; the project covers carry this chapter. */
  reveal: { back: 11, lift: 5.2, side: -7.0, lookAhead: 0.012, lookLift: 0.9 },

  /** 06 — side-on across the span, the drop visible beneath. */
  bridge: { back: 2.0, lift: 3.4, side: 11.0, lookAhead: 0.01, lookLift: 0.1 },

  /** 07 — underslung, looking up at the elevated road. */
  elevated: { back: 8.0, lift: -3.4, side: 4.0, lookAhead: 0.016, lookLift: 3.0 },

  /** 08 — far back and high; the route runs out into the dark. */
  wide: { back: 19, lift: 7.5, side: -3.0, lookAhead: 0.02, lookLift: 1.4 },
};
