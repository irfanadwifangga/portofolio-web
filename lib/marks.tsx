import { cloneElement, type ReactElement, type SVGProps } from "react";
import {
  Authdotjs,
  Aws,
  Celery,
  Django,
  Docker,
  Ffmpeg,
  Git,
  Github,
  GithubActions,
  Go,
  GoogleCloud,
  GoogleDrive,
  Heroui,
  Htmx,
  Java,
  Javascript,
  Linkedin,
  Nextjs,
  Nodejs,
  Php,
  Postgresql,
  Postman,
  Prisma,
  Python,
  React as ReactIcon,
  Redis,
  ShadcnUi,
  Spigotmc,
  Spring,
  Sqlite,
  Supabase,
  TailwindCss,
  Typescript,
  Upstash,
  Vercel,
  Vite,
  Youtube
} from "@thesvg/react";
import { YtDlpMark } from "@/lib/yt-dlp-mark";

/**
 * Every brand mark on the page, drawn once.
 *
 * The same marks appear in the project cards, the deep-dives, the side project,
 * the orbit and its fallback grid — and theme-aware marks ship both artworks.
 * Rendered inline each time, that was 129 <svg> elements and 200 KB of the home
 * page's HTML, sent a second time inside the RSC payload. MarkDefs puts each
 * artwork in the document once, and Mark draws it with <use>, which costs a
 * few bytes per appearance.
 *
 * CSS from outside cannot reach into a <use> instance, so any class that has to
 * style the artwork's own paths lives here, on the definition. Colour still
 * flows in: `currentColor` inside an artwork resolves against the <use>, so a
 * text colour set where a Mark is used applies as before.
 */
const ARTWORK = {
  typescript: <Typescript />,
  javascript: <Javascript />,
  java: <Java />,
  python: <Python />,
  go: <Go />,
  "go-light": <Go variant="light" />,
  php: <Php />,
  "php-light": <Php variant="light" />,
  nextjs: <Nextjs />,
  react: <ReactIcon />,
  "react-light": <ReactIcon variant="light" />,
  tailwind: <TailwindCss />,
  "tailwind-mono": <TailwindCss variant="mono" />,
  heroui: <Heroui />,
  shadcn: <ShadcnUi />,
  "shadcn-light": <ShadcnUi variant="light" />,
  vite: <Vite variant="mono" />,
  nodejs: <Nodejs />,
  django: <Django />,
  spring: <Spring />,
  "spring-mono": <Spring variant="mono" />,
  prisma: <Prisma />,
  "prisma-light": <Prisma variant="light" />,
  authjs: <Authdotjs />,
  celery: <Celery />,
  htmx: <Htmx />,
  postgresql: <Postgresql />,
  supabase: <Supabase />,
  redis: <Redis />,
  upstash: <Upstash />,
  "upstash-mono": <Upstash variant="mono" />,
  sqlite: <Sqlite variant="mono" />,
  docker: <Docker />,
  git: <Git />,
  // GitHub and LinkedIn bake fixed fills into their paths; fill-current makes
  // them take the colour of wherever they are used.
  github: <Github className="[&_*]:fill-current" />,
  linkedin: <Linkedin className="[&_*]:fill-current" />,
  "github-actions": <GithubActions />,
  vercel: <Vercel />,
  "vercel-light": <Vercel variant="light" />,
  aws: <Aws />,
  postman: <Postman />,
  "postman-mono": <Postman variant="mono" />,
  "google-cloud": <GoogleCloud />,
  "google-drive": <GoogleDrive />,
  youtube: <Youtube />,
  spigot: <Spigotmc />,
  "spigot-mono": <Spigotmc variant="mono" />,
  ffmpeg: <Ffmpeg />,
  "yt-dlp": <YtDlpMark />
} satisfies Record<string, ReactElement<SVGProps<SVGSVGElement>>>;

export type MarkId = keyof typeof ARTWORK;

/**
 * The definitions every Mark on the page points at. Render it once per page,
 * anywhere in the body. Zero-sized rather than display:none, which would stop
 * gradients inside the artworks from painting in some browsers.
 */
export function MarkDefs() {
  return (
    <svg aria-hidden width={0} height={0} className="pointer-events-none absolute h-0 w-0 overflow-hidden">
      <defs>
        {Object.entries(ARTWORK).map(([id, artwork]) =>
          cloneElement(artwork, { key: id, id: `mark-${id}` })
        )}
      </defs>
    </svg>
  );
}

/** One brand mark, drawn from MarkDefs. Size it with width/height like an icon. */
export function Mark({ id, ...props }: { id: MarkId } & SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden {...props}>
      <use href={`#mark-${id}`} width="100%" height="100%" />
    </svg>
  );
}
