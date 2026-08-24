"use client";

import LineSidebar from "@/components/line-sidebar";
import { scrollToSection } from "@/lib/scroll-to";
import { useActiveSection } from "@/lib/use-active-section";

const HASHES = ["#top", "#building", "#deep-dives", "#stack", "#experience", "#contact"];

const SECTIONS = [
  { label: "Home", href: "#top" },
  { label: "Building", href: "#building" },
  { label: "Deep-dives", href: "#deep-dives" },
  { label: "Stack", href: "#stack" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" }
];

/**
 * Left-edge section rail (React Bits LineSidebar).
 *
 * Gated at 1560px, not a stock breakpoint: the rail is 139px wide plus a
 * 12px hover shift at left-6, so it needs (vw - 1152) / 2 >= 199 to clear the
 * max-w-6xl content column. At the 2xl breakpoint (1536px) that margin is only
 * 9px. Below the gate the viewport margin outside the
 * max-w-6xl content column is too narrow and the rail would collide with the
 * copy. The top nav carries the same five destinations at every width, so
 * The active entry follows scroll position via useActiveSection, passed in
 * as a controlled prop.
 *
 * nothing is lost when this is hidden — and because the rail's items are
 * <li> elements rather than links, that top nav remains the keyboard-
 * reachable path.
 */
export function SectionRail() {
  const active = useActiveSection(HASHES);

  return (
    <div
      aria-hidden
      className="fixed top-1/2 left-6 z-30 hidden -translate-y-1/2 min-[1560px]:block">
      <LineSidebar
        items={SECTIONS.map((s) => s.label)}
        onItemClick={(index) => scrollToSection(SECTIONS[index].href)}
        accentColor="var(--accent)"
        textColor="var(--muted)"
        markerColor="var(--muted-2)"
        showIndex
        showMarker
        markerLength={36}
        markerGap={12}
        tickScale={0.45}
        scaleTick
        proximityRadius={88}
        maxShift={12}
        falloff="smooth"
        itemGap={18}
        fontSize={0.82}
        smoothing={110}
        activeIndex={active}
      />
    </div>
  );
}
