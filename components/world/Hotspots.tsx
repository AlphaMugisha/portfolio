"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { besideRoad, headingAt } from "./route";
import type { Hotspot } from "@/lib/world";

/**
 * Things you can walk up to.
 *
 * Every one of these is a physical object standing in the landscape —
 * a marker stone, a roadside board, a beacon, a project monolith. None
 * of them is a floating card, and none of them carries text geometry:
 * rendering type in 3D needs a font file fetched at runtime, and the
 * one thing worse than no label is a label that arrives two seconds
 * late in the wrong typeface. The object signals that it is live by
 * glowing; the words appear as real HTML when you open it.
 *
 * The pulse ring is the affordance. It is the only element in the
 * world that moves on its own, so it reads as "this is interactive"
 * without any instruction.
 */

const AMBER = "#feb002";
const LIME = "#8fdc3c";

export interface LiveSpot extends Hotspot {
  /** Absolute position along the whole route, 0..1. */
  t: number;
  /** Which environment it belongs to — drives the switcher highlight. */
  env: number;
  /** Project portals read differently from information markers. */
  kind: "info" | "portal";
}

function useHover() {
  const [hovered, setHovered] = useState(false);
  const bind = useMemo(
    () => ({
      onPointerOver: (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      },
      onPointerOut: () => {
        setHovered(false);
        document.body.style.cursor = "";
      },
    }),
    [],
  );
  return [hovered, bind] as const;
}

/** The halo that says "this one is live". */
function Pulse({ y, active, tint }: { y: number; active: boolean; tint: string }) {
  const ring = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (!ring.current || !mat.current) return;
    const k = (clock.elapsedTime * 0.55) % 1;
    const s = 0.7 + k * 2.6 + (active ? 0.9 : 0);
    ring.current.scale.set(s, s, s);
    mat.current.opacity = (1 - k) * (active ? 0.85 : 0.5);
  });
  return (
    <mesh ref={ring} position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.82, 1, 44]} />
      <meshBasicMaterial
        ref={mat}
        color={tint}
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */

function Marker({ active }: { active: boolean }) {
  return (
    <group>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.52, 3, 6]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[0, 3.22, 0]}>
        <octahedronGeometry args={[0.46, 0]} />
        <meshStandardMaterial
          color={AMBER}
          emissive={new THREE.Color(AMBER)}
          emissiveIntensity={active ? 3.2 : 1.5}
          roughness={0.3}
        />
      </mesh>
      <Pulse y={0.06} active={active} tint={AMBER} />
    </group>
  );
}

function Sign({ active }: { active: boolean }) {
  return (
    <group>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 3.2, 6]} />
          <meshStandardMaterial color="#2b2b2b" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 3.6, 0]} castShadow>
        <boxGeometry args={[3.4, 2.1, 0.16]} />
        <meshStandardMaterial color="#141414" roughness={0.42} metalness={0.3} />
      </mesh>
      {/* Three amber rules on the board face. Not language — just the
          visual rhythm of a legend, which is enough at driving speed. */}
      {[0.48, 0.0, -0.48].map((y, i) => (
        <mesh key={y} position={[i === 0 ? -0.3 : i === 1 ? -0.7 : -1.0, 3.6 + y, 0.1]}>
          <boxGeometry args={[i === 0 ? 2.5 : i === 1 ? 1.7 : 1.1, 0.16, 0.03]} />
          <meshStandardMaterial
            color={AMBER}
            emissive={new THREE.Color(AMBER)}
            emissiveIntensity={active ? 2.6 : 1.1}
          />
        </mesh>
      ))}
      <Pulse y={0.06} active={active} tint={AMBER} />
    </group>
  );
}

function Beacon({ active }: { active: boolean }) {
  const inner = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (inner.current) inner.current.rotation.y = clock.elapsedTime * 0.8;
  });
  return (
    <group>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[1.1, 1.4, 0.6, 12]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh ref={inner} position={[0, 3, 0]}>
        <torusGeometry args={[0.95, 0.12, 8, 30]} />
        <meshStandardMaterial
          color={LIME}
          emissive={new THREE.Color(LIME)}
          emissiveIntensity={active ? 3.4 : 1.6}
        />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 3, 6]} />
        <meshStandardMaterial color="#303030" roughness={0.5} metalness={0.7} />
      </mesh>
      {/* The shaft of light. Additive, so it reads in rain and at dusk. */}
      <mesh position={[0, 9, 0]}>
        <cylinderGeometry args={[0.5, 0.95, 12, 12, 1, true]} />
        <meshBasicMaterial
          color={LIME}
          transparent
          opacity={active ? 0.2 : 0.09}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <Pulse y={0.08} active={active} tint={LIME} />
    </group>
  );
}

/**
 * A project portal. A standing slab with a lit aperture cut through it
 * — the installation form the brief asked for instead of a card. The
 * aperture is what you are meant to want to drive through.
 */
function Portal({ active, rank }: { active: boolean; rank: number }) {
  const glow = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (glow.current)
      glow.current.emissiveIntensity =
        (active ? 1.9 : 0.72) + Math.sin(clock.elapsedTime * 1.6 + rank) * 0.18;
  });
  return (
    <group>
      {/* The two uprights and the lintel form the aperture. */}
      {[-1.9, 1.9].map((x) => (
        <mesh key={x} position={[x, 4, 0]} castShadow>
          <boxGeometry args={[0.7, 8, 0.7]} />
          <meshStandardMaterial color="#232323" roughness={0.34} metalness={0.68} />
        </mesh>
      ))}
      <mesh position={[0, 8.3, 0]} castShadow>
        <boxGeometry args={[5.1, 0.9, 0.9]} />
        <meshStandardMaterial color="#232323" roughness={0.34} metalness={0.68} />
      </mesh>
      {/* The lit plane inside the frame. */}
      <mesh position={[0, 4.3, -0.12]}>
        <planeGeometry args={[3.1, 7]} />
        <meshStandardMaterial
          ref={glow}
          color="#120d04"
          emissive={new THREE.Color(AMBER)}
          emissiveIntensity={0.72}
          roughness={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Rank bars along the base — a tally, not a label. */}
      {Array.from({ length: Math.min(rank + 1, 8) }).map((_, i) => (
        <mesh key={i} position={[-1.9, 1.1 + i * 0.3, 0.4]}>
          <boxGeometry args={[0.44, 0.1, 0.06]} />
          <meshStandardMaterial
            color={LIME}
            emissive={new THREE.Color(LIME)}
            emissiveIntensity={active ? 2.4 : 0.9}
          />
        </mesh>
      ))}
      <Pulse y={0.08} active={active} tint={AMBER} />
    </group>
  );
}

/* ------------------------------------------------------------------ */

export default function Hotspots({
  spots,
  openId,
  onOpen,
}: {
  spots: LiveSpot[];
  openId: string | null;
  onOpen: (spot: LiveSpot) => void;
}) {
  return (
    <group>
      {spots.map((s, i) => (
        <Standing key={s.id} spot={s} rank={i} open={openId === s.id} onOpen={onOpen} />
      ))}
    </group>
  );
}

function Standing({
  spot,
  rank,
  open,
  onOpen,
}: {
  spot: LiveSpot;
  rank: number;
  open: boolean;
  onOpen: (s: LiveSpot) => void;
}) {
  const [hovered, bind] = useHover();
  const active = hovered || open;

  const { pos, rot } = useMemo(() => {
    const p = besideRoad(spot.t, spot.side, 0, new THREE.Vector3());
    // Turned a little past square so it faces oncoming traffic rather
    // than the horizon.
    const face = headingAt(spot.t) + (spot.side > 0 ? -1 : 1) * 0.42 + Math.PI;
    return { pos: p, rot: face };
  }, [spot.t, spot.side]);

  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    const want = active ? 1.07 : 1;
    const s = group.current.scale.x;
    group.current.scale.setScalar(s + (want - s) * Math.min(1, delta * 7));
  });

  return (
    <group
      ref={group}
      position={pos}
      rotation={[0, rot, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(spot);
      }}
      {...bind}
    >
      {spot.kind === "portal" ? (
        <Portal active={active} rank={rank} />
      ) : spot.form === "sign" ? (
        <Sign active={active} />
      ) : spot.form === "beacon" ? (
        <Beacon active={active} />
      ) : (
        <Marker active={active} />
      )}
    </group>
  );
}
