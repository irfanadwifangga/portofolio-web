import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Press_Start_2P } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SparkLayer } from "@/components/spark-layer";
import { SectionRail } from "@/components/section-rail";
import { ToastProvider } from "@/components/toast";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/site";
import { BOOT_SCRIPT } from "@/lib/theme";
// Latin subset only. The unscoped entry point declares @font-face for
// cyrillic, cyrillic-ext, greek, latin-ext and vietnamese as well — 42 font
// files in the build output for a site whose copy is entirely Latin. Those
// subsets carry unicode-range so a browser never downloads them, but they
// still ship and still cost @font-face rules to parse on every load.
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "./globals.css";

// Section entrance headings only — a pixel face at body sizes is unreadable.
const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-src",
  display: "swap"
});

export const metadata: Metadata = {
  // Required for Open Graph: without it Next emits relative image URLs, which
  // every scraper rejects. It also makes `alternates.canonical: "/"` resolve.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${pixel.variable} h-full antialiased`}
      suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint, so the wrong theme never flashes.
            suppressHydrationWarning on <html> covers that attribute, which
            exists before React hydrates. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent selection:text-on-accent">
        <SmoothScroll />
        <ToastProvider>
          <SparkLayer>
            <SectionRail />
            <Analytics />
            {children}
          </SparkLayer>
        </ToastProvider>
      </body>
    </html>
  );
}
