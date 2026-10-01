import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import CustomCursor from "@/components/ui/CustomCursor";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { site } from "@/lib/site";

/* Clash Display and Clash Grotesk, the reference typefaces, from Fontshare.
   They are not on Google Fonts, so `next/font/google` cannot reach them —
   hence the stylesheet link and the two preconnects, which is the same way
   the reference loads them. */

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
  themeColor: "#0d0d0d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=clash-grotesk@300,400,500,600&display=swap"
        />
        {/* Theme before first paint, so the page never flashes the wrong one.
            The DEFAULT is dark: on black the amber is legible everywhere,
            which is the version of this palette that works without
            compromise. A stored preference always wins. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');if(t!=='light')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();",
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <div className="grain" aria-hidden="true" />
        <CustomCursor />
        <SmoothScroll />
        <Navbar />
        <main id="main" className="relative z-[2] flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
