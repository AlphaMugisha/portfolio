import type { ReactNode } from "react";

/**
 * A captioned frame around a screenshot.
 *
 * This used to draw browser chrome — three traffic-light dots and a pill
 * holding the project name — on the argument that an image inside window
 * chrome reads as a thing that exists rather than a render. That argument
 * still holds, but the dots are the single most product-page-looking object
 * a layout can contain, and they were sitting at the top of every card in
 * the work section.
 *
 * So the claim is made a different way: the media sits in a hairline frame
 * with the project's name set across a caption bar above it, in the same
 * tracked capitals every label on the site uses. It reads as a plate in a
 * catalogue — which is a stronger frame for finished work than a browser
 * window, and it is the site's own language rather than an operating
 * system's pasted onto the page.
 *
 * Decorative throughout: the bar is `aria-hidden`, so a screen reader hears
 * only whatever the caller puts inside.
 */
export default function BrowserFrame({
  children,
  label,
  className = "",
  compact = false,
  as: Tag = "figure",
}: {
  children: ReactNode;
  label: string;
  className?: string;
  /** Slimmer bar for use inside a card, where a full one eats the cover. */
  compact?: boolean;
  as?: "figure" | "div";
}) {
  return (
    <Tag
      className={`overflow-hidden rounded-card border border-line-panel bg-surface ${className}`}
    >
      <div
        aria-hidden="true"
        className={`flex items-center justify-between gap-4 border-b border-line-panel px-4 ${
          compact ? "py-2.5" : "py-3 sm:px-5"
        }`}
      >
        <span className="meta min-w-0 truncate text-text-muted">{label}</span>
        {/* A rule rather than an icon: it fills the bar to the right edge and
            makes the label sit on something. */}
        <span className="h-px w-10 shrink-0 bg-line" />
      </div>
      {children}
    </Tag>
  );
}
