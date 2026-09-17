// Exits 1 if two page-text snapshots differ, and shows where.
//
// Usage: node scripts/same-text.mjs .i18n-check/en-before.txt .i18n-check/en-after.txt
import { readFileSync } from "node:fs";

const files = process.argv.slice(2);
if (files.length !== 2) {
  console.error("usage: node scripts/same-text.mjs <before> <after>");
  process.exit(1);
}

const [before, after] = files.map((file) => readFileSync(file, "utf8"));
if (before === after) {
  console.log("same-text: identical");
  process.exit(0);
}

let i = 0;
while (i < before.length && before[i] === after[i]) i++;
console.log(`same-text: differs at character ${i}`);
console.log(`  before: …${before.slice(Math.max(0, i - 80), i + 80)}…`);
console.log(`  after:  …${after.slice(Math.max(0, i - 80), i + 80)}…`);
process.exit(1);
