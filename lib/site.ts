/**
 * Single source of truth for anything that names the site.
 *
 * The previous domain was written out in three unrelated files (header
 * wordmark, transactional email footer, README) and they drifted the moment it
 * changed. Metadata, sitemap, robots and the OG image all read from here.
 *
 * Translated text (title, description, tagline) lives in the dictionaries under
 * `meta`; only values that read the same in every language stay here.
 */
export const SITE_URL = "https://irfana.web.id";

export const SITE_NAME = "Irfana Dwi Fangga";

/** Bare host, for display. Derived so it can never disagree with SITE_URL. */
export const SITE_HOST = new URL(SITE_URL).host;

export const SITE_LOCATION = "Bandar Lampung, Indonesia";
