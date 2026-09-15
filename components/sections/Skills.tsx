import TechIcon from "@/components/ui/TechIcon";
import { skillGroups } from "@/lib/skills";

/**
 * Skills — four plain group cards. Each chip's `title` says what the
 * technology is used for; there are no proficiency bars because any number
 * on them would be invented.
 */
export default function Skills() {
  return (
    <section
      id="skills"
      data-band="dark"
      className="scroll-mt-24 bg-ink px-6 py-24 sm:px-10 sm:py-28"
    >
      <div className="mx-auto max-w-5xl">
        <p className="meta flex items-center gap-3 text-text-muted">
          <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
          02 — What I do
        </p>

        <h2 className="text-display mt-6 text-[clamp(1.9rem,5.2vw,3.6rem)] text-text-primary">
          My <span className="text-primary">expertise</span>
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {skillGroups.map((group) => (
            <article key={group.id} className="plate p-6 sm:p-7">
              <div className="flex items-baseline justify-between">
                <span className="meta text-primary">{group.index}</span>
                <span className="meta text-text-muted">
                  {group.skills.length} tools
                </span>
              </div>

              <h3 className="text-display mt-4 text-2xl text-text-primary">
                {group.title}
              </h3>

              <p className="mt-3 text-pretty text-sm leading-relaxed text-text-secondary">
                {group.blurb}
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {group.skills.map((s) => (
                  <li
                    key={s.name}
                    title={s.detail}
                    className="plate flex items-center gap-2 px-3 py-1.5 text-[11px] text-text-secondary"
                  >
                    <TechIcon name={s.name} size={12} />
                    {s.name}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
