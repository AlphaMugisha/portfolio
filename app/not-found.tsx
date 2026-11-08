import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p
        aria-hidden="true"
        className="pointer-events-none absolute select-none font-display text-[28vw] font-semibold leading-none tracking-tighter text-text/[0.04]"
      >
        404
      </p>

      <div className="relative">
        <p className="note note-signal">Open circuit</p>
        <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight text-text md:text-7xl">
          No trace to this page
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-text-muted">
          Nothing is routed to this address. It may have moved, or it may never have existed.
        </p>

        {/* The label is wrapped: `.btn` lifts its element children above
            the fill that wipes up on hover, and a bare text node cannot
            be raised, so it would be painted over. */}
        <Link href="/" className="btn btn-signal group mt-10" data-cursor-label="Home">
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
          />
          <span>Back to the board</span>
        </Link>
      </div>
    </section>
  );
}
