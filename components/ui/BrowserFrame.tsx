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
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <figure className={`plate overflow-hidden p-0 ${className}`}>
      <div
        aria-hidden="true"
        className="flex items-center gap-2 border-b border-line-panel bg-bg-raised px-4 py-3"
      >
        <span className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        </span>
        <span className="mx-auto max-w-[60%] truncate rounded-full bg-surface px-4 py-1 font-geometric text-[11px] text-text-muted">
          {label}
        </span>
        {/* Balances the dots so the label sits optically centred. */}
        <span className="w-[42px] shrink-0" />
      </div>
      {children}
    </figure>
  );
}
