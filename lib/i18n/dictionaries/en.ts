/**
 * English copy for every piece of UI text on the site.
 *
 * `Dictionary` is derived from this object and id.ts must satisfy it, so a key
 * added here without an Indonesian translation is a type error. Long-form
 * content (projects, case studies, experience) lives in lib/content.ts instead,
 * with `{ en, id }` on each text field.
 *
 * No `as const`: the type describes the shape, not the English wording.
 * Import-free, so tests and scripts can load it straight into Node.
 */
export const en = {
  meta: {
    title: "Irfana Dwi Fangga — Fullstack Developer",
    description:
      "Fullstack developer, backend-first — payment-critical systems, real-time integrations, and REST APIs. Next.js, Django, Prisma, Java.",
    tagline: "Fullstack Developer — backend-first",
    ogLocale: "en_US",
    // Kept short on purpose: three chips have to fit one 1040px row at 20px mono.
    ogSpecialties: ["Payment-critical systems", "Real-time integrations", "REST APIs"]
  },
  sections: {
    top: { label: "Home", aria: "Back to the top" },
    building: { label: "Building", aria: "What I am currently building" },
    deepDives: { label: "Deep-dives", aria: "Engineering deep-dives" },
    sideProject: { label: "Side project", aria: "Side project" },
    stack: { label: "Stack", aria: "Tech stack" },
    experience: { label: "Experience", aria: "Work experience" },
    contact: { label: "Contact", aria: "Get in touch" }
  },
  menu: {
    menu: "Menu",
    close: "Close",
    openAria: "Open menu",
    closeAria: "Close menu",
    header: "Main navigation header",
    socialsTitle: "Elsewhere",
    socialsAria: "Social links"
  },
  theme: {
    unknown: "Switch color theme",
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme"
  },
  language: {
    label: "EN",
    switchLabel: "Switch to Indonesian"
  },
  toast: {
    region: "Notifications",
    dismiss: "Dismiss"
  },
  common: {
    logoAlt: "Logo",
    newTab: "(opens in a new tab)"
  },
  hero: {
    role: "Fullstack Developer",
    lead: "I build the parts of a product most people never see — payment flows that can't double-charge, real-time bridges that can't drop a message, APIs that hold up under concurrent writes. Currently freelancing across three production systems, backend-first.",
    primaryCta: "See the systems",
    secondaryCta: "Get in touch",
    location: "Bandar Lampung, Indonesia · building since Aug 2023",
    editorTabs: "Profile in each language"
  },
  building: {
    title: "Currently building",
    description: "Three production systems, running concurrently, all backend-first.",
    showing: "Showing {name}, {index} of {total}",
    imageAlt: "{name} — {role}"
  },
  deepDives: {
    title: "System deep-dives",
    description: "Not screenshots — the actual problems, and how they got solved."
  },
  sideProject: {
    title: "Side project",
    description: "Built on my own time, held to the same standard as client work.",
    imageAlt: "{name} desktop app, showing the conversion screen and its job queue",
    viewSource: "View source on GitHub"
  },
  stack: {
    title: "Tech stack",
    caption: "{tools} tools · {categories} categories",
    learning: "Learning",
    currentlyLearning: "Currently learning"
  },
  experience: {
    title: "Experience"
  },
  contact: {
    title: "Let's talk",
    description:
      "Bandar Lampung, Indonesia. Open to remote fullstack roles — backend-first — and open to discussing relocation for the right one.",
    available: "Available for new work",
    form: {
      title: "New Message",
      from: "From",
      email: "Email",
      subject: "Subject",
      namePlaceholder: "Your name",
      emailPlaceholder: "your@email.com",
      subjectPlaceholder: "What's on your mind?",
      bodyPlaceholder: "Write your message here...",
      errors: {
        nameRequired: "Name is required",
        emailRequired: "Email is required",
        emailInvalid: "Invalid email",
        subjectRequired: "Subject is required",
        bodyRequired: "Message is required"
      },
      sending: "Sending...",
      sent: "Sent!",
      send: "Send Message",
      shortcut: "Ctrl + Enter",
      unexpected: "Something went wrong. Please try again."
    },
    server: {
      nameRequired: "Name is required.",
      nameTooLong: "Name is too long.",
      emailInvalid: "Please enter a valid email address.",
      emailTooLong: "Email address is too long.",
      subjectRequired: "Subject is required.",
      subjectTooLong: "Subject is too long.",
      bodyRequired: "Message is required.",
      bodyTooLong: "Message is too long (max 5 000 chars).",
      notConfigured: "Mail service is not configured.",
      rateLimited: "You've sent a message recently. Please wait a minute.",
      sent: "Message sent! I'll get back to you soon.",
      failed: "Failed to send message. Please try again later."
    }
  },
  footer: {
    builtWith: "Built with Next.js, Tailwind CSS & Motion"
  },
  notFound: {
    title: "Page not found — Irfana Dwi Fangga",
    message: "This page doesn't exist, or it moved.",
    home: "Back to home",
    contact: "Get in touch"
  }
};

export type Dictionary = typeof en;
