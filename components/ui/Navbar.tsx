"use client";

import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import MenuCurtain from "./MenuCurtain";
import { navItems } from "@/lib/site";
import type { SiteSettingsRow } from "@/types/database";

/**
 * The header, built as an instrument strip.
 *
 * It carries three live readings rather than a row of links:
 *   - a hairline progress rail along the bottom edge showing position
 *     through the document;
 *   - the section you are currently in, swapped as you pass through it;
 *   - the index count, as the affordance for the full menu.
 *
 * Links themselves live only in the curtain. One source of truth for
 * navigation means the bar cannot drift out of sync with the menu, and
 * it keeps the strip quiet enough to sit over the hero without
 * competing with the name.
 *
 * Both readings are written straight to the DOM from a scroll handler
 * and an IntersectionObserver — the progress rail never goes through
 * React state, because a setState per scroll event would re-render the
 * header sixty times a second for a one-pixel change.
 */
export default function Navbar({ settings }: { settings: SiteSettingsRow }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [section, setSection] = useState("");
  const rail = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;

    const read = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (rail.current) rail.current.style.transform = `scaleX(${progress})`;
      setScrolled(window.scrollY > 24);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Which section is currently crossing the upper third of the viewport.
  useEffect(() => {
    const targets = navItems
      .map((item) => document.querySelector(item.href.replace("/", "")))
      .filter((el): el is Element => Boolean(el));
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!hit) return;
        const match = navItems.find((item) => item.href.replace("/#", "") === hit.target.id);
        setSection(match?.label ?? "");
      },
      { rootMargin: "-12% 0px -72% 0px", threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  // The curtain owns scroll lock through the attribute SmoothScroll watches.
  useEffect(() => {
    if (open) document.documentElement.dataset.scrollLocked = "true";
    else delete document.documentElement.dataset.scrollLocked;
    return () => {
      delete document.documentElement.dataset.scrollLocked;
    };
  }, [open]);

  return (
    <>
      <nav
        aria-label="Primary"
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
          scrolled
            ? "border-b border-rule bg-ink/80 py-3 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6">
          <Logo name={settings.name} size={30} />

          {/* Live section readout. */}
          <span
            aria-hidden="true"
            className={`hidden items-center gap-3 transition-opacity duration-500 sm:flex ${
              section && scrolled ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="h-1 w-1 rounded-full bg-signal" />
            <span key={section} className="note note-signal">
              {section}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            data-cursor-label={open ? "Close" : "Menu"}
            className="group flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-signal"
          >
            <span className="hidden sm:inline">{open ? "Close" : "Index"}</span>
            <span className="grid h-9 w-9 place-items-center border border-rule-strong transition-colors group-hover:border-signal">
              <span className="relative flex h-3 w-3.5 flex-col justify-between">
                <span
                  className={`h-px w-full bg-current transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "translate-y-[5.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-px w-full bg-current transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`h-px w-full bg-current transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    open ? "-translate-y-[5.5px] -rotate-45" : ""
                  }`}
                />
              </span>
            </span>
            <span className="text-text-subtle">({String(navItems.length).padStart(2, "0")})</span>
          </button>
        </div>

        {/* Progress rail. */}
        <span className="absolute inset-x-0 bottom-0 h-px overflow-hidden" aria-hidden="true">
          <span ref={rail} className="block h-full origin-left scale-x-0 bg-signal" />
        </span>
      </nav>

      <MenuCurtain open={open} onClose={() => setOpen(false)} settings={settings} />
    </>
  );
}
