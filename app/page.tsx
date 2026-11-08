import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import SelectedWork from "@/components/sections/SelectedWork";
import ProjectGrid from "@/components/sections/ProjectGrid";
import Toolbox from "@/components/sections/Toolbox";
import Journey from "@/components/sections/Journey";
import Beyond from "@/components/sections/Beyond";
import GithubActivity from "@/components/sections/GithubActivity";
import Contact from "@/components/sections/Contact";
import {
  getSiteSettings,
  getSections,
  getFeaturedProjects,
  getProjects,
  getCapabilities,
  getSkillGroups,
  getJourney,
  getBeyondHighlights,
} from "@/lib/db/public";
import { getGithubRepos } from "@/lib/github";
import { site } from "@/lib/site";

/**
 * The page reads as a single scroll: who, what, proof, depth, how the tools
 * were learned, real activity, and an invitation. `SelectedWork` and
 * `ProjectGrid` sit next to each other on purpose — the first argues for a
 * handful of projects in depth, the second lets you browse all of them.
 */
export default async function Home() {
  const [settings, sections, featured, projects, capabilities, skillGroups, journey, beyond, repos] =
    await Promise.all([
      getSiteSettings(),
      getSections(),
      getFeaturedProjects(),
      getProjects(),
      getCapabilities(),
      getSkillGroups(),
      getJourney(),
      getBeyondHighlights(),
      getGithubRepos(site.github.split("/").pop() ?? "AlphaMugisha"),
    ]);

  return (
    <>
      <Hero settings={settings} />
      <About section={sections.about} settings={settings} />
      <Capabilities section={sections["what-i-do"]} capabilities={capabilities} />
      <SelectedWork section={sections.work} projects={featured} />
      <ProjectGrid section={sections["work-grid"]} projects={projects} />
      <Toolbox section={sections.toolbox} groups={skillGroups} />
      <Journey section={sections.journey} entries={journey} />
      <Beyond section={sections.beyond} highlights={beyond} />
      <GithubActivity
        section={sections.github}
        repos={repos}
        username={site.github.split("/").pop() ?? "AlphaMugisha"}
      />
      <Contact section={sections.contact} settings={settings} />
    </>
  );
}
