"use client";

import * as React from "react";

/**
 * Sets the Indonesian tab title on an /id 404.
 *
 * The page's metadata title is English, and Next rewrites it right after
 * hydration — measured 3ms after this effect first set it. So the effect sets
 * the title and keeps it: a head observer puts it back whenever it is changed.
 * The equality check stops the observer from reacting to its own write. It only
 * runs when the pre-paint script chose Indonesian.
 */
export function NotFoundTitle({ title }: { title: string }) {
  React.useEffect(() => {
    if (document.documentElement.lang !== "id") return;

    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);

  return null;
}
