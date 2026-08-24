"use client";

import * as React from "react";

/**
 * Index of the section currently occupying the reading position.
 *
 * IntersectionObserver alone is not enough here: several sections can be
 * intersecting at once on a tall viewport, and "most visible" flickers between
 * neighbours mid-scroll. Instead every observed entry is scored by how close
 * its top edge is to a fixed reading line just under the header, and the
 * closest one above that line wins — which is what a reader would call "the
 * section I am in".
 */
export function useActiveSection(hashes: string[], headerOffset = 56): number {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const els = hashes
      .map((h, i) => ({
        i,
        el: document.querySelector(h) as HTMLElement | null,
      }))
      .filter((x): x is { i: number; el: HTMLElement } => Boolean(x.el));
    if (!els.length) return;

    let frame = 0;
    const pick = () => {
      frame = 0;
      const line = headerOffset + 1;
      let best = 0;
      for (const { i, el } of els) {
        // the last section whose top has crossed the reading line
        if (el.getBoundingClientRect().top - line <= 0) best = i;
      }
      // bottom of the page always resolves to the final section, otherwise a
      // short last section can never become active
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      ) {
        best = els[els.length - 1].i;
      }
      setActive(best);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };

    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [hashes, headerOffset]);

  return active;
}
