"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { site, navItems } from "@/lib/site";

/**
 * Site header: script wordmark left, links right, and a plain dropdown panel
 * on small screens.
 *
 * The header floats over whichever section is beneath it, so its ink follows
 * the page: every section declares `data-band="light"` or `data-band="dark"`,
 * and a one-pixel observation strip level with the header reports which one
 * is currently under it.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<"light" | "dark">("light");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Which band is under the header right now.
  useEffect(() => {
    const bands = document.querySelectorAll<HTMLElement>("[data-band]");
    if (!bands.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setTone(
              (e.target as HTMLElement).dataset.band === "light"
                ? "light"
                : "dark"
            );
          }
        }
      },
      { rootMargin: "-38px 0px -100% 0px", threshold: 0 }
    );

    for (const el of bands) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Close the menu with Escape, and never leave the page scroll-locked.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onLight = tone === "light" && !open && !scrolled;
  const ink = onLight ? "text-on-band" : "text-text-primary";
  const inkMuted = onLight ? "text-on-band-muted" : "text-text-secondary";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "glass" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 sm:px-10">
        <Link
          href="/#hero"
          aria-label={`${site.name} — home`}
          onClick={() => setOpen(false)}
          className={`script text-2xl leading-none ${ink}`}
        >
          {site.shortName.toLowerCase()}
        </Link>

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-7">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`meta transition-colors hover:text-primary ${inkMuted}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="site-menu"
          className={`meta sm:hidden ${ink}`}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          id="site-menu"
          aria-label="Primary"
          className="glass border-t border-line sm:hidden"
        >
          <ul className="space-y-1 px-6 py-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-lg text-text-primary transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
