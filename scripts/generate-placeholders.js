/**
 * Generates placeholder photography for the portfolio.
 *
 * These are real JPEGs so next/image optimises them exactly as it will the
 * real photographs — swapping one in later is a file replacement, nothing more.
 * Each is an abstract soft-gradient field in the site palette, so the page
 * reads as designed rather than as a wireframe.
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "..", "public", "images");
fs.mkdirSync(OUT, { recursive: true });

// Palette-adjacent tones. Cool institutional greens/blues with warm relief.
const SCHEMES = {
  portrait:   ["#0e0e0e", "#2a2418", "#6b5522", "#c9a24a"],
  hero:       ["#0c0c0c", "#242424", "#4a4034", "#a98a3e"],
  rwasport:   ["#0e0e0e", "#2b2410", "#7a6020", "#feb002"],
  greenhouse: ["#0d0f0a", "#20290f", "#4e6b1e", "#8fdc3c"],
  cleankigali:["#0c0e0d", "#1e2a22", "#3f5c3a", "#7fae52"],
  tembera:    ["#0e0d0a", "#2a2415", "#635123", "#d2a534"],
  transiteco: ["#0b0c0d", "#20262b", "#465360", "#9aa7b4"],
  payment:    ["#0e0d0a", "#292213", "#6d5722", "#e8a92e"],
  ikibina:    ["#0f0d0b", "#2d2418", "#705a30", "#c99a45"],
  school:     ["#0c0d0e", "#232629", "#4b5257", "#a2a8ad"],
};

/** Soft blurred blobs over a base wash — reads as depth-of-field photography. */
function field(w, h, colors, seed) {
  const [c0, c1, c2, c3] = colors;
  let rnd = seed;
  const next = () => {
    rnd = (rnd * 9301 + 49297) % 233280;
    return rnd / 233280;
  };

  const blobs = Array.from({ length: 7 }, (_, i) => {
    const cx = next() * w;
    const cy = next() * h;
    const r = (0.28 + next() * 0.42) * Math.min(w, h);
    const fill = [c1, c2, c3, c2][i % 4];
    const op = 0.34 + next() * 0.3;
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${op.toFixed(2)}"/>`;
  }).join("");

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c0}"/>
      <stop offset="60%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${c0}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${c0}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#base)"/>
  <g filter="blur(0)">${blobs}</g>
  <rect width="${w}" height="${h}" fill="url(#veil)"/>
</svg>`);
}

const JOBS = [
  ["portrait.jpg", 1200, 1500, SCHEMES.portrait, 11],
  ["hero.jpg", 2000, 1300, SCHEMES.hero, 23],
  ["projects/rwasport.jpg", 1600, 1200, SCHEMES.rwasport, 31],
  ["projects/greenhouse-automation.jpg", 1600, 1200, SCHEMES.greenhouse, 43],
  ["projects/clean-kigali.jpg", 1600, 1200, SCHEMES.cleankigali, 57],
  ["projects/tembera.jpg", 1600, 1200, SCHEMES.tembera, 67],
  ["projects/transiteco.jpg", 1600, 1200, SCHEMES.transiteco, 79],
  ["projects/payment-system.jpg", 1600, 1200, SCHEMES.payment, 91],
  ["projects/digital-ikibina.jpg", 1600, 1200, SCHEMES.ikibina, 103],
  ["projects/school-systems.jpg", 1600, 1200, SCHEMES.school, 117],
];

(async () => {
  fs.mkdirSync(path.join(OUT, "projects"), { recursive: true });

  for (const [name, w, h, colors, seed] of JOBS) {
    const dest = path.join(OUT, name);
    await sharp(field(w, h, colors, seed))
      // Heavy blur turns the hard circles into a soft photographic field.
      .blur(Math.round(Math.min(w, h) / 26))
      .modulate({ saturation: 0.85 })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(dest);
    const kb = (fs.statSync(dest).size / 1024).toFixed(0);
    console.log(`${name.padEnd(40)} ${w}x${h}  ${kb}kB`);
  }
})();
