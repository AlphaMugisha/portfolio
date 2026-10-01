/**
 * Downloads the site's placeholder photography from Unsplash and writes it
 * into `public/images`.
 *
 * These replace the mesh-gradient fields the site used to ship. A gradient
 * reads as "nothing has been put here yet"; a photograph gives every card a
 * real subject, which is most of the difference between a portfolio that
 * looks designed and one that looks unfinished.
 *
 * Each file is fetched at 2x the largest box it is displayed in, re-encoded
 * as mozjpeg, and committed — so the build never touches the network and
 * `next/image` optimises them exactly as it would a real photograph. Swapping
 * a real photo in later is a file replacement, nothing more.
 *
 * Every image is an Unsplash photo, free to use under the Unsplash licence.
 * The id in each entry is the photo's permalink slug, so the original is
 * always findable at https://unsplash.com/photos/<id>.
 *
 *   node scripts/fetch-photos.js
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const OUT = path.join(__dirname, "..", "public", "images");

/* Subject is chosen per project rather than at random — a greenhouse photo on
   the greenhouse case study, a bus on the transit API. A placeholder that
   matches its caption stops reading as a placeholder. */
const JOBS = [
  // name, unsplash id, width, height, crop position
  ["portrait.jpg", "photo-1507003211169-0a1dd7228f2d", 1200, 1500, "top"],
  ["hero.jpg", "photo-1498050108023-c5249f4df085", 2000, 1300, "centre"],
  ["hero/primary.jpg", "photo-1517336714731-489689fd1ca8", 1400, 1750, "centre"],
  ["hero/warm.jpg", "photo-1518770660439-4636190af475", 1000, 1000, "centre"],
  ["hero/cool.jpg", "photo-1555066931-4365d14bab8c", 1000, 1000, "centre"],

  ["projects/rwasport.jpg", "photo-1579952363873-27f3bade9f55", 1600, 1200, "centre"],
  ["projects/greenhouse-automation.jpg", "photo-1416879595882-3373a0480b5b", 1600, 1200, "centre"],
  ["projects/clean-kigali.jpg", "photo-1532996122724-e3c354a0b15b", 1600, 1200, "centre"],
  ["projects/tembera.jpg", "photo-1547471080-7cc2caa01a7e", 1600, 1200, "centre"],
  ["projects/transiteco.jpg", "photo-1570125909232-eb263c188f7e", 1600, 1200, "centre"],
  ["projects/payment-system.jpg", "photo-1556742049-0cfed4f6a45d", 1600, 1200, "centre"],
  ["projects/digital-ikibina.jpg", "photo-1521791136064-7986c2920216", 1600, 1200, "centre"],
  ["projects/school-systems.jpg", "photo-1577896851231-70ef18881754", 1600, 1200, "centre"],

  ["journey/foundation.jpg", "photo-1517077304055-6e89abbf09b0", 1600, 1000, "centre"],
  ["journey/early-work.jpg", "photo-1461749280684-dccba630e2f6", 1600, 1000, "centre"],
  ["journey/current.jpg", "photo-1522071820081-009f0129c71c", 1600, 1000, "centre"],
  ["journey/ongoing.jpg", "photo-1517245386807-bb43f82c33c4", 1600, 1000, "centre"],
];

const url = (id, w) =>
  `https://images.unsplash.com/${id}?w=${w}&q=85&fm=jpg&crop=entropy&fit=max`;

(async () => {
  fs.mkdirSync(path.join(OUT, "projects"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "journey"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "hero"), { recursive: true });

  for (const [name, id, w, h, position] of JOBS) {
    const dest = path.join(OUT, name);
    const res = await fetch(url(id, Math.max(w, h) * 2));
    if (!res.ok) {
      console.error(`FAILED ${name}  ${res.status}`);
      process.exitCode = 1;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());

    await sharp(buf)
      .resize(w, h, { fit: "cover", position })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(dest);

    const kb = (fs.statSync(dest).size / 1024).toFixed(0);
    console.log(`${name.padEnd(40)} ${w}x${h}  ${kb}kB`);
  }
})();
