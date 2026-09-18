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

// Re-graded to sit beside the hero art, which is a saturated mesh gradient.
// The previous pass was so pale the covers read as blank tiles next to it —
// a cover is meant to be the loudest thing in its card, not the quietest.
// Each scheme is a light base with three real chroma notes; the heavy blur
// and the veil in `field` take most of the intensity back out.
const SCHEMES = {
  portrait:   ["#E8EFFC", "#9CC0F5", "#5B8DEF", "#C7B4FF"],
  hero:       ["#E9F0FD", "#A5C6F7", "#4F8BF0", "#B9A8FF"],
  rwasport:   ["#E6F0FE", "#8FBDF8", "#2F7BEF", "#63D3E8"],
  greenhouse: ["#E7F6F0", "#93DCC2", "#3FBF96", "#BEE86F"],
  cleankigali:["#E6F4F7", "#8FD3E2", "#3CA9C6", "#7BE0C9"],
  tembera:    ["#EFEBFD", "#BDAEF5", "#7C5CE8", "#E39BE0"],
  transiteco: ["#EBEFF6", "#A9B8D4", "#6B82AC", "#8FB6D9"],
  payment:    ["#FCF3E6", "#F3D5A0", "#E0A94F", "#FF9E6B"],
  ikibina:    ["#EFEAFB", "#C3B0EE", "#8465D8", "#B79BF0"],
  school:     ["#EBEFF5", "#ABBBD3", "#6C86A8", "#9CC2DD"],

  // The journey strip reads left to right as a progression: warm workbench
  // -> teal server era -> the accent blue -> violet.
  jFoundation:["#FCF2E4", "#F0D096", "#DFA243", "#FFAE72"],
  jEarly:     ["#E6F5F1", "#8FDAC4", "#38BC97", "#6FD7C0"],
  jCurrent:   ["#E6EFFD", "#93C0F8", "#2F7BEF", "#6BB2F5"],
  jOngoing:   ["#EEEAFC", "#BFAEF2", "#7C5CE8", "#A98FE8"],
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
    const op = 0.44 + next() * 0.34;
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
      <stop offset="100%" stop-color="${c0}" stop-opacity="0.16"/>
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
  ["journey/foundation.jpg", 1600, 1000, SCHEMES.jFoundation, 131],
  ["journey/early-work.jpg", 1600, 1000, SCHEMES.jEarly, 149],
  ["journey/current.jpg", 1600, 1000, SCHEMES.jCurrent, 163],
  ["journey/ongoing.jpg", 1600, 1000, SCHEMES.jOngoing, 177],
];

(async () => {
  fs.mkdirSync(path.join(OUT, "projects"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "journey"), { recursive: true });

  for (const [name, w, h, colors, seed] of JOBS) {
    const dest = path.join(OUT, name);
    await sharp(field(w, h, colors, seed))
      // Heavy blur turns the hard circles into a soft photographic field.
      .blur(Math.round(Math.min(w, h) / 26))
      .modulate({ saturation: 1.12, brightness: 1.0 })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(dest);
    const kb = (fs.statSync(dest).size / 1024).toFixed(0);
    console.log(`${name.padEnd(40)} ${w}x${h}  ${kb}kB`);
  }
})();
