import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import WorkRack from "@/components/sections/WorkRack";
import ProjectIndex from "@/components/sections/ProjectIndex";
import SignalMap from "@/components/sections/SignalMap";
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
import { buildSignalMap } from "@/lib/signal-map";
import { site } from "@/lib/site";

const GITHUB_USER = site.github.split("/").pop() || "AlphaMugisha";

/**
 * One scroll, read as a signal travelling through a system.
 *
 * 00 Hero          the board, live and disturbable
 * 01 About         the part, as a datasheet
 * 02 Capabilities  the channels it runs
 * 03 Work          the rack — featured builds, travelled through
 * 04 Index         the directory — everything, scannable
 * 05 Signal map    the wiring: which tool actually shipped where
 * 06 Journey       how the practice advanced, on a scrubbed rail
 * 07 Principles    the quiet beat
 * 08 GitHub        live output
 *    Contact       the way out
 *
 * The rack and the index sit next to each other on purpose: the first
 * argues for four projects in depth, the second lets you scan all eight.
 * One without the other is either a wall of entries with no argument,
 * or an argument with nothing to browse.
 *
 * Every read is issued in parallel. The GitHub call cannot fail the
 * page — `getGithubRepos` resolves to `null` on any error and the
 * section renders an explicit unavailable state.
 */
export default async function Home() {
  const [
    settings,
    sections,
    featured,
    projects,
    capabilities,
    skillGroups,
    journey,
    beyond,
    repos,
  ] = await Promise.all([
    getSiteSettings(),
    getSections(),
    getFeaturedProjects(),
    getProjects(),
    getCapabilities(),
    getSkillGroups(),
    getJourney(),
    getBeyondHighlights(),
    getGithubRepos(GITHUB_USER),
  ]);

  // Derived on the server from whatever the data layer returned, so the
  // diagram and the figures quoted in About always agree with the
  // project stacks currently in the database.
  const signal = buildSignalMap(skillGroups, projects);

  return (
    <>
      <Hero settings={settings} />
      <About
        section={sections.about}
        settings={settings}
        projectCount={projects.length}
        journeyCount={journey.length}
        totals={signal.totals}
      />
      <Capabilities section={sections["what-i-do"]} capabilities={capabilities} />
      <WorkRack section={sections.work} projects={featured} />
      <ProjectIndex section={sections["work-grid"]} projects={projects} />
      <SignalMap section={sections.toolbox} groups={signal.groups} totals={signal.totals} />
      <Journey section={sections.journey} entries={journey} />
      <Beyond section={sections.beyond} highlights={beyond} />
      <GithubActivity section={sections.github} repos={repos} username={GITHUB_USER} />
      <Contact section={sections.contact} settings={settings} />
    </>
  );
}
