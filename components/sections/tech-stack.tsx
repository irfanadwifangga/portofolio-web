import { SectionEntrance } from "@/components/section-entrance";
import { Reveal } from "@/components/reveal";
import { TechOrbit } from "@/components/tech-orbit";
import { OrbitMark, GridMark } from "@/components/orbit-mark";
import { techGroups, learningStack } from "@/lib/tech-stack";

const all = [...techGroups.flatMap((g) => g.items), ...learningStack];

// Split so neither ring is crowded, and so the two rings read as different
// densities rather than a single blurred band.
const outerItems = all.filter((_, i) => i % 2 === 1);
const innerItems = all.filter((_, i) => i % 2 === 0);

/**
 * This component owns every icon on the page's stack section.
 *
 * TechOrbit is a client component, so the marks are rendered here and passed
 * down as finished nodes — importing @thesvg/react across that boundary put
 * 323 KB of unused icon variants into the first-load bundle.
 */
export function TechStack() {
  return (
    <section id="stack" className="border-t border-border">
      <SectionEntrance index="03" title="Tech stack" />

      <div className="mx-auto max-w-6xl px-6 pb-24">
        {/* OrbitImages marks its container aria-hidden, so on its own the orbit
            would delete the whole stack from the accessibility tree — this is
            portfolio content, not decoration. The list below is the real
            content; the orbit is the presentation layer over it. */}
        <ul className="sr-only">
          {techGroups.map((group) => (
            <li key={group.category}>
              {group.category}: {group.items.map((i) => i.name).join(", ")}
            </li>
          ))}
          <li>Currently learning: {learningStack.map((i) => i.name).join(", ")}</li>
        </ul>

        <Reveal delay={0.05}>
          <TechOrbit
            outer={outerItems.map((t) => (
              <OrbitMark key={t.name} name={t.name} Icon={t.Icon} />
            ))}
            inner={innerItems.map((t) => (
              <OrbitMark key={t.name} name={t.name} Icon={t.Icon} />
            ))}
            grid={all.map((t) => (
              <GridMark key={t.name} name={t.name} Icon={t.Icon} />
            ))}
            caption={`${all.length} tools · ${techGroups.length} categories`}
          />
        </Reveal>

        {/* The orbit is the visual; this stays as the scannable version, since
            "which database does he use" is a question the orbit cannot answer. */}
        <Reveal delay={0.1}>
          <dl className="mt-10 grid gap-x-10 gap-y-7 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {techGroups.map((group) => (
              <div key={group.category} className="flex flex-col gap-2">
                <dt className="font-mono text-2xs tracking-[0.14em] text-muted-2 uppercase">
                  {group.category}
                </dt>
                <dd className="font-mono text-sm leading-relaxed text-foreground/85">
                  {group.items.map((i) => i.name).join(" · ")}
                </dd>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <dt className="font-mono text-2xs tracking-[0.14em] text-amber-400/80 uppercase">
                Learning
              </dt>
              <dd className="font-mono text-sm leading-relaxed text-foreground/85">
                {learningStack.map((i) => i.name).join(" · ")}
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
