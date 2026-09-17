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

// Re-graded for the light palette sampled from fortosee.mp4. Each scheme is
// a pale wash with one saturated note, so a cover reads as a soft
// photographic field sitting ON the page rather than a dark hole punched
// through it. The veil in `field` darkens toward the bottom, so the base
// values start lighter than the surface they land on.
const SCHEMES = {
  portrait:   ["#F2F5F9", "#DEE8F6", "#C2D8F3", "#89B4EE"],
  hero:       ["#F3F5FA", "#E1E9F6", "#C7D9F1", "#95BCEF"],
  rwasport:   ["#F0F4FB", "#D8E5F8", "#B5D0F6", "#74ACF2"],
  greenhouse: ["#EFF6F3", "#D9ECE5", "#B6DCD0", "#7FC5B1"],
  cleankigali:["#EEF5F7", "#D8EAEE", "#B2D7DF", "#78BDCA"],
  tembera:    ["#F3F1F9", "#E2DEF4", "#C7BFEA", "#9A90D3"],
  transiteco: ["#F1F3F8", "#DFE4EE", "#C2CCDC", "#92A0B8"],
  payment:    ["#F8F4EE", "#F1E6D4", "#E4CCA5", "#D3AC6B"],
  ikibina:    ["#F3F1F8", "#E2DDF2", "#C9C0E6", "#9F94CF"],
  school:     ["#F0F2F6", "#DEE3EB", "#BFCAD8", "#92A0B2"],

  // The journey strip still reads left to right as a progression: warm
  // workbench -> teal server era -> the accent blue -> violet.
  jFoundation:["#F8F4ED", "#F2E7D3", "#E6D0A8", "#D4B070"],
  jEarly:     ["#EEF6F4", "#D8EDE7", "#B3DDD2", "#7AC6B3"],
  jCurrent:   ["#EDF3FB", "#D6E4F9", "#AFCEF7", "#6EA9F2"],
  jOngoing:   ["#F2F1F9", "#E0DEF4", "#C3BEEA", "#9590D3"],
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
      <stop offset="100%" stop-color="${c0}" stop-opacity="0.28"/>
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
      .modulate({ saturation: 0.92, brightness: 1.02 })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(dest);
    const kb = (fs.statSync(dest).size / 1024).toFixed(0);
    console.log(`${name.padEnd(40)} ${w}x${h}  ${kb}kB`);
  }
})();
