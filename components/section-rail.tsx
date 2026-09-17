"use client";

import * as React from "react";
import LineSidebar from "@/components/line-sidebar";
import type { Dictionary } from "@/lib/i18n";
import { scrollToSection } from "@/lib/scroll-to";
import { SECTIONS } from "@/lib/sections";
import { useActiveSection } from "@/lib/use-active-section";

// Module-level so useActiveSection receives the same array on every render.
const HASHES = SECTIONS.map((section) => section.hash);

/**
 * Left-edge section rail (React Bits LineSidebar).
 *
 * Gated at 1560px, not a stock breakpoint: the rail is 139px wide plus a
 * 12px hover shift at left-6, so it needs (vw - 1152) / 2 >= 199 to clear the
 * max-w-6xl content column. At the 2xl breakpoint (1536px) that margin is only
 * 9px. Below the gate the rail would collide with the copy. The top nav
 * carries the same destinations at every width, so nothing is lost when this
 * is hidden — and because the rail's items are <li> elements rather than
 * links, that top nav remains the keyboard-reachable path. The active entry
 * follows scroll position via useActiveSection, passed in as a controlled prop.
 */
export function SectionRail({ labels }: { labels: Dictionary["sections"] }) {
  const active = useActiveSection(HASHES);
  const items = React.useMemo(() => SECTIONS.map((section) => labels[section.key].label), [labels]);

  return (
    <div
      aria-hidden
      className="fixed top-1/2 left-6 z-30 hidden -translate-y-1/2 min-[1560px]:block">
      <LineSidebar
        items={items}
        onItemClick={(index) => scrollToSection(SECTIONS[index].hash)}
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
