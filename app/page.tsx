import Journey from "@/components/journey/Journey";
import { getSiteSettings, getProjects } from "@/lib/db/public";

/**
 * The site is the journey.
 *
 * One continuous scroll-driven world with eight chapters of
 * typography over it — no sections, no cards, no panels. The data
 * layer is unchanged: project content still comes from Supabase with
 * the static fallback, so editing a project in the admin still
 * changes what the reveals show.
 *
 * The case studies at `/projects/[slug]` remain as the place to read
 * a project in depth; the journey links into them.
 */
export default async function Home() {
  const [settings, projects] = await Promise.all([getSiteSettings(), getProjects()]);

  return <Journey settings={settings} projects={projects} />;
}
