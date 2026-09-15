"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SkillGroup } from "@/lib/skills";
import { PALETTE, HEX } from "@/lib/palette";

/**
 * The technical universe, as constellations in the room.
 *
 * Each skill group is a cluster of nodes around a wireframe hub, and the
 * clusters are strung into depth along the same weaving aisle the project
 * rack uses — software nearest, then hardware, AI, data, each a room-length
 * further in. Scroll moves the camera from cluster to cluster, so reading
 * the section IS travelling through the stack; ahead you can always see the
 * next discipline waiting, dimmer and deeper.
 *
 * The nodes are deliberately abstract — points of light, not logos. The
 * words live in the DOM column beside the canvas (readable, selectable,
 * crawlable), and hovering a chip there lights its node here. The canvas
 * carries space; the DOM carries names. Same division of labour as
 * everywhere else on the site.
 *
 * Determinism matters: node positions come from a hash of their index, not
 * Math.random, so the constellation is the same shape on every visit. A
 * constellation that rearranged itself nightly would stop being a map.
 */

export interface HoverTarget {
  group: number;
  skill: number;
}

/* The aisle. Same hand-weave grammar as the rack's LAYOUT — the camera is
   always turning slightly, no cluster sits dead ahead of the last. */
const CLUSTERS = [
  { x: 0.0, y: 0.1 },
  { x: 0.95, y: -0.25 },
  { x: -0.85, y: 0.2 },
  { x: 0.55, y: -0.15 },
];

const PITCH = 7;

/** Deterministic 0..1 from an integer. */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

const nodeVertex = /* glsl */ `
  attribute float aIndex;
  uniform float uTime;
  uniform float uDpr;
  uniform float uHover;   // index within this cluster, or -1
  uniform float uFocus;   // 0..1 — is this the cluster being read
  varying float vIndex;
  varying float vHover;

  void main() {
    vIndex = aIndex;
    vHover = 1.0 - step(0.5, abs(aIndex - uHover));
    vec3 pos = position;
    // The cluster breathes: each node orbits its own point a few cm. Slow,
    // asynchronous, alive without being busy.
    pos.x += sin(uTime * 0.4 + aIndex * 1.7) * 0.045;
    pos.y += cos(uTime * 0.33 + aIndex * 2.3) * 0.045;
    pos.z += sin(uTime * 0.27 + aIndex * 3.1) * 0.03;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // Perspective-attenuated, boosted by focus and again by hover.
    float size = 3.2 + uFocus * 1.6 + vHover * 4.0;
    gl_PointSize = uDpr * size * (5.5 / -mv.z);
  }
`;

const nodeFragment = /* glsl */ `
  precision mediump float;
  // highp to match the vertex stage — strict drivers (ANGLE) refuse to link
  // a program whose shared uniform differs in precision between stages.
  uniform highp float uTime;
  uniform float uAlpha;
  uniform vec3 uPaper;
  uniform vec3 uGold;
  varying float vIndex;
  varying float vHover;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.18, d);
    float breathe = 0.75 + 0.25 * sin(uTime * 0.7 + vIndex * 2.9);
    // The hovered node takes the accent; the rest stay paper. Gold is
    // attention, here as everywhere on the site.
    vec3 tone = mix(uPaper, uGold * 1.35, vHover);
    float alpha = disc * breathe * uAlpha * (1.0 + vHover * 0.9);
    gl_FragColor = vec4(tone, alpha);
  }
`;

function Cluster({
  group,
  index,
  active,
  hover,
  reduced,
}: {
  group: SkillGroup;
  index: number;
  active: number;
  hover: number; // skill index within this cluster, or -1
  reduced: boolean;
}) {
  const spokeMat = useRef<THREE.LineBasicMaterial>(null);
  const hubMat = useRef<THREE.LineBasicMaterial>(null);
  const hub = useRef<THREE.LineSegments>(null);
  const hubColor = useRef({ t: 0 });

  const centre = CLUSTERS[index % CLUSTERS.length];
  const n = group.skills.length;

  /* Node positions: a flattened shell around the hub. Radius keeps every
     node clear of the hub glyph; the z-flattening keeps the cluster legible
     from down the aisle rather than smeared along it. */
  const { nodes, spokes } = useMemo(() => {
    const pos = new Float32Array(n * 3);
    const idx = new Float32Array(n);
    const line = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) {
      const seed = index * 100 + i;
      const theta = hash(seed * 3) * Math.PI * 2;
      const phi = Math.acos(2 * hash(seed * 3 + 1) - 1);
      const r = 0.62 + hash(seed * 3 + 2) * 0.85;
      const x = Math.sin(phi) * Math.cos(theta) * r;
      const y = Math.cos(phi) * r * 0.75;
      const z = Math.sin(phi) * Math.sin(theta) * r * 0.55;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      idx[i] = i;
      // Spoke from just off the hub surface to the node.
      line[i * 6] = x * 0.22;
      line[i * 6 + 1] = y * 0.22;
      line[i * 6 + 2] = z * 0.22;
      line[i * 6 + 3] = x;
      line[i * 6 + 4] = y;
      line[i * 6 + 5] = z;
    }
    const nodes = new THREE.BufferGeometry();
    nodes.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    nodes.setAttribute("aIndex", new THREE.BufferAttribute(idx, 1));
    const spokes = new THREE.BufferGeometry();
    spokes.setAttribute("position", new THREE.BufferAttribute(line, 3));
    return { nodes, spokes };
  }, [index, n]);

  useEffect(
    () => () => {
      nodes.dispose();
      spokes.dispose();
    },
    [nodes, spokes]
  );

  const hubGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.3, 0)),
    []
  );
  useEffect(() => () => hubGeo.dispose(), [hubGeo]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDpr: { value: 1 },
      uHover: { value: -1 },
      uFocus: { value: 0 },
      uAlpha: { value: 0 },
      uPaper: { value: new THREE.Color(PALETTE.paper) },
      uGold: { value: new THREE.Color(PALETTE.gold) },
    }),
    []
  );

  useFrame((state, dt) => {
    const step = Math.min(dt, 0.05);
    const ease = (cur: number, to: number, tau: number) =>
      reduced ? to : cur + (to - cur) * (1 - Math.exp(-step / tau));

    const dist = Math.abs(index - active);
    const focus = Math.max(0, 1 - dist);
    // Clusters ahead stay faintly visible down the aisle — the next
    // discipline is a place you can see before you arrive.
    const vis = 0.22 + 0.78 * Math.exp(-Math.pow(dist * 0.55, 2));

    const u = uniforms;
    if (!reduced) u.uTime.value = state.clock.elapsedTime;
    u.uDpr.value = state.viewport.dpr;
    u.uHover.value = hover;
    u.uFocus.value = ease(u.uFocus.value, focus, 0.3);
    u.uAlpha.value = ease(u.uAlpha.value, (0.3 + 0.6 * focus) * vis, 0.3);

    if (spokeMat.current) {
      spokeMat.current.opacity = ease(
        spokeMat.current.opacity,
        (0.05 + 0.17 * focus) * vis,
        0.3
      );
    }
    if (hubMat.current && hub.current) {
      hubMat.current.opacity = ease(
        hubMat.current.opacity,
        (0.25 + 0.55 * focus) * vis,
        0.3
      );
      // The hub takes the gold exactly as it takes the reader's attention.
      hubColor.current.t = ease(hubColor.current.t, focus, 0.35);
      hubMat.current.color
        .setHex(HEX.panelMid)
        .lerp(new THREE.Color(PALETTE.gold), hubColor.current.t);
      if (!reduced) {
        hub.current.rotation.y += step * (0.12 + focus * 0.3);
        hub.current.rotation.x += step * 0.05;
      }
    }
  });

  return (
    <group position={[centre.x, centre.y, -index * PITCH]}>
      <lineSegments ref={hub} geometry={hubGeo}>
        <lineBasicMaterial ref={hubMat} transparent opacity={0} depthWrite={false} />
      </lineSegments>

      <lineSegments geometry={spokes}>
        <lineBasicMaterial
          ref={spokeMat}
          color={HEX.paper}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>

      <points geometry={nodes} frustumCulled={false}>
        <shaderMaterial
          vertexShader={nodeVertex}
          fragmentShader={nodeFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function SkillField({
  groups,
  active,
  hover,
  reduced,
}: {
  groups: SkillGroup[];
  /** Fractional index of the cluster being read. */
  active: number;
  /** Which chip the pointer is on, or null. */
  hover: HoverTarget | null;
  reduced: boolean;
}) {
  const invalidate = useThree((state) => state.invalidate);

  // Under reduced motion the Stage runs on demand; each change of target has
  // to buy itself the one frame that applies it, or the field freezes
  // mid-travel. Same contract as the rack.
  useEffect(() => {
    if (reduced) invalidate();
  }, [reduced, active, hover, invalidate]);

  useFrame((state, dt) => {
    const step = Math.min(dt, 0.05);
    const i = Math.max(0, Math.min(groups.length - 1, active));
    const lo = CLUSTERS[Math.floor(i) % CLUSTERS.length];
    const hi = CLUSTERS[Math.min(Math.ceil(i), groups.length - 1) % CLUSTERS.length];
    const t = i - Math.floor(i);

    const x = THREE.MathUtils.lerp(lo.x, hi.x, t);
    const y = THREE.MathUtils.lerp(lo.y, hi.y, t);
    const z = -i * PITCH + 5.6;

    const c = state.camera;
    const k = reduced ? 1 : 1 - Math.exp(-step / 0.22);

    const lean = reduced ? 0 : 1;
    const px = state.pointer.x * 0.3 * lean;
    const py = state.pointer.y * 0.18 * lean;

    // The copy column sits left, so the aisle runs right of centre — the
    // same composition rule as the rack, for the same contrast reason.
    c.position.x += (x - 1.9 + px - c.position.x) * k;
    c.position.y += (y + 0.25 + py - c.position.y) * k;
    c.position.z += (z - c.position.z) * k;
    c.lookAt(x, y, -i * PITCH);
  });

  return (
    <>
      {groups.map((g, i) => (
        <Cluster
          key={g.id}
          group={g}
          index={i}
          active={active}
          hover={hover && hover.group === i ? hover.skill : -1}
          reduced={reduced}
        />
      ))}
    </>
  );
}
