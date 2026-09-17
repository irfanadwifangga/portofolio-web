import type { Period } from "@/lib/i18n/format";
import type { Localized } from "@/lib/i18n/locales";

/*
 * Long-form content in both languages.
 *
 * Every human-readable field is `{ en, id }`; names, URLs, images and stack
 * labels are written once, so the two languages cannot drift apart on facts.
 * Components resolve a locale with lib/i18n/resolve.ts or by indexing
 * directly, e.g. `entry.role[locale]`.
 *
 * Only type imports: scripts/check-locale-leaks.mjs loads this file into Node.
 */

export interface Project {
  name: string;
  /** Screenshot in public/project — shown in the CardSwap stack. */
  image: string;
  role: Localized<string>;
  period: Period;
  org: Localized<string>;
  summary: Localized<string>;
  stack: string[];
}

export const projects: Project[] = [
  {
    name: "Seria",
    image: "/project/seria.png",
    role: { en: "Freelance Fullstack Developer", id: "Fullstack Developer Freelance" },
    period: { start: "2026-01", end: "present" },
    org: { en: "Minecraft server community", id: "Komunitas server Minecraft" },
    summary: {
      en: "The web ecosystem for a Minecraft server community — storefront, admin CMS, and a Java/Spigot plugin that bridges the web backend to the live game server over RCON. Payment gateway (Duitku) integration with signature verification and webhook idempotency.",
      id: "Ekosistem web untuk komunitas server Minecraft — storefront, CMS admin, dan plugin Java/Spigot yang menghubungkan backend web ke server game yang sedang berjalan lewat RCON. Integrasi payment gateway (Duitku) dengan verifikasi signature dan webhook yang idempoten."
    },
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
    role: { en: "Freelance Fullstack Developer", id: "Fullstack Developer Freelance" },
    period: { start: "2026-07", end: "present" },
    org: { en: "Self-employed / individual client", id: "Mandiri / klien perorangan" },
    summary: {
      en: "An internal management platform for a YouTube production team — automated payroll, a tiered bonus engine driven by asynchronous view-count syncing, and Google Drive integration with OAuth + encrypted token storage.",
      id: "Platform manajemen internal untuk tim produksi YouTube — penggajian otomatis, mesin bonus bertingkat yang digerakkan sinkronisasi jumlah view secara asinkron, dan integrasi Google Drive dengan OAuth + penyimpanan token terenkripsi."
    },
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
    role: { en: "Backend Developer Intern", id: "Backend Developer (Magang)" },
    period: { start: "2026-02", end: "2026-06" },
    org: { en: "PT. Rizq Sanjaya Teknologi", id: "PT. Rizq Sanjaya Teknologi" },
    summary: {
      en: "A multi-branch Point of Sale system for retail/F&B. Built the REST API and internal dashboard — atomic stock adjustments, branch-scoped inventory, and role-based access.",
      id: "Sistem Point of Sale multi-cabang untuk retail/F&B. Membangun REST API dan dashboard internal — penyesuaian stok yang atomik, inventaris per cabang, dan akses berbasis peran."
    },
    stack: ["Django REST Framework", "PostgreSQL", "Docker", "Python"]
  }
];

export interface DeepDive {
  title: Localized<string>;
  /** Project name, the same in both languages. */
  project: string;
  problem: Localized<string>;
  approach: Localized<string[]>;
  stack: string[];
}

export const deepDives: DeepDive[] = [
  {
    title: { en: "Payments that can't double-charge", id: "Pembayaran yang tidak bisa menagih dua kali" },
    project: "Seria",
    problem: {
      en: "Duitku's payment webhook can retry, arrive out of order, or fire more than once for the same order — and every one of those has to end with exactly one entitlement granted, never zero, never two.",
      id: "Webhook pembayaran Duitku bisa dikirim ulang, datang tidak berurutan, atau terpicu lebih dari sekali untuk pesanan yang sama — dan semuanya harus berakhir dengan tepat satu item diberikan, tidak nol, tidak dua."
    },
    approach: {
      en: [
        "Verify every callback against Duitku's MD5 signature before touching the database",
        "Treat the order row as the source of truth — a webhook for an already-PAID order short-circuits instead of re-granting",
        "Only call the RCON bridge to grant the in-game item after the order state transition commits"
      ],
      id: [
        "Memverifikasi setiap callback dengan signature MD5 dari Duitku sebelum menyentuh database",
        "Menjadikan baris pesanan sebagai sumber kebenaran — webhook untuk pesanan yang sudah PAID langsung dihentikan, bukan memberikan item lagi",
        "Baru memanggil jembatan RCON untuk memberikan item di dalam game setelah perubahan status pesanan tersimpan"
      ]
    },
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
    title: { en: "A real-time bridge to a game server", id: "Jembatan real-time ke server game" },
    project: "Seria",
    problem: {
      en: "The webstore and the Minecraft server are two separate processes. A purchase on the web has to reach the game server reliably, and the plugin side has to speak RCON correctly under load.",
      id: "Webstore dan server Minecraft adalah dua proses terpisah. Pembelian di web harus sampai ke server game dengan andal, dan sisi plugin harus menjalankan RCON dengan benar saat beban sedang tinggi."
    },
    approach: {
      en: [
        "Built a small RCON client in Java implementing the packet protocol directly (auth, exec, response) rather than pulling in a heavier framework",
        "Wrapped entitlement grants behind a single sendCommand path so retries and failures are handled in one place",
        "Kept the plugin's responsibilities narrow — permission grants and in-game notifications, nothing else"
      ],
      id: [
        "Membangun klien RCON kecil di Java yang langsung mengimplementasikan protokol paketnya (auth, exec, response), alih-alih memakai framework yang lebih berat",
        "Membungkus pemberian item di balik satu jalur sendCommand, sehingga retry dan kegagalan ditangani di satu tempat",
        "Menjaga tanggung jawab plugin tetap sempit — hanya pemberian izin dan notifikasi di dalam game"
      ]
    },
    stack: ["Java", "Spigot", "RCON"]
  },
  {
    title: { en: "Inventory that survives concurrent branches", id: "Inventaris yang aman saat banyak cabang bekerja bersamaan" },
    project: "RSTPOS",
    problem: {
      en: "Multiple branches can adjust stock for the same product at the same time. Without locking, two concurrent requests can both read the same quantity and one adjustment silently overwrites the other.",
      id: "Beberapa cabang bisa menyesuaikan stok produk yang sama di waktu yang bersamaan. Tanpa penguncian, dua request bersamaan bisa membaca jumlah yang sama, dan satu penyesuaian diam-diam menimpa yang lain."
    },
    approach: {
      en: [
        "Used select_for_update() inside an atomic transaction to lock the stock row for the duration of the adjustment",
        "Rejected adjustments that would push quantity negative, before the write ever happens",
        "Logged every adjustment (branch, product, quantity, reason) for audit and reconciliation"
      ],
      id: [
        "Memakai select_for_update() di dalam transaksi atomik untuk mengunci baris stok selama penyesuaian berlangsung",
        "Menolak penyesuaian yang akan membuat jumlah stok negatif, sebelum data sempat ditulis",
        "Mencatat setiap penyesuaian (cabang, produk, jumlah, alasan) untuk audit dan rekonsiliasi"
      ]
    },
    stack: ["Django REST Framework", "Python", "PostgreSQL", "Docker"]
  },
  {
    title: { en: "A payroll engine that can't pay twice", id: "Mesin penggajian yang tidak bisa membayar dua kali" },
    project: "GM Workspace",
    problem: {
      en: "Bonus tiers are driven by asynchronous view-count syncing jobs. If a sync job overlaps with a payroll run, or retries after a partial failure, the same bonus can get queued more than once.",
      id: "Tingkatan bonus digerakkan oleh job sinkronisasi jumlah view yang berjalan asinkron. Jika job sinkronisasi bertumpuk dengan proses penggajian, atau diulang setelah gagal sebagian, bonus yang sama bisa masuk antrean lebih dari sekali."
    },
    approach: {
      en: [
        "Ordered guard logic around the payout step so a bonus can only move from 'pending' to 'paid' once",
        "Decoupled the view-count sync from the payout calculation so a slow or retried sync never blocks payroll from running on schedule",
        "Modeled tiers as data, not conditionals, so a new bonus tier is a config change, not a deploy"
      ],
      id: [
        "Menyusun logika penjaga yang berurutan di langkah pembayaran, sehingga bonus hanya bisa berpindah dari 'pending' ke 'paid' satu kali",
        "Memisahkan sinkronisasi jumlah view dari perhitungan pembayaran, sehingga sinkronisasi yang lambat atau diulang tidak pernah menghambat penggajian sesuai jadwal",
        "Memodelkan tingkatan bonus sebagai data, bukan percabangan kondisi, sehingga tingkatan baru cukup diubah lewat konfigurasi, bukan deploy"
      ]
    },
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
  /** Organisation name, the same in both languages. */
  org: string;
  role: Localized<string>;
  period: Period;
  location: Localized<string>;
  bullets: Localized<string[]>;
}

export const experience: ExperienceEntry[] = [
  {
    org: "GM Workspace",
    role: { en: "Freelance Fullstack Developer", id: "Fullstack Developer Freelance" },
    period: { start: "2026-07", end: "present" },
    location: { en: "Remote · Individual client", id: "Remote · Klien perorangan" },
    bullets: {
      en: [
        "Designed the payroll and tiered bonus engine end to end, including concurrency-safe payout logic",
        "Integrated Google Drive (OAuth + AES-256-GCM encrypted token storage) for team asset management"
      ],
      id: [
        "Merancang mesin penggajian dan bonus bertingkat dari awal sampai akhir, termasuk logika pembayaran yang aman dari konkurensi",
        "Mengintegrasikan Google Drive (OAuth + penyimpanan token terenkripsi AES-256-GCM) untuk pengelolaan aset tim"
      ]
    }
  },
  {
    org: "RSTPOS — PT. Rizq Sanjaya Teknologi",
    role: { en: "Backend Developer Intern", id: "Backend Developer (Magang)" },
    period: { start: "2026-02", end: "2026-06" },
    location: { en: "Internship", id: "Magang" },
    bullets: {
      en: [
        "Built REST APIs and the internal dashboard for a multi-branch retail/F&B POS system",
        "Implemented atomic, race-safe stock adjustment logic across branches"
      ],
      id: [
        "Membangun REST API dan dashboard internal untuk sistem POS retail/F&B multi-cabang",
        "Mengimplementasikan logika penyesuaian stok yang atomik dan aman dari race condition antarcabang"
      ]
    }
  },
  {
    org: "Seria",
    role: { en: "Freelance Fullstack Developer", id: "Fullstack Developer Freelance" },
    period: { start: "2026-01", end: "present" },
    location: { en: "Remote · Minecraft server community", id: "Remote · Komunitas server Minecraft" },
    bullets: {
      en: [
        "Built the storefront, admin CMS, and payment gateway integration (Duitku)",
        "Wrote a Java/Spigot plugin bridging the web backend and game server in real time via RCON"
      ],
      id: [
        "Membangun storefront, CMS admin, dan integrasi payment gateway (Duitku)",
        "Menulis plugin Java/Spigot yang menghubungkan backend web dan server game secara real-time lewat RCON"
      ]
    }
  },
  {
    org: "Politeknik Negeri Lampung",
    role: { en: "D3 Information Technology", id: "D3 Teknologi Informasi" },
    period: { start: "2023-08", end: "present" },
    location: { en: "Bandar Lampung, Indonesia", id: "Bandar Lampung, Indonesia" },
    bullets: {
      en: [
        "Best Presentation winner at Expo 2025 for a digital building-reservation system for the campus — Next.js, Redis (Upstash), Supabase Postgres",
        "Where the hands-on development track started — three years in, still going"
      ],
      id: [
        "Juara Best Presentation di Expo 2025 untuk sistem reservasi gedung digital kampus — Next.js, Redis (Upstash), Supabase Postgres",
        "Titik awal perjalanan saya di pengembangan secara langsung — tiga tahun berjalan, dan masih berlanjut"
      ]
    }
  }
];

export interface SideProjectFact {
  value: string;
  label: Localized<string>;
}

export interface SideProject {
  name: string;
  /** Screenshot in public/project. Optional: the section lays out without it. */
  image: string;
  repo: string;
  period: Period;
  tagline: Localized<string>;
  summary: Localized<string>;
  highlights: Localized<string[]>;
  /**
   * Counted from the repository, not estimated. Re-count when the project
   * moves on, or these quietly become claims that are no longer true.
   * Last counted 2026-09-15.
   */
  facts: SideProjectFact[];
  stack: string[];
  dives: DeepDive[];
}

export const sideProject: SideProject = {
  name: "YT To MP3 Converter",
  image: "/project/yt-to-mp3.png",
  repo: "https://github.com/irfanadwifangga/yt-to-mp3",
  period: { start: "2026-09", end: "2026-09" },
  tagline: { en: "Local desktop app · Go + React", id: "Aplikasi desktop lokal · Go + React" },
  summary: {
    en: "Paste a video link and get an MP3 with title, artist, cover art and album tags already filled in — entirely on your own machine, with no account and nothing uploaded. A Go backend keeps a persistent job queue in SQLite, drives yt-dlp and FFmpeg as child processes, and streams live progress to a React UI over Server-Sent Events. It builds into a single pure-Go binary and a Windows installer.",
    id: "Tempel link video dan dapatkan MP3 dengan judul, artis, cover art, dan tag album yang sudah terisi — sepenuhnya di komputer sendiri, tanpa akun dan tanpa ada yang diunggah. Backend Go menyimpan antrean job yang persisten di SQLite, menjalankan yt-dlp dan FFmpeg sebagai child process, dan mengalirkan progres secara langsung ke UI React lewat Server-Sent Events. Hasil build-nya berupa satu binary Go murni dan installer Windows."
  },
  highlights: {
    en: [
      "Layered design with one-way imports: the domain knows nothing about HTTP, SQL or child processes, and every adapter is wired in main alone",
      "A finished file only appears by atomic rename from temp, after its name is claimed through an O_EXCL reservation, so two workers can never write the same path",
      "On startup, crash recovery marks interrupted jobs failed, collects orphaned temp files and reconciles the history with what is actually on disk"
    ],
    id: [
      "Desain berlapis dengan import satu arah: domain tidak tahu apa pun tentang HTTP, SQL, atau child process, dan setiap adapter hanya dirangkai di main",
      "File hasil hanya muncul lewat rename atomik dari file sementara, setelah namanya diklaim lewat reservasi O_EXCL, sehingga dua worker tidak pernah menulis ke path yang sama",
      "Saat aplikasi dijalankan, pemulihan crash menandai job yang terputus sebagai gagal, membersihkan file sementara yang tertinggal, dan mencocokkan riwayat dengan isi disk yang sebenarnya"
    ]
  },
  facts: [
    { value: "215", label: { en: "Go test functions", id: "fungsi tes Go" } },
    { value: "3", label: { en: "OSes tested in CI", id: "OS yang dites di CI" } },
    { value: "5", label: { en: "cross-compiled targets", id: "target cross-compile" } },
    { value: "0", label: { en: "cgo dependencies", id: "dependensi cgo" } }
  ],
  stack: ["Go", "React", "TypeScript", "SQLite", "FFmpeg", "yt-dlp", "Vite", "GitHub Actions"],
  dives: [
    {
      title: { en: "Cancel that kills the whole process tree", id: "Cancel yang mematikan seluruh pohon proses" },
      project: "yt-to-mp3",
      problem: {
        en: "yt-dlp spawns FFmpeg, and on Windows killing a process does not kill its children. A naive cancel leaves an orphaned FFmpeg still writing, and a temp file the OS refuses to delete because something still holds it open.",
        id: "yt-dlp menjalankan FFmpeg, dan di Windows mematikan sebuah proses tidak ikut mematikan proses anaknya. Cancel yang naif meninggalkan FFmpeg yatim yang masih menulis, dan file sementara yang tidak bisa dihapus OS karena masih dipakai."
      },
      approach: {
        en: [
          "Every child is adopted into a Windows Job Object with KILL_ON_JOB_CLOSE, so closing one handle ends the entire tree, grandchildren included",
          "Cancel sends a soft CTRL_BREAK first and closes the job after a grace period; Unix process groups get the same two-step treatment",
          "Temp files are removed only after the process has actually exited, and CI proves tree termination on Windows, macOS and Linux"
        ],
        id: [
          "Setiap child process dimasukkan ke Windows Job Object dengan KILL_ON_JOB_CLOSE, sehingga menutup satu handle mengakhiri seluruh pohon proses, termasuk cucunya",
          "Cancel mengirim CTRL_BREAK yang lembut lebih dulu, lalu menutup job setelah masa tenggang; process group di Unix mendapat perlakuan dua langkah yang sama",
          "File sementara baru dihapus setelah prosesnya benar-benar berhenti, dan CI membuktikan penghentian pohon proses di Windows, macOS, dan Linux"
        ]
      },
      stack: ["Go", "FFmpeg", "yt-dlp"]
    },
    {
      title: { en: "Live progress that survives a reconnect", id: "Progres langsung yang tetap utuh saat tersambung ulang" },
      project: "yt-to-mp3",
      problem: {
        en: "The UI follows each job over Server-Sent Events. Reading stored history and then subscribing leaves a gap: any event fired between the two steps is lost for good, and a reconnecting tab can miss the one state change that mattered.",
        id: "UI mengikuti setiap job lewat Server-Sent Events. Membaca riwayat tersimpan lalu berlangganan meninggalkan celah: event yang terjadi di antara dua langkah itu hilang selamanya, dan tab yang tersambung ulang bisa melewatkan satu perubahan status yang paling penting."
      },
      approach: {
        en: [
          "Subscribe to the live stream first, then read persisted history, and drop live events whose sequence number the history already delivered",
          "Only state, error and done are persisted and replayable; progress is lossy, throttled to four updates a second, and a reconnect gets one fresh snapshot instead of stale frames",
          "A slow subscriber may lose progress frames but never a state change: if one would block, that connection is closed rather than stalling the publisher"
        ],
        id: [
          "Berlangganan stream langsung lebih dulu, baru membaca riwayat tersimpan, lalu membuang event langsung yang nomor urutnya sudah dikirim oleh riwayat",
          "Hanya state, error, dan done yang disimpan dan bisa diputar ulang; progres boleh hilang, dibatasi empat pembaruan per detik, dan koneksi ulang mendapat satu snapshot baru, bukan frame lama",
          "Pelanggan yang lambat boleh kehilangan frame progres, tapi tidak pernah perubahan status: jika pengirimannya akan tertahan, koneksi itu ditutup alih-alih menghambat publisher"
        ]
      },
      stack: ["Go", "React", "TypeScript", "SQLite"]
    },
    {
      title: { en: "Retries that know when to give up", id: "Retry yang tahu kapan harus berhenti" },
      project: "yt-to-mp3",
      problem: {
        en: "A download can fail because the network blinked, because the source rate-limited the machine, or because the video is private. Retrying all three the same way either gives up too early or hammers a source that has already said no.",
        id: "Unduhan bisa gagal karena jaringan sempat putus, karena sumbernya membatasi laju permintaan, atau karena videonya privat. Mengulang ketiganya dengan cara yang sama berarti menyerah terlalu cepat, atau terus membombardir sumber yang sudah menolak."
      },
      approach: {
        en: [
          "Every failure is classified as transient, throttled, tool outdated, permanent or local, and only transient and throttled failures retry automatically, at most three times",
          "Throttled retries back off from 30 seconds to 5 minutes with ±20% jitter, so jobs limited together do not all return at once and trigger the next limit",
          "After an HTTP 429 the scheduler runs one job at a time for a five-minute cooldown, because parallel downloads only extend the throttling"
        ],
        id: [
          "Setiap kegagalan diklasifikasikan sebagai sementara, dibatasi, tool usang, permanen, atau lokal, dan hanya kegagalan sementara dan dibatasi yang diulang otomatis, maksimal tiga kali",
          "Retry yang dibatasi mundur bertahap dari 30 detik hingga 5 menit dengan jitter ±20%, sehingga job yang dibatasi bersamaan tidak kembali serentak dan memicu batas berikutnya",
          "Setelah HTTP 429, scheduler hanya menjalankan satu job selama cooldown lima menit, karena unduhan paralel justru memperpanjang pembatasan"
        ]
      },
      stack: ["Go", "SQLite"]
    }
  ]
};
