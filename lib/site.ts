/**
 * Single source of truth for identity + links.
 * Anything unverified is marked with `PLACEHOLDER` so it is easy to grep.
 */

export const site = {
  name: "Alpha Mugisha",
  shortName: "Alpha",
  role: "Software Engineer",
  location: "Kigali, Rwanda",
  email: "tigerkev07@gmail.com",
  github: "https://github.com/AlphaMugisha",
  /**
   * `null` until a real value exists, NOT a placeholder string.
   *
   * These used to hold `https://www.linkedin.com/in/` and
   * `/alpha-mugisha-cv.pdf`. Both shipped as live links on the deployed
   * site: the first went to a bare LinkedIn route, the second returned a
   * hard 404 because no such file has ever been committed. Every
   * consumer already renders these conditionally, so `null` removes the
   * link from the contact section, the footer and the menu at once.
   *
   * To enable them: paste the real profile URL here, and for the CV drop
   * the file at `public/alpha-mugisha-cv.pdf` and set `cv` to that path.
   */
  linkedin: null as string | null,
  tagline: "I'm still learning — but I'm already building.",
  description:
    "Alpha Mugisha — a software and systems builder from Kigali, Rwanda, working across web platforms, embedded electronics and applied AI.",
  // The live deployment. Canonical and OpenGraph URLs resolve from this,
  // so it has to be where the site actually answers.
  url: "https://alphamugisha.vercel.app",
  cv: null as string | null,
} as const;

/* The three disciplines, in the order the site argues them: the physical
   edge, the system built on it, and the intelligence layered over that.
   Brand copy rather than editable content, so it lives here and not in
   the `site_settings` table. */
export const disciplines = [
  "Software Engineer",
  "Full-stack Developer",
  "Embedded Systems Builder",
] as const;

/* The page is one scroll, so every nav item is an in-page anchor. The ids
   live on the sections rendered from `app/page.tsx`. */
export const navItems = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "What I do", href: "/#what-i-do" },
  { label: "Toolbox", href: "/#toolbox" },
  { label: "Journey", href: "/#journey" },
  { label: "Contact", href: "/#contact" },
] as const;
