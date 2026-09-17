import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { otherLocale, pathFor, type Locale } from "@/lib/i18n/locales";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/** Absolute URL of a locale's home page. English keeps the bare domain. */
export function localeUrl(locale: Locale): string {
  return locale === "en" ? SITE_URL : `${SITE_URL}${pathFor(locale)}`;
}

/**
 * Page metadata for one language.
 *
 * Canonical and hreflang tie `/` and `/id` together as one page in two
 * languages, so search engines index both and can show each to its audience.
 */
export function buildMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale).meta;

  return {
    // Required for Open Graph: without it Next emits relative image URLs, which
    // every scraper rejects. It also resolves the relative canonical paths.
    metadataBase: new URL(SITE_URL),
    title: t.title,
    description: t.description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    alternates: {
      canonical: pathFor(locale),
      languages: {
        en: pathFor("en"),
        id: pathFor("id"),
        "x-default": pathFor("en")
      }
    },
    openGraph: {
      type: "website",
      url: localeUrl(locale),
      siteName: SITE_NAME,
      title: t.title,
      description: t.description,
      locale: t.ogLocale,
      alternateLocale: getDictionary(otherLocale(locale)).meta.ogLocale
    },
    twitter: {
      card: "summary_large_image",
      title: t.title,
      description: t.description
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
}
