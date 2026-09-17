"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, Moon, Sun, Download } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { site, navItems } from "@/lib/site";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Site header — an ordinary one, on purpose.
 *
 * Wordmark left, links in the middle, actions right, and a drawer under a
 * hamburger below the `md` breakpoint. It sits transparent over the top of
 * the hero and picks up a glass fill and a hairline once the page has
 * scrolled, which is the whole of its cleverness.
 *
 * The underline on the active link is a shared `layoutId`, so moving between
 * sections slides one rule rather than cross-fading five. That is the single
 * detail worth having here; everything else should be unsurprising.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [theme, setTheme] = useState<Theme>("light");
  const reduced = useReducedMotion();

  useEffect(() => setTheme(readTheme()), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Which section is under the middle of the viewport.
  useEffect(() => {
    const ids = navItems.map((n) => n.href.split("#")[1]).filter(Boolean);
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
        setActive(bestRatio > 0 ? best : "");
      },
      { threshold: [0, 0.3, 0.6, 1], rootMargin: "-25% 0px -25% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // The drawer covers the page, so the page must not scroll behind it, and
  // Escape must close it.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled || open
            ? "border-b border-line bg-surface/85 backdrop-blur-xl"
            : "border-b border-transparent"
        }`}
      >
        {/* Padding outside the measure, exactly as every section does it —
            pad inside and the wordmark lands 40px right of the grid the
            rest of the page is built on. */}
        <div className="px-6 sm:px-10">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 sm:h-[72px]">
          <Link
            href="/"
            className="script shrink-0 text-2xl leading-none text-text-primary"
          >
            {site.shortName.toLowerCase()}
          </Link>

          {/* ---- links ------------------------------------------- */}
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const id = item.href.split("#")[1];
                const on = active === id;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={on ? "page" : undefined}
                      className={`relative block px-3.5 py-2 font-geometric text-[13.5px] transition-colors ${
                        on
                          ? "text-text-primary"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {item.label}
                      {on && (
                        <motion.span
                          layoutId="nav-underline"
                          aria-hidden="true"
                          className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-primary"
                          transition={
                            reduced
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 420, damping: 34 }
                          }
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ---- actions ----------------------------------------- */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
              }
              className="grid h-9 w-9 place-items-center rounded-full text-text-secondary transition-colors hover:bg-bg-raised hover:text-text-primary"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <a
              href={site.cv}
              download
              className="btn-depth hidden items-center gap-2 rounded-full bg-primary px-4 py-2 font-geometric text-[13px] font-medium text-on-primary sm:inline-flex"
            >
              <Download size={15} aria-hidden="true" />
              CV
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-9 w-9 place-items-center rounded-full text-text-primary transition-colors hover:bg-bg-raised md:hidden"
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
            </div>
          </div>
        </div>
      </header>

      {/* ---- mobile drawer --------------------------------------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-x-0 top-16 z-40 border-b border-line bg-surface px-6 pb-8 pt-4 shadow-[var(--shadow-card)] md:hidden"
          >
            <ul className="flex flex-col">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line py-3.5 font-geometric text-base text-text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.cv}
                download
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-geometric text-[13px] font-medium text-on-primary"
              >
                <Download size={15} aria-hidden="true" />
                Download CV
              </a>
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="grid h-11 w-11 place-items-center rounded-full border border-line text-text-secondary"
              >
                <GithubIcon size={17} />
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="grid h-11 w-11 place-items-center rounded-full border border-line text-text-secondary"
              >
                <LinkedinIcon size={17} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
