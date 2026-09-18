"use client";

import { ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/motion-primitives";
import Marquee from "@/components/ui/Marquee";
import Magnetic from "@/components/ui/Magnetic";
import TiltCard from "@/components/ui/TiltCard";
import { site, navItems } from "@/lib/site";
import Section, { MEASURE } from "@/components/ui/Section";

const social = [
  { label: "GitHub", href: site.github, icon: GithubIcon },
  { label: "LinkedIn", href: site.linkedin, icon: LinkedinIcon },
];

/**
 * Contact + footer. The page closes the way it opened: one big word building
 * itself letter by letter. The email address is the one control that
 * matters, so it is the biggest thing here.
 */
export default function Contact() {
  return (
    <>
      <Section
        id="contact"
        eyebrow="Contact"
        title="Let's build"
        accent="something."
        description="Open to freelance work, full-time roles and collaboration."
        className="bg-ink"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <Reveal>
              <p className="max-w-xl text-pretty text-lg leading-relaxed text-text-secondary">
                I am open to freelance work, full-time roles and collaboration
                — particularly on systems that serve organisations and
                communities in Rwanda and the wider region.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <Magnetic pull={9} contentPull={5} radius={110} className="mt-9 inline-block">
                <a
                  href={`mailto:${site.email}`}
                  className="plate lift group inline-flex flex-wrap items-center gap-4 px-6 py-4"
                >
                  <span className="text-editorial text-[clamp(1.1rem,2.6vw,1.8rem)] font-medium text-text-primary transition-colors group-hover:text-primary-strong">
                    {site.email}
                  </span>
                  <ArrowUpRight
                    size={20}
                    aria-hidden="true"
                    className="text-text-muted transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                  />
                </a>
              </Magnetic>
            </Reveal>
          </div>

          <Reveal delay={0.14}>
            <dl className="space-y-4">
              <TiltCard tilt={0} glow={190}>
                <div className="plate lift px-5 py-4">
                  <dt className="meta text-text-muted">Location</dt>
                  <dd className="mt-2.5 text-text-primary">{site.location}</dd>
                </div>
              </TiltCard>

              <TiltCard tilt={0} glow={190}>
                <div className="plate lift px-5 py-4">
                  <dt className="meta text-text-muted">Availability</dt>
                  <dd className="mt-2.5 flex items-center gap-2.5 text-text-primary">
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                    />
                    Open to new work
                  </dd>
                </div>
              </TiltCard>

              <div>
                <dt className="meta mb-3 text-text-muted">Elsewhere</dt>
                <dd className="space-y-3">
                  {social.map((s) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="plate lift group flex items-center justify-between px-5 py-3.5"
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            size={14}
                            className="text-text-muted transition-colors group-hover:text-primary"
                          />
                          <span className="text-sm text-text-secondary transition-colors group-hover:text-text-primary">
                            {s.label}
                          </span>
                        </span>
                        <ArrowUpRight
                          size={14}
                          aria-hidden="true"
                          className="text-text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                        />
                      </a>
                    );
                  })}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Section>

      <footer data-band="dark" className="bg-ink">
        <Marquee
          items={[
            "Available for work",
            site.location,
            "Web platforms",
            "Embedded systems",
            "Applied AI",
          ]}
          duration={40}
          className="border-y border-line py-4"
          itemClassName="meta text-primary"
        />

        <div className={`${MEASURE} py-14`}>
          <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div>
              <p className="script text-3xl leading-none text-text-primary">
                {site.shortName.toLowerCase()}
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">
                {site.role} · {site.location}
              </p>
            </div>

            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="meta inline-block text-text-secondary transition-[color,transform] duration-300 hover:-translate-y-0.5 hover:text-primary"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="meta text-text-muted">
              © {new Date().getFullYear()} {site.name}
            </p>
            <p className="meta text-text-muted">Designed &amp; built in Rwanda</p>
          </div>
        </div>
      </footer>
    </>
  );
}
