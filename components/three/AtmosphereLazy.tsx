"use client";

import dynamic from "next/dynamic";

/**
 * The atmosphere, off the critical path.
 *
 * Importing Atmosphere directly from the layout puts three.js into the
 * shared First-Load bundle of EVERY route — a 240 kB tax on a case-study
 * page whose only WebGL is ambient dust. The dust does not even become
 * visible until the reader has scrolled past the hero, so nothing about it
 * belongs before hydration: it arrives as an async chunk, mounts silently,
 * and the fiction is intact by the time anyone is deep enough to see it.
 *
 * `ssr: false` is also load-bearing — the scene reads window and WebGL at
 * mount, and there is nothing meaningful for the server to render anyway.
 */
const Atmosphere = dynamic(() => import("@/components/three/Atmosphere"), {
  ssr: false,
});

export default function AtmosphereLazy() {
  return <Atmosphere />;
}
