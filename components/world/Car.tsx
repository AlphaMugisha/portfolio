"use client";

import { forwardRef, useEffect, useMemo, useRef, useImperativeHandle } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The vehicle — an electric grand-touring coupe, built procedurally.
 *
 * HONEST SCOPE NOTE. There is no car model in this repository and no
 * licensed automotive asset was available to bring in, so this is a
 * hand-built vehicle, not a studio GLB. It is deliberately constructed
 * the way a real body is massed rather than from primitives:
 *
 *   - the TUB is a sculpted side profile drawn with bezier curves and
 *     extruded across the car's width with a deep bevel, which is what
 *     produces rounded shoulders and a continuous beltline instead of
 *     a box with chamfers;
 *   - the GREENHOUSE is a second, narrower, shorter profile sitting on
 *     that beltline — the inset is what reads as a cabin rather than a
 *     wedge;
 *   - the two are separate materials: clearcoated graphite paint and
 *     dark tinted glass.
 *
 * It will not pass for a rendered press shot. It does read as a low,
 * wide, believable GT coupe with correct proportions (4.6 × 1.95 ×
 * 1.30 units, 2.9 wheelbase), and every surface responds to the
 * environment map, so reflections move as it drives.
 *
 * Amber #FEB002 is the only accent on it — headlights, the rear light
 * bar and the brake-caliper detail — exactly as the palette requires.
 */

const AMBER = "#feb002";

export interface CarHandle {
  /** Advance the wheels by a real distance travelled, in world units. */
  roll: (distance: number) => void;
  /** Lean the body into a corner and steer the front wheels. */
  steer: (amount: number) => void;
  group: THREE.Group | null;
}

/** The body tub, in side view. Bezier curves, not straight segments. */
function tubShape() {
  const s = new THREE.Shape();
  s.moveTo(-2.3, 0.3);
  s.lineTo(-2.36, 0.58);
  s.quadraticCurveTo(-2.34, 0.84, -2.1, 0.9); // rear deck
  s.quadraticCurveTo(-1.5, 1.0, -0.9, 0.97); // rear haunch
  s.quadraticCurveTo(0.2, 0.94, 1.1, 0.88); // beltline
  s.quadraticCurveTo(1.75, 0.83, 2.02, 0.68); // bonnet fall
  s.quadraticCurveTo(2.3, 0.56, 2.3, 0.4); // nose
  s.lineTo(2.28, 0.3);
  s.quadraticCurveTo(0, 0.2, -2.3, 0.3); // floor, slightly bowed
  return s;
}

/** The cabin, narrower and shorter — the inset is what sells it. */
function greenhouseShape() {
  const s = new THREE.Shape();
  s.moveTo(-1.95, 0.0);
  s.quadraticCurveTo(-1.62, 0.3, -1.1, 0.42); // rear screen rake
  s.quadraticCurveTo(-0.35, 0.56, 0.3, 0.54); // roof
  s.quadraticCurveTo(0.78, 0.52, 1.02, 0.28); // windscreen
  s.quadraticCurveTo(1.14, 0.14, 1.1, 0.0); // cowl
  s.lineTo(-1.95, 0.0);
  return s;
}

/** A single wheel: tyre, dished rim, spokes, amber caliper. */
function Wheel({
  position,
  radius = 0.36,
  width = 0.26,
}: {
  position: [number, number, number];
  radius?: number;
  width?: number;
}) {
  const tyre = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.95, metalness: 0.02 }),
    [],
  );
  const rim = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#8e8e8e", roughness: 0.22, metalness: 0.95 }),
    [],
  );
  const caliper = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3a2906",
        emissive: new THREE.Color(AMBER),
        emissiveIntensity: 0.5,
        roughness: 0.4,
      }),
    [],
  );

  const spokes = useMemo(() => Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2), []);

  /**
   * The car's nose is +X and its width is Z, so a wheel's axle has to
   * run along Z. A cylinder is built around Y, so it needs rotating
   * about X — NOT about Z, which was pointing every axle down the
   * length of the car and made the wheels read as rings seen edge-on.
   * Everything inside is therefore authored in the cylinder's own
   * frame, where "across the wheel" is local Y.
   */
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* tyre */}
      <mesh material={tyre}>
        <cylinderGeometry args={[radius, radius, width, 28]} />
      </mesh>
      {/* Shoulders, so the tread is not a hard disc edge.
          A torus rings around Z by default, so without this rotation it
          hooped sideways across the wheel instead of around it — which
          is why the tyres read as rings bolted to a cap. Rotating about
          X puts the ring coaxial with the cylinder's Y axle. */}
      <mesh material={tyre} position={[0, width * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.9, 0.05, 8, 26]} />
      </mesh>
      <mesh material={tyre} position={[0, -width * 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.9, 0.05, 8, 26]} />
      </mesh>
      {/* rim face, dished slightly inboard of the tyre shoulder */}
      <mesh material={rim} position={[0, width * 0.38, 0]}>
        <cylinderGeometry args={[radius * 0.7, radius * 0.7, 0.04, 24]} />
      </mesh>
      {spokes.map((a, i) => (
        <mesh
          key={i}
          material={rim}
          position={[Math.cos(a) * radius * 0.37, width * 0.41, Math.sin(a) * radius * 0.37]}
          rotation={[0, -a, 0]}
        >
          <boxGeometry args={[radius * 0.56, 0.03, 0.055]} />
        </mesh>
      ))}
      <mesh material={rim} position={[0, width * 0.44, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.035, 12]} />
      </mesh>
      {/* brake caliper — the one amber detail down here */}
      <mesh material={caliper} position={[radius * 0.5, 0, 0]}>
        <boxGeometry args={[0.1, 0.14, 0.07]} />
      </mesh>
    </group>
  );
}

const Car = forwardRef<CarHandle, { headlights?: boolean; paint?: string }>(function Car(
  { headlights = true, paint: paintHex = "#333333" },
  ref,
) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const frontAxle = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group[]>([]);

  const spin = useRef(0);
  const steerTarget = useRef(0);
  const steerNow = useRef(0);
  const bob = useRef(0);

  const WHEEL_R = 0.36;

  /* ---------------- geometry ----------------
   *
   * `ExtrudeGeometry` already lays a shape out exactly how this car is
   * authored: the shape's X is the car's length, its Y is the height,
   * and the extrusion runs along Z — which is the width. So it needs
   * NO rotation.
   *
   * An earlier `rotateY(PI/2)` here swapped length and width, turning
   * the bodywork ninety degrees against the chassis: the wheels,
   * lights and splitter are all authored with the nose at +X, so the
   * body ended up narrow front-to-back with the wheels hanging outside
   * it like a go-kart. The only transform needed is a translate to
   * centre the extrusion across the car's width.
   */
  const TUB_WIDTH = 1.72;
  const GLASS_WIDTH = 1.46;

  const tubGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(tubShape(), {
      depth: TUB_WIDTH,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.105,
      bevelSegments: 6,
      curveSegments: 20,
    });
    g.translate(0, 0, -TUB_WIDTH / 2);
    g.computeVertexNormals();
    return g;
  }, []);

  const glassGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(greenhouseShape(), {
      depth: GLASS_WIDTH,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.065,
      bevelSegments: 5,
      curveSegments: 18,
    });
    g.translate(0, 0, -GLASS_WIDTH / 2);
    g.computeVertexNormals();
    return g;
  }, []);

  /* ---------------- materials ---------------- */
  const paint = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#333333",
        metalness: 0.62,
        roughness: 0.26,
        clearcoat: 1,
        clearcoatRoughness: 0.07,
        envMapIntensity: 1.05,
      }),
    [],
  );
  /* The finish is a prop so the vehicle panel can change it without
     rebuilding the material — recreating a MeshPhysicalMaterial forces
     a shader recompile, which is a visible stall mid-drive. */
  useEffect(() => {
    paint.color.set(paintHex);
  }, [paint, paintHex]);

  const glass = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#070707",
        metalness: 0.3,
        roughness: 0.06,
        clearcoat: 1,
        transparent: true,
        opacity: 0.72,
        envMapIntensity: 2.2,
      }),
    [],
  );
  const trim = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0f0f0f", roughness: 0.72, metalness: 0.12 }),
    [],
  );
  const lamp = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: AMBER,
        emissive: new THREE.Color(AMBER),
        emissiveIntensity: 1.6,
        toneMapped: false,
      }),
    [],
  );
  const lampOff = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a2208",
        emissive: new THREE.Color(AMBER),
        emissiveIntensity: 0.25,
        toneMapped: false,
      }),
    [],
  );

  useImperativeHandle(ref, () => ({
    roll: (distance: number) => {
      spin.current -= distance / WHEEL_R;
    },
    steer: (amount: number) => {
      steerTarget.current = THREE.MathUtils.clamp(amount, -0.5, 0.5);
    },
    get group() {
      return group.current;
    },
  }));

  useFrame((_, delta) => {
    // Wheels turn from real distance travelled, not from a timer.
    // Rolling is about Z, because the axles run across the car.
    wheels.current.forEach((w) => {
      if (w) w.rotation.z = spin.current;
    });

    steerNow.current += (steerTarget.current - steerNow.current) * 0.1;
    if (frontAxle.current) frontAxle.current.rotation.y = steerNow.current * 0.55;

    // Suspension: the body leans into the corner and breathes on its
    // springs. Small numbers — a car that visibly wallows reads cheap.
    bob.current += delta;
    if (body.current) {
      body.current.rotation.z += (-steerNow.current * 0.09 - body.current.rotation.z) * 0.08;
      body.current.position.y = Math.sin(bob.current * 2.6) * 0.008;
    }
  });

  return (
    <group ref={group}>
      <group ref={body}>
        {/* Tub. The profile is authored in world coordinates already —
            y 0.2 to 1.0 above the road — so it needs no offset. */}
        <mesh geometry={tubGeo} material={paint} castShadow />
        {/* Greenhouse, lifted onto the beltline and pulled back a little
            so the windscreen sits behind the cowl. */}
        <mesh geometry={glassGeo} material={glass} position={[-0.1, 0.87, 0]} castShadow />

        {/* Wheel arch lips. There is no boolean subtraction here, so the
            arches are read by a dark ring sitting proud of the body at
            each wheel — without them the wheels look stuck onto a slab
            rather than recessed into it. */}
        {([
          [1.45, 0.96],
          [1.45, -0.96],
          [-1.45, 0.96],
          [-1.45, -0.96],
        ] as [number, number][]).map(([x, z], i) => (
          // Left unrotated on purpose: a torus already rings in the XY
          // plane, which IS the car's side view — exactly the plane a
          // wheel arch lives in. The half-arc runs +X to -X, i.e. the
          // top half, so it sits over the tyre.
          <mesh key={i} position={[x, 0.36, z]} material={trim}>
            <torusGeometry args={[0.45, 0.05, 8, 20, Math.PI]} />
          </mesh>
        ))}

        {/* sill / rocker, tying the wheels into the body */}
        <mesh material={trim} position={[0, 0.3, 0.94]}>
          <boxGeometry args={[2.7, 0.11, 0.07]} />
        </mesh>
        <mesh material={trim} position={[0, 0.3, -0.94]}>
          <boxGeometry args={[2.7, 0.11, 0.07]} />
        </mesh>

        {/* splitter and diffuser — tucked under, dark, barely there.
            At the previous size they read as grey planks bolted on. */}
        <mesh material={trim} position={[2.08, 0.24, 0]}>
          <boxGeometry args={[0.34, 0.05, 1.62]} />
        </mesh>
        <mesh material={trim} position={[-2.14, 0.27, 0]}>
          <boxGeometry args={[0.26, 0.11, 1.5]} />
        </mesh>

        {/* Headlights: slim blades set INTO the nose. Previously they
            were both oversized and parked outside the bodywork, so they
            floated as two yellow rectangles beside the car. */}
        {[0.56, -0.56].map((z) => (
          <mesh
            key={z}
            material={headlights ? lamp : lampOff}
            position={[2.07, 0.6, z]}
            rotation={[0, 0, -0.16]}
          >
            <boxGeometry args={[0.06, 0.045, 0.3]} />
          </mesh>
        ))}

        {/* rear light bar, inset into the tail */}
        <mesh material={headlights ? lamp : lampOff} position={[-2.2, 0.73, 0]}>
          <boxGeometry args={[0.05, 0.042, 1.12]} />
        </mesh>

        {/* the beams themselves, so the road is actually lit */}
        {headlights ? (
          <>
            <spotLight
              position={[2.2, 0.66, 0.6]}
              target-position={[12, -0.6, 1.6]}
              angle={0.5}
              penumbra={0.75}
              intensity={26}
              distance={34}
              color="#ffd98a"
            />
            <spotLight
              position={[2.2, 0.66, -0.6]}
              target-position={[12, -0.6, -1.6]}
              angle={0.5}
              penumbra={0.75}
              intensity={26}
              distance={34}
              color="#ffd98a"
            />
            {/* a soft pool under the nose so the car sits in the world */}
            <pointLight position={[2.4, 0.4, 0]} intensity={2.2} distance={7} color={AMBER} />
            <pointLight position={[-2.4, 0.6, 0]} intensity={1.2} distance={5} color={AMBER} />
          </>
        ) : null}
      </group>

      {/* wheels — front pair on a steering axle */}
      <group ref={frontAxle} position={[1.45, WHEEL_R, 0]}>
        {[0.86, -0.86].map((z, i) => (
          <group
            key={z}
            ref={(el) => {
              if (el) wheels.current[i] = el;
            }}
            position={[0, 0, z]}
          >
            <Wheel position={[0, 0, 0]} radius={WHEEL_R} />
          </group>
        ))}
      </group>
      {[0.86, -0.86].map((z, i) => (
        <group
          key={z}
          ref={(el) => {
            if (el) wheels.current[i + 2] = el;
          }}
          position={[-1.45, WHEEL_R, z]}
        >
          <Wheel position={[0, 0, 0]} radius={WHEEL_R} />
        </group>
      ))}
    </group>
  );
});

export default Car;
