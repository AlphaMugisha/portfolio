"use client";

import {
  siReact, siNextdotjs, siTypescript, siJavascript, siTailwindcss, siHtml5,
  siCss, siPhp, siPython, siFramer, siVite, siShadcnui,
  siEspressif, siArduino, siCplusplus,
  siClaude, siGooglegemini, siOpenrouter, siOllama,
  siPostgresql, siMysql, siSupabase, siNodedotjs, siPrisma, siGit,
} from "simple-icons";
import {
  Thermometer, Nfc, Tv, ToggleRight, Fan, RotateCw,
  Sparkles, Plug, BrainCircuit, Webhook, type LucideIcon,
} from "lucide-react";

/**
 * Technology mark.
 *
 * Brand logos come from simple-icons (official paths, official colours).
 * Concepts with no brand — sensors, relays, REST — fall back to a lucide
 * glyph so the grid stays complete rather than gappy.
 *
 * OpenAI has no simple-icons entry (removed over trademark), hence its
 * fallback glyph.
 */

interface Brand {
  path: string;
  hex: string;
}

const BRAND: Record<string, Brand> = {
  "React": siReact,
  "Next.js": siNextdotjs,
  "TypeScript": siTypescript,
  "JavaScript": siJavascript,
  "Tailwind CSS": siTailwindcss,
  "HTML": siHtml5,
  "CSS": siCss,
  "PHP": siPhp,
  "Python": siPython,
  "Framer Motion": siFramer,
  "Vite": siVite,
  "ShadCN": siShadcnui,
  "ESP32": siEspressif,
  "Arduino Uno": siArduino,
  "C / C++": siCplusplus,
  "Claude": siClaude,
  "Gemini": siGooglegemini,
  "OpenRouter": siOpenrouter,
  "Ollama": siOllama,
  "PostgreSQL": siPostgresql,
  "MySQL": siMysql,
  "Supabase": siSupabase,
  "Node.js": siNodedotjs,
  "Prisma": siPrisma,
  "Git / GitHub": siGit,
};

const GLYPH: Record<string, LucideIcon> = {
  "Sensors": Thermometer,
  "RFID": Nfc,
  "OLED": Tv,
  "Relays": ToggleRight,
  "Motors": Fan,
  "Servos": RotateCw,
  "OpenAI": Sparkles,
  "MCP": Plug,
  "AI APIs": BrainCircuit,
  "REST APIs": Webhook,
};

/**
 * Several brand colours are effectively black (Next.js #000000, Ollama,
 * ShadCN, GitHub #181717). On this ground they would disappear, so anything
 * below a luminance floor is drawn in the site's text colour instead.
 */
function displayColour(hex: string): string {
  const n = parseInt(hex, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const lin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L < 0.12 ? "#B9C7D2" : `#${hex}`;
}

export default function TechIcon({
  name,
  size = 34,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const brand = BRAND[name];

  if (brand) {
    return (
      <svg
        role="img"
        aria-hidden="true"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={displayColour(brand.hex)}
        className={className}
      >
        <path d={brand.path} />
      </svg>
    );
  }

  const Glyph = GLYPH[name];
  if (Glyph) {
    return (
      <Glyph
        size={size}
        strokeWidth={1.4}
        aria-hidden="true"
        className={`text-primary ${className}`}
      />
    );
  }

  // Last resort: a monogram, so a newly added skill never renders blank.
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={`grid place-items-center rounded-sm border border-line-strong font-semibold text-text-muted ${className}`}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}
