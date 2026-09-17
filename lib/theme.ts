/**
 * Theme state for the whole site.
 *
 * The single source of truth is the `data-theme` attribute on <html>. CSS,
 * canvases and GSAP all read it; React subscribes to it rather than keeping a
 * second copy that could disagree.
 *
 * This file deliberately has no imports. The boot script below is built from
 * a function in it, and node's test runner loads it directly.
 */

export type Theme = "light" | "dark";

export const STORAGE_KEY = "theme";

const SYSTEM_DARK = "(prefers-color-scheme: dark)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** How long the new theme takes to grow out of the toggle, in milliseconds. */
const REVEAL_MS = 500;

/** The theme a visitor sees: an explicit stored choice wins, otherwise the OS. */
export function resolveTheme(stored: string | null, systemDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return systemDark ? "dark" : "light";
}

/**
 * What a toggle stores. Picking the theme the OS already asks for clears the
 * override, so the site follows the system again and one mistaken click never
 * locks a visitor in.
 */
export function storedAfterToggle(
  current: Theme,
  systemDark: boolean
): { next: Theme; stored: Theme | null } {
  const next: Theme = current === "dark" ? "light" : "dark";
  const system: Theme = systemDark ? "dark" : "light";
  return { next, stored: next === system ? null : next };
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // private windows and blocked storage
  }
}

function systemPrefersDark(): boolean {
  return window.matchMedia(SYSTEM_DARK).matches;
}

export function getTheme(): Theme | null {
  const theme = document.documentElement.dataset.theme;
  return theme === "light" || theme === "dark" ? theme : null;
}

/**
 * Applies a theme with every CSS transition suppressed until a frame has been
 * painted. Without this, elements with transition-colors animate at their own
 * speeds and the page briefly shows a mix of both themes.
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.setAttribute("data-theme-switching", "");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  // Reading a computed style flushes the change before the marker is removed.
  void getComputedStyle(root).backgroundColor;
  // Two frames: removing the marker after one frame is not guaranteed to leave
  // a painted frame with transitions off.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute("data-theme-switching"))
  );
}

/** The radius a circle centred at (x, y) needs to cover a width × height viewport. */
export function revealRadius(x: number, y: number, width: number, height: number): number {
  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
}

/** A point in viewport coordinates, such as the centre of the clicked toggle. */
export type Origin = { x: number; y: number };

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

/**
 * A theme picked by a click whose view transition has not applied it yet. The
 * browser runs the update callback a frame later, so a second click in that
 * frame must toggle from here, not from the attribute.
 */
let pending: Theme | null = null;

/**
 * Applies a theme by growing it out of `origin` as a circle. The browser
 * snapshots the old view, applyTheme runs inside the update callback, and the
 * live new view is clipped open over the snapshot. Without the API, without an
 * origin, or when the visitor prefers reduced motion, it swaps at once.
 */
function revealTheme(theme: Theme, origin: Origin | undefined): void {
  const doc = document as ViewTransitionDocument;
  if (!origin || typeof doc.startViewTransition !== "function" || window.matchMedia(REDUCED_MOTION).matches) {
    pending = null;
    applyTheme(theme);
    return;
  }
  pending = theme;
  // Starting a transition skips one still running; its callback still applies.
  const transition = doc.startViewTransition(() => {
    if (pending === theme) pending = null;
    applyTheme(theme);
  });
  const { x, y } = origin;
  const radius = revealRadius(x, y, window.innerWidth, window.innerHeight);
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: REVEAL_MS, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
      );
    })
    .catch(() => {
      // Skipped by a newer click; the theme was still applied.
    });
}

export function toggleTheme(origin?: Origin): Theme {
  const systemDark = systemPrefersDark();
  const current = pending ?? getTheme() ?? resolveTheme(readStored(), systemDark);
  const { next, stored } = storedAfterToggle(current, systemDark);
  try {
    if (stored) localStorage.setItem(STORAGE_KEY, stored);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is unavailable; the theme still applies for this page view.
  }
  revealTheme(next, origin);
  return next;
}

/** Follows OS theme changes while no choice is stored. Returns a cleanup. */
export function followSystem(): () => void {
  const query = window.matchMedia(SYSTEM_DARK);
  const onChange = () => {
    const stored = readStored();
    if (stored === "light" || stored === "dark") return;
    applyTheme(query.matches ? "dark" : "light");
  };
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Calls `onChange` whenever `data-theme` changes. Returns an unsubscribe. */
export function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
  return () => observer.disconnect();
}

/**
 * Runs before first paint from an inline <script> in <head>. It repeats the
 * resolveTheme rule instead of calling it because it must be self-contained;
 * tests/theme.test.mjs proves the two agree for every input.
 */
function boot(key: string) {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(key);
  } catch {}
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored === "light" || stored === "dark" ? stored : systemDark ? "dark" : "light";
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export const BOOT_SCRIPT = `(${boot.toString()})(${JSON.stringify(STORAGE_KEY)})`;
