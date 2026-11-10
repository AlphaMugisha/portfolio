"use client";

import Image from "next/image";
import { chapters } from "@/lib/chapters";
import { site } from "@/lib/site";
import { environments } from "@/lib/world";
import type { SiteSettingsRow } from "@/types/database";

/**
 * The drive, without the drive.
 *
 * Shown when WebGL is unavailable or the visitor has asked for reduced
 * motion. It is not a notice and not a stub: every chapter, every
 * roadside marker and the portrait are here as a document, in the same
 * order the car meets them. Nothing animates and nothing is hidden
 * behind an interaction.
 *
 * It stops where the drive stops. The record, the toolbox, the
 * progression and the contact block are plain DOM that every visitor
 * gets, so repeating the projects here would print them twice.
 */
export default function DriveFallback({ settings }: { settings: SiteSettingsRow }) {
  const byId = Object.fromEntries(chapters.map((c) => [c.id, c]));
  const name = settings.name ?? site.name;

  return (
    <div className="relative">
      <header className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 pt-40 sm:px-12 md:grid-cols-[1.4fr_1fr] md:items-end lg:px-20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-signal">
            {site.role} · {site.location}
          </p>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,8vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.045em] text-text">
            Still learning.
            <br />
            Already <span className="text-signal">building</span>.
          </h1>
          <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-text-muted">
            {site.description}
          </p>
        </div>

        <figure className="relative">
          <div className="relative aspect-[3/4] w-full max-w-xs overflow-hidden">
            <Image
              src="/images/portrait.jpg"
              alt={name}
              fill
              sizes="(max-width: 768px) 80vw, 24vw"
              className="object-cover"
              priority
            />
          </div>
          <span aria-hidden="true" className="absolute -left-3 top-0 h-full w-px bg-signal/70" />
          <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.28em] text-text-subtle">
            {name}
          </figcaption>
        </figure>
      </header>

      {environments.map((env) => (
        <section
          key={env.id}
          className="border-t border-rule px-6 py-20 sm:px-12 lg:px-20"
          aria-label={env.name}
        >
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-signal">
              {env.index}
              <span className="ml-3 text-text-subtle">{env.name}</span>
            </p>
            <p className="mt-3 max-w-lg text-[14px] text-text-subtle">{env.caption}</p>

            {env.chapters.map((id) => {
              const c = byId[id];
              if (!c) return null;
              const support = (c.support ?? []).filter(Boolean);
              return (
                <article key={id} id={id} className="mt-14 scroll-mt-28">
                  <h2 className="font-display text-[clamp(2rem,5.5vw,4.2rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-text">
                    {c.statement.join(" ")}
                  </h2>
                  {support.length ? (
                    <div className="mt-6 max-w-2xl space-y-3">
                      {support.map((line, i) => (
                        <p key={i} className="text-[15px] leading-relaxed text-text-muted">
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}

            {env.hotspots.length ? (
              <dl className="mt-14 grid gap-10 sm:grid-cols-2">
                {env.hotspots.map((h) => (
                  <div key={h.id}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.28em] text-lime">
                      {h.label}
                    </dt>
                    <p className="mt-2 font-display text-xl font-semibold tracking-tight text-text">
                      {h.title}
                    </p>
                    <dd className="mt-2 text-[14px] leading-relaxed text-text-muted">{h.body}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

          </div>
        </section>
      ))}

    </div>
  );
}
