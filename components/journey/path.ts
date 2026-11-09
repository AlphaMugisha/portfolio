import * as THREE from "three";

/**
 * The route.
 *
 * One continuous curve through the whole site. Every chapter is a point
 * along it, so the journey is literally unbroken — there is no cut
 * between sections, and scrolling back retraces the same line.
 *
 * The shape is authored, not generated: it rises into a tunnel, drops
 * and straightens for the close-up, climbs onto an elevated span for
 * the bridge, then falls away into the distance for the ending. Those
 * elevation and curvature changes are what make each chapter look like
 * a different place while remaining one road.
 */
export const ROUTE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0.6, 14),
    new THREE.Vector3(0, 0.6, -4),
    new THREE.Vector3(7.5, 1.0, -28), // 02 opens out, curves right
    new THREE.Vector3(-1.5, 1.8, -52), // 03 swings back, rising
    new THREE.Vector3(-7, 1.8, -74), // tunnel run
    new THREE.Vector3(0.5, 1.0, -99), // 04 straightens, drops for the detail shot
    new THREE.Vector3(9.5, 3.0, -124), // 05 wide right
    new THREE.Vector3(3, 6.4, -150), // 06/07 climbs onto the span
    new THREE.Vector3(-5, 3.2, -178),
    new THREE.Vector3(0, 1.4, -208), // 08 runs out into the dark
  ],
  false,
  "catmullrom",
  0.5,
);

/** Where the tunnel sits along the route, in 0..1 of the curve. */
export const TUNNEL_RANGE: [number, number] = [0.3, 0.42];

/** Frenet frames, computed once — every piece of track geometry uses them. */
export function routeFrames(divisions: number) {
  return ROUTE.computeFrenetFrames(divisions, false);
}

/**
 * A curve running parallel to the route, offset sideways along the
 * binormal. Used for the two glowing edge rails.
 */
export function offsetCurve(offset: number, divisions = 240) {
  const frames = routeFrames(divisions);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= divisions; i++) {
    const t = i / divisions;
    const p = ROUTE.getPointAt(t);
    const b = frames.binormals[Math.min(i, frames.binormals.length - 1)];
    points.push(p.clone().addScaledVector(b, offset));
  }
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
}
