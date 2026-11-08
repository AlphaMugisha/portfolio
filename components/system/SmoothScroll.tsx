"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Smooth scroll, driven by Lenis and handed to GSAP's ticker.
 *
 * The three lines that matter are the sync, and they are not optional
 * garnish — without them Lenis and ScrollTrigger run on two different
 * clocks and every pinned section on the site drifts a few pixels per
 * frame:
 *
 *   1. Lenis tells ScrollTrigger to update whenever it scrolls.
 *   2. GSAP's ticker drives Lenis's rAF, so there is ONE loop, not two.
 *   3. lagSmoothing(0) stops GSAP from fabricating a catch-up frame
 *      after a long task, which Lenis would interpret as a huge scroll
 *      delta and visibly jump.
 *
 * Deliberately restrained settings. The brief is a smooth page, not a
 * page that keeps gliding for a second after the wheel stops: duration
 * is short and the wheel multiplier is 1, so the scrollbar still tracks
 * the content and a trackpad fling does not overshoot the section the
 * visitor aimed at. Touch devices keep their native scrolling entirely —
 * smoothing a surface that already has momentum physics only makes it
 * feel laggy.
 *
 * Under `prefers-reduced-motion` Lenis is never constructed, so the
 * browser's own instant scrolling is left completely alone.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 0.9,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 1,
      syncTouch: false,
      smoothWheel: true,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // In-page anchors have to go through Lenis; a native jump would leave
    // Lenis's internal position stale and the next wheel event would snap
    // the page back to where it thought it was.
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href*="#"]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -80, duration: 1.1 });
      history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onAnchorClick);

    // The menu curtain and any future modal lock scrolling by setting this
    // attribute, rather than each of them reaching into Lenis directly.
    const observer = new MutationObserver(() => {
      if (document.documentElement.dataset.scrollLocked === "true") lenis.stop();
      else lenis.start();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-scroll-locked"],
    });

    return () => {
      document.removeEventListener("click", onAnchorClick);
      observer.disconnect();
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
