import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p
        aria-hidden="true"
        className="pointer-events-none absolute select-none font-display text-[28vw] font-bold leading-none tracking-tighter text-white/[0.04]"
      >
        404
      </p>
      <div className="relative">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight text-text md:text-7xl">
          Page not found
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-text-muted">
          The page you are looking for does not exist, or may have been moved.
        </p>
        <Link href="/" className="btn btn-signal mt-10">
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back to start
        </Link>
      </div>
    </section>
  );
}
