import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { mediaUrl } from "@/lib/supabase/env";
import type { SectionRow, SiteSettingsRow } from "@/types/database";

/**
 * The one porcelain moment on the page: a lit, paper-bright panel for the
 * bio, set against the ink canvas everywhere else. Reserved for this
 * section specifically because introducing yourself is the one place a
 * warmer, closer surface earns its keep.
 */
export default function About({
  section,
  settings,
}: {
  section: SectionRow;
  settings: SiteSettingsRow;
}) {
  const paragraphs = settings.about_body_md.split("\n\n").filter(Boolean);

  return (
    <section id="about" className="relative px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading section={section} index="01" />

        <div className="band-porcelain panel-tight panel mt-12 overflow-hidden">
          <span className="panel-marks" />
          <div className="grid gap-10 p-8 md:grid-cols-[220px_1fr] md:p-12">
            <div className="relative aspect-square w-full overflow-hidden border border-black/15 md:w-[220px]">
              <Image
                src={mediaUrl(settings.portrait_path)}
                alt={settings.portrait_alt}
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>
            <div className="space-y-5">
              {paragraphs.map((p, i) => (
                <ScrollReveal key={i} delay={i * 0.06}>
                  <p className="text-lg leading-relaxed text-porcelain-ink/80">{p}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
