"use client";

import { useEffect, useState } from "react";

/**
 * One place that decides how much experience this device should be given.
 *
 * Every 3D surface on the site asks this the same question, so the answer has
 * to be made once rather than each component re-deriving it from its own
 * matchMedia calls. It gates four separate things that are easy to conflate:
 *
 *   canWebGL     — can we render at all, or do we owe them a flat fallback
 *   tier         — how much we can afford to render
 *   reducedMotion— whether they asked us not to move things
 *   finePointer  — whether hover and cursor-tracking mean anything here
 *
 * Deliberately conservative before mount. It reports the lowest capability
 * until the client has actually measured, so the server render and the first
 * paint agree and nothing pops from a heavy scene down to a fallback. The
 * flag that says measurement has happened is `ready`.
 */

export type Tier = "none" | "low" | "mid" | "high";

export interface Capability {
  /** False until the client has measured. Gate mounting a Canvas on this. */
  ready: boolean;
  canWebGL: boolean;
  tier: Tier;
  reducedMotion: boolean;
  finePointer: boolean;
  /** Convenience: the device should get a real 3D scene. */
  render3D: boolean;
  /** Device pixel ratio, already clamped — full DPR on a 3x phone is ruinous. */
  dpr: [number, number];
}

const INITIAL: Capability = {
  ready: false,
  canWebGL: false,
  tier: "none",
  reducedMotion: false,
  finePointer: false,
  render3D: false,
  dpr: [1, 1],
};

/**
 * Probe for a real WebGL context, then throw it away immediately.
 *
 * Checking `"WebGLRenderingContext" in window` is not the same question — the
 * constructor exists on machines where context creation still fails (blocklisted
 * drivers, GPU process crashed, too many live contexts). The only honest test is
 * to ask for one.
 */
function probeWebGL(): boolean {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  try {
    // WebGL2 specifically. three 0.185 asks for "webgl2" and nothing else
    // (WebGLRenderer.js:393), so probing webgl1 would pass devices through this
    // gate that the renderer then refuses — a black canvas instead of the
    // designed fallback.
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    // Hand the context back rather than waiting for GC: browsers cap how many
    // can be live at once, and probes should never spend one of them.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  } finally {
    canvas.width = canvas.height = 0;
  }
}

/**
 * A coarse device tier.
 *
 * `deviceMemory` and `hardwareConcurrency` are both advisory and both absent on
 * some browsers, so this leans on whichever it gets and treats a coarse pointer
 * as a strong signal that we are on a phone regardless of what the numbers say.
 */
function probeTier(canWebGL: boolean, finePointer: boolean): Tier {
  if (!canWebGL) return "none";

  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 0;
  const cores = navigator.hardwareConcurrency ?? 0;

  if (!finePointer) return mem >= 6 || cores >= 8 ? "mid" : "low";
  if (mem >= 8 || cores >= 8) return "high";
  if (mem >= 4 || cores >= 4) return "mid";
  return "low";
}

export function useCapability(): Capability {
  const [cap, setCap] = useState<Capability>(INITIAL);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(pointer: fine)");

    // The context probe is the expensive part, so it runs once rather than on
    // every media-query change.
    const canWebGL = probeWebGL();

    const measure = () => {
      const reducedMotion = motionQuery.matches;
      const finePointer = pointerQuery.matches;
      const tier = probeTier(canWebGL, finePointer);

      setCap({
        ready: true,
        canWebGL,
        tier,
        reducedMotion,
        finePointer,
        // Reduced motion does not mean "no 3D" — a still, slowly-lit scene is
        // fine and better than a blank box. It means nothing may move on its
        // own. Scenes read `reducedMotion` to decide that for themselves.
        render3D: canWebGL && tier !== "none" && tier !== "low",
        dpr: tier === "high" ? [1, 2] : [1, 1.5],
      });
    };

    measure();
    motionQuery.addEventListener("change", measure);
    pointerQuery.addEventListener("change", measure);
    return () => {
      motionQuery.removeEventListener("change", measure);
      pointerQuery.removeEventListener("change", measure);
    };
  }, []);

  return cap;
}
