"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PALETTE, HEX } from "@/lib/palette";

/**
 * The project gallery, as a rack of mounted plates receding into the dark.
 *
 * Each cover becomes a matte mount with a real aperture cut through it, and the
 * photograph sits BEHIND that aperture, oversized. So the parallax you see when
 * the camera moves is geometry — the picture genuinely sliding inside its own
 * window — rather than a transform faking it. That is the site's existing image
 * treatment (a frame holding still while its contents drift) taken literally
 * into depth.
 *
 * Two decisions that are load-bearing:
 *
 * LIGHTING IS WHITE, AND BRIGHT. Three's diffuse term is irradiance × albedo/π,
 * so tinting the lights with the palette and running them at "sensible"
 * intensities lands #303233 mounts at roughly #111 — darker than the ground
 * they sit on, which is the opposite of the intent. The lights are therefore
 * white with a combined irradiance near π, which makes each material render at
 * its own named value. Colour comes from the materials; the lights only shape.
 *
 * PHOTOGRAPHS ARE PULLED INTO THE PALETTE. The covers are not neutral — two of
 * the eight are distinctly green — and dropping raw imagery into a five-value
 * scheme is what makes a careful palette look accidental. Every plate is
 * desaturated and tinted toward the warm grey before it is shown, so any image,
 * including whatever real photography replaces these, arrives inside the
 * identity.
 */

export interface Plate {
  slug: string;
  cover: string;
}

/* Hand-placed rather than generated: an even spiral reads as a screensaver.
   The run weaves left and right and descends, so the camera is always turning
   slightly and no two plates are ever edge-on at once. */
const LAYOUT = [
  { x: 0.0, y: 0.0, ry: 0.16 },
  { x: 0.86, y: -0.28, ry: -0.19 },
  { x: -0.72, y: -0.62, ry: 0.22 },
  { x: 0.34, y: -0.9, ry: -0.12 },
  { x: -0.9, y: -1.26, ry: 0.2 },
  { x: 0.62, y: -1.5, ry: -0.17 },
  { x: -0.5, y: -1.88, ry: 0.14 },
  { x: 0.78, y: -2.16, ry: -0.21 },
];

const PITCH = 5.6;

const photoVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // A shallow cylindrical bow, so the print reads as a physical sheet in a
    // frame rather than a decal pasted flat against it.
    p.z -= 0.04 * pow(uv.x - 0.5, 2.0) * 4.0;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const photoFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3  uPaper;
  uniform float uSat;
  uniform float uBright;
  uniform float uFade;
  uniform float uReveal;
  varying vec2 vUv;

  void main() {
    vec3 c = texture2D(uMap, vUv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));

    // The same desaturate-and-lift the CSS media-hover utility applies, so a
    // plate and a flat card are the same treatment at different depths.
    c = mix(vec3(l), c, uSat) * uBright;

    // Then a hard pull toward the warm grey. This is what keeps eight unrelated
    // photographs — two of them frankly green — inside a palette that has no
    // green at all. The tint is applied after desaturation so it colours the
    // luminance rather than fighting the original hue.
    c = mix(c, vec3(l) * uPaper * 1.35, 0.46);

    // The upward unmask, matching RevealImage's clip-path wipe.
    float m = smoothstep(uReveal, uReveal - 0.04, vUv.y);

    gl_FragColor = vec4(c, m * uFade);
    #include <colorspace_fragment>
  }
`;

function PlateMesh({
  plate,
  index,
  active,
  progress,
  reduced,
}: {
  plate: Plate;
  index: number;
  active: number;
  progress: number;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const photoMat = useRef<THREE.ShaderMaterial>(null);
  const mountMat = useRef<THREE.MeshStandardMaterial>(null);
  // Raycast hover, fed by the sticky host via Stage's eventSource — the
  // canvas itself stays pointer-transparent so every link above it works.
  const [hovered, setHovered] = useState(false);
  const texture = useLoader(THREE.TextureLoader, plate.cover);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
  }, [texture]);

  /* The mount: a rectangle with a 4:3 hole punched through it. The bevel exists
     for one reason — so the aperture lip catches the key light and the mount
     reads as a sheet with thickness rather than a printed border. */
  const mount = useMemo(() => {
    const shape = new THREE.Shape();
    const W = 3.68, H = 2.88;
    shape.moveTo(-W / 2, -H / 2);
    shape.lineTo(W / 2, -H / 2);
    shape.lineTo(W / 2, H / 2);
    shape.lineTo(-W / 2, H / 2);
    shape.closePath();

    const hole = new THREE.Path();
    const w = 3.2, h = 2.4;
    hole.moveTo(-w / 2, -h / 2);
    hole.lineTo(-w / 2, h / 2);
    hole.lineTo(w / 2, h / 2);
    hole.lineTo(w / 2, -h / 2);
    hole.closePath();
    shape.holes.push(hole);

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 1,
    });
  }, []);

  useEffect(() => () => mount.dispose(), [mount]);

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uPaper: { value: new THREE.Color(PALETTE.paper) },
      uSat: { value: 0.78 },
      uBright: { value: 0.92 },
      uFade: { value: 0 },
      uReveal: { value: 0 },
    }),
    [texture]
  );

  const pos = LAYOUT[index % LAYOUT.length];

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const step = Math.min(dt, 0.05);
    /* Under reduced motion the Stage runs on demand, so there is no loop for an
       ease to run in — and `uFade` starts at 0, meaning a rack that eased would
       simply never become visible. A still scene takes its targets whole. */
    const ease = (cur: number, to: number, tau: number) =>
      reduced ? to : cur + (to - cur) * (1 - Math.exp(-step / tau));

    // How near this plate is to the one being read. Everything below keys off
    // it, so the plate under attention is the only one fully present.
    const near = Math.abs(index - active);
    const focus = Math.max(0, 1 - near);
    // Hover only means something on the plate being read — a glow three
    // plates down the aisle would just be a mystery light.
    const lift = hovered ? focus : 0;

    // The plate the pointer is on comes forward off the wall to meet it —
    // half a step toward the camera, a breath larger.
    g.position.z = ease(g.position.z, -index * PITCH + lift * 0.5, 0.16);
    const sc = ease(g.scale.x, 1 + lift * 0.035, 0.16);
    g.scale.setScalar(sc);

    // Distance dissolve. Alpha, not fog: fog interpolates RGB at full opacity,
    // which would punch opaque rectangles through the DOM word behind the
    // canvas. Fading alpha lets the plates dissolve onto the real page.
    const d = Math.abs(index - active) * PITCH;
    const fade = Math.exp(-Math.pow(0.030 * d * 1.9, 2));

    if (photoMat.current) {
      const u = photoMat.current.uniforms;
      u.uFade.value = ease(u.uFade.value, fade, 0.25);
      u.uReveal.value = ease(u.uReveal.value, progress > 0.02 ? 1.05 : 0, 0.5);
      // Capped well below 1: the plate under attention gains chroma, but never
      // enough to reintroduce a hue the palette does not contain.
      u.uSat.value = ease(u.uSat.value, 0.30 + focus * 0.22 + lift * 0.14, 0.3);
      u.uBright.value = ease(u.uBright.value, 0.92 + focus * 0.08 + lift * 0.06, 0.3);
    }
    if (mountMat.current) {
      mountMat.current.opacity = ease(mountMat.current.opacity, fade, 0.25);
      mountMat.current.emissiveIntensity = ease(
        mountMat.current.emissiveIntensity,
        focus * 0.06 + lift * 0.1,
        0.3
      );
    }

    // The photograph drifts inside its own aperture as the camera passes. This
    // is the parallax, and it is real: the plane is behind the hole and larger
    // than it, so nothing but geometry produces the slide.
    const drift = (index - active) * 0.09;
    g.children[1]?.position.set(
      THREE.MathUtils.clamp(drift, -0.2, 0.2),
      THREE.MathUtils.clamp(-drift * 0.5, -0.15, 0.15),
      -0.06
    );
  });

  return (
    <group
      ref={group}
      position={[pos.x, pos.y, -index * PITCH]}
      rotation={[-0.045, pos.ry, 0]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh geometry={mount}>
        <meshStandardMaterial
          ref={mountMat}
          color={HEX.panel}
          roughness={0.82}
          metalness={0}
          emissive={HEX.gold}
          emissiveIntensity={0}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[3.6, 2.7, 12, 9]} />
        <shaderMaterial
          ref={photoMat}
          vertexShader={photoVertex}
          fragmentShader={photoFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

export default function PlateRack({
  plates,
  active,
  progress,
  reduced,
}: {
  plates: Plate[];
  /** Fractional index of the plate being read. */
  active: number;
  /** 0..1 through the section, for the reveal wipe. */
  progress: number;
  reduced: boolean;
}) {
  const gold = useRef<THREE.PointLight>(null);
  const invalidate = useThree((state) => state.invalidate);

  // Same reason as the plates: on demand, each new target has to buy itself the
  // one frame that applies it.
  useEffect(() => {
    if (reduced) invalidate();
  }, [reduced, active, progress, invalidate]);

  useFrame((state, dt) => {
    const step = Math.min(dt, 0.05);
    const i = Math.max(0, Math.min(plates.length - 1, active));
    const lo = LAYOUT[Math.floor(i) % LAYOUT.length];
    const hi = LAYOUT[Math.min(Math.ceil(i), plates.length - 1) % LAYOUT.length];
    const t = i - Math.floor(i);

    // The camera inherits the active plate's own x/y, so the plate being read
    // stays pinned in frame while the ones ahead and behind swing across it.
    const x = THREE.MathUtils.lerp(lo.x, hi.x, t);
    const y = THREE.MathUtils.lerp(lo.y, hi.y, t);
    const z = -i * PITCH + 7.4;

    const c = state.camera;
    const k = reduced ? 1 : 1 - Math.exp(-step / 0.22);

    // A little pointer lean, and none at all under reduced motion.
    const lean = reduced ? 0 : 1;
    const px = state.pointer.x * 0.26 * lean;
    const py = state.pointer.y * 0.16 * lean;

    // The aisle sits right of centre so the copy column on the left is always
    // over bare ground. Text on a lit plate measures near 1.6:1 however strong
    // the scrim is, so the fix is composition, not opacity.
    c.position.x += (x - 2.45 + px - c.position.x) * k;
    c.position.y += (y + 0.34 + py - c.position.y) * k;
    c.position.z += (z - c.position.z) * k;
    c.lookAt(x, y, -i * PITCH);

    // The accent rides with the reader: the plate being read is fractionally
    // warmer than the rest of the run, so the gold IS attention.
    if (gold.current) {
      gold.current.position.set(x, y + 0.9, -i * PITCH + 1.6);
    }
  });

  return (
    <>
      {/* White and bright on purpose. Three's diffuse is irradiance × albedo/π,
          so palette-tinted lights at ordinary intensities render #303233 near
          black. At roughly π of total irradiance each material shows its own
          named value, and colour stays a property of the material. */}
      <ambientLight intensity={1.0} />
      <directionalLight position={[2.6, 4.2, 3.0]} intensity={2.6} />
      <pointLight ref={gold} color={HEX.gold} intensity={2.4} distance={7.5} decay={2} />

      {plates.map((p, i) => (
        <PlateMesh
          key={p.slug}
          plate={p}
          index={i}
          active={active}
          progress={progress}
          reduced={reduced}
        />
      ))}
    </>
  );
}
