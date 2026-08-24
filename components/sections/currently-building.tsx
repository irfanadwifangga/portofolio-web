import { Fragment } from "react";
import { SectionEntrance } from "@/components/section-entrance";
import { TechIcon } from "@/components/tech-icon";
import { CurrentlyBuildingView } from "@/components/sections/currently-building-view";
import { projects } from "@/lib/content";

/**
 * Server half of the section.
 *
 * Its only job is to render the tech marks — TechIcon reaches lib/tech-icons,
 * and @thesvg/react packs every variant of an icon into whichever chunk imports
 * it, so pulling that into the client component below cost 18 marks' worth of
 * unused path data in the first-load bundle. Everything stateful lives in
 * CurrentlyBuildingView; this file just hands it finished markup.
 */
export function CurrentlyBuilding() {
  const techRows = projects.map((p) => (
    <Fragment key={p.name}>
      {p.stack.map((s) => (
        <TechIcon key={s} label={s} />
      ))}
    </Fragment>
  ));

  return (
    <section id="building" className="border-t border-border">
      <SectionEntrance
        index="01"
        title="Currently building"
        description="Three production systems, running concurrently, all backend-first."
      />

      <CurrentlyBuildingView techRows={techRows} />
    </section>
  );
}
