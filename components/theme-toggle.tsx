"use client";

import * as React from "react";
import { followSystem, toggleTheme } from "@/lib/theme";
import type { Dictionary } from "@/lib/i18n";
import { useTheme } from "@/lib/use-theme";

const ICON_CLASS =
  "absolute h-[18px] w-[18px] transition-[opacity,rotate] duration-200 ease-out motion-reduce:transition-none";

/**
 * Switches between light and dark.
 *
 * The icon shows where a click takes you: a sun while dark, a moon while
 * light. Both icons are always rendered and the light: variant decides which
 * is visible, so the server's markup never depends on a theme it cannot know.
 * They carry data-theme-motion so the swap rule in globals.css leaves their
 * cross-fade running.
 */
export function ThemeToggle({ labels }: { labels: Dictionary["theme"] }) {
  const theme = useTheme();

  // Nav, and therefore this button, is on every page, so following OS theme
  // changes lives here rather than in a component of its own.
  React.useEffect(() => followSystem(), []);

  const label = theme === null ? labels.unknown : theme === "dark" ? labels.toLight : labels.toDark;

  return (
    <button
      type="button"
      data-theme-toggle
      onClick={() => toggleTheme()}
      aria-label={label}
      className="relative -m-2.5 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-muted transition-[color,scale] duration-150 ease-out hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none active:scale-[0.96]">
      <svg
        data-theme-motion
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={`${ICON_CLASS} rotate-0 opacity-100 light:-rotate-90 light:opacity-0`}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        data-theme-motion
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={`${ICON_CLASS} rotate-90 opacity-0 light:rotate-0 light:opacity-100`}>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  );
}
