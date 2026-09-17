import type { ComponentType, SVGProps } from "react";
// Every icon draws from the page's mark sprite (lib/marks.tsx); the themed
// marks switch artwork on the light page.
import {
  GoMark,
  markIcon,
  PhpMark,
  PostmanMark,
  PrismaMark,
  ReactMark,
  SpringMark,
  TailwindMark,
  UpstashMark,
  VercelMark
} from "@/lib/tech-icons";

import type { Localized } from "@/lib/i18n/locales";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface TechItem {
  name: string;
  Icon: IconType;
}

export interface TechGroup {
  category: Localized<string>;
  items: TechItem[];
}

export const techGroups: TechGroup[] = [
  {
    category: { en: "Languages", id: "Bahasa pemrograman" },
    items: [
      { name: "JavaScript", Icon: markIcon("javascript") },
      { name: "TypeScript", Icon: markIcon("typescript") },
      { name: "Go", Icon: GoMark },
      { name: "Java", Icon: markIcon("java") },
      { name: "Python", Icon: markIcon("python") },
      { name: "PHP", Icon: PhpMark }
    ]
  },
  {
    category: { en: "Frontend", id: "Frontend" },
    items: [
      { name: "Next.js", Icon: markIcon("nextjs") },
      { name: "React", Icon: ReactMark },
      { name: "Tailwind CSS", Icon: TailwindMark },
      { name: "HeroUI", Icon: markIcon("heroui") }
    ]
  },
  {
    category: { en: "Backend", id: "Backend" },
    items: [
      { name: "Node.js", Icon: markIcon("nodejs") },
      { name: "Django REST", Icon: markIcon("django") },
      { name: "Spring", Icon: SpringMark },
      { name: "Prisma", Icon: PrismaMark },
      { name: "NextAuth", Icon: markIcon("authjs") },
      { name: "Celery", Icon: markIcon("celery") },
      { name: "HTMX", Icon: markIcon("htmx") }
    ]
  },
  {
    category: { en: "Database", id: "Basis data" },
    items: [
      { name: "PostgreSQL", Icon: markIcon("postgresql") },
      { name: "Supabase", Icon: markIcon("supabase") },
      { name: "Redis", Icon: markIcon("redis") },
      { name: "Upstash", Icon: UpstashMark }
    ]
  },
  {
    category: { en: "Tools", id: "Tools" },
    items: [
      { name: "Docker", Icon: markIcon("docker") },
      { name: "Git", Icon: markIcon("git") },
      { name: "GitHub", Icon: markIcon("github") },
      { name: "Vercel", Icon: VercelMark },
      { name: "AWS", Icon: markIcon("aws") },
      { name: "Postman", Icon: PostmanMark },
      { name: "Google Cloud Console", Icon: markIcon("google-cloud") }
    ]
  }
];

// Empty is a valid state: the section hides the Learning row rather than
// rendering a heading with nothing under it.
export const learningStack: TechItem[] = [];
