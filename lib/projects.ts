/**
 * Project data.
 *
 * Every metric in here was read off the running system (see `evidence`),
 * not estimated. If a project has no verified numbers, it has no numbers.
 */

export type ProjectStatus = "live" | "in-progress" | "prototype" | "concept";

export interface ProjectStat {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  name: string;
  year: string;
  categories: string[];
  summary: string;
  problem: string;
  solution: string;
  stack: string[];
  status: ProjectStatus;
  stats?: ProjectStat[];
  /** Where the stats came from - keeps the page honest. */
  evidence?: string;
  repo?: string;
  featured: boolean;
}

/** Cover photography lives at a path derived from the slug. */
export function coverFor(slug: string) {
  return `/images/projects/${slug}.jpg`;
}

export const projects: Project[] = [
  {
    slug: "rwasport",
    name: "RwaSport",
    year: "2026",
    categories: ["Sports Technology", "Platform", "Digital Infrastructure"],
    summary:
      "A digital backbone for Rwandan sport - federations, clubs, schools, fixtures and results in one system instead of scattered spreadsheets.",
    problem:
      "Rwandan sport runs on disconnected records. Federations, clubs and schools each keep their own fixtures, squads and results, so there is no single place to answer a basic question like who played, who scored, and what the standings actually are.",
    solution:
      "A monorepo platform with a typed API over PostgreSQL and a mobile-first client. It models the real hierarchy - sports, federations, leagues, teams, players, fixtures, events and standings - with role-scoped access so a federation admin only sees their own sport, and a live match centre that updates as events are reported.",
    stack: ["React", "Vite", "TypeScript", "Express", "Prisma", "PostgreSQL", "Tailwind CSS"],
    status: "in-progress",
    stats: [
      { label: "Data models", value: "43" },
      { label: "Teams seeded", value: "13" },
      { label: "Fixtures", value: "37" },
      { label: "Commits", value: "622" },
    ],
    evidence: "Counts read from the running rnsp_db instance and git history.",
    repo: "https://github.com/couper117/platform",
    featured: true,
  },
  {
    slug: "greenhouse-automation",
    name: "Greenhouse Automation",
    year: "2026",
    categories: ["IoT", "Embedded Systems", "Robotics"],
    summary:
      "An ESP32 reads its environment, decides what to do about it, and reports back to the cloud - closing the loop between a sensor and a real actuator.",
    problem:
      "A greenhouse drifts out of range long before anyone notices. Checking a thermometer by hand is not monitoring, and it certainly is not control - by the time you read the number, the damage is already happening.",
    solution:
      "An ESP32 samples temperature and humidity from a DHT sensor, renders live state to an OLED display, and switches a fan through a relay when readings cross threshold. Every reading is pushed to Supabase, so the physical system has a history you can actually query - the wiring and the software are one system, not two.",
    stack: ["ESP32", "C++", "Arduino", "DHT Sensor", "OLED", "Relay", "Supabase"],
    status: "prototype",
    featured: true,
  },
  {
    slug: "clean-kigali",
    name: "Clean Kigali",
    year: "2026",
    categories: ["Civic Technology", "Environment", "Web"],
    summary:
      "Community sanitation reporting for the City of Kigali - report an issue, track it, and let administrators triage what comes in.",
    problem:
      "When something needs cleaning up, the report itself is the bottleneck. Complaints get made verbally, go unrecorded, and nobody can tell you whether anything was ever done about them.",
    solution:
      "A multilingual reporting service where residents file an issue and receive a tracking reference, while administrators work through a queue with status changes recorded in an audit log. Built server-rendered and deliberately light, so it stays usable on a slow connection.",
    stack: ["TypeScript", "Node.js", "Express", "MySQL", "Tailwind CSS"],
    status: "in-progress",
    stats: [
      { label: "Locales", value: "Multi" },
      { label: "Audit trail", value: "Yes" },
    ],
    evidence: "Routes and audit logging verified against the running server.",
    repo: "https://github.com/AlphaMugisha/umuganda",
    featured: true,
  },
  {
    slug: "tembera",
    name: "Tembera",
    year: "2026",
    categories: ["Tourism", "Product", "Web Platform"],
    summary:
      "A tourism guide to Rwanda built on a real catalogue of places - searchable, mappable, and structured rather than a brochure.",
    problem:
      "Information about where to go in Rwanda is scattered across posts and PDFs. None of it is structured, so none of it can be searched, filtered or mapped in a way a visitor can actually use while travelling.",
    solution:
      "A catalogue modelled properly - places, categories, subcategories and cities - behind a map view, a search view and an explore view, with saved places for signed-in users. The data model came first; the interface is a read of it.",
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind CSS"],
    status: "live",
    stats: [
      { label: "Places", value: "495" },
      { label: "Cities", value: "30" },
      { label: "Categories", value: "87" },
    ],
    evidence: "Row counts read from the running tourism_db instance.",
    featured: true,
  },
  {
    slug: "transiteco",
    name: "TransitEco",
    year: "2026",
    categories: ["Transport", "API Design", "Web"],
    summary:
      "Bus routes, schedules and seat booking behind a versioned REST API, with live vehicle location as a first-class concern.",
    problem:
      "Intercity bus travel is coordinated informally. Routes, departure times and remaining seats live in someone's head or on a wall, which makes booking ahead - or knowing where a bus actually is - impossible.",
    solution:
      "A versioned Laravel API modelling companies, buses, routes, schedules and bookings, with role-based access for drivers and administrators and an endpoint for pushing live driver location. A separate Next.js client consumes it, so the API stands on its own.",
    stack: ["Laravel", "PHP", "Next.js", "TypeScript", "SQLite", "REST"],
    status: "prototype",
    stats: [
      { label: "Routes", value: "8" },
      { label: "Operators", value: "4" },
      { label: "Buses", value: "6" },
    ],
    evidence: "Row counts read from the project database.",
    repo: "https://github.com/AlphaMugisha/Tega-Bus",
    featured: false,
  },
  {
    slug: "digital-ikibina",
    name: "Digital Ikibina",
    year: "2026",
    categories: ["FinTech", "Community", "Web Application"],
    summary:
      "Rwanda's rotating savings groups - ikibina - moved from a paper ledger into software, without losing how they actually work.",
    problem:
      "An ikibina runs on a shared notebook and collective memory. It works until a contribution is disputed, a payout order is questioned, or the person holding the book is unavailable - and then there is no record to appeal to.",
    solution:
      "A multilingual application that models members, contributions and payout cycles, with authentication so every entry is attributable. The design goal was to digitise the ledger without redesigning a social system that already works.",
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Auth.js", "i18n"],
    status: "in-progress",
    repo: "https://github.com/AlphaMugisha/digital-ikibina",
    featured: false,
  },
  {
    slug: "payment-system",
    name: "Payment System",
    year: "2026",
    categories: ["FinTech", "Backend", "Web Application"],
    summary:
      "A multi-role payments application - customer, provider and admin - with webhook handling and a background job queue.",
    problem:
      "Payments are where a system's edge cases live. A provider callback arrives twice, or arrives before the transaction is written, and a naive implementation quietly corrupts its own ledger.",
    solution:
      "Three role-scoped surfaces over a shared transaction model, with webhook events persisted before they are processed and a job queue handling the asynchronous work. Protected routes are enforced at the middleware layer rather than in the UI.",
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Auth.js"],
    status: "in-progress",
    stats: [
      { label: "Roles", value: "3" },
      { label: "Providers", value: "3" },
    ],
    evidence: "Verified against the running application and its database.",
    repo: "https://github.com/AlphaMugisha/payment-system",
    featured: false,
  },
  {
    slug: "school-systems",
    name: "School & Community Systems",
    year: "2025 - 2026",
    categories: ["EdTech", "PHP", "Full Stack"],
    summary:
      "A run of PHP/MySQL systems built for real institutions - school portals, a library, a church site and a restaurant point-of-sale.",
    problem:
      "Small institutions rarely get purpose-built software. They get a spreadsheet, or nothing, and the administrative work stays manual because the tools cost more than the problem appears to.",
    solution:
      "A series of complete systems built the direct way - PHP and MySQL on a normal stack - each with authentication, role separation and an admin surface. A school portal with staff and class records, a library with borrowing and role-based access, a content-managed church site, and a point-of-sale with stock batches and transfers.",
    stack: ["PHP", "MySQL", "JavaScript", "Tailwind CSS", "Apache"],
    status: "live",
    stats: [
      { label: "Systems shipped", value: "5" },
      { label: "Roles modelled", value: "Staff / Student / Admin" },
    ],
    evidence: "Each system verified running locally against its own database.",
    repo: "https://github.com/AlphaMugisha/kami",
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const statusCopy: Record<ProjectStatus, string> = {
  live: "Live",
  "in-progress": "In progress",
  prototype: "Prototype",
  concept: "Concept",
};
