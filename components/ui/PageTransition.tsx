"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Route transition.
 *
 * Keyed on pathname so each route mounts its own fade-and-rise. Kept
 * intentionally short (0.5s) and subtle — a page transition should cover the
 * navigation, not become an event in itself.
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
