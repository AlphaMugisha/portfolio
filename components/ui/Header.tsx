"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { site, navItems } from "@/lib/site";

const EASE = [0.16, 1, 0.3, 1] as const;
const CURTAIN = [0.76, 0, 0.24, 1] as const;

/**
 * Site header, and the full-screen menu behind it.
 *
 * The bar hides while you scroll down and slides back the moment you scroll
 * up, so it never sits over content you are reading. Its ink follows the
 * page: every section declares `data-band`, and a one-pixel strip level with
 * the header reports which band is under it.
 *
 * The menu is the one theatrical moment on the site: a curtain of the void
 * colour drops, and the five destinations rise out of their own masks in
 * display type, numbered, with the contact details beneath. Escape closes
 * it, the page cannot scroll behind it, and under reduced motion it is a
 * plain instant panel.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<"light" | "dark">("light");
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 400 && y > prev && !open);
    setScrolled(y > 60);
  });

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

  // Which section owns the viewport, for the sliding nav marker.
  useEffect(() => {
    const ids = navItems.map((n) => n.href.replace("/#", "").replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  // The page must never scroll behind the menu, and Escape must close it.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
    <>
      <motion.header
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={
          reduced ? { duration: 0 } : { duration: 0.5, ease: EASE }
        }
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled && !open ? "glass" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6 sm:px-10">
          <Link
            href="/#hero"
            aria-label={`${site.name} — home`}
            onClick={() => setOpen(false)}
            className={`script relative z-50 text-2xl leading-none transition-colors duration-300 ${
              open ? "text-text-primary" : ink
            }`}
          >
            {site.shortName.toLowerCase()}
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => {
                const id = item.href.replace("/#", "").replace("#", "");
                const current = active === id;
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      className={`meta transition-colors duration-300 hover:text-primary ${
                        current ? "text-primary" : inkMuted
                      }`}
                    >
                      {item.label}
                    </Link>
                    {current && (
                      <motion.span
                        layoutId="nav-marker"
                        transition={{ duration: 0.45, ease: EASE }}
                        className="absolute -bottom-1.5 left-0 right-0 h-px bg-primary"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="site-menu"
            className={`meta relative z-50 flex items-center gap-3 transition-colors duration-300 hover:text-primary ${
              open ? "text-text-primary" : ink
            }`}
          >
            {open ? "Close" : "Menu"}
            <span className="relative block h-2.5 w-6" aria-hidden="true">
              <motion.span
                animate={open ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute left-0 top-0 block h-px w-6 bg-current"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute bottom-0 left-0 block h-px w-6 bg-current"
              />
            </span>
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-menu"
            aria-label="Primary"
            initial={reduced ? { opacity: 0 } : { y: "-100%" }}
            animate={reduced ? { opacity: 1 } : { y: "0%" }}
            exit={reduced ? { opacity: 0 } : { y: "-100%" }}
            transition={
              reduced ? { duration: 0.15 } : { duration: 0.7, ease: CURTAIN }
            }
            className="fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto bg-void px-6 pb-10 pt-28 sm:px-10"
          >
            <ul>
              {navItems.map((item, i) => (
                <li
                  key={item.href}
                  className="overflow-hidden border-b border-line"
                >
                  <motion.div
                    initial={reduced ? undefined : { y: "110%" }}
                    animate={reduced ? undefined : { y: "0%" }}
                    transition={{
                      duration: 0.7,
                      delay: 0.25 + i * 0.06,
                      ease: EASE,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-5 py-4 sm:gap-8 sm:py-5"
                    >
                      <span className="meta text-text-muted transition-colors duration-300 group-hover:text-primary">
                        0{i + 1}
                      </span>
                      <span className="text-display text-[clamp(2.2rem,7vw,4.5rem)] text-text-primary transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-primary sm:group-hover:translate-x-4">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>

            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: 18 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              className="mt-12 flex flex-wrap items-center justify-between gap-x-10 gap-y-6"
            >
              <a
                href={`mailto:${site.email}`}
                className="group inline-flex items-center gap-3 text-lg text-text-secondary transition-colors duration-300 hover:text-primary"
              >
                {site.email}
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>

              <div className="flex items-center gap-7">
                <a
                  href={site.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-text-secondary transition-colors duration-300 hover:text-primary"
                >
                  <GithubIcon size={14} />
                  GitHub
                </a>
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-text-secondary transition-colors duration-300 hover:text-primary"
                >
                  <LinkedinIcon size={14} />
                  LinkedIn
                </a>
                <span className="meta text-text-muted">{site.location}</span>
              </div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
