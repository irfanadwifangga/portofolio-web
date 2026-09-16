import type { ComponentType, ReactNode, SVGProps } from "react";
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
  Go,
  React as ReactIcon,
  Sqlite,
  Ffmpeg,
  Vite,
  GithubActions,
  Php,
  Vercel,
  Spring,
  Postman,
} from "@thesvg/react";
import { YtDlpMark } from "@/lib/yt-dlp-mark";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Vite in its single-colour variant. The default mark draws one of its paths
 * in #000 and the wordmark sets its lettering in #08060d, so both lose part
 * of the logo into the dark page; the mono variant inherits currentColor.
 */
function ViteMono(props: SVGProps<SVGSVGElement>) {
  return <Vite variant="mono" {...props} />;
}

/**
 * SQLite as the feather alone. The default variant is the full wordmark at a
 * 2.25:1 aspect, so inside a 32px square it shrank to a sliver, and its
 * lettering is #003B57, which disappears on the dark page.
 */
function SqliteMono(props: SVGProps<SVGSVGElement>) {
  return <Sqlite variant="mono" {...props} />;
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

/*
 * Marks whose default artwork fails 3:1 on the light page, as measured by
 * scripts/theme-audit.mjs.
 *
 * Baked-in white fills (about 1.05:1): Prisma, shadcn/ui, Go, PHP and Vercel.
 * Each ships a light variant.
 *
 * Brand colours too pale for a light surface: React #58C4DC (1.93:1), Tailwind
 * #38bdf8 (2.14:1), Spigot #ED8106 (2.71:1), Django #44b78b (2.5:1), Spring
 * #68bd45 (2.23:1), Upstash #00c98d (2.05:1) and Postman #ff6c37 (2.67:1).
 * React ships a light variant (#087EA4). The others use their mono glyph in a
 * darker shade that clears 3.3:1 on every light surface, and Django uses its
 * own brand green, #092e20.
 *
 * Both renderings ship and the light: variant picks one, so the first paint is
 * already right.
 */
export function PrismaMark(props: SVGProps<SVGSVGElement>) {
  return <ThemePair dark={<Prisma {...props} />} light={<Prisma variant="light" {...props} />} />;
}

export function ShadcnMark(props: SVGProps<SVGSVGElement>) {
  return <ThemePair dark={<ShadcnUi {...props} />} light={<ShadcnUi variant="light" {...props} />} />;
}

export function GoMark(props: SVGProps<SVGSVGElement>) {
  return <ThemePair dark={<Go {...props} />} light={<Go variant="light" {...props} />} />;
}

export function ReactMark(props: SVGProps<SVGSVGElement>) {
  return <ThemePair dark={<ReactIcon {...props} />} light={<ReactIcon variant="light" {...props} />} />;
}

export function PhpMark(props: SVGProps<SVGSVGElement>) {
  return <ThemePair dark={<Php {...props} />} light={<Php variant="light" {...props} />} />;
}

export function VercelMark(props: SVGProps<SVGSVGElement>) {
  return <ThemePair dark={<Vercel {...props} />} light={<Vercel variant="light" {...props} />} />;
}

export function TailwindMark(props: SVGProps<SVGSVGElement>) {
  return (
    <ThemePair
      dark={<TailwindCss {...props} />}
      light={<TailwindCss variant="mono" {...props} className={`text-[#0284c7] ${props.className ?? ""}`} />}
    />
  );
}

export function SpigotMark(props: SVGProps<SVGSVGElement>) {
  return (
    <ThemePair
      dark={<Spigotmc {...props} />}
      light={<Spigotmc variant="mono" {...props} className={`text-[#b45309] ${props.className ?? ""}`} />}
    />
  );
}

export function DjangoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <ThemePair
      dark={<Django {...props} />}
      light={<Django variant="mono" {...props} className={`text-[#092e20] ${props.className ?? ""}`} />}
    />
  );
}

export function SpringMark(props: SVGProps<SVGSVGElement>) {
  return (
    <ThemePair
      dark={<Spring {...props} />}
      light={<Spring variant="mono" {...props} className={`text-[#519336] ${props.className ?? ""}`} />}
    />
  );
}

export function UpstashMark(props: SVGProps<SVGSVGElement>) {
  return (
    <ThemePair
      dark={<Upstash {...props} />}
      light={<Upstash variant="mono" {...props} className={`text-[#009568] ${props.className ?? ""}`} />}
    />
  );
}

export function PostmanMark(props: SVGProps<SVGSVGElement>) {
  return (
    <ThemePair
      dark={<Postman {...props} />}
      light={<Postman variant="mono" {...props} className={`text-[#db5d2f] ${props.className ?? ""}`} />}
    />
  );
}

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
  Prisma: PrismaMark,
  PostgreSQL: Postgresql,
  Supabase: Supabase,
  "Django REST Framework": DjangoMark,
  "Google Drive API": GoogleDrive,
  "NextAuth.js": Authdotjs,
  Spigot: SpigotMark,
  // NextAuth ships as Auth.js in the icon set
  NextAuth: Authdotjs,
  AWS: Aws,
  "YouTube API": Youtube,
  "Redis (Upstash)": UpstashMark,
  Docker: Docker,
  Python: Python,
  HeroUI: Heroui,
  "Tailwind CSS": TailwindMark,
  ShadcnUi: ShadcnMark,
  Go: GoMark,
  React: ReactMark,
  SQLite: SqliteMono,
  FFmpeg: Ffmpeg,
  Vite: ViteMono,
  "GitHub Actions": GithubActions,
  // Not in the icon set; cropped from the project's own banner artwork.
  "yt-dlp": YtDlpMark,
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
 * the wordmark drawn on top in hardcoded white gradients. The circle is forced
 * to black in both themes, which is the logo's own presentation. Following the
 * page colour instead would turn it white in the light theme and erase the
 * white glyph.
 */
export const TECH_ICON_CLASS: Record<string, string> = {
  "Next.js": "text-black",
  "Next.js API Routes": "text-black",
  // GitHub's path has fill="#181717" baked in rather than currentColor, so it
  // sinks into the dark page. fill-current on descendants overrides it.
  GitHub: "text-foreground [&_*]:fill-current",
  // The mono feather takes currentColor; SQLite blue restores the brand and
  // holds non-text contrast on both a dark and a light page.
  SQLite: "text-[#0F80CC]",
  // Java ships only its default artwork. The orange steam is 2.83:1 on the light
  // page, and 3.43:1 once darkened by 10%.
  Java: "light:brightness-90",
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
