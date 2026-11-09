"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ROUTE, TUNNEL_RANGE, offsetCurve, routeFrames } from "./path";
import { SHOTS, type ShotName } from "./shots";

/**
 * The world.
 *
 * One route, one travelling object, one continuous camera. Scroll is
 * the only input: it drives a single 0..1 value that positions the
 * core on the curve, moves the camera, and advances the environment.
 * Scrolling back runs the identical path in reverse because nothing
 * here is stateful — every frame is a pure function of that number.
 *
 * COLOUR is the restored palette and nothing else: amber #FEB002 on
 * the rails, the core's traces and the key light; lime #8FDC3C on a
 * few marker lamps; the greys #0E0E0E / #161616 / #232323 for every
 * surface. See PALETTE.md.
 *
 * PERFORMANCE
 *   - the deck is one InstancedMesh of ~260 segments, the pylons and
 *     tunnel ribs one each: the whole world is a handful of draw calls;
 *   - the rails are two TubeGeometries, built once;
 *   - exponential fog hides the horizon, so nothing distant is drawn;
 *   - no shadow maps, no post-processing, no loaded textures;
 *   - vectors are allocated once and reused inside the frame loop.
 */

const AMBER = "#feb002";
const AMBER_BRIGHT = "#ffc23a";
const LIME = "#8fdc3c";
const INK = "#0e0e0e";

const DECK_SEGMENTS = 260;
const DECK_HALF_WIDTH = 1.9;

/* ------------------------------------------------------------------ */
/* Track                                                               */
/* ------------------------------------------------------------------ */

function Deck() {
  const ref = useRef<THREE.InstancedMesh>(null);

  const frames = useMemo(() => routeFrames(DECK_SEGMENTS), []);
  const geometry = useMemo(() => new THREE.BoxGeometry(DECK_HALF_WIDTH * 2, 0.09, 1), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#232323", roughness: 0.82, metalness: 0.02 }),
    [],
  );

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3();

    for (let i = 0; i < DECK_SEGMENTS; i++) {
      const t = i / DECK_SEGMENTS;
      const next = (i + 1) / DECK_SEGMENTS;
      const p = ROUTE.getPointAt(t);
      const pn = ROUTE.getPointAt(Math.min(1, next));
      const len = p.distanceTo(pn) * 1.08; // slight overlap, no seams

      dummy.position.copy(p);
      up.copy(frames.normals[i] ?? new THREE.Vector3(0, 1, 0));
      dummy.up.copy(up);
      dummy.lookAt(pn);
      dummy.scale.set(1, 1, len);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [frames]);

  return <instancedMesh ref={ref} args={[geometry, material, DECK_SEGMENTS]} frustumCulled={false} />;
}

/** The two glowing rails that make the route readable from a distance. */
function Rails() {
  const geometries = useMemo(() => {
    const left = new THREE.TubeGeometry(offsetCurve(-DECK_HALF_WIDTH), 300, 0.038, 6, false);
    const right = new THREE.TubeGeometry(offsetCurve(DECK_HALF_WIDTH), 300, 0.038, 6, false);
    return [left, right];
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a1d05",
        emissive: new THREE.Color(AMBER),
        emissiveIntensity: 1.5,
        roughness: 0.4,
        metalness: 0.03,
        toneMapped: false,
      }),
    [],
  );

  return (
    <>
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g} material={material} frustumCulled={false} />
      ))}
    </>
  );
}

/** Support pylons dropping away beneath the deck — the span reads as built. */
function Pylons() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 26;

  const geometry = useMemo(() => new THREE.BoxGeometry(0.22, 1, 0.22), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#161616", roughness: 0.9, metalness: 0.02 }),
    [],
  );

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < COUNT; i++) {
      const t = (i + 0.5) / COUNT;
      const p = ROUTE.getPointAt(t);
      const drop = p.y + 16; // down to the ground plane
      dummy.position.set(p.x, p.y - drop / 2, p.z);
      dummy.scale.set(1, drop, 1);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return <instancedMesh ref={ref} args={[geometry, material, COUNT]} frustumCulled={false} />;
}

/** Ribs arching over one stretch of the route — the tunnel chapter. */
function Tunnel() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 42;

  const geometry = useMemo(() => new THREE.TorusGeometry(2.6, 0.1, 6, 16, Math.PI), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#232323",
        roughness: 0.75,
        metalness: 0.03,
        emissive: new THREE.Color(AMBER),
        emissiveIntensity: 0.12,
      }),
    [],
  );

  const frames = useMemo(() => routeFrames(DECK_SEGMENTS), []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const [a, b] = TUNNEL_RANGE;

    for (let i = 0; i < COUNT; i++) {
      const t = a + ((b - a) * i) / (COUNT - 1);
      const p = ROUTE.getPointAt(t);
      const idx = Math.min(Math.round(t * DECK_SEGMENTS), frames.normals.length - 1);
      dummy.position.copy(p);
      dummy.up.copy(frames.normals[idx] ?? new THREE.Vector3(0, 1, 0));
      dummy.lookAt(ROUTE.getPointAt(Math.min(1, t + 0.004)));
      dummy.rotateY(Math.PI / 2);
      dummy.rotateZ(Math.PI / 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [frames]);

  return <instancedMesh ref={ref} args={[geometry, material, COUNT]} frustumCulled={false} />;
}

/** Marker lamps beside the route — the only lime in the world. */
function Markers() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const COUNT = 18;

  const geometry = useMemo(() => new THREE.SphereGeometry(0.055, 8, 8), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: LIME,
        emissive: new THREE.Color(LIME),
        emissiveIntensity: 1.6,
        toneMapped: false,
      }),
    [],
  );

  const frames = useMemo(() => routeFrames(DECK_SEGMENTS), []);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < COUNT; i++) {
      const t = (i + 0.3) / COUNT;
      const p = ROUTE.getPointAt(t);
      const idx = Math.min(Math.round(t * DECK_SEGMENTS), frames.binormals.length - 1);
      const b = frames.binormals[idx] ?? new THREE.Vector3(1, 0, 0);
      const side = i % 2 === 0 ? 1 : -1;
      dummy.position.copy(p).addScaledVector(b, DECK_HALF_WIDTH * side * 1.12);
      dummy.position.y += 0.16;
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [frames]);

  return <instancedMesh ref={ref} args={[geometry, material, COUNT]} frustumCulled={false} />;
}

/** The floor, far below — read only as a faint grid through the fog. */
function Ground() {
  return (
    <gridHelper
      args={[900, 180, new THREE.Color("#2a2a2a"), new THREE.Color("#1a1a1a")]}
      position={[0, -16, -90]}
    />
  );
}

/* ------------------------------------------------------------------ */
/* The traveller                                                       */
/* ------------------------------------------------------------------ */

/**
 * Alpha's engineering core, now the thing making the journey.
 *
 * Same object as before — four stacked plates (sense, logic, model,
 * surface), routed traces, vias, indicator lamps — but travelling the
 * route instead of sitting still. It banks into curves, the plates
 * breathe apart and back together, and it throws amber light onto the
 * deck as it passes.
 */
function Core({ progress }: { progress: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const plates = useRef<(THREE.Group | null)[]>([]);
  const lamp = useRef<THREE.PointLight>(null);

  const PLATES = useMemo(
    () => [
      { y: -0.3, size: 1.5 },
      { y: -0.1, size: 1.3 },
      { y: 0.1, size: 1.1 },
      { y: 0.3, size: 0.85 },
    ],
    [],
  );

  const plateMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2b2b2b", roughness: 0.7, metalness: 0.04 }),
    [],
  );
  const railMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a1a1a",
        roughness: 0.5,
        metalness: 0.04,
        emissive: new THREE.Color(AMBER),
        emissiveIntensity: 0.5,
      }),
    [],
  );
  const viaMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3a2906",
        emissive: new THREE.Color(AMBER),
        emissiveIntensity: 1.1,
        roughness: 0.35,
        metalness: 0.05,
        toneMapped: false,
      }),
    [],
  );

  // Reused every frame rather than reallocated.
  const pos = useMemo(() => new THREE.Vector3(), []);
  const ahead = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, delta) => {
    const g = group.current;
    if (!g) return;
    const t = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);

    ROUTE.getPointAt(t, pos);
    ROUTE.getPointAt(Math.min(1, t + 0.004), ahead);

    // Ride a little above the deck, and ease rather than snap so a
    // flung scroll reads as acceleration instead of teleporting.
    g.position.lerp(pos.clone().setY(pos.y + 0.55), 0.18);
    g.lookAt(ahead.x, ahead.y + 0.55, ahead.z);

    // Bank into the turn, derived from how fast x is changing.
    const bank = THREE.MathUtils.clamp((ahead.x - pos.x) * -0.5, -0.4, 0.4);
    g.rotation.z += (bank - g.rotation.z) * 0.07;

    // The stack breathes: plates drift apart and settle, continuously.
    const breathe = Math.sin(clock.elapsedTime * 0.7) * 0.5 + 0.5;
    plates.current.forEach((pl, i) => {
      if (!pl) return;
      const spread = (i - (PLATES.length - 1) / 2) * breathe * 0.1;
      pl.position.y += (PLATES[i].y + spread - pl.position.y) * 0.08;
      pl.rotation.y += delta * (0.12 + i * 0.05);
    });

    if (lamp.current) {
      lamp.current.intensity = 3.4 + Math.sin(clock.elapsedTime * 2.2) * 0.5;
    }
  });

  return (
    <group ref={group}>
      {/* throws light onto the deck as it travels */}
      <pointLight ref={lamp} intensity={3.4} distance={13} decay={1.4} color={AMBER_BRIGHT} />

      {/* vias binding the stack into one object */}
      {([
        [0.5, 0.42],
        [-0.46, 0.34],
        [0.3, -0.48],
        [-0.36, -0.4],
      ] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]} material={viaMat}>
          <cylinderGeometry args={[0.018, 0.018, 0.84, 8]} />
        </mesh>
      ))}

      {PLATES.map((plate, i) => (
        <group
          key={i}
          ref={(el) => {
            plates.current[i] = el;
          }}
          position={[0, plate.y, 0]}
        >
          <mesh material={plateMat}>
            <boxGeometry args={[plate.size, 0.035, plate.size]} />
          </mesh>
          <mesh material={railMat}>
            <boxGeometry args={[plate.size + 0.01, 0.012, plate.size + 0.01]} />
          </mesh>
        </group>
      ))}

      {/* lamp at the leading edge */}
      <mesh position={[0, 0, 0.75]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial
          color={AMBER_BRIGHT}
          emissive={AMBER_BRIGHT}
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

/**
 * The camera is never cut — it is interpolated.
 *
 * Each chapter declares a framing (see `shots.ts`); as scroll crosses
 * from one chapter to the next, the offset and look-ahead blend
 * between the two. That is what keeps eight visually distinct shots
 * feeling like one continuous move rather than eight scenes.
 */
function Rig({
  progress,
  shots,
  pointer,
}: {
  progress: React.RefObject<number>;
  shots: ShotName[];
  pointer: React.RefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();

  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const side = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame(() => {
    const t = THREE.MathUtils.clamp(progress.current ?? 0, 0, 1);

    // Which two shots are we between?
    const scaled = t * (shots.length - 1);
    const i = Math.min(shots.length - 2, Math.floor(scaled));
    const k = THREE.MathUtils.smoothstep(scaled - i, 0, 1);
    const a = SHOTS[shots[i]];
    const b = SHOTS[shots[i + 1]];

    ROUTE.getPointAt(t, pos);
    ROUTE.getTangentAt(t, tangent);
    side.crossVectors(tangent, up).normalize();

    const back = THREE.MathUtils.lerp(a.back, b.back, k);
    const lift = THREE.MathUtils.lerp(a.lift, b.lift, k);
    const lateral = THREE.MathUtils.lerp(a.side, b.side, k);
    const aheadBy = THREE.MathUtils.lerp(a.lookAhead, b.lookAhead, k);

    desired
      .copy(pos)
      .addScaledVector(tangent, -back)
      .addScaledVector(side, lateral);
    desired.y += lift;

    // A whisper of pointer parallax — enough to feel alive, never
    // enough to fight the authored framing.
    const p = pointer.current ?? { x: 0, y: 0 };
    desired.x += p.x * 0.5;
    desired.y += p.y * 0.3;

    camera.position.lerp(desired, 0.085);

    ROUTE.getPointAt(THREE.MathUtils.clamp(t + aheadBy, 0, 1), lookTarget);
    lookTarget.y += THREE.MathUtils.lerp(a.lookLift, b.lookLift, k);
    look.lerp(lookTarget, 0.1);
    camera.lookAt(look);
  });

  return null;
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

function World({
  progress,
  shots,
  pointer,
}: {
  progress: React.RefObject<number>;
  shots: ShotName[];
  pointer: React.RefObject<{ x: number; y: number }>;
}) {
  const { setFrameloop } = useThree();

  useEffect(() => {
    const onVisibility = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setFrameloop]);

  return (
    <>
      <fogExp2 attach="fog" args={[INK, 0.013]} />
      <color attach="background" args={[INK]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 18, 6]} intensity={0.75} color="#fff4e0" />
      <pointLight position={[-14, 8, -60]} intensity={1.2} decay={0} color="#9bb0c4" />

      <Ground />
      <Deck />
      <Rails />
      <Pylons />
      <Tunnel />
      <Markers />
      <Core progress={progress} />
      <Rig progress={progress} shots={shots} pointer={pointer} />
    </>
  );
}

export default function JourneyScene({
  progress,
  shots,
  className = "",
}: {
  progress: React.RefObject<number>;
  shots: ShotName[];
  className?: string;
}) {
  const pointer = useRef({ x: 0, y: 0 });

  return (
    <div
      className={className}
      onPointerMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        pointer.current.x = ((e.clientX - box.left) / box.width) * 2 - 1;
        pointer.current.y = -(((e.clientY - box.top) / box.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
      }}
    >
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 3, 20], fov: 42, near: 0.1, far: 400 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        <World progress={progress} shots={shots} pointer={pointer} />
      </Canvas>
    </div>
  );
}
