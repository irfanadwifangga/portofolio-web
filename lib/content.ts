export interface Project {
  name: string;
  /** Screenshot in public/project — shown in the CardSwap stack. */
  image: string;
  role: string;
  period: string;
  org: string;
  summary: string;
  stack: string[];
}

export const projects: Project[] = [
  {
    name: "Seria",
    image: "/project/seria.png",
    role: "Freelance Fullstack Developer",
    period: "Jan 2026 — Present",
    org: "Minecraft server community",
    summary:
      "The web ecosystem for a Minecraft server community — storefront, admin CMS, and a Java/Spigot plugin that bridges the web backend to the live game server over RCON. Payment gateway (Duitku) integration with signature verification and webhook idempotency.",
    stack: [
      "Next.js",
      "TypeScript",
      "Prisma",
      "Supabase",
      "PostgreSQL",
      "AWS",
      "Java",
      "RCON",
      "Duitku"
    ]
  },
  {
    name: "GM Workspace",
    image: "/project/gm-workspace.png",
    role: "Freelance Fullstack Developer",
    period: "Jul 2026 — Present",
    org: "Self-employed / individual client",
    summary:
      "An internal management platform for a YouTube production team — automated payroll, a tiered bonus engine driven by asynchronous view-count syncing, and Google Drive integration with OAuth + encrypted token storage.",
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "HeroUI",
      "Prisma",
      "Supabase",
      "PostgreSQL",
      "NextAuth",
      "YouTube API",
      "Google Drive API"
    ]
  },
  {
    name: "RSTPOS",
    image: "/project/rstpos.png",
    role: "Backend Developer Intern",
    period: "Feb 2026 — Jun 2026",
    org: "PT. Rizq Sanjaya Teknologi",
    summary:
      "A multi-branch Point of Sale system for retail/F&B. Built the REST API and internal dashboard — atomic stock adjustments, branch-scoped inventory, and role-based access.",
    stack: ["Django REST Framework", "PostgreSQL", "Docker", "Python"]
  }
];

export interface DeepDive {
  title: string;
  project: string;
  problem: string;
  approach: string[];
  stack: string[];
}

export const deepDives: DeepDive[] = [
  {
    title: "Payments that can't double-charge",
    project: "Seria",
    problem:
      "Duitku's payment webhook can retry, arrive out of order, or fire more than once for the same order — and every one of those has to end with exactly one entitlement granted, never zero, never two.",
    approach: [
      "Verify every callback against Duitku's MD5 signature before touching the database",
      "Treat the order row as the source of truth — a webhook for an already-PAID order short-circuits instead of re-granting",
      "Only call the RCON bridge to grant the in-game item after the order state transition commits"
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "ShadcnUi",
      "Prisma",
      "Supabase",
      "PostgreSQL",
      "AWS",
      "Duitku"
    ]
  },
  {
    title: "A real-time bridge to a game server",
    project: "Seria",
    problem:
      "The webstore and the Minecraft server are two separate processes. A purchase on the web has to reach the game server reliably, and the plugin side has to speak RCON correctly under load.",
    approach: [
      "Built a small RCON client in Java implementing the packet protocol directly (auth, exec, response) rather than pulling in a heavier framework",
      "Wrapped entitlement grants behind a single sendCommand path so retries and failures are handled in one place",
      "Kept the plugin's responsibilities narrow — permission grants and in-game notifications, nothing else"
    ],
    stack: ["Java", "Spigot", "RCON"]
  },
  {
    title: "Inventory that survives concurrent branches",
    project: "RSTPOS",
    problem:
      "Multiple branches can adjust stock for the same product at the same time. Without locking, two concurrent requests can both read the same quantity and one adjustment silently overwrites the other.",
    approach: [
      "Used select_for_update() inside an atomic transaction to lock the stock row for the duration of the adjustment",
      "Rejected adjustments that would push quantity negative, before the write ever happens",
      "Logged every adjustment (branch, product, quantity, reason) for audit and reconciliation"
    ],
    stack: ["Django REST Framework", "Python", "PostgreSQL", "Docker"]
  },
  {
    title: "A payroll engine that can't pay twice",
    project: "GM Workspace",
    problem:
      "Bonus tiers are driven by asynchronous view-count syncing jobs. If a sync job overlaps with a payroll run, or retries after a partial failure, the same bonus can get queued more than once.",
    approach: [
      "Ordered guard logic around the payout step so a bonus can only move from 'pending' to 'paid' once",
      "Decoupled the view-count sync from the payout calculation so a slow or retried sync never blocks payroll from running on schedule",
      "Modeled tiers as data, not conditionals, so a new bonus tier is a config change, not a deploy"
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "HeroUI",
      "Prisma",
      "Supabase",
      "PostgreSQL",
      "NextAuth",
      "YouTube API",
      "Google Drive API"
    ]
  }
];

export interface ExperienceEntry {
  org: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
}

export const experience: ExperienceEntry[] = [
  {
    org: "GM Workspace",
    role: "Freelance Fullstack Developer",
    period: "Jul 2026 — Present",
    location: "Remote · Individual client",
    bullets: [
      "Designed the payroll and tiered bonus engine end to end, including concurrency-safe payout logic",
      "Integrated Google Drive (OAuth + AES-256-GCM encrypted token storage) for team asset management"
    ]
  },
  {
    org: "RSTPOS — PT. Rizq Sanjaya Teknologi",
    role: "Backend Developer Intern",
    period: "Feb 2026 — Jun 2026",
    location: "Internship",
    bullets: [
      "Built REST APIs and the internal dashboard for a multi-branch retail/F&B POS system",
      "Implemented atomic, race-safe stock adjustment logic across branches"
    ]
  },
  {
    org: "Seria",
    role: "Freelance Fullstack Developer",
    period: "Jan 2026 — Present",
    location: "Remote · Minecraft server community",
    bullets: [
      "Built the storefront, admin CMS, and payment gateway integration (Duitku)",
      "Wrote a Java/Spigot plugin bridging the web backend and game server in real time via RCON"
    ]
  },
  {
    org: "Politeknik Negeri Lampung",
    role: "D3 Information Technology",
    period: "Aug 2023 — Present",
    location: "Bandar Lampung, Indonesia",
    bullets: [
      "Best Presentation winner at Expo 2025 for a digital building-reservation system for the campus — Next.js, Redis (Upstash), Supabase Postgres",
      "Where the hands-on development track started — three years in, still going"
    ]
  }
];
