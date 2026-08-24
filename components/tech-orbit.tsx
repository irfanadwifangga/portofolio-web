"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useMediaQuery } from "@/lib/use-mounted";

const OrbitImages = dynamic(() => import("@/components/orbit-images"), {
  ssr: false
});

export interface TechOrbitProps {
  /** Pre-rendered marks for the outer ring. */
  outer: ReactNode[];
  /** Pre-rendered marks for the inner, counter-rotating ring. */
  inner: ReactNode[];
  /** Pre-rendered marks for the below-sm fallback grid. */
  grid: ReactNode[];
  /** Centre caption, e.g. "34 tools · 6 categories". */
  caption: ReactNode;
}

/**
 * The tech stack as two counter-rotating elliptical orbits.
 *
 * Takes finished nodes rather than icon components on purpose. This is a client
 * component, so importing the icons here would pull every @thesvg/react module
 * — and all of their unused variants — into the first-load bundle; see
 * components/orbit-mark.tsx for the measurement. The marks arrive already
 * rendered by the server, and this file only decides where they orbit.
 *
 * The categorised list that used to live here moved up to the section for the
 * same reason: it reads names off lib/tech-stack, which carries icon
 * components, and importing it here would have undone the whole exercise.
 */
export function TechOrbit({ outer, inner, grid, caption }: TechOrbitProps) {
  // Mounted, not just hidden: CSS `hidden` still leaves both orbits running
  // their motion loops on phones, animating something nobody can see.
  const wideEnough = useMediaQuery("(min-width: 640px)");

  if (!wideEnough) {
    return <div className="flex flex-wrap justify-center gap-3">{grid}</div>;
  }

  return (
    <div className="relative mx-auto h-[560px] max-w-5xl overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-full -translate-x-1/2 -translate-y-1/2">
        <OrbitImages
          items={outer}
          shape="ellipse"
          baseWidth={1400}
          radiusX={640}
          radiusY={300}
          rotation={-8}
          duration={54}
          itemSize={88}
          responsive
        />
      </div>

      <div className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-full -translate-x-1/2 -translate-y-1/2">
        <OrbitImages
          items={inner}
          shape="ellipse"
          baseWidth={1400}
          radiusX={400}
          radiusY={180}
          rotation={-8}
          duration={38}
          direction="reverse"
          itemSize={88}
          responsive
        />
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="font-mono text-xs text-muted-2">{caption}</p>
      </div>
    </div>
  );
}
