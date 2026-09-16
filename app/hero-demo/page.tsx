import type { Metadata } from "next";
import HeroLab from "@/components/demo/HeroLab";

/**
 * A scratch route for comparing the rebuilt hero against the one it
 * replaced. Kept out of the sitemap and out of search — it is a workbench,
 * not a page of the site.
 */
export const metadata: Metadata = {
  title: "Hero lab",
  robots: { index: false, follow: false },
};

export default function HeroDemoPage() {
  return <HeroLab />;
}
