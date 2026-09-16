"use client";

import ClickSpark from "@/components/click-spark";
import { usePrefersReducedMotion } from "@/lib/use-mounted";
import { useThemeColors } from "@/lib/use-theme";

const ACCENT = ["accent"] as const;

/**
 * Wrapper that supplies ClickSpark with the accent colour and motion policy.
 *
 * The canvas paints with a resolved colour string and cannot read CSS
 * variables, so the accent comes from useThemeColors and follows the theme.
 * Until the theme is known the sparks are transparent. Under
 * prefers-reduced-motion the spark count drops to 0, which keeps the component
 * mounted (no remount of the whole tree) while emitting nothing.
 */
export function SparkLayer({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const colors = useThemeColors(ACCENT);

  return (
    <ClickSpark
      sparkColor={colors?.accent ?? "transparent"}
      sparkSize={9}
      sparkRadius={16}
      sparkCount={reducedMotion ? 0 : 8}
      duration={420}
      easing="ease-out">
      {children}
    </ClickSpark>
  );
}
