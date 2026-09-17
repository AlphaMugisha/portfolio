import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Even the dead end is a place in the room, not a blank page. */}
      <span
        aria-hidden="true"
        className="text-mega pointer-events-none absolute select-none whitespace-nowrap text-ghost/70"
        style={{
          fontSize: "min(40svh, 30vw)",
          lineHeight: 0.86,
          transform: "scaleX(1.726)",
        }}
      >
        404
      </span>

      <p className="eyebrow relative mb-6 block">Error 404</p>

      <h1 className="text-display relative text-[clamp(2.5rem,10vw,6rem)] text-text-primary">
        Page not found
      </h1>

      <p className="relative mt-6 max-w-md text-pretty leading-relaxed text-text-secondary">
        The page you are looking for does not exist or may have been moved.
      </p>

      <Link
        href="/"
        className="btn-depth group relative mt-10 inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-on-primary hover:bg-primary-hover"
      >
        <ArrowLeft
          size={14}
          className="transition-transform duration-300 group-hover:-translate-x-0.5"
        />
        Back to start
      </Link>
    </section>
  );
}
