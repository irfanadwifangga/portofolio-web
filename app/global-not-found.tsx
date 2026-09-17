import type { Metadata } from "next";
import "./global-styles";
import { NotFound } from "@/components/not-found";
import { NotFoundTitle } from "@/components/not-found-title";
import { FONT_VARIABLES } from "@/lib/fonts";
import { getDictionary } from "@/lib/i18n";
import { BOOT_SCRIPT } from "@/lib/theme";

// Next adds <meta name="robots" content="noindex"> to 404 responses itself.
export const metadata: Metadata = {
  title: getDictionary("en").notFound.title
};

/**
 * Chooses the language before first paint: Indonesian for /id and anything
 * under /id/, English otherwise. The checks are plain string comparisons on
 * purpose: an escaped regex was mangled inside this template string during
 * prototyping, and "/idea" must stay English.
 */
const LOCALE_SCRIPT = `(function () {
  var path = location.pathname;
  if (path === "/id" || path.indexOf("/id/") === 0) document.documentElement.lang = "id";
})();`;

/**
 * The 404 page for every unmatched URL, in both languages.
 *
 * It bypasses the app's layouts, so it brings its own document: global styles,
 * fonts, the theme boot script and the language script. Both language blocks
 * are in the markup, and app/globals.css hides the one <html lang> does not
 * select.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${FONT_VARIABLES} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: LOCALE_SCRIPT }} />
      </head>
      <body className="min-h-full bg-background text-foreground selection:bg-accent selection:text-on-accent">
        <NotFoundTitle title={getDictionary("id").notFound.title} />
        <NotFound locale="en" />
        <NotFound locale="id" />
      </body>
    </html>
  );
}
