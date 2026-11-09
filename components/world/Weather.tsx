"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { WeatherKind } from "@/lib/world";

/**
 * Weather.
 *
 * Three systems — falling flakes, driving rain, drifting motes — all
 * mounted all the time, each fading its own opacity toward whatever
 * the current environment asks for. Cross-fading is the point: snow
 * thins out as the road drops toward the city instead of switching
 * off at a boundary, which is the difference between weather and a
 * toggle.
 *
 * Every system lives in a box that follows the camera and wraps
 * particles around it, so a few hundred of them cover an infinite
 * drive.
 */

const BOX = 64;
const FADE = 1.6; // seconds to cross-fade between environments

/** A soft round dot, drawn into a canvas. No external texture to load. */
function dotTexture() {
  const s = 48;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.45, "rgba(255,255,255,0.75)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

function seeded(n: number, count: number) {
  let s = n >>> 0;
  const a = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    a[i] = s / 4294967296;
  }
  return a;
}

/* ------------------------------------------------------------------ */

/**
 * Point particles that fall and sway. One system serves both snow and
 * pollen — they differ only in size, colour, fall rate and sway, which
 * are all animated, so there is no reason to pay for two.
 */
function Flakes({
  count,
  target,
  colour,
  size,
  fall,
  sway,
  seed,
}: {
  count: number;
  target: number;
  colour: string;
  size: number;
  fall: number;
  sway: number;
  seed: number;
}) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const tex = useMemo(dotTexture, []);

  const { positions, phase } = useMemo(() => {
    const r = seeded(seed, count * 4);
    const p = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (r[i * 4] - 0.5) * BOX * 2;
      p[i * 3 + 1] = r[i * 4 + 1] * BOX;
      p[i * 3 + 2] = (r[i * 4 + 2] - 0.5) * BOX * 2;
      ph[i] = r[i * 4 + 3] * Math.PI * 2;
    }
    return { positions: p, phase: ph };
  }, [count, seed]);

  useLayoutEffect(() => () => tex.dispose(), [tex]);

  const now = useRef(0);
  useFrame(({ camera, clock }, delta) => {
    const pts = points.current;
    if (!pts || !mat.current) return;

    now.current += (target - now.current) * Math.min(1, delta / FADE);
    mat.current.opacity = now.current;
    pts.visible = now.current > 0.01;
    if (!pts.visible) return;

    // Centre on the camera, snapped to the box so particles do not
    // visibly slide when the camera moves.
    pts.position.set(
      Math.round(camera.position.x / BOX) * BOX,
      Math.round(camera.position.y / BOX) * BOX,
      Math.round(camera.position.z / BOX) * BOX,
    );

    const arr = (pts.geometry.attributes.position as THREE.BufferAttribute)
      .array as Float32Array;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const y = i * 3 + 1;
      arr[y] -= fall * delta;
      if (arr[y] < -BOX * 0.5) arr[y] = BOX;
      arr[i * 3] += Math.sin(t * 0.7 + phase[i]) * sway * delta;
      arr[i * 3 + 2] += Math.cos(t * 0.5 + phase[i]) * sway * delta;
    }
    (pts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        map={tex}
        color={colour}
        size={size}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

/**
 * Rain. Thin vertical slivers rather than points — a round dot reads
 * as dust no matter how fast it falls, and the streak is most of what
 * makes rain legible.
 */
function Rain({ count, target }: { count: number; target: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const state = useMemo(() => {
    const r = seeded(778899, count * 4);
    return Array.from({ length: count }, (_, i) => ({
      x: (r[i * 4] - 0.5) * BOX * 2,
      y: r[i * 4 + 1] * BOX,
      z: (r[i * 4 + 2] - 0.5) * BOX * 2,
      len: 2.6 + r[i * 4 + 3] * 4.4,
    }));
  }, [count]);

  const now = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ camera }, delta) => {
    const m = mesh.current;
    if (!m || !mat.current) return;
    now.current += (target - now.current) * Math.min(1, delta / FADE);
    mat.current.opacity = now.current * 0.78;
    m.visible = now.current > 0.01;
    if (!m.visible) return;

    m.position.set(
      Math.round(camera.position.x / BOX) * BOX,
      Math.round(camera.position.y / BOX) * BOX,
      Math.round(camera.position.z / BOX) * BOX,
    );

    for (let i = 0; i < count; i++) {
      const p = state[i];
      p.y -= 62 * delta;
      if (p.y < -BOX * 0.5) p.y = BOX;
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(0.1, 0, 0.055);
      dummy.scale.set(1, p.len, 1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  useLayoutEffect(() => {
    mesh.current?.computeBoundingSphere();
  }, []);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.05, 1, 0.05]} />
      <meshBasicMaterial
        ref={mat}
        color="#cfe0f0"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */

export default function Weather({ kind }: { kind: WeatherKind }) {
  return (
    <group>
      <Flakes
        count={700}
        target={kind === "snow" ? 0.95 : 0}
        colour="#ffffff"
        size={0.42}
        fall={5.5}
        sway={2.4}
        seed={9001}
      />
      <Rain count={1300} target={kind === "rain" ? 1 : 0} />
      <Flakes
        count={320}
        target={kind === "pollen" ? 0.8 : 0}
        colour="#e7f3a8"
        size={0.3}
        fall={0.9}
        sway={3.2}
        seed={9002}
      />
      <Flakes
        count={380}
        target={kind === "dusk" ? 0.55 : 0}
        colour="#ffc98a"
        size={0.24}
        fall={0.5}
        sway={4.4}
        seed={9003}
      />
      <Flakes
        count={200}
        target={kind === "clear" ? 0.3 : 0}
        colour="#fff4d8"
        size={0.18}
        fall={0.35}
        sway={2.8}
        seed={9004}
      />
    </group>
  );
}
