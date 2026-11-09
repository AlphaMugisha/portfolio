import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import SmoothScroll from "@/components/system/SmoothScroll";
import Cursor from "@/components/system/Cursor";
import { BootProvider } from "@/components/system/Boot";
import { site } from "@/lib/site";
import { getSiteSettings } from "@/lib/db/public";

/* Three faces, three jobs. Space Grotesk is the voice — a grotesque with
   enough engineered character to carry the name at 11rem. IBM Plex Sans
   reads long-form body copy without fighting it. Space Mono is the
   instrument face: every annotation, register and readout on the site.
   All self-hosted through next/font, so there is no render-blocking
   request to a font CDN and no layout shift when they land. */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-raw",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-raw",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-raw",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "software engineer",
    "Rwanda",
    "Kigali",
    "embedded systems",
    "ESP32",
    "robotics",
    "Next.js",
    "React",
    "TypeScript",
    "AI",
  ],
  authors: [{ name: site.name, url: site.github }],
  creator: site.name,
  openGraph: {
    type: "website",
    locale: "en_RW",
    url: site.url,
    title: `${site.name} — ${site.role}`,
    description: site.description,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0e",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        {/* Marks the document as scripted BEFORE first paint. Every
            scroll-reveal start state in globals.css is scoped to `.js`,
            so without JavaScript nothing is ever hidden and the page
            renders complete — and with it, elements start hidden on the
            very first frame instead of flashing in and being pulled
            back once React hydrates. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <div className="board-field" aria-hidden="true" />

        <BootProvider>
          <SmoothScroll />
          <Cursor />

          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[300] focus:bg-signal focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:text-signal-ink"
          >
            Skip to content
          </a>

          <Navbar settings={settings} />
          {/*
            No global footer. The home page is one continuous journey
            that ends on its own contact chapter — bolting a column of
            links underneath it broke the experience and, worse, every
            one of those links pointed at a section id the journey
            replaced. The case studies render `Footer` themselves,
            where a conventional ending is the right answer.
          */}
          <main id="main" className="relative z-[2] flex-1">
            {children}
          </main>
        </BootProvider>
      </body>
    </html>
  );
}
