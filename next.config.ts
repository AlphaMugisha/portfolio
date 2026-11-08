import type { NextConfig } from "next";

/**
 * Images uploaded through the admin live in Supabase Storage, so `next/image`
 * has to be told that host is allowed to serve them. The hostname is derived
 * from the same environment variable the client uses, rather than hard-coded,
 * so pointing the site at a different Supabase project needs no code change.
 *
 * `remotePatterns` is scoped to the public object path of the media bucket —
 * not the whole origin — so this does not turn the site into an open image
 * proxy for anything else hosted on that domain.
 */
const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/media/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
