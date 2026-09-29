import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Even the dead end is a place in the room, not a blank page. */}
      <span
        aria-hidden="true"
        className="text-mega pointer-events-none absolute select-none whitespace-nowrap text-ghost/60"
        style={{ fontSize: "min(38svh, 26vw)" }}
      >
        404
      </span>

      <p className="eyebrow relative mb-6 block">Error 404</p>

      <h1 className="text-display relative text-[clamp(2.5rem,10vw,6rem)] text-text-primary">
        Page not found
      </h1>

      <p className="lead relative mt-8 max-w-md text-text-secondary">
        The page you are looking for does not exist or may have been moved.
      </p>

      <Link
        href="/"
        className="btn-depth label-ui group relative mt-12 inline-flex items-center gap-3 rounded-pill bg-primary px-8 py-4 text-on-primary hover:bg-primary-hover"
      >
        <ArrowLeft
          size={14}
          className="transition-transform duration-[400ms] ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:-translate-x-0.5"
        />
        Back to start
      </Link>
    </section>
  );
}
