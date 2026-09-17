import { en, type Dictionary } from "./dictionaries/en";
import { id } from "./dictionaries/id";
import type { Locale } from "./locales";

export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { en, id };

/**
 * UI copy for one locale.
 *
 * Call it from server components only. Client components receive the strings
 * they need as props, which keeps both dictionaries out of every client chunk.
 */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
