"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { pointerX, pointerY } from "@/lib/pointer";
import { useCapability } from "@/components/ui/useCapability";

/**
 * True perspective depth for DOM content.
 *
 * `globals.css` already declares the space — `stage` (2400px perspective for
 * a section's layers) and `layer` — and this is the component that finally
 * inhabits it. A `Deep` establishes the stage; each `DeepLayer` inside it
 * sits at a real translateZ, which means the browser's own perspective
 * projection does the physics: deeper layers render smaller AND travel less
 * per pixel of parallax, automatically, because that is what projection IS.
 * No per-layer speed math to keep honest.
 *
 * Two motions run through the stage:
 *
 *   DRIFT — scroll-linked. Every drifting layer is given the SAME world-space
 *   travel; projection converts that into different screen speeds by depth.
 *   This is the detail that separates real depth from the usual parallax,
 *   where each layer is assigned an arbitrary speed and the eye can tell.
 *
 *   LEAN — the whole stage tilts a degree or two toward the pointer, reading
 *   from the shared pointer bus. The same lean grammar as the WebGL scenes'
 *   camera, so a CSS section and a canvas section answer the cursor with one
 *   voice.
 *
 * Under reduced motion both stop, but the translateZ composition REMAINS —
 * the section still is spatial, it just holds still. On coarse pointers only
 * the lean is dropped.
 */

interface DeepContext {
  progress: MotionValue<number>;
  still: boolean;
}

const Ctx = createContext<DeepContext | null>(null);

/** World-space drift travel in px; projection scales it per layer. */
const DRIFT = 90;

export default function Deep({
  children,
  className = "",
  /** Classes for the inner tilt frame — the element the layers are laid out
      in. Pass flex/grid classes here when the stage IS the layout. */
  innerClassName = "",
  /** Maximum lean toward the pointer, in degrees. 0 disables. */
  tilt = 1.4,
  /** Use the near (900px) perspective instead of the section-scale 2400px. */
  near = false,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  tilt?: number;
  near?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cap = useCapability();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The lean, springed so it settles rather than tracks rigidly. Signs match
  // Tilt.tsx: pointer right → rotateY positive, pointer down → rotateX
  // negative — the near edge comes toward the viewer.
  const spring = { stiffness: 46, damping: 16, mass: 0.6 };
  const rx = useSpring(useTransform(pointerY, [-1, 1], [tilt, -tilt]), spring);
  const ry = useSpring(useTransform(pointerX, [-1, 1], [-tilt, tilt]), spring);

  const still = cap.ready && cap.reducedMotion;
  const lean = tilt > 0 && cap.ready && cap.finePointer && !cap.reducedMotion;

  return (
    <div ref={ref} className={`${near ? "stage-near" : "stage"} ${className}`}>
      <motion.div
        style={lean ? { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" } : { transformStyle: "preserve-3d" }}
        className={innerClassName || "h-full w-full"}
      >
        <Ctx.Provider value={{ progress: scrollYProgress, still }}>
          {children}
        </Ctx.Provider>
      </motion.div>
    </div>
  );
}

/**
 * A plane inside the stage.
 *
 * `depth` is px INTO the screen (positive = further away, matching the
 * mental model of the --z tokens: recessed is deep, front is close). Negative
 * depth floats toward the viewer.
 *
 * `drift` multiplies the shared world-space travel. 0 welds the layer to the
 * page; 1 is the standard counter-scroll that makes a deep layer read as
 * further away; small negative values make a near layer overtake the scroll,
 * which is what foreground objects do in the real world.
 */
export function DeepLayer({
  children,
  depth = 0,
  drift = 0,
  className = "",
}: {
  children: ReactNode;
  depth?: number;
  drift?: number;
  className?: string;
}) {
  const ctx = useContext(Ctx);
  // Hooks run unconditionally, so a layer rendered outside any Deep still
  // needs a value to transform — a dead zero that simply never changes.
  const orphan = useMotionValue(0);
  // Enters shifted against its travel, leaves shifted with it; dead-centre at
  // the section's own centre, so the designed composition is what you see.
  const y = useTransform(
    ctx?.progress ?? orphan,
    [0, 1],
    [-DRIFT * drift, DRIFT * drift]
  );

  if (!ctx) {
    // Used outside a Deep — render flat rather than crash. The layer's
    // content is always the point; the depth is the treatment.
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={`layer ${className}`}
      style={
        ctx.still || drift === 0
          ? { z: -depth }
          : { z: -depth, y }
      }
    >
      {children}
    </motion.div>
  );
}

/**
 * The backdrop word — the motif that binds the dark run together.
 *
 * The project rack set the precedent: a mega word in the panel tone, far
 * behind the content, felt rather than read. Every major section now carries
 * one at real depth, so crossing from section to section reads as moving past
 * fixtures in one room rather than loading new pages.
 */
export function DeepWord({
  word,
  depth = 540,
  drift = 1.15,
  className = "",
}: {
  word: string;
  depth?: number;
  drift?: number;
  className?: string;
}) {
  return (
    <DeepLayer
      depth={depth}
      drift={drift}
      className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="text-mega select-none whitespace-nowrap text-panel/60"
        style={{
          fontSize: "min(30svh, 17vw)",
          lineHeight: 0.86,
          transform: "scaleX(1.726)",
        }}
      >
        {word}
      </span>
    </DeepLayer>
  );
}
