import { SectionEntrance } from "@/components/section-entrance";
import { Reveal } from "@/components/reveal";
import { DeepDiveCard } from "@/components/deep-dive-card";
import { deepDives } from "@/lib/content";

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
              <DeepDiveCard dive={d} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
