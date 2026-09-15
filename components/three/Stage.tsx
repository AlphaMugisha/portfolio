"use client";

import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useCapability } from "@/components/ui/useCapability";

/**
 * The shell every WebGL scene on this site mounts inside.
 *
 * Three separate jobs, all of which are easy to get wrong once per scene rather
 * than right once here:
 *
 *  1. DECIDING WHETHER TO RENDER AT ALL. The canvas mounts only after the client
 *     has measured the device, and only if that device earned it. Everyone else
 *     gets `fallback` — which is a designed flat composition, not an empty box.
 *     Because the decision waits for measurement, the server render and the
 *     first paint always agree.
 *
 *  2. NOT RENDERING WHEN NOBODY IS LOOKING. The site has several of these and a
 *     browser will only give out a handful of WebGL contexts. An offscreen
 *     canvas drops to `frameloop="never"` and stops costing anything; it wakes
 *     when it scrolls back into view. Without this, three scenes animate
 *     continuously through a page the reader has long since scrolled past.
 *
 *  3. CLEANING UP. R3F disposes the objects it created for the scene graph, but
 *     the WebGL context itself lingers until GC, and on a page with several
 *     canvases that is how you exhaust the browser's limit. This releases it
 *     explicitly on unmount.
 *
 *  4. SURVIVING A SCENE THAT THROWS. `Suspense` catches a scene that is still
 *     loading; it does nothing for one that fails. A missing texture, a shader
 *     that will not compile on some driver, and the throw escalates out of the
 *     canvas and takes the whole page with it. The boundary below turns that
 *     into the same flat composition every non-WebGL device already gets.
 *
 * The canvas is transparent and sits behind the section's real markup, so the
 * type stays live DOM text — selectable, searchable, and readable to a screen
 * reader. Nothing that must be read is ever drawn into the canvas.
 */
export default function Stage({
  children,
  fallback,
  className = "",
  /** Camera field of view. Long lenses read as photographic; short ones as game engine. */
  fov = 35,
  /** Where the camera sits. Scenes are authored around the origin. */
  position = [0, 0, 6] as [number, number, number],
  /** Keep rendering while offscreen. Only for a scene that must not lose state. */
  alwaysRender = false,
  /** Orthographic projection. For scenes where perspective would distort the
      very proportions the design depends on. */
  orthographic = false,
  /** Called when the canvas goes away for any reason — the GPU taking the
      context back, or the scene throwing — so the section can restore its flat
      presentation rather than sitting behind a dead canvas. */
  onSceneLost,
  /** Element to read pointer events from. The canvases here are
      pointer-transparent so the DOM above them stays clickable; a scene that
      wants raycast hover hands in the section's own host element instead. */
  eventSource,
}: {
  children: ReactNode;
  /** What non-WebGL devices see. Required — there is no acceptable empty state. */
  fallback: ReactNode;
  className?: string;
  fov?: number;
  position?: [number, number, number];
  alwaysRender?: boolean;
  orthographic?: boolean;
  onSceneLost?: () => void;
  eventSource?: React.RefObject<HTMLElement | null>;
}) {
  const cap = useCapability();
  const hostRef = useRef<HTMLDivElement>(null);
  const [onscreen, setOnscreen] = useState(false);

  // Watch the host rather than the canvas: the host exists from first render,
  // so the observer is already reporting by the time the canvas mounts.
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOnscreen(entry.isIntersecting),
      // A margin so the scene is already warm by the time it is actually seen.
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [lost, setLost] = useState(false);
  const show = cap.ready && cap.render3D && !lost;

  return (
    <div ref={hostRef} className={className}>
      {show ? (
        <SceneBoundary fallback={fallback} onError={onSceneLost}>
          <Canvas
            // Never while offscreen; on demand under reduced motion, where the
            // scene should be lit and still rather than absent.
            frameloop={
              !onscreen && !alwaysRender
                ? "never"
                : cap.reducedMotion
                  ? "demand"
                  : "always"
            }
            dpr={cap.dpr}
            /* Colour is measured, so it must not be re-graded. R3F defaults to
               ACESFilmicToneMapping (events-*.esm.js:15903), which would quietly
               shift every named hex in the palette. `flat` selects
               NoToneMapping and the materials render at their stated values. */
            flat
            orthographic={orthographic}
            camera={
              orthographic
                ? { position: [0, 0, 1], near: -1, far: 1, zoom: 1 }
                : { fov, position, near: 0.1, far: 100 }
            }
            gl={{
              antialias: cap.tier === "high",
              alpha: true,
              powerPreference: "high-performance",
              // The page's own background shows through, so the canvas must not
              // paint one of its own.
              premultipliedAlpha: false,
            }}
            onCreated={({ gl }) => {
              gl.setClearAlpha(0);
              // R3F 9.7 ships no context-loss handling of its own. Without this a
              // lost context leaves a transparent canvas over whatever the scene
              // was hiding — which, in the hero, is a word whose ink has already
              // been turned off.
              gl.domElement.addEventListener(
                "webglcontextlost",
                (e) => {
                  e.preventDefault();
                  setLost(true);
                  onSceneLost?.();
                },
                { once: true }
              );
            }}
            style={{ pointerEvents: "none" }}
            // R3F narrows the ref type; ours carries the standard `| null`.
            {...(eventSource
              ? {
                  eventSource:
                    eventSource as unknown as React.RefObject<HTMLElement>,
                  eventPrefix: "client" as const,
                }
              : null)}
          >
            <ContextRelease />
            {/* R3F does not wrap children in Suspense, and anything that loads a
                texture suspends. Without a boundary that escalates out of the
                canvas and takes the section with it. */}
            <Suspense fallback={null}>{children}</Suspense>
          </Canvas>
        </SceneBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}

/**
 * Hands the WebGL context back when the scene unmounts.
 *
 * Lives inside the Canvas because that is the only place with access to the
 * renderer. Without it the context survives until garbage collection, and a
 * reader who scrolls the whole page can hold more live contexts than the
 * browser allows — at which point the oldest canvas silently goes black.
 */
function ContextRelease() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    return () => {
      // forceContextLoss is what actually hands the context back to the
      // browser; dispose alone releases the renderer's own resources but leaves
      // the context alive until GC gets round to it.
      gl.forceContextLoss?.();
      gl.dispose();
    };
  }, [gl]);

  return null;
}

/**
 * Turns a scene that throws into the scene's own fallback.
 *
 * R3F renders the canvas contents through its own reconciler, but it does so
 * inside a layout effect on this tree — so a throw in there surfaces here, and
 * a boundary here is the one that catches it. Without this the site's most
 * elaborate section is also its most fragile: one 404 on a cover image and the
 * reader gets the global error page instead of a portfolio.
 *
 * Class component because that is still the only thing React lets catch.
 */
class SceneBoundary extends Component<
  { fallback: ReactNode; onError?: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    // Loud in development, silent to the reader either way — they are looking
    // at the flat composition and there is nothing for them to act on.
    console.error("[Stage] scene failed; falling back to flat.", error);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
