/**
 * Shown while a case study streams in.
 *
 * The blocks trace the real article — back link, eyebrows, title, categories,
 * summary, cover, stats — so the page settles into position instead of
 * reflowing when the content lands.
 */

/** One placeholder block. Decorative, so it stays out of the a11y tree. */
function Bar({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={`animate-shimmer rounded-sm bg-white/12 ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <article
      role="status"
      aria-label="Loading project"
      className="px-6 pb-24 pt-32 sm:px-8 sm:pt-40"
    >
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <Bar className="mb-14 h-3 w-28" />

        {/* Year / status */}
        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Bar className="h-2.5 w-10" />
          <Bar className="h-2.5 w-20" />
        </div>

        {/* Title — two lines at display scale. */}
        <Bar className="h-[clamp(2.25rem,6.5vw,4.75rem)] w-full max-w-3xl" />
        <Bar className="mt-3 h-[clamp(2.25rem,6.5vw,4.75rem)] w-2/3 max-w-xl" />

        {/* Categories */}
        <div className="mt-7 flex flex-wrap gap-2">
          <Bar className="h-6 w-24 rounded-full" />
          <Bar className="h-6 w-20 rounded-full" />
          <Bar className="h-6 w-28 rounded-full" />
        </div>

        {/* Summary */}
        <div className="mt-8 max-w-2xl space-y-3">
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-4/5" />
        </div>

        {/* Cover */}
        <Bar className="mt-14 aspect-16/9 w-full" />

        {/* Stats */}
        <div className="mt-14 grid grid-cols-2 gap-8 border-y border-line py-10 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <Bar className="h-2.5 w-16" />
              <Bar className="mt-3 h-7 w-20" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading project</span>
    </article>
  );
}
