"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { GithubIcon, LinkedinIcon } from "./BrandIcons";
import { navItems } from "@/lib/site";
import { useReducedMotion } from "@/lib/motion";
import type { SiteSettingsRow } from "@/types/database";

/**
 * The index — the site's one theatrical moment.
 *
 * A shutter closes over the page from the bottom edge, then each entry
 * climbs out of its own masked row in sequence; on the way out the
 * whole thing retracts the way it came. Everything else here is
 * restrained, and this is allowed to perform, because a full-screen
 * takeover is the one interaction where the visitor is definitely not
 * looking at anything else.
 *
 * Hovering an entry extends a trace across the empty space to its
 * right and pushes the label along the line — navigation behaving like
 * the rest of the board rather than like a list of links.
 *
 * Exit animation without a presence library: `mounted` is held true
 * until the outbound timeline finishes, which is the one job
 * AnimatePresence was doing here. Doing it by hand let framer-motion be
 * dropped from the bundle entirely — it was the last consumer — for
 * about 40 kB of JavaScript that no longer ships.
 *
 * Accessibility: focus moves into the panel on open and returns to the
 * trigger on close, Escape closes it, Tab is trapped inside while it is
 * open, and the panel is a labelled modal dialog.
 */
export default function MenuCurtain({
  open,
  onClose,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  settings: SiteSettingsRow;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<Element | null>(null);

  // Mount immediately on open; delay unmount until the exit finishes.
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const el = panel.current;
    if (!el) return;

    const rows = el.querySelectorAll("[data-row]");
    const chrome = el.querySelectorAll("[data-chrome]");

    if (reduced) {
      // No travel, just presence — and unmount immediately on close.
      gsap.set(el, { opacity: open ? 1 : 0 });
      gsap.set([...rows, ...chrome], { opacity: open ? 1 : 0, y: 0, clearProps: "transform" });
      if (!open) setMounted(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (!open) setMounted(false);
      },
    });

    if (open) {
      tl.fromTo(
        el,
        { clipPath: "inset(100% 0 0 0)" },
        { clipPath: "inset(0% 0 0 0)", duration: 0.72, ease: "power4.inOut" },
      )
        .fromTo(
          rows,
          { yPercent: 115 },
          { yPercent: 0, duration: 0.65, stagger: 0.055, ease: "power3.out" },
          0.26,
        )
        .fromTo(chrome, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.5);
    } else {
      tl.to(chrome, { opacity: 0, duration: 0.2 })
        .to(rows, { yPercent: 115, duration: 0.4, stagger: 0.03, ease: "power3.in" }, 0)
        .to(el, { clipPath: "inset(100% 0 0 0)", duration: 0.6, ease: "power4.inOut" }, 0.2);
    }

    return () => {
      tl.kill();
    };
  }, [open, mounted, reduced]);

  // Focus management.
  useEffect(() => {
    if (open) {
      restoreTo.current = document.activeElement;
      const id = window.setTimeout(() => {
        panel.current?.querySelector<HTMLElement>("a,button")?.focus();
      }, 80);
      return () => window.clearTimeout(id);
    }
    if (restoreTo.current instanceof HTMLElement) restoreTo.current.focus();
  }, [open]);

  // Escape to close, Tab trapped inside.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Site index"
      className="fixed inset-0 z-[200] flex flex-col bg-ink-deep"
      style={{ clipPath: "inset(100% 0 0 0)" }}
    >
      <div className="board-field" aria-hidden="true" />

      <div
        data-chrome
        className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10"
      >
        <span className="note note-signal">{settings.short_name} / Index</span>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost px-5 py-2.5 text-[11px]"
          data-cursor-label="Close"
        >
          <span>Close</span>
        </button>
      </div>

      <nav className="relative z-10 flex flex-1 items-center px-6 sm:px-10">
        <ul className="w-full">
          {navItems.map((item, i) => (
            <li key={item.href} className="overflow-hidden border-b border-rule">
              <div data-row>
                <Link
                  href={item.href}
                  onClick={onClose}
                  data-cursor-label="Go"
                  className="group flex items-center gap-5 py-3.5 sm:gap-8 sm:py-5"
                >
                  <span className="shrink-0 font-mono text-xs text-signal-deep transition-colors group-hover:text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="font-display text-[clamp(2rem,7vw,4.5rem)] font-semibold leading-none tracking-tight text-text transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3 group-hover:text-signal">
                    {item.label}
                  </span>

                  {/* The trace that extends across the gap on hover. */}
                  <span
                    aria-hidden="true"
                    className="hidden h-px flex-1 origin-left scale-x-0 bg-signal transition-transform duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 sm:block"
                  />

                  <ArrowUpRight
                    size={22}
                    aria-hidden="true"
                    className="hidden shrink-0 -translate-x-3 text-signal opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 sm:block"
                  />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </nav>

      <div
        data-chrome
        className="relative z-10 flex flex-col gap-4 border-t border-rule px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10"
      >
        <a
          href={`mailto:${settings.email}`}
          className="group inline-flex items-center gap-2 font-mono text-sm text-text-muted transition-colors hover:text-signal"
          data-cursor-label="Email"
        >
          {settings.email}
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>

        <div className="flex items-center gap-4 text-text-muted">
          <span className="note">{settings.location}</span>
          {settings.github_url ? (
            <a
              href={settings.github_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="transition-colors hover:text-signal"
            >
              <GithubIcon size={17} />
            </a>
          ) : null}
          {settings.linkedin_url ? (
            <a
              href={settings.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="transition-colors hover:text-signal"
            >
              <LinkedinIcon size={17} />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
