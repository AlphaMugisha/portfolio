"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Power-on sequence.
 *
 * A board does a self-test before it runs, and this site is built as a
 * board, so the load is staged as one: the rails come up, each of the
 * three disciplines links in turn, and the page is handed over. It is
 * also doing real work — it gives the webfonts a beat to land, so the
 * hero's kinetic type builds in its final face instead of reflowing
 * from a fallback mid-animation.
 *
 * The rules that keep a preloader from being an obstacle:
 *   - it runs ONCE per tab (sessionStorage), never on in-site navigation;
 *   - under `prefers-reduced-motion` it does not mount at all;
 *   - the whole thing is ~1.5s, and a click or any key skips it. The
 *     budget is tight on purpose: the hero's own entrance runs after
 *     this one, and the two together have to put the call to action on
 *     screen well inside the first few seconds, not after them;
 *   - it is a fixed overlay, so it cannot shift the layout underneath;
 *   - `ready` is published through context, so the hero starts its own
 *     entrance exactly as the shutter clears instead of guessing a delay.
 */

const BootContext = createContext<{ ready: boolean }>({ ready: true });

export function useBoot() {
  return useContext(BootContext);
}

const STAGES = ["Substrate", "Hardware", "Software", "Intelligence"] as const;
const SESSION_KEY = "signal:booted";

export function BootProvider({ children }: { children: ReactNode }) {
  // `null` = undecided (first paint, before we can read sessionStorage).
  // Rendering the overlay only once this is `true` avoids a flash of the
  // shutter for visitors who have already seen it this session.
  const [show, setShow] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Private mode or storage disabled — treat as unseen but harmless.
    }

    if (reduced || seen) {
      setShow(false);
      setReady(true);
      return;
    }

    setShow(true);
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
  }, []);

  const finish = useCallback(() => {
    setShow(false);
    setReady(true);
  }, []);

  return (
    <BootContext.Provider value={{ ready }}>
      {show ? <BootOverlay onDone={finish} /> : null}
      {children}
    </BootContext.Provider>
  );
}

function BootOverlay({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  // Scrolling is locked for the duration so the page cannot be moved
  // underneath the shutter and arrive mid-way down.
  useEffect(() => {
    document.documentElement.dataset.scrollLocked = "true";
    return () => {
      delete document.documentElement.dataset.scrollLocked;
    };
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (done.current) return;
          done.current = true;
          onDone();
        },
      });

      const count = { v: 0 };
      tl.to(count, {
        v: 100,
        duration: 0.85,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counter.current) {
            counter.current.textContent = String(Math.round(count.v)).padStart(3, "0");
          }
        },
      })
        .from(
          "[data-boot-stage]",
          { opacity: 0, x: -10, duration: 0.26, stagger: 0.12, ease: "power2.out" },
          0.05,
        )
        .to("[data-boot-dot]", { backgroundColor: "#54d1db", duration: 0.18, stagger: 0.12 }, 0.14)
        .to("[data-boot-rail]", { scaleX: 1, duration: 0.85, ease: "power2.inOut" }, 0.05)
        // The shutter leaves as two bands splitting apart, which is the
        // same chamfered-edge language the rest of the site is built from.
        .to("[data-boot-body]", { opacity: 0, duration: 0.18 }, "+=0.04")
        .to("[data-boot-band='top']", { yPercent: -101, duration: 0.6, ease: "power4.inOut" }, "<")
        .to("[data-boot-band='bottom']", { yPercent: 101, duration: 0.6, ease: "power4.inOut" }, "<");

      const skip = () => {
        if (done.current) return;
        tl.progress(1);
      };
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);
      return () => {
        window.removeEventListener("keydown", skip);
        window.removeEventListener("pointerdown", skip);
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[500]"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      <div data-boot-band="top" className="absolute inset-x-0 top-0 h-1/2 bg-ink-deep" />
      <div data-boot-band="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-ink-deep" />

      <div
        data-boot-body
        className="relative z-10 flex h-full w-full flex-col justify-between p-6 sm:p-10"
      >
        <div className="flex items-start justify-between">
          <span className="note note-signal">Alpha Mugisha</span>
          <span className="note">Kigali, RW</span>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <ul className="space-y-2.5">
            {STAGES.map((stage) => (
              <li
                key={stage}
                data-boot-stage
                className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted"
              >
                <span
                  data-boot-dot
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: "#243040" }}
                />
                <span className="flex-1">{stage}</span>
                <span className="text-text-subtle">link</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 h-px w-full overflow-hidden bg-rule">
            <div data-boot-rail className="h-full w-full origin-left scale-x-0 bg-signal" />
          </div>
        </div>

        <div className="flex items-end justify-between">
          <span className="note">Power-on self test</span>
          <span className="font-mono text-4xl leading-none tracking-tight text-signal sm:text-5xl">
            <span ref={counter}>000</span>
            <span className="ml-1 text-sm text-text-subtle">%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
