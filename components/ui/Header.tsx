"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import Magnetic from "@/components/ui/Magnetic";
import { navItems, site } from "@/lib/site";

/**
 * Site header.
 *
 * Stripped back to the reference's arrangement: a script wordmark hard left,
 * the navigation set small and centred, and a menu control right. No bar, no
 * fill, no shadow — it floats over whichever band is beneath it.
 *
 * Because it floats, its ink has to follow the page. Every section declares
 * `data-band="light"` or `data-band="dark"`, and a one-pixel observation strip
 * at the header's own height reports which one currently sits under it. That
 * is what keeps the wordmark legible when the page crosses from the opening
 * band into the dark run and back again for the case-study cards.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<"light" | "dark">("light");
  const [hidden, setHidden] = useState(false);
  // Once the reader has left the top, the centred nav condenses into a glass
  // plate — the header stops being ink printed on the page and becomes an
  // object floating in front of it.
  const [afloat, setAfloat] = useState(false);
  const [active, setActive] = useState("");
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  /* The float: the bar carries a little inertia against scroll velocity, so
     it reads as a physical object suspended in the scene rather than pixels
     nailed to the viewport. Springed, clamped to a few px, and disabled under
     reduced motion. */
  const vel = useVelocity(scrollY);
  const floatY = useSpring(useTransform(vel, [-1600, 1600], [7, -7]), {
    stiffness: 130,
    damping: 15,
    mass: 0.5,
  });

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 400 && y > prev && !open);
    setAfloat(y > 140);
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
              (e.target as HTMLElement).dataset.band === "light" ? "light" : "dark"
            );
          }
        }
      },
      // A thin strip level with the header, so "under the header" is literal.
      { rootMargin: "-38px 0px -100% 0px", threshold: 0 }
    );

    for (const el of bands) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Which section owns the viewport, for the active nav state.
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

  // A full-screen overlay with no visible way out other than one button needs
  // Escape to work, or keyboard users are trapped behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // While the overlay is up the header always sits on ink.
  const onLight = tone === "light" && !open;
  const ink = onLight ? "text-on-band" : "text-text-primary";

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-100 focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-widest focus:text-on-primary"
      >
        Skip to content
      </a>

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: hidden ? -120 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        /* Above the overlay while it is open. The overlay is a later sibling
           at the same z-index, so it painted over the close control and left
           the menu with no visible way out but Escape — a trap. z-60 on the
           button alone could not fix it: it cannot escape the header's own
           stacking context. */
        className={`fixed inset-x-0 top-0 ${open ? "z-60" : "z-50"}`}
      >
        <motion.div
          style={{ y: reduced ? 0 : floatY }}
          className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between px-6 sm:px-10"
        >
          {/* Wordmark. Hidden while the overlay is up — the reel's menu is a
              bare field, and leaving the mark and the small nav on top of it
              would print the same five words twice on one screen. */}
          <Link
            href="/"
            aria-hidden={open || undefined}
            tabIndex={open ? -1 : undefined}
            className={`script text-2xl leading-none transition-opacity duration-300 sm:text-[1.7rem] ${ink} ${
              open ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            {site.shortName.toLowerCase()}
          </Link>

          {/* Navigation — centred, absolutely placed so the wordmark and the
              menu control cannot push it off centre. */}
          <nav
            aria-label="Primary"
            aria-hidden={open || undefined}
            className={`absolute left-1/2 hidden -translate-x-1/2 transition-opacity duration-300 lg:block ${
              open ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            {/* Bare type at the top of the page; a floating glass plate once
                scrolled. The border is present in both states so the plate
                condenses around the links without shifting them. */}
            <ul
              className={`flex items-center gap-10 border transition-all duration-700 ${
                afloat
                  ? "glass elevate rounded-full px-7 py-2.5"
                  : "border-transparent px-0 py-0"
              }`}
            >
              {navItems.map((item) => {
                const id = item.href.replace("/#", "").replace("#", "");
                const isActive = active === id;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      tabIndex={open ? -1 : undefined}
                      className={`group relative block meta transition-[color,transform] duration-500 hover:-translate-y-0.5 ${
                        isActive ? "text-primary" : ink
                      }`}
                    >
                      {item.label}
                      <span
                        className={`absolute -bottom-1.5 left-0 h-px w-full origin-left bg-current transition-transform duration-500 ease-out ${
                          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Menu control — magnetic, so approaching it feels like entering
              its field rather than hunting a hotspot. */}
          <Magnetic pull={7} contentPull={4} radius={70}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`relative flex items-center gap-3 transition-colors duration-500 ${ink}`}
          >
            <span
              className={`meta hidden transition-opacity duration-200 sm:block ${
                open ? "opacity-0" : "opacity-100"
              }`}
            >
              Menu
            </span>
            <span className="flex h-6 w-7 flex-col items-end justify-center gap-[6px]">
              <motion.span
                animate={open ? { rotate: 45, y: 3.5, width: 28 } : { rotate: 0, y: 0, width: 28 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="block h-px bg-current"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -3.5, width: 28 } : { rotate: 0, y: 0, width: 18 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="block h-px bg-current"
              />
            </span>
          </button>
          </Magnetic>
        </motion.div>
      </motion.header>

      {/* ---- Full-screen menu ----

          Measured off the reel rather than designed: the overlay is a flat
          #141518 field that FADES in over ~0.27s, and the five links move as
          one block — down from about -24px with a slight scale-down — rather
          than each sliding up out of its own mask on a stagger. The stagger
          was the instinctive choice and it is simply not what the reference
          does; its whole open is shorter than one staggered item here was.

          The stack is a narrow centred column: the widest word occupies about
          a fifth of the viewport, cap height is 4.6% of viewport height, and
          the baseline pitch is 2.67 cap-heights. Small and airy, not a slab.
      */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-ink"
          >
            <nav
              aria-label="Menu"
              className="flex h-full items-center justify-center px-6"
            >
              <motion.ul
                initial={{ y: -24, scale: 1.06, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
              >
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="menu-link block text-center text-[clamp(1.75rem,3.9vw,3.6rem)] text-text-primary transition-colors duration-300 hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </motion.ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
