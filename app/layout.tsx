import type { Metadata, Viewport } from "next";
import { Inter, Anton, Poppins, Mrs_Saint_Delafield } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { ScrollProgress } from "@/components/ui/Chrome";
import Preloader from "@/components/ui/Preloader";
import Cursor from "@/components/ui/Cursor";
import PageTransition from "@/components/ui/PageTransition";
import { site } from "@/lib/site";

/* Three roles, three faces.

   Inter carries body, navigation and every small tracked label. Anton is the
   display face — the reference's opening word is an ultra-heavy grotesque set
   enormous, and Inter has no weight that survives at 20vw. Mrs Saint
   Delafield supplies the signature: the wordmark, the corner credit and the
   preloader greeting. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/* The menu overlay only. The reel sets it in a bold geometric sans with
   open, positive tracking — circular O, pointed-apex A — which is a different
   voice from both Inter and Anton, and the overlay is prominent enough to
   justify the one extra weight. */
const geometric = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "700",
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
  themeColor: "#141518",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${anton.variable} ${geometric.variable} ${script.variable} h-full antialiased`}
    >
      <body className="relative min-h-full">
        <SmoothScroll />
        <Preloader />
        <Cursor />
        <ScrollProgress />
        <Header />
        <main id="main" className="relative z-10">
          <PageTransition>{children}</PageTransition>
        </main>
      </body>
    </html>
  );
}
