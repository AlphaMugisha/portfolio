"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { site } from "@/lib/site";

/**
 * Hero.
 *
 * A two-column editorial opening: the statement on the left, a full-bleed
 * portrait plate on the right that unmasks on load and then drifts as the
 * page leaves. Four scroll rates run at once — plate, headline, standfirst,
 * and the overall fade — which is what gives the section depth without any
 * decorative element on screen.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const standfirstY = useTransform(scrollYProgress, [0, 1], ["0%", "56%"]);
  const plateY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const plateScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const s = <T,>(v: T): T | undefined => (reduced ? undefined : v);

  const line = (text: string, delay: number, className = "") => (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        initial={{ y: "108%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`block ${className}`}
      >
        {text}
      </motion.span>
    </span>
  );

  return (
    <section
      ref={ref}
      className="relative min-h-svh overflow-hidden px-6 pb-16 pt-36 sm:px-10 sm:pt-44"
    >
      <div className="mx-auto grid h-full max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-16">
        {/* Statement */}
        <motion.div style={{ opacity: s(opacity) }} className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-9 flex items-center gap-4"
          >
            <span className="h-px w-9 bg-primary" />
            <span className="eyebrow">Software Engineer — {site.location}</span>
          </motion.div>

          <motion.h1
            style={{ y: s(headlineY) }}
            className="text-display text-[clamp(2.6rem,6.4vw,5.4rem)] text-text-primary"
          >
            {line("Software built", 0.3)}
            {line("for the people", 0.39)}
            {line("who use it.", 0.48)}
          </motion.h1>

          <motion.div
            style={{ y: s(standfirstY) }}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.78, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10"
          >
            <p className="max-w-lg text-pretty text-lg leading-relaxed text-text-secondary">
              I design and build web platforms, APIs and connected systems —
              from the data model through to the interface. Most of my work
              addresses problems I have seen firsthand in Rwanda.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="#projects"
                className="group relative overflow-hidden rounded-full bg-primary px-8 py-4 text-sm font-medium text-on-primary"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-paper transition-transform duration-500 ease-out group-hover:scale-y-100" />
                <span className="relative transition-colors duration-500 group-hover:text-ink">
                  View selected work
                </span>
              </Link>

              <Link
                href="#contact"
                className="group relative overflow-hidden rounded-full border border-line-strong px-8 py-4 text-sm text-text-primary transition-colors duration-500 hover:border-primary"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-primary transition-transform duration-500 ease-out group-hover:scale-y-100" />
                <span className="relative transition-colors duration-500 group-hover:text-on-primary">
                  Get in touch
                </span>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Portrait plate */}
        <motion.div
          style={{ y: s(plateY), scale: s(plateScale) }}
          className="relative lg:h-[76vh]"
        >
          <motion.div
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.4, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full min-h-[420px] overflow-hidden rounded-sm"
          >
            <motion.div
              initial={{ scale: 1.16 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full w-full"
            >
              <Image
                src="/images/hero.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Offset rule — the one decorative mark in the hero */}
          <div
            aria-hidden="true"
            className="absolute -bottom-4 -right-4 -z-10 hidden h-full w-full rounded-sm border border-primary/35 lg:block"
          />
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#about"
        aria-label="Scroll to about"
        style={{ opacity: s(opacity) }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.9 }}
        className="group absolute bottom-8 left-6 hidden items-center gap-3 text-text-muted transition-colors duration-400 hover:text-text-primary sm:left-10 sm:flex"
      >
        <span className="font-sans text-[10px] uppercase tracking-[0.2em]">
          Scroll
        </span>
        <motion.span
          animate={reduced ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={14} />
        </motion.span>
      </motion.a>
    </section>
  );
}
