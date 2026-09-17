// Prints a snapshot of a prerendered page: its visible text on the first line,
// then every alt, aria-label, title and placeholder value in document order.
//
// Usage: node scripts/page-text.mjs .next/server/app/index.html > .i18n-check/en-before.txt
import { readFileSync } from "node:fs";
import { htmlAttributes, htmlText } from "./lib/html-text.mjs";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/page-text.mjs <page.html>");
  process.exit(1);
}

const html = readFileSync(file, "utf8");
const lines = [htmlText(html), ...htmlAttributes(html, ["alt", "aria-label", "title", "placeholder"])];
process.stdout.write(`${lines.join("\n")}\n`);
