"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { navItems, site } from "@/lib/site";

/**
 * Site header.
 *
 * Transparent over the top of the hero, then it picks up the blurred
 * translucent fill once the page has scrolled — which is what keeps the hero
 * feeling full-bleed while still giving the links a readable backing
 * everywhere else. The padding shrinks at the same time, so the bar
 * physically tightens as you move down the page.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer when the route changes under it.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav
      aria-label="Primary"
      className={`fixed top-0 z-[100] w-full transition-all duration-300 ${
        scrolled || open ? "nav-blur py-3" : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6">
        <Logo size={34} />

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink-muted transition-colors hover:text-ink dark:text-ink-invert-muted dark:hover:text-ink-invert"
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
          <a
            href={`mailto:${site.email}`}
            className="group flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink shadow-[0_10px_30px_-8px_rgba(254,176,2,0.7)] transition-colors hover:bg-accent-bright"
          >
            Contact
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="p-1 text-ink dark:text-ink-invert"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-0 top-full flex w-full flex-col gap-6 border-b border-black/5 bg-white px-6 py-6 shadow-2xl md:hidden dark:border-white/10 dark:bg-panel-dark"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-semibold text-ink dark:text-ink-invert"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`mailto:${site.email}`}
              onClick={() => setOpen(false)}
              className="rounded-2xl bg-accent py-4 text-center font-semibold text-accent-ink"
            >
              Contact
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
