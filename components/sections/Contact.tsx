"use client";

import { ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/motion-primitives";
import LiquidText from "@/components/ui/LiquidText";
import SplitText from "@/components/ui/SplitText";
import Marquee from "@/components/ui/Marquee";
import { site, navItems } from "@/lib/site";

const social = [
  { label: "GitHub", href: site.github, icon: GithubIcon },
  { label: "LinkedIn", href: site.linkedin, icon: LinkedinIcon },
];

/**
 * Contact, then the footer.
 *
 * The page closes the way it opened — one word at full size, liquefying under
 * the pointer — so the composition brackets itself. Everything a visitor
 * might actually need is directly beneath it in plain text, because a closing
 * flourish that buries the email address has failed at its only job.
 */
export default function Contact() {
  return (
    <>
      <section
        id="contact"
        data-band="dark"
        className="relative scroll-mt-24 overflow-hidden bg-ink px-6 pb-20 pt-24 sm:px-10 sm:pb-24 sm:pt-32"
      >
        <div className="mx-auto max-w-[1600px]">
          <Reveal>
            <p className="meta flex items-center gap-3 text-text-muted">
              <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
              04 — What happens next
            </p>
          </Reveal>

          <div style={{ transform: "scaleY(1.14)" }} className="mt-10 origin-center">
            <LiquidText className="select-none">
              <SplitText
                as="h2"
                data-liquid-target
                text="Let's talk"
                trigger="view"
                stagger={0.04}
                className="text-mega block text-[clamp(2.8rem,15vw,13rem)] leading-[0.84] text-text-primary"
              />
            </LiquidText>
          </div>

          <div className="mt-14 grid gap-12 border-t border-line pt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
            <div>
              <Reveal>
                <p className="max-w-xl text-pretty text-lg leading-relaxed text-text-secondary">
                  I am open to freelance work, full-time roles and
                  collaboration — particularly on systems that serve
                  organisations and communities in Rwanda and the wider region.
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <a
                  href={`mailto:${site.email}`}
                  data-cursor="Email"
                  className="group mt-10 inline-flex flex-wrap items-center gap-4 border-b border-line-strong pb-3 transition-colors duration-400 hover:border-primary"
                >
                  <span className="text-editorial text-[clamp(1.15rem,3vw,2.1rem)] font-medium text-text-primary transition-colors duration-400 group-hover:text-primary">
                    {site.email}
                  </span>
                  <ArrowUpRight
                    size={20}
                    className="text-text-muted transition-all duration-400 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                  />
                </a>
              </Reveal>
            </div>

            <Reveal delay={0.14}>
              <dl className="space-y-8">
                <div>
                  <dt className="meta text-text-muted">Location</dt>
                  <dd className="mt-2.5 text-text-primary">{site.location}</dd>
                </div>

                <div>
                  <dt className="meta text-text-muted">Availability</dt>
                  <dd className="mt-2.5 flex items-center gap-2.5 text-text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Open to new work
                  </dd>
                </div>

                <div>
                  <dt className="meta text-text-muted">Elsewhere</dt>
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
                            className="text-text-muted transition-all duration-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
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
      <footer data-band="dark" className="relative bg-ink">
        <Marquee
          items={[
            "Available for work",
            site.location,
            "Web platforms",
            "Embedded systems",
            "Applied AI",
          ]}
          direction="left"
          duration={40}
          className="border-y border-line py-4"
          itemClassName="meta text-primary"
        />

        <div className="mx-auto max-w-[1600px] px-6 py-12 sm:px-10 sm:py-14">
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
                      className="meta text-text-secondary transition-colors duration-300 hover:text-primary"
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
