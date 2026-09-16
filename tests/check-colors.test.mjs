import { test } from "node:test";
import assert from "node:assert/strict";
import { findColorLiterals, isAllowed } from "../scripts/check-colors.mjs";

const matches = (source) => findColorLiterals(source).map((finding) => finding.match);

test("finds hex, rgb() and rgba() literals", () => {
  assert.deepEqual(
    matches('tint="#5b8def" a="#fff" b="rgba(0, 0, 0, 0)" c="rgb(1,2,3)"'),
    ["#5b8def", "#fff", "rgba(0, 0, 0, 0)", "rgb(1,2,3)"]
  );
});

test("finds white and black colour utilities, with or without opacity", () => {
  assert.deepEqual(matches('className="text-white shadow-black/40 bg-black"'), [
    "text-white",
    "shadow-black/40",
    "bg-black"
  ]);
});

test("ignores in-page anchors that start with hex letters", () => {
  assert.deepEqual(
    matches('href="#deep-dives" href="#building" href="#side-project" href="#contact"'),
    []
  );
});

test("ignores comment lines", () => {
  assert.deepEqual(
    matches("// the old tint was #5b8def\n   * shadow-black/40 read as dirt\n   {/* #08090b */}"),
    []
  );
});

test("reports 1-based line numbers", () => {
  assert.deepEqual(findColorLiterals('a\nb="#fff"'), [{ line: 2, match: "#fff" }]);
});

test("the allowlist accepts listed files with either path separator", () => {
  assert.equal(isAllowed("app/globals.css"), true);
  // Built from its parts so no escape sequence can alter the separator.
  assert.equal(isAllowed(["components", "card-swap.tsx"].join(String.fromCharCode(92))), true);
  assert.equal(isAllowed("components/nav.tsx"), false);
});
