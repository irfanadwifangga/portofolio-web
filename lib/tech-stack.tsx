import type { ComponentType, SVGProps } from "react";
import {
  Javascript,
  Typescript,
  Java,
  Nextjs,
  Nodejs,
  Celery,
  Htmx,
  Postgresql,
  Supabase,
  Redis,
  Docker,
  Git,
  Github,
  Python,
  Authdotjs,
  Aws,
  Heroui,
  GoogleCloud
} from "@thesvg/react";
// Theme-aware versions of marks that fail on the light page.
import {
  DjangoMark,
  GoMark,
  PhpMark,
  PostmanMark,
  PrismaMark,
  ReactMark,
  SpringMark,
  TailwindMark,
  UpstashMark,
  VercelMark
} from "@/lib/tech-icons";

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
      { name: "Go", Icon: GoMark },
      { name: "Java", Icon: Java },
      { name: "Python", Icon: Python },
      { name: "PHP", Icon: PhpMark }
    ]
  },
  {
    category: "Frontend",
    items: [
      { name: "Next.js", Icon: Nextjs },
      { name: "React", Icon: ReactMark },
      { name: "Tailwind CSS", Icon: TailwindMark },
      { name: "HeroUI", Icon: Heroui }
    ]
  },
  {
    category: "Backend",
    items: [
      { name: "Node.js", Icon: Nodejs },
      { name: "Django REST", Icon: DjangoMark },
      { name: "Spring", Icon: SpringMark },
      { name: "Prisma", Icon: PrismaMark },
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
      { name: "Upstash", Icon: UpstashMark }
    ]
  },
  {
    category: "Tools",
    items: [
      { name: "Docker", Icon: Docker },
      { name: "Git", Icon: Git },
      { name: "GitHub", Icon: Github },
      { name: "Vercel", Icon: VercelMark },
      { name: "AWS", Icon: Aws },
      { name: "Postman", Icon: PostmanMark },
      { name: "Google Cloud Console", Icon: GoogleCloud }
    ]
  }
];

// Empty is a valid state: the section hides the Learning row rather than
// rendering a heading with nothing under it.
export const learningStack: TechItem[] = [];
