/**
 * The same colour at alpha 0, as an 8-digit hex.
 *
 * Canvas gradients interpolate unpremultiplied: fading from rgba(0, 0, 0, 0)
 * to a light colour passes through grey on the way. Fading from the target's
 * own transparent version keeps the ramp clean. Accepts #rgb, #rrggbb and
 * #rrggbbaa; anything else returns "transparent".
 */
export function transparentOf(color: string): string {
  const hex = color.trim().replace(/^#/, "");
  if (![3, 6, 8].includes(hex.length)) return "transparent";
  const rgb = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(rgb)) return "transparent";
  return `#${rgb}00`;
}
