import { SectionEntrance } from "@/components/section-entrance";
import { Reveal } from "@/components/reveal";
import { deepDives } from "@/lib/content";
import { TechIcon } from "@/components/tech-icon";

export function DeepDives() {
  return (
    <section id="deep-dives" className="border-t border-border">
      <SectionEntrance
        index="02"
        title="System deep-dives"
        description="Not screenshots — the actual problems, and how they got solved."
      />

      <div className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2">
          {deepDives.map((d, i) => (
            <Reveal key={d.title} delay={i * 0.06}>
              <div className="h-full rounded-lg border border-border bg-surface p-6">
                <p className="font-mono text-xs text-accent">{d.project}</p>
                <h3 className="mt-1.5 text-lg font-semibold tracking-tight">
                  {d.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {d.problem}
                </p>
                <ul className="mt-4 space-y-2">
                  {d.approach.map((a) => (
                    <li
                      key={a}
                      className="flex gap-2 text-sm leading-relaxed text-foreground/85"
                    >
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {a}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {d.stack.map((s) => (
                    <TechIcon key={s} label={s} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
