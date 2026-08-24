# irfana.web.id — portfolio

Backend-developer portfolio for Irfana Dwi Fangga. Single-page, built with Next.js (App Router), TypeScript, and Tailwind CSS v4.

## Highlights

- **Hero** — a read-only, tabbed code editor (TypeScript / Java / Python / Go) with a lightweight custom syntax highlighter, over a toned-down [ShaderGradient](https://github.com/ruucm/shadergradient) animated background (respects `prefers-reduced-motion`).
- **System deep-dives** — short technical case studies from real work (Seria, RSTPOS, GM Workspace), not screenshots.
- **Tech stack** — grouped, icon-labelled chips using [`@thesvg/react`](https://thesvg.org/).
- **Theme** — dark/light toggle via `next-themes`, defaults to dark.
- **Fonts** — JetBrains Mono (via `@fontsource/jetbrains-mono`, self-hosted) paired with Geist Sans (via the `geist` package). Neither requires a network request at build or runtime.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/                   — routes, layout, global styles
components/             — shared UI (nav, theme toggle, code editor, shader background)
components/sections/    — one file per page section
lib/                    — content data, tech-stack icon map, code snippets, syntax highlighter
```

## Editing content

- Project cards & case studies: `lib/content.ts`
- Tech stack groups: `lib/tech-stack.tsx`
- Hero code-editor snippets: `lib/code-snippets.ts`

## Build

```bash
npm run build
npm run start
```
