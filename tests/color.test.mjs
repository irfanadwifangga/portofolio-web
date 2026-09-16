import { test } from "node:test";
import assert from "node:assert/strict";
import { transparentOf } from "../lib/color.ts";

test("a 6-digit hex gains a zero alpha channel, keeping its case", () => {
  assert.equal(transparentOf("#f8f9fb"), "#f8f9fb00");
  assert.equal(transparentOf("  #08090B "), "#08090B00");
});

test("a 3-digit hex expands before gaining alpha", () => {
  assert.equal(transparentOf("#fff"), "#ffffff00");
});

test("an 8-digit hex keeps its colour and drops its alpha", () => {
  assert.equal(transparentOf("#11223380"), "#11223300");
});

test("anything that is not a hex colour falls back to transparent", () => {
  assert.equal(transparentOf("var(--background)"), "transparent");
  assert.equal(transparentOf("#1234"), "transparent");
  assert.equal(transparentOf("#1234567"), "transparent");
});
