import type { ComponentType, SVGProps } from "react";
import {
  Typescript,
  Java,
  Nextjs,
  Prisma,
  Postgresql,
  Supabase,
  Django,
  GoogleDrive,
  Spigotmc,
  Authdotjs,
  Docker,
  Aws,
  Youtube,
  Upstash,
  Python,
  Heroui,
  TailwindCss,
  ShadcnUi,
} from "@thesvg/react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Label → brand icon for the chips shown on project cards.
 *
 * Anything without an entry falls back to a monogram rather than borrowing a
 * glyph from a different icon library. Duitku and RCON ship as files instead —
 * see TECH_IMAGES.
 */
export const TECH_ICONS: Record<string, IconType> = {
  TypeScript: Typescript,
  Java: Java,
  "Next.js": Nextjs,
  "Next.js API Routes": Nextjs,
  Prisma: Prisma,
  PostgreSQL: Postgresql,
  Supabase: Supabase,
  "Django REST Framework": Django,
  "Google Drive API": GoogleDrive,
  "NextAuth.js": Authdotjs,
  Spigot: Spigotmc,
  // NextAuth ships as Auth.js in the icon set
  NextAuth: Authdotjs,
  AWS: Aws,
  "YouTube API": Youtube,
  "Redis (Upstash)": Upstash,
  Docker: Docker,
  Python: Python,
  HeroUI: Heroui,
  "Tailwind CSS": TailwindCss,
  ShadcnUi: ShadcnUi,
};

/**
 * Marks that ship as image files rather than components.
 *
 * These cannot inherit currentColor, so they are rendered as <img> and sized
 * explicitly instead of going through the icon path.
 */
export const TECH_IMAGES: Record<string, string> = {
  // Downscaled from the uploaded rcon.svg (a 1024px PNG wrapped in an <svg>,
  // 1.4 MB) with its green backplate removed. Renamed from rcon.png to bust
  // the image-optimizer cache, which kept serving the pre-edit green version.
  RCON: "/rcon-mark.png",
  Duitku: "/duitku.svg",
};

/**
 * Per-mark colour overrides.
 *
 * The Next.js mark is the official one: a `fill="currentColor"` circle with
 * the wordmark drawn on top in hardcoded white gradients. Inheriting our light
 * foreground makes it a white disc with an invisible glyph, so the circle is
 * forced to the page background and the white glyph carries the shape — the
 * standard dark-background presentation of that logo.
 */
export const TECH_ICON_CLASS: Record<string, string> = {
  "Next.js": "text-background",
  "Next.js API Routes": "text-background",
  // GitHub's path has fill="#181717" baked in rather than currentColor, so it
  // sinks into the dark page. fill-current on descendants overrides it.
  GitHub: "text-foreground [&_*]:fill-current",
};
