"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * One registration point for GSAP.
 *
 * Plugins must be registered before any timeline that uses them is built,
 * and registering the same plugin twice is harmless but registering it in
 * fifteen component files is not — one of them eventually gets missed and
 * the failure (a ScrollTrigger that silently never fires) looks like a
 * layout bug rather than a missing import.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
