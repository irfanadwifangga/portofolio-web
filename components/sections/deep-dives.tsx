import { SectionEntrance } from "@/components/section-entrance";
import { Reveal } from "@/components/reveal";
import { DeepDiveCard } from "@/components/deep-dive-card";
import { deepDives } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { resolveDeepDive } from "@/lib/i18n/resolve";

export function DeepDives({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).deepDives;

  return (
    <section id="deep-dives" className="border-t border-border">
      <SectionEntrance index="02" title={t.title} description={t.description} />

      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2">
          {deepDives.map((d, i) => (
            <Reveal key={d.title.en} delay={i * 0.06}>
              <DeepDiveCard dive={resolveDeepDive(d, locale)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
