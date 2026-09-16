import Image from "next/image";
import { TECH_ICONS, TECH_IMAGES, TECH_ICON_CLASS, TECH_IMAGE_CLASS } from "@/lib/tech-icons";

/**
 * Bare 32x32 brand mark with a hover tooltip — no pill, no label text.
 *
 * Three render paths, in order: a component icon from the shared set, an
 * image file for marks that only exist as artwork, and a monogram for
 * anything with neither. The monogram keeps the row height uniform instead of
 * borrowing a glyph from a different icon library.
 *
 * The marks are not focusable (12 decorative tab stops per section would be
 * hostile), so the accessible name rides on aria-label instead of the tooltip.
 *
 * Marks rest at full opacity. A resting dim put FFmpeg under 3:1 in the dark
 * theme, and SQLite and GitHub Actions under 3:1 in the light one; hover keeps
 * only the scale.
 */
export function TechIcon({ label }: { label: string }) {
  const Icon = TECH_ICONS[label];
  const src = TECH_IMAGES[label];
  const iconClass = TECH_ICON_CLASS[label] ?? "";
  const imageClass = TECH_IMAGE_CLASS[label] ?? "";

  return (
    <span className="group relative flex">
      <span
        role="img"
        aria-label={label}
        data-tech-mark={label}
        className="flex h-8 w-8 items-center justify-center transition-transform duration-150 ease-out group-hover:scale-110">
        {Icon ? (
          <Icon width={32} height={32} className={iconClass} />
        ) : src ? (
          <Image src={src} alt="" width={32} height={32} className={`h-8 w-8 object-contain ${imageClass}`} />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 font-mono text-2xs text-muted">
            {label.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>

      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md border border-border bg-surface px-2 py-1 font-mono text-2xs whitespace-nowrap text-foreground opacity-0 shadow-lg transition-opacity duration-150 ease-out group-hover:opacity-100">
        {label}
      </span>
    </span>
  );
}
