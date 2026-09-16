import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { composite, contrast, parseHex } from "../scripts/lib/contrast.mjs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

/** Custom properties declared directly in `selector { ... }`, or null if absent. */
function tokens(selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) return null;
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()])
  );
}

const THEMES = [
  { name: "dark", selector: ":root" },
  { name: "light", selector: ':root[data-theme="light"]' }
];

const EXPECTED = {
  dark: {
    background: "#08090b", surface: "#101114", "surface-2": "#16171b",
    foreground: "#edeef0", muted: "#9ca3af", "muted-2": "#8b919b",
    accent: "#5b8def", "accent-soft": "#12203f", border: "#1f2228",
    "editor-bg": "#0a0b0d", "editor-chrome": "#131418", "editor-border": "#232428",
    "editor-text": "#d4d4d4", "editor-gutter": "#7d8590", "editor-tab": "#8b949e",
    "editor-tab-hover": "#c9d1d9", "editor-tab-active": "#e5e7eb", "editor-dim": "#6e7681",
    "editor-scramble": "#3a4048",
    "syntax-comment": "#6a9955", "syntax-string": "#ce9178", "syntax-func": "#dcdcaa",
    "syntax-number": "#b5cea8", "syntax-keyword": "#c586c0", "syntax-type": "#4ec9b0",
    "syntax-punct": "#9aa4b2",
    "scrollbar-thumb": "#5f6775", "scrollbar-thumb-hover": "#8b919b", "scrollbar-thumb-active": "#9ca3af",
    "on-accent": "#08090b", shadow: "#000000", encrypted: "#454a53", "grid-line": "#1b1d23"
  },
  light: {
    background: "#f8f9fb", foreground: "#0f1115", muted: "#4a5160", "muted-2": "#5f6775",
    border: "#e3e6eb", surface: "#ffffff", "surface-2": "#f1f3f6",
    accent: "#2f64d6", "accent-soft": "#e6eefc",
    "editor-bg": "#ffffff", "editor-chrome": "#f6f8fa", "editor-border": "#d0d7de",
    "editor-text": "#1f2328", "editor-gutter": "#636c76", "editor-tab": "#59636e",
    "editor-tab-hover": "#1f2328", "editor-tab-active": "#1f2328", "editor-dim": "#6e7781",
    "editor-scramble": "#c3c8d0",
    "syntax-comment": "#008000", "syntax-string": "#a31515", "syntax-func": "#795e26",
    "syntax-number": "#098658", "syntax-keyword": "#af00db", "syntax-type": "#267f99",
    "syntax-punct": "#57606a",
    "scrollbar-thumb": "#8b919b", "scrollbar-thumb-hover": "#5f6775", "scrollbar-thumb-active": "#4a5160",
    "on-accent": "#ffffff", shadow: "#64748b", encrypted: "#c3c8d0", "grid-line": "#e6e8ec"
  }
};

test("the contrast helper matches known WCAG values", () => {
  assert.equal(contrast(parseHex("#ffffff"), parseHex("#000000")).toFixed(2), "21.00");
  assert.equal(contrast(parseHex("#5b8def"), parseHex("#08090b")).toFixed(2), "6.17");
  assert.deepEqual(composite([255, 255, 255, 0.5], [0, 0, 0]), [127.5, 127.5, 127.5, 1]);
});

for (const { name, selector } of THEMES) {
  const theme = tokens(selector);
  const ratio = (fg, bg) => contrast(parseHex(theme[fg]), parseHex(theme[bg]));

  test(`${name}: tokens match the spec exactly`, () => {
    assert.ok(theme, `globals.css has no "${selector} {" block`);
    assert.deepEqual(theme, EXPECTED[name]);
  });

  test(`${name}: every text token reaches 4.5:1 on every surface`, () => {
    assert.ok(theme, `globals.css has no "${selector} {" block`);
    for (const fg of ["foreground", "muted", "muted-2", "accent"]) {
      for (const bg of ["background", "surface", "surface-2"]) {
        assert.ok(ratio(fg, bg) >= 4.5, `${fg} on ${bg} is ${ratio(fg, bg).toFixed(2)}:1`);
      }
    }
  });

  test(`${name}: text on the accent reaches 4.5:1`, () => {
    assert.ok(theme, `globals.css has no "${selector} {" block`);
    assert.ok(ratio("on-accent", "accent") >= 4.5, `on-accent on accent is ${ratio("on-accent", "accent").toFixed(2)}:1`);
  });

  test(`${name}: code editor text reaches 4.5:1`, () => {
    assert.ok(theme, `globals.css has no "${selector} {" block`);
    // editor-dim and editor-scramble are left out: like --encrypted, they only
    // colour the brief scramble before the highlighted code appears.
    const onEditor = ["editor-text", "editor-gutter", "editor-tab-active"];
    const syntax = ["comment", "string", "func", "number", "keyword", "type", "punct"].map((kind) => `syntax-${kind}`);
    for (const fg of [...onEditor, ...syntax]) {
      assert.ok(ratio(fg, "editor-bg") >= 4.5, `${fg} on editor-bg is ${ratio(fg, "editor-bg").toFixed(2)}:1`);
    }
    for (const fg of ["editor-tab", "editor-tab-hover"]) {
      assert.ok(ratio(fg, "editor-chrome") >= 4.5, `${fg} on editor-chrome is ${ratio(fg, "editor-chrome").toFixed(2)}:1`);
    }
  });

  test(`${name}: the resting scrollbar thumb reaches 3:1`, () => {
    assert.ok(theme, `globals.css has no "${selector} {" block`);
    const value = ratio("scrollbar-thumb", "background");
    assert.ok(value >= 3, `scrollbar-thumb on background is ${value.toFixed(2)}:1`);
  });
}
