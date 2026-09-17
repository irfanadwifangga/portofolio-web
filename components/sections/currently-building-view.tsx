"use client";

import * as React from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import CardSwap, { Card } from "@/components/card-swap";
import { fill } from "@/lib/i18n/locales";
import type { ResolvedProject } from "@/lib/i18n/resolve";
import { useMediaQuery } from "@/lib/use-mounted";

export interface CurrentlyBuildingViewProps {
  /** The projects, already resolved to one language by the server parent. */
  projects: ResolvedProject[];
  /** `showing` fills {name} {index} {total}; `imageAlt` fills {name} {role}. */
  copy: { showing: string; imageAlt: string };
  /**
   * One finished row of tech marks per project, in the same order as
   * `projects`. Rendered by the server parent because @thesvg/react bundles
   * every variant of every icon it is imported with — 18 marks reached this
   * client chunk that way. All three rows are sent even though one shows at a
   * time: they are markup in the initial payload, not modules to download.
   */
  techRows: ReactNode[];
}

/**
 * Split layout: the rotating screenshot stack on the right, and the details of
 * whichever card is currently in front on the left.
 *
 * The two halves are driven by one index that CardSwap reports through
 * onActiveChange, so the copy can never describe a different project than the
 * one on top. Below lg the stack has nowhere to go, so it falls back to a plain
 * list of cards — the same information without the 3D.
 */
export function CurrentlyBuildingView({ projects, techRows, copy }: CurrentlyBuildingViewProps) {
  const [active, setActive] = React.useState(0);
  const project = projects[active] ?? projects[0];
  // Mounted, not merely hidden: `hidden lg:grid` would still leave the gsap
  // timeline and its 5.2s interval running on a phone that can never see it.
  const wideEnough = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      {/* The clip lives here, not on the full-width <section>: the stack is cut
          at the max-w-6xl content boundary the way the React Bits demo cuts its
          cards at the panel border, rather than running on to the edge of the
          screen.

          Clipped on BOTH axes, not just x. The front card's exit animates
          y += 500, which put it ~374px past the section border and left it
          drawing over the next section's entrance. Vertical room is budgeted so
          only the exit is cut, never the resting stack: perspective + the 4deg
          skew push the back card 92px above its own 402px box, and centring it
          in the 520px row leaves it 33px above this container — lg:pt-10 buys that
          back (measured slack: 23px top, 110px bottom). It is lg-scoped because
          the stack only mounts there; the fallback grid below lg needs no
          budget and should keep the section's normal top spacing. */}
      <div className="mx-auto max-w-6xl overflow-clip px-6 pb-24 lg:pt-10">
        {/* ---------- lg and up: detail panel + card stack ---------- */}
        {wideEnough ? (
          <div className="grid lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-10">
            <Reveal className="min-w-0">
              {/* min-h reserves the tallest project's copy so the stack beside it
                never shifts as the text swaps */}
              <div className="min-h-[300px]">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-mono text-base font-medium">
                    {project.name}
                  </h3>
                  <span className="font-mono text-xs text-muted-2">
                    {project.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-accent">{project.role}</p>
                <p className="mt-1 font-mono text-xs text-muted-2">
                  {project.org}
                </p>

                <p className="mt-5 text-sm leading-relaxed text-muted">
                  {project.summary}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {techRows[active]}
                </div>

                {/* Pure indicator. CardSwap has no seek API, so a clickable dot
                  could change the copy without moving the stack — the one thing
                  this layout must never do. */}
                <div className="mt-8 flex items-center gap-2" aria-hidden>
                  {projects.map((p, i) => (
                    <span
                      key={p.name}
                      className={`h-1 rounded-full transition-[width,background-color] duration-300 ease-out ${
                        i === active ? "w-6 bg-accent" : "w-3 bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="sr-only" aria-live="polite">
                  {fill(copy.showing, { name: project.name, index: active + 1, total: projects.length })}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="min-w-0">
              {/* Pinned to the left of its column and allowed to run off the
                  right. The clipping is the point: only the top-left of the
                  stack is meant to be visible, and the container above cuts it
                  at the content boundary. shrink-0 on CardSwap matters — as a
                  flex item it would otherwise collapse to the column width, and
                  because its cards are centred with left-1/2 that spread them
                  back over the copy. */}
              <div className="flex min-h-[520px] items-center justify-start">
                <CardSwap
                  className="shrink-0"
                  width={840}
                  height={402}
                  cardDistance={46}
                  verticalDistance={54}
                  delay={3200}
                  skewAmount={4}
                  easing="elastic"
                  pauseOnHover
                  onActiveChange={setActive}
                >
                  {projects.map((p) => (
                    <Card key={p.name}>
                      {/* Explicit dimensions rather than `fill`: with a fixed px
                        `sizes` Next capped the srcset at 640w, so a 2x display
                        rendering a 460px card got a 1.4x source. width/height
                        emits proper 1x/2x candidates instead. */}
                      <Image
                        src={p.image}
                        alt={fill(copy.imageAlt, { name: p.name, role: p.role })}
                        width={840}
                        height={402}
                        className="h-full w-full object-contain"
                      />
                    </Card>
                  ))}
                </CardSwap>
              </div>
            </Reveal>
          </div>
        ) : (
          /* ---------- below lg: no room for the stack ---------- */
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <div className="h-full overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-accent/50">
                  <div className="relative aspect-[2.09] border-b border-border">
                    <Image
                      src={p.image}
                      alt={fill(copy.imageAlt, { name: p.name, role: p.role })}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-mono text-sm font-medium">
                        {p.name}
                      </h3>
                      <span className="font-mono text-xs text-muted-2">
                        {p.period}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-accent">{p.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {p.summary}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {techRows[i]}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
