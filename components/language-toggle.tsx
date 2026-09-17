"use client";

import type { MouseEvent } from "react";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Switches the page language.
 *
 * It is a real link, so it works before hydration, without JavaScript, and
 * with a modifier key to open the other language in a new tab. A plain click
 * also stores the choice in the cookie proxy.ts reads, then carries the current
 * hash across, so the visitor stays at the same section.
 *
 * The visible label is the current language (EN / ID). The accessible name
 * starts with that label, followed by a spelled-out "switch to …", so what a
 * sighted user reads is part of what a screen reader announces.
 *
 * The glyph is Lucide's "languages" icon (ISC licence), drawn at the theme
 * toggle's size and stroke so the two read as a pair.
 */
export function LanguageToggle({
  targetLocale,
  href,
  label,
  switchLabel
}: {
  targetLocale: Locale;
  href: string;
  label: string;
  switchLabel: string;
}) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    document.cookie = `${LOCALE_COOKIE}=${targetLocale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
    window.location.assign(href + window.location.hash);
  };

  return (
    <a
      href={href}
      hrefLang={targetLocale}
      data-language-toggle
      onClick={onClick}
      className="-my-2.5 inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-md font-mono text-sm font-medium text-muted transition-[color,scale] duration-150 ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none active:scale-[0.96]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="h-[18px] w-[18px] shrink-0">
        <path d="m5 8 6 6" />
        <path d="m4 14 6-6 2-3" />
        <path d="M2 5h12" />
        <path d="M7 2h1" />
        <path d="m22 22-5-10-5 10" />
        <path d="M14 18h6" />
      </svg>
      {label}
      <span className="sr-only">, {switchLabel}</span>
    </a>
  );
}
