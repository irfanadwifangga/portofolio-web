"use client";

import ClickSpark from "@/components/click-spark";
import { usePrefersReducedMotion } from "@/lib/use-mounted";

/**
 * Wrapper that supplies ClickSpark with the accent colour and motion policy.
 *
 * The canvas paints with a resolved colour string, so it cannot read the CSS
 * variables the rest of the site uses — the accent is hard-coded to match
 * --accent. Under prefers-reduced-motion the spark count drops to 0, which
 * keeps the component mounted (no remount of the whole tree) while emitting
 * nothing.
 */
export function SparkLayer({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <ClickSpark
      sparkColor="#5b8def"
      sparkSize={9}
      sparkRadius={16}
      sparkCount={reducedMotion ? 0 : 8}
      duration={420}
      easing="ease-out">
      {children}
    </ClickSpark>
  );
}
