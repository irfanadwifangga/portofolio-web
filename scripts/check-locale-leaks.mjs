// Fails if English copy leaks onto the prerendered Indonesian page.
//
// It takes every English dictionary value and every English side of an
// { en, id } pair in lib/content.ts whose Indonesian differs, then looks for it
// in the visible text of .next/server/app/id.html. A leak means a component
// still renders a hard-coded English string or forgot to pick the locale.
//
// Usage: bun run build && bun run check:i18n
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { deepDives, experience, projects, sideProject } from "../lib/content.ts";
import { en } from "../lib/i18n/dictionaries/en.ts";
import { id } from "../lib/i18n/dictionaries/id.ts";
import { htmlText } from "./lib/html-text.mjs";

const PAGE = ".next/server/app/id.html";

// Shorter strings ("Menu", "Email", "EN") are too likely to appear inside
// legitimate Indonesian text or tech names to count as evidence of a leak.
const MIN_LENGTH = 12;

/** English strings whose Indonesian counterpart differs, from a parallel walk. */
export function englishOnly(enValue, idValue, out = []) {
  if (typeof enValue === "string") {
    if (enValue !== idValue && enValue.length > MIN_LENGTH) out.push(enValue);
  } else if (Array.isArray(enValue)) {
    enValue.forEach((item, i) => englishOnly(item, idValue?.[i], out));
  } else if (enValue && typeof enValue === "object") {
    for (const key of Object.keys(enValue)) englishOnly(enValue[key], idValue?.[key], out);
  }
  return out;
}

/** The English side of every { en, id } pair anywhere inside `value`. */
export function localizedPairs(value, out = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => localizedPairs(item, out));
  } else if (value && typeof value === "object") {
    if ("en" in value && "id" in value) englishOnly(value.en, value.id, out);
    else for (const item of Object.values(value)) localizedPairs(item, out);
  }
  return out;
}

export function findLeaks(text, strings) {
  return [...new Set(strings)].filter((string) => text.includes(string));
}

function main() {
  if (!existsSync(PAGE)) {
    console.error(`check:i18n: ${PAGE} not found — run bun run build first`);
    process.exit(1);
  }
  const text = htmlText(readFileSync(PAGE, "utf8"));
  const english = [...englishOnly(en, id), ...localizedPairs([projects, deepDives, experience, sideProject])];
  const leaks = findLeaks(text, english);
  if (leaks.length) {
    console.log(`check:i18n: ${leaks.length} English string(s) on the Indonesian page:`);
    for (const leak of leaks) console.log(`  "${leak}"`);
    process.exit(1);
  }
  console.log(`check:i18n: no English copy on /id (${english.length} strings checked)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
