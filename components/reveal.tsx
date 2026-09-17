"use client";

import * as React from "react";

/**
 * Fades its children up into place the first time they scroll into view.
 *
 * Plain CSS: an IntersectionObserver flips one class and a transition does the
 * rest. It matches the Motion version it replaced — 16px rise, 0.5s, Motion's
 * easeOut curve, the same -80px viewport margin — without shipping an
 * animation library to every page.
 */
export function Reveal({
  children,
  delay = 0,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "-80px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,translate] duration-500 ease-[cubic-bezier(0,0,0.58,1)] motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className ?? ""}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}
