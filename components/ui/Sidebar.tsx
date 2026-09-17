"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  User,
  Layers,
  Route,
  Mail,
  ArrowUp,
  Search,
  ChevronDown,
  Download,
  Moon,
  Sun,
  Copy,
  Check,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { site } from "@/lib/site";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";

/* ------------------------------------------------------------------
   The rail, rebuilt from fortosee.mp4.

   The video's sidebar is one idea executed precisely: an icon column that
   widens on hover while the labels fade up from zero opacity, so the
   collapsed state is never a truncated version of the expanded one — it is
   its own composition. Three details carry it, and all three are here:

     - Width animates, labels cross-fade. The labels are absolutely
       positioned and faded rather than clipped, so they never reflow the
       icons. The icon column never moves at all.
     - The label fade is SHORTER than the width transition and delayed on
       the way in (0.25s in at 0.1s, 0.15s straight out). Text that arrives
       with the box reads as stretching; text that arrives just behind it
       reads as being revealed.
     - The active row is a filled pill, not an underline or a left border.

   Two things the video does not have to solve, because it is a static demo
   in a slide, and this is a real page:

     - Touch. There is no hover on a phone, so on a coarse pointer the rail
       is a button that toggles, and the expansion is driven by state.
     - Where you are. The video's active row is hard-coded; here it follows
       the section actually in view, and a hairline of accent runs down the
       rail's trailing edge as reading progress.
   ------------------------------------------------------------------ */

const NAV = [
  { label: "Work", href: "/#projects", id: "projects", icon: LayoutDashboard },
  { label: "About", href: "/#about", id: "about", icon: User },
  { label: "Expertise", href: "/#skills", id: "skills", icon: Layers },
  { label: "Journey", href: "/#journey", id: "journey", icon: Route },
  { label: "Contact", href: "/#contact", id: "contact", icon: Mail },
] as const;

const ELSEWHERE = [
  { label: "GitHub", href: site.github, icon: GithubIcon },
  { label: "LinkedIn", href: site.linkedin, icon: LinkedinIcon },
] as const;

/** Expanded width, px. The collapsed width lives in CSS (`--rail`). */
const OPEN = 268;

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [active, setActive] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.3,
  });

  // The pre-paint script already picked a theme; read it rather than
  // guessing, or the icon disagrees with the page for one frame.
  useEffect(() => setTheme(readTheme()), []);

  // Hover drives the rail on a mouse; on touch it would latch open with no
  // way to dismiss it, so there the rail toggles instead.
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Which section is under the middle of the viewport.
  useEffect(() => {
    const seen = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.intersectionRatio);
        let best = "";
        let bestRatio = 0;
        for (const [id, ratio] of seen) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (bestRatio > 0) setActive(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: "-20% 0px -20% 0px" }
    );
    for (const { id } of NAV) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is permission-gated; the Email action is still a mailto
      // away in the Contact section, so failing here is not a dead end.
    }
  };

  const expanded = open;

  return (
    <>
      {coarse && expanded && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-[rgba(15,19,25,0.35)] backdrop-blur-[2px] md:hidden"
        />
      )}

      <nav
        aria-label="Primary"
        onMouseEnter={() => !coarse && setOpen(true)}
        onMouseLeave={() => !coarse && setOpen(false)}
        /* The collapsed width is a CSS variable so it can shrink on a phone,
           where 76px of permanent chrome is a fifth of the screen. `main`
           reads the same two values as padding. */
        style={{ width: expanded ? OPEN : "var(--rail)" }}
        className="fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-line-panel bg-surface transition-[width] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] [--rail:64px] motion-reduce:transition-none md:[--rail:76px]"
      >
        {/* Reading progress, as a hairline down the rail's trailing edge.
            Scaled from the top so it reads as a fill rather than a slide. */}
        {!reduced && (
          <motion.div
            aria-hidden="true"
            style={{ scaleY: progress }}
            className="absolute inset-y-0 right-0 z-10 w-[2px] origin-top bg-primary"
          />
        )}

        {/* ---- identity ------------------------------------------- */}
        <button
          type="button"
          onClick={() => coarse && setOpen((v) => !v)}
          aria-expanded={coarse ? expanded : undefined}
          aria-label={coarse ? "Toggle navigation" : undefined}
          className="relative flex h-[76px] shrink-0 items-center px-[18px] text-left"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-geometric text-[15px] font-semibold text-on-primary">
            {site.shortName.charAt(0)}
          </span>
          <Label show={expanded} className="left-[68px] right-9">
            <span className="block truncate font-geometric text-[13px] font-semibold leading-tight text-text-primary">
              {site.name}
            </span>
            <span className="block truncate font-geometric text-[11px] leading-tight text-text-muted">
              {site.role}
            </span>
          </Label>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={`absolute right-4 text-text-muted transition-opacity duration-200 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          />
        </button>

        {/* ---- availability ---------------------------------------
            Collapsed, this is the only thing in the rail carrying colour
            besides the active pill, so it reads as a status light. */}
        <div className="relative mx-[18px] mb-3 flex h-8 shrink-0 items-center">
          <span className="grid w-10 shrink-0 place-items-center">
            <span className="relative grid h-2.5 w-2.5 place-items-center">
              {!reduced && (
                <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-primary opacity-60" />
              )}
              <span className="relative h-2 w-2 rounded-full bg-primary" />
            </span>
          </span>
          <Label show={expanded} className="left-10 right-3">
            <span className="block truncate font-geometric text-[11px] tracking-[0.08em] text-text-secondary">
              Open to new work
            </span>
          </Label>
          <span className="sr-only">Availability: open to new work</span>
        </div>

        {/* ---- browse ---------------------------------------------
            The video's search field. A portfolio has nothing to search, so
            it is a link to the work wearing the same shape — the rail keeps
            its rhythm without pretending to a feature that does not exist. */}
        <Link
          href="/#projects"
          className="relative mx-[18px] mb-2 flex h-10 shrink-0 items-center rounded-pill border border-line bg-bg-raised transition-colors duration-200 hover:border-primary"
          tabIndex={expanded ? 0 : -1}
          aria-hidden={!expanded}
        >
          <span className="grid w-10 shrink-0 place-items-center text-text-muted">
            <Search size={17} aria-hidden="true" />
          </span>
          <Label show={expanded} className="left-10 right-3">
            <span className="block truncate font-geometric text-[12px] text-text-muted">
              Browse the work
            </span>
          </Label>
        </Link>

        {/* ---- navigation ---------------------------------------- */}
        <ul className="flex flex-col gap-0.5 px-[18px] py-1">
          {NAV.map(({ label, href, id, icon: Icon }) => {
            const on = active === id;
            return (
              <li key={id}>
                <Link
                  href={href}
                  aria-current={on ? "page" : undefined}
                  onClick={() => coarse && setOpen(false)}
                  className={`relative flex h-11 items-center rounded-pill transition-colors duration-200 ${
                    on
                      ? "bg-primary-light text-primary-strong"
                      : "text-text-secondary hover:bg-bg-raised"
                  }`}
                >
                  <span className="grid w-10 shrink-0 place-items-center">
                    <Icon
                      size={19}
                      aria-hidden="true"
                      className={on ? "text-primary" : "text-text-muted"}
                    />
                  </span>
                  <Label show={expanded} className="left-10 right-3">
                    <span
                      className={`block truncate font-geometric text-[13.5px] ${
                        on ? "font-medium" : ""
                      }`}
                    >
                      {label}
                    </span>
                  </Label>
                  {/* The rail is 76px at rest, so the label is not readable
                      collapsed — the icon carries it, and this restores the
                      name for assistive technology. */}
                  <span className="sr-only">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mx-[18px] my-2 h-px shrink-0 bg-line" />

        {/* ---- elsewhere ----------------------------------------- */}
        <ul className="flex flex-col gap-0.5 px-[18px]">
          {ELSEWHERE.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="relative flex h-11 items-center rounded-pill text-text-secondary transition-colors duration-200 hover:bg-bg-raised"
              >
                <span className="grid w-10 shrink-0 place-items-center text-text-muted">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <Label show={expanded} className="left-10 right-3">
                  <span className="block truncate font-geometric text-[13.5px]">
                    {label}
                  </span>
                </Label>
                <span className="sr-only">{label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* ---- foot ---------------------------------------------- */}
        <div className="mt-auto flex flex-col gap-2 px-[18px] pb-[18px] pt-4">
          <a
            href={site.cv}
            download
            className="btn-depth relative flex h-11 items-center rounded-pill bg-primary text-on-primary"
          >
            <span className="grid w-10 shrink-0 place-items-center">
              <Download size={17} aria-hidden="true" />
            </span>
            <Label show={expanded} className="left-10 right-3">
              <span className="block truncate font-geometric text-[13px] font-medium">
                Download CV
              </span>
            </Label>
            <span className="sr-only">Download CV</span>
          </a>

          {/* The video's bottom action row. Every one of these does
              something — a row of decorative icons would be the one place
              the rail stopped being real. */}
          <div className="flex items-center gap-1">
            <Action
              label={theme === "dark" ? "Switch to light" : "Switch to dark"}
              onClick={toggleTheme}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Action>
            <Action
              label={copied ? "Email copied" : "Copy email address"}
              onClick={copyEmail}
            >
              {copied ? (
                <Check size={16} className="text-primary" />
              ) : (
                <Copy size={16} />
              )}
            </Action>
            <Action
              label="Back to top"
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: reduced ? "auto" : "smooth",
                })
              }
            >
              <ArrowUp size={16} />
            </Action>
          </div>
        </div>
      </nav>
    </>
  );
}

/** One square in the bottom action row. */
function Action({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-tile border border-line text-text-muted transition-colors duration-200 hover:border-primary hover:bg-bg-raised hover:text-primary-strong"
    >
      {children}
    </button>
  );
}

/**
 * A rail label.
 *
 * Absolutely positioned so it can never push the icon column around, and
 * cross-faded rather than clipped. The asymmetry is deliberate: fading in
 * waits 0.1s so the box has already started widening, while fading out is
 * immediate and quick — text should be gone before the rail narrows onto
 * it. Under reduced motion it simply appears.
 */
function Label({
  children,
  show,
  className = "",
}: {
  children: React.ReactNode;
  show: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden={!show}
      className={`pointer-events-none absolute ${className} ${
        show
          ? "opacity-100 delay-100 duration-[250ms]"
          : "opacity-0 delay-0 duration-[150ms]"
      } transition-opacity motion-reduce:transition-none`}
    >
      {children}
    </span>
  );
}
