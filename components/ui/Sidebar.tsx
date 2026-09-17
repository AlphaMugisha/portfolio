"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Layers,
  Route,
  Mail,
  ArrowUp,
  Search,
  ChevronDown,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { site } from "@/lib/site";

/* ------------------------------------------------------------------
   The rail, rebuilt from fortosee.mp4.

   The video's sidebar is one idea executed precisely: a 44px icon column
   that widens on hover while the labels fade up from zero opacity, so the
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
       is a button that toggles, and the expansion is driven by state
       rather than by :hover.
     - Where you are. The video's active row is hard-coded; here it follows
       the section actually in view.
   ------------------------------------------------------------------ */

const NAV = [
  { label: "Work", href: "/#projects", id: "projects", icon: LayoutDashboard },
  { label: "About", href: "/#about", id: "about", icon: User },
  { label: "Expertise", href: "/#skills", id: "skills", icon: Layers },
  { label: "Journey", href: "/#journey", id: "journey", icon: Route },
  { label: "Contact", href: "/#contact", id: "contact", icon: Mail },
] as const;

/** Expanded width, px. The collapsed width lives in CSS (`--rail`). */
const OPEN = 268;

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [active, setActive] = useState("");

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
    const ids = NAV.map((n) => n.id);
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

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const expanded = open;

  return (
    <>
      {/* Scrim. Only ever shown on touch, where the rail is a real overlay
          rather than a widening column. */}
      {coarse && expanded && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-[rgba(57,58,61,0.25)] backdrop-blur-[2px] md:hidden"
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
        className="group/rail fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-line-panel bg-surface transition-[width] duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] [--rail:64px] motion-reduce:transition-none md:[--rail:76px]"
      >
        {/* ---- identity ------------------------------------------- */}
        <button
          type="button"
          onClick={() => coarse && setOpen((v) => !v)}
          aria-expanded={coarse ? expanded : undefined}
          aria-label={coarse ? "Toggle navigation" : undefined}
          className="relative flex h-[76px] shrink-0 items-center px-[18px] text-left"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-[15px] font-semibold text-on-primary">
            {site.shortName.charAt(0)}
          </span>
          <Label show={expanded} className="left-[68px] right-4">
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

        {/* ---- search -------------------------------------------- */}
        {/* Decorative in the video and decorative here: a portfolio has
            nothing to search. It is a link to the work instead, wearing the
            same shape, so the rail keeps its rhythm without pretending to
            a feature that does not exist. */}
        <Link
          href="/#projects"
          className="relative mx-[18px] mb-2 flex h-10 shrink-0 items-center rounded-pill border border-line bg-bg-raised"
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
        <ul className="flex flex-col gap-0.5 px-[18px] py-2">
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
                  {/* The rail is 76px wide at rest, so the label is not
                      readable when collapsed — the icon carries it, and
                      this restores the name for assistive technology. */}
                  <span className="sr-only">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mx-[18px] my-2 h-px shrink-0 bg-line" />

        {/* ---- elsewhere ----------------------------------------- */}
        <ul className="flex flex-col gap-0.5 px-[18px]">
          {[
            { label: "GitHub", href: site.github, icon: GithubIcon },
            { label: "LinkedIn", href: site.linkedin, icon: LinkedinIcon },
            { label: "Email", href: `mailto:${site.email}`, icon: Mail },
          ].map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
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
        <div className="mt-auto px-[18px] pb-[18px] pt-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="relative flex h-11 w-full items-center rounded-pill border border-line text-text-secondary transition-colors duration-200 hover:border-primary hover:text-primary-strong"
          >
            <span className="grid w-10 shrink-0 place-items-center">
              <ArrowUp size={17} aria-hidden="true" />
            </span>
            <Label show={expanded} className="left-10 right-3">
              <span className="block truncate font-geometric text-[12.5px]">
                Back to top
              </span>
            </Label>
            <span className="sr-only">Back to top</span>
          </button>
        </div>
      </nav>
    </>
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
