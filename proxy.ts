import { NextResponse, type NextRequest } from "next/server";
import { chooseLocale } from "@/lib/i18n/choose-locale";
import { LOCALE_COOKIE } from "@/lib/i18n/locales";

/**
 * Sends first-time visitors in Indonesia from `/` to `/id`.
 *
 * It matches `/` only. A shared `/id` link always opens as shared, and every
 * other path costs nothing. The decision lives in lib/i18n/choose-locale.ts,
 * where it is unit tested.
 *
 * On Vercel, `x-vercel-ip-country` is set by the platform. Locally the header
 * is absent, so the site stays English unless a test sends it.
 *
 * 307, not 301: browsers and CDNs must not remember the redirect, because the
 * answer depends on the cookie and the visitor's IP.
 */
export function proxy(request: NextRequest) {
  const locale = chooseLocale({
    cookie: request.cookies.get(LOCALE_COOKIE)?.value,
    country: request.headers.get("x-vercel-ip-country"),
    userAgent: request.headers.get("user-agent")
  });
  if (locale === "en") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/id";
  return NextResponse.redirect(url, 307);
}

export const config = { matcher: "/" };
