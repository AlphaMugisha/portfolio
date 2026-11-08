import SectionHeading from "@/components/ui/SectionHeading";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Icon from "@/components/ui/Icon";
import type { CapabilityRow, SectionRow } from "@/types/database";

export default function Capabilities({
  section,
  capabilities,
}: {
  section: SectionRow;
  capabilities: CapabilityRow[];
}) {
  return (
    <section id="what-i-do" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading section={section} index="02" />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <ScrollReveal key={c.id} delay={(i % 3) * 0.08}>
              <div className="panel lift h-full p-7">
                <span className="panel-marks" />
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center border border-rule text-signal">
                    <Icon name={c.icon} size={20} />
                  </span>
                  <span className="font-mono text-xs text-text-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-text">{c.title}</h3>
                <p className="mt-3 leading-relaxed text-text-muted">{c.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
