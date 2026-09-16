// WCAG 2.x relative luminance and contrast ratio, plus alpha compositing.
// Shared by the unit tests and the browser audit so both report the same numbers.

/** "#rgb", "#rrggbb" or "#rrggbbaa" -> [r, g, b, a]; r, g, b in 0-255, a in 0-1. */
export function parseHex(hex) {
  let digits = hex.trim().replace(/^#/, "");
  if (digits.length === 3) digits = [...digits].map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(digits)) throw new Error(`not a hex colour: ${hex}`);
  const byte = (i) => parseInt(digits.slice(i, i + 2), 16);
  return [byte(0), byte(2), byte(4), digits.length === 8 ? byte(6) / 255 : 1];
}

export function luminance([r, g, b]) {
  const channel = (value) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a, b) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

/** Source-over compositing of a translucent colour onto an opaque one. */
export function composite([r, g, b, a], [br, bg, bb]) {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}
