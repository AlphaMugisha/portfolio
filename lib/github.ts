/**
 * Real GitHub activity, read live from the public REST API — not a static
 * list maintained by hand. Revalidated hourly; on any failure (rate limit,
 * network, GitHub down) the caller gets `null` and renders an explicit
 * unavailable state rather than stale or fabricated numbers.
 */

export interface GithubRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
  updatedAt: string;
}

export async function getGithubRepos(username: string, limit = 6): Promise<GithubRepo[] | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as Array<{
      name: string;
      description: string | null;
      html_url: string;
      stargazers_count: number;
      language: string | null;
      pushed_at: string;
      fork: boolean;
    }>;

    return data
      .filter((r) => !r.fork)
      .sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime())
      .slice(0, limit)
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        language: r.language,
        updatedAt: r.pushed_at,
      }));
  } catch {
    return null;
  }
}
