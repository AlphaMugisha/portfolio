/**
 * Technology groups.
 *
 * `detail` is what appears when a chip is hovered or focused - it exists to
 * say what the technology is actually used FOR, rather than implying a
 * proficiency score. No percentages anywhere: they would be invented.
 */

export interface Skill {
  name: string;
  detail: string;
}

export interface SkillGroup {
  id: string;
  title: string;
  index: string;
  blurb: string;
  accent: "teal" | "rust";
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: "software",
    title: "Software",
    index: "01",
    blurb: "The layer most of my work ships through.",
    accent: "teal",
    skills: [
      { name: "React", detail: "Components / State / Hooks" },
      { name: "Next.js", detail: "App Router / SSR / Routing" },
      { name: "TypeScript", detail: "Types / Safety / Tooling" },
      { name: "JavaScript", detail: "Core language / DOM / Async" },
      { name: "Tailwind CSS", detail: "Design systems / Tokens" },
      { name: "HTML", detail: "Semantics / Accessibility" },
      { name: "CSS", detail: "Layout / Motion / Responsive" },
      { name: "PHP", detail: "Server rendering / Sessions" },
      { name: "Python", detail: "Scripting / Automation" },
      { name: "Framer Motion", detail: "Animation / Gestures" },
      { name: "Vite", detail: "Bundling / Dev server" },
      { name: "ShadCN", detail: "Component primitives" },
    ],
  },
  {
    id: "hardware",
    title: "Hardware",
    index: "02",
    blurb: "Where the code stops being abstract and moves something.",
    accent: "rust",
    skills: [
      { name: "ESP32", detail: "Embedded / IoT / Wi-Fi" },
      { name: "Arduino Uno", detail: "Microcontrollers / C++" },
      { name: "Sensors", detail: "DHT / Temperature / Humidity" },
      { name: "RFID", detail: "Identification / Access" },
      { name: "OLED", detail: "Displays / I2C" },
      { name: "Relays", detail: "Switching / Actuation" },
      { name: "Motors", detail: "Drive / Control" },
      { name: "Servos", detail: "Positioning / PWM" },
      { name: "C / C++", detail: "Firmware / Low level" },
    ],
  },
  {
    id: "ai",
    title: "AI",
    index: "03",
    blurb: "Treated as an engineering tool, not a talking point.",
    accent: "teal",
    skills: [
      { name: "Claude", detail: "Reasoning / Agents / Code" },
      { name: "OpenAI", detail: "APIs / Completions" },
      { name: "Gemini", detail: "Multimodal / APIs" },
      { name: "OpenRouter", detail: "Model routing" },
      { name: "Ollama", detail: "Local models / Inference" },
      { name: "MCP", detail: "Tool protocols / Context" },
      { name: "AI APIs", detail: "Integration / Automation" },
    ],
  },
  {
    id: "data",
    title: "Data & Backend",
    index: "04",
    blurb: "Where the truth of a system actually lives.",
    accent: "rust",
    skills: [
      { name: "PostgreSQL", detail: "Relational / Prisma" },
      { name: "MySQL", detail: "Relational / PHP stack" },
      { name: "Supabase", detail: "Realtime / Auth / Storage" },
      { name: "Node.js", detail: "Servers / Tooling" },
      { name: "REST APIs", detail: "Design / Versioning" },
      { name: "Prisma", detail: "Schema / Migrations" },
      { name: "Git / GitHub", detail: "Version control / CI" },
    ],
  },
];
