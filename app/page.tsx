import Hero from "@/components/sections/Hero";
import {
  About,
  WhatIDo,
  SelectedWork,
  ProjectGrid,
  Toolbox,
  Journey,
  Beyond,
  ClosingCta,
} from "@/components/sections/HomeSections";

/**
 * The page reads as a single scroll: who, what, proof, depth, history, how,
 * and an invitation.
 *
 * `SelectedWork` and `ProjectGrid` deliberately sit next to each other — the
 * first argues for three projects in prose beside a laptop, the second lets
 * you browse all eight. One without the other is either a wall of cards with
 * no argument, or an argument with nothing to browse.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <WhatIDo />
      <SelectedWork />
      <ProjectGrid />
      <Toolbox />
      <Journey />
      <Beyond />
      <ClosingCta />
    </>
  );
}
