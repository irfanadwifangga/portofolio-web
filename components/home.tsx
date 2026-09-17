import { Nav } from "@/components/nav";
import { SectionRail } from "@/components/section-rail";
import { Hero } from "@/components/sections/hero";
import { CurrentlyBuilding } from "@/components/sections/currently-building";
import { DeepDives } from "@/components/sections/deep-dives";
import { SideProject } from "@/components/sections/side-project";
import { TechStack } from "@/components/sections/tech-stack";
import { Experience } from "@/components/sections/experience";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/footer";
import { MarkDefs } from "@/lib/marks";
import { getDictionary } from "@/lib/i18n";
import { otherLocale, pathFor, type Locale } from "@/lib/i18n/locales";

/**
 * The whole one-page site in one language.
 *
 * The section rail lives here rather than in the document, because it points
 * at this page's sections and has nothing to point at on the 404 page.
 */
export function Home({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const target = otherLocale(locale);

  return (
    <>
      <MarkDefs />
      <SectionRail labels={t.sections} />
      <Nav
        copy={{
          sections: t.sections,
          menu: t.menu,
          theme: t.theme,
          language: t.language,
          languageTarget: { locale: target, href: pathFor(target) },
          logoAlt: t.common.logoAlt
        }}
      />
      <main className="flex-1">
        <Hero locale={locale} />
        <CurrentlyBuilding locale={locale} />
        <DeepDives locale={locale} />
        <SideProject locale={locale} />
        <TechStack locale={locale} />
        <Experience locale={locale} />
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
    </>
  );
}
