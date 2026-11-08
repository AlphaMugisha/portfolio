import SectionHeading from "@/components/ui/SectionHeading";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Icon from "@/components/ui/Icon";
import type { BeyondHighlightRow, SectionRow } from "@/types/database";

export default function Beyond({
  section,
  highlights,
}: {
  section: SectionRow;
  highlights: BeyondHighlightRow[];
}) {
  return (
    <section id="beyond" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading section={section} index="07" />

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {highlights.map((h, i) => (
            <ScrollReveal key={h.id} delay={i * 0.08}>
              <div className="panel h-full p-7">
                <span className="panel-marks" />
                <Icon name={h.icon} size={22} className="text-signal" />
                <h3 className="mt-5 font-display text-lg font-semibold text-text">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{h.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
