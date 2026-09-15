"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Field } from "@/lib/sdf";
import { PALETTE } from "@/lib/palette";

/**
 * The opening word, shaded as an aperture cut through the light band.
 *
 * The band is treated as a sheet of warm grey with real thickness; the letters
 * are holes milled through it; behind the sheet is a dark room whose walls are
 * the ground colour of every section that follows. Scrolling deepens the room,
 * so by the time the hero releases, the word has become the ground you are
 * scrolling into.
 *
 * WHY IT IS SHADED RATHER THAN MODELLED. The word's identity is a set of
 * measured ratios — 0.408 horizontal compression, letters 4.4x taller than
 * wide, a 62.5vw span. A perspective camera destroys exactly that: a letter
 * nearer the lens renders wider, and the constant that IS the signature stops
 * being constant. So there is no perspective and no geometry. The camera is
 * orthographic, the scene is one full-screen quad, and all apparent depth is
 * computed per pixel against the distance field. The aperture stays pixel-
 * registered to the type at every frame.
 *
 * Both of the site's lights appear here for the first time, inside the cut.
 * On the band itself the cyan measures 1.06:1 and is forbidden — but the room
 * behind the sheet is dark, so light is admissible exactly where it becomes
 * legible: a tungsten ember bounce on the wall away from the sun, and a cold
 * cyan rim where the cut edge faces it. Warm against cold in every letter is
 * the site's whole grade, stated in the first frame.
 */

const vertex = /* glsl */ `
  precision highp float;
  in vec3 position;
  in vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  in vec2 vUv;
  out vec4 outColor;

  uniform sampler2D uField;   // signed distance, in field pixels
  uniform vec2  uFieldSize;
  uniform float uPxPerUnit;   // field pixels per CSS pixel

  uniform vec3  uPaper;       // the sheet
  uniform vec3  uRoom;        // the ground behind it
  uniform vec3  uDeep;        // the room's far corner
  uniform vec3  uEmber;       // tungsten bounce inside the cut
  uniform vec3  uCyan;        // the room's cold light, on the opposite lip

  uniform float uChamfer;     // CSS px — the bevel on the paper side
  uniform float uThickness;   // CSS px — the sheet's own depth
  uniform float uDepth;       // CSS px — room depth, grows on scroll
  uniform vec2  uSun;         // light direction, xy
  uniform float uReveal;      // 0..1 handoff from the DOM word
  uniform float uMelt;        // 0..1 pointer melt
  uniform float uTime;

  float field(vec2 uv) {
    return texture(uField, uv).r;
  }

  // Value noise, used only to give the paper a faint tooth. Mean-preserving,
  // so the canvas cannot show a seam against the CSS band behind it.
  /* THREE.Color converts to linear-light on construction, and the shading maths
     below is correct in linear — but a RawShaderMaterial carries none of Three's
     shader includes, so nothing encodes the result on the way out. Writing
     linear values into an sRGB framebuffer is what turns #acaaa6 paper into
     mud. This is the exact transfer function, applied once at the end. */
  vec3 toSRGB(vec3 c) {
    return mix(c * 12.92,
               1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055,
               step(vec3(0.0031308), c));
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;

    // The melt, ported from the SVG filter the flat word uses: a coherent field
    // dragged across the word rather than re-randomised, so the ink flows
    // instead of boiling. X frequency runs higher than Y, which is what makes
    // the distortion read as vertical ribbons.
    if (uMelt > 0.001) {
      vec2 q = uv * vec2(9.0, 4.0) + vec2(uTime * 0.05, uTime * 0.037);
      vec2 warp = vec2(noise(q) - 0.5, noise(q + 17.3) - 0.5);
      uv += warp * uMelt * 0.045;
    }

    float px = 1.0 / uPxPerUnit;          // field px -> CSS px
    float d  = field(uv) * px;            // signed distance in CSS px

    // Gradient of the field, for the chamfer's surface normal. Central
    // differences on the texture, one texel apart.
    vec2 t = 1.0 / uFieldSize;
    float dx = field(uv + vec2(t.x, 0.0)) - field(uv - vec2(t.x, 0.0));
    float dy = field(uv + vec2(0.0, t.y)) - field(uv - vec2(0.0, t.y));
    vec2 grad = normalize(vec2(dx, dy) + 1e-6);

    /* How much to trust that gradient. It is well defined near an edge and
       meaningless along a stroke's medial axis, where it flips direction and
       any term depending on it breaks into visible facets. Everything angular
       below is weighted by this. */
    float edgeness = exp(-max(d, 0.0) / (uChamfer * 2.2));

    vec3 sun = normalize(vec3(uSun, 0.85));

    // Paper: flat, with a faint tooth and a soft ambient occlusion lobe on the
    // side of each letter away from the light.
    float tooth = (noise(uv * uFieldSize * 0.22) - 0.5) * 0.008;
    vec3 paper = uPaper + tooth;
    // A contact shadow, not a wash: it reaches about two chamfer widths from
    // the aperture and never touches the open field.
    float ao = 1.0 - 0.13 * exp(-max(0.0, -d) / (uChamfer * 1.8))
                    * smoothstep(-1.0, 1.0, dot(grad, sun.xy));
    paper *= ao;

    // Chamfer: a bevel on the paper side of the aperture. Its normal tips
    // toward the hole, so it catches the key light and reads as a cut edge.
    vec3 nrm = normalize(vec3(-grad, 1.0));
    float lambert = max(dot(nrm, sun), 0.0);
    float spec = pow(max(dot(reflect(-sun, nrm), vec3(0.0, 0.0, 1.0)), 0.0), 24.0);
    // Kept close to the paper's own value: the bevel is a change of angle, not
    // a change of material, and a bright rim reads as a glow rather than a cut.
    // The highlight leans faintly toward the room's cold light, the way a
    // polished edge takes the colour of whatever is shining on it.
    vec3 chamfer = uPaper * (0.62 + 0.50 * lambert)
                 + mix(vec3(1.0), uCyan, 0.4) * spec * 0.10;

    // Room: the dark space behind the sheet. Deepens toward the far corner and
    // toward the aperture's centre, and picks up a little gold on the wall
    // opposite the sun.
    float inside = max(d, 0.0);
    float fall = 1.0 - 0.55 * exp(-inside / max(uDepth, 1.0));
    vec3 room = mix(uRoom, uDeep, clamp(uv.y * 0.5 + 0.15, 0.0, 1.0)) * fall;
    // Two lights inside every letter: the tungsten bounce on the wall away
    // from the sun, and the room's own cold cyan on the wall that faces it.
    float bounce = clamp(-dot(grad, sun.xy), 0.0, 1.0) * edgeness * 0.16;
    float coldRim = clamp(dot(grad, sun.xy), 0.0, 1.0) * edgeness * 0.09;
    room = mix(room, uEmber, bounce);
    room = mix(room, uCyan, coldRim);

    // The cut wall: the sheet's own thickness, visible just inside the
    // aperture, with a burnished hairline where it meets the chamfer. That
    // hairline is what actually sells the thickness.
    float wall = 1.0 - smoothstep(0.0, uThickness, inside);
    vec3 wallCol = mix(uPaper * 0.20, uPaper * 0.92, wall);
    float hair = exp(-abs(inside - 0.7) * 2.4) * 0.55;

    // Compose, outside -> in.
    vec3 col = paper;
    col = mix(col, chamfer, smoothstep(-uChamfer, 0.0, d));
    col = mix(col, wallCol, smoothstep(-0.4, 0.9, d));
    col = mix(col, room, smoothstep(0.4, uThickness, d));
    col += hair * uPaper * 0.55 * step(0.0, d);

    // The handoff: the flat DOM word fades out as the cut opens, so the ink
    // becomes a hole rather than being replaced by one.
    float open = smoothstep(0.0, 1.0, uReveal);
    col = mix(uPaper, col, open);

    outColor = vec4(toSRGB(col), 1.0);
  }
`;

export default function CutSheet({
  field,
  reveal,
  melt,
  depth,
  reduced,
}: {
  field: Field;
  /** 0..1 handoff from the flat word to the cut. */
  reveal: number;
  /** 0..1 pointer melt. */
  melt: number;
  /** Room depth in CSS px; grows as the hero scrolls away. */
  depth: number;
  reduced: boolean;
}) {
  const mat = useRef<THREE.RawShaderMaterial>(null);
  const { viewport, invalidate } = useThree();

  /* The field becomes a single-channel texture. Nearest-neighbour would
     quantise the chamfer into visible steps at this scale, so it must be
     filtered — and that is precisely the constraint that decides the type.

     R32F is NOT texture-filterable in core WebGL2; it needs
     OES_texture_float_linear, which a good number of mobile GPUs do not have.
     Where the extension is missing the texture is incomplete rather than
     merely unfiltered, so every sample returns zero — the shader reads a
     distance of 0 everywhere, draws no letters at all, and the DOM ink has
     already been switched off by `.word-cut`. A hero with no word in it, on
     exactly the devices least likely to be tested.

     R16F is filterable in core WebGL2, needs no extension, and halves both the
     upload and the VRAM. Half-float carries about three decimal digits near
     zero, which is where the chamfer lives and where the precision is actually
     spent; far from an edge the value only feeds a slow exponential falloff
     and could not care less. */
  const texture = useMemo(() => {
    const half = new Uint16Array(field.data.length);
    for (let i = 0; i < field.data.length; i++) {
      half[i] = THREE.DataUtils.toHalfFloat(field.data[i]);
    }
    const tex = new THREE.DataTexture(
      half,
      field.width,
      field.height,
      THREE.RedFormat,
      THREE.HalfFloatType
    );
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    // The field is written top-row-first, the way canvas2d hands it over; the
    // plane's v runs the other way. Without this the word is cut in upside
    // down.
    tex.flipY = true;
    tex.needsUpdate = true;
    return tex;
  }, [field]);

  // A DataTexture is not owned by the scene graph, so R3F will not dispose it.
  useEffect(() => () => texture.dispose(), [texture]);

  const uniforms = useMemo(
    () => ({
      uField: { value: texture },
      uFieldSize: { value: new THREE.Vector2(field.width, field.height) },
      uPxPerUnit: { value: field.scale },
      uPaper: { value: new THREE.Color(PALETTE.paper) },
      uRoom: { value: new THREE.Color(PALETTE.ink) },
      uDeep: { value: new THREE.Color(PALETTE.void) },
      uEmber: { value: new THREE.Color(PALETTE.ember) },
      uCyan: { value: new THREE.Color(PALETTE.cyan) },
      uChamfer: { value: 2.4 },
      uThickness: { value: 7.0 },
      uDepth: { value: depth },
      uSun: { value: new THREE.Vector2(-0.34, 0.62) },
      uReveal: { value: 0 },
      uMelt: { value: 0 },
      uTime: { value: 0 },
    }),
    // Rebuilt only when the field itself changes; everything else is animated
    // by writing to the uniform, never by re-creating the material.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [texture, field.width, field.height, field.scale]
  );

  /* Under reduced motion the Stage runs the canvas on demand, so frames happen
     only when something asks for one. Nothing here asks: the eases below live
     inside useFrame, so with no loop the cut would stall part-open — or never
     open at all — while `.word-cut` had already taken the DOM ink away. Each
     change of target therefore buys exactly one frame, which is all a still
     scene needs. */
  useEffect(() => {
    if (reduced) invalidate();
  }, [reduced, reveal, depth, invalidate]);

  useFrame((state, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    // Eased toward the target rather than snapped, so the handoff and the melt
    // both settle rather than cut. Under reduced motion there is no settling to
    // do and no loop to do it in, so the targets are simply taken.
    const ease = (cur: number, to: number, tau: number) =>
      reduced ? to : cur + (to - cur) * (1 - Math.exp(-Math.min(dt, 0.05) / tau));
    u.uReveal.value = ease(u.uReveal.value, reveal, 0.35);
    u.uMelt.value = ease(u.uMelt.value, reduced ? 0 : melt, melt > u.uMelt.value ? 0.15 : 0.11);
    u.uDepth.value = ease(u.uDepth.value, depth, 0.3);
    if (!reduced) u.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <rawShaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        glslVersion={THREE.GLSL3}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Dust inside the cut.
 *
 * The shader above says the letters are holes into a dark room; this is the
 * detail that proves it. A handful of motes drift in the space behind the
 * sheet, visible only through the letter apertures — and because the global
 * Atmosphere fades in with the same kind of dust as you scroll into the dark
 * run, the room you glimpsed through the word turns out to be the room the
 * whole site happens in.
 *
 * The registration problem — motes must never stray onto the paper — is
 * solved on the CPU, not in the shader: spawn positions are rejection-sampled
 * from the field itself, only accepting texels several pixels INSIDE a glyph,
 * and the drift amplitude is kept below that margin. No per-frame masking,
 * no texture fetch in the vertex stage, nothing to go wrong on a driver.
 */

const DUST_COUNT = 110;

const dustVertex = /* glsl */ `
  precision highp float;
  in vec3 position;
  in vec3 aSeed;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uDpr;
  out vec3 vSeed;

  void main() {
    vSeed = aSeed;
    vec3 pos = position;
    // Oscillation, not travel: each mote breathes around its spawn point so
    // it can never wander out of its letter. Amplitude stays inside the
    // sampling margin.
    pos.x += sin(uTime * 0.22 + aSeed.x * 6.2831) * 2.1;
    pos.y += sin(uTime * 0.16 + aSeed.y * 6.2831) * 2.8;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uDpr * mix(1.1, 2.6, aSeed.z);
  }
`;

const dustFragment = /* glsl */ `
  precision mediump float;
  // highp to match the vertex stage — strict drivers (ANGLE) refuse to link
  // a program whose shared uniform differs in precision between stages.
  uniform highp float uTime;
  uniform float uOpen;
  uniform vec3 uPaper;
  uniform vec3 uEmber;
  in vec3 vSeed;
  out vec4 outColor;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.15, d);
    float breathe = 0.65 + 0.35 * sin(uTime * 0.6 + vSeed.y * 6.2831);
    // A few motes catch the ember bounce; most are pale room-dust.
    vec3 tone = mix(uPaper * 1.15, uEmber * 1.2, step(0.86, vSeed.z));
    float alpha = disc * breathe * mix(0.2, 0.45, vSeed.z) * uOpen;
    outColor = vec4(tone, alpha);
  }
`;

export function CutDust({
  field,
  reveal,
  reduced,
}: {
  field: Field;
  /** 0..1 — follows the cut opening; dust exists only once there is a room. */
  reveal: number;
  reduced: boolean;
}) {
  const mat = useRef<THREE.RawShaderMaterial>(null);
  const { viewport } = useThree();

  const geometry = useMemo(() => {
    const { data, width, height } = field;
    const pts: number[] = [];
    const seeds: number[] = [];
    let attempts = 0;
    // Rejection sampling: only texels at least ~4px inside a glyph qualify.
    while (pts.length / 3 < DUST_COUNT && attempts < DUST_COUNT * 400) {
      attempts++;
      const i = (Math.random() * data.length) | 0;
      if (data[i] < 4) continue;
      const c = i % width;
      const r = (i / width) | 0;
      pts.push(
        ((c + 0.5) / width - 0.5) * viewport.width,
        (0.5 - (r + 0.5) / height) * viewport.height,
        0
      );
      seeds.push(Math.random(), Math.random(), Math.random());
    }
    if (!pts.length) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array(seeds), 3));
    return geo;
  }, [field, viewport.width, viewport.height]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpen: { value: 0 },
      uDpr: { value: 1 },
      uPaper: { value: new THREE.Color(PALETTE.paper) },
      uEmber: { value: new THREE.Color(PALETTE.ember) },
    }),
    []
  );

  useFrame((state, dt) => {
    const u = mat.current?.uniforms;
    if (!u) return;
    if (!reduced) u.uTime.value = state.clock.elapsedTime;
    u.uDpr.value = state.viewport.dpr;
    const k = reduced ? 1 : 1 - Math.exp(-Math.min(dt, 0.05) / 0.5);
    u.uOpen.value += (reveal - u.uOpen.value) * k;
  });

  if (!geometry) return null;

  return (
    <points geometry={geometry} renderOrder={1} frustumCulled={false}>
      <rawShaderMaterial
        ref={mat}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        glslVersion={THREE.GLSL3}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </points>
  );
}
