// Global CSS for every root layout: app/(en), app/id and app/global-not-found.
//
// JetBrains Mono: Latin subset only. The unscoped entry point declares
// @font-face for cyrillic, cyrillic-ext, greek, latin-ext and vietnamese as
// well — 42 font files in the build output for a site whose copy is entirely
// Latin. Those subsets carry unicode-range so a browser never downloads them,
// but they still ship and still cost @font-face rules to parse on every load.
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "@fontsource/jetbrains-mono/latin-700.css";
import "./globals.css";
