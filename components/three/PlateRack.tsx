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
 * THE SHAPE LIGHTS ARE WHITE, THE WARMTH IS PLACED. White ambient + key give
 * every mount its own blue-steel value and a legible bevel; the ember enters
 * only where the fiction puts a lamp — a whisper of point light and a wide
 * additive halo BEHIND the plate being read. Tinting the main lights instead
 * would warm every frame in the hall and read as wood, not steel.
 *
 * PHOTOGRAPHS ARE PULLED INTO THE PALETTE. The covers are not neutral — two of
 * the eight are distinctly green — and dropping raw imagery into a five-value
 * scheme is what makes a careful palette look accidental. Every plate is
 * desaturated and tinted toward the porcelain before it is shown, so any image,
 * including whatever real photography replaces these, arrives inside the
 * identity.
 *
 * The hall itself is drawn with two strokes: a floor grid that fades in a
 * pool around wherever the camera is (the same grid the footer stands on, met
 * here in real 3D), and a tungsten halo behind the plate being read — the
 * ember light of the site, placed as a physical lamp in the aisle.
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
    c = mix(c, vec3(l) * uPaper * 1.25, 0.34);

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
    //
    // Two different laws, because the two directions mean different things:
    // ahead is the gallery receding into the dark (a slow gaussian, each
    // plate dimmer than the one before), behind is a plate the camera is
    // about to pass THROUGH — it must be gone before it fills the lens, or
    // the whole frame washes out with one oversized photograph.
    const d = Math.abs(index - active) * PITCH;
    const ahead = Math.exp(-Math.pow(0.12 * d, 2));
    const passed = active - index;
    const exit = 1 - THREE.MathUtils.smoothstep(passed, 0.28, 0.72);
    const fade = ahead * exit;

    if (photoMat.current) {
      const u = photoMat.current.uniforms;
      u.uFade.value = ease(u.uFade.value, fade, 0.25);
      u.uReveal.value = ease(u.uReveal.value, progress > 0.02 ? 1.05 : 0, 0.5);
      // Capped well below 1: the plate under attention gains chroma, but never
      // enough to reintroduce a hue the palette does not contain.
      u.uSat.value = ease(u.uSat.value, 0.34 + focus * 0.38 + lift * 0.14, 0.3);
      u.uBright.value = ease(u.uBright.value, 0.95 + focus * 0.12 + lift * 0.06, 0.3);
    }
    if (mountMat.current) {
      mountMat.current.opacity = ease(mountMat.current.opacity, fade, 0.25);
      /* The focus lift must not carry a hue. The mount's albedo is so dark
         (~0.017 linear in red) that even a trace of ember emissive doubles
         the red channel and turns every steel frame brown — so the emissive
         is the cool paper tone, a plain brightening, and ALL warmth comes
         from the lamp: the ember point light and the halo behind the plate. */
      mountMat.current.emissiveIntensity = ease(
        mountMat.current.emissiveIntensity,
        focus * 0.03 + lift * 0.06,
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
          emissive={HEX.paper}
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

/* ---- The hall floor ----
   Long rails down the aisle and cross-ties every half plate-pitch, alive only
   in a pool around the camera: the fade keys off distance to the plate being
   read, so the grid travels with the reader instead of piling up at the
   horizon. Alpha, not fog, for the same compositing reason as the plates. */

const gridVertex = /* glsl */ `
  varying float vZ;
  void main() {
    vZ = position.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gridFragment = /* glsl */ `
  uniform vec3  uColor;
  uniform float uCamZ;
  uniform float uFade;
  varying float vZ;
  void main() {
    float pool = exp(-pow(abs(vZ - uCamZ) / 10.0, 2.0));
    gl_FragColor = vec4(uColor, 0.14 * pool * uFade);
  }
`;

function FloorGrid({
  count,
  active,
  progress,
  reduced,
}: {
  count: number;
  active: number;
  progress: number;
  reduced: boolean;
}) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const far = -(count - 1) * PITCH - 10;
    const pts: number[] = [];
    const Y = -3.9;
    // Rails, running the length of the aisle.
    for (let x = -4.8; x <= 4.81; x += 1.6) {
      pts.push(x, Y, 6, x, Y, far);
    }
    // Cross-ties.
    for (let z = 4; z >= far; z -= PITCH / 2) {
      pts.push(-4.8, Y, z, 4.8, Y, z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(PALETTE.paper) },
      uCamZ: { value: 0 },
      uFade: { value: 0 },
    }),
    []
  );

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    const step = Math.min(dt, 0.05);
    const ease = (cur: number, to: number, tau: number) =>
      reduced ? to : cur + (to - cur) * (1 - Math.exp(-step / tau));
    u.uCamZ.value = -active * PITCH;
    u.uFade.value = ease(u.uFade.value, progress > 0.02 ? 1 : 0, 0.5);
  });

  return (
    <lineSegments geometry={geometry} renderOrder={-1} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={gridVertex}
        fragmentShader={gridFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </lineSegments>
  );
}

/* ---- The lamp ----
   A radial billow of the ember light behind the plate being read. It sits
   BEHIND the mount, so the plates in front occlude its core and what survives
   is a rim — a backlight, not a lens flare. */

const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3  uColor;
  uniform float uFade;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float a = pow(max(1.0 - r, 0.0), 2.4);
    gl_FragColor = vec4(uColor, a * 0.45 * uFade);
  }
`;

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
  const ember = useRef<THREE.PointLight>(null);
  const halo = useRef<THREE.Mesh>(null);
  const haloMat = useRef<THREE.ShaderMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);

  const haloUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(PALETTE.ember) },
      uFade: { value: 0 },
    }),
    []
  );

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

    // The warmth rides with the reader: the plate being read is fractionally
    // warmer than the rest of the run, so the ember IS attention.
    if (ember.current) {
      ember.current.position.set(x, y + 0.9, -i * PITCH + 1.6);
    }
    if (halo.current) {
      // Deep behind the mount, not just off its back: the plates in front are
      // translucent while they travel, and a close halo shines straight
      // through them — pale frames, washed prints. Distance keeps it a room
      // glow that the plate silhouettes against.
      halo.current.position.set(x, y + 0.35, -i * PITCH - 4.0);
    }
    if (haloMat.current) {
      const u = haloMat.current.uniforms;
      // The lamp comes up when the camera ARRIVES at a plate and falls while
      // travelling — light as punctuation, not a constant.
      const settle = 1 - Math.min(1, Math.abs(i - Math.round(i)) * 2.5);
      const to = (progress > 0.02 ? 1 : 0) * (0.3 + 0.7 * settle);
      u.uFade.value = reduced
        ? to
        : u.uFade.value + (to - u.uFade.value) * (1 - Math.exp(-step / 0.5));
    }
  });

  return (
    <>
      {/* The whites are shape, the ember is warmth. White ambient+key sit
          deliberately below the material-accurate π so the mounts render a
          step DARKER than their named value — frames in shadow, prints lit —
          and the tungsten point riding the reader is what lifts the one
          being read. */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[2.6, 4.2, 3.0]} intensity={1.6} />
      <pointLight ref={ember} color={HEX.ember} intensity={0.55} distance={6.5} decay={2} />

      <FloorGrid
        count={plates.length}
        active={active}
        progress={progress}
        reduced={reduced}
      />

      <mesh ref={halo} frustumCulled={false} renderOrder={-2}>
        <planeGeometry args={[9, 9]} />
        <shaderMaterial
          ref={haloMat}
          vertexShader={haloVertex}
          fragmentShader={haloFragment}
          uniforms={haloUniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

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
