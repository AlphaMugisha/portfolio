import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

/**
 * The social card: the same three lines the hero opens with, on the same
 * near-black ground, with the closing word in amber.
 *
 * Dark is not a style choice here. Amber is 1.9:1 on a light ground and
 * 10.6:1 on this one, and a social card is the one surface that gets scaled
 * to a thumbnail in a feed — which is exactly where a low-contrast accent
 * disappears.
 *
 * Satori cannot reuse the webfont pipeline and the build must not depend on
 * the network, so the faces are vendored TTFs in `lib/og-fonts/` (both OFL).
 * Clash is not redistributable that way, so the card uses Archivo Black for
 * the headline and Archivo for the labels — a grotesque with the same
 * squared-off, tightly-tracked character at display size.
 *
 * Both faces are SINGLE-WEIGHT static files, which is not a preference —
 * satori cannot parse a variable TTF with a `wdth,wght` axis pair at all and
 * fails the build outright, so a static cut is the only option here. Hence
 * Archivo Black rather than Archivo at weight 900, and Space Mono rather
 * than a variable grotesque, for the tracked labels.
 */

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GROUND = "#0D0D0D";
const INK = "#F5F5F5";
const MUTED = "#8A8A8A";
const ACCENT = "#FEB002";
const LINE = "rgba(255, 255, 255, 0.12)";

export default async function OpenGraphImage() {
  const [bold, regular] = await Promise.all([
    readFile(join(process.cwd(), "lib", "og-fonts", "ArchivoBlack-Regular.ttf")),
    readFile(join(process.cwd(), "lib", "og-fonts", "SpaceMono-Regular.ttf")),
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
          backgroundColor: GROUND,
          padding: "56px 64px 52px",
          fontFamily: "Mono",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 72, height: 5, backgroundColor: ACCENT }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: `1px solid ${LINE}`,
              marginTop: -1,
              paddingTop: 22,
              fontSize: 19,
              letterSpacing: 3,
              color: INK,
            }}
          >
            <span>{site.name.toUpperCase()}</span>
            <span style={{ color: MUTED }}>{site.location.toUpperCase()}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: -20 }}>
          <div
            style={{
              fontFamily: "ArchivoBold",
              fontSize: 112,
              lineHeight: 0.92,
              letterSpacing: -5,
              color: INK,
            }}
          >
            Software
          </div>
          <div
            style={{
              fontFamily: "ArchivoBold",
              fontSize: 112,
              lineHeight: 0.92,
              letterSpacing: -5,
              color: INK,
            }}
          >
            that actually
          </div>
          <div
            style={{
              fontFamily: "ArchivoBold",
              fontSize: 112,
              lineHeight: 0.92,
              letterSpacing: -5,
              color: ACCENT,
            }}
          >
            works.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${LINE}`,
            paddingTop: 22,
            fontSize: 17,
            letterSpacing: 3,
            color: MUTED,
          }}
        >
          <span>WEB PLATFORMS — EMBEDDED — APPLIED AI</span>
          <span>{new URL(site.url).host.toUpperCase()}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Mono", data: regular, style: "normal", weight: 400 },
        /* Registered as its own family rather than as a weight of the first:
           satori resolves numeric weights unreliably across versions, and a
           card that silently falls back to the regular cut loses the one
           thing its headline is doing. */
        { name: "ArchivoBold", data: bold, style: "normal", weight: 400 },
      ],
    },
  );
}
