"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Inertial scrolling.
 *
 * Lenis drives the real scroll position rather than transforming a wrapper,
 * so `useScroll`, `whileInView`, anchor links and the browser's own scrollbar
 * all keep working — which is the whole reason to use it over a transform-
 * based smooth-scroll.
 *
 * Two details that are easy to miss:
 *   - in-page anchors are routed through Lenis, because a native jump while
 *     Lenis owns the scroll leaves the two disagreeing about position;
 *   - every route change resets to the top, since Lenis would otherwise
 *     carry the previous page's offset into the new one.
 *
 * Disabled outright under `prefers-reduced-motion` — inertial scrolling is
 * one of the strongest vestibular triggers there is.
 */
export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="/#"], a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute("href") || "";
      const id = href.split("#")[1];
      const el = id ? document.getElementById(id) : null;
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: -90 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        if (lenisRef.current) lenisRef.current.scrollTo(el, { offset: -90, immediate: true });
        else el.scrollIntoView();
        return;
      }
    }
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
