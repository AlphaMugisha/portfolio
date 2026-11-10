import { site } from "@/lib/site";

/**
 * Section 01 — the drive.
 *
 * Five environments, one road, one car. This file is the whole
 * definition of that world: where each environment sits in the scroll,
 * what its light and weather do, and what can be clicked in it.
 *
 * CONTENT INTEGRITY. Every string a visitor can read here comes from
 * data already in this repository — `lib/site.ts`, `lib/journey.ts`,
 * `lib/chapters.ts` and the project records. Nothing about Alpha's
 * history, interests or achievements is invented. Where a hotspot had
 * nothing true to say, it does not exist rather than being filled with
 * plausible copy.
 */

export type WeatherKind = "snow" | "clear" | "pollen" | "rain" | "dusk";

export interface Hotspot {
  id: string;
  /** Distance along this environment's stretch of road, 0..1. */
  at: number;
  /** Metres left (negative) or right (positive) of the centreline. */
  side: number;
  /** The shape it takes in the world. */
  form: "marker" | "sign" | "beacon";
  label: string;
  title: string;
  body: string;
  /** Optional outbound route — used by the project portals. */
  href?: string;
}

export interface WorldEnv {
  id: string;
  index: string;
  /** Shown in the environment switcher. */
  name: string;
  /** One line, printed under the name while you are inside it. */
  caption: string;
  weather: WeatherKind;

  /* ---- light ---- */
  /** Top and horizon colour of the sky dome. */
  skyTop: string;
  skyLow: string;
  /** Distance fog — the single biggest mood control in the scene. */
  fog: string;
  fogNear: number;
  fogFar: number;
  /** The key light. */
  sun: string;
  sunPower: number;
  sunAt: [number, number, number];
  /** Bounce: sky colour above, ground colour below. */
  hemiSky: string;
  hemiGround: string;
  hemiPower: number;
  /** How much of the reflection probe reaches the paint. */
  envPower: number;
  /** The terrain surface. */
  ground: string;
  /** The road ribbon. */
  tarmac: string;
  /** Does the car run its lights here? */
  lamps: boolean;

  /* ---- content ---- */
  /** Chapter ids from `lib/chapters.ts` that play over this environment. */
  chapters: string[];
  hotspots: Hotspot[];
}

/**
 * The five. Ordered as the car drives them, and as the story runs:
 * where it started, what it built, what it grew into, what it got
 * wrong, and where it is heading.
 */
export const environments: WorldEnv[] = [
  {
    id: "mountains",
    index: "01",
    name: "Winter Mountains",
    caption: "Where it started — cold, quiet, nothing running yet.",
    weather: "snow",
    skyTop: "#5d738f",
    skyLow: "#cdd8e4",
    fog: "#aebccd",
    fogNear: 30,
    fogFar: 200,
    sun: "#e8eef7",
    sunPower: 1.25,
    sunAt: [-60, 70, 40],
    hemiSky: "#b9cadd",
    hemiGround: "#e4ecf4",
    hemiPower: 0.75,
    envPower: 0.6,
    ground: "#d8e2ec",
    tarmac: "#2a2e34",
    lamps: true,
    chapters: ["meet", "beginning"],
    hotspots: [
      {
        id: "origin",
        at: 0.62,
        side: -9,
        form: "marker",
        label: "Origin",
        title: "Kigali, Rwanda",
        body: `${site.name} builds from ${site.location} — web platforms, embedded electronics and applied AI. Everything further down this road was made there.`,
      },
      {
        id: "circuits",
        at: 0.88,
        side: 10,
        form: "sign",
        label: "First principles",
        title: "It began with circuits",
        body: "Microcontrollers and physical wiring — reading sensors, driving actuators, diagnosing a system that gives you no error message. That is where the habit of changing one variable at a time came from.",
      },
    ],
  },
  {
    id: "city",
    index: "02",
    name: "Sunny City",
    caption: "Daylight, traffic, deadlines — the systems that had to work.",
    weather: "clear",
    skyTop: "#2f74c8",
    skyLow: "#cfe4f6",
    fog: "#d8d3c6",
    fogNear: 50,
    fogFar: 300,
    sun: "#fff4d8",
    sunPower: 1.85,
    sunAt: [70, 95, 30],
    hemiSky: "#bcd8f2",
    hemiGround: "#8c8068",
    hemiPower: 0.45,
    envPower: 0.7,
    ground: "#7d7059",
    tarmac: "#35383d",
    lamps: false,
    chapters: ["beyond", "learning"],
    hotspots: [
      {
        id: "stack",
        at: 0.3,
        side: 11,
        form: "sign",
        label: "The stack",
        title: "PHP first, then TypeScript",
        body: "Authentication, role separation and admin surfaces in PHP and MySQL — several of them for real institutions. Then TypeScript across React, Next.js, Node and Laravel, over PostgreSQL with Prisma.",
      },
      {
        id: "standard",
        at: 0.74,
        side: -11,
        form: "marker",
        label: "House rule",
        title: "Numbers come off running systems",
        body: "Every figure on this site was read from something that actually runs. A project with no verified numbers shows none.",
      },
    ],
  },
  {
    id: "forest",
    index: "03",
    name: "Green Forest",
    caption: "The work itself — every system, standing by the road.",
    weather: "pollen",
    skyTop: "#4a7d55",
    skyLow: "#d6e3bd",
    fog: "#90ac82",
    fogNear: 24,
    fogFar: 185,
    sun: "#fff0bd",
    sunPower: 1.75,
    sunAt: [40, 80, -50],
    hemiSky: "#9ec47f",
    hemiGround: "#2c3b18",
    hemiPower: 0.72,
    envPower: 0.6,
    ground: "#35491f",
    tarmac: "#30322f",
    lamps: false,
    chapters: ["built"],
    /* The project portals are generated from the real project records
       at render time — see `portalsFrom()`. Nothing is hard-coded here. */
    hotspots: [],
  },
  {
    id: "rain",
    index: "04",
    name: "Rainy City",
    caption: "The parts that broke, and what they taught.",
    weather: "rain",
    skyTop: "#1b2330",
    skyLow: "#46525f",
    fog: "#36414d",
    fogNear: 20,
    fogFar: 195,
    sun: "#aec2d8",
    sunPower: 1.05,
    sunAt: [-40, 60, -30],
    hemiSky: "#6b7f96",
    hemiGround: "#22262c",
    hemiPower: 1.05,
    envPower: 0.55,
    ground: "#262b32",
    tarmac: "#1d2024",
    lamps: true,
    chapters: ["world"],
    hotspots: [
      {
        id: "method",
        at: 0.34,
        side: -10,
        form: "beacon",
        label: "Method",
        title: "Data before screens",
        body: "Before a screen exists there is a schema, a set of roles, and a clear idea of who needs to do what. That discipline came from starting with hardware, where a system either behaves correctly or visibly does not.",
      },
      {
        id: "silence",
        at: 0.76,
        side: 11,
        form: "sign",
        label: "Question. Explore. Create.",
        title: "No error message",
        body: "An embedded system fails silently. You learn to build the instrumentation before you need it — which is why every project here is documented with where its numbers came from.",
      },
    ],
  },
  {
    id: "sunset",
    index: "05",
    name: "Sunset Destination",
    caption: "Still climbing — and open to what comes next.",
    weather: "dusk",
    skyTop: "#241a3a",
    skyLow: "#ff9a44",
    fog: "#a8603c",
    fogNear: 40,
    fogFar: 340,
    sun: "#ffb257",
    sunPower: 1.8,
    sunAt: [10, 16, -180],
    hemiSky: "#e8864a",
    hemiGround: "#2a1a22",
    hemiPower: 0.7,
    envPower: 1.0,
    ground: "#42291f",
    tarmac: "#2b262a",
    lamps: true,
    chapters: ["next", "connect"],
    hotspots: [
      {
        id: "ongoing",
        at: 0.33,
        side: 11,
        form: "sign",
        label: "Ongoing",
        title: "Applied AI as an engineering tool",
        body: "API integration, coding agents, local inference, and tool protocols like MCP. Not as a topic — as something to build with.",
      },
      {
        id: "contact",
        at: 0.84,
        side: -10,
        form: "beacon",
        label: "Open",
        title: "Let us connect",
        body: `Have an idea, an opportunity, or something worth building? ${site.email}`,
        href: `mailto:${site.email}`,
      },
    ],
  },
];

/** Where each environment sits in the 0..1 scroll of Section 01. */
export const ENV_RANGES: [number, number][] = environments.map((_, i) => [
  i / environments.length,
  (i + 1) / environments.length,
]);

/** Total scroll height of the drive, in viewport heights. */
export const DRIVE_VH = environments.length * 170;

/** Index of the environment containing progress `p`, and how far into it. */
export function envAt(p: number): { index: number; local: number } {
  const n = environments.length;
  const raw = Math.min(n - 1e-6, Math.max(0, p * n));
  const index = Math.floor(raw);
  return { index, local: raw - index };
}

/** Scroll position of environment `i`'s start — used by the switcher. */
export function envStart(i: number): number {
  return ENV_RANGES[i][0] + 0.012;
}

/** The forest index, so the portals know which stretch to stand along. */
export const FOREST_INDEX = environments.findIndex((e) => e.id === "forest");
