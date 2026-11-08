"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's interactive object: a live board you can disturb.
 *
 * A jittered lattice of pads wired with ORTHOGONAL traces — every
 * connection turns a right angle through a corner rather than cutting a
 * diagonal, which is the single detail that makes this read as a
 * circuit rather than as the generic particle-constellation that every
 * other site uses. Packets of charge run the traces continuously.
 *
 * Three anchors — SENSE, COMPUTE, LEARN — are the thesis of the site in
 * one object: a reading is taken at the physical edge, processed, and
 * handed to a model. They fire in that order, forever, and each firing
 * pushes a burst of packets outward along whatever is wired to them.
 *
 * What the pointer actually does (it is not decoration):
 *   - pads within reach brighten and swell on a falloff curve;
 *   - traces touching a lit pad light up and their packets accelerate;
 *   - clicking emits a shockwave that travels outward at a fixed speed
 *     and lights everything it passes through, so a click has a visible,
 *     physical consequence across the whole board.
 *
 * Performance: one canvas, geometry rebuilt only on resize, DPR-aware,
 * node count scaled to the available area. The loop stops completely
 * when the canvas scrolls out of view or the tab is hidden, so an idle
 * background tab costs nothing. Under reduced motion it paints a single
 * static frame and never starts a loop at all.
 */

interface Pad {
  x: number;
  y: number;
  r: number;
  /** 0..1 current illumination, eased toward `target` each frame. */
  glow: number;
  target: number;
  anchor: number; // -1 for ordinary pads, otherwise the anchor index
  phase: number;
}

interface Packet {
  /** Progress along the trace, 0..1. */
  t: number;
  speed: number;
  life: number;
}

interface Trace {
  a: number;
  b: number;
  /** The corner the trace turns through. */
  cx: number;
  cy: number;
  len: number;
  packets: Packet[];
  spawn: number;
  glow: number;
}

const ANCHORS = [
  { nx: 0.17, ny: 0.2, label: "Sense" },
  { nx: 0.52, ny: 0.55, label: "Compute" },
  { nx: 0.85, ny: 0.26, label: "Learn" },
] as const;

const SIGNAL = [84, 209, 219] as const;

export default function ReactiveBoard({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = wrap.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let pads: Pad[] = [];
    let traces: Trace[] = [];
    let shockwaves: { x: number; y: number; r: number }[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let raf = 0;
    let running = false;
    let last = 0;
    let clock = 0;
    let anchorTurn = 0;
    let anchorTimer = 0;

    /* ---------------------------------------------------------- *
     * Geometry
     * ---------------------------------------------------------- */
    function build() {
      const rect = host!.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Lay pads on a jittered grid: a pure random scatter clumps and
      // leaves holes, while a pure grid reads as wallpaper.
      const target = Math.round((width * height) / 15500);
      const count = Math.max(26, Math.min(96, target));
      const cols = Math.max(3, Math.round(Math.sqrt(count * (width / Math.max(height, 1)))));
      const rows = Math.max(3, Math.ceil(count / cols));
      const cellW = width / cols;
      const cellH = height / rows;

      pads = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          pads.push({
            x: (col + 0.5) * cellW + (Math.random() - 0.5) * cellW * 0.6,
            y: (row + 0.5) * cellH + (Math.random() - 0.5) * cellH * 0.6,
            r: 1.4 + Math.random() * 1.3,
            glow: 0,
            target: 0,
            anchor: -1,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }

      // Anchors replace the nearest ordinary pad, so they sit in the
      // lattice rather than floating on top of it.
      ANCHORS.forEach((anchor, index) => {
        const ax = anchor.nx * width;
        const ay = anchor.ny * height;
        let best = 0;
        let bestDist = Infinity;
        pads.forEach((pad, i) => {
          const d = (pad.x - ax) ** 2 + (pad.y - ay) ** 2;
          if (d < bestDist && pad.anchor === -1) {
            bestDist = d;
            best = i;
          }
        });
        pads[best] = {
          ...pads[best],
          x: ax,
          y: ay,
          r: 5.5,
          anchor: index,
        };
      });

      // Wire each pad to its nearest few neighbours, de-duplicated.
      const linked = new Set<string>();
      traces = [];
      const reach = Math.min(width, height) * 0.42;

      pads.forEach((pad, i) => {
        const neighbours = pads
          .map((other, j) => ({ j, d: Math.hypot(other.x - pad.x, other.y - pad.y) }))
          .filter((n) => n.j !== i && n.d < reach)
          .sort((a, b) => a.d - b.d)
          .slice(0, pad.anchor >= 0 ? 5 : 2);

        neighbours.forEach(({ j }) => {
          const key = i < j ? `${i}:${j}` : `${j}:${i}`;
          if (linked.has(key)) return;
          linked.add(key);

          const a = pads[i];
          const b = pads[j];
          // Turn through whichever corner keeps the longer run first —
          // it looks routed rather than arbitrary.
          const horizontalFirst = Math.abs(b.x - a.x) > Math.abs(b.y - a.y);
          const cx = horizontalFirst ? b.x : a.x;
          const cy = horizontalFirst ? a.y : b.y;
          const len = Math.hypot(cx - a.x, cy - a.y) + Math.hypot(b.x - cx, b.y - cy);

          traces.push({
            a: i,
            b: j,
            cx,
            cy,
            len,
            packets: [],
            spawn: Math.random() * 4,
            glow: 0,
          });
        });
      });
    }

    /** Point at `t` along the trace's two-segment path. */
    function pointOn(trace: Trace, t: number) {
      const a = pads[trace.a];
      const b = pads[trace.b];
      const first = Math.hypot(trace.cx - a.x, trace.cy - a.y);
      const total = trace.len || 1;
      const d = t * total;
      if (d <= first) {
        const k = first === 0 ? 0 : d / first;
        return { x: a.x + (trace.cx - a.x) * k, y: a.y + (trace.cy - a.y) * k };
      }
      const second = total - first;
      const k = second === 0 ? 0 : (d - first) / second;
      return { x: trace.cx + (b.x - trace.cx) * k, y: trace.cy + (b.y - trace.cy) * k };
    }

    function fireAnchor(index: number) {
      const padIndex = pads.findIndex((p) => p.anchor === index);
      if (padIndex < 0) return;
      pads[padIndex].glow = 1;
      traces.forEach((trace) => {
        if (trace.a !== padIndex && trace.b !== padIndex) return;
        trace.packets.push({
          t: trace.a === padIndex ? 0 : 1,
          speed: (trace.a === padIndex ? 1 : -1) * (0.3 + Math.random() * 0.2),
          life: 1,
        });
      });
    }

    /* ---------------------------------------------------------- *
     * Frame
     * ---------------------------------------------------------- */
    function draw(dt: number) {
      clock += dt;
      ctx!.clearRect(0, 0, width, height);

      // Anchors fire in order: sense, then compute, then learn.
      anchorTimer -= dt;
      if (anchorTimer <= 0) {
        fireAnchor(anchorTurn % ANCHORS.length);
        anchorTurn += 1;
        anchorTimer = 1.25;
      }

      // Shockwaves from clicks.
      shockwaves = shockwaves.filter((wave) => {
        wave.r += dt * 900;
        return wave.r < Math.hypot(width, height);
      });

      const reach = 165;

      // --- pad illumination -----------------------------------
      for (const pad of pads) {
        let target = pad.anchor >= 0 ? 0.26 + Math.sin(clock * 1.6 + pad.phase) * 0.1 : 0.06;

        if (pointer.active) {
          const d = Math.hypot(pad.x - pointer.x, pad.y - pointer.y);
          if (d < reach) {
            const falloff = 1 - d / reach;
            target = Math.max(target, falloff * falloff);
          }
        }

        for (const wave of shockwaves) {
          const d = Math.abs(Math.hypot(pad.x - wave.x, pad.y - wave.y) - wave.r);
          if (d < 55) target = Math.max(target, 1 - d / 55);
        }

        pad.target = target;
        // Fast attack, slow release — charge builds quickly and bleeds away.
        const k = target > pad.glow ? 0.3 : 0.055;
        pad.glow += (target - pad.glow) * k;
      }

      // --- dim trace bed, one path for the whole lattice -------
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = "rgba(84, 209, 219, 0.1)";
      ctx!.beginPath();
      for (const trace of traces) {
        const a = pads[trace.a];
        const b = pads[trace.b];
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(trace.cx, trace.cy);
        ctx!.lineTo(b.x, b.y);
      }
      ctx!.stroke();

      // --- lit traces and packets ------------------------------
      for (const trace of traces) {
        const a = pads[trace.a];
        const b = pads[trace.b];
        const lit = Math.max(a.glow, b.glow);
        trace.glow += (lit - trace.glow) * 0.14;

        if (trace.glow > 0.03) {
          ctx!.strokeStyle = `rgba(${SIGNAL[0]}, ${SIGNAL[1]}, ${SIGNAL[2]}, ${trace.glow * 0.75})`;
          ctx!.lineWidth = 1 + trace.glow * 0.7;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(trace.cx, trace.cy);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }

        // Ambient traffic, biased toward lit regions.
        trace.spawn -= dt * (1 + trace.glow * 2.5);
        if (trace.spawn <= 0) {
          trace.spawn = 2.5 + Math.random() * 5;
          if (trace.packets.length < 3) {
            const forward = Math.random() > 0.5;
            trace.packets.push({
              t: forward ? 0 : 1,
              speed: (forward ? 1 : -1) * (0.16 + Math.random() * 0.16),
              life: 1,
            });
          }
        }

        for (const packet of trace.packets) {
          packet.t += packet.speed * dt * (1 + trace.glow * 1.6);
          if (packet.t <= 0 || packet.t >= 1) packet.life = 0;
        }
        trace.packets = trace.packets.filter((p) => p.life > 0);

        for (const packet of trace.packets) {
          const point = pointOn(trace, packet.t);
          const size = 1.5 + trace.glow * 1.4;
          ctx!.fillStyle = `rgba(${SIGNAL[0]}, ${SIGNAL[1]}, ${SIGNAL[2]}, ${0.5 + trace.glow * 0.5})`;
          ctx!.beginPath();
          ctx!.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // --- pads ------------------------------------------------
      for (const pad of pads) {
        const glow = pad.glow;
        const radius = pad.r + glow * (pad.anchor >= 0 ? 3.5 : 2.2);

        if (glow > 0.12) {
          const halo = ctx!.createRadialGradient(pad.x, pad.y, 0, pad.x, pad.y, radius * 6);
          halo.addColorStop(0, `rgba(${SIGNAL[0]}, ${SIGNAL[1]}, ${SIGNAL[2]}, ${glow * 0.3})`);
          halo.addColorStop(1, "rgba(84, 209, 219, 0)");
          ctx!.fillStyle = halo;
          ctx!.beginPath();
          ctx!.arc(pad.x, pad.y, radius * 6, 0, Math.PI * 2);
          ctx!.fill();
        }

        if (pad.anchor >= 0) {
          // Anchors read as drilled vias: a ring with an open centre.
          ctx!.strokeStyle = `rgba(${SIGNAL[0]}, ${SIGNAL[1]}, ${SIGNAL[2]}, ${0.5 + glow * 0.5})`;
          ctx!.lineWidth = 1.5;
          ctx!.beginPath();
          ctx!.arc(pad.x, pad.y, radius, 0, Math.PI * 2);
          ctx!.stroke();
          ctx!.fillStyle = `rgba(${SIGNAL[0]}, ${SIGNAL[1]}, ${SIGNAL[2]}, ${0.25 + glow * 0.75})`;
          ctx!.beginPath();
          ctx!.arc(pad.x, pad.y, radius * 0.4, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          ctx!.fillStyle = `rgba(${SIGNAL[0]}, ${SIGNAL[1]}, ${SIGNAL[2]}, ${0.22 + glow * 0.78})`;
          ctx!.beginPath();
          ctx!.arc(pad.x, pad.y, radius, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function frame(now: number) {
      // Clamped so a backgrounded tab returning does not integrate one
      // enormous delta and teleport every packet off its trace.
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    /* ---------------------------------------------------------- *
     * Wiring
     * ---------------------------------------------------------- */
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onPointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      shockwaves.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, r: 0 });
    };

    build();
    if (reduced) {
      draw(0); // one static frame, no loop
    } else {
      host.addEventListener("pointermove", onPointerMove, { passive: true });
      host.addEventListener("pointerleave", onPointerLeave);
      host.addEventListener("pointerdown", onPointerDown, { passive: true });
    }

    const resize = new ResizeObserver(() => {
      build();
      if (reduced) draw(0);
    });
    resize.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(host);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (host.getBoundingClientRect().bottom > 0) start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      resize.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      host.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />

      {/* Labels are DOM, not canvas text: they inherit the real webfont,
          stay selectable and legible to assistive tech, and are placed
          from the same normalised coordinates the canvas anchors use. */}
      {ANCHORS.map((anchor) => {
        // Anchors in the right-hand third label themselves leftward, or
        // the text runs off the edge on a narrow viewport.
        const flip = anchor.nx > 0.6;
        return (
          <span
            key={anchor.label}
            className={`pointer-events-none absolute -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-text-subtle ${
              flip ? "-translate-x-[calc(100%+1rem)] text-right" : "translate-x-4"
            }`}
            style={{ left: `${anchor.nx * 100}%`, top: `${anchor.ny * 100}%` }}
          >
            {anchor.label}
          </span>
        );
      })}
    </div>
  );
}
