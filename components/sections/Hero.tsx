"use client";

import { useId } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import SplitText from "@/components/ui/SplitText";
import Marquee from "@/components/ui/Marquee";
import { EASE } from "@/lib/motion";
import type { SiteSettingsRow } from "@/types/database";

/**
 * "The Trace" — the hero's one visual idea: a single orthogonal signal path
 * draws itself on load, passing through three labelled junctions (hardware,
 * software, applied AI) before terminating at the name. It is the site's
 * thesis rendered as a diagram rather than stated as a sentence: these are
 * not three separate interests, they are one circuit.
 *
 * Pure SVG + framer-motion `pathLength`, no canvas/WebGL — consistent with
 * the rest of the site's 2D choreography.
 */
function Trace({ reduced }: { reduced: boolean }) {
  const gid = useId();
  const draw = (delay: number) =>
    reduced
      ? { pathLength: 1 }
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  const nodes: { x: number; y: number; label: string }[] = [
    { x: 40, y: 60, label: "HARDWARE" },
    { x: 40, y: 230, label: "SOFTWARE" },
    { x: 40, y: 400, label: "APPLIED AI" },
  ];

  return (
    <svg
      viewBox="0 0 420 460"
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${gid}-glow`} r="1">
          <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {nodes.map((n) => (
        <motion.path
          key={n.label}
          className="trace-path"
          d={`M ${n.x} ${n.y} H 200 V 230`}
          {...draw(0.15)}
        />
      ))}

      <motion.path
        className="trace-path"
        d="M 200 230 H 340"
        {...draw(1.0)}
      />

      {nodes.map((n, i) => (
        <g key={n.label} transform={`translate(${n.x}, ${n.y})`}>
          <circle r="22" fill={`url(#${gid}-glow)`} />
          <motion.circle
            r="4.5"
            className="trace-node"
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: reduced ? 0 : 0.2 + i * 0.25 }}
          />
          <motion.text
            x="-14"
            y="5"
            textAnchor="end"
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            fill="var(--color-text-subtle)"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: reduced ? 0 : 0.4 + i * 0.25 }}
          >
            {n.label}
          </motion.text>
        </g>
      ))}

      <motion.circle
        cx="340"
        cy="230"
        r="6"
        className="trace-node-fill"
        initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: reduced ? 0 : 1.3 }}
      />
    </svg>
  );
}

export default function Hero({ settings }: { settings: SiteSettingsRow }) {
  const reduced = useReducedMotion();

  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section className="relative overflow-hidden pt-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-28 lg:pt-16">
        <div>
          <motion.p {...fade(0)} className="tag tag-signal mb-8">
            {settings.hero_badge} · {settings.location}
          </motion.p>

          <h1 className="max-w-[16ch] text-display-lg font-display font-semibold text-text">
            <SplitText as="span" text={settings.hero_line_1} className="block" delay={0.1} />
            <SplitText as="span" text={settings.hero_line_2} className="block" delay={0.3} />
            <SplitText
              as="span"
              text={settings.hero_line_3}
              className="block text-signal"
              delay={0.5}
            />
          </h1>

          <motion.p
            {...fade(0.75)}
            className="mt-8 max-w-md text-lg leading-relaxed text-text-muted"
          >
            {settings.hero_intro}
          </motion.p>

          <motion.div {...fade(0.9)} className="mt-10 flex flex-wrap gap-4">
            <Link href="/#work" className="btn btn-signal">
              See my work
            </Link>
            <Link href="/#about" className="btn btn-outline">
              About me
            </Link>
          </motion.div>
        </div>

        <motion.div
          {...fade(0.3)}
          className="hidden h-[420px] w-full items-center justify-center lg:flex"
        >
          <Trace reduced={!!reduced} />
        </motion.div>
      </div>

      <Marquee
        items={["Web platforms", "Embedded systems", "Applied AI", "REST APIs", settings.location, settings.availability]}
        duration={48}
        className="relative z-10 border-y border-rule py-5"
        itemClassName="font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-text-subtle"
      />
    </section>
  );
}
