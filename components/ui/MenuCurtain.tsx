"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./BrandIcons";
import { navItems, site } from "@/lib/site";

/**
 * The site's one theatrical moment: the canvas drops down over the page like
 * a shutter, then each link rises up from inside its own masked row. Every
 * other transition on the site is quiet; this is the one place motion is
 * allowed to perform.
 */
export default function MenuCurtain({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col bg-ink-overlay"
          initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
          exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="grid-field" aria-hidden="true" />
          <div className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-subtle">
              {site.shortName} / Index
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="btn btn-outline px-5 py-2.5 text-xs"
            >
              Close
            </button>
          </div>

          <nav className="relative z-10 flex flex-1 flex-col justify-center px-6 sm:px-10">
            <ul>
              {navItems.map((item, i) => (
                <li key={item.href} className="overflow-hidden border-b border-rule">
                  <motion.div
                    initial={reduced ? { opacity: 0 } : { y: "100%" }}
                    animate={reduced ? { opacity: 1 } : { y: "0%" }}
                    exit={reduced ? { opacity: 0 } : { y: "100%" }}
                    transition={{
                      duration: 0.55,
                      delay: reduced ? 0 : 0.18 + i * 0.07,
                      ease: [0.21, 0.5, 0.3, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-baseline gap-5 py-4 sm:py-6"
                    >
                      <span className="font-mono text-sm text-signal-dim">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-4xl font-semibold tracking-tight text-text transition-colors group-hover:text-signal sm:text-6xl">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-10 flex flex-col gap-4 border-t border-rule px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex items-center gap-2 font-mono text-sm text-text-muted transition-colors hover:text-signal"
            >
              {site.email}
              <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="flex items-center gap-4 text-text-muted">
              <a href={site.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="transition-colors hover:text-signal">
                <GithubIcon size={18} />
              </a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="transition-colors hover:text-signal">
                <LinkedinIcon size={18} />
              </a>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
