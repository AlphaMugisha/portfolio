import { Star, ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { timeAgo } from "@/lib/utils/format";
import type { GithubRepo } from "@/lib/github";
import type { SectionRow } from "@/types/database";

/**
 * Live repository activity, or an explicit unavailable state — never a
 * fabricated stat. `repos === null` means the GitHub API call failed (rate
 * limit, network); an empty array is a real, empty account.
 */
export default function GithubActivity({
  section,
  repos,
  username,
}: {
  section: SectionRow;
  repos: GithubRepo[] | null;
  username: string;
}) {
  return (
    <section id="github" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading section={section} index="08" />
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-signal"
          >
            <GithubIcon size={16} />@{username}
            <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        {repos === null ? (
          <p className="mt-10 font-mono text-sm text-text-subtle">
            GitHub activity is unavailable right now — check back shortly.
          </p>
        ) : repos.length === 0 ? (
          <p className="mt-10 font-mono text-sm text-text-subtle">No public repositories yet.</p>
        ) : (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, i) => (
              <ScrollReveal key={repo.url} delay={(i % 3) * 0.08}>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="panel lift group block h-full p-6"
                >
                  <span className="panel-marks" />
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate font-mono text-sm font-medium text-text group-hover:text-signal">
                      {repo.name}
                    </p>
                    <ArrowUpRight
                      size={14}
                      className="shrink-0 text-text-subtle transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal"
                    />
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-[2.5em] text-sm leading-relaxed text-text-muted">
                    {repo.description ?? "No description."}
                  </p>
                  <div className="mt-5 flex items-center gap-4 font-mono text-[11px] text-text-subtle">
                    {repo.language ? <span>{repo.language}</span> : null}
                    <span className="inline-flex items-center gap-1">
                      <Star size={12} /> {repo.stars}
                    </span>
                    <span className="ml-auto">{timeAgo(repo.updatedAt)}</span>
                  </div>
                </a>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
