import * as React from "react";

const subscribe = () => () => {};

/**
 * True once the component has hydrated on the client. Implemented with
 * useSyncExternalStore (rather than a useEffect + setState) so it never
 * triggers a synchronous setState-in-effect render.
 */
export function useMounted(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Tracks prefers-reduced-motion via useSyncExternalStore so the browser's
 * media-query state is read the same way on subscribe and on change —
 * no setState-in-effect involved.
 */
export function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * Matches a media query without a setState-in-effect round trip.
 *
 * Server snapshot is `false`, so anything gated on a min-width query renders
 * its small-screen branch during SSR and swaps after hydration — which is what
 * useSyncExternalStore is built for.
 */
export function useMediaQuery(query: string): boolean {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Whether the element is currently within `margin` px of the viewport.
 *
 * Measured from getBoundingClientRect on scroll rather than with an
 * IntersectionObserver, on purpose. The observer's first callback lands before
 * layout has settled — while the document is still short every band reports as
 * intersecting, all five canvases mount, and because IO only re-fires on a
 * *change* the mistake is never corrected until something scrolls. Reading the
 * rect is deterministic and self-correcting.
 *
 * Used to defer mounting decorative canvases: a full-width 414px grid is
 * ~2.5 MB, and five of them are never on screen together.
 */
export function useNearViewport<T extends Element>(
  ref: React.RefObject<T | null>,
  margin = 300,
): boolean {
  const [near, setNear] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const check = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      setNear(r.bottom > -margin && r.top < window.innerHeight + margin);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // re-measure once the page has finished settling (fonts, images)
    const settle = setTimeout(check, 500);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, margin]);

  return near;
}
