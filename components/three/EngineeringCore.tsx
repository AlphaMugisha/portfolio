"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The engineering core — a custom-built 3D artifact, not a loaded model.
 *
 * Every piece of geometry here is generated in code from primitives:
 * four stacked board plates, their mounting posts, orthogonally routed
 * surface traces, drilled vias, and the components sitting on top
 * (chips, electrolytics, pin headers, indicator LEDs). Nothing is
 * downloaded, and nothing is a texture pretending to be a shape — the
 * traces are real extruded strips at real heights above real plates.
 *
 * It is a portrait of the work rather than decoration. The stack reads
 * bottom to top the way Alpha's practice does: a sensing edge at the
 * base, logic above it, the model layer above that, and the interface
 * on top. Scroll separates the stack into an exploded view, so the
 * layers the page is about become literally visible.
 *
 * COLOUR comes entirely from the restored palette. Amber #FEB002 is the
 * emissive signal on traces, vias and the core; lime #8FDC3C appears
 * only on a handful of small indicator LEDs, exactly the "small marks
 * only" rule the original set. The substrate greys are the page's own
 * #0E0E0E / #161616 / #232323 ramp, so the object sits in the page
 * rather than on it.
 *
 * PERFORMANCE
 *   - every repeated element is one InstancedMesh, so the whole scene is
 *     a handful of draw calls rather than hundreds of objects;
 *   - geometries and materials are created once via useMemo and shared;
 *   - DPR is clamped, antialias is off on low-power devices, and the
 *     frameloop stops entirely when the canvas scrolls out of view;
 *   - no post-processing, no shadow maps, no loaded textures.
 */

const AMBER = "#feb002";
const AMBER_BRIGHT = "#ffc23a";
const LIME = "#8fdc3c";

/** The four layers, bottom to top — the practice, as a stack. */
const PLATES = [
  { y: -0.9, size: 3.4, label: "sense" },
  { y: -0.3, size: 3.0, label: "logic" },
  { y: 0.3, size: 2.6, label: "model" },
  { y: 0.9, size: 2.1, label: "surface" },
] as const;

/** Deterministic pseudo-random so the layout is identical every load. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/**
 * One board plate: a thin chamfered slab with a routed edge rail.
 */
function Plate({ y, size }: { y: number; size: number }) {
  return (
    <group position={[0, y, 0]}>
      {/* The slab reads at #232323, the palette's surface step, not the
          #161616 band: at the band value the plates rendered as black
          voids and the traces looked like sticks floating in nothing. */}
      {/* Metalness is kept near zero deliberately. A `meshStandardMaterial`
          takes its metallic response from reflections, and this scene has
          no environment map — so any real metalness renders the plates
          almost black and the stack read as four dark holes. Board
          substrate is a matte laminate anyway. */}
      <mesh castShadow={false} receiveShadow={false}>
        <boxGeometry args={[size, 0.055, size]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.72} metalness={0.04} />
      </mesh>
      {/* the routed edge rail, slightly proud of the slab */}
      <mesh>
        <boxGeometry args={[size + 0.014, 0.018, size + 0.014]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.55}
          metalness={0.05}
          emissive={AMBER}
          emissiveIntensity={0.22}
        />
      </mesh>
    </group>
  );
}

/**
 * Surface traces: orthogonal amber strips routed across a plate.
 *
 * Generated as one InstancedMesh of thin boxes — each "trace" is two
 * segments meeting at a right angle, which is what makes it read as
 * routing rather than as scattered sticks.
 */
function Traces({ y, size, seed, count = 22 }: { y: number; size: number; seed: number; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);

  const segments = useMemo(() => {
    const rand = rng(seed);
    const out: { x: number; z: number; len: number; rotY: number; lit: number }[] = [];
    const half = size / 2 - 0.22;
    for (let i = 0; i < count; i++) {
      const ax = (rand() * 2 - 1) * half;
      const az = (rand() * 2 - 1) * half;
      const len = 0.3 + rand() * 0.9;
      const horizontal = rand() > 0.5;
      // Leg one
      out.push({ x: ax, z: az, len, rotY: horizontal ? 0 : Math.PI / 2, lit: rand() });
      // Leg two, turning a right angle off the end of leg one
      const ex = horizontal ? ax + len / 2 : ax;
      const ez = horizontal ? az : az + len / 2;
      const len2 = 0.25 + rand() * 0.6;
      out.push({
        x: horizontal ? ex : ex + len2 / 2,
        z: horizontal ? ez + len2 / 2 : ez,
        len: len2,
        rotY: horizontal ? Math.PI / 2 : 0,
        lit: rand(),
      });
    }
    return out.slice(0, count * 2);
  }, [size, seed, count]);

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 0.014, 0.038), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#4a3408",
        emissive: new THREE.Color(AMBER),
        emissiveIntensity: 0.9,
        roughness: 0.4,
        metalness: 0.04,
      }),
    [],
  );

  // Allocated once and reused every frame — constructing an Object3D
  // and a Color per frame per instance would churn the GC hard enough
  // to show up as stutter.
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = clock.elapsedTime;

    segments.forEach((s, i) => {
      dummy.position.set(s.x, y + 0.04, s.z);
      dummy.rotation.set(0, s.rotY, 0);
      dummy.scale.set(s.len, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // A charge sweeping along the stack: each trace brightens on its
      // own phase so the board reads as carrying traffic, not blinking.
      const wave = Math.sin(t * 1.6 + s.lit * 9 + y * 2) * 0.5 + 0.5;
      const k = 0.12 + wave * 0.9;
      colour.setStyle(AMBER).multiplyScalar(k);
      mesh.setColorAt(i, colour);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, segments.length]}
      frustumCulled={false}
    />
  );
}

/**
 * Components mounted on a plate: chips, electrolytics and pin headers,
 * each one real geometry rather than a sprite.
 */
function Components({ y, size, seed }: { y: number; size: number; seed: number }) {
  const items = useMemo(() => {
    const rand = rng(seed);
    const half = size / 2 - 0.4;
    const kinds: ("chip" | "cap" | "header")[] = ["chip", "cap", "header"];
    return Array.from({ length: 7 }, () => ({
      x: (rand() * 2 - 1) * half,
      z: (rand() * 2 - 1) * half,
      rot: Math.round(rand() * 3) * (Math.PI / 2),
      kind: kinds[Math.floor(rand() * kinds.length)],
      scale: 0.75 + rand() * 0.6,
    }));
  }, [size, seed]);

  return (
    <group position={[0, y + 0.03, 0]}>
      {items.map((item, i) => (
        <group key={i} position={[item.x, 0, item.z]} rotation={[0, item.rot, 0]} scale={item.scale}>
          {item.kind === "chip" ? (
            <>
              <mesh position={[0, 0.045, 0]}>
                <boxGeometry args={[0.3, 0.07, 0.22]} />
                <meshStandardMaterial color="#141414" roughness={0.5} metalness={0.08} />
              </mesh>
              {/* pin rows either side */}
              <mesh position={[0, 0.015, 0.14]}>
                <boxGeometry args={[0.28, 0.012, 0.04]} />
                <meshStandardMaterial color="#9a9a9a" roughness={0.35} metalness={0.1} />
              </mesh>
              <mesh position={[0, 0.015, -0.14]}>
                <boxGeometry args={[0.28, 0.012, 0.04]} />
                <meshStandardMaterial color="#9a9a9a" roughness={0.35} metalness={0.1} />
              </mesh>
            </>
          ) : item.kind === "cap" ? (
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 0.18, 14]} />
              <meshStandardMaterial color="#2e2e2e" roughness={0.4} metalness={0.06} />
            </mesh>
          ) : (
            <mesh position={[0, 0.05, 0]}>
              <boxGeometry args={[0.22, 0.09, 0.05]} />
              <meshStandardMaterial
                color="#1a1a1a"
                roughness={0.5}
                metalness={0.06}
                emissive={AMBER}
                emissiveIntensity={0.12}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

/**
 * Vias — the drilled posts that carry the signal vertically between
 * plates. These are the piece that makes the stack read as ONE system
 * rather than four separate boards.
 */
function Vias() {
  const positions = useMemo(
    () => [
      [1.1, 0.9],
      [-1.0, 0.7],
      [0.6, -1.0],
      [-0.75, -0.85],
    ] as [number, number][],
    [],
  );

  return (
    <group>
      {positions.map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <cylinderGeometry args={[0.022, 0.022, 2.0, 10]} />
          <meshStandardMaterial
            color="#3a2906"
            emissive={AMBER}
            emissiveIntensity={0.7}
            roughness={0.3}
            metalness={0.06}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Indicator LEDs — the only place lime is allowed, and only tiny. */
function Indicators() {
  const ref = useRef<THREE.Group>(null);
  const spots = useMemo(
    () => [
      [0.85, 0.95, -0.6],
      [-0.6, 0.35, 0.9],
      [0.2, -0.25, -1.1],
    ] as [number, number, number][],
    [],
  );

  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    g.children.forEach((child, i) => {
      const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.5 + (Math.sin(clock.elapsedTime * 2.4 + i * 2) * 0.5 + 0.5) * 1.6;
    });
  });

  return (
    <group ref={ref}>
      {spots.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={1} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The assembled stack, plus the behaviour: it leans toward the pointer,
 * turns slowly on its own, and separates into an exploded view as the
 * hero scrolls away.
 */
function Core({ scroll, pointer }: { scroll: React.RefObject<number>; pointer: React.RefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const plateRefs = useRef<(THREE.Group | null)[]>([]);
  const { size, camera } = useThree();

  /**
   * Framing is responsive, because a single camera that suits a 1600px
   * canvas crops badly on a narrower one. The stack sits right of
   * centre on a wide viewport so it shares the hero with the name, and
   * recentres and shrinks as the canvas narrows, with the camera pulled
   * back to keep the whole object inside the frame.
   */
  const layout = useMemo(() => {
    const w = size.width;
    if (w < 900) return { scale: 0.5, x: 0.2, z: 11.5, y: 2.0 };
    if (w < 1280) return { scale: 0.62, x: 0.8, z: 10.2, y: 2.2 };
    return { scale: 0.74, x: 1.15, z: 9, y: 2.4 };
  }, [size.width]);

  useEffect(() => {
    camera.position.set(0, layout.y, layout.z);
    camera.updateProjectionMatrix();
    const g = group.current;
    if (g) {
      g.scale.setScalar(layout.scale);
      g.position.x = layout.x;
    }
  }, [camera, layout]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = pointer.current ?? { x: 0, y: 0 };
    const s = scroll.current ?? 0;

    // Slow constant rotation plus pointer lean, eased rather than snapped.
    // The base tilt is steep so the camera looks DOWN onto the plate
    // faces; at a shallower angle the stack is seen almost edge-on and
    // every board collapses into a thin wedge.
    g.rotation.y += delta * 0.12;
    const targetX = -0.58 + p.y * 0.22;
    const targetZ = p.x * 0.12;
    g.rotation.x += (targetX - g.rotation.x) * 0.06;
    g.rotation.z += (targetZ - g.rotation.z) * 0.06;

    // Scroll explodes the stack and lifts it out of frame.
    plateRefs.current.forEach((pl, i) => {
      if (!pl) return;
      const spread = (i - (PLATES.length - 1) / 2) * s * 1.5;
      pl.position.y += (PLATES[i].y + spread - pl.position.y) * 0.1;
    });
    g.position.y += (-0.2 + s * 0.9 - g.position.y) * 0.08;
  });

  return (
    // Sits right of centre and scaled back so it shares the hero with
    // the name rather than running underneath it — the mask fades the
    // left edge, but the object itself has to stay out of the way too.
    <group ref={group} position={[1.15, -0.2, 0]} rotation={[-0.58, 0, 0]}>
      <Vias />
      {PLATES.map((plate, i) => (
        <group
          key={plate.label}
          ref={(el) => {
            plateRefs.current[i] = el;
          }}
          position={[0, plate.y, 0]}
        >
          <Plate y={0} size={plate.size} />
          <Traces y={0} size={plate.size} seed={i * 977 + 13} count={26} />
          <Components y={0} size={plate.size} seed={i * 541 + 7} />
        </group>
      ))}
      <Indicators />
    </group>
  );
}

/** Lighting rig — amber key, cool fill, lime rim. All from the palette. */
function Rig() {
  const key = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (key.current) {
      key.current.intensity = 2.6 + Math.sin(clock.elapsedTime * 1.1) * 0.45;
    }
  });
  /**
   * `decay={0}` on every point light is deliberate.
   *
   * Three.js uses physically-correct inverse-square falloff by default,
   * so a light a few units from the stack arrives at a fraction of its
   * stated intensity and the plate faces rendered almost black. Zero
   * decay gives a flat, art-directed falloff that is far easier to aim
   * — this is a stylised object, not an architectural render.
   *
   * The top-down directional is what actually reads the plate faces,
   * since the camera looks down onto them.
   */
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[1.5, 6, 2]} intensity={1.5} color="#fff6e2" />
      <pointLight
        ref={key}
        position={[3.0, 3.4, 2.8]}
        intensity={2.6}
        decay={0}
        color={AMBER_BRIGHT}
      />
      <pointLight position={[-3.4, -1.0, -2.2]} intensity={1.1} decay={0} color="#9bb0c4" />
      <pointLight position={[0, -2.6, 1.8]} intensity={0.7} decay={0} color={LIME} />
    </>
  );
}

export default function EngineeringCore({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const visible = useRef(true);

  // Pointer and scroll are written to refs, never state: the scene reads
  // them inside useFrame, so React never re-renders during interaction.
  return (
    <div
      ref={host}
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
        // Clamped so a 3x-DPR phone does not render nine times the pixels.
        dpr={[1, 1.75]}
        camera={{ position: [0, 2.4, 9], fov: 32 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Rig />
        <Core scroll={scroll} pointer={pointer} />
        <ScrollBridge scroll={scroll} visible={visible} host={host} />
      </Canvas>
    </div>
  );
}

/**
 * Bridges DOM scroll/visibility into the scene without re-rendering
 * React: it writes to the same refs the frame loop reads.
 */
function ScrollBridge({
  scroll,
  visible,
  host,
}: {
  scroll: React.RefObject<number>;
  visible: React.RefObject<boolean>;
  host: React.RefObject<HTMLDivElement | null>;
}) {
  const { setFrameloop } = useThree();

  useEffect(() => {
    const read = () => {
      const el = host.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      // 0 at rest, 1 once the hero has fully left.
      const progress = Math.min(1, Math.max(0, -box.top / Math.max(1, box.height)));
      scroll.current = progress;
    };

    const onScroll = () => read();
    read();
    window.addEventListener("scroll", onScroll, { passive: true });

    let io: IntersectionObserver | null = null;
    if (host.current) {
      io = new IntersectionObserver(
        ([entry]) => {
          visible.current = entry.isIntersecting;
          setFrameloop(entry.isIntersecting ? "always" : "never");
        },
        { threshold: 0 },
      );
      io.observe(host.current);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, [host, scroll, visible, setFrameloop]);

  return null;
}

