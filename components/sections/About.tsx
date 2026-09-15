import Image from "next/image";
import { site } from "@/lib/site";

/**
 * About — portrait left, statement and facts right. Plain markup, no motion
 * machinery: the section reads top to bottom on anything.
 */

const FACTS = [
  { label: "Based", value: site.location },
  { label: "Role", value: site.role },
  { label: "Focus", value: "Platforms · Embedded · AI" },
  { label: "Status", value: "Open to new work" },
];

/** Every figure here is countable from the work in this portfolio. */
const FIGURES = [
  { value: "8", label: "Systems shipped" },
  { value: "4", label: "Database engines" },
  { value: "30+", label: "Technologies used" },
];

export default function About() {
  return (
    <section
      id="about"
      data-band="dark"
      className="scroll-mt-24 bg-ink px-6 py-24 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <p className="meta flex items-center gap-3 text-text-muted">
          <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
          01 — The person behind the work
        </p>

        <h2 className="text-display mt-6 text-[clamp(1.9rem,5.2vw,3.6rem)] text-primary">
          About me
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <div className="plate p-2.5">
              <Image
                src="/images/portrait.jpg"
                alt={`Portrait of ${site.name}`}
                width={1200}
                height={1500}
                sizes="(max-width: 1024px) 100vw, 34vw"
                className="aspect-4/5 w-full object-cover"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="meta text-text-muted">Kigali · RW</span>
              <span className="meta text-primary">
                {new Date().getFullYear()}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="text-editorial text-[clamp(1.5rem,3.8vw,2.8rem)] text-text-primary">
              <strong className="font-bold">I build</strong>{" "}
              <span className="font-light text-text-secondary">systems</span>{" "}
              <strong className="font-bold">where</strong>{" "}
              <span className="font-light text-text-secondary">software</span>{" "}
              <strong className="font-bold">meets</strong>{" "}
              <span className="font-light text-text-secondary">hardware.</span>
            </h3>

            <div className="mt-8 grid gap-6 text-pretty leading-relaxed text-text-secondary sm:grid-cols-2">
              <p>
                My work begins with the data. Before a screen exists there is a
                schema, a set of roles, and a clear idea of who needs to do
                what. That discipline came from starting with hardware, where a
                system either behaves correctly or visibly does not.
              </p>
              <p>
                Since then I have built web platforms, REST APIs,
                administrative dashboards and connected devices — React,
                Next.js and TypeScript on the front, Node, Laravel and PHP
                behind them, over PostgreSQL, MySQL and SQLite.
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FACTS.map((f) => (
                <div key={f.label} className="plate h-full px-4 py-3.5">
                  <dt className="meta text-text-muted">{f.label}</dt>
                  <dd className="mt-2.5 text-sm leading-snug text-text-primary">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-8">
              {FIGURES.map((f) => (
                <div key={f.label}>
                  <p className="text-display text-[clamp(1.8rem,4vw,2.8rem)] text-primary">
                    {f.value}
                  </p>
                  <p className="meta mt-2.5 text-text-muted">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
