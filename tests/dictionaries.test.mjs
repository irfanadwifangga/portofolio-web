import { test } from "node:test";
import assert from "node:assert/strict";
import { en } from "../lib/i18n/dictionaries/en.ts";
import { id } from "../lib/i18n/dictionaries/id.ts";
import { SAME_IN_BOTH } from "../lib/i18n/same-in-both.ts";

/** [dotted path, value] for every string in a dictionary. */
function leaves(value, path = []) {
  if (typeof value === "string") return [[path.join("."), value]];
  if (Array.isArray(value)) return value.flatMap((item, i) => leaves(item, [...path, String(i)]));
  return Object.entries(value).flatMap(([key, item]) => leaves(item, [...path, key]));
}

const enLeaves = leaves(en);
const idLeaves = new Map(leaves(id));

test("both dictionaries have exactly the same keys", () => {
  assert.deepEqual([...idLeaves.keys()].sort(), enLeaves.map(([path]) => path).sort());
});

test("no value is empty", () => {
  for (const [path, value] of [...enLeaves, ...idLeaves]) {
    assert.ok(value.trim(), `${path} is empty`);
  }
});

test("every Indonesian value is translated, unless it is the same in both languages", () => {
  for (const [path, value] of enLeaves) {
    if (idLeaves.get(path) !== value) continue;
    assert.ok(SAME_IN_BOTH.has(value), `${path} is still English: "${value}"`);
  }
});

test("placeholders survive translation", () => {
  const tokens = (text) => (text.match(/\{\w+\}/g) ?? []).sort();
  for (const [path, value] of enLeaves) {
    assert.deepEqual(tokens(idLeaves.get(path) ?? ""), tokens(value), path);
  }
});
