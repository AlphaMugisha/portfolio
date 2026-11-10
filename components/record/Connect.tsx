import Masthead from "./Masthead";
import Reveal from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import type { SiteSettingsRow } from "@/types/database";

/**
 * The end of the document.
 *
 * Anchored at #contact, not #connect: the drive already pins a
 * chapter marker called `connect` for its eighth chapter, and two
 * elements with the same id means every link to it lands on whichever
 * one the document happens to reach first — which was the chapter
 * marker, eight screens up the road.
 *
 * One address, set large enough to be the thing you leave with. The
 * links that exist are here; the ones that do not have no placeholder
 * standing in for them — a CV button that 404s and a LinkedIn link to
 * a bare profile route were both shipped on this site once, and the
 * fix was to delete them rather than to dress them up.
 */
export default function Connect({ settings }: { settings: SiteSettingsRow }) {
  const email = settings.email ?? site.email;
  const github = settings.github_url ?? site.github;
  const linkedin = settings.linkedin_url ?? site.linkedin;
  const cv = settings.cv_path ?? site.cv;

  return (
    <section
      aria-label="Contact"
      className="border-t border-rule bg-ink-raised px-6 py-28 sm:px-12 sm:py-36 lg:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <Masthead
          id="contact"
          index="05"
          title="Open"
          lead="Have an idea, an opportunity, or something worth building?"
        />

        <Reveal variant="rise" delay={0.08}>
          <a
            href={`mailto:${email}`}
            className="group mt-14 block font-display text-[clamp(1.6rem,6vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-text transition-colors duration-300 hover:text-signal"
          >
            <span className="break-all">{email}</span>
            <span
              aria-hidden="true"
              className="ml-4 inline-block text-signal transition-transform duration-300 group-hover:translate-x-2"
            >
              →
            </span>
          </a>
        </Reveal>

        <Reveal variant="rise" delay={0.14}>
          <div className="mt-16 flex flex-wrap items-end justify-between gap-x-12 gap-y-8 border-t border-rule pt-8">
            <dl className="flex flex-wrap gap-x-14 gap-y-6">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-subtle">
                  Based in
                </dt>
                <dd className="mt-2 text-[15px] text-text">{settings.location ?? site.location}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-subtle">
                  Works across
                </dt>
                <dd className="mt-2 text-[15px] text-text">
                  Web platforms · Embedded · Applied AI
                </dd>
              </div>
            </dl>

            <ul className="flex flex-wrap gap-x-9 gap-y-3 font-mono text-[11px] uppercase tracking-[0.22em]">
              <li>
                <a
                  className="text-text-muted transition-colors hover:text-signal"
                  href={github}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  GitHub ↗
                </a>
              </li>
              {linkedin ? (
                <li>
                  <a
                    className="text-text-muted transition-colors hover:text-signal"
                    href={linkedin}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    LinkedIn ↗
                  </a>
                </li>
              ) : null}
              {cv ? (
                <li>
                  <a className="text-text-muted transition-colors hover:text-signal" href={cv}>
                    CV ↓
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
