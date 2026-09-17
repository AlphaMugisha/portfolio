import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

/**
 * The social card, set as the site's opening frame: the compressed display
 * word in near-black on the warm-grey band, name above, disciplines below.
 *
 * Colours are the band tokens from `app/globals.css` — the cyan is
 * deliberately absent because it sits at 1.06:1 on the band; the band
 * carries dark type only, exactly as the hero does.
 *
 * The two faces are vendored TTFs in `lib/og-fonts/` (both OFL) because
 * satori cannot reuse `next/font`'s woff2 pipeline and the build must not
 * depend on the network.
 */

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BAND = "#FFFFFF"; /* --color-band-light */
const INK = "#393A3D"; /* --color-on-band    */
const MUTED = "#61636A"; /* --color-on-band-muted */

export default async function OpenGraphImage() {
  const [anton, inter] = await Promise.all([
    readFile(join(process.cwd(), "lib", "og-fonts", "Anton-Regular.ttf")),
    readFile(join(process.cwd(), "lib", "og-fonts", "Inter-SemiBold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BAND,
          padding: "56px 64px 48px",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 21,
            letterSpacing: 5,
            color: INK,
          }}
        >
          <span>{site.name.toUpperCase()}</span>
          <span style={{ color: MUTED }}>{site.location.toUpperCase()}</span>
        </div>

        {/* The word, compressed as the hero compresses it. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Anton",
              fontSize: 264,
              lineHeight: 0.82,
              letterSpacing: -3,
              color: INK,
              transform: "scaleX(0.72)",
            }}
          >
            SOFTWARE
          </div>
          <div
            style={{
              fontFamily: "Anton",
              fontSize: 92,
              lineHeight: 0.82,
              letterSpacing: -1,
              color: INK,
              transform: "scaleX(0.85)",
              marginTop: 30,
            }}
          >
            ENGINEER
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 19,
            letterSpacing: 5,
            color: MUTED,
          }}
        >
          <span>SOFTWARE — HARDWARE — APPLIED AI</span>
          <span>{new URL(site.url).host.toUpperCase()}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Anton", data: anton, style: "normal", weight: 400 },
        { name: "Inter", data: inter, style: "normal", weight: 600 },
      ],
    },
  );
}
