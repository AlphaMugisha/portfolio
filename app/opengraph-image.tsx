import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

/**
 * The social card, set as the site's opening frame: the same two words the
 * hero opens with, in the same display serif, with the closing word in
 * italic and in the accent — the one move the whole page is built on.
 *
 * It is set on the DARK ground rather than the light one. That is not a
 * stylistic preference: amber is 1.8:1 on #FFFFFF and 9.85:1 on #161616, so
 * the dark band is the only place in this palette where the accent can carry
 * a word. A social card is also the one surface that gets scaled down to a
 * thumbnail in a feed, which is exactly where a light-on-white accent would
 * vanish. Both accents appear — amber on the clause, acid green on the rule —
 * and both clear AAA here.
 *
 * The faces are vendored TTFs in `lib/og-fonts/` (both OFL) because satori
 * cannot reuse `next/font`'s woff2 pipeline and the build must not depend on
 * the network. Tinos stands in for Times New Roman: it is metric-compatible
 * with it, which is the whole reason it exists, so the card and the page set
 * the same words at the same widths.
 */

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GROUND = "#161616"; /* --color-bg-invert            */
const INK = "#FFFFFF"; /* --color-text-primary (dark)  */
const MUTED = "#828282"; /* --color-text-muted (dark)    */
const ACCENT = "#FEB002"; /* --color-accent               */
const LIVE = "#70FF00"; /* --color-live                 */
const LINE = "rgba(255, 255, 255, 0.14)"; /* --color-line (dark) */

export default async function OpenGraphImage() {
  const [serif, serifItalic, mono] = await Promise.all([
    readFile(join(process.cwd(), "lib", "og-fonts", "Tinos-Regular.ttf")),
    readFile(join(process.cwd(), "lib", "og-fonts", "Tinos-Italic.ttf")),
    readFile(join(process.cwd(), "lib", "og-fonts", "CourierPrime-Regular.ttf")),
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
          padding: "56px 64px 48px",
          fontFamily: "Courier",
        }}
      >
        {/* The acid rule, the one mark that carries over from the section
            headers on the page. There it is amber on white; here it is green
            on near-black, because on the dark ground green is the louder of
            the two and this is the only frame that has to survive being
            shrunk to a thumbnail. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 72, height: 4, backgroundColor: LIVE }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: `1px solid ${LINE}`,
              marginTop: -1,
              paddingTop: 20,
              fontSize: 18,
              letterSpacing: 3,
              color: INK,
            }}
          >
            <span>{site.name.toUpperCase()}</span>
            <span style={{ color: MUTED }}>{site.location.toUpperCase()}</span>
          </div>
        </div>

        {/* The two words, exactly as the hero sets them. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Tinos",
              fontSize: 172,
              lineHeight: 0.98,
              letterSpacing: -5,
              color: INK,
            }}
          >
            Software
          </div>
          <div
            style={{
              fontFamily: "TinosItalic",
              fontSize: 172,
              lineHeight: 0.98,
              letterSpacing: -5,
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
            fontSize: 16,
            letterSpacing: 3,
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
        { name: "Tinos", data: serif, style: "normal", weight: 400 },
        /* Registered as its own family rather than as the italic style of
           the first: satori resolves `fontStyle: italic` unreliably across
           versions, and a card that silently falls back to the upright cut
           loses the one gesture it exists to show. */
        {
          name: "TinosItalic",
          data: serifItalic,
          style: "normal",
          weight: 400,
        },
        { name: "Courier", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
