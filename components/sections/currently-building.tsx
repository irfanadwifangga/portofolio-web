import { Fragment } from "react";
import { SectionEntrance } from "@/components/section-entrance";
import { TechIcon } from "@/components/tech-icon";
import { CurrentlyBuildingView } from "@/components/sections/currently-building-view";
import { projects } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { resolveProject } from "@/lib/i18n/resolve";

/**
 * Server half of the section.
 *
 * It renders the tech marks: TechIcon reaches lib/tech-icons, and
 * @thesvg/react packs every variant of an icon into whichever chunk imports it,
 * so pulling that into the client component below cost 18 marks' worth of
 * unused path data in the first-load bundle. It also resolves the projects to
 * one language, so the client chunk never carries both. Everything stateful
 * lives in CurrentlyBuildingView.
 */
export function CurrentlyBuilding({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).building;
  const techRows = projects.map((p) => (
    <Fragment key={p.name}>
      {p.stack.map((s) => (
        <TechIcon key={s} label={s} />
      ))}
    </Fragment>
  ));

  return (
    <section id="building" className="border-t border-border">
      <SectionEntrance index="01" title={t.title} description={t.description} />

      <CurrentlyBuildingView
        projects={projects.map((p) => resolveProject(p, locale))}
        techRows={techRows}
        copy={{ showing: t.showing, imageAlt: t.imageAlt }}
      />
    </section>
  );
}
