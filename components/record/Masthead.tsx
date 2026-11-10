import Reveal from "@/components/ui/Reveal";

/**
 * A section opening.
 *
 * Index, a rule that runs to the edge of the measure, a title, and one
 * line that says what you are looking at. The rule is not decoration:
 * it is the thing that makes four different sections read as pages of
 * the same document rather than four separate designs.
 */
export default function Masthead({
  index,
  title,
  lead,
  note,
  id,
}: {
  index: string;
  title: string;
  lead: string;
  /** Small print under the lead — usually where the numbers came from. */
  note?: string;
  id?: string;
}) {
  return (
    <header id={id} className="scroll-mt-28">
      <Reveal variant="rise">
        <div className="flex items-baseline gap-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-signal">
            {index}
          </span>
          <span aria-hidden="true" className="h-px flex-1 bg-rule-strong" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-subtle">
            {title}
          </span>
        </div>

        <p className="mt-10 max-w-3xl font-display text-[clamp(1.9rem,4.2vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-text">
          {lead}
        </p>

        {note ? (
          <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-text-muted">{note}</p>
        ) : null}
      </Reveal>
    </header>
  );
}
