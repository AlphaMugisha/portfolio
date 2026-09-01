import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { ScrollProgress } from "@/components/ui/Chrome";
import Preloader from "@/components/ui/Preloader";
import PageTransition from "@/components/ui/PageTransition";
import { site } from "@/lib/site";

/* One family for the whole site. Display, body and label roles are
   separated by weight, size and tracking rather than by typeface. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <SmoothScroll />
        <Preloader />
        <ScrollProgress />
        <Header />
        <main id="main" className="relative z-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  );
}
