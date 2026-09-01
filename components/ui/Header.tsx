"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { MapPin, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { navItems, site } from "@/lib/site";

/**
 * Site header.
 *
 * Two tiers, the conventional institutional masthead:
 *
 *   - a slim utility strip carrying location, email and social links, and
 *   - the main bar with the wordmark, navigation and primary action.
 *
 * On scroll the utility strip collapses away and the main bar tightens into a
 * solid, blurred bar — so the header is substantial when you arrive and
 * compact once you are reading. It also hides on downward scroll and returns
 * on upward scroll, which keeps long sections uninterrupted without ever
 * putting the navigation out of reach.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 30);
    setHidden(y > 320 && y > prev && !open);
  });

  // Track which section owns the viewport, for the active nav state.
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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-100 focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-widest focus:text-on-primary"
      >
        Skip to content
      </a>

      <motion.header
        initial={{ y: -120 }}
        animate={{ y: hidden ? -140 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled
            ? "border-b border-line bg-ink/85 backdrop-blur-xl"
            : "border-b border-line/60"
        }`}
      >
        {/* ---- Tier 1: utility strip ---- */}
        <motion.div
          initial={false}
          animate={{
            height: scrolled ? 0 : 38,
            opacity: scrolled ? 0 : 1,
          }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-b border-line/60"
        >
          <div className="mx-auto flex h-[38px] max-w-7xl items-center justify-between px-6 sm:px-10">
            <div className="flex items-center gap-6 text-[11px] text-text-muted">
              <span className="flex items-center gap-2">
                <MapPin size={11} className="text-primary" />
                {site.location}
              </span>
              <a
                href={`mailto:${site.email}`}
                className="hidden items-center gap-2 transition-colors duration-300 hover:text-text-primary sm:flex"
              >
                <Mail size={11} className="text-primary" />
                {site.email}
              </a>
            </div>

            <div className="flex items-center gap-5">
              <span className="hidden items-center gap-2 text-[11px] text-text-muted md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Open to new work
              </span>
              <div className="flex items-center gap-3.5">
                <a
                  href={site.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="text-text-muted transition-colors duration-300 hover:text-primary"
                >
                  <GithubIcon size={13} />
                </a>
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-text-muted transition-colors duration-300 hover:text-primary"
                >
                  <LinkedinIcon size={13} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ---- Tier 2: main bar ---- */}
        <motion.nav
          initial={false}
          animate={{ height: scrolled ? 62 : 74 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-10"
        >
          {/* Wordmark */}
          <Link href="/" className="group flex items-center gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-primary/50 text-[13px] font-semibold tracking-tight text-primary transition-colors duration-400 group-hover:bg-primary group-hover:text-on-primary">
              AM
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-display text-[15px] text-text-primary">
                {site.name}
              </span>
              <span className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-text-muted">
                {site.role}
              </span>
            </span>
          </Link>

          {/* Links */}
          <ul className="hidden items-center gap-9 lg:flex">
            {navItems.map((item) => {
              const id = item.href.replace("/#", "").replace("#", "");
              const isActive = active === id;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group relative block py-1.5 text-[13.5px] tracking-wide"
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        isActive
                          ? "text-primary"
                          : "text-text-secondary group-hover:text-text-primary"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-primary transition-transform duration-400 ease-out ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-4">
            <Link
              href="/#contact"
              className="group relative hidden overflow-hidden rounded-full border border-primary/60 px-6 py-2.5 text-[13px] text-primary sm:block"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-primary transition-transform duration-400 ease-out group-hover:scale-y-100" />
              <span className="relative transition-colors duration-400 group-hover:text-on-primary">
                Hire me
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="relative z-60 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
            >
              <motion.span
                animate={open ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="block h-px w-6 bg-text-primary"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="block h-px w-6 bg-text-primary"
              />
            </button>
          </div>
        </motion.nav>
      </motion.header>

      {/* ---- Mobile menu ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-50 bg-ink lg:hidden"
          >
            <div className="flex h-full flex-col justify-center px-8">
              <ul>
                {navItems.map((item, i) => (
                  <li key={item.href} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "100%" }}
                      animate={{ y: "0%" }}
                      transition={{
                        delay: 0.22 + i * 0.06,
                        duration: 0.7,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-baseline gap-5 border-b border-line py-5"
                      >
                        <span className="text-[10px] font-semibold text-primary">
                          0{i + 1}
                        </span>
                        <span className="text-display text-3xl text-text-primary">
                          {item.label}
                        </span>
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.62, duration: 0.6 }}
                className="mt-12 space-y-3"
              >
                <a
                  href={`mailto:${site.email}`}
                  className="block text-sm text-text-secondary"
                >
                  {site.email}
                </a>
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                  {site.location}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
