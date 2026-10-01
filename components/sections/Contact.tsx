"use client";

import { ArrowUpRight, Download } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/motion-primitives";
import Marquee from "@/components/ui/Marquee";
import Magnetic from "@/components/ui/Magnetic";
import { site, navItems } from "@/lib/site";
import Section, { MEASURE } from "@/components/ui/Section";

const social = [
  { label: "GitHub", href: site.github, icon: GithubIcon },
  { label: "LinkedIn", href: site.linkedin, icon: LinkedinIcon },
];

/**
 * Contact + footer. The page closes the way it opened: a serif heading with
 * an italic clause, and one control that matters more than everything around
 * it. The email address is set at heading scale inside a filled block, so
 * the eye lands on it before it reads a word of the paragraph above.
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
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
          <div>
            <Reveal>
              <p className="max-w-[46ch] text-pretty text-text-secondary">
                I am open to freelance work, full-time roles and collaboration
                — particularly on systems that serve organisations and
                communities in Rwanda and the wider region.
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <Magnetic pull={8} contentPull={4} radius={130} className="mt-10 inline-block">
                <a
                  href={`mailto:${site.email}`}
                  className="btn-depth group inline-flex flex-wrap items-center gap-5 rounded-card bg-primary px-8 py-6 text-on-primary hover:bg-primary-strong"
                >
                  <span className="font-geometric text-[clamp(1.05rem,2.2vw,1.6rem)] font-light tracking-[0.04em]">
                    {site.email}
                  </span>
                  <ArrowUpRight
                    size={22}
                    aria-hidden="true"
                    className="transition-transform duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </a>
              </Magnetic>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={site.cv}
                  download
                  className="btn-depth label-ui inline-flex items-center gap-3 rounded-pill border border-line-strong bg-surface px-6 py-4 text-text-primary hover:border-text-primary hover:text-text-primary"
                >
                  <Download size={15} aria-hidden="true" />
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
                      className="btn-depth label-ui group inline-flex items-center gap-3 rounded-pill border border-line-strong bg-surface px-6 py-4 text-text-primary hover:border-text-primary hover:text-text-primary"
                    >
                      <Icon size={15} />
                      {sn.label}
                      <ArrowUpRight
                        size={14}
                        aria-hidden="true"
                        className="text-text-muted transition-transform duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>
                  );
                })}
              </div>
            </Reveal>
          </div>

          {/* The three facts as a spec table on hairlines, matching About.
              They were three separate plates, which made a short list of
              details read as three competing cards. */}
          <Reveal delay={0.18}>
            <dl className="border-t border-line">
              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-line py-6">
                <dt className="meta text-text-primary">Location</dt>
                <dd className="text-editorial text-xl text-text-primary">
                  {site.location}
                </dd>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-line py-6">
                <dt className="meta text-text-primary">Availability</dt>
                <dd className="text-editorial flex items-center gap-3 text-xl text-text-primary">
                  <span className="relative grid h-1.5 w-1.5 place-items-center">
                    <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  Open to new work
                </dd>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-line py-6">
                <dt className="meta text-text-primary">Based around</dt>
                <dd className="text-editorial text-right text-xl text-text-primary">
                  Web platforms · Embedded · Applied AI
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </Section>

      <footer data-band="dark" className="bg-bg-invert">
        <Marquee
          items={[
            "Available for work",
            site.location,
            "Web platforms",
            "Embedded systems",
            "Applied AI",
          ]}
          duration={52}
          className="border-y border-line py-5"
          itemClassName="meta text-accent"
        />

        <div className={`${MEASURE} py-20`}>
          <div className="grid gap-12 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div>
              <p className="script text-4xl leading-none text-text-primary">
                {site.shortName.toLowerCase()}
              </p>
              <p className="meta mt-5 text-text-muted">
                {site.role} · {site.location}
              </p>
            </div>

            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-10 gap-y-3">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="meta link-rule inline-block text-text-secondary transition-colors duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-primary"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-16 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
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
