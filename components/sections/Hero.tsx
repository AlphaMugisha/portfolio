"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Code2,
  Cpu,
  Database,
  MousePointer2,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Floaty from "@/components/ui/Floaty";
import Marquee from "@/components/ui/Marquee";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------
   The stickers.

   Each one carries its own tilt, bob distance and period. Nothing here is
   on a shared timing: the moment two of these share a duration the group
   starts pulsing together and reads as one animated block rather than as
   several separate objects loose in the air.

   `pos` keeps them clear of the headline column in the middle. They are
   draggable — `Floaty` wires that up — and bounded to the hero, so you can
   throw one and it springs back inside the frame.
   ------------------------------------------------------------------ */
const CARDS = [
  {
    title: "Full-stack",
    tag: "Next.js · Prisma · Postgres",
    pos: "left-[-2%] top-[11%]",
    rotate: -15,
    float: 9,
    dur: 7.5,
    fill: "bg-accent text-accent-ink",
    icon: <Code2 size={16} />,
  },
  {
    title: "Embedded",
    tag: "ESP32 · C++ · sensors",
    pos: "left-[1%] top-[35%]",
    rotate: -7,
    float: 12,
    dur: 6.5,
    fill: "bg-neutral-900 text-white dark:bg-panel-dark",
    icon: <Cpu size={16} />,
  },
  {
    title: "Applied AI",
    tag: "Agents · APIs · local models",
    pos: "left-[4%] top-[59%]",
    rotate: 6,
    float: 10,
    dur: 8,
    fill: "bg-white text-neutral-900",
    icon: <Sparkles size={16} />,
  },
] as const;

function SkillCard({
  title,
  tag,
  fill,
  icon,
}: {
  title: string;
  tag: string;
  fill: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`pointer-events-none flex h-[142px] w-[246px] flex-col justify-between rounded-[1.6rem] border border-white/40 p-6 shadow-[var(--shadow-sticker)] dark:border-white/15 ${fill}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
          Area
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/10">
          {icon}
        </span>
      </div>
      <div>
        <p className="font-display text-[25px] font-semibold leading-none">{title}</p>
        <p className="mt-2 text-[11px] font-medium opacity-65">{tag}</p>
      </div>
    </div>
  );
}

export default function Hero() {
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: [0.21, 0.5, 0.3, 1] as const },
        };

  return (
    <section className="relative">
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <div
          ref={stage}
          className="relative flex flex-1 flex-col items-center justify-center px-6 pb-28 pt-36 text-center"
        >
          <motion.p
            {...rise(0)}
            className="relative z-10 mb-7 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-accent-deep shadow-sm dark:border-white/10 dark:bg-panel-dark dark:text-accent"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70 motion-reduce:hidden" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            Open to new work — {site.location}
          </motion.p>

          <motion.h1
            {...rise(0.08)}
            className="relative z-10 max-w-[18ch] font-display text-5xl font-bold leading-[0.9] tracking-[-0.04em] text-ink sm:text-6xl lg:text-[5.5rem] xl:text-[6.75rem] dark:text-ink-invert"
          >
            <span className="block">Software</span>
            <span className="block">that actually</span>
            <span className="block text-accent-deep dark:text-accent">works.</span>
          </motion.h1>

          <motion.p
            {...rise(0.22)}
            className="relative z-10 mt-10 max-w-md text-lg leading-relaxed text-ink-muted dark:text-ink-invert-muted"
          >
            {site.tagline} I build web platforms, embedded electronics and applied AI
            systems from {site.location}.
          </motion.p>

          <motion.div
            {...rise(0.34)}
            className="relative z-10 mt-11 flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/#work" className="btn-accent px-12 py-5 text-lg">
              <span className="relative z-10">See my work</span>
            </Link>
            <Link href="/#about" className="btn-ghost px-10 py-5 text-lg">
              About me
            </Link>
          </motion.div>

          {/* The floating layer. Hidden below `lg` — there is no room for it
              beside the headline on a narrow screen, and stickers stacked on
              top of the copy are worse than no stickers. */}
          <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
            <div
              aria-hidden="true"
              className="absolute left-[2%] top-[24%] -rotate-12 select-none font-display text-[10rem] font-bold leading-none text-black/[0.045] dark:text-white/[0.05]"
            >
              AM
            </div>

            {CARDS.map((c, i) => (
              <Floaty
                key={c.title}
                constraints={stage}
                rotate={c.rotate}
                className={c.pos}
                z={20 + i}
                float={c.float}
                duration={c.dur}
                delay={i * 0.2}
              >
                <SkillCard title={c.title} tag={c.tag} fill={c.fill} icon={c.icon} />
              </Floaty>
            ))}

            <Floaty
              constraints={stage}
              rotate={-10}
              className="left-[19%] top-[83%]"
              z={26}
              float={7}
              duration={6}
            >
              <MousePointer2
                size={52}
                className="pointer-events-none fill-accent text-accent drop-shadow-[0_8px_14px_rgba(0,0,0,0.4)]"
              />
            </Floaty>

            {/* The portrait. Kept to a small square card rather than a big
                cut-out — at this size it is one object among the stickers,
                not the subject of the page. */}
            <Floaty
              constraints={stage}
              rotate={6}
              className="right-[4%] top-[11%]"
              z={34}
              float={14}
              duration={7.5}
            >
              <div className="pointer-events-none h-[190px] w-[190px] overflow-hidden rounded-[2rem] border-4 border-white shadow-[0_30px_56px_-16px_rgba(0,0,0,0.55)] dark:border-neutral-800">
                <Image
                  src="/images/portrait.jpg"
                  alt=""
                  width={380}
                  height={380}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            </Floaty>

            <Floaty
              constraints={stage}
              rotate={-8}
              className="right-[17%] top-[46%]"
              z={32}
              float={14}
              duration={6.8}
              delay={0.4}
            >
              <div className="pointer-events-none flex h-[96px] w-[96px] items-center justify-center rounded-[1.8rem] border-4 border-white bg-neutral-900 shadow-[0_28px_50px_-16px_rgba(0,0,0,0.55)] dark:border-neutral-800">
                <Zap size={44} className="fill-accent text-accent" />
              </div>
            </Floaty>

            <Floaty
              constraints={stage}
              rotate={7}
              className="right-[23%] top-[80%]"
              z={31}
              float={12}
              duration={7.2}
              delay={0.6}
            >
              <div className="pointer-events-none flex h-[86px] w-[86px] items-center justify-center rounded-[1.8rem] border-4 border-white bg-white/70 shadow-[0_28px_50px_-16px_rgba(0,0,0,0.4)] backdrop-blur-md dark:border-neutral-800 dark:bg-white/10">
                <Database size={40} className="text-accent-deep dark:text-accent" />
              </div>
            </Floaty>

            <Floaty
              constraints={stage}
              rotate={11}
              className="right-[6%] top-[66%]"
              z={33}
              float={15}
              duration={7}
              delay={0.2}
            >
              <div className="pointer-events-none flex h-[98px] w-[98px] items-center justify-center rounded-[2rem] border-4 border-white bg-accent shadow-[0_30px_56px_-16px_rgba(254,176,2,0.7)] dark:border-neutral-800">
                <Bot size={40} className="text-accent-ink" />
              </div>
            </Floaty>

            <Floaty
              constraints={stage}
              rotate={-4}
              className="right-[20%] top-[21%]"
              z={30}
              float={16}
              duration={7.5}
            >
              <div className="pointer-events-none flex h-[62px] w-[112px] items-center justify-end rounded-full border-4 border-white bg-accent px-2 shadow-[0_24px_44px_-14px_rgba(0,0,0,0.4)] dark:border-neutral-800">
                <div className="h-[44px] w-[44px] rounded-full bg-white shadow-md" />
              </div>
            </Floaty>
          </div>
        </div>

        <Marquee
          items={[
            "Web platforms",
            "Embedded systems",
            "Applied AI",
            "REST APIs",
            site.location,
            "Open to new work",
          ]}
          duration={48}
          className="relative z-10 border-y border-black/[0.08] py-5 dark:border-white/10"
          itemClassName="text-[11px] font-bold uppercase tracking-[0.25em] text-ink-subtle dark:text-ink-invert-subtle"
        />
      </div>
    </section>
  );
}
