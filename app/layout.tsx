import type { Metadata, Viewport } from "next";
import { Roboto, Courier_Prime } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import ScrollProgress from "@/components/ui/ScrollProgress";
import { site } from "@/lib/site";

/* Two webfonts, three roles.

   The token sheet's stack is Roboto, Courier Prime and Times New Roman. The
   display face is therefore a SYSTEM font — nothing to download, nothing to
   swap, no layout shift on the largest type on the page — so only the other
   two are fetched here.

   Roboto carries body, leads and prose. Courier Prime carries every tracked
   label: eyebrows, metadata, navigation, buttons, chips. That split is the
   whole character of the system — the reader sees serif against monospace,
   with the sans holding the middle, rather than three sans faces competing.

   The italic cut of Roboto is not loaded: the only italics on the page are
   the display clause and the signature, and both are set in Times. */
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const courier = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
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
      className={`${roboto.variable} ${courier.variable} h-full antialiased`}
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
