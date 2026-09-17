import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { SITE_NAME } from "@/lib/site";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).footer;

  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 font-mono text-xs text-muted-2 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {SITE_NAME}
        </span>
        <span>{t.builtWith}</span>
      </div>
    </footer>
  );
}
