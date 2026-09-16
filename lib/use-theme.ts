"use client";

import * as React from "react";
import { getTheme, subscribe, type Theme } from "@/lib/theme";

/**
 * The current theme, or null before hydration.
 *
 * The server cannot know a visitor's theme, so its snapshot is null and the
 * hydrating render matches it; the real value arrives immediately after.
 * Markup that must already look right in the first paint picks with the
 * light:/dark: CSS variants instead of reading this.
 */
export function useTheme(): Theme | null {
  return React.useSyncExternalStore(subscribe, getTheme, () => null);
}

/**
 * Resolved values of the named custom properties, re-read on every theme
 * change. Only for consumers that cannot take `var(--token)`: canvases, the
 * WebGL tint, and colours GSAP interpolates. Null until the theme is known.
 *
 * `names` must be a module-level constant; a fresh array each render would
 * recompute on every render.
 */
export function useThemeColors<T extends string>(
  names: readonly T[]
): Record<T, string> | null {
  const theme = useTheme();
  return React.useMemo(() => {
    if (theme === null) return null;
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(
      names.map((name) => [name, style.getPropertyValue(`--${name}`).trim()])
    ) as Record<T, string>;
  }, [theme, names]);
}
