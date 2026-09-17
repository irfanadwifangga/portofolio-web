import type { Locale } from "./locales";

/** `"2026-01"`: year, then a 1-based month. */
export type YearMonth = `${number}-${number}`;

/** A span of months. `end === start` is a single month. */
export interface Period {
  start: YearMonth;
  end: YearMonth | "present";
}

const MONTHS: Record<Locale, readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
};

const PRESENT: Record<Locale, string> = { en: "Present", id: "Sekarang" };

function formatMonth(value: YearMonth, locale: Locale): string {
  const [year, month] = value.split("-");
  const name = MONTHS[locale][Number(month) - 1];
  if (!name) throw new Error(`Invalid month in period: ${value}`);
  return `${name} ${year}`;
}

/** `Jan 2026 — Present` / `Jan 2026 — Sekarang`, or a single month on its own. */
export function formatPeriod(period: Period, locale: Locale): string {
  const start = formatMonth(period.start, locale);
  if (period.end === period.start) return start;
  const end = period.end === "present" ? PRESENT[locale] : formatMonth(period.end, locale);
  return `${start} — ${end}`;
}
