import type { ComponentType, SVGProps } from "react";
import { TECH_ICON_CLASS } from "@/lib/tech-icons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * The tech marks, deliberately kept OUT of any client component.
 *
 * @thesvg/react stores every variant of an icon in one object literal and picks
 * between them at runtime (`_variants[variant]`), so a bundler cannot drop the
 * variants that go unused — importing the React mark alone costs 75 KB, and the
 * 34 marks on this site came to 323 KB of path data in the first-load chunk.
 *
 * Rendering them here, in a server component, means the browser receives the
 * finished <svg> as markup and never downloads the icon modules at all. The
 * orbit and the grid below it therefore take pre-rendered nodes as props rather
 * than icon components — see components/tech-orbit.tsx.
 *
 * Neither mark is interactive; the hover affordances are pure CSS, which is why
 * they survive the move to the server unchanged.
 */

/**
 * One orbiting mark.
 *
 * Sizes here are in the orbit's DESIGN space, which `responsive` scales by
 * container / baseWidth (1024 / 1400 = 0.731). Everything inside is therefore
 * divided by ~0.73 so it lands at the intended on-screen size — a 60px icon
 * renders at ~44px, and the tooltip needs a bigger type size to stay legible.
 */
export function OrbitMark({ name, Icon }: { name: string; Icon: IconType }) {
  return (
    <span className="group pointer-events-auto relative flex h-full w-full items-center justify-center hover:z-30">
      <Icon
        width={60}
        height={60}
        className={`opacity-85 transition-[opacity,transform] duration-150 ease-out group-hover:scale-110 group-hover:opacity-100 ${TECH_ICON_CLASS[name] ?? ""}`}
      />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-1.5 font-mono text-base whitespace-nowrap text-foreground opacity-0 shadow-lg transition-opacity duration-150 ease-out group-hover:opacity-100">
        {name}
      </span>
    </span>
  );
}

/**
 * The same mark for the below-sm fallback grid, where the orbit has no room to
 * read. Same TECH_ICON_CLASS overrides — without them Next.js is a blank white
 * disc here and GitHub sinks into the page.
 */
export function GridMark({ name, Icon }: { name: string; Icon: IconType }) {
  return (
    <span title={name} className="flex h-10 w-10 items-center justify-center">
      <Icon width={30} height={30} className={`opacity-85 ${TECH_ICON_CLASS[name] ?? ""}`} />
    </span>
  );
}
