import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow mb-6 block">Error 404</p>

      <h1 className="text-display text-[clamp(2.5rem,10vw,6rem)] text-text-primary">
        Page not found
      </h1>

      <p className="mt-6 max-w-md text-pretty leading-relaxed text-text-secondary">
        The page you are looking for does not exist or may have been moved.
      </p>

      <Link
        href="/"
        className="group mt-10 inline-flex items-center gap-2.5 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover"
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
