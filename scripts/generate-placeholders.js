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

// The machine-hall grade: blue-charcoal bases, cold cyan/teal light, one
// deliberately ember-warm plate (payment) so the rack keeps a single warm
// beat — the same role the tungsten key light plays in the 3D scene.
const SCHEMES = {
  portrait:   ["#0B0E14", "#1B2433", "#31506B", "#7FB4CF"],
  hero:       ["#0A0D12", "#182130", "#2E4C66", "#6FA9C9"],
  rwasport:   ["#0C1220", "#1B3450", "#2B6E8C", "#54D1DB"],
  greenhouse: ["#0C1314", "#183E3A", "#297065", "#43C6B0"],
  cleankigali:["#0D1317", "#204046", "#387173", "#5BC8C0"],
  tembera:    ["#101019", "#2B2D4A", "#4E5188", "#8D8FD1"],
  transiteco: ["#0D1016", "#243040", "#465C72", "#93AFC7"],
  payment:    ["#0E0C0A", "#2B2013", "#6B4A1F", "#FFB466"],
  ikibina:    ["#100F17", "#2B2740", "#554E78", "#9A93C9"],
  school:     ["#0D1013", "#273340", "#4D667E", "#9FB9CE"],
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
