import type { Dictionary } from "./en";

/**
 * Indonesian copy. Tone: professional but relaxed. It uses "saya" and never
 * "Anda" or "kamu". Typed against the English dictionary, so the two cannot
 * drift apart in shape.
 */
export const id: Dictionary = {
  meta: {
    title: "Irfana Dwi Fangga — Fullstack Developer",
    description:
      "Fullstack developer dengan fokus backend — sistem pembayaran yang kritis, integrasi real-time, dan REST API. Next.js, Django, Prisma, Java.",
    tagline: "Fullstack Developer — fokus backend",
    ogLocale: "id_ID",
    ogSpecialties: ["Sistem pembayaran kritis", "Integrasi real-time", "REST API"]
  },
  sections: {
    top: { label: "Beranda", aria: "Kembali ke atas" },
    building: { label: "Proyek", aria: "Proyek yang sedang saya bangun" },
    deepDives: { label: "Bedah sistem", aria: "Bedah sistem secara teknis" },
    sideProject: { label: "Proyek pribadi", aria: "Proyek pribadi" },
    stack: { label: "Teknologi", aria: "Teknologi yang saya pakai" },
    experience: { label: "Pengalaman", aria: "Pengalaman kerja" },
    contact: { label: "Kontak", aria: "Hubungi saya" }
  },
  menu: {
    menu: "Menu",
    close: "Tutup",
    openAria: "Buka menu",
    closeAria: "Tutup menu",
    header: "Header navigasi utama",
    socialsTitle: "Di tempat lain",
    socialsAria: "Tautan media sosial"
  },
  theme: {
    unknown: "Ganti tema warna",
    toLight: "Ganti ke tema terang",
    toDark: "Ganti ke tema gelap"
  },
  language: {
    label: "ID",
    switchLabel: "Ganti ke bahasa Inggris"
  },
  toast: {
    region: "Notifikasi",
    dismiss: "Tutup notifikasi"
  },
  common: {
    logoAlt: "Logo",
    newTab: "(terbuka di tab baru)"
  },
  hero: {
    role: "Fullstack Developer",
    lead: "Saya membangun bagian produk yang jarang terlihat — alur pembayaran yang tidak bisa menagih dua kali, jembatan real-time yang tidak kehilangan pesan, dan API yang tetap kokoh saat menerima banyak tulisan bersamaan. Saat ini freelance di tiga sistem produksi, dengan fokus backend.",
    primaryCta: "Lihat sistemnya",
    secondaryCta: "Hubungi saya",
    location: "Bandar Lampung, Indonesia · membangun sejak Agu 2023",
    editorTabs: "Profil dalam setiap bahasa"
  },
  building: {
    title: "Sedang dibangun",
    description: "Tiga sistem produksi, berjalan bersamaan, semuanya berfokus pada backend.",
    showing: "Menampilkan {name}, {index} dari {total}",
    imageAlt: "{name} — {role}"
  },
  deepDives: {
    title: "Bedah sistem",
    description: "Bukan sekadar tangkapan layar — masalah yang sebenarnya, dan cara menyelesaikannya."
  },
  sideProject: {
    title: "Proyek pribadi",
    description: "Dibangun di waktu luang, dengan standar yang sama seperti pekerjaan klien.",
    imageAlt: "Aplikasi desktop {name}, menampilkan layar konversi dan antrean job-nya",
    viewSource: "Lihat kode sumber di GitHub"
  },
  stack: {
    title: "Teknologi",
    caption: "{tools} teknologi · {categories} kategori",
    learning: "Sedang dipelajari",
    currentlyLearning: "Sedang dipelajari"
  },
  experience: {
    title: "Pengalaman"
  },
  contact: {
    title: "Mari ngobrol",
    description:
      "Bandar Lampung, Indonesia. Terbuka untuk posisi fullstack remote — dengan fokus backend — dan terbuka membahas relokasi untuk kesempatan yang tepat.",
    available: "Terbuka untuk pekerjaan baru",
    form: {
      title: "Pesan Baru",
      from: "Dari",
      email: "Email",
      subject: "Subjek",
      namePlaceholder: "Nama lengkap",
      emailPlaceholder: "nama@email.com",
      subjectPlaceholder: "Mau membahas apa?",
      bodyPlaceholder: "Tulis pesan di sini...",
      errors: {
        nameRequired: "Nama wajib diisi",
        emailRequired: "Email wajib diisi",
        emailInvalid: "Email tidak valid",
        subjectRequired: "Subjek wajib diisi",
        bodyRequired: "Pesan wajib diisi"
      },
      sending: "Mengirim...",
      sent: "Terkirim!",
      send: "Kirim Pesan",
      shortcut: "Ctrl + Enter",
      unexpected: "Terjadi kesalahan. Silakan coba lagi."
    },
    server: {
      nameRequired: "Nama wajib diisi.",
      nameTooLong: "Nama terlalu panjang.",
      emailInvalid: "Masukkan alamat email yang valid.",
      emailTooLong: "Alamat email terlalu panjang.",
      subjectRequired: "Subjek wajib diisi.",
      subjectTooLong: "Subjek terlalu panjang.",
      bodyRequired: "Pesan wajib diisi.",
      bodyTooLong: "Pesan terlalu panjang (maks. 5.000 karakter).",
      notConfigured: "Layanan email belum dikonfigurasi.",
      rateLimited: "Pesan baru saja terkirim. Tunggu sekitar satu menit sebelum mengirim lagi.",
      sent: "Pesan terkirim! Saya akan segera membalas.",
      failed: "Gagal mengirim pesan. Silakan coba lagi nanti."
    }
  },
  footer: {
    builtWith: "Dibuat dengan Next.js, Tailwind CSS & Motion"
  },
  notFound: {
    title: "Halaman tidak ditemukan — Irfana Dwi Fangga",
    message: "Halaman ini tidak ada, atau sudah dipindah.",
    home: "Kembali ke beranda",
    contact: "Hubungi saya"
  }
};
