"use client";

import { ArrowUpRight, Download } from "lucide-react";
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
        wash="right"
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

            {/* The email is the one control that matters on this page, so it
                is a filled button at the size of a heading rather than an
                address sitting in an outlined box. Everything secondary sits
                under it as a row, which is also what fills the dead half-
                screen this column used to end on. */}
            <Reveal delay={0.08}>
              <Magnetic pull={10} contentPull={5} radius={130} className="mt-9 inline-block">
                <a
                  href={`mailto:${site.email}`}
                  className="btn-depth group inline-flex flex-wrap items-center gap-4 rounded-card bg-primary px-7 py-5 text-on-primary"
                >
                  <span className="font-geometric text-[clamp(1.1rem,2.4vw,1.6rem)] font-medium">
                    {site.email}
                  </span>
                  <ArrowUpRight
                    size={22}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </a>
              </Magnetic>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={site.cv}
                  download
                  className="btn-depth inline-flex items-center gap-2.5 rounded-pill border border-line-strong bg-surface px-5 py-3 font-geometric text-[0.9rem] font-medium text-text-primary transition-colors hover:border-primary hover:text-primary-strong"
                >
                  <Download size={16} aria-hidden="true" />
                  Download CV
                </a>

                {social.map((sn) => {
                  const Icon = sn.icon;
                  return (
                    <a
                      key={sn.label}
                      href={sn.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-depth group inline-flex items-center gap-2.5 rounded-pill border border-line-strong bg-surface px-5 py-3 font-geometric text-[0.9rem] font-medium text-text-primary transition-colors hover:border-primary hover:text-primary-strong"
                    >
                      <Icon size={16} />
                      {sn.label}
                      <ArrowUpRight
                        size={14}
                        aria-hidden="true"
                        className="text-text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>
                  );
                })}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.18}>
            <dl className="space-y-4">
              <TiltCard tilt={0} glow={190}>
                <div className="plate lift px-5 py-4">
                  <dt className="meta text-primary-strong">Location</dt>
                  <dd className="mt-2 text-text-primary">{site.location}</dd>
                </div>
              </TiltCard>

              <TiltCard tilt={0} glow={190}>
                <div className="plate lift px-5 py-4">
                  <dt className="meta text-primary-strong">Availability</dt>
                  <dd className="mt-2 flex items-center gap-2.5 text-text-primary">
                    <span className="relative grid h-2 w-2 place-items-center">
                      <span className="absolute h-2 w-2 animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
                      <span className="relative h-2 w-2 rounded-full bg-primary" />
                    </span>
                    Open to new work
                  </dd>
                </div>
              </TiltCard>

              <TiltCard tilt={0} glow={190}>
                <div className="plate lift px-5 py-4">
                  <dt className="meta text-primary-strong">Based around</dt>
                  <dd className="mt-2 text-text-primary">
                    Web platforms · Embedded · Applied AI
                  </dd>
                </div>
              </TiltCard>
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
