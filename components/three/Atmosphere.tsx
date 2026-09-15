"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, useMotionValueEvent } from "framer-motion";
import * as THREE from "three";
import Stage from "@/components/three/Stage";
import { useCapability } from "@/components/ui/useCapability";
import { pointerX, pointerY } from "@/lib/pointer";
import { PALETTE } from "@/lib/palette";

/**
 * The air of the room.
 *
 * The hero cuts the opening word as an aperture into a dark space; everything
 * after it happens INSIDE that space. This is the one element that says so
 * continuously: a fixed, full-viewport field of dust motes that persists from
 * the moment you pass through the cut to the foot of the page. Sections come
 * and go; the air stays. That persistence — one thing that never reloads,
 * never resets — is what makes six sections read as one room.
 *
 * It fades in exactly where the fiction says it should: as the light band
 * scrolls away and the dark run begins. Over the hero it does not exist,
 * because you are still outside, looking in through the letters (which have
 * their own dust, behind the sheet).
 *
 * Cost discipline: ONE draw call. All motion lives in the vertex shader —
 * scroll parallax, drift, pointer sway — driven by four uniforms per frame.
 * Geometry is generated once per tier and never touched again; resize is
 * absorbed by uniforms, not by rebuilding attributes. The points render over
 * the page at very low alpha, in front of the copy — near-camera motes, the
 * film-grain trick — small and sparse enough never to compete with a line of
 * text.
 */

const COUNT: Record<string, number> = { high: 1100, mid: 550, low: 0, none: 0 };

const vertex = /* glsl */ `
  attribute vec4 aSeed;   // x01, y01, z01, phase
  uniform float uTime;
  uniform float uScroll;  // page scroll, px
  uniform vec2  uPointer;
  uniform float uTanHalf; // tan(fov/2)
  uniform float uAspect;
  uniform float uDpr;
  varying float vNear;
  varying float vPhase;

  void main() {
    // Depth first: everything else scales from it.
    float z = -1.2 - aSeed.z * 9.0;              // -1.2 .. -10.2
    float near = 1.0 - aSeed.z;                  // 1 close, 0 far
    vNear = near;
    vPhase = aSeed.w;

    // The visible half-height at this depth, for a camera at z = 6. Slightly
    // overscanned so motes are born offscreen rather than at the edge.
    float halfH = (6.0 - z) * uTanHalf * 1.15;
    float halfW = halfH * uAspect;

    // Scroll rides the field upward — the world moving past a camera that is
    // descending through it — faster for near motes, and wrapped so the field
    // is bottomless. Drift and sway are the air itself.
    float rise = uTime * (0.0035 + near * 0.004);
    float travel = uScroll * (0.00002 + near * 0.00007);
    float y01 = fract(aSeed.y + rise + travel);
    float x01 = fract(aSeed.x + sin(uTime * 0.03 + aSeed.w * 6.2831) * 0.008);

    vec3 pos = vec3(
      (x01 * 2.0 - 1.0) * halfW + uPointer.x * near * 0.22,
      (y01 * 2.0 - 1.0) * halfH - uPointer.y * near * 0.13,
      z
    );

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uDpr * mix(1.3, 3.4, near);
  }
`;

const fragment = /* glsl */ `
  precision mediump float;
  // highp to match the vertex stage — strict drivers (ANGLE) refuse to link
  // a program whose shared uniform differs in precision between stages.
  uniform highp float uTime;
  uniform float uFade;
  uniform vec3  uColor;
  varying float vNear;
  varying float vPhase;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.12, d);
    // A slow individual breath per mote, so the field shimmers rather than
    // strobing in unison.
    float breathe = 0.7 + 0.3 * sin(uTime * 0.5 + vPhase * 6.2831);
    float alpha = disc * breathe * mix(0.045, 0.16, vNear) * uFade;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function DustField() {
  const cap = useCapability();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size, invalidate } = useThree();
  const { scrollY } = useScroll();

  const count = COUNT[cap.tier] ?? 0;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // Positions are computed in the vertex shader from the seed; the
    // attribute three requires is a token.
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3)
    );
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      seed[i * 4 + 0] = Math.random();
      seed[i * 4 + 1] = Math.random();
      seed[i * 4 + 2] = Math.random();
      seed[i * 4 + 3] = Math.random();
    }
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    // The shader positions points across the whole frustum; without this the
    // default zero-radius bounding sphere lets frustum culling drop the lot.
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -5), 40);
    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uTanHalf: { value: Math.tan((55 * Math.PI) / 360) },
      uAspect: { value: 1 },
      uDpr: { value: 1 },
      uFade: { value: 0 },
      uColor: { value: new THREE.Color(PALETTE.paper) },
    }),
    []
  );

  // Under reduced motion the Stage runs on demand; scroll must still update
  // the fade or the dust pops in a frame late — or never.
  useMotionValueEvent(scrollY, "change", () => {
    if (cap.reducedMotion) invalidate();
  });

  useFrame((state) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    if (!cap.reducedMotion) u.uTime.value = state.clock.elapsedTime;

    const y = scrollY.get();
    u.uScroll.value = y;

    // The fiction: dust exists only inside the room. It condenses as the
    // light band leaves — starting once you are half a viewport in, fully
    // present a bit past one viewport.
    const vh = state.size.height;
    u.uFade.value = THREE.MathUtils.clamp((y - vh * 0.45) / (vh * 0.65), 0, 1);

    u.uPointer.value.set(pointerX.get(), pointerY.get());
    u.uAspect.value = state.size.width / state.size.height;
    u.uDpr.value = state.viewport.dpr;
  });

  // Keep the aspect current even while frames are on demand.
  useEffect(() => {
    if (!mat.current) return;
    mat.current.uniforms.uAspect.value = size.width / size.height;
  }, [size]);

  if (!count) return null;

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </points>
  );
}

/**
 * Mounted once in the layout. Fixed, full-viewport, pointer-transparent, and
 * in FRONT of the page content at very low alpha — near-camera motes. Behind
 * the header, the cursor and every overlay, so chrome stays crisp.
 */
export default function Atmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
    >
      <Stage
        className="h-full w-full"
        fov={55}
        position={[0, 0, 6]}
        // No 3D → no dust. The palette carries the mood on its own; an empty
        // fallback here is a designed absence, not a missing feature.
        fallback={null}
      >
        <DustField />
      </Stage>
    </div>
  );
}
