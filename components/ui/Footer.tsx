"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./BrandIcons";
import Logo from "./Logo";
import type { SiteSettingsRow } from "@/types/database";

const EXPLORE = [
  { label: "Meet Alpha", href: "/#meet" },
  { label: "The beginning", href: "/#beginning" },
  { label: "The learning journey", href: "/#learning" },
  { label: "The things I've built", href: "/#built" },
  { label: "How I see the world", href: "/#world" },
  { label: "Let's connect", href: "/#connect" },
] as const;

/**
 * The footer, closed by a wordmark you can light up.
 *
 * The name is set at the full width of the viewport in near-invisible
 * ink, with a second copy in the signal colour masked to a soft radial
 * at the pointer — so moving across it sweeps a beam over the letters
 * and the name is the last thing that responds to you before you
 * leave. It is the quietest interaction on the site and the one most
 * likely to be found by accident, which is the point.
 *
 * Both copies are the same text node duplicated and `aria-hidden`; the
 * accessible name is on the container, so the wordmark is announced
 * once.
 *
 * The mask position is written to a CSS custom property inside a rAF,
 * so a fast sweep coalesces to one style write per frame instead of
 * one per pointer event. No pointer, no listener: coarse pointers and
 * reduced-motion visitors get the static ink version.
 */
export default function Footer({ settings }: { settings: SiteSettingsRow }) {
  const mark = useRef<HTMLDivElement>(null);
  const name = settings.name.toUpperCase();

  useEffect(() => {
    const el = mark.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let pending: { x: number; y: number } | null = null;

    const flush = () => {
      raf = 0;
      if (!pending) return;
      el.style.setProperty("--mx", `${pending.x}%`);
      el.style.setProperty("--my", `${pending.y}%`);
    };

    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      pending = {
        x: ((event.clientX - box.left) / box.width) * 100,
        y: ((event.clientY - box.top) / box.height) * 100,
      };
      if (!raf) raf = requestAnimationFrame(flush);
    };

    const onEnter = () => el.style.setProperty("--beam", "1");
    const onLeave = () => el.style.setProperty("--beam", "0");

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const contact = [
    { label: "Email", href: `mailto:${settings.email}`, external: true },
    ...(settings.github_url ? [{ label: "GitHub", href: settings.github_url, external: true }] : []),
    ...(settings.linkedin_url
      ? [{ label: "LinkedIn", href: settings.linkedin_url, external: true }]
      : []),
    ...(settings.cv_path ? [{ label: "Download CV", href: settings.cv_path, external: false }] : []),
  ];

  return (
    <footer className="relative z-[2] overflow-hidden border-t border-rule bg-ink">
      <div className="mx-auto max-w-7xl px-6 pt-20">
        <div className="grid gap-12 border-b border-rule pb-16 md:grid-cols-12">
          <div className="space-y-6 md:col-span-5">
            <Logo name={settings.name} size={36} />
            <p className="max-w-sm text-[17px] leading-relaxed text-text-muted">
              {settings.tagline} Building web platforms, embedded electronics and applied AI from{" "}
              {settings.location}.
            </p>
            <div className="flex gap-3 pt-1">
              {[
                ...(settings.github_url
                  ? [{ href: settings.github_url, label: "GitHub", icon: <GithubIcon size={17} /> }]
                  : []),
                ...(settings.linkedin_url
                  ? [
                      {
                        href: settings.linkedin_url,
                        label: "LinkedIn",
                        icon: <LinkedinIcon size={17} />,
                      },
                    ]
                  : []),
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  data-cursor-label={social.label}
                  className="grid h-11 w-11 place-items-center border border-rule text-text-muted transition-colors hover:border-signal hover:text-signal"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-7 sm:grid-cols-3">
            <div>
              <h2 className="note note-signal mb-5">Explore</h2>
              <ul className="space-y-3 text-[15px]">
                {EXPLORE.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-text-muted transition-colors hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="note note-signal mb-5">Contact</h2>
              <ul className="space-y-3 text-[15px]">
                {contact.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external && !link.href.startsWith("mailto:") ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-center gap-1.5 text-text-muted transition-colors hover:text-text"
                    >
                      {link.label}
                      {link.external ? (
                        <ArrowUpRight
                          size={13}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="note note-signal mb-5">Currently</h2>
              <p className="text-[15px] leading-relaxed text-text-muted">{settings.availability}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-[15px] text-text-muted">
                <MapPin size={14} className="text-signal" />
                {settings.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 py-7 font-mono text-[11px] text-text-subtle md:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.name}. Built with Next.js.
          </p>
          <p>Designed &amp; built in Rwanda</p>
        </div>
      </div>

      {/* The wordmark. */}
      <div
        ref={mark}
        className="relative select-none px-4 pb-4"
        style={{ ["--mx" as string]: "50%", ["--my" as string]: "50%", ["--beam" as string]: "0" }}
        aria-label={settings.name}
        role="img"
      >
        <span
          aria-hidden="true"
          className="block whitespace-nowrap text-center font-display font-semibold leading-[0.8] tracking-[-0.04em] text-text/[0.05]"
          style={{ fontSize: "min(11.6vw, 12rem)" }}
        >
          {name}
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 block whitespace-nowrap px-4 text-center font-display font-semibold leading-[0.8] tracking-[-0.04em] text-signal"
          style={{
            fontSize: "min(11.6vw, 12rem)",
            opacity: "var(--beam)",
            transition: "opacity 420ms linear",
            maskImage:
              "radial-gradient(22rem 18rem at var(--mx) var(--my), black 0%, rgba(0,0,0,0.35) 45%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(22rem 18rem at var(--mx) var(--my), black 0%, rgba(0,0,0,0.35) 45%, transparent 72%)",
          }}
        >
          {name}
        </span>
      </div>
    </footer>
  );
}
