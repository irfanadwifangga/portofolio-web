import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * One entry, because the site is one page — the section anchors are fragments,
 * and fragments are not separate URLs as far as a crawler is concerned.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
