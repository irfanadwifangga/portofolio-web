/**
 * The site's two languages and the small helpers every layer shares.
 *
 * Deliberately import-free: tests and scripts load this file straight into
 * Node, whose type stripping cannot resolve the `@/` alias.
 */

export const LOCALES = ["en", "id"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Set by the header language toggle, read by proxy.ts. */
export const LOCALE_COOKIE = "lang";

/** A value written once per language, e.g. `{ en: "Experience", id: "Pengalaman" }`. */
export type Localized<T> = Record<Locale, T>;

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "id";
}

/** Home path of a locale. English keeps the bare root it has always had. */
export function pathFor(locale: Locale): "/" | "/id" {
  return locale === "en" ? "/" : "/id";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "id" : "en";
}

/**
 * Fills `{name}` placeholders. An unknown placeholder is left in place so a
 * missing value shows up on the page instead of silently vanishing.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}
