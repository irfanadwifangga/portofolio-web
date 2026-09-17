import { test } from "node:test";
import assert from "node:assert/strict";
import { fill, isLocale, otherLocale, pathFor } from "../lib/i18n/locales.ts";
import { formatPeriod } from "../lib/i18n/format.ts";

test("English periods read exactly as they did before localisation", () => {
  assert.equal(formatPeriod({ start: "2026-01", end: "present" }, "en"), "Jan 2026 — Present");
  assert.equal(formatPeriod({ start: "2026-02", end: "2026-06" }, "en"), "Feb 2026 — Jun 2026");
  assert.equal(formatPeriod({ start: "2023-08", end: "present" }, "en"), "Aug 2023 — Present");
});

test("Indonesian periods use Indonesian month names and Sekarang", () => {
  assert.equal(formatPeriod({ start: "2026-05", end: "2026-08" }, "id"), "Mei 2026 — Agu 2026");
  assert.equal(formatPeriod({ start: "2026-10", end: "2026-12" }, "id"), "Okt 2026 — Des 2026");
  assert.equal(formatPeriod({ start: "2026-01", end: "present" }, "id"), "Jan 2026 — Sekarang");
});

test("a single month renders once", () => {
  assert.equal(formatPeriod({ start: "2026-09", end: "2026-09" }, "en"), "Sep 2026");
  assert.equal(formatPeriod({ start: "2026-09", end: "2026-09" }, "id"), "Sep 2026");
});

test("an impossible month is a loud error, not a blank", () => {
  assert.throws(() => formatPeriod({ start: "2026-13", end: "present" }, "en"), /2026-13/);
});

test("fill replaces named placeholders and leaves unknown ones visible", () => {
  assert.equal(
    fill("Showing {name}, {index} of {total}", { name: "Seria", index: 1, total: 3 }),
    "Showing Seria, 1 of 3"
  );
  assert.equal(fill("{tools} tools", {}), "{tools} tools");
});

test("locale helpers", () => {
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("id"), true);
  assert.equal(isLocale("fr"), false);
  assert.equal(isLocale(undefined), false);
  assert.equal(pathFor("en"), "/");
  assert.equal(pathFor("id"), "/id");
  assert.equal(otherLocale("en"), "id");
  assert.equal(otherLocale("id"), "en");
});
