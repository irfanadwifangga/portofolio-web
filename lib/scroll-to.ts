import type Lenis from "lenis";

const HEADER_OFFSET = -56; // h-14 fixed header

let instance: Lenis | null = null;

/** SmoothScroll owns the Lenis lifecycle and registers it here. */
export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
}

/**
 * Single entry point for in-page navigation.
 *
 * Uses Lenis when it is running so rail clicks, nav clicks and wheel scrolling
 * all share one motion model. Falls back to native scrolling when Lenis is
 * absent — which is the case under prefers-reduced-motion, where the jump
 * should be instant anyway.
 */
export function scrollToSection(hash: string) {
  const target = document.querySelector(hash);
  if (!target) return;

  if (instance) {
    instance.scrollTo(target as HTMLElement, { offset: HEADER_OFFSET });
  } else {
    const top =
      (target as HTMLElement).getBoundingClientRect().top +
      window.scrollY +
      HEADER_OFFSET;
    window.scrollTo({ top, behavior: "auto" });
  }
  history.replaceState(null, "", hash);
}
