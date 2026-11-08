"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";
import MenuCurtain from "./MenuCurtain";
import { navItems } from "@/lib/site";
import type { SiteSettingsRow } from "@/types/database";

/**
 * A slim, mostly-transparent bar that only ever does one thing: open the
 * full-screen index. There are no inline links to keep in sync with the
 * curtain's — one source of truth for navigation, one place it performs.
 */
export default function Navbar({ settings }: { settings: SiteSettingsRow }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <nav
        aria-label="Primary"
        className={`fixed top-0 z-100 w-full transition-all duration-300 ${
          scrolled ? "nav-blur py-3.5" : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6">
          <Logo name={settings.name} size={32} />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="group flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-text-muted transition-colors hover:text-signal"
          >
            <span>{open ? "Close" : "Menu"}</span>
            <span className="relative flex h-8 w-8 items-center justify-center border border-rule-strong transition-colors group-hover:border-signal">
              <span className="relative flex h-3 w-3 flex-col justify-between">
                <span
                  className={`h-px w-full bg-current transition-transform duration-300 ${
                    open ? "translate-y-[5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`h-px w-full bg-current transition-transform duration-300 ${
                    open ? "-translate-y-[5px] -rotate-45" : ""
                  }`}
                />
              </span>
            </span>
            <span className="hidden text-text-subtle sm:inline">
              ({String(navItems.length).padStart(2, "0")})
            </span>
          </button>
        </div>
      </nav>

      <MenuCurtain open={open} onClose={() => setOpen(false)} />
    </>
  );
}
