"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ReactiveBoard from "@/components/sections/ReactiveBoard";

/**
 * Decides what renders behind the hero, and never lets that decision
 * break the page.
 *
 * The 3D core is genuinely optional. It is loaded through `next/dynamic`
 * with `ssr: false`, so three.js and R3F land in their own chunk that is
 * fetched only after the page is interactive and only when the device
 * has actually earned it — nothing about the first paint, the HTML, or
 * the rest of the site depends on WebGL being available.
 *
 * The fallback is not a placeholder. It is `ReactiveBoard`, the 2D
 * canvas lattice already built for this hero: orthogonally routed
 * traces, pads that light under the pointer, packets that accelerate,
 * a click shockwave. A visitor without WebGL gets a complete, animated,
 * interactive hero — just a different one.
 *
 * Gates, in order:
 *   1. reduced motion       -> 2D (which paints one static frame)
 *   2. viewport under 700px -> 2D
 *   3. no WebGL context     -> 2D
 *   4. coarse pointer + few cores / little memory -> 2D
 *   5. otherwise            -> the 3D core
 *
 * The width gate is a design decision, not a capability one. A layered
 * stack framed for a wide canvas fills a 390px portrait viewport
 * completely and cuts diagonally across the headline and the buttons —
 * it actively damages the page. The 2D board was composed for this hero
 * at this width and reads far better, while costing a phone no GPU time
 * or battery. "Adapted for mobile" here means using the version that is
 * actually better on a phone, not shipping a worse 3D one for the sake
 * of consistency.
 *
 * The probe canvas is created once, read, and explicitly destroyed via
 * `WEBGL_lose_context`; leaving a stray context alive costs a real GPU
 * slot on machines that only allow a handful.
 */

const EngineeringCore = dynamic(() => import("./EngineeringCore"), {
  ssr: false,
  // While the chunk is in flight the 2D board is already running, so
  // there is nothing to show here — a spinner would be a downgrade.
  loading: () => null,
});

type Mode = "pending" | "three" | "fallback";

function canRunThree(): boolean {
  if (typeof window === "undefined") return false;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

  // See the note above: this is about composition, not capability.
  if (window.innerWidth < 700) return false;

  // A touch device with a small core count or little memory renders this
  // scene at a frame rate that is worse than the 2D version.
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (coarse && (cores <= 4 || memory <= 4)) return false;

  try {
    const probe = document.createElement("canvas");
    const gl = (probe.getContext("webgl2") ||
      probe.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export default function HeroStage({ className = "" }: { className?: string }) {
  // Starts as "pending" so the server and the first client render agree,
  // then resolves in an effect. The 2D board renders throughout either
  // way, so there is no empty frame while the decision is made.
  const [mode, setMode] = useState<Mode>("pending");

  useEffect(() => {
    setMode(canRunThree() ? "three" : "fallback");
  }, []);

  if (mode === "three") {
    return <EngineeringCore className={className} />;
  }

  return <ReactiveBoard className={className} />;
}
