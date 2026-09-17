import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SparkLayer } from "@/components/spark-layer";
import { ToastProvider } from "@/components/toast";
import { FONT_VARIABLES } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { BOOT_SCRIPT } from "@/lib/theme";

/**
 * The <html> document shared by both language roots.
 *
 * app/(en)/layout.tsx and app/id/layout.tsx are one-line wrappers around this,
 * so the two documents cannot drift apart. Only `lang` and the copy differ.
 */
export function SiteDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${FONT_VARIABLES} h-full antialiased`}
      suppressHydrationWarning>
      {/* A root document in the App Router, not a pages/ page: next/head does not apply. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* Sets data-theme before first paint, so the wrong theme never flashes.
            suppressHydrationWarning on <html> covers that attribute, which
            exists before React hydrates. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent selection:text-on-accent">
        <SmoothScroll />
        <ToastProvider labels={t.toast}>
          <SparkLayer>
            <Analytics />
            {children}
          </SparkLayer>
        </ToastProvider>
      </body>
    </html>
  );
}
