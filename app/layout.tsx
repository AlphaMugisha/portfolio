import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Jost,
  Mrs_Saint_Delafield,
} from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import ScrollProgress from "@/components/ui/ScrollProgress";
import { site } from "@/lib/site";

/* Two working faces and a signature.

   The display serif, standing in for TT Ramillas: high contrast, a long
   ascender, and enough of a modern cut that it never reads as a book. It is
   only ever set LIGHT and LARGE — the size carries the emphasis, so the
   weight never has to, which is the whole difference between this and the
   bold grotesque it replaces. The italic is loaded because the closing
   clause of every section heading is set in it. */
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

/* The sans, standing in for TT Commons Pro: body, navigation, every tracked
   label and every control. One sans rather than the three the page used to
   run — once the headings are set in a serif, the contrast a reader sees is
   serif against sans, and a second sans only muddies it. */
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const script = Mrs_Saint_Delafield({
  variable: "--font-delafield",
  subsets: ["latin"],
  weight: "400",
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
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${script.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <ScrollProgress />
        <Header />
        <main id="main" className="relative">
          {children}
        </main>
      </body>
    </html>
  );
}
