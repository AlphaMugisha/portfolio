/**
 * Generates the abstract art used in the hero composition.
 *
 * These are NOT AI images and are not pretending to be. They are mesh
 * gradients: a handful of large, heavily blurred colour fields laid over one
 * another, with a fine grain on top so the result has some tooth instead of
 * looking like a CSS gradient. That is the same construction most "AI
 * abstract wallpaper" actually is, and unlike a generated image it is
 * reproducible, tiny, and carries no licence questions.
 *
 * To use real images instead, drop them at the same paths and delete this
 * script — nothing else has to change.
 *
 *   node scripts/generate-hero-art.js
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "..", "public", "images", "hero");
fs.mkdirSync(OUT, { recursive: true });

/* The accent blue and two neighbours either side of it, plus a warm note so
   the field is not monochrome. Saturated on purpose — the blur takes most of
   the intensity back out, so starting subtle ends up looking like nothing. */
const PIECES = {
  primary: ["#DCE8FB", "#0A6EFA", "#7C5CFF", "#22D3EE", "#F8FAFF"],
  warm: ["#FDF3E7", "#FFB45E", "#FF7A59", "#0A6EFA", "#FFFFFF"],
  cool: ["#E8F0FF", "#3B82F6", "#06B6D4", "#8B5CF6", "#FFFFFF"],
};

/** Deterministic PRNG so the art never changes between runs. */
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
}

function mesh(w, h, colors, seed) {
  const next = rng(seed);
  const [base, ...inks] = colors;

  // Large overlapping fields. Radii are a big fraction of the canvas so the
  // blur blends them into one another instead of leaving readable circles.
  const blobs = Array.from({ length: 9 }, (_, i) => {
    const cx = next() * w;
    const cy = next() * h;
    const r = (0.36 + next() * 0.4) * Math.max(w, h);
    const fill = inks[i % inks.length];
    const op = (0.5 + next() * 0.4).toFixed(2);
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${op}"/>`;
  }).join("");

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" fill="${base}"/>
  ${blobs}
</svg>`);
}

/** A fine monochrome noise layer, composited at low opacity. */
function grain(w, h, seed) {
  const next = rng(seed);
  const px = Buffer.alloc(w * h);
  for (let i = 0; i < px.length; i++) px[i] = 118 + Math.round(next() * 20);
  return sharp(px, { raw: { width: w, height: h, channels: 1 } })
    .png()
    .toBuffer();
}

const JOBS = [
  ["primary.jpg", 1400, 1750, PIECES.primary, 7],
  ["warm.jpg", 1000, 1000, PIECES.warm, 29],
  ["cool.jpg", 1000, 1000, PIECES.cool, 53],
];

(async () => {
  for (const [name, w, h, colors, seed] of JOBS) {
    const dest = path.join(OUT, name);
    const field = await sharp(mesh(w, h, colors, seed))
      .blur(Math.round(Math.min(w, h) / 9))
      .modulate({ saturation: 1.18 })
      .toBuffer();

    await sharp(field)
      .composite([
        { input: await grain(w, h, seed + 1), blend: "soft-light", opacity: 0.5 },
      ])
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(dest);

    const kb = (fs.statSync(dest).size / 1024).toFixed(0);
    console.log(`${("hero/" + name).padEnd(24)} ${w}x${h}  ${kb}kB`);
  }
})();
