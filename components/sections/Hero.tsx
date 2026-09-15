"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import LiquidText from "@/components/ui/LiquidText";
import SplitText from "@/components/ui/SplitText";
import RotatingSeal from "@/components/ui/RotatingSeal";
import HeroCutScene from "@/components/three/HeroCutScene";
import { site } from "@/lib/site";

/**
 * Opening screen.
 *
 * The geometry here is measured off the reference rather than composed, and
 * every number below is a fraction of the VIEWPORT HEIGHT, not its width —
 * that is the single most important thing about this layout. Sizing the word
 * off `vw` (the instinctive choice, and what this file did before) makes it
 * collapse on a short window and tower on a tall one; the reference holds its
 * proportions because the type is pinned to the height and only its
 * condensation answers to the width.
 *
 * The schedule down the screen:
 *
 *     11.0svh   air
 *     56.3svh   SOFTWARE — cap height, not font size
 *      2.7svh   gap
 *      8.2svh   ENGINEER — a 6.9:1 cap ratio against the word above
 *     22.0svh   air, carrying the caption row and the scroll cue
 *
 * The word is NOT edge to edge: it holds an 18.7% margin on each flank and
 * spans 62.5% of the viewport width. Anton is condensed but nowhere near
 * condensed enough — the reference runs about 0.226 advance per cap height —
 * so the word is compressed horizontally to reach it. Solved rather than
 * guessed: Anton's cap is 0.86em and SOFTWARE sets 3.814em wide, so a
 * 65.5svh face at scaleX(0.408) lands on both targets at once.
 */

/* ---- The measured schedule, in svh. ---- */
const CAP_TOP = 11.0;
const GIANT_CAP = 56.3;
const WORD_GAP = 2.7;
const SMALL_CAP = 8.2;

/* ---- Anton, measured in the browser rather than assumed. ---- */
const CAP_RATIO = 0.86;
const W_SOFTWARE = 3.8141; // em, at tracking 0
const W_ENGINEER = 3.4191;

/** Reference viewport aspect. Ours matches it, which is why this resolves. */
const ASPECT = 1.629;

/* font-size that puts the cap at the target height. */
const GIANT_SIZE = GIANT_CAP / CAP_RATIO; // svh
const SMALL_SIZE = SMALL_CAP / CAP_RATIO;

/* scaleX that puts the word at the target width.

   Watch the units: the sizes above are in svh and the width targets are in
   vw, so the natural width (svh) has to be converted before the ratio is
   taken. 1svh = (1/ASPECT) vw, so dividing a svh figure by ASPECT gives vw —
   which means the target must be multiplied by ASPECT to meet it. Getting
   this backwards silently produces a word a third of its intended width. */
const naturalVw = (sizeSvh: number, emWidth: number) =>
  (sizeSvh * emWidth) / ASPECT;

const GIANT_SCALE_X = 62.5 / naturalVw(GIANT_SIZE, W_SOFTWARE);
const SMALL_SCALE_X = 21.9 / naturalVw(SMALL_SIZE, W_ENGINEER);

/* Pinning the type to viewport HEIGHT only holds while the viewport is as
   wide as the reference's. On a phone (aspect ~0.46 against the reference's
   1.629) a height-driven size runs the word several times past the screen
   edge. So each size is the SMALLER of its height-driven and width-driven
   values: identical at the reference aspect, and self-correcting on anything
   narrower, where the word simply becomes width-bound and keeps its 62.5%
   measure. */
const size = (svh: number) => `min(${svh.toFixed(2)}svh, ${(svh / ASPECT).toFixed(2)}vw)`;

/* SplitText's mask boxes carry a little padding below the baseline so a
   descender is never clipped. On the giant word that is nearly 4svh of empty
   space, which would push everything below it off the schedule — so the gap
   pays it back. */
const MASK_PAD_EM = 0.06;
const GAP_MINUS_PAD = WORD_GAP - MASK_PAD_EM * GIANT_SIZE;

const DISCIPLINES = [
  { label: "Software", href: "#skills" },
  { label: "Hardware", href: "#skills" },
  { label: "Applied AI", href: "#skills" },
];

/* The reference sets the discipline row on a shallow upward arc rather than a
   flat line — the middle label rides about 2.9svh above the outer two. */
const ARC = [0, -2.9, 0];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // How far the hero has scrolled away, as a plain number. The cut reads it to
  // deepen its room, so the word has become the ground by the time it releases.
  const [scrolled, setScrolled] = useState(0);
  // True once the WebGL cut has taken over the word.
  const [cut, setCut] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const wordY = useTransform(scrollYProgress, [0, 1], ["0%", "34%"]);
  const chromeY = useTransform(scrollYProgress, [0, 1], ["0%", "70%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useMotionValueEvent(scrollYProgress, "change", setScrolled);

  const s = <T,>(v: T): T | undefined => (reduced ? undefined : v);

  return (
    <section
      ref={ref}
      id="hero"
      data-band="light"
      className="relative min-h-svh overflow-hidden bg-band-light text-on-band"
    >
      {/* The word, shaded as an aperture cut through the band. Sits behind all
          the copy; the flat word above it is both the entrance and the
          no-WebGL fallback. */}
      <HeroCutScene hostRef={ref} scrolled={scrolled} onActive={setCut} />

      <motion.div
        style={{ opacity: s(opacity) }}
        className="relative z-10 min-h-svh"
      >
        {/* ---- The word ----
            Pinned to the top of the schedule rather than centred. `line-height`
            is set to the cap ratio so the line box IS the cap height, which is
            what makes the svh schedule above land where it says it does. */}
        <motion.div
          style={{ y: s(wordY), paddingTop: `${CAP_TOP}svh` }}
          className="relative flex flex-col items-center"
        >
          {/* Only the giant line melts. In the reel the smaller word beneath
              stays razor sharp at the exact instant the big one is torn apart —
              that contrast between the one unstable element and everything
              stable around it IS the effect. */}
          <LiquidText
            disabled={cut}
            className="relative flex select-none justify-center"
          >
            <SplitText
              as="h1"
              data-liquid-target
              text="Software"
              delay={0.15}
              stagger={0.05}
              className="text-mega block whitespace-nowrap text-on-band"
              style={{
                fontSize: size(GIANT_SIZE),
                lineHeight: CAP_RATIO,
                transform: `scaleX(${GIANT_SCALE_X.toFixed(4)})`,
              }}
            />
          </LiquidText>

          <SplitText
            text="Engineer"
            delay={0.5}
            stagger={0.035}
            className="text-mega block whitespace-nowrap text-on-band"
            style={{
              fontSize: size(SMALL_SIZE),
              lineHeight: CAP_RATIO,
              marginTop: `${GAP_MINUS_PAD.toFixed(2)}svh`,
              transform: `scaleX(${SMALL_SCALE_X.toFixed(4)})`,
            }}
          />
        </motion.div>

        {/* ---- Caption row ----
            Absolutely placed, so it holds its slot in the schedule however the
            word above it resolves. */}
        <motion.div
          style={{ y: s(chromeY) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="hero-caption flex flex-col items-center"
        >
          <ul className="mt-[3.5svh] flex flex-wrap items-center justify-center gap-x-[5vw]">
            {DISCIPLINES.map((d, i) => (
              <li
                key={d.label}
                className="flex items-center gap-x-[5vw]"
                style={{ transform: `translateY(${ARC[i]}svh)` }}
              >
                <Link
                  href={d.href}
                  data-cursor="Explore"
                  className="link-sweep meta text-[0.8rem] text-on-band transition-colors duration-400 hover:text-primary"
                >
                  {d.label}
                  <span className="link-sweep-line" />
                </Link>
                {i < DISCIPLINES.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-on-band/40"
                    style={{ transform: `translateY(${-ARC[i] - 1.4}svh)` }}
                  />
                )}
              </li>
            ))}
          </ul>

          {/* The reference's cue is a hairline with a chevron tip rather than
              an icon, and it drops a tonal step below the labels above it. */}
          <Link
            href="#about"
            data-cursor="Scroll"
            className="group mt-[4svh] flex flex-col items-center gap-[2svh]"
          >
            <span className="meta text-[0.625rem] text-on-band-muted transition-colors duration-400 group-hover:text-on-band">
              Scroll to explore
            </span>
            <motion.span
              aria-hidden="true"
              animate={reduced ? undefined : { y: [0, 6, 0] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
              className="relative block h-[4.4svh] w-px bg-on-band/45"
            >
              <span className="absolute -bottom-px left-1/2 block h-[7px] w-[7px] -translate-x-1/2 rotate-45 border-b border-r border-on-band/45" />
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>

      {/* ---- Corners ----
          Both land on a common rule at 92.5svh, which is what stops them
          reading as two unrelated marks that happen to sit near the edges. */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-[7.5svh] left-6 flex items-baseline gap-2 text-on-band-muted sm:left-10"
      >
        {/* The script face has no copyright glyph, so the mark and the year
            stay in the sans and only the name is set as a signature. */}
        <span className="meta">© {new Date().getFullYear()}</span>
        <span className="script text-xl leading-none sm:text-2xl">
          {site.shortName.toLowerCase()}
        </span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-[7.5svh] right-5 hidden sm:right-9 sm:block"
      >
        {/* Short enough that two passes fit the ring without colliding. */}
        <RotatingSeal
          tone="light"
          text="Based in Rwanda"
          className="h-[86px] w-[86px] sm:h-[116px] sm:w-[116px]"
        />
      </motion.div>
    </section>
  );
}
