// Reads what a reader and a screen reader get out of a prerendered page.

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
  "&#39;": "'",
  "&nbsp;": " "
};

const decode = (text) => text.replace(/&(?:amp|lt|gt|quot|#x27|#39|nbsp);/g, (entity) => ENTITIES[entity]);

/** Everything outside <head> and <script>, where attributes and text live. */
const body = (html) =>
  html.replace(/<head[\s\S]*?<\/head>/i, " ").replace(/<script[\s\S]*?<\/script>/gi, " ");

/**
 * The page's visible text as one whitespace-normalised string. React's `<!-- -->`
 * text separators are removed before tags, so adjacent text nodes join exactly
 * as they render.
 */
export function htmlText(html) {
  return decode(
    body(html)
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

/** `name="value"` for each listed attribute, in document order. */
export function htmlAttributes(html, names) {
  const pattern = new RegExp(`\\s(${names.join("|")})="([^"]*)"`, "g");
  return [...body(html).matchAll(pattern)].map(([, name, value]) => `${name}="${decode(value)}"`);
}
