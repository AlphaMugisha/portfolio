"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";
import { useBoot } from "@/components/system/Boot";
import KineticText from "@/components/ui/KineticText";
import Magnetic from "@/components/ui/Magnetic";
import Marquee from "@/components/ui/Marquee";
import ReactiveBoard from "./ReactiveBoard";
import { disciplines } from "@/lib/site";
import type { SiteSettingsRow } from "@/types/database";

/**
 * The opening.
 *
 * The composition is an engineering drawing: the name set enormous as
 * the subject, the sheet's metadata pinned to the four corners, and the
 * live board running underneath it. The second word of the name is cut
 * as an outline rather than a solid — the signal colour at 11rem as a
 * filled mass would overwhelm everything below it, where as a hairline
 * it carries the accent without shouting, and the pairing of one solid
 * and one hollow word is the single most recognisable thing on the page.
 *
 * Entrance is a scored sequence, not one fade: the sheet rules draw
 * outward from the centre, the corner metadata fades up, the name builds
 * character by character, the supporting copy follows, and the scroll
 * cue is last. It starts the moment the boot shutter clears — the hero
 * subscribes to that rather than guessing at a delay, so the two never
 * overlap or leave a gap.
 *
 * On scroll the layers separate: type drifts up fastest, the board
 * drifts slowest and dims. Parallax on transform and opacity only, so it
 * stays on the compositor.
 */
export default function Hero({ settings }: { settings: SiteSettingsRow }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { ready } = useBoot();

  const [first = "Alpha", ...rest] = settings.name.split(" ");
  const last = rest.join(" ") || "Mugisha";

  useGSAP(
    () => {
      if (reduced || !ready) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        "[data-hero-rule]",
        { scaleX: 0 },
        { scaleX: 1, duration: 1.1, ease: "power4.inOut", stagger: 0.08 },
        0,
      )
        .fromTo(
          "[data-hero-meta]",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 },
          0.15,
        )
        .fromTo(
          "[data-hero-board]",
          { opacity: 0, scale: 1.04 },
          { opacity: 1, scale: 1, duration: 1.6, ease: "power2.out" },
          0.1,
        )
        // Deliberately overlapping the name build rather than queuing
        // behind it: the headline takes ~1.8s to set itself, and making
        // the intro and the call to action wait for it put them on
        // screen around the four-second mark, which is far too late for
        // the things a visitor is actually looking for.
        .fromTo(
          "[data-hero-copy]",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 },
          0.5,
        )
        .fromTo(
          "[data-hero-cue]",
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.55 },
          0.72,
        );

      /**
       * Scroll separation — each layer leaves at its own rate, which is
       * what gives the hero depth without any 3D.
       *
       * These MUST be `fromTo` with explicit start values. A plain
       * `gsap.to(..., {opacity: 0})` captures its start value the moment
       * it is created, and these are created alongside the entrance
       * timeline above — which has just set `opacity: 0` on the very
       * same elements. The scrub then records 0 as its origin and
       * animates 0 → 0, so the intro and the call to action never became
       * visible at all. Stating the origin explicitly makes the scrub
       * independent of whatever the entrance happens to be doing.
       */
      const scrub = gsap.context(() => {
        gsap.fromTo(
          "[data-hero-type]",
          { yPercent: 0, opacity: 1 },
          {
            yPercent: -26,
            opacity: 0,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
        gsap.fromTo(
          "[data-hero-board]",
          { yPercent: 0, opacity: 1 },
          {
            yPercent: 12,
            opacity: 0.15,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: 1.1,
            },
          },
        );
        gsap.fromTo(
          "[data-hero-copy]",
          { yPercent: 0, opacity: 1 },
          {
            yPercent: -12,
            opacity: 0,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "62% top",
              scrub: 0.8,
            },
          },
        );
      }, root);

      return () => {
        tl.kill();
        scrub.revert();
      };
    },
    { scope: root, dependencies: [reduced, ready] },
  );

  // Refresh once fonts land, so pinned/scrubbed measurements below the
  // fold are not computed against fallback-font line heights.
  useGSAP(() => {
    if (!document.fonts) return;
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <section ref={root} className="relative min-h-[100svh] overflow-hidden">
      {/* The live board, full-bleed, masked so it thins out under the
          type on the left and breathes on the right. */}
      <div
        data-hero-board
        className="pointer-events-auto absolute inset-0 z-0"
        style={{
          maskImage:
            "linear-gradient(100deg, transparent 0%, rgba(0,0,0,0.25) 26%, black 62%, black 100%)",
          WebkitMaskImage:
            "linear-gradient(100deg, transparent 0%, rgba(0,0,0,0.25) 26%, black 62%, black 100%)",
        }}
      >
        <ReactiveBoard className="h-full w-full" />
      </div>

      {/* Sheet metadata, pinned to the corners of the drawing.

          `justify-between` rather than an `mt-auto` push: the three
          blocks have to share one viewport, and letting the type block
          claim all the free space drove the intro and the call to
          action below the fold — which is the one thing a hero cannot
          do. Everything the brief requires in the first screen now
          sits inside 100svh, with the ticker as the only peek. */}
      <div className="pointer-events-none relative z-10 flex min-h-[calc(100svh-3.25rem)] flex-col justify-between gap-6 px-6 pb-7 pt-24 sm:px-10">
        <div className="flex items-start justify-between gap-6">
          <span data-hero-meta className="note note-signal">
            {settings.hero_badge}
          </span>
          <span data-hero-meta className="note hidden text-right sm:block">
            {settings.location}
            <span className="mt-1 block text-text-subtle/70">01.94°S 30.06°E</span>
          </span>
        </div>

        <div
          data-hero-rule
          className="h-px w-full origin-left bg-rule"
          aria-hidden="true"
        />

        {/* The subject. */}
        <div data-hero-type>
          <p
            data-hero-meta
            className="note mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-text-muted"
          >
            {disciplines.map((d, i) => (
              <span key={d} className="flex items-center gap-3">
                {i > 0 ? <span className="text-signal-deep">/</span> : null}
                {d}
              </span>
            ))}
          </p>

          <h1 className="text-display-lg font-display font-semibold leading-[0.84]">
            <KineticText
              text={first.toUpperCase()}
              as="span"
              className="block text-text"
              play={ready}
              delay={0.25}
              stagger={0.03}
            />
            {/* The stroke has to sit on the WRAPPER, not on the character
                spans: under reduced motion KineticText renders plain text
                with no spans at all, so a stroke scoped to `charClassName`
                left `text-transparent` with nothing drawing it and the
                surname was invisible to exactly the visitors who cannot
                see it build. `-webkit-text-stroke` inherits, so putting it
                here covers both paths. */}
            <KineticText
              text={last.toUpperCase()}
              as="span"
              className="block text-transparent [-webkit-text-stroke:1.5px_var(--color-signal)]"
              play={ready}
              delay={0.4}
              stagger={0.03}
            />
          </h1>
        </div>

        <div className="space-y-7">
          <div
            data-hero-rule
            className="h-px w-full origin-right bg-rule"
            aria-hidden="true"
          />

          {/* Supporting copy and the two ways out of the hero. */}
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
          <p
            data-hero-copy
            className="pointer-events-auto max-w-md text-[17px] leading-relaxed text-text-muted"
          >
            {settings.hero_intro}
          </p>

          <div data-hero-copy className="pointer-events-auto flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link href="/#work" className="btn btn-signal" data-cursor-label="Open">
                <span>See the work</span>
              </Link>
            </Magnetic>
            <Magnetic>
              <a
                href={`mailto:${settings.email}`}
                className="btn btn-ghost"
                data-cursor-label="Email"
              >
                <span>Get in touch</span>
              </a>
            </Magnetic>
            </div>
          </div>

          {/* Scroll invitation: a charge falling down a trace. */}
          <div data-hero-cue className="pointer-events-none flex items-center gap-4">
            <span className="relative block h-9 w-px overflow-hidden bg-rule-strong">
              <span className="cue-charge absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-signal" />
            </span>
            <span className="note">Scroll to trace the system</span>
          </div>
        </div>
      </div>

      <Marquee
        items={[
          settings.hero_line_1 + " " + settings.hero_line_2 + " " + settings.hero_line_3,
          "Web platforms",
          "Embedded systems",
          "Applied AI",
          settings.availability,
        ]}
        duration={52}
        className="relative z-10 border-y border-rule bg-ink/70 py-4 backdrop-blur-sm"
        itemClassName="font-mono text-[11px] uppercase tracking-[0.25em] text-text-subtle"
      />
    </section>
  );
}
