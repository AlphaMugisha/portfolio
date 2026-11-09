"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { environments } from "@/lib/world";
import { ROUTE, besideRoad, headingAt, pointAt, rightAt, rng, scatter } from "./route";

/**
 * Everything the car drives past.
 *
 * Two rules govern this file. First, it is all instanced — a forest is
 * one draw call, not four hundred. Second, it is all deterministic:
 * positions come from a seeded PRNG so the world is identical on the
 * server, on first paint and on every reload, which is the only way a
 * scattered scene can survive hydration.
 *
 * The terrain is a single mesh for the whole 1.5km route. Its height
 * follows the road, rises away from it by a per-environment amount,
 * and is vertex-coloured from the environment palette — which is what
 * turns one strip of ground into snowfield, city flat, forest floor,
 * wet asphalt and desert without five separate meshes fighting at the
 * seams.
 */

const ZONES = environments.length;
/**
 * An environment's stretch of road. `inset` pulls the ends in, which
 * matters for anything tall: a hundred-unit tower planted right on a
 * boundary is visible from two environments at once, and city blocks
 * standing in the snowfield was exactly how that read.
 */
const zoneSpan = (i: number, inset = 0): [number, number] => [
  (i + inset) / ZONES,
  (i + 1 - inset) / ZONES,
];

/* How far the ground lifts away from the road, per environment.
   Mountains tower; both cities are flat; the forest and the ridge sit
   between. */
const RELIEF = [1.0, 0.09, 0.34, 0.05, 0.55];
/* How rough the surface is. Snow and sand drift; tarmac does not. */
const ROUGH = [1.0, 0.22, 0.5, 0.18, 0.62];

/* ------------------------------------------------------------------ */
/* Terrain                                                             */
/* ------------------------------------------------------------------ */

const TERRAIN_LONG = 420;
const TERRAIN_WIDE = 44;
const TERRAIN_REACH = 320;

function terrainGeometry() {
  const cols = TERRAIN_WIDE;
  const rows = TERRAIN_LONG;
  const count = (rows + 1) * (cols + 1);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const idx: number[] = [];

  const p = new THREE.Vector3();
  const r = new THREE.Vector3();
  const noise = rng(20260101);
  // Pre-rolled noise table, so the surface is reproducible but not banded.
  const table = Array.from({ length: 4096 }, () => noise() * 2 - 1);
  const n = (a: number, b: number) =>
    table[(Math.abs(Math.round(a * 7.3) * 131 + Math.round(b * 5.1) * 37) % 4096 | 0)];

  const palette = environments.map((e) => new THREE.Color(e.ground));
  const c = new THREE.Color();

  for (let i = 0; i <= rows; i++) {
    const t = i / rows;
    pointAt(t, p);
    rightAt(t, r);

    // Which environment this slice belongs to, and how far into it —
    // blended across the seam so the ground changes colour over a
    // stretch of road rather than at a hard line.
    const raw = Math.min(ZONES - 1e-6, t * ZONES);
    const zi = Math.floor(raw);
    const local = raw - zi;
    const blend = local < 0.12 && zi > 0 ? 0.5 - local / 0.24 : 0;
    c.copy(palette[zi]);
    if (blend > 0) c.lerp(palette[zi - 1], blend);

    const relief = THREE.MathUtils.lerp(
      RELIEF[zi],
      RELIEF[Math.min(ZONES - 1, zi + 1)],
      THREE.MathUtils.smoothstep(local, 0.82, 1),
    );
    const rough = ROUGH[zi];

    for (let j = 0; j <= cols; j++) {
      const u = j / cols;
      // Dense near the road, sparse far away: squaring the offset puts
      // the vertices where the silhouette actually matters.
      const signed = (u - 0.5) * 2;
      const off = Math.sign(signed) * signed * signed * TERRAIN_REACH;
      const away = Math.abs(off);

      // The verge stays flat for the width of the shoulder, then climbs.
      const climb = Math.max(0, away - 9);
      const lift =
        relief * (Math.pow(climb, 1.32) * 0.09 + Math.sin(t * 61 + away * 0.012) * climb * 0.07);
      const ripple = rough * (n(t * 90, off * 0.1) * 1.6 + n(t * 23, off * 0.03) * 5.5) *
        Math.min(1, climb / 14);

      const o = (i * (cols + 1) + j) * 3;
      pos[o] = p.x + r.x * off;
      pos[o + 1] = p.y - 0.06 + lift + ripple;
      pos[o + 2] = p.z + r.z * off;

      // Exposed high ground reads lighter — snow caps, dry ridgelines.
      const exposure = THREE.MathUtils.clamp((lift + ripple) / 90, 0, 1) * (zi === 0 ? 0.1 : 0.34);
      col[o] = c.r + exposure;
      col[o + 1] = c.g + exposure;
      col[o + 2] = c.b + exposure;

      if (i < rows && j < cols) {
        const a = i * (cols + 1) + j;
        const b = a + cols + 1;
        /*
         * Winding matters here more than anywhere else in the scene.
         * Rows run along the road (toward -Z) and columns run to the
         * driver's right (+X), so ordering a triangle (a, b, a+1) —
         * along the road first, then across it — gives a normal of
         * tangent x right = DOWN. The whole terrain was inside out and
         * therefore backface-culled: every "snowfield" and "forest
         * floor" in this scene was actually the fog behind the hole
         * where the ground should have been. Across first, then along.
         */
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function Terrain() {
  const geo = useMemo(terrainGeometry, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.94} metalness={0.02} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Instancing helper                                                   */
/* ------------------------------------------------------------------ */

interface Placement {
  pos: THREE.Vector3;
  heading: number;
  k: number;
}

function useField(
  items: Placement[],
  write: (d: THREE.Object3D, item: Placement, i: number) => void,
) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = new THREE.Object3D();
    items.forEach((item, i) => {
      d.position.copy(item.pos);
      d.rotation.set(0, item.heading, 0);
      d.scale.set(1, 1, 1);
      write(d, item, i);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, write]);
  return ref;
}

/* ------------------------------------------------------------------ */
/* Trees                                                               */
/* ------------------------------------------------------------------ */

/** Conifers: a stacked pair of cones on a trunk, instanced in two passes. */
function Conifers({
  zone,
  count,
  seed,
  needle,
  frosted = false,
  near = 13,
  far = 180,
}: {
  zone: number;
  count: number;
  seed: number;
  needle: string;
  frosted?: boolean;
  near?: number;
  far?: number;
}) {
  const [t0, t1] = zoneSpan(zone);
  const items = useMemo(
    () => scatter(t0, t1, count, near, far, seed),
    [t0, t1, count, near, far, seed],
  );

  const writeCanopy = useMemo(
    () => (d: THREE.Object3D, item: Placement) => {
      const h = 7 + item.k * 13;
      d.scale.set(0.8 + item.k * 0.5, h / 10, 0.8 + item.k * 0.5);
      d.position.y += h * 0.52;
      d.rotation.y = item.k * 7;
    },
    [],
  );
  const writeTrunk = useMemo(
    () => (d: THREE.Object3D, item: Placement) => {
      const h = 7 + item.k * 13;
      d.scale.set(1, h * 0.14, 1);
      d.position.y += h * 0.07;
    },
    [],
  );

  const canopy = useField(items, writeCanopy);
  const trunk = useField(items, writeTrunk);

  return (
    <group>
      <instancedMesh ref={trunk} args={[undefined, undefined, items.length]} castShadow>
        <cylinderGeometry args={[0.24, 0.4, 1, 6]} />
        <meshStandardMaterial color="#3a2b1e" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={canopy} args={[undefined, undefined, items.length]} castShadow>
        <coneGeometry args={[2.5, 10, 7, 2]} />
        <meshStandardMaterial
          color={needle}
          roughness={frosted ? 0.7 : 0.92}
          flatShading
          metalness={0}
        />
      </instancedMesh>
    </group>
  );
}

/** Broadleaf: three offset spheres make a canopy that is not a ball. */
function Broadleaf({ zone, count, seed }: { zone: number; count: number; seed: number }) {
  const [t0, t1] = zoneSpan(zone);
  const items = useMemo(() => scatter(t0, t1, count, 15, 150, seed), [t0, t1, count, seed]);
  const write = useMemo(
    () => (d: THREE.Object3D, item: Placement) => {
      const h = 9 + item.k * 9;
      d.position.y += h;
      d.scale.setScalar(2.4 + item.k * 2.4);
      d.rotation.set(item.k * 3, item.k * 5, item.k * 2);
    },
    [],
  );
  const writeTrunk = useMemo(
    () => (d: THREE.Object3D, item: Placement) => {
      const h = 9 + item.k * 9;
      d.scale.set(1, h, 1);
      d.position.y += h * 0.5;
    },
    [],
  );
  const canopy = useField(items, write);
  const trunk = useField(items, writeTrunk);
  return (
    <group>
      <instancedMesh ref={trunk} args={[undefined, undefined, items.length]} castShadow>
        <cylinderGeometry args={[0.22, 0.46, 1, 6]} />
        <meshStandardMaterial color="#4a3826" roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={canopy} args={[undefined, undefined, items.length]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#5f9140" roughness={0.88} flatShading />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Rock, city, desert                                                  */
/* ------------------------------------------------------------------ */

function Boulders({
  zone,
  count,
  seed,
  tint,
}: {
  zone: number;
  count: number;
  seed: number;
  tint: string;
}) {
  const [t0, t1] = zoneSpan(zone);
  const items = useMemo(() => scatter(t0, t1, count, 10, 160, seed), [t0, t1, count, seed]);
  const write = useMemo(
    () => (d: THREE.Object3D, item: Placement) => {
      const s = 1.6 + item.k * 7;
      d.scale.set(s * 1.3, s * (0.5 + item.k * 0.5), s);
      d.position.y += s * 0.25;
      d.rotation.set(item.k * 2, item.k * 9, item.k * 1.4);
    },
    [],
  );
  const ref = useField(items, write);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={tint} roughness={0.95} flatShading />
    </instancedMesh>
  );
}

/**
 * Towers. Two instanced passes: the mass, and a window grid built as a
 * separate slightly-inset box with an emissive material, which is far
 * cheaper than a texture and reads correctly at the distances the
 * camera actually sees them from.
 */
function Towers({
  zone,
  count,
  seed,
  face,
  glass,
  lit,
}: {
  zone: number;
  count: number;
  seed: number;
  face: string;
  glass: string;
  lit: number;
}) {
  const [t0, t1] = zoneSpan(zone, 0.26);
  const items = useMemo(() => scatter(t0, t1, count, 20, 190, seed), [t0, t1, count, seed]);
  const dims = useMemo(
    () =>
      items.map((it) => {
        const r = rng(Math.round(it.pos.x * 97 + it.pos.z * 13) + seed);
        return { w: 8 + r() * 16, d: 8 + r() * 16, h: 14 + Math.pow(r(), 1.7) * 92 };
      }),
    [items, seed],
  );

  const writeMass = useMemo(
    () => (d: THREE.Object3D, _item: Placement, i: number) => {
      const { w, h, d: dp } = dims[i];
      d.scale.set(w, h, dp);
      d.position.y += h * 0.5 - 1;
    },
    [dims],
  );
  const writeGlass = useMemo(
    () => (d: THREE.Object3D, _item: Placement, i: number) => {
      const { w, h, d: dp } = dims[i];
      d.scale.set(w * 0.86, h * 0.9, dp * 0.86);
      d.position.y += h * 0.5 - 1;
    },
    [dims],
  );

  const mass = useField(items, writeMass);
  const glassRef = useField(items, writeGlass);

  return (
    <group>
      <instancedMesh ref={mass} args={[undefined, undefined, items.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={face} roughness={0.78} metalness={0.08} />
      </instancedMesh>
      <instancedMesh ref={glassRef} args={[undefined, undefined, items.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={glass}
          roughness={0.16}
          metalness={0.65}
          emissive={new THREE.Color(glass)}
          emissiveIntensity={lit}
        />
      </instancedMesh>
    </group>
  );
}

/** Flat-topped mesas for the final ridge. */
function Mesas({ zone, count, seed }: { zone: number; count: number; seed: number }) {
  const [t0, t1] = zoneSpan(zone, 0.2);
  const items = useMemo(() => scatter(t0, t1, count, 60, 260, seed), [t0, t1, count, seed]);
  const write = useMemo(
    () => (d: THREE.Object3D, item: Placement) => {
      const h = 18 + item.k * 46;
      d.scale.set(16 + item.k * 26, h, 16 + item.k * 26);
      d.position.y += h * 0.4;
      d.rotation.y = item.k * 6;
    },
    [],
  );
  const ref = useField(items, write);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow>
      <cylinderGeometry args={[0.78, 1, 1, 7, 1]} />
      <meshStandardMaterial color="#6b3a2b" roughness={0.96} flatShading />
    </instancedMesh>
  );
}

/**
 * Roadside lamps. The head is emissive amber — the one place the
 * palette's accent appears in the landscape rather than on the car.
 */
function Lamps({ zone, count, on }: { zone: number; count: number; on: boolean }) {
  const [t0, t1] = zoneSpan(zone);
  const items = useMemo(() => {
    const out: Placement[] = [];
    for (let i = 0; i < count; i++) {
      const t = t0 + ((t1 - t0) * (i + 0.5)) / count;
      const side = i % 2 === 0 ? 8.2 : -8.2;
      out.push({ pos: besideRoad(t, side, 0, new THREE.Vector3()), heading: headingAt(t), k: side });
    }
    return out;
  }, [t0, t1, count]);

  const writePost = useMemo(
    () => (d: THREE.Object3D) => {
      d.scale.set(1, 8.5, 1);
      d.position.y += 4.25;
    },
    [],
  );
  const writeHead = useMemo(
    () => (d: THREE.Object3D) => {
      d.position.y += 8.45;
    },
    [],
  );

  const post = useField(items, writePost);
  const head = useField(items, writeHead);

  return (
    <group>
      <instancedMesh ref={post} args={[undefined, undefined, items.length]} castShadow>
        <cylinderGeometry args={[0.13, 0.19, 1, 6]} />
        <meshStandardMaterial color="#2a2d31" roughness={0.6} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={head} args={[undefined, undefined, items.length]}>
        <boxGeometry args={[2.1, 0.3, 0.7]} />
        <meshStandardMaterial
          color={on ? "#feb002" : "#4a4a4a"}
          emissive={new THREE.Color(on ? "#feb002" : "#000000")}
          emissiveIntensity={on ? 2.4 : 0}
          roughness={0.4}
        />
      </instancedMesh>
    </group>
  );
}

/** Crash barrier down the outside of the mountain descent. */
function Guardrail({ zone }: { zone: number }) {
  const [t0, t1] = zoneSpan(zone);
  const items = useMemo(() => {
    const out: Placement[] = [];
    const n = 150;
    for (let i = 0; i < n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      out.push({
        pos: besideRoad(t, 6.4, 0, new THREE.Vector3()),
        heading: headingAt(t),
        k: i / n,
      });
      out.push({
        pos: besideRoad(t, -6.4, 0, new THREE.Vector3()),
        heading: headingAt(t),
        k: i / n,
      });
    }
    return out;
  }, [t0, t1]);

  const write = useMemo(
    () => (d: THREE.Object3D) => {
      d.position.y += 0.7;
    },
    [],
  );
  const ref = useField(items, write);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]} castShadow>
      <boxGeometry args={[0.18, 0.42, 2.4]} />
      <meshStandardMaterial color="#9aa3ac" roughness={0.45} metalness={0.75} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* Assembly                                                            */
/* ------------------------------------------------------------------ */

/**
 * The scenery for all five environments is mounted at once and left
 * mounted. Fog does the hiding — at 170–420 units the far stretches
 * are invisible anyway, and tearing instanced meshes down and
 * rebuilding them at every zone boundary would stall the frame exactly
 * when the camera is moving fastest.
 */
export function Scenery({ detail = 1 }: { detail?: number }) {
  const q = (n: number) => Math.max(8, Math.round(n * detail));
  return (
    <group>
      <Terrain />

      {/* 01 — Winter Mountains */}
      <Conifers zone={0} count={q(230)} seed={1101} needle="#2f4436" frosted near={11} far={200} />
      <Boulders zone={0} count={q(90)} seed={1102} tint="#c2cedb" />
      <Guardrail zone={0} />

      {/* 02 — Sunny City */}
      <Towers zone={1} count={q(80)} seed={2201} face="#8a7f68" glass="#9fc6e8" lit={0.14} />
      <Lamps zone={1} count={q(26)} on={false} />
      <Broadleaf zone={1} count={q(40)} seed={2203} />

      {/* 03 — Green Forest */}
      <Conifers zone={2} count={q(300)} seed={3301} needle="#24401f" near={12} far={170} />
      <Broadleaf zone={2} count={q(150)} seed={3302} />
      <Boulders zone={2} count={q(40)} seed={3303} tint="#4a4d3c" />

      {/* 04 — Rainy City */}
      <Towers zone={3} count={q(95)} seed={4401} face="#2b3038" glass="#9cc3e4" lit={1.7} />
      <Lamps zone={3} count={q(36)} on />

      {/* 05 — Sunset Destination */}
      <Mesas zone={4} count={q(26)} seed={5501} />
      <Boulders zone={4} count={q(70)} seed={5502} tint="#7a4433" />
      <Lamps zone={4} count={q(18)} on />
    </group>
  );
}

/** Exposed for the fallback renderer, which draws the same silhouette in 2D. */
export const ROUTE_CURVE = ROUTE;
