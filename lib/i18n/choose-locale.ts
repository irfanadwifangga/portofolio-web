import type { Locale } from "./locales";

/**
 * Crawlers and link-preview fetchers. They always get English, so the indexed
 * page and every pasted-link card stay consistent; the Indonesian page is still
 * discovered through its hreflang link.
 *
 * "bot" covers Googlebot, bingbot, LinkedInBot, Twitterbot, Slackbot,
 * TelegramBot and Discordbot. It can also match an odd phone model name; that
 * visitor simply gets English plus the toggle.
 */
const BOT_PATTERN = /bot|crawler|spider|facebookexternalhit|whatsapp/i;

export interface LocaleSignals {
  /** Value of the `lang` cookie written by the language toggle. */
  cookie?: string | null;
  /** ISO country code from Vercel's `x-vercel-ip-country` header. */
  country?: string | null;
  userAgent?: string | null;
}

/**
 * Which language a request for `/` should get.
 *
 * In order: an explicit choice in the cookie wins; crawlers get English; an
 * Indonesian IP gets Indonesian; everyone else gets English. The locale checks
 * are inline rather than using isLocale(), because the proxy tests load this
 * file into Node, which can only follow type imports.
 */
export function chooseLocale({ cookie, country, userAgent }: LocaleSignals): Locale {
  if (cookie === "en" || cookie === "id") return cookie;
  if (userAgent && BOT_PATTERN.test(userAgent)) return "en";
  if (country?.toUpperCase() === "ID") return "id";
  return "en";
}
