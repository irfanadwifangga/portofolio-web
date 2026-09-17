import { TechIcon } from "@/components/tech-icon";
import type { ResolvedDeepDive } from "@/lib/i18n/resolve";

/**
 * One problem-and-approach write-up, already resolved to one language.
 *
 * Shared by the client-work grid and the side project section, so the two read
 * as the same kind of evidence. `showProject` is off inside the side project
 * section, where naming the project on every card would only repeat the
 * heading directly above them.
 */
export function DeepDiveCard({
  dive,
  showProject = true
}: {
  dive: ResolvedDeepDive;
  showProject?: boolean;
}) {
  return (
    <div className="h-full rounded-lg border border-border bg-surface p-6">
      {showProject ? (
        <p className="mb-1.5 font-mono text-xs text-accent">{dive.project}</p>
      ) : null}
      <h3 className="text-lg font-semibold tracking-tight">{dive.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{dive.problem}</p>
      <ul className="mt-4 space-y-2">
        {dive.approach.map((a) => (
          <li key={a} className="flex gap-2 text-sm leading-relaxed text-foreground/85">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
            {a}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {dive.stack.map((s) => (
          <TechIcon key={s} label={s} />
        ))}
      </div>
    </div>
  );
}
