import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";
import { getSiteSettings } from "@/lib/db/public";

/**
 * The social card: the same three lines the hero opens with, on the same
 * ink ground, with the closing word in the site's one signal colour.
 *
 * Satori cannot reuse the webfont pipeline and the build must not depend on
 * the network, so the faces are vendored TTFs in `lib/og-fonts/` (both OFL):
 * Archivo Black for the headline, Space Mono for the labels — both
 * single-weight static files, because satori cannot parse a variable TTF's
 * `wdth,wght` axis pair at all and fails the build outright on one that has it.
 */

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GROUND = "#0b0e14";
const INK = "#e9eef2";
const MUTED = "#647080";
const SIGNAL = "#54d1db";
const LINE = "rgba(255, 255, 255, 0.12)";

export default async function OpenGraphImage() {
  const [settings, bold, regular] = await Promise.all([
    getSiteSettings(),
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
          <div style={{ display: "flex", width: 72, height: 5, backgroundColor: SIGNAL }} />
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
            <span>{settings.name.toUpperCase()}</span>
            <span style={{ color: MUTED }}>{settings.location.toUpperCase()}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: -20 }}>
          <div style={{ fontFamily: "ArchivoBold", fontSize: 112, lineHeight: 0.92, letterSpacing: -5, color: INK }}>
            {settings.hero_line_1}
          </div>
          <div style={{ fontFamily: "ArchivoBold", fontSize: 112, lineHeight: 0.92, letterSpacing: -5, color: INK }}>
            {settings.hero_line_2}
          </div>
          <div style={{ fontFamily: "ArchivoBold", fontSize: 112, lineHeight: 0.92, letterSpacing: -5, color: SIGNAL }}>
            {settings.hero_line_3}
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
        { name: "ArchivoBold", data: bold, style: "normal", weight: 400 },
      ],
    },
  );
}
