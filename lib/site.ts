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
  // PLACEHOLDER — replace with your real LinkedIn URL.
  linkedin: "https://www.linkedin.com/in/",
  tagline: "I'm still learning — but I'm already building.",
  description:
    "Alpha Mugisha — a software and systems builder from Kigali, Rwanda, working across web platforms, embedded electronics and applied AI.",
  url: "https://alphamugisha.dev", // PLACEHOLDER — update once deployed.
  // PLACEHOLDER — the rail links here. Drop the real file at
  // `public/alpha-mugisha-cv.pdf` and the Download CV button works as-is.
  cv: "/alpha-mugisha-cv.pdf",
} as const;

/* The page is one scroll, so every nav item is an in-page anchor. The ids
   live on the sections in `components/sections/HomeSections.tsx`. */
export const navItems = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "Toolbox", href: "/#toolbox" },
  { label: "Journey", href: "/#journey" },
] as const;
