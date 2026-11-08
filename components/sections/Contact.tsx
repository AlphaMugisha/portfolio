import { ArrowUpRight } from "lucide-react";
import SplitText from "@/components/ui/SplitText";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import type { SectionRow, SiteSettingsRow } from "@/types/database";

export default function Contact({
  section,
  settings,
}: {
  section: SectionRow;
  settings: SiteSettingsRow;
}) {
  return (
    <section id="contact" className="relative px-6 py-28 lg:py-36">
      <div className="mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <p className="tag tag-signal mx-auto">{settings.availability}</p>
        </ScrollReveal>

        <h2 className="mt-7 text-display-lg font-display font-semibold text-text">
          <SplitText as="span" text={section.heading} className="block" />
          {section.accent ? (
            <SplitText as="span" text={section.accent} className="block text-signal" delay={0.15} />
          ) : null}
        </h2>

        <ScrollReveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-text-muted">
            {section.intro}
          </p>

          <a
            href={`mailto:${settings.email}`}
            className="group mt-10 inline-flex items-center gap-3 font-mono text-xl text-text transition-colors hover:text-signal sm:text-2xl"
          >
            {settings.email}
            <ArrowUpRight
              size={22}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </a>

          <div className="mt-10 flex items-center justify-center gap-4">
            {settings.github_url ? (
              <a
                href={settings.github_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-11 w-11 items-center justify-center border border-rule text-text-muted transition-colors hover:border-signal hover:text-signal"
              >
                <GithubIcon size={18} />
              </a>
            ) : null}
            {settings.linkedin_url ? (
              <a
                href={settings.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center border border-rule text-text-muted transition-colors hover:border-signal hover:text-signal"
              >
                <LinkedinIcon size={18} />
              </a>
            ) : null}
            {settings.cv_path ? (
              <a href={settings.cv_path} className="btn btn-outline">
                Download CV
              </a>
            ) : null}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
