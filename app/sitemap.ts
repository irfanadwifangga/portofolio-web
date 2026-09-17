import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/locales";
import { localeUrl } from "@/lib/i18n/metadata";

/**
 * One entry per language. The section anchors are fragments, and fragments are
 * not separate URLs as far as a crawler is concerned. Each entry lists both
 * languages, so the pair is declared here as well as in each page's hreflang.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((locale) => [locale, localeUrl(locale)]));

  return LOCALES.map((locale) => ({
    url: localeUrl(locale),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: locale === "en" ? 1 : 0.9,
    alternates: { languages }
  }));
}
