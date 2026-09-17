import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDictionary } from "@/lib/i18n";
import { otherLocale, pathFor, type Locale } from "@/lib/i18n/locales";

/**
 * The 404 page in one language.
 *
 * app/global-not-found.tsx renders it once per language, and CSS shows only
 * the one matching <html lang>. It is kept light on purpose: no WebGL, canvas,
 * GSAP or smooth scroll. A visitor who lands here wants a way back, not a demo.
 */
export function NotFound({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const home = pathFor(locale);
  const target = otherLocale(locale);

  return (
    <div data-locale={locale} lang={locale} className="flex min-h-screen flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <a
            href={home}
            className="-m-2 rounded-sm p-2 font-mono text-sm font-medium tracking-tight text-foreground transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none">
            irfana<span className="text-accent">.</span>
          </a>
          <div className="flex items-center gap-5">
            <LanguageToggle
              targetLocale={target}
              href={pathFor(target)}
              label={t.language.label}
              switchLabel={t.language.switchLabel}
            />
            <ThemeToggle labels={t.theme} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p aria-hidden className="font-pixel text-6xl leading-none text-foreground sm:text-8xl">
          404
        </p>
        <h1 className="mt-8 text-lg text-muted">{t.notFound.message}</h1>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={home}
            className="rounded-md border border-transparent bg-foreground px-5 py-2.5 font-mono text-sm font-medium text-background transition-[opacity,transform] duration-150 ease-out hover:opacity-85 active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none">
            {t.notFound.home}
          </a>
          <a
            href={locale === "en" ? "/#contact" : `${home}#contact`}
            className="rounded-md border border-border bg-background px-5 py-2.5 font-mono text-sm text-foreground transition-[border-color,transform] duration-150 ease-out hover:border-accent active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none">
            {t.notFound.contact}
          </a>
        </div>
      </main>
    </div>
  );
}
