"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Download } from "lucide-react";
import KineticText from "@/components/ui/KineticText";
import Reveal from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import type { SectionRow, SiteSettingsRow } from "@/types/database";

/**
 * The closing.
 *
 * The page has spent eight sections being precise; this is where it
 * gets loud. The heading is the largest type on the site after the
 * name itself, and the address is set as display type rather than as a
 * link in a sentence — the single thing a visitor might act on should
 * not be the smallest thing on the screen.
 *
 * The live Kigali clock is the detail that earns the section. It is
 * genuinely running, in Alpha's timezone, and it answers the question
 * a stranger actually has before writing to someone three timezones
 * away: is it a reasonable hour there right now. The accompanying line
 * is computed from that hour, not written.
 */
export default function Contact({
  section,
  settings,
}: {
  section: SectionRow;
  settings: SiteSettingsRow;
}) {
  return (
    <section id="contact" className="relative overflow-hidden px-6 py-28 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Reveal variant="rise">
            <span className="reg reg-signal">{settings.availability}</span>
          </Reveal>
          <Reveal variant="rise" delay={0.08}>
            <LocalTime location={settings.location} />
          </Reveal>
        </div>

        <h2 className="mt-10 text-display-md font-display font-semibold leading-[0.9] text-text">
          <KineticText text={section.heading} as="span" trigger="scroll" className="block" />
          {/* Stroke on the wrapper, not on the character spans, so it
              survives the reduced-motion path — that path renders plain
              text with no spans, and a stroke scoped to the spans would
              leave `text-transparent` with nothing drawing it. */}
          {section.accent ? (
            <KineticText
              text={section.accent}
              as="span"
              trigger="scroll"
              delay={0.12}
              className="block text-transparent [-webkit-text-stroke:1.5px_var(--color-signal)]"
            />
          ) : null}
        </h2>

        <Reveal variant="rise" delay={0.2}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-text-muted">{section.intro}</p>
        </Reveal>

        {/* The address, set as display type. */}
        <Reveal variant="rise" delay={0.28} className="mt-12">
          <Magnetic strength={0.18} radius={160}>
            <a
              href={`mailto:${settings.email}`}
              data-cursor-label="Email"
              className="group inline-flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-2xl text-text transition-colors hover:text-signal sm:text-4xl lg:text-5xl"
            >
              <span className="relative">
                {settings.email}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-signal transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                />
              </span>
              <ArrowUpRight
                className="h-7 w-7 shrink-0 transition-transform duration-500 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 sm:h-10 sm:w-10"
                aria-hidden="true"
              />
            </a>
          </Magnetic>
        </Reveal>

        <Reveal variant="stack" className="mt-14 flex flex-wrap items-center gap-4" stagger={0.07}>
          {settings.github_url ? (
            <Magnetic>
              <a
                href={settings.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                data-cursor-label="GitHub"
              >
                <GithubIcon size={16} />
                <span>GitHub</span>
              </a>
            </Magnetic>
          ) : null}

          {settings.linkedin_url ? (
            <Magnetic>
              <a
                href={settings.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                data-cursor-label="LinkedIn"
              >
                <LinkedinIcon size={16} />
                <span>LinkedIn</span>
              </a>
            </Magnetic>
          ) : null}

          {settings.cv_path ? (
            <Magnetic>
              <a href={settings.cv_path} className="btn btn-signal" data-cursor-label="Download">
                <Download size={15} />
                <span>Download CV</span>
              </a>
            </Magnetic>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Kigali local time, live.
 *
 * Rendered as a dash until mounted: the server and the visitor's
 * machine will not agree on the second, and committing to a value
 * during SSR would be a guaranteed hydration mismatch. The interval is
 * aligned to the next whole second so the display does not drift
 * visibly against the system clock.
 */
function LocalTime({ location }: { location: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    let interval: number;
    const align = window.setTimeout(() => {
      setNow(new Date());
      interval = window.setInterval(() => setNow(new Date()), 1000);
    }, 1000 - (Date.now() % 1000));
    return () => {
      window.clearTimeout(align);
      window.clearInterval(interval);
    };
  }, []);

  const format = (opts: Intl.DateTimeFormatOptions) =>
    now
      ? new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Kigali", ...opts }).format(now)
      : "--";

  const hour = now
    ? Number(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Africa/Kigali",
          hour: "numeric",
          hour12: false,
        }).format(now),
      )
    : null;

  // Described from the actual hour rather than asserted.
  const phase =
    hour === null
      ? ""
      : hour >= 9 && hour < 18
        ? "working hours"
        : hour >= 18 && hour < 23
          ? "evening"
          : "overnight";

  return (
    <p className="note flex items-center gap-3">
      <span>{location}</span>
      <span className="text-signal-deep">/</span>
      <span className="tabular-nums text-signal">
        {format({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
      </span>
      {phase ? <span className="text-text-subtle/70">{phase}</span> : null}
    </p>
  );
}
