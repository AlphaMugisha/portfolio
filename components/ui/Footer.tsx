import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./BrandIcons";
import Logo from "./Logo";
import { site } from "@/lib/site";

const EXPLORE = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "What I do", href: "/#what-i-do" },
  { label: "Toolbox", href: "/#toolbox" },
  { label: "Journey", href: "/#journey" },
  { label: "Contact", href: "/#contact" },
] as const;

export default function Footer() {
  const [first = "ALPHA", last = "MUGISHA"] = site.name.toUpperCase().split(" ");

  const contact = [
    { label: "Email", href: `mailto:${site.email}`, external: true },
    { label: "GitHub", href: site.github, external: true },
    { label: "LinkedIn", href: site.linkedin, external: true },
    { label: "Download CV", href: site.cv, external: false },
  ];

  return (
    <footer className="relative z-[2] overflow-hidden border-t border-black/10 bg-canvas text-ink-muted dark:border-white/10 dark:bg-canvas-dark dark:text-ink-invert-muted">
      <div className="relative mx-auto max-w-7xl px-6 pt-24">
        <div className="grid gap-12 border-b border-black/10 pb-20 md:grid-cols-12 dark:border-white/10">
          <div className="space-y-7 md:col-span-5">
            <Logo
              size={40}
              textClassName="font-display text-2xl font-semibold tracking-tight text-ink dark:text-ink-invert"
            />
            <p className="max-w-sm text-lg leading-relaxed text-ink-subtle dark:text-ink-invert-muted">
              {site.tagline} Building web platforms, embedded electronics and applied
              AI from {site.location}.
            </p>

            <a href={`mailto:${site.email}`} className="btn-accent group py-4 pl-7 pr-5">
              Say hello
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-ink text-accent transition-transform group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </a>

            <div className="flex gap-4 pt-2">
              {[
                { href: site.github, label: "GitHub", icon: <GithubIcon size={18} /> },
                { href: site.linkedin, label: "LinkedIn", icon: <LinkedinIcon size={18} /> },
                { href: `mailto:${site.email}`, label: "Email", icon: <Mail size={18} /> },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 transition-colors hover:border-accent hover:text-accent dark:border-white/10"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:col-span-7 sm:grid-cols-3">
            <div>
              <h2 className="eyebrow mb-6">Explore</h2>
              <ul className="space-y-4 text-[15px]">
                {EXPLORE.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-ink-subtle transition-colors hover:text-ink dark:text-ink-invert-muted dark:hover:text-ink-invert"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="eyebrow mb-6">Contact</h2>
              <ul className="space-y-4 text-[15px]">
                {contact.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.external && !l.href.startsWith("mailto:") ? "_blank" : undefined}
                      rel={l.external ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-center gap-1.5 text-ink-subtle transition-colors hover:text-ink dark:text-ink-invert-muted dark:hover:text-ink-invert"
                    >
                      {l.label}
                      {l.external ? (
                        <ArrowUpRight
                          size={13}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="eyebrow mb-6">Currently</h2>
              <p className="text-[15px] leading-relaxed text-ink-subtle dark:text-ink-invert-muted">
                Open to new work — freelance, full-time or collaboration.
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-[15px] text-ink-subtle dark:text-ink-invert-muted">
                <MapPin size={14} className="text-accent" />
                {site.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 py-8 text-xs text-ink-subtle md:flex-row dark:text-ink-invert-subtle">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. Built with Next.js.
          </p>
          <p>Designed &amp; built in Rwanda</p>
        </div>
      </div>

      {/* The wordmark, set enormous and clipped by the viewport edge. It is
          decoration, not a heading — so it is aria-hidden and the name is
          already announced by the logo above. */}
      <p
        aria-hidden="true"
        className="pointer-events-none select-none px-6 text-center font-display text-[17vw] font-bold leading-[0.8] tracking-tighter text-black/[0.055] dark:text-white/[0.05]"
      >
        <span className="block">{first}</span>
        <span className="block">{last}</span>
      </p>
    </footer>
  );
}
