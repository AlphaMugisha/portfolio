import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

/**
 * The social card, set as the site's opening frame: the same two words the
 * hero opens with, in the same light display serif, with the closing word in
 * italic and in the accent — the one move the whole page is built on.
 *
 * Colours are the band tokens from `app/globals.css`. The accent DOES appear
 * here, unlike the previous card: it sits at 4.54:1 on white, which clears AA
 * at this size comfortably. Everything else is the ink and muted ink.
 *
 * The faces are vendored TTFs in `lib/og-fonts/` (both OFL) because satori
 * cannot reuse `next/font`'s woff2 pipeline and the build must not depend on
 * the network.
 */

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BAND = "#FFFFFF"; /* --color-band-light    */
const INK = "#393A3D"; /* --color-on-band       */
const MUTED = "#61636A"; /* --color-on-band-muted */
const ACCENT = "#0A6EFA"; /* --color-primary       */
const LINE = "#DADBE0"; /* --color-line          */

export default async function OpenGraphImage() {
  const [serif, serifItalic, sans] = await Promise.all([
    readFile(join(process.cwd(), "lib", "og-fonts", "CormorantGaramond-Light.ttf")),
    readFile(
      join(process.cwd(), "lib", "og-fonts", "CormorantGaramond-LightItalic.ttf")
    ),
    readFile(join(process.cwd(), "lib", "og-fonts", "Jost-Regular.ttf")),
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
          fontFamily: "Jost",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${LINE}`,
            paddingTop: 20,
            fontSize: 19,
            letterSpacing: 5,
            color: INK,
          }}
        >
          <span>{site.name.toUpperCase()}</span>
          <span style={{ color: MUTED }}>{site.location.toUpperCase()}</span>
        </div>

        {/* The two words, exactly as the hero sets them. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Cormorant",
              fontSize: 168,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: INK,
            }}
          >
            Software
          </div>
          <div
            style={{
              fontFamily: "CormorantItalic",
              fontSize: 168,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: ACCENT,
            }}
          >
            Engineer.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${LINE}`,
            paddingTop: 20,
            fontSize: 17,
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
        { name: "Cormorant", data: serif, style: "normal", weight: 300 },
        /* Registered as its own family rather than as the italic style of
           the first: satori resolves `fontStyle: italic` unreliably across
           versions, and a card that silently falls back to the upright cut
           loses the one gesture it exists to show. */
        {
          name: "CormorantItalic",
          data: serifItalic,
          style: "normal",
          weight: 300,
        },
        { name: "Jost", data: sans, style: "normal", weight: 400 },
      ],
    },
  );
}
