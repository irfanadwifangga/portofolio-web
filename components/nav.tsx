"use client";

import StaggeredMenu, {
  type StaggeredMenuItem,
  type StaggeredMenuSocialItem
} from "@/components/staggered-menu";
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
  { label: "Stack", ariaLabel: "Tech stack", link: "#stack" },
  { label: "Experience", ariaLabel: "Work experience", link: "#experience" },
  { label: "Contact", ariaLabel: "Get in touch", link: "#contact" }
];

const SOCIAL_ITEMS: StaggeredMenuSocialItem[] = [
  { label: "GitHub", link: "https://github.com/irfanadwifangga" },
  { label: "LinkedIn", link: "https://www.linkedin.com/in/irfanadwifangga" },
  { label: "Email", link: "mailto:irvanadwifangga@gmail.com" }
];

/**
 * Site header: the wordmark and a single menu toggle, nothing else — the
 * section rail and this panel carry navigation now.
 *
 * Two layers: a plain fixed strip that supplies the blurred bar (so it spans
 * the full viewport width, which the menu's own max-w-6xl header row does
 * not), and StaggeredMenu above it holding the wordmark, the toggle and the
 * panel. Panel links are ordinary in-page anchors, so the global Lenis click
 * interceptor scrolls them with the shared header offset.
 */
export function Nav() {
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
        colors={["#16171b", "#1f2228"]}
        accentColor="#5b8def"
        menuButtonColor="#9ca3af"
        openMenuButtonColor="#edeef0"
        changeMenuColorOnOpen
        closeOnClickAway
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
