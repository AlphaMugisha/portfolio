import type { Metadata, Viewport } from "next";
import {
  Inter,
  Space_Grotesk,
  Mrs_Saint_Delafield,
  Poppins,
} from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import ScrollProgress from "@/components/ui/ScrollProgress";
import { site } from "@/lib/site";

/* Three roles, three faces.

   Inter carries body, navigation and every small tracked label. Anton is the
   display face for the big headings. Mrs Saint Delafield supplies the
   signature: the wordmark and the corner credit. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* The display face. Anton was an ultra-compressed all-caps grotesque, which
   meant every heading on the site had to shout in capitals. Space Grotesk
   carries weight at mixed case, so a headline can be large and heavy without
   being a wall of uppercase — and it keeps enough character not to read as a
   system font. */
const display = Space_Grotesk({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/* The dashboard chrome face, named in the reference: navigation, labels
   and buttons. Running paragraphs stay on Inter. */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${inter.variable} ${display.variable} ${script.variable} ${poppins.variable} h-full antialiased`}
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
