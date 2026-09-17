import type { ComponentType, ReactNode, SVGProps } from "react";
import { Mark, type MarkId } from "@/lib/marks";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * An icon component that draws one artwork from the page's mark sprite (see
 * lib/marks.tsx). It takes the same props as an icon from @thesvg/react, so
 * TechIcon, OrbitMark, GridMark and the section components stay unchanged.
 */
export function markIcon(id: MarkId): IconType {
  const Icon = (props: SVGProps<SVGSVGElement>) => <Mark {...props} id={id} />;
  Icon.displayName = `Mark(${id})`;
  return Icon;
}

/** Renders `dark` everywhere except the light theme, where it renders `light`. */
function ThemePair({ dark, light }: { dark: ReactNode; light: ReactNode }) {
  return (
    <>
      <span className="contents light:hidden">{dark}</span>
      <span className="hidden light:contents">{light}</span>
    </>
  );
}

/**
 * A mark with a separate artwork for the light theme. `lightClass` colours the
 * light artwork when it is a single-colour (mono) glyph.
 */
function themedMark(dark: MarkId, light: MarkId, lightClass = ""): IconType {
  const Icon = (props: SVGProps<SVGSVGElement>) => (
    <ThemePair
      dark={<Mark {...props} id={dark} />}
      light={<Mark {...props} id={light} className={`${lightClass} ${props.className ?? ""}`.trim()} />}
    />
  );
  Icon.displayName = `ThemedMark(${dark})`;
  return Icon;
}

/*
 * Marks whose default artwork fails 3:1 on the light page, as measured by
 * scripts/theme-audit.mjs.
 *
 * Baked-in white fills (about 1.05:1): Prisma, shadcn/ui, Go, PHP and Vercel.
 * Each ships a light variant.
 *
 * Brand colours too pale for a light surface: React #58C4DC (1.93:1), Tailwind
 * #38bdf8 (2.14:1), Spigot #ED8106 (2.71:1), Spring #68bd45 (2.23:1), Upstash
 * #00c98d (2.05:1) and Postman #ff6c37 (2.67:1). React ships a light variant
 * (#087EA4). The others use their mono glyph in a darker shade that clears
 * 3.3:1 on every light surface.
 *
 * Django #44b78b (2.5:1) keeps its brand green in both themes, by the owner's
 * choice; scripts/theme-audit.mjs exempts it.
 *
 * Both renderings ship and the light: variant picks one, so the first paint is
 * already right. Through the sprite that costs two <use> elements, not two
 * copies of the artwork.
 */
export const PrismaMark = themedMark("prisma", "prisma-light");
export const ShadcnMark = themedMark("shadcn", "shadcn-light");
export const GoMark = themedMark("go", "go-light");
export const ReactMark = themedMark("react", "react-light");
export const PhpMark = themedMark("php", "php-light");
export const VercelMark = themedMark("vercel", "vercel-light");
export const TailwindMark = themedMark("tailwind", "tailwind-mono", "text-[#0284c7]");
export const SpigotMark = themedMark("spigot", "spigot-mono", "text-[#b45309]");
export const SpringMark = themedMark("spring", "spring-mono", "text-[#519336]");
export const UpstashMark = themedMark("upstash", "upstash-mono", "text-[#009568]");
export const PostmanMark = themedMark("postman", "postman-mono", "text-[#db5d2f]");

/**
 * Label → brand icon for the chips shown on project cards.
 *
 * Anything without an entry falls back to a monogram rather than borrowing a
 * glyph from a different icon library. Duitku and RCON ship as files instead —
 * see TECH_IMAGES.
 */
export const TECH_ICONS: Record<string, IconType> = {
  TypeScript: markIcon("typescript"),
  Java: markIcon("java"),
  "Next.js": markIcon("nextjs"),
  "Next.js API Routes": markIcon("nextjs"),
  Prisma: PrismaMark,
  PostgreSQL: markIcon("postgresql"),
  Supabase: markIcon("supabase"),
  "Django REST Framework": markIcon("django"),
  "Google Drive API": markIcon("google-drive"),
  "NextAuth.js": markIcon("authjs"),
  Spigot: SpigotMark,
  // NextAuth ships as Auth.js in the icon set
  NextAuth: markIcon("authjs"),
  AWS: markIcon("aws"),
  "YouTube API": markIcon("youtube"),
  "Redis (Upstash)": UpstashMark,
  Docker: markIcon("docker"),
  Python: markIcon("python"),
  HeroUI: markIcon("heroui"),
  "Tailwind CSS": TailwindMark,
  ShadcnUi: ShadcnMark,
  Go: GoMark,
  React: ReactMark,
  // The feather alone, in its mono variant: the default is the full wordmark
  // at a 2.25:1 aspect, which shrank to a sliver in a 32px square, and its
  // lettering is #003B57, which disappears on the dark page.
  SQLite: markIcon("sqlite"),
  FFmpeg: markIcon("ffmpeg"),
  // Mono variant: the default draws one path in #000 and sets its lettering in
  // #08060d, so both lose part of the logo into the dark page.
  Vite: markIcon("vite"),
  "GitHub Actions": markIcon("github-actions"),
  // Not in the icon set; cropped from the project's own banner artwork.
  "yt-dlp": markIcon("yt-dlp")
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
  Duitku: "/duitku.svg"
};

/**
 * Per-mark colour overrides.
 *
 * The Next.js mark is the official one: a `fill="currentColor"` circle with
 * the wordmark drawn on top in hardcoded white gradients. The circle is forced
 * to black in both themes, which is the logo's own presentation. Following the
 * page colour instead would turn it white in the light theme and erase the
 * white glyph.
 */
export const TECH_ICON_CLASS: Record<string, string> = {
  // Like HeroUI: a white disc with a black N on the dark theme, and the plain
  // black disc with a white N on the light one.
  "Next.js": "text-black invert light:invert-0",
  "Next.js API Routes": "text-black invert light:invert-0",
  // A white tile with a black "UI"; inverted on the light theme.
  HeroUI: "light:invert",
  // GitHub's artwork takes currentColor (see lib/marks.tsx), so it follows the
  // page foreground instead of its baked-in #181717, which sank into the page.
  GitHub: "text-foreground",
  // The mono feather takes currentColor; SQLite blue restores the brand and
  // holds non-text contrast on both a dark and a light page.
  SQLite: "text-[#0F80CC]",
  // Java ships only its default artwork. The orange steam is 2.83:1 on the light
  // page, and 3.43:1 once darkened by 10%.
  Java: "light:brightness-90"
};

/**
 * Per-image classes, for marks that ship as files.
 *
 * Duitku's navy (#1f448c) is 2.15:1 against the dark page even at full
 * opacity, so in the dark theme it sits on a white plate (navy on white is
 * 9.28:1). The light theme needs no plate.
 */
export const TECH_IMAGE_CLASS: Record<string, string> = {
  Duitku: "dark:rounded-md dark:bg-white dark:p-0.5"
};
