import type { ReactNode } from "react";

/**
 * A browser window around a screenshot.
 *
 * A cropped image of a website could be a mockup, a concept, or a render. The
 * same image inside window chrome reads as a thing that exists and was
 * opened — which is the claim a case study is making, and the cheapest way
 * to make it credibly.
 *
 * The chrome is drawn, not photographed: three dots and a label bar built
 * from the site's own tokens, so it inherits the palette instead of pasting
 * some other operating system onto the page. `label` takes the project name
 * rather than a fake URL — inventing a plausible address for a site that may
 * not be public would be a small lie in a section about verified work.
 *
 * Decorative throughout: the chrome is `aria-hidden`, so a screen reader
 * hears only whatever the caller puts inside.
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
  const dot = compact ? "h-2 w-2" : "h-2.5 w-2.5";

  return (
    <Tag
      className={`overflow-hidden rounded-[14px] border border-line-panel bg-bg-raised ${className}`}
    >
      <div
        aria-hidden="true"
        className={`flex items-center gap-2 border-b border-line-panel px-3 ${
          compact ? "py-2" : "py-3 sm:px-4"
        }`}
      >
        <span className="flex shrink-0 gap-1.5">
          <span className={`${dot} rounded-full bg-line-strong`} />
          <span className={`${dot} rounded-full bg-line-strong`} />
          <span className={`${dot} rounded-full bg-line-strong`} />
        </span>
        <span
          className={`mx-auto max-w-[62%] truncate rounded-full bg-surface px-3 font-geometric text-text-muted ${
            compact ? "py-0.5 text-[0.7rem]" : "py-1 text-[0.75rem]"
          }`}
        >
          {label}
        </span>
        {/* Balances the dots so the label sits optically centred. */}
        <span className={compact ? "w-[34px] shrink-0" : "w-[42px] shrink-0"} />
      </div>
      {children}
    </Tag>
  );
}
