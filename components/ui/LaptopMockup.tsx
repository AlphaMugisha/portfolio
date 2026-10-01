"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * A laptop frame holding a project cover.
 *
 * The screen is `object-cover` at a fixed 16:10, which is a real laptop
 * ratio — letting the image pick the ratio instead would make the "laptop"
 * change proportions per project and stop reading as a device.
 */
export default function LaptopMockup({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label?: string;
}) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: [0.21, 0.5, 0.3, 1] }}
      className="relative mx-auto w-full max-w-[860px]"
    >
      <div className="relative rounded-t-2xl border-[4px] border-neutral-700 bg-neutral-800 p-2 pb-0 shadow-2xl">
        <div className="relative flex flex-col overflow-hidden rounded-t-lg border border-neutral-900 bg-white aspect-[16/10]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 860px, 100vw"
            className="object-cover"
          />
          {label ? (
            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-900 shadow-md backdrop-blur">
              {label}
            </span>
          ) : null}
        </div>
      </div>
      <div className="h-4 rounded-b-2xl border-t border-neutral-600 bg-neutral-700 shadow-xl" />
      <div className="mx-auto h-1 w-32 rounded-b-full bg-neutral-600 shadow-sm" />
    </motion.div>
  );
}
