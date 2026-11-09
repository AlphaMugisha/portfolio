import * as THREE from "three";

/**
 * The road.
 *
 * One continuous curve through all five environments — the car never
 * teleports and the camera never cuts, so the environments have to be
 * laid out as real stretches of the same route rather than as separate
 * scenes. Control points are spaced evenly in Z (one every 50 units)
 * so that arc-length along the curve stays close to linear in the
 * scroll, which is what keeps the pace even.
 *
 * Elevation does the storytelling: it starts high in the mountains and
 * falls for most of the drive, flattens through both cities, rolls
 * through the forest, and climbs again to the ridge at the end.
 */

const CONTROL: [number, number, number][] = [
  // 01 — Winter Mountains: high, descending, tight switchbacks.
  [0, 58, 0],
  [-22, 50, -50],
  [-30, 43, -100],
  [-8, 36, -150],
  [20, 30, -200],
  [28, 25, -250],
  // 02 — Sunny City: levelling out, gentle.
  [14, 20, -300],
  [-2, 15, -350],
  [-8, 12, -400],
  [-4, 11, -450],
  [4, 10.5, -500],
  [6, 10, -550],
  // 03 — Green Forest: rolling, wandering between the trunks.
  [2, 10, -600],
  [-10, 12, -650],
  [-20, 15, -700],
  [-12, 19, -750],
  [4, 22, -800],
  [16, 21, -850],
  // 04 — Rainy City: long, flat, straight. Nothing to look at.
  [12, 18, -900],
  [2, 14, -950],
  [-4, 12, -1000],
  [-6, 11, -1050],
  [-2, 10.5, -1100],
  [3, 10, -1150],
  // 05 — Sunset Destination: one long sweep up to the ridge.
  [6, 11, -1200],
  [18, 15, -1250],
  [24, 20, -1300],
  [18, 26, -1350],
  [4, 32, -1400],
  [-6, 38, -1450],
  [-10, 42, -1500],
];

export const ROUTE = new THREE.CatmullRomCurve3(
  CONTROL.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  "centripetal",
  0.5,
);

/** Half-width of the carriageway, in world units. */
export const ROAD_HALF = 5.2;

const _tan = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

/** Position on the centreline at arc-length fraction `t`. */
export function pointAt(t: number, out = new THREE.Vector3()): THREE.Vector3 {
  return ROUTE.getPointAt(THREE.MathUtils.clamp(t, 0, 1), out);
}

/** Unit tangent — which way the car is pointing. */
export function tangentAt(t: number, out = new THREE.Vector3()): THREE.Vector3 {
  return ROUTE.getTangentAt(THREE.MathUtils.clamp(t, 0, 1), out).normalize();
}

/**
 * The sideways axis at `t`, pointing to the driver's right.
 * Derived from the tangent and world up rather than from Frenet frames,
 * which roll the road on its side wherever the curve inflects.
 */
export function rightAt(t: number, out = new THREE.Vector3()): THREE.Vector3 {
  tangentAt(t, _tan);
  return out.copy(_tan).cross(_up).normalize();
}

/** A world position offset `side` units right of the centreline at `t`. */
export function besideRoad(t: number, side: number, lift = 0, out = new THREE.Vector3()) {
  pointAt(t, out);
  const r = rightAt(t, new THREE.Vector3()).multiplyScalar(side);
  out.add(r);
  out.y += lift;
  return out;
}

/** Heading in radians for an object facing along the road at `t`. */
export function headingAt(t: number): number {
  tangentAt(t, _tan);
  return Math.atan2(_tan.x, _tan.z);
}

/**
 * Curvature, signed, as a cheap finite difference of the heading.
 * Used to lean the car into corners and to swing the chase camera.
 */
export function curvatureAt(t: number): number {
  const d = 0.0025;
  const a = headingAt(Math.max(0, t - d));
  const b = headingAt(Math.min(1, t + d));
  let delta = b - a;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return delta / (d * 2);
}

/**
 * The carriageway, as a single ribbon.
 *
 * Built once at module scope: it is a few thousand triangles and never
 * changes, so rebuilding it per mount would only cost a frame hitch on
 * every remount. UVs run 0..1 across the width and 0..N down the
 * length so the centre-line texture repeats at a constant rate.
 */
export function buildRoadGeometry(segments = 900, half = ROAD_HALF) {
  const pos = new Float32Array((segments + 1) * 2 * 3);
  const uv = new Float32Array((segments + 1) * 2 * 2);
  const idx: number[] = [];
  const p = new THREE.Vector3();
  const r = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    pointAt(t, p);
    rightAt(t, r).multiplyScalar(half);
    const o = i * 6;
    pos[o] = p.x - r.x;
    pos[o + 1] = p.y - r.y + 0.02;
    pos[o + 2] = p.z - r.z;
    pos[o + 3] = p.x + r.x;
    pos[o + 4] = p.y + r.y + 0.02;
    pos[o + 5] = p.z + r.z;

    const u = i * 4;
    uv[u] = 0;
    uv[u + 1] = t * segments * 0.25;
    uv[u + 2] = 1;
    uv[u + 3] = t * segments * 0.25;

    if (i < segments) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * A deterministic PRNG. Scenery has to land in the same place on every
 * render and on the server, so `Math.random()` is not an option —
 * hydration would mismatch and the trees would jump on reload.
 */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Scatter `count` objects along the stretch of road from `t0` to `t1`,
 * between `near` and `far` units off the centreline on both sides.
 * Returns world positions plus the road heading at each, so props can
 * be turned to face the traffic.
 */
export function scatter(
  t0: number,
  t1: number,
  count: number,
  near: number,
  far: number,
  seed: number,
) {
  const r = rng(seed);
  const out: { pos: THREE.Vector3; heading: number; k: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = t0 + (t1 - t0) * ((i + r() * 0.9) / count);
    const side = (r() < 0.5 ? -1 : 1) * (near + r() * (far - near));
    out.push({
      pos: besideRoad(t, side, 0, new THREE.Vector3()),
      heading: headingAt(t),
      k: r(),
    });
  }
  return out;
}
