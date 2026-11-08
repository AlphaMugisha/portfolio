import { Star, ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import Reveal from "@/components/ui/Reveal";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { timeAgo } from "@/lib/utils/format";
import type { GithubRepo } from "@/lib/github";
import type { SectionRow } from "@/types/database";

/**
 * Live repository activity, rendered as a readout.
 *
 * A terminal frame rather than another card grid: this is the one
 * section whose content is fetched at request time rather than
 * authored, and framing it as command output is the honest way to say
 * so — the command that produced it is printed above the result.
 *
 * Three states, all real and all designed:
 *   `null`  the GitHub call failed (rate limit, network). Says so, in
 *           the same monospace frame, rather than hiding the section or
 *           quietly showing stale numbers.
 *   `[]`    the account genuinely has no public, non-forked repos.
 *   rows    the live result, newest push first.
 *
 * Nothing here is ever fabricated: every figure is a field from the
 * API response, and the revalidation window is stated on screen.
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
    <section id="github" className="relative px-6 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader section={section} index="08" />
          <Reveal variant="rise" delay={0.1}>
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 font-mono text-xs text-text-muted transition-colors hover:text-signal"
              data-cursor-label="GitHub"
            >
              <GithubIcon size={15} />@{username}
              <ArrowUpRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </Reveal>
        </div>

        <Reveal variant="wipe" className="mt-12">
          <div className="board board-lg relative overflow-hidden bg-ink-deep">
            <span className="ticks" />

            {/* frame header */}
            <div className="flex items-center justify-between border-b border-rule px-5 py-3">
              <span className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                </span>
                <span className="note note-signal">Live</span>
              </span>
              <span className="note">Revalidates hourly</span>
            </div>

            <div className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
              <p className="whitespace-nowrap text-text-subtle">
                <span className="text-signal">$</span> gh repo list {username} --sort pushed
                --no-archived
              </p>

              {repos === null ? (
                <p className="mt-4 text-text-muted">
                  <span className="text-signal-deep">!</span> GitHub did not respond — the live
                  feed is unavailable right now. Everything else on this page is static and
                  unaffected.
                </p>
              ) : repos.length === 0 ? (
                <p className="mt-4 text-text-muted">No public repositories.</p>
              ) : (
                <ul className="mt-3">
                  {repos.map((repo, i) => (
                    <li key={repo.url}>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor-label="Open"
                        className="group grid grid-cols-[1fr_auto] items-start gap-4 border-b border-rule/60 py-3 last:border-0 sm:grid-cols-[18px_minmax(0,1.1fr)_minmax(0,1.4fr)_auto]"
                      >
                        <span className="hidden text-text-subtle sm:block">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <span className="min-w-0">
                          <span className="block truncate text-text transition-colors group-hover:text-signal">
                            {repo.name}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-text-subtle sm:hidden">
                            {repo.description ?? "No description"}
                          </span>
                        </span>

                        <span className="hidden min-w-0 truncate text-text-subtle sm:block">
                          {repo.description ?? "—"}
                        </span>

                        <span className="flex shrink-0 items-center gap-4 text-[11px] text-text-subtle">
                          {repo.language ? (
                            <span className="hidden sm:inline">{repo.language}</span>
                          ) : null}
                          <span className="inline-flex items-center gap-1">
                            <Star size={11} />
                            {repo.stars}
                          </span>
                          <span className="tabular-nums">{timeAgo(repo.updatedAt)}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 text-text-subtle">
                <span className="text-signal">$</span>
                <span className="caret ml-2 inline-block h-[1em] w-[7px] translate-y-[2px] bg-signal" />
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
