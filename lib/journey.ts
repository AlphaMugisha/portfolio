/**
 * Journey / progression.
 *
 * Describes how the work developed, in terms that are verifiable from the
 * projects themselves. No employers, job titles, institutions or dates that
 * were not supplied — those are marked as placeholders in the README instead
 * of being invented here.
 */

export interface JourneyEntry {
  period: string;
  title: string;
  discipline: string;
  body: string;
  highlights: string[];
}

export const journey: JourneyEntry[] = [
  {
    period: "Foundation",
    title: "Electronics and embedded systems",
    discipline: "Hardware",
    body: "Began with microcontrollers and physical circuits — reading sensors, driving actuators, and learning to diagnose a system that gives no error message. This is where the habit of changing one variable at a time came from.",
    highlights: ["Arduino", "ESP32", "Sensors", "Relays", "Servos"],
  },
  {
    period: "Early work",
    title: "Server-rendered web applications",
    discipline: "Software",
    body: "Moved into full applications with PHP and MySQL: authentication, role separation, administrative interfaces and reporting. Several were built for real institutions — schools, a library, a church, a restaurant.",
    highlights: ["PHP", "MySQL", "Authentication", "Admin systems"],
  },
  {
    period: "Current",
    title: "Modern platforms and APIs",
    discipline: "Engineering",
    body: "Now working primarily in TypeScript across React, Next.js, Node and Laravel, over PostgreSQL with Prisma. Larger systems with proper data models, versioned APIs, role-scoped access and multilingual interfaces.",
    highlights: ["TypeScript", "Next.js", "Prisma", "PostgreSQL", "REST APIs"],
  },
  {
    period: "Ongoing",
    title: "Applied AI and automation",
    discipline: "Practice",
    body: "Using models as engineering tools rather than as a subject: API integration, coding agents, local inference and tool protocols such as MCP, applied to real workflows inside the projects above.",
    highlights: ["Claude", "OpenAI", "Ollama", "MCP"],
  },
];
