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

// Re-graded onto the token sheet's palette. The sheet carries exactly TWO
// chromatic hues — amber #FEB002 and acid #70FF00 — so fourteen covers that
// all had to be distinguishable are built from tonal steps of those two plus
// the sheet's greys, rather than from invented hues. Every cover is therefore
// amber-led, acid-led, or neutral, and the variation inside each family comes
// from how light the base is and how much of the dark ground shows through.
const SCHEMES = {
  portrait:   ["#F2F2F2", "#FFD37A", "#FEB002", "#E5A002"],
  hero:       ["#FFFFFF", "#FFE0A3", "#FEB002", "#C98C02"],
  rwasport:   ["#F2F2F2", "#C6F89B", "#70FF00", "#4FBF00"],
  greenhouse: ["#F2F2F2", "#A8FF5E", "#70FF00", "#FEB002"],
  cleankigali:["#FFFFFF", "#D4FFB0", "#70FF00", "#828282"],
  tembera:    ["#F2F2F2", "#FFD37A", "#FEB002", "#70FF00"],
  transiteco: ["#F2F2F2", "#BFBFBF", "#828282", "#4F4F4F"],
  payment:    ["#FFFFFF", "#FFC94D", "#E5A002", "#161616"],
  ikibina:    ["#F2F2F2", "#FFE0A3", "#C98C02", "#828282"],
  school:     ["#FFFFFF", "#CFCFCF", "#828282", "#FEB002"],

  // The journey strip reads left to right as a progression: a warm amber
  // workbench, into acid green, into the near-black ground, and out again
  // into amber at full strength.
  jFoundation:["#FFFFFF", "#FFE0A3", "#FEB002", "#C98C02"],
  jEarly:     ["#F2F2F2", "#C6F89B", "#70FF00", "#4FBF00"],
  jCurrent:   ["#E8E8E8", "#9A9A9A", "#4F4F4F", "#161616"],
  jOngoing:   ["#FFFFFF", "#FFD37A", "#FEB002", "#70FF00"],
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
      .modulate({ saturation: 1.04, brightness: 1.0 })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(dest);
    const kb = (fs.statSync(dest).size / 1024).toFixed(0);
    console.log(`${name.padEnd(40)} ${w}x${h}  ${kb}kB`);
  }
})();
