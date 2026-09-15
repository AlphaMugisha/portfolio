"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import SplitText from "@/components/ui/SplitText";
import Marquee from "@/components/ui/Marquee";
import Magnetic from "@/components/ui/Magnetic";
import { site } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hero — the porcelain band, opened with a per-letter rise.
 *
 * The headline builds itself letter by letter on load; everything else
 * follows it in one settled sequence. The band still carries dark type only.
 */
const TICKER = [
  "Software",
  "Hardware",
  "Applied AI",
  "Web platforms",
  "Embedded systems",
  "Kigali, Rwanda",
];

function Enter({
  children,
  delay,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();

  return (
    <section
      id="hero"
      data-band="light"
      className="bg-band-light pt-32 text-on-band sm:pt-40"
    >
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Enter delay={0.05}>
          <p className="meta text-on-band-muted">
            {site.name} — {site.location}
          </p>
        </Enter>

        <h1 className="text-mega mt-6 text-[clamp(3rem,12vw,9rem)]">
          <SplitText text="Software" delay={0.15} stagger={0.045} />
          <br />
          <SplitText text="Engineer" delay={0.5} stagger={0.045} />
        </h1>

        <Enter delay={0.75}>
          <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-on-band-muted">
            {site.tagline} I build web platforms, embedded electronics and
            applied AI systems from {site.location}.
          </p>
        </Enter>

        <Enter delay={0.9} className="mt-10 flex flex-wrap items-center gap-4">
          <Magnetic pull={8} contentPull={4} radius={90}>
            <Link
              href="#projects"
              className="btn-depth group inline-flex items-center gap-2.5 rounded-sm bg-on-band px-6 py-3.5 text-sm font-medium text-band-light"
            >
              See my work
              <motion.span
                aria-hidden="true"
                animate={reduced ? undefined : { y: [0, 3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex"
              >
                <ArrowDown size={15} />
              </motion.span>
            </Link>
          </Magnetic>
          <Magnetic pull={8} contentPull={4} radius={90}>
            <Link
              href="#contact"
              className="btn-depth inline-flex items-center rounded-sm border border-line-band px-6 py-3.5 text-sm font-medium text-on-band"
            >
              Get in touch
            </Link>
          </Magnetic>
        </Enter>
      </div>

      <Enter delay={1.05} className="mt-14">
        <Marquee
          items={TICKER}
          duration={34}
          className="border-t border-line-band py-4"
          itemClassName="meta text-on-band-muted"
        />
      </Enter>
    </section>
  );
}
