import Drive from "@/components/world/Drive";
import { getSiteSettings, getProjects } from "@/lib/db/public";

/**
 * Section 01 — the drive.
 *
 * One scroll, one road, five environments: Winter Mountains, Sunny
 * City, Green Forest, Rainy City and a Sunset ridge. The car travels
 * the whole of it and the chapters play over the drive.
 *
 * The data layer is untouched: projects still come from Supabase with
 * the static fallback, and each one puts a real portal on the forest
 * road that links to its case study at `/projects/[slug]`.
 */
export default async function Home() {
  const [settings, projects] = await Promise.all([getSiteSettings(), getProjects()]);

  return <Drive settings={settings} projects={projects} />;
}
