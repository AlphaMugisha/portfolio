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
} as const;

export const navItems = [
  { label: "About", href: "/#about" },
  { label: "Skills", href: "/#skills" },
  { label: "Projects", href: "/#projects" },
  { label: "Journey", href: "/#journey" },
  { label: "Contact", href: "/#contact" },
] as const;
