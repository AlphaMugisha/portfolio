import { site } from "@/lib/site";

/**
 * The journey's script.
 *
 * The site is one continuous scroll through eight chapters. The 3D
 * environment and the typography are the only interface — there are no
 * cards — so this file is the entire content model for the experience.
 *
 * CONTENT INTEGRITY
 *
 * Everything marked `verified` is drawn from data that already existed
 * in this repo: `lib/site.ts`, `lib/journey.ts`, `lib/projects.ts` and
 * the About copy. Nothing in those chapters is invented.
 *
 * Two chapters ask for information nobody has supplied — personal
 * interests and values (03), and future aspirations (07). Rather than
 * writing plausible-sounding fiction, those are marked `editable: true`
 * and carry copy that is either true of the work already documented, or
 * an explicit blank for Alpha to fill. Search this file for `editable`
 * to find every line that needs his words.
 */

export interface Chapter {
  id: string;
  index: string;
  /** The small label beside the progress rail. */
  label: string;
  /** The oversized statement. Line breaks are authored, not wrapped. */
  statement: string[];
  /** One or two short supporting lines. Kept brief on purpose. */
  support?: string[];
  /** Word(s) inside `statement` to lift into amber. Matched case-insensitively. */
  accent?: string;
  /** Marks chapters whose copy is awaiting Alpha's own words. */
  editable?: boolean;
  /** Which camera framing the scene uses while this chapter is on screen. */
  shot: "approach" | "side" | "tunnel" | "detail" | "bridge" | "reveal" | "elevated" | "wide";
  /**
   * How much scroll this chapter gets, relative to the others.
   * The projects chapter has to carry several full-bleed reveals, so it
   * is given room rather than being rushed at the same pace as a
   * single statement.
   */
  weight?: number;
  /** Where the type sits. Varied deliberately so no two read alike. */
  align?: "left" | "right" | "center";
}

export const chapters: Chapter[] = [
  {
    id: "meet",
    align: "left",
    index: "01",
    label: "Meet Alpha",
    statement: ["Still learning.", "Already building."],
    accent: "building",
    support: [
      `I'm ${site.name}, a developer from ${site.location}.`,
      "I enjoy exploring ideas, learning through experimentation, and turning what I imagine into something real.",
    ],
    shot: "approach",
  },
  {
    id: "beginning",
    align: "right",
    index: "02",
    label: "The beginning",
    statement: ["It started", "with curiosity."],
    accent: "curiosity",
    // Verified: lib/journey.ts, "Foundation" — electronics and embedded systems.
    support: [
      "It began with microcontrollers and physical circuits — reading sensors, driving actuators, and learning to diagnose a system that gives no error message.",
      "That is where the habit of changing one variable at a time came from.",
    ],
    shot: "side",
  },
  {
    id: "beyond",
    align: "center",
    index: "03",
    label: "Beyond the screen",
    statement: ["There's more", "to the story."],
    accent: "more",
    editable: true,
    support: [
      // Verified — this is the standard the rest of the site is built to.
      "Every figure on this site was read off a running system. If a project has no verified numbers, it shows none.",
      // EDITABLE — Alpha's own words. Interests, values, what drives him
      // outside the work. Left deliberately open rather than invented.
      "",
    ],
    shot: "tunnel",
  },
  {
    id: "learning",
    align: "left",
    index: "04",
    label: "The learning journey",
    statement: ["Every step", "taught me something."],
    accent: "taught",
    // Verified: lib/journey.ts stages two and three.
    support: [
      "PHP and MySQL first — authentication, role separation and admin surfaces, several of them for real institutions.",
      "Then TypeScript across React, Next.js, Node and Laravel, over PostgreSQL with Prisma.",
    ],
    shot: "detail",
  },
  {
    id: "built",
    align: "left",
    index: "05",
    label: "The things I've built",
    statement: ["Ideas deserve", "to become real."],
    accent: "real",
    support: ["Eight systems, each one documented with where its numbers came from."],
    shot: "reveal",
    weight: 3,
  },
  {
    id: "world",
    align: "right",
    index: "06",
    label: "How I see the world",
    statement: ["Question.", "Explore.", "Create."],
    accent: "Create.",
    // Verified: the About copy.
    support: [
      "My work begins with the data. Before a screen exists there is a schema, a set of roles, and a clear idea of who needs to do what.",
      "That discipline came from starting with hardware, where a system either behaves correctly or visibly does not.",
    ],
    shot: "bridge",
  },
  {
    id: "next",
    align: "left",
    index: "07",
    label: "What comes next",
    statement: ["There is still", "so much to explore."],
    accent: "explore",
    editable: true,
    support: [
      // Verified: lib/journey.ts, "Ongoing".
      "Right now that means applied AI as an engineering tool — API integration, coding agents, local inference and tool protocols like MCP.",
      // EDITABLE — Alpha's actual goals and direction.
      "",
    ],
    shot: "elevated",
  },
  {
    id: "connect",
    align: "center",
    index: "08",
    label: "Let's connect",
    statement: ["Every journey", "leads somewhere."],
    accent: "somewhere",
    support: ["Have an idea, an opportunity, or something worth building? Let's connect."],
    shot: "wide",
  },
];

/**
 * Where each chapter sits in the 0..1 scroll of the whole journey,
 * weighted so the projects chapter gets the room its reveals need.
 * Computed once at module load — the ranges never change.
 */
export const CHAPTER_RANGES: [number, number][] = (() => {
  const weights = chapters.map((c) => c.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return weights.map((w) => {
    const from = acc / total;
    acc += w;
    return [from, acc / total] as [number, number];
  });
})();

/** Total scroll height of the journey, in viewport heights. */
export const JOURNEY_VH = chapters.reduce((n, c) => n + (c.weight ?? 1), 0) * 100;

/** Normalised 0..1 position of `p` inside chapter `i`, clamped. */
export function localProgress(p: number, i: number): number {
  const [a, b] = CHAPTER_RANGES[i];
  if (b === a) return 0;
  return Math.min(1, Math.max(0, (p - a) / (b - a)));
}
