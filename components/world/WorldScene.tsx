"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Car, { type CarHandle } from "./Car";
import Weather from "./Weather";
import Hotspots, { type LiveSpot } from "./Hotspots";
import { Scenery } from "./Scenery";
import { buildRoadGeometry, curvatureAt, headingAt, pointAt, tangentAt } from "./route";
import { environments, type WeatherKind } from "@/lib/world";

/**
 * The drive.
 *
 * One canvas, one road, one car, five environments. Scroll position
 * arrives through a ref rather than through props: the camera moves
 * every frame and React has no business re-rendering a tree this size
 * sixty times a second. The only things that cross back into React
 * are the ones a human can see change state — which environment is
 * current, and what has been clicked.
 *
 * Nothing here switches scenes. Light, fog and sky are all continuous
 * values sampled from the five environment definitions and blended
 * across the boundaries, so snow genuinely thins into daylight on the
 * descent instead of cutting.
 */

export type CameraMode = "chase" | "cinema" | "drone";

export interface DriveProps {
  progress: React.MutableRefObject<number>;
  spots: LiveSpot[];
  openId: string | null;
  onOpenSpot: (s: LiveSpot) => void;
  onOpenCar: () => void;
  mode: CameraMode;
  weather: WeatherKind;
  lamps: boolean;
  paint: string;
  detail: number;
}

/* Parsed once — allocating five Colors per frame is the kind of thing
   that quietly costs a third of the frame budget in a scene this size. */
const GPU = environments.map((e) => ({
  skyTop: new THREE.Color(e.skyTop),
  skyLow: new THREE.Color(e.skyLow),
  fog: new THREE.Color(e.fog),
  fogNear: e.fogNear,
  fogFar: e.fogFar,
  sun: new THREE.Color(e.sun),
  sunPower: e.sunPower,
  sunAt: new THREE.Vector3(...e.sunAt),
  hemiSky: new THREE.Color(e.hemiSky),
  hemiGround: new THREE.Color(e.hemiGround),
  hemiPower: e.hemiPower,
  envPower: e.envPower,
  tarmac: new THREE.Color(e.tarmac),
  wet: e.weather === "rain" ? 1 : 0,
}));

/** Which two environments are in play at `p`, and the mix between them. */
function blendAt(p: number) {
  const n = GPU.length;
  const raw = Math.min(n - 1e-6, Math.max(0, p * n));
  const i = Math.floor(raw);
  const local = raw - i;
  // The hand-over happens over the last fifth of each stretch.
  const k = THREE.MathUtils.smoothstep(local, 0.76, 1);
  return { a: GPU[i], b: GPU[Math.min(n - 1, i + 1)], k };
}

/* ------------------------------------------------------------------ */
/* Sky                                                                 */
/* ------------------------------------------------------------------ */

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uLow;
  uniform vec3 uSun;
  uniform vec3 uSunDir;
  uniform float uSunPower;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(uLow, uTop, pow(h, 0.78));
    // Horizon wash and a disc, so a low sun actually sits in the sky
    // instead of only showing up on the geometry it lights.
    float d = max(dot(vDir, uSunDir), 0.0);
    col += uSun * pow(d, 160.0) * uSunPower * 1.4;
    col += uSun * pow(d, 5.0) * uSunPower * 0.16;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Sky({ progress }: { progress: React.MutableRefObject<number> }) {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uLow: { value: new THREE.Color() },
      uSun: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunPower: { value: 1 },
    }),
    [],
  );

  useFrame(() => {
    const { a, b, k } = blendAt(progress.current);
    uniforms.uTop.value.copy(a.skyTop).lerp(b.skyTop, k);
    uniforms.uLow.value.copy(a.skyLow).lerp(b.skyLow, k);
    uniforms.uSun.value.copy(a.sun).lerp(b.sun, k);
    uniforms.uSunDir.value.copy(a.sunAt).lerp(b.sunAt, k).normalize();
    uniforms.uSunPower.value = THREE.MathUtils.lerp(a.sunPower, b.sunPower, k) * 0.5;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <sphereGeometry args={[900, 32, 20]} />
      <shaderMaterial
        vertexShader={SKY_VERT}
        fragmentShader={SKY_FRAG}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Light                                                               */
/* ------------------------------------------------------------------ */

function Light({ progress }: { progress: React.MutableRefObject<number> }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const fill = useRef<THREE.AmbientLight>(null);
  const { scene } = useThree();

  const fog = useMemo(() => new THREE.Fog("#000000", 30, 300), []);
  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

  useFrame(({ camera }) => {
    const { a, b, k } = blendAt(progress.current);

    fog.color.copy(a.fog).lerp(b.fog, k);
    fog.near = THREE.MathUtils.lerp(a.fogNear, b.fogNear, k);
    fog.far = THREE.MathUtils.lerp(a.fogFar, b.fogFar, k);
    scene.environmentIntensity = THREE.MathUtils.lerp(a.envPower, b.envPower, k);

    if (sun.current) {
      sun.current.color.copy(a.sun).lerp(b.sun, k);
      sun.current.intensity = THREE.MathUtils.lerp(a.sunPower, b.sunPower, k);
      // The sun is a direction, not a place: parked relative to the
      // camera so it never falls behind the car on a 1.5km route.
      const dir = a.sunAt.clone().lerp(b.sunAt, k).normalize().multiplyScalar(180);
      sun.current.position.copy(camera.position).add(dir);
      sun.current.target.position.copy(camera.position);
      sun.current.target.updateMatrixWorld();
    }
    if (hemi.current) {
      hemi.current.color.copy(a.hemiSky).lerp(b.hemiSky, k);
      hemi.current.groundColor.copy(a.hemiGround).lerp(b.hemiGround, k);
      hemi.current.intensity = THREE.MathUtils.lerp(a.hemiPower, b.hemiPower, k);
    }
    // Fill is the atmosphere colour, not white. What is actually in a
    // shadow outdoors is the air between you and it, so a slope facing
    // away from the sun should go the colour of the haze — warm in the
    // city, cold blue on snow. With a neutral fill the city's shadowed
    // ground took its colour from the blue hemisphere alone and read
    // as water.
    if (fill.current) {
      fill.current.color.copy(a.fog).lerp(b.fog, k);
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} intensity={1} />
      <directionalLight ref={sun} intensity={2} />
      <ambientLight ref={fill} intensity={0.38} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Road                                                                */
/* ------------------------------------------------------------------ */

/** Lane markings, drawn into a canvas — no texture file to ship. */
function laneTexture() {
  const w = 64;
  const h = 128;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.globalAlpha = 0;
  g.fillRect(0, 0, w, h);
  g.globalAlpha = 1;
  // Centre dash.
  g.fillStyle = "rgba(255,255,255,0.82)";
  g.fillRect(w / 2 - 2, 10, 4, h * 0.46);
  // Continuous edge lines.
  g.fillStyle = "rgba(255,255,255,0.5)";
  g.fillRect(3, 0, 3, h);
  g.fillRect(w - 6, 0, 3, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function Road({ progress }: { progress: React.MutableRefObject<number> }) {
  const geo = useMemo(() => buildRoadGeometry(), []);
  const tex = useMemo(laneTexture, []);
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => () => {
    geo.dispose();
    tex.dispose();
  }, [geo, tex]);

  useFrame(() => {
    if (!mat.current) return;
    const { a, b, k } = blendAt(progress.current);
    mat.current.color.copy(a.tarmac).lerp(b.tarmac, k);
    // Wet tarmac: the single most convincing thing about rain.
    const wet = THREE.MathUtils.lerp(a.wet, b.wet, k);
    mat.current.roughness = THREE.MathUtils.lerp(0.82, 0.14, wet);
    mat.current.metalness = THREE.MathUtils.lerp(0.04, 0.62, wet);
  });

  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial ref={mat} map={tex} roughness={0.82} metalness={0.04} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Driving + camera                                                    */
/* ------------------------------------------------------------------ */

const OFFSETS: Record<CameraMode, { back: number; up: number; side: number; aim: number }> = {
  chase: { back: 10.5, up: 3.7, side: 0.6, aim: 14 },
  cinema: { back: 2.5, up: 2.3, side: 13.5, aim: 3 },
  drone: { back: 26, up: 32, side: -6, aim: 20 },
};

function Drive({
  progress,
  mode,
  lamps,
  paint,
  onOpenCar,
}: {
  progress: React.MutableRefObject<number>;
  mode: CameraMode;
  lamps: boolean;
  paint: string;
  onOpenCar: () => void;
}) {
  const car = useRef<CarHandle>(null);
  const holder = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const prev = useRef(new THREE.Vector3());
  const focus = useRef(new THREE.Vector3());
  const started = useRef(false);

  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      right: new THREE.Vector3(),
      want: new THREE.Vector3(),
      aim: new THREE.Vector3(),
    }),
    [],
  );

  useFrame(({ camera }, delta) => {
    const t = THREE.MathUtils.clamp(progress.current, 0, 1);
    pointAt(t, tmp.p);
    tangentAt(t, tmp.tan);
    tmp.right.copy(tmp.tan).cross(new THREE.Vector3(0, 1, 0)).normalize();

    // Place the car on the road.
    if (holder.current) {
      holder.current.position.copy(tmp.p);
      holder.current.rotation.y = headingAt(t) + Math.PI / 2;
    }

    // Wheels turn from distance actually covered, and the nose turns
    // into the corner the road is making.
    const travelled = started.current ? tmp.p.distanceTo(prev.current) : 0;
    prev.current.copy(tmp.p);
    started.current = true;
    car.current?.roll(travelled);
    car.current?.steer(THREE.MathUtils.clamp(curvatureAt(t) * 1.6, -0.5, 0.5));

    // Camera.
    const o = OFFSETS[mode];
    tmp.want
      .copy(tmp.p)
      .addScaledVector(tmp.tan, -o.back)
      .addScaledVector(tmp.right, o.side);
    tmp.want.y += o.up;

    pointAt(Math.min(1, t + o.aim / 1500), tmp.aim);
    tmp.aim.y += 1.1;

    // Damped follow, so changing camera mode glides — but snapped when
    // the switcher jumps the scroll across a whole environment, where
    // gliding 300 units would read as a bug.
    const d = camera.position.distanceTo(tmp.want);
    const ease = d > 90 ? 1 : 1 - Math.exp(-5.5 * delta);
    camera.position.lerp(tmp.want, ease);
    focus.current.lerp(tmp.aim, d > 90 ? 1 : 1 - Math.exp(-6.5 * delta));
    camera.lookAt(focus.current);

    if (shadow.current) shadow.current.position.y = 0.03;
  });

  return (
    <group
      ref={holder}
      onClick={(e) => {
        e.stopPropagation();
        onOpenCar();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <Car ref={car} headlights={lamps} paint={paint} />
      {/* A soft contact patch. Real shadow maps cannot cover a 1.5km
          route at this resolution, and the car needs to sit on the
          road more than it needs a physically-derived shadow. */}
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[2.1, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.34} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */

/** Clears an open panel when you click the sky rather than an object. */
function Backdrop({ onMiss }: { onMiss: () => void }) {
  return (
    <mesh position={[0, 0, 0]} visible={false} onClick={onMiss}>
      <sphereGeometry args={[880, 8, 6]} />
      <meshBasicMaterial side={THREE.BackSide} />
    </mesh>
  );
}

export default function WorldScene({
  progress,
  spots,
  openId,
  onOpenSpot,
  onOpenCar,
  onMiss,
  mode,
  weather,
  lamps,
  paint,
  detail,
}: DriveProps & { onMiss: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      shadows={false}
      camera={{ position: [0, 62, 16], fov: 46, near: 0.5, far: 1400 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.94;
      }}
    >
      {/* A reflection probe built from emissive planes in memory. The
          clearcoat on the paint needs something to reflect or it reads
          as matte plastic; this costs one 128px cube, once, and ships
          no HDR file. */}
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={6}
          position={[0, 14, 0]}
          scale={[40, 20, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          color="#ffffff"
        />
        <Lightformer form="rect" intensity={2.4} position={[-16, 5, -10]} scale={[20, 6, 1]} color="#ffd9a0" />
        <Lightformer form="rect" intensity={1.8} position={[16, 5, -8]} scale={[20, 6, 1]} color="#9bb0c4" />
        <Lightformer form="ring" intensity={3} position={[8, 7, 10]} scale={6} color="#feb002" />
      </Environment>

      <Sky progress={progress} />
      <Light progress={progress} />
      <Backdrop onMiss={onMiss} />
      <Road progress={progress} />
      <Scenery detail={detail} />
      <Hotspots spots={spots} openId={openId} onOpen={onOpenSpot} />
      <Drive progress={progress} mode={mode} lamps={lamps} paint={paint} onOpenCar={onOpenCar} />
      <Weather kind={weather} />
    </Canvas>
  );
}
