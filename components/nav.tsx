"use client";

import StaggeredMenu, {
  type StaggeredMenuItem,
  type StaggeredMenuSocialItem
} from "@/components/staggered-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useThemeColors } from "@/lib/use-theme";
import Image from "next/image";

const MENU_ITEMS: StaggeredMenuItem[] = [
  { label: "Home", ariaLabel: "Back to the top", link: "#top" },
  {
    label: "Building",
    ariaLabel: "What I am currently building",
    link: "#building"
  },
  {
    label: "Deep-dives",
    ariaLabel: "Engineering deep-dives",
    link: "#deep-dives"
  },
  { label: "Side project", ariaLabel: "Side project", link: "#side-project" },
  { label: "Stack", ariaLabel: "Tech stack", link: "#stack" },
  { label: "Experience", ariaLabel: "Work experience", link: "#experience" },
  { label: "Contact", ariaLabel: "Get in touch", link: "#contact" }
];

const SOCIAL_ITEMS: StaggeredMenuSocialItem[] = [
  { label: "GitHub", link: "https://github.com/irfanadwifangga" },
  { label: "LinkedIn", link: "https://www.linkedin.com/in/irfanadwifangga" },
  { label: "Email", link: "mailto:irvanadwifangga@gmail.com" }
];

// Prelayers are painted through inline `background`, which accepts var().
// Module-level so StaggeredMenu receives the same array on every render.
const PRELAYER_COLORS = ["var(--surface-2)", "var(--border)"];

// The Menu toggle's colour is tweened by GSAP, which cannot interpolate var(),
// so these two are passed as resolved values once the theme is known.
const TOGGLE_TOKENS = ["muted", "foreground"] as const;

/**
 * Site header: the wordmark, the theme toggle and a single menu toggle.
 *
 * Two layers: a plain fixed strip that supplies the blurred bar (so it spans
 * the full viewport width, which the menu's own max-w-6xl header row does
 * not), and StaggeredMenu above it holding the wordmark, the toggles and the
 * panel. Panel links are ordinary in-page anchors, so the global Lenis click
 * interceptor scrolls them with the shared header offset.
 */
export function Nav() {
  const toggle = useThemeColors(TOGGLE_TOKENS);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-14 border-b border-border/60 bg-background/70 backdrop-blur-md" />

      <StaggeredMenu
        isFixed
        position="right"
        items={MENU_ITEMS}
        socialItems={SOCIAL_ITEMS}
        displaySocials
        displayItemNumbering
        colors={PRELAYER_COLORS}
        accentColor="var(--accent)"
        // var() works for the initial gsap.set; the resolved values replace it
        // before the first open, when the colour is actually tweened.
        menuButtonColor={toggle?.muted ?? "var(--muted)"}
        openMenuButtonColor={toggle?.foreground ?? "var(--foreground)"}
        changeMenuColorOnOpen
        closeOnClickAway
        headerActions={<ThemeToggle />}
        logo={
          <a
            href="#top"
            className="-m-2 rounded-sm p-2 font-mono text-sm font-medium tracking-tight text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none">
            <div className="flex items-center gap-3 hover:text-accent transition-colors">
              <Image src="/icon-512.png" alt="Logo" width={24} height={24} />
              <p>
                irfana<span className="text-accent">.</span>
              </p>
            </div>
          </a>
        }
      />
    </>
  );
}
