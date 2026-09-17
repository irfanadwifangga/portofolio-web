import { SectionEntrance } from "@/components/section-entrance";
import { Reveal } from "@/components/reveal";
import { ContactForm } from "@/components/contact-form";
import { Github, Linkedin } from "@thesvg/react";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

const PROFILES = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/irfanadwifangga",
    Icon: Linkedin
  },
  {
    label: "GitHub",
    href: "https://github.com/irfanadwifangga",
    Icon: Github
  }
];

/** Arrow-up-right. 1.5px stroke to sit at the optical weight of the label beside it. */
function ExternalArrow() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 opacity-60 transition-[opacity,transform] duration-150 ease-out group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-100">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

/**
 * Closing section.
 *
 * The email display card is replaced by a Gmail-style compose form that sends
 * messages directly to the inbox via a server action. The social profiles
 * remain as quiet secondary links below the form.
 */
export function Contact({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.contact;

  return (
    <section id="contact" className="border-t border-border">
      <SectionEntrance index="06" title={t.title} description={t.description} />

      <div className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <ContactForm locale={locale} copy={t.form} />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-6 flex items-center justify-center gap-6">
            {PROFILES.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-11 items-center gap-2 rounded-md px-3 font-mono text-sm text-muted transition-colors duration-150 ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none">
                <Icon width={16} height={16} aria-hidden className="shrink-0 [&_*]:fill-current" />
                {label}
                <ExternalArrow />
                <span className="sr-only">{dictionary.common.newTab}</span>
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mt-10 flex items-center justify-center gap-2 font-mono text-xs text-muted-2">
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 light:bg-emerald-600" />
            </span>
            {t.available}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
