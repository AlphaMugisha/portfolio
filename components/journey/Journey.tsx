"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { ChapterBlock, ProjectReveal } from "./ChapterType";
import JourneyFallback from "./JourneyFallback";
import { chapters, CHAPTER_RANGES, JOURNEY_VH, localProgress } from "@/lib/chapters";
import type { ShotName } from "./shots";
import type { ProjectRow, SiteSettingsRow } from "@/types/database";

/**
 * The whole site, as one scroll.
 *
 * A tall scroll container with a sticky viewport inside it. The
 * container's height is what the wheel actually moves through; the
 * sticky layer holds the 3D world and the typography and never
 * scrolls itself. One number — progress, 0 to 1 — drives everything,
 * so scrolling back is simply the same function evaluated in reverse.
 *
 * Nothing here re-renders while you scroll. The loop writes opacity,
 * transform and pointer-events straight to the DOM nodes it collected
 * on mount, and hands the same `progress` ref to the 3D scene, which
 * reads it inside its own frame loop. React runs once.
 *
 * WebGL is optional throughout: the scene is a lazy chunk, and
 * anything that cannot or should not run it gets `JourneyFallback` —
 * the same chapters, the same typography, over a 2D environment.
 */

const JourneyScene = dynamic(() => import("./JourneyScene"), {
  ssr: false,
  loading: () => null,
});

const SHOTS = chapters.map((c) => c.shot) as ShotName[];

function canRunThree(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.innerWidth < 700) return false;

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  if (coarse && (cores <= 4 || memory <= 4)) return false;

  try {
    const probe = document.createElement("canvas");
    const gl = (probe.getContext("webgl2") ||
      probe.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Fade in, hold, fade out — except at the two ends of the journey.
 *
 * The first chapter must NOT fade in: at scroll position zero its
 * local progress is also zero, so a symmetric envelope opened the site
 * on an empty screen. The last chapter must not fade out for the
 * mirror-image reason — scrolling to the very bottom would dismiss the
 * contact details just as the visitor arrived at them.
 */
function envelope(local: number, isFirst: boolean, isLast: boolean): number {
  const inEdge = 0.16;
  const outEdge = 0.82;
  let o = 1;
  if (!isFirst && local < inEdge) o = local / inEdge;
  if (!isLast && local > outEdge) {
    o = Math.min(o, Math.max(0, 1 - (local - outEdge) / (1 - outEdge)));
  }
  return o;
}

export default function Journey({
  settings,
  projects,
}: {
  settings: SiteSettingsRow;
  projects: ProjectRow[];
}) {
  const container = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const blocks = useRef<(HTMLDivElement | null)[]>([]);
  const revealRoot = useRef<HTMLDivElement | null>(null);
  const frames = useRef<(HTMLDivElement | null)[]>([]);
  const railFill = useRef<HTMLSpanElement>(null);
  const labelEl = useRef<HTMLSpanElement>(null);

  const [mode, setMode] = useState<"pending" | "three" | "flat">("pending");
  const activeLabel = useRef("");

  const projectIndex = chapters.findIndex((c) => c.id === "built");
  const featured = projects.filter((p) => p.is_featured).slice(0, 4);

  useEffect(() => {
    setMode(canRunThree() ? "three" : "flat");
  }, []);

  useEffect(() => {
    let raf = 0;

    const read = () => {
      raf = 0;
      const el = container.current;
      if (!el) return;

      const top = el.offsetTop;
      const travel = el.offsetHeight - window.innerHeight;
      const p = travel > 0 ? (window.scrollY - top) / travel : 0;
      const clamped = Math.min(1, Math.max(0, p));
      progress.current = clamped;

      // Chapters
      let current = chapters[0];
      for (let i = 0; i < chapters.length; i++) {
        const node = blocks.current[i];
        const local = localProgress(clamped, i);
        const [a, b] = CHAPTER_RANGES[i];
        const inside = clamped >= a && clamped <= b;
        if (inside) current = chapters[i];
        if (!node) continue;

        // The projects chapter hands over: its statement holds briefly,
        // then clears completely before the first cover arrives. Running
        // the normal envelope here left the statement sitting on top of
        // the project name and both were unreadable.
        const o = !inside
          ? 0
          : i === projectIndex
            ? Math.max(0, 1 - Math.max(0, (local - 0.13) / 0.11))
            : envelope(local, i === 0, i === chapters.length - 1);
        node.style.opacity = String(o);
        // A slow upward drift across the chapter's life. Small on
        // purpose: the camera is already moving, and two competing
        // parallaxes read as drift rather than intent.
        node.style.transform = `translate3d(0, ${(0.5 - local) * 44}px, 0)`;
        node.style.pointerEvents = o > 0.55 ? "auto" : "none";
      }

      // Project reveals: sub-ranges inside the projects chapter.
      if (revealRoot.current) {
        const local = localProgress(clamped, projectIndex);
        const [a, b] = CHAPTER_RANGES[projectIndex];
        const inside = clamped >= a && clamped <= b;
        // Starts only once the statement above has fully cleared.
        const k = Math.min(1, Math.max(0, (local - 0.26) / 0.74));

        // The LAYER's opacity is a short fade in and out — not `k`
        // itself. Binding it to `k` meant the covers sat at whatever
        // fraction of the chapter had elapsed, so every project title
        // rendered washed-out grey instead of solid.
        let rootO = 0;
        if (inside) {
          rootO = Math.min(1, k / 0.06);
          if (k > 0.94) rootO = Math.min(rootO, Math.max(0, (1 - k) / 0.06));
        }
        revealRoot.current.style.opacity = String(rootO);

        const n = featured.length || 1;
        frames.current.forEach((frame, i) => {
          if (!frame) return;
          const centre = (i + 0.5) / n;
          const d = Math.abs(k - centre);
          const width = 0.5 / n;
          const o = inside ? Math.max(0, 1 - d / width) : 0;
          frame.style.opacity = String(o);
          frame.style.transform = `scale(${1.04 - o * 0.04})`;
        });
      }

      // Progress rail + current label
      if (railFill.current) railFill.current.style.transform = `scaleX(${clamped})`;
      if (labelEl.current && activeLabel.current !== current.label) {
        activeLabel.current = current.label;
        labelEl.current.textContent = current.label;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [featured.length, projectIndex]);

  const contact = [
    { label: settings.email, href: `mailto:${settings.email}`, icon: null },
    ...(settings.github_url
      ? [{ label: "GitHub", href: settings.github_url, icon: <GithubIcon size={15} /> }]
      : []),
    ...(settings.linkedin_url
      ? [{ label: "LinkedIn", href: settings.linkedin_url, icon: <LinkedinIcon size={15} /> }]
      : []),
  ];

  return (
    <div ref={container} className="relative" style={{ height: `${JOURNEY_VH}vh` }}>
      {/*
        Anchor targets, one per chapter, pinned at that chapter's own
        offset down the scroll container. The journey has no sections to
        link to, so without these every link in the menu pointed at an
        id that no longer exists. They are zero-height and invisible —
        purely somewhere for `#meet`, `#built` and the rest to land, and
        they let the smooth-scroll handler move between chapters.
      */}
      {chapters.map((chapter, i) => (
        <span
          key={chapter.id}
          id={chapter.id}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 block h-px w-px"
          style={{ top: `${CHAPTER_RANGES[i][0] * 100}%` }}
        />
      ))}

      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* The world */}
        {mode === "three" ? (
          <JourneyScene progress={progress} shots={SHOTS} className="absolute inset-0" />
        ) : (
          <JourneyFallback progress={progress} className="absolute inset-0" />
        )}

        {/* The words */}
        {chapters.map((chapter, i) => (
          <ChapterBlock
            key={chapter.id}
            chapter={chapter}
            nodeRef={(el) => {
              blocks.current[i] = el;
            }}
          >
            {chapter.id === "connect" ? (
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                {contact.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    data-cursor-label="Open"
                    className="group inline-flex items-center gap-2 font-mono text-base text-text transition-colors hover:text-signal sm:text-xl"
                  >
                    {item.icon}
                    {item.label}
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                ))}
              </div>
            ) : null}
          </ChapterBlock>
        ))}

        {/* Project reveals, full bleed */}
        <ProjectReveal
          projects={featured}
          nodeRef={(el) => {
            revealRoot.current = el;
          }}
          frameRef={(el, i) => {
            frames.current[i] = el;
          }}
        />

        {/* The only chrome: a hairline, a label, a count. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-6 pb-6 sm:px-12 lg:px-20">
          <div className="mx-auto flex max-w-6xl items-center gap-5">
            <span
              ref={labelEl}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-subtle"
            >
              {chapters[0].label}
            </span>
            <span className="h-px flex-1 bg-rule">
              <span ref={railFill} className="block h-full origin-left scale-x-0 bg-signal" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-subtle">
              {String(chapters.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
