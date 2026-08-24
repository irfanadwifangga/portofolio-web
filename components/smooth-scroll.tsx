"use client";

import * as React from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "@/lib/use-mounted";
import { registerLenis, scrollToSection } from "@/lib/scroll-to";

/**
 * Momentum smooth scrolling.
 *
 * Lenis drives scroll itself, so the CSS `scroll-behavior: smooth` and the
 * browser's native anchor jump both have to get out of the way — in-page
 * anchors are intercepted and routed through scrollToSection, which applies
 * the fixed-header offset that `scroll-margin-top` handles natively.
 *
 * Disabled entirely under prefers-reduced-motion: hijacking scroll is exactly
 * the kind of motion that setting exists to opt out of. In that mode anchors
 * fall back to native jumps and the CSS scroll-margin takes over again.
 */
export function SmoothScroll() {
  const reducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.6
    });
    registerLenis(lenis);

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const link = (e.target as HTMLElement).closest?.("a");
      const href = link?.getAttribute("href");
      if (!href?.startsWith("#") || href === "#") return;
      if (!document.querySelector(href)) return;
      e.preventDefault();
      scrollToSection(href);
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
      registerLenis(null);
    };
  }, [reducedMotion]);

  return null;
}
