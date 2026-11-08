import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "./BrandIcons";
import Logo from "./Logo";
import type { SiteSettingsRow } from "@/types/database";

const EXPLORE = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/#about" },
  { label: "What I do", href: "/#what-i-do" },
  { label: "Toolbox", href: "/#toolbox" },
  { label: "Journey", href: "/#journey" },
  { label: "Contact", href: "/#contact" },
] as const;

export default function Footer({ settings }: { settings: SiteSettingsRow }) {
  const [first = "ALPHA", last = "MUGISHA"] = settings.name.toUpperCase().split(" ");

  const contact = [
    { label: "Email", href: `mailto:${settings.email}`, external: true },
    ...(settings.github_url ? [{ label: "GitHub", href: settings.github_url, external: true }] : []),
    ...(settings.linkedin_url ? [{ label: "LinkedIn", href: settings.linkedin_url, external: true }] : []),
    ...(settings.cv_path ? [{ label: "Download CV", href: settings.cv_path, external: false }] : []),
  ];

  return (
    <footer className="relative z-[2] overflow-hidden border-t border-rule bg-ink text-text-muted">
      <div className="relative mx-auto max-w-7xl px-6 pt-24">
        <div className="grid gap-12 border-b border-rule pb-20 md:grid-cols-12">
          <div className="space-y-7 md:col-span-5">
            <Logo
              name={settings.name}
              size={38}
              textClassName="font-display text-2xl font-semibold tracking-tight text-text"
            />
            <p className="max-w-sm text-lg leading-relaxed text-text-muted">
              {settings.tagline} Building web platforms, embedded electronics and
              applied AI from {settings.location}.
            </p>

            <a href={`mailto:${settings.email}`} className="btn btn-signal group">
              Say hello
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>

            <div className="flex gap-3 pt-2">
              {[
                ...(settings.github_url
                  ? [{ href: settings.github_url, label: "GitHub", icon: <GithubIcon size={18} /> }]
                  : []),
                ...(settings.linkedin_url
                  ? [{ href: settings.linkedin_url, label: "LinkedIn", icon: <LinkedinIcon size={18} /> }]
                  : []),
                { href: `mailto:${settings.email}`, label: "Email", icon: <Mail size={18} /> },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center border border-rule transition-colors hover:border-signal hover:text-signal"
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
                    <Link href={l.href} className="text-text-muted transition-colors hover:text-text">
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
                      className="group inline-flex items-center gap-1.5 text-text-muted transition-colors hover:text-text"
                    >
                      {l.label}
                      {l.external ? (
                        <ArrowUpRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="eyebrow mb-6">Currently</h2>
              <p className="text-[15px] leading-relaxed text-text-muted">{settings.availability}</p>
              <p className="mt-4 inline-flex items-center gap-2 text-[15px] text-text-muted">
                <MapPin size={14} className="text-signal" />
                {settings.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 py-8 font-mono text-xs text-text-subtle md:flex-row">
          <p>
            © {new Date().getFullYear()} {settings.name}. Built with Next.js.
          </p>
          <p>Designed &amp; built in Rwanda</p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pointer-events-none select-none px-6 text-center font-display text-[17vw] font-bold leading-[0.8] tracking-tighter text-white/[0.04]"
      >
        <span className="block">{first}</span>
        <span className="block">{last}</span>
      </p>
    </footer>
  );
}
