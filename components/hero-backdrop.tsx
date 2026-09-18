"use client";

import dynamic from "next/dynamic";
import { useMounted, usePrefersReducedMotion } from "@/lib/use-mounted";
import { useTheme, useThemeColors } from "@/lib/use-theme";

// Client-only: FaultyTerminal reads window.devicePixelRatio in a default param,
// which would throw during SSR.
const FaultyTerminal = dynamic(() => import("@/components/faulty-terminal"), {
  ssr: false
});

const ACCENT = ["accent"] as const;

// Glyph intensity per theme. The light value is tuned against screenshots.
const BRIGHTNESS = { dark: 0.5, light: 0.5 } as const;

/**
 * Hero backdrop — React Bits "Faulty Terminal".
 *
 * Named for what it is, not what it replaced: this was once a ShaderGradient,
 * and the file kept that name long after the library was removed.
 *
 * Kept deliberately dim: it sits behind the name and the code panel, so it has
 * to read as texture, never as a competing element. A scrim fades it into the
 * section boundary, and the whole subtree is pointer-events:none so it can
 * never swallow scroll the way the old ShaderGradient did.
 *
 * The tint follows --accent and the canvas is transparent (see
 * faulty-terminal.tsx), so the same backdrop sits on either theme.
 */
export function HeroBackdrop() {
  const mounted = useMounted();
  const reducedMotion = usePrefersReducedMotion();
  const theme = useTheme();
  const colors = useThemeColors(ACCENT);

  // The theme, and so the colours, are only known after mount.
  if (!mounted || !theme || !colors) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [&_*]:!pointer-events-none">
      <FaultyTerminal
        dpr={1}
        scale={1.6}
        gridMul={[2, 1]}
        digitSize={1.4}
        timeScale={reducedMotion ? 0 : 0.28}
        pause={reducedMotion}
        scanlineIntensity={0.32}
        glitchAmount={0.7}
        flickerAmount={0.6}
        noiseAmp={0.9}
        curvature={0.12}
        tint={colors.accent}
        mouseReact={false}
        pageLoadAnimation={!reducedMotion}
        brightness={BRIGHTNESS[theme]}
        className="h-full w-full"
      />
      {/* legibility scrim — keeps text contrast intact and hides the hard edge */}
      <div className="absolute inset-0 bg-background/65" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
