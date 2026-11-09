"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { chapters } from "@/lib/chapters";
import { site } from "@/lib/site";
import { DRIVE_VH, FOREST_INDEX, environments, envAt, envStart } from "@/lib/world";
import type { LiveSpot } from "./Hotspots";
import type { CameraMode } from "./WorldScene";
import DriveFallback from "./DriveFallback";
import type { ProjectRow } from "@/types/database";
import type { SiteSettingsRow } from "@/types/database";
import { ChapterBlock } from "./ChapterType";

/**
 * Section 01 — the opening experience.
 *
 * A single scroll drives a car down one road through five
 * environments. This file is everything that is not the 3D world: the
 * scroll maths, the typography layered over the drive, and the
 * controls that make the world answer back.
 *
 * Scroll is handled in one rAF loop that writes opacity and transform
 * straight to the DOM nodes and the shared progress ref. React state
 * changes only when something a person can name changes — the current
 * environment, the open panel, the camera. A setState per scroll event
 * would re-render a tree with a WebGL canvas in it sixty times a
 * second, which is the difference between this running and this
 * stuttering.
 */

const WorldScene = dynamic(() => import("./WorldScene"), { ssr: false });

const CAMERAS: { id: CameraMode; label: string; hint: string }[] = [
  { id: "chase", label: "Chase", hint: "Behind the car" },
  { id: "cinema", label: "Cinema", hint: "Tracking from the side" },
  { id: "drone", label: "Drone", hint: "High and wide" },
];

const FINISHES = [
  { id: "graphite", label: "Graphite", hex: "#333333" },
  { id: "signal", label: "Signal", hex: "#feb002" },
  { id: "lime", label: "Lime", hex: "#8fdc3c" },
];

/**
 * Where each chapter plays. Chapters are assigned to environments in
 * `lib/world.ts`; inside an environment they split its stretch of road
 * evenly, so the type is paced by the drive rather than the other way
 * round.
 */
const WINDOWS: Record<string, [number, number]> = (() => {
  const out: Record<string, [number, number]> = {};
  const span = 1 / environments.length;
  environments.forEach((env, i) => {
    env.chapters.forEach((id, j) => {
      const w = span / env.chapters.length;
      out[id] = [i * span + j * w, i * span + (j + 1) * w];
    });
  });
  return out;
})();

/**
 * How legible a chapter is at scroll position `p`.
 *
 * The window is padded past its own range so that neighbours overlap
 * and cross-fade. Without the padding every boundary was a frame where
 * the outgoing chapter had just reached zero and the incoming had not
 * started — the page went blank at each hand-over.
 *
 * The first and last chapters hold open at their outer edge, because
 * landing on the site at scroll zero and finding an empty world is
 * the worst thing this page could do.
 */
function envelope(p: number, [a, b]: [number, number], isFirst = false, isLast = false) {
  if (p <= a || p >= b) return 0;
  const local = (p - a) / (b - a);
  // Short, quick edges. Overlapping the windows so neighbours
  // cross-fade was worse, not better: two statements at this size, set
  // to opposite margins, simply land on top of each other. A clean
  // hand-over with a brief gap reads as a cut; a cross-fade reads as a
  // bug.
  const edge = 0.16;
  let o = 1;
  if (!isFirst && local < edge) o = local / edge;
  if (!isLast && local > 1 - edge) o = Math.min(o, (1 - local) / edge);
  return o;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function hasWebGL() {
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Drive({
  settings,
  projects,
}: {
  settings: SiteSettingsRow;
  projects: ProjectRow[];
}) {
  const container = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const blocks = useRef<Record<string, HTMLDivElement | null>>({});
  const portrait = useRef<HTMLDivElement>(null);
  const railFill = useRef<HTMLSpanElement>(null);

  const [ready, setReady] = useState<null | boolean>(null);
  const [envIndex, setEnvIndex] = useState(0);
  const [open, setOpen] = useState<LiveSpot | null>(null);
  const [carOpen, setCarOpen] = useState(false);
  const [camera, setCamera] = useState<CameraMode>("chase");
  const [lampsManual, setLampsManual] = useState<boolean | null>(null);
  const [finish, setFinish] = useState(FINISHES[0]);
  const [passing, setPassing] = useState<string | null>(null);

  /* ---- what can be clicked out there ---- */
  const spots: LiveSpot[] = useMemo(() => {
    const span = 1 / environments.length;
    const out: LiveSpot[] = [];

    environments.forEach((env, i) => {
      env.hotspots.forEach((h) => {
        out.push({ ...h, t: (i + h.at) * span, env: i, kind: "info" });
      });
    });

    // The project portals. Generated from the real project records, so
    // adding a project in the admin puts a new monolith on the road.
    projects.forEach((p, j) => {
      const at = (j + 0.6) / (projects.length + 0.2);
      out.push({
        id: `project-${p.slug}`,
        at,
        side: j % 2 === 0 ? 16.5 : -16.5,
        form: "marker",
        label: `Project ${String(j + 1).padStart(2, "0")} · ${p.year}`,
        title: p.name,
        body: p.summary,
        href: `/projects/${p.slug}`,
        t: (FOREST_INDEX + at) * span,
        env: FOREST_INDEX,
        kind: "portal",
      });
    });

    return out.sort((a, b) => a.t - b.t);
  }, [projects]);

  const portals = useMemo(() => spots.filter((s) => s.kind === "portal"), [spots]);

  /* ---- capability check, once, on the client ---- */
  useEffect(() => {
    setReady(hasWebGL() && !prefersReducedMotion());
  }, []);

  /* ---- the scroll loop ---- */
  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    let lastEnv = -1;
    let lastPassing: string | null = null;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const el = container.current;
      if (!el) return;

      const top = el.offsetTop;
      const span = el.offsetHeight - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, (window.scrollY - top) / span)) : 0;
      progress.current = p;

      if (railFill.current) railFill.current.style.transform = `scaleX(${p})`;

      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const node = blocks.current[chapter.id];
        const win = WINDOWS[chapter.id];
        if (!node || !win) continue;
        const o = envelope(p, win, i === 0, i === chapters.length - 1);
        node.style.opacity = String(o);
        node.style.pointerEvents = o > 0.6 ? "auto" : "none";
        // A small counter-drift, so the type does not feel pinned to
        // the glass while the world moves underneath it.
        const local = (p - win[0]) / (win[1] - win[0]);
        node.style.transform = `translate3d(0, ${(0.5 - local) * 46}px, 0)`;
      }

      // The portrait holds only over the very first stretch of road.
      if (portrait.current) {
        const o = envelope(p, [0, 0.085], true);
        portrait.current.style.opacity = String(o);
        portrait.current.style.transform = `translate3d(0, ${(1 - o) * 40}px, 0) scale(${0.96 + o * 0.04})`;
      }

      const { index } = envAt(p);
      if (index !== lastEnv) {
        lastEnv = index;
        setEnvIndex(index);
      }

      // "Now passing" — only inside the forest, and only when a portal
      // is genuinely alongside.
      let near: string | null = null;
      if (index === FOREST_INDEX) {
        for (const portal of portals) {
          if (Math.abs(portal.t - p) < 0.013) near = portal.title;
        }
      }
      if (near !== lastPassing) {
        lastPassing = near;
        setPassing(near);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, portals]);

  /* ---- escape closes whatever is open ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setCarOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goTo = useCallback((fraction: number) => {
    const el = container.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + span * fraction, behavior: "smooth" });
  }, []);

  const openSpot = useCallback((s: LiveSpot) => {
    setCarOpen(false);
    setOpen(s);
  }, []);

  const env = environments[envIndex];
  const lamps = lampsManual ?? env.lamps;

  /* Reduced motion, or no WebGL: the same content, laid out as a
     document. Not a placeholder — every chapter, every project and the
     portrait are all there. */
  if (ready === false) {
    return <DriveFallback settings={settings} projects={projects} />;
  }

  return (
    <section ref={container} style={{ height: `${DRIVE_VH}vh` }} className="relative">
      {/* Anchors, so the chapter menu still resolves to a position on
          the road. Zero height, pinned at each chapter's fraction. */}
      {chapters.map((c) => {
        const win = WINDOWS[c.id];
        return (
          <span
            key={c.id}
            id={c.id}
            aria-hidden="true"
            className="absolute left-0 h-0 w-0"
            style={{ top: `${(win ? win[0] : 0) * 100}%` }}
          />
        );
      })}

      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink">
        {ready ? (
          <div className="absolute inset-0">
            <WorldScene
              progress={progress}
              spots={spots}
              openId={open?.id ?? null}
              onOpenSpot={openSpot}
              onOpenCar={() => {
                setOpen(null);
                setCarOpen(true);
              }}
              onMiss={() => {
                setOpen(null);
                setCarOpen(false);
              }}
              mode={camera}
              weather={env.weather}
              lamps={lamps}
              paint={finish.hex}
              detail={1}
            />
          </div>
        ) : null}

        {/* Scrim. Ink at both edges, clear through the middle, so the
            world is never behind a panel but the type always holds —
            including over snow, which is the hardest case. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(14,14,14,0.78) 0%, rgba(14,14,14,0.18) 22%, rgba(14,14,14,0) 48%, rgba(14,14,14,0.42) 78%, rgba(14,14,14,0.92) 100%)",
          }}
        />

        {/* ---------- the words ---------- */}
        <div className="pointer-events-none absolute inset-0">
          {chapters.map((chapter) => (
            <ChapterBlock
              key={chapter.id}
              chapter={chapter}
              nodeRef={(el) => {
                blocks.current[chapter.id] = el;
              }}
            >
              {chapter.id === "connect" ? <ConnectLinks /> : null}
            </ChapterBlock>
          ))}
        </div>

        {/* ---------- the portrait ---------- */}
        <Portrait nodeRef={portrait} name={settings.name ?? site.name} />

        {/* ---------- readout ----------
            Carries its own soft vignette. The page scrim is tuned for
            the type in the middle of the frame, and over a snowfield
            or a noon sky this corner was reading as grey on white. */}
        <div className="pointer-events-none absolute left-0 top-16 w-[22rem] max-w-[70vw] px-6 py-6 sm:px-12 lg:px-20">
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 90% at 12% 40%, rgba(14,14,14,0.86) 0%, rgba(14,14,14,0.5) 48%, transparent 78%)",
            }}
          />
          <div className="relative">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal">
              {env.index} / {String(environments.length).padStart(2, "0")}
            </p>
            <p className="mt-2 font-display text-lg font-semibold tracking-tight text-text">
              {env.name}
            </p>
            <p className="mt-1 max-w-[15rem] text-[12px] leading-snug text-text-muted">
              {env.caption}
            </p>
          </div>
        </div>

        {/* ---------- now passing ---------- */}
        <div
          className="pointer-events-none absolute left-1/2 top-[18vh] -translate-x-1/2 text-center transition-opacity duration-500"
          style={{ opacity: passing ? 1 : 0 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-lime">Now passing</p>
          <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-text">
            {passing ?? " "}
          </p>
        </div>

        {/* ---------- environment switcher ---------- */}
        <nav
          aria-label="Environments"
          className="absolute bottom-16 left-6 flex flex-col gap-1 sm:left-12 lg:left-20"
        >
          {environments.map((e, i) => {
            const current = i === envIndex;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => goTo(envStart(i))}
                aria-current={current ? "true" : undefined}
                className={`group flex items-center gap-3 py-1 text-left font-mono text-[10px] uppercase tracking-[0.22em] transition-colors ${
                  current ? "text-signal" : "text-text-subtle hover:text-text"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`block h-px transition-all duration-500 ${
                    current ? "w-9 bg-signal" : "w-4 bg-rule-strong group-hover:w-7"
                  }`}
                />
                <span className="hidden sm:inline">{e.name}</span>
                <span className="sm:hidden">{current ? e.name : e.index}</span>
              </button>
            );
          })}
        </nav>

        {/* ---------- camera ---------- */}
        <div className="absolute bottom-20 right-6 flex flex-col items-end gap-1 sm:right-12 lg:right-20">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-subtle">
            Camera
          </span>
          {CAMERAS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCamera(c.id)}
              aria-pressed={camera === c.id}
              title={c.hint}
              className={`font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                camera === c.id ? "text-signal" : "text-text-subtle hover:text-text"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ---------- hint ---------- */}
        <p
          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-text-subtle transition-opacity duration-700"
          style={{ opacity: open || carOpen ? 0 : 0.85 }}
        >
          <span className="hidden sm:inline">
            Scroll to drive · click the car, or anything that glows
          </span>
          <span className="sm:hidden">Scroll to drive · tap what glows</span>
        </p>

        {/* ---------- progress rail ---------- */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
          <span ref={railFill} className="block h-full origin-left scale-x-0 bg-signal" />
        </span>

        {/* ---------- keyboard route into the world ----------
            The installations are 3D meshes, which no keyboard can
            reach. These are the same objects as real buttons: hidden
            until focused, then visible, in road order. */}
        <div className="absolute left-0 top-0 z-30">
          {spots.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                goTo(Math.max(0, s.t - 0.012));
                openSpot(s);
              }}
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-20 focus:z-50 focus:border focus:border-signal focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:uppercase focus:tracking-[0.2em] focus:text-signal"
            >
              Drive to {s.title}
            </button>
          ))}
        </div>

        {/* ---------- panels ---------- */}
        {open ? <SpotPanel spot={open} onClose={() => setOpen(null)} /> : null}
        {carOpen ? (
          <CarPanel
            lamps={lamps}
            onLamps={() => setLampsManual(!lamps)}
            finish={finish}
            onFinish={setFinish}
            onClose={() => setCarOpen(false)}
          />
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/**
 * The portrait moment.
 *
 * A real photograph — `public/images/portrait.jpg`, the one committed
 * to this repository. Not a stock person and not generated. It is
 * held for the first stretch of the mountain road and then released;
 * the frame is a hairline, not a card.
 */
function Portrait({
  nodeRef,
  name,
}: {
  nodeRef: React.RefObject<HTMLDivElement | null>;
  name: string;
}) {
  return (
    <div
      ref={nodeRef}
      aria-hidden="true"
      className="pointer-events-none absolute right-5 top-[15%] opacity-0 sm:right-12 md:top-1/2 md:-translate-y-1/2 lg:right-20"
      style={{ willChange: "opacity, transform" }}
    >
      <figure className="relative w-[5.5rem] sm:w-[9rem] md:w-[clamp(12rem,20vw,19rem)]">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src="/images/portrait.jpg"
            alt={name}
            fill
            sizes="(max-width: 768px) 144px, 22vw"
            className="object-cover"
            priority
          />
          {/* Grade it into the drive rather than letting it sit on top. */}
          <span
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(14,14,14,0.72) 0%, rgba(14,14,14,0) 52%)",
            }}
          />
        </div>
        <span aria-hidden="true" className="absolute -left-3 top-0 h-full w-px bg-signal/70" />
        <figcaption className="mt-3 hidden font-mono text-[10px] uppercase tracking-[0.28em] text-text-subtle md:block">
          {name}
          <span className="ml-2 text-signal">{site.location}</span>
        </figcaption>
      </figure>
    </div>
  );
}

function ConnectLinks() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[12px] uppercase tracking-[0.2em]">
      <a className="text-signal transition-colors hover:text-signal-bright" href={`mailto:${site.email}`}>
        {site.email}
      </a>
      <a
        className="text-text-muted transition-colors hover:text-signal"
        href={site.github}
        target="_blank"
        rel="noreferrer noopener"
      >
        GitHub
      </a>
      {site.linkedin ? (
        <a
          className="text-text-muted transition-colors hover:text-signal"
          href={site.linkedin}
          target="_blank"
          rel="noreferrer noopener"
        >
          LinkedIn
        </a>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Shared chrome for an opened object. Edge-anchored, hairline, no box. */
function Panel({
  label,
  title,
  onClose,
  children,
}: {
  label: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    first.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-label={title}
      className="absolute inset-y-0 right-0 z-40 flex w-full max-w-md flex-col justify-center border-l border-signal/40 bg-ink/92 px-7 py-16 backdrop-blur-xl sm:px-10"
      style={{ animation: "panel-in 0.42s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <button
        ref={first}
        type="button"
        onClick={onClose}
        className="absolute right-6 top-24 font-mono text-[10px] uppercase tracking-[0.28em] text-text-subtle transition-colors hover:text-signal"
      >
        Close
      </button>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal">{label}</p>
      <h3 className="mt-4 font-display text-[clamp(1.6rem,3.2vw,2.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-text">
        {title}
      </h3>
      <span aria-hidden="true" className="mt-6 block h-px w-14 bg-signal/60" />
      {children}
    </div>
  );
}

function SpotPanel({ spot, onClose }: { spot: LiveSpot; onClose: () => void }) {
  return (
    <Panel label={spot.label} title={spot.title} onClose={onClose}>
      <p className="mt-6 text-[15px] leading-relaxed text-text-muted">{spot.body}</p>
      {spot.href ? (
        spot.href.startsWith("mailto:") ? (
          <a
            href={spot.href}
            className="mt-8 inline-block font-mono text-[11px] uppercase tracking-[0.22em] text-signal transition-colors hover:text-signal-bright"
          >
            Write to Alpha →
          </a>
        ) : (
          <Link
            href={spot.href}
            className="mt-8 inline-block font-mono text-[11px] uppercase tracking-[0.22em] text-signal transition-colors hover:text-signal-bright"
          >
            Open the case study →
          </Link>
        )
      ) : null}
    </Panel>
  );
}

/**
 * The vehicle panel.
 *
 * Reachable by clicking the car. It says what the car actually is —
 * geometry generated at runtime, no downloaded model — because
 * claiming otherwise would be the easiest lie on this page to tell.
 */
function CarPanel({
  lamps,
  onLamps,
  finish,
  onFinish,
  onClose,
}: {
  lamps: boolean;
  onLamps: () => void;
  finish: (typeof FINISHES)[number];
  onFinish: (f: (typeof FINISHES)[number]) => void;
  onClose: () => void;
}) {
  return (
    <Panel label="The vehicle" title="Built in code, not imported" onClose={onClose}>
      <p className="mt-6 text-[15px] leading-relaxed text-text-muted">
        No model file was downloaded for this. The bodywork is a side profile drawn with bezier
        curves and extruded across the car&apos;s width with a deep bevel; the cabin is a second,
        narrower profile sitting on that beltline. Everything you can see is generated in the
        browser when the page loads.
      </p>

      <div className="mt-9 space-y-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-subtle">
            Headlights
          </p>
          <button
            type="button"
            onClick={onLamps}
            aria-pressed={lamps}
            className="mt-2 font-mono text-[12px] uppercase tracking-[0.22em] text-signal transition-colors hover:text-signal-bright"
          >
            {lamps ? "On — switch off" : "Off — switch on"}
          </button>
          <p className="mt-2 text-[12px] leading-snug text-text-subtle">
            They come on by themselves in the mountains, the rain and at dusk.
          </p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-subtle">
            Finish
          </p>
          <div className="mt-3 flex gap-3">
            {FINISHES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFinish(f)}
                aria-pressed={finish.id === f.id}
                aria-label={f.label}
                title={f.label}
                className={`h-8 w-8 border transition-transform hover:scale-110 ${
                  finish.id === f.id ? "border-signal" : "border-rule-strong"
                }`}
                style={{ backgroundColor: f.hex }}
              />
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-snug text-text-subtle">
            Three finishes, all from the site palette — graphite, {" "}
            <span className="text-signal">#FEB002</span> and{" "}
            <span className="text-lime">#8FDC3C</span>.
          </p>
        </div>
      </div>
    </Panel>
  );
}
