"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Route transition — a dolly cut.
 *
 * Keyed on pathname so each route mounts its own entrance. Navigating now
 * reads as depth rather than replacement: the incoming page resolves forward
 * out of the room — from slightly behind the focal plane, soft, a beat below
 * — exactly the grammar every section uses to approach the camera. One
 * movement language, page-level included.
 *
 * Note this is an enter-only transition. A true exit animation would need the
 * outgoing route to stay mounted, which the App Router does not do without
 * holding navigation back — a trade that costs perceived speed for polish
 * nobody asked for.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 16, scale: 0.985, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      /* A residual `filter: blur(0px)` is not cosmetically idle: any filter
         value makes this wrapper the containing block for every fixed
         descendant, which silently reparents things like the pointer-
         following preview. Once the cut has landed, the property goes. */
      onAnimationComplete={(def) => {
        if (typeof def === "object" && def !== null && "filter" in def) {
          const el = document.querySelector<HTMLElement>("main > div");
          if (el) el.style.filter = "";
        }
      }}
    >
      {children}
    </motion.div>
  );
}
