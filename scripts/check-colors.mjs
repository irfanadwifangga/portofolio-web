// Static colour guard. Every colour a theme can reach lives in app/globals.css;
// a literal anywhere else is a place the light/dark switch cannot follow. This
// fails on any literal outside the files that are allowed to hold one.
//
// Usage: bun run check:colors
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

export const ALLOWLIST = new Set([
  // the tokens themselves
  "app/globals.css",
  // rendered outside the page theme
  "lib/og.tsx",
  "app/actions/send-email.ts",
  // the editor's window-control dots keep their macOS colours in both themes
  "components/code-editor.tsx",
  // brand marks carry their own brand colours
  "lib/tech-icons.tsx",
  "lib/yt-dlp-mark.tsx",
  // vendored React Bits: literals are upstream defaults; call sites stay guarded
  "components/card-swap.tsx",
  "components/click-spark.tsx",
  "components/decrypted-text.tsx",
  "components/faulty-terminal.tsx",
  "components/line-sidebar.tsx",
  "components/orbit-images.tsx",
  "components/shape-grid.tsx",
  "components/shuffle.tsx",
  "components/staggered-menu.tsx"
]);

// Windows path separator, spelled without an escape sequence.
const BACKSLASH = String.fromCharCode(92);

const SCANNED_DIRS = ["app", "components", "lib"];
const SCANNED_FILE = /\.(tsx?|css)$/;
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*|\{\/\*)/;
const LITERALS = [
  /#[0-9a-fA-F]{3,8}\b/g,
  /rgba?\([^)]*\)/g,
  /\b(?:text|bg|border|shadow|fill|stroke|ring|from|via|to|outline|divide|decoration|caret|placeholder)-(?:white|black)(?:\/\d+)?\b/g
];

/** Colour literals in a source string, skipping comment lines. */
export function findColorLiterals(source) {
  const found = [];
  source.split("\n").forEach((text, index) => {
    if (COMMENT_LINE.test(text)) return;
    for (const pattern of LITERALS) {
      for (const match of text.match(pattern) ?? []) found.push({ line: index + 1, match });
    }
  });
  return found;
}

export function isAllowed(path) {
  return ALLOWLIST.has(path.split(BACKSLASH).join("/"));
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (SCANNED_FILE.test(entry.name)) files.push(full);
  }
  return files;
}

export function scan(root) {
  const findings = [];
  for (const dir of SCANNED_DIRS) {
    for (const file of walk(join(root, dir))) {
      const path = relative(root, file).split(BACKSLASH).join("/");
      if (isAllowed(path)) continue;
      for (const hit of findColorLiterals(readFileSync(file, "utf8"))) findings.push({ path, ...hit });
    }
  }
  return findings;
}

// process.argv[1] is undefined under `node -e`; only run when executed directly.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const findings = scan(process.cwd());
  for (const { path, line, match } of findings) console.log(`${path}:${line}  ${match}`);
  if (findings.length) {
    const files = new Set(findings.map((finding) => finding.path)).size;
    console.log(`\n${findings.length} colour literal(s) in ${files} file(s) outside the allowlist.`);
    console.log("Use a token from app/globals.css, or add the file to ALLOWLIST with a reason.");
    process.exit(1);
  }
  console.log("check:colors: no colour literals outside the allowlist");
}
