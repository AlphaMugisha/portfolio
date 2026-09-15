import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { site } from "@/lib/site";

/**
 * Hero — one light panel, one big statement, two doors.
 *
 * The porcelain band carries the site's identity: dark type only (the cyan
 * accent fails contrast on this fill, so it never appears here). Everything
 * is static and server-rendered; the page opens instantly.
 */

const DISCIPLINES = ["Software", "Hardware", "Applied AI"];

export default function Hero() {
  return (
    <section
      id="hero"
      data-band="light"
      className="bg-band-light px-6 pb-16 pt-32 text-on-band sm:px-10 sm:pb-20 sm:pt-40"
    >
      <div className="mx-auto max-w-5xl">
        <p className="meta text-on-band-muted">
          {site.name} — {site.location}
        </p>

        <h1 className="text-mega mt-6 text-[clamp(3rem,12vw,9rem)]">
          Software
          <br />
          Engineer
        </h1>

        <p className="mt-8 max-w-xl text-pretty text-lg leading-relaxed text-on-band-muted">
          {site.tagline} I build web platforms, embedded electronics and
          applied AI systems from {site.location}.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="#projects"
            className="btn-depth inline-flex items-center gap-2.5 rounded-sm bg-on-band px-6 py-3.5 text-sm font-medium text-band-light"
          >
            See my work
            <ArrowDown size={15} aria-hidden="true" />
          </Link>
          <Link
            href="#contact"
            className="btn-depth inline-flex items-center rounded-sm border border-line-band px-6 py-3.5 text-sm font-medium text-on-band"
          >
            Get in touch
          </Link>
        </div>

        <ul className="mt-14 flex flex-wrap gap-x-8 gap-y-2 border-t border-line-band pt-6">
          {DISCIPLINES.map((d) => (
            <li key={d} className="meta text-on-band-muted">
              {d}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
