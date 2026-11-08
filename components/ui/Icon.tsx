import {
  Bot,
  Boxes,
  Brain,
  Code2,
  Cpu,
  Database,
  Gauge,
  Globe,
  Layers,
  Lightbulb,
  LineChart,
  Lock,
  Plane,
  Radio,
  Rocket,
  Server,
  Sparkles,
  Terminal,
  Users,
  Workflow,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * The icons the admin may choose from.
 *
 * An allow-list, not a dynamic lookup. Capability and highlight rows store an
 * icon NAME, which means the value comes out of the database and into a React
 * component — so the set of things that name can resolve to has to be fixed
 * here rather than looked up at runtime. It also keeps the bundle honest: a
 * dynamic import of lucide would pull the whole icon set into the client.
 */
export const ICONS: Record<string, LucideIcon> = {
  Bot,
  Boxes,
  Brain,
  Code2,
  Cpu,
  Database,
  Gauge,
  Globe,
  Layers,
  Lightbulb,
  LineChart,
  Lock,
  Plane,
  Radio,
  Rocket,
  Server,
  Sparkles,
  Terminal,
  Users,
  Workflow,
  Wrench,
  Zap,
};

/** Every name the admin's icon picker offers, alphabetically. */
export const ICON_NAMES = Object.keys(ICONS).sort();

export default function Icon({
  name,
  size = 24,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  // Falls back rather than rendering nothing: an unknown name means somebody
  // typed into the database directly, and a generic glyph is a better outcome
  // than a hole in the grid.
  const Glyph = ICONS[name] ?? Sparkles;
  return <Glyph size={size} className={className} aria-hidden="true" />;
}
