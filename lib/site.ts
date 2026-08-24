/**
 * Single source of truth for anything that names the site.
 *
 * The previous domain was written out in three unrelated files (header
 * wordmark, transactional email footer, README) and they drifted the moment it
 * changed. Metadata, sitemap, robots and the OG image all read from here.
 */
export const SITE_URL = "https://irfana.web.id";

export const SITE_NAME = "Irfana Dwi Fangga";

/** Bare host, for display. Derived so it can never disagree with SITE_URL. */
export const SITE_HOST = new URL(SITE_URL).host;

export const SITE_TITLE = "Irfana Dwi Fangga — Fullstack Developer";

export const SITE_DESCRIPTION =
  "Fullstack developer, backend-first — payment-critical systems, real-time integrations, and REST APIs. Next.js, Django, Prisma, Java.";

export const SITE_TAGLINE = "Fullstack Developer — backend-first";

export const SITE_LOCATION = "Bandar Lampung, Indonesia";
