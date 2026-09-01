"use client";

import { Mail, ArrowUpRight, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { Reveal, TextReveal } from "@/components/ui/motion-primitives";
import SectionHeading from "@/components/ui/SectionHeading";
import { site, navItems } from "@/lib/site";

const social = [
  { label: "GitHub", href: site.github, icon: GithubIcon },
  { label: "LinkedIn", href: site.linkedin, icon: LinkedinIcon },
];

/** Contact section, followed by a conventional site footer. */
export default function Contact() {
  return (
    <>
      <section
        id="contact"
        className="relative scroll-mt-32 overflow-hidden px-6 py-28 sm:px-10 sm:py-36"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 band"
        />

        <div className="mx-auto max-w-7xl">
          <SectionHeading eyebrow="Contact" title="Get in touch" />

          <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-24">
            <div>
              <TextReveal
                as="h3"
                className="text-display text-[clamp(1.75rem,4vw,3rem)] text-text-primary"
                lines={["Have a project", "in mind?"]}
              />

              <Reveal delay={0.1}>
                <p className="mt-7 max-w-lg text-pretty leading-relaxed text-text-secondary">
                  I am open to freelance work, full-time roles and collaboration —
                  particularly on systems that serve organisations and communities
                  in Rwanda and the wider region.
                </p>
              </Reveal>

              <Reveal delay={0.16}>
                <a
                  href={`mailto:${site.email}`}
                  className="group mt-10 inline-flex flex-wrap items-center gap-4 border-b border-line-strong pb-3 transition-colors duration-400 hover:border-primary"
                >
                  <Mail
                    size={17}
                    className="text-primary transition-transform duration-400 group-hover:-translate-y-0.5"
                  />
                  <span className="text-display text-lg text-text-primary sm:text-2xl">
                    {site.email}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="text-text-muted transition-all duration-400 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary"
                  />
                </a>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <dl className="space-y-8">
                <div>
                  <dt className="font-sans text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    Location
                  </dt>
                  <dd className="mt-2 flex items-center gap-2.5 text-text-primary">
                    <MapPin size={15} className="text-primary" />
                    {site.location}
                  </dd>
                </div>

                <div>
                  <dt className="font-sans text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    Availability
                  </dt>
                  <dd className="mt-2 flex items-center gap-2.5 text-text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Open to new work
                  </dd>
                </div>

                <div>
                  <dt className="font-sans text-[10px] uppercase tracking-[0.18em] text-text-muted">
                    Elsewhere
                  </dt>
                  <dd className="mt-3">
                    {social.map((s) => {
                      const Icon = s.icon;
                      return (
                        <a
                          key={s.label}
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between border-b border-line py-3.5 transition-colors duration-400 hover:border-primary"
                        >
                          <span className="flex items-center gap-3">
                            <Icon
                              size={14}
                              className="text-text-muted transition-colors duration-400 group-hover:text-primary"
                            />
                            <span className="text-sm text-text-secondary transition-colors duration-400 group-hover:text-text-primary">
                              {s.label}
                            </span>
                          </span>
                          <ArrowUpRight
                            size={14}
                            className="text-text-muted transition-all duration-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                          />
                        </a>
                      );
                    })}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="relative border-t border-line px-6 py-14 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div>
              <p className="text-display text-xl text-text-primary">{site.name}</p>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-text-muted">
                {site.role} · {site.location}
              </p>
            </div>

            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-sm text-text-secondary transition-colors duration-300 hover:text-text-primary"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-text-muted">
              © {new Date().getFullYear()} {site.name}
            </p>
            <p className="font-sans text-[10px] uppercase tracking-[0.16em] text-text-muted">
              Designed &amp; built in Rwanda
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
