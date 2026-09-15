"use client";

import dynamic from "next/dynamic";
import Shuffle from "@/components/shuffle";
import * as React from "react";
import { usePrefersReducedMotion, useNearViewport } from "@/lib/use-mounted";

// Client-only: ShapeGrid measures its canvas on mount and drives a rAF loop.
const ShapeGrid = dynamic(() => import("@/components/shape-grid"), {
  ssr: false
});

/**
 * The band you pass through on the way into a section.
 *
 * The grid is scoped to this band — it is the entrance's backdrop, not a page
 * background — and fades into the page colour at both edges so the band reads
 * as a moment rather than a panel with hard seams. ShapeGrid parks its rAF
 * loop when off screen, and the canvas is not even mounted until the band is
 * within 400px of the viewport — so only the band you are near costs anything.
 *
 * The title is the entrance: big, and shuffled into place by its own
 * ScrollTrigger as the band crosses the viewport.
 */
export function SectionEntrance({
  index,
  title,
  description
}: {
  index: string;
  title: string;
  description?: string;
}) {
  const bandRef = React.useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  // Each grid canvas is ~2.5 MB. Mounting all of them up front (five when measured) meant ~12.5 MB
  // sitting idle for backdrops that are never on screen together.
  const nearViewport = useNearViewport(bandRef);

  return (
    <div
      ref={bandRef}
      className="relative isolate flex min-h-[46vh] items-center overflow-hidden py-16">
      {!reducedMotion && nearViewport && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [&_*]:!pointer-events-none">
          <ShapeGrid
            direction="diagonal"
            speed={0.3}
            squareSize={46}
            shape="square"
            borderColor="#1b1d23"
            hoverFillColor="#12203f"
            hoverTrailAmount={0}
            vignetteColor="#08090b"
          />
          {/* fade the band into the sections above and below it */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl px-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
          <p className="font-mono text-xs text-accent">{index}</p>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
        </div>

        {/* Settings mirror the React Bits playground preset: right / back.out(1.1)
            / 0.75s / 5 shuffles / 0.1s stagger / hover replay on. The pixel face
            is why the sizes are smaller than a normal display heading — Press
            Start 2P has a very wide advance, so 48px already runs ~780px for the
            longest title. */}
        <Shuffle
          key={title}
          text={title}
          tag="h2"
          textAlign="center"
          className="mt-6 font-pixel text-2xl leading-[1.35] sm:text-3xl lg:text-[2.75rem]"
          shuffleDirection="right"
          duration={0.75}
          ease="back.out(1.1)"
          shuffleTimes={5}
          stagger={0.1}
          threshold={0.25}
          rootMargin="-60px"
          triggerOnce
          triggerOnHover
          respectReducedMotion
        />

        {description ? (
          <p className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
