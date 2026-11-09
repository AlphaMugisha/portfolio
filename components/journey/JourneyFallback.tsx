"use client";

import { useEffect, useRef } from "react";

/**
 * The journey without WebGL.
 *
 * Phones, machines with no GL context, and anyone who asked for
 * reduced motion get this instead of the 3D world. It is not a blank
 * background: the same route is drawn as a 2D canvas — a receding
 * deck with glowing amber rails, marker lamps and the core travelling
 * along it — so the chapters still sit in an environment that moves
 * with the scroll.
 *
 * The typography layer above is byte-for-byte the same component in
 * both modes, so the content, hierarchy and reading experience never
 * change; only the depth of the world behind it does.
 *
 * Under reduced motion it paints a single static frame and never
 * starts a loop.
 */
export default function JourneyFallback({
  progress,
  className = "",
}: {
  progress: React.RefObject<number>;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = host.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = false;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /**
     * A one-point perspective road. `t` is the journey progress; the
     * route's lateral drift is derived from it so the deck curves the
     * same way the 3D route does, and the horizon rises and falls to
     * suggest the same elevation changes.
     */
    const draw = (time: number) => {
      const t = Math.min(1, Math.max(0, progress.current ?? 0));
      ctx.clearRect(0, 0, w, h);

      const horizon = h * (0.46 + Math.sin(t * Math.PI * 1.6) * 0.05);
      // Vanishing point swings with the route's curvature.
      const vpx = w * (0.5 + Math.sin(t * Math.PI * 2.4) * 0.16);

      // Deck
      const nearHalf = w * 0.62;
      ctx.fillStyle = "#191919";
      ctx.beginPath();
      ctx.moveTo(vpx - 1, horizon);
      ctx.lineTo(vpx + 1, horizon);
      ctx.lineTo(w / 2 + nearHalf, h);
      ctx.lineTo(w / 2 - nearHalf, h);
      ctx.closePath();
      ctx.fill();

      // Rails
      const rail = (sign: number) => {
        ctx.beginPath();
        ctx.moveTo(vpx + sign * 1.5, horizon);
        ctx.lineTo(w / 2 + sign * nearHalf, h);
        ctx.strokeStyle = "rgba(254, 176, 2, 0.85)";
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      rail(-1);
      rail(1);

      // Cross ties, scrolling toward the viewer so motion reads even
      // when the page is still.
      const drift = reduced ? 0 : (time * 0.00006) % 1;
      for (let i = 0; i < 26; i++) {
        const k = ((i / 26 + drift + t * 2) % 1) ** 2.6; // perspective bunching
        const y = horizon + (h - horizon) * k;
        const half = (nearHalf * (y - horizon)) / (h - horizon);
        const cx = vpx + (w / 2 - vpx) * ((y - horizon) / (h - horizon));
        ctx.strokeStyle = `rgba(242,242,242,${0.03 + k * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - half, y);
        ctx.lineTo(cx + half, y);
        ctx.stroke();
      }

      // Marker lamps — the only lime, same rule as the 3D world.
      for (let i = 0; i < 7; i++) {
        const k = ((i / 7 + drift * 0.6 + t * 1.4) % 1) ** 2.6;
        const y = horizon + (h - horizon) * k;
        const half = (nearHalf * (y - horizon)) / (h - horizon);
        const cx = vpx + (w / 2 - vpx) * ((y - horizon) / (h - horizon));
        const side = i % 2 === 0 ? 1 : -1;
        ctx.fillStyle = `rgba(143, 220, 60, ${0.25 + k * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx + side * half * 1.08, y, 1.4 + k * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // The core, riding the deck at a fixed station in frame.
      const ck = 0.62;
      const cy = horizon + (h - horizon) * ck;
      const chalf = (nearHalf * (cy - horizon)) / (h - horizon);
      const ccx = vpx + (w / 2 - vpx) * ((cy - horizon) / (h - horizon));
      const size = Math.max(16, chalf * 0.34);

      const glow = ctx.createRadialGradient(ccx, cy, 0, ccx, cy, size * 3.2);
      glow.addColorStop(0, "rgba(254, 176, 2, 0.30)");
      glow.addColorStop(1, "rgba(254, 176, 2, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(ccx, cy, size * 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Four stacked plates, seen edge-on.
      for (let i = 0; i < 4; i++) {
        const pw = size * (1.5 - i * 0.18);
        const py = cy - i * size * 0.3;
        ctx.fillStyle = "#2b2b2b";
        ctx.fillRect(ccx - pw / 2, py - size * 0.07, pw, size * 0.14);
        ctx.strokeStyle = "rgba(254, 176, 2, 0.9)";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(ccx - pw / 2, py - size * 0.07, pw, size * 0.14);
      }

      // Fog toward the horizon, so the route runs out rather than ends.
      const fog = ctx.createLinearGradient(0, horizon - h * 0.12, 0, horizon + h * 0.3);
      fog.addColorStop(0, "#0e0e0e");
      fog.addColorStop(1, "rgba(14,14,14,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, w, horizon + h * 0.3);
    };

    const frame = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(frame);
    };

    resize();
    if (reduced) {
      draw(0);
    } else {
      running = true;
      raf = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(wrap);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else if (!running && !reduced) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [progress]);

  return (
    <div ref={host} className={className}>
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </div>
  );
}
