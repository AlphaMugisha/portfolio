import type { ProjectStatus } from "@/types/database";

/** How each status enum value is written on the page. */
export const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "Live",
  "in-progress": "In progress",
  prototype: "Prototype",
  concept: "Concept",
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, label]) => ({
  value: value as ProjectStatus,
  label,
}));

/** Coarse relative time ("3d ago", "2mo ago") for activity feeds. */
export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const steps: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [30, "d"],
    [12, "mo"],
    [Infinity, "y"],
  ];
  let value = seconds;
  let unit = "s";
  for (const [size, label] of steps) {
    if (value < size) {
      unit = label;
      break;
    }
    value /= size;
    unit = label;
  }
  return `${Math.max(1, Math.floor(value))}${unit} ago`;
}
