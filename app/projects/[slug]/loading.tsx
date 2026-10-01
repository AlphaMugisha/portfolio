/** Skeleton for a case study: the same boxes, with no content in them. */
function Box({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-black/[0.06] dark:bg-white/[0.06] ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="px-6 pb-28 pt-36 lg:pt-44" aria-label="Loading project">
      <div className="mx-auto max-w-5xl">
        <Box className="h-4 w-32" />
        <div className="mt-10 flex gap-2">
          <Box className="h-7 w-24 rounded-full" />
          <Box className="h-7 w-20 rounded-full" />
        </div>
        <Box className="mt-6 h-20 w-3/4" />
        <Box className="mt-6 h-16 w-full max-w-2xl" />
        <Box className="mt-14 aspect-[16/10] w-full rounded-[2rem]" />
        <div className="mt-20 grid gap-12 md:grid-cols-2">
          <Box className="h-40 w-full" />
          <Box className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
