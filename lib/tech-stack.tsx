import type { ComponentType, SVGProps } from "react";
import {
  Javascript,
  Typescript,
  Java,
  Php,
  Nextjs,
  React as ReactIcon,
  Tailwindcss,
  Nodejs,
  Django,
  Spring,
  Prisma,
  Celery,
  Htmx,
  Postgresql,
  Supabase,
  Redis,
  Docker,
  Git,
  Github,
  Vercel,
  Postman,
  Go,
  Python,
  Authdotjs,
  Upstash,
  Aws,
  Heroui,
  GoogleCloud
} from "@thesvg/react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export interface TechItem {
  name: string;
  Icon: IconType;
}

export interface TechGroup {
  category: string;
  items: TechItem[];
}

export const techGroups: TechGroup[] = [
  {
    category: "Languages",
    items: [
      { name: "JavaScript", Icon: Javascript },
      { name: "TypeScript", Icon: Typescript },
      { name: "Go", Icon: Go },
      { name: "Java", Icon: Java },
      { name: "Python", Icon: Python },
      { name: "PHP", Icon: Php }
    ]
  },
  {
    category: "Frontend",
    items: [
      { name: "Next.js", Icon: Nextjs },
      { name: "React", Icon: ReactIcon },
      { name: "Tailwind CSS", Icon: Tailwindcss },
      { name: "HeroUI", Icon: Heroui }
    ]
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", Icon: Nodejs },
      { name: "Django REST", Icon: Django },
      { name: "Spring", Icon: Spring },
      { name: "Prisma", Icon: Prisma },
      { name: "NextAuth", Icon: Authdotjs },
      { name: "Celery", Icon: Celery },
      { name: "HTMX", Icon: Htmx }
    ]
  },
  {
    category: "Database",
    items: [
      { name: "PostgreSQL", Icon: Postgresql },
      { name: "Supabase", Icon: Supabase },
      { name: "Redis", Icon: Redis },
      { name: "Upstash", Icon: Upstash }
    ]
  },
  {
    category: "Tools",
    items: [
      { name: "Docker", Icon: Docker },
      { name: "Git", Icon: Git },
      { name: "GitHub", Icon: Github },
      { name: "Vercel", Icon: Vercel },
      { name: "AWS", Icon: Aws },
      { name: "Postman", Icon: Postman },
      { name: "Google Cloud Console", Icon: GoogleCloud }
    ]
  }
];

// Empty is a valid state: the section hides the Learning row rather than
// rendering a heading with nothing under it.
export const learningStack: TechItem[] = [];
