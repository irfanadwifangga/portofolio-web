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
    // No offset: Lenis already honours the section's scroll-margin-top (3.5rem,
    // the header height). Passing HEADER_OFFSET as well landed every menu click
    // 56px too low, measured at 112px below the viewport top instead of 56px.
    instance.scrollTo(target as HTMLElement);
  } else {
    const top =
      (target as HTMLElement).getBoundingClientRect().top +
      window.scrollY +
      HEADER_OFFSET;
    window.scrollTo({ top, behavior: "auto" });
  }
  history.replaceState(null, "", hash);
}
