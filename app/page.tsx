import Drive from "@/components/world/Drive";
import Record from "@/components/record/Record";
import Toolbox from "@/components/record/Toolbox";
import Progression from "@/components/record/Progression";
import Connect from "@/components/record/Connect";
import Footer from "@/components/ui/Footer";
import {
  getSiteSettings,
  getProjects,
  getSkillGroups,
  getJourney,
} from "@/lib/db/public";

/**
 * The home page is two halves, on purpose.
 *
 * The drive is the overture: one road, one car, five environments,
 * eight chapters of the argument. It is atmosphere, and atmosphere is
 * the wrong tool for telling you that RwaSport models 43 entities or
 * that the toolbox runs to thirty-five technologies.
 *
 * So the moment the road ends, the page turns into a document. Same
 * palette, same type, completely different job: a ledger of every
 * system with its verified figures and where they came from, a parts
 * list of what they are built with, the order the disciplines arrived
 * in, and an address. The contrast between the two halves IS the
 * design — world, then record.
 *
 * Everything below the drive is plain server-rendered DOM, so it is
 * identical for visitors with no WebGL and for those who asked for
 * reduced motion.
 */
export default async function Home() {
  const [settings, projects, groups, journey] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getSkillGroups(),
    getJourney(),
  ]);

  return (
    <>
      <Drive settings={settings} projects={projects} />
      <Record projects={projects} />
      <Toolbox groups={groups} />
      <Progression entries={journey} />
      <Connect settings={settings} />
      <Footer settings={settings} />
    </>
  );
}
