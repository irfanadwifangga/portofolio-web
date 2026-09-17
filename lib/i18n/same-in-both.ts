/**
 * Dictionary values that are correctly identical in English and Indonesian.
 *
 * tests/dictionaries.test.mjs fails on any other identical pair, which is how a
 * forgotten translation gets caught. Add a value here only when Indonesian
 * genuinely uses the same words.
 */
export const SAME_IN_BOTH = new Set([
  "Irfana Dwi Fangga — Fullstack Developer",
  "Fullstack Developer",
  "Menu",
  "Email",
  "Ctrl + Enter",
  "Logo",
  "{name} — {role}"
]);
