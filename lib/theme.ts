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

export function toggleTheme(): Theme {
  const systemDark = systemPrefersDark();
  const current = getTheme() ?? resolveTheme(readStored(), systemDark);
  const { next, stored } = storedAfterToggle(current, systemDark);
  try {
    if (stored) localStorage.setItem(STORAGE_KEY, stored);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage is unavailable; the theme still applies for this page view.
  }
  applyTheme(next);
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
