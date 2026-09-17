import { SectionEntrance } from "@/components/section-entrance";
import { Reveal } from "@/components/reveal";
import { experience } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { formatPeriod } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/locales";

export function Experience({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).experience;

  return (
    <section id="experience" className="border-t border-border">
      <SectionEntrance index="05" title={t.title} />

      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative border-l border-border pl-8">
          {experience.map((e, i) => (
            <Reveal key={e.org} delay={i * 0.06}>
              {/* Not `last:pb-0`: each entry sits in its own Reveal wrapper, so
                  every one of them is a :last-child and the variant killed the
                  spacing on all four. Index check instead. */}
              <div
                className={`relative ${i === experience.length - 1 ? "" : "pb-14"}`}
              >
                <span className="absolute -left-[2.05rem] top-1 h-2 w-2 rounded-full bg-accent ring-4 ring-background" />
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-mono text-sm font-medium">{e.org}</h3>
                  <span className="font-mono text-xs text-muted-2">
                    {formatPeriod(e.period, locale)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-accent">{e.role[locale]}</p>
                <p className="mt-1 text-xs text-muted-2">{e.location[locale]}</p>
                <ul className="mt-5 space-y-2.5">
                  {e.bullets[locale].map((b) => (
                    <li
                      key={b}
                      className="flex gap-2 text-sm leading-relaxed text-muted"
                    >
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-border" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
