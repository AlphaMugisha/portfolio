"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { Reveal } from "@/components/ui/motion-primitives";
import LiquidText from "@/components/ui/LiquidText";
import SplitText from "@/components/ui/SplitText";
import Marquee from "@/components/ui/Marquee";
import Magnetic from "@/components/ui/Magnetic";
import Approach from "@/components/ui/Approach";
import Deep, { DeepLayer, DeepWord } from "@/components/ui/Deep";
import { useCapability } from "@/components/ui/useCapability";
import { pointerX, pointerY } from "@/lib/pointer";
import { site, navItems } from "@/lib/site";

const social = [
  { label: "GitHub", href: site.github, icon: GithubIcon },
  { label: "LinkedIn", href: site.linkedin, icon: LinkedinIcon },
];

/**
 * Contact — the far wall of the room, then the floor.
 *
 * The page closes the way it opened: one word at full size, liquefying under
 * the pointer. But it no longer closes on a flat page — this is the back of
 * the space the hero cut into. The location hangs deep behind the word, the
 * practical details stand in front of it as plates you can press, a pool of
 * the gold light drifts after the pointer the way the accent has followed
 * attention all the way down, and beneath everything the footer stands on a
 * gridded floor receding to a horizon. The room ends; the email address is
 * the door.
 */
export default function Contact() {
  const cap = useCapability();

  // The light in the room notices where you are. One blurred gold pool,
  // springed after the shared pointer — presence, not a spotlight chase.
  // The spring runs on the raw numbers; units are applied after, because a
  // spring given "42%" has nothing to integrate.
  const spring = { stiffness: 40, damping: 18, mass: 0.8 };
  const sx = useSpring(pointerX, spring);
  const sy = useSpring(pointerY, spring);
  const lightX = useTransform(sx, [-1, 1], ["12%", "68%"]);
  const lightY = useTransform(sy, [-1, 1], ["8%", "60%"]);

  const lit = cap.ready && cap.finePointer && !cap.reducedMotion;

  return (
    <>
      <section
        id="contact"
        data-band="dark"
        className="relative scroll-mt-24 overflow-hidden bg-ink px-6 pb-20 pt-24 sm:px-10 sm:pb-24 sm:pt-32"
      >
        {/* The pool of gold that has marked attention all the way down the
            page, now loose in the room with you. */}
        {lit && (
          <motion.div
            aria-hidden="true"
            style={{ left: lightX, top: lightY }}
            className="pointer-events-none absolute z-0 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-[90px]"
          />
        )}

        <Approach>
          <Deep tilt={1.5} className="relative mx-auto max-w-[1600px]">
            {/* The far wall carries where the work is done. */}
            <DeepWord word="Kigali" depth={680} drift={1.25} />

            <DeepLayer depth={0} className="relative">
              <Reveal>
                <p className="meta flex items-center gap-3 text-text-muted">
                  <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
                  04 — What happens next
                </p>
              </Reveal>
            </DeepLayer>

            <DeepLayer depth={24} drift={0.3} className="relative">
              <div
                style={{ transform: "scaleY(1.14)" }}
                className="mt-10 origin-center"
              >
                <LiquidText className="select-none">
                  <SplitText
                    as="h2"
                    data-liquid-target
                    text="Let's talk"
                    trigger="view"
                    stagger={0.04}
                    className="text-mega block text-[clamp(2.8rem,15vw,13rem)] leading-[0.84] text-text-primary"
                  />
                </LiquidText>
              </div>
            </DeepLayer>

            <div className="relative mt-14 grid gap-12 border-t border-line pt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
              <DeepLayer depth={0} drift={0}>
                <Reveal>
                  <p className="max-w-xl text-pretty text-lg leading-relaxed text-text-secondary">
                    I am open to freelance work, full-time roles and
                    collaboration — particularly on systems that serve
                    organisations and communities in Rwanda and the wider
                    region.
                  </p>
                </Reveal>

                {/* The door out of the room. Magnetic, dimensional, and the
                    single most important control on the page. */}
                <Reveal delay={0.1}>
                  <Magnetic pull={9} contentPull={5} radius={110}>
                    <a
                      href={`mailto:${site.email}`}
                      data-cursor="Email"
                      className="plate btn-depth group mt-10 inline-flex flex-wrap items-center gap-4 px-6 py-4 transition-colors duration-400 hover:border-primary"
                    >
                      <span className="text-editorial text-[clamp(1.15rem,3vw,2.1rem)] font-medium text-text-primary transition-colors duration-400 group-hover:text-primary">
                        {site.email}
                      </span>
                      <ArrowUpRight
                        size={20}
                        className="text-text-muted transition-all duration-400 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
                      />
                    </a>
                  </Magnetic>
                </Reveal>
              </DeepLayer>

              {/* The practical details float a step nearer than the prose —
                  plates in front of the wall, each one pressable. */}
              <DeepLayer depth={-30} drift={-0.25}>
                <Reveal delay={0.14}>
                  <dl className="space-y-6">
                    <div className="plate px-5 py-4">
                      <dt className="meta text-text-muted">Location</dt>
                      <dd className="mt-2.5 text-text-primary">
                        {site.location}
                      </dd>
                    </div>

                    <div className="plate px-5 py-4">
                      <dt className="meta text-text-muted">Availability</dt>
                      <dd className="mt-2.5 flex items-center gap-2.5 text-text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        Open to new work
                      </dd>
                    </div>

                    <div>
                      <dt className="meta mb-3 text-text-muted">Elsewhere</dt>
                      <dd className="space-y-3">
                        {social.map((s) => {
                          const Icon = s.icon;
                          return (
                            <a
                              key={s.label}
                              href={s.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="plate btn-depth group flex items-center justify-between px-5 py-3.5 transition-colors duration-400 hover:border-primary"
                            >
                              <span className="flex items-center gap-3">
                                <Icon
                                  size={14}
                                  className="text-text-muted transition-colors duration-400 group-hover:text-primary"
                                />
                                <span className="text-sm text-text-secondary transition-colors duration-400 group-hover:text-text-primary">
                                  {s.label}
                                </span>
                              </span>
                              <ArrowUpRight
                                size={14}
                                className="text-text-muted transition-all duration-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                              />
                            </a>
                          );
                        })}
                      </dd>
                    </div>
                  </dl>
                </Reveal>
              </DeepLayer>
            </div>
          </Deep>
        </Approach>
      </section>

      {/* ---------------- Footer: the floor ---------------- */}
      <footer data-band="dark" className="relative bg-ink">
        {/* The last ribbon, tipped out of the page plane like the ones that
            opened the work section — the site's bands are objects to the end. */}
        <div className="stage-near">
          <div style={{ transform: "rotateX(4deg)" }}>
            <Marquee
              items={[
                "Available for work",
                site.location,
                "Web platforms",
                "Embedded systems",
                "Applied AI",
              ]}
              direction="left"
              duration={40}
              className="border-y border-line py-4"
              itemClassName="meta text-primary"
            />
          </div>
        </div>

        {/* The ground plane. Everything below stands on it. */}
        <div className="stage-near pointer-events-none absolute inset-x-0 bottom-0 top-14 overflow-hidden">
          <div className="floor" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1600px] px-6 py-14 sm:px-10 sm:py-16">
          <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div>
              <p className="script text-3xl leading-none text-text-primary">
                {site.shortName.toLowerCase()}
              </p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">
                {site.role} · {site.location}
              </p>
            </div>

            <nav aria-label="Footer">
              <ul className="flex flex-wrap gap-x-8 gap-y-3">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="meta inline-block text-text-secondary transition-[color,transform] duration-300 hover:-translate-y-0.5 hover:text-primary"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="meta text-text-muted">
              © {new Date().getFullYear()} {site.name}
            </p>
            <p className="meta text-text-muted">Designed &amp; built in Rwanda</p>
          </div>
        </div>
      </footer>
    </>
  );
}
