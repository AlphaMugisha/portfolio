"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { assertPaletteInSync } from "@/lib/palette";

/**
 * Lenis-driven smooth scrolling.
 *
 * Deliberately skipped when the user prefers reduced motion - hijacking the
 * scroll is exactly the kind of thing that setting is asking us not to do.
 */
export default function SmoothScroll() {
  // Development-only: the WebGL layer mirrors the palette in TypeScript because
  // Three.js needs numbers at construction time. This warns if that mirror and
  // globals.css have drifted apart, which is otherwise invisible until the two
  // are side by side on screen.
  useEffect(() => {
    assertPaletteInSync();
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Let in-page anchors route through Lenis so the easing matches.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -116 });
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
