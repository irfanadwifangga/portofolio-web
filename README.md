# irfana.web.id — portfolio

Portfolio for Irfana Dwi Fangga, fullstack developer (backend-first). Single
page, built with Next.js 16 (App Router, Turbopack), TypeScript, and Tailwind
CSS v4.

## Highlights

- **Hero** — a read-only, tabbed code editor (TypeScript / Java / Python / Go)
  with a custom syntax highlighter, over a dimmed WebGL backdrop
  ([React Bits "Faulty Terminal"](https://reactbits.dev), rendered with `ogl`).
  Text decrypts into place on view.
- **Currently building** — a rotating 3D card stack of project screenshots, with
  a detail panel beside it that always describes whichever card is in front.
- **System deep-dives** — short technical case studies from real work (Seria,
  RSTPOS, GM Workspace), not screenshots.
- **Tech stack** — two counter-rotating elliptical orbits of brand marks, with a
  grouped text list underneath as the scannable version.
- **Contact** — a compose form that delivers to the inbox through a server
  action; no third-party form service.
- **Theme** — dark only. There is no light palette and no toggle.
- **Motion** — GSAP for the stack, orbits and section titles; `motion` for
  reveals; Lenis for smooth scrolling. Everything honours
  `prefers-reduced-motion`.
- **Fonts** — JetBrains Mono and Press Start 2P alongside Geist Sans. All three
  are served from this origin at runtime; Press Start 2P is fetched from Google
  Fonts once at build time by `next/font` and then self-hosted, so a build needs
  network access but a page view never does.

## Getting started

Package manager is [Bun](https://bun.sh); `bun.lock` is the committed lockfile.

```bash
bun install
```

The contact form sends over Gmail SMTP, so create `.env.local`:

```
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

`GMAIL_APP_PASSWORD` is a Google [App Password](https://myaccount.google.com/apppasswords),
not the account password — the latter will not authenticate. Without these two
the site still builds and runs; only the contact form fails.

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Always spell out `bun run <script>`. Bare `bun build` does **not** run the
`build` script — it invokes Bun's own bundler, which knows nothing about Next.js
and will fail or emit the wrong thing.

`package.json` lists `unrs-resolver` under `trustedDependencies`. Bun blocks
lifecycle scripts by default, and that package's `postinstall` selects the
native binding for ESLint's import resolver. On the platforms used here it is
belt-and-braces — Bun installs the matching `@unrs/resolver-binding-*` as an
optional dependency and lint passes without it, verified — but the entry keeps a
fresh install working anywhere the optional dependency is skipped instead.

## Project structure

```
app/                    — layout, page, global styles, favicon set
app/actions/            — server actions (contact form delivery)
app/sitemap.ts          — sitemap.xml
app/robots.ts           — robots.txt
app/opengraph-image.tsx — social card, generated at build time
components/             — shared UI
components/sections/    — one file per page section
lib/                    — site constants, content data, icon maps, snippets, hooks
```

Nine components under `components/` are vendored from
[React Bits](https://reactbits.dev) — `card-swap`, `click-spark`,
`decrypted-text`, `faulty-terminal`, `line-sidebar`, `orbit-images`,
`shape-grid`, `shuffle`, `staggered-menu`. **Each one is modified**, and the
deviations from upstream are listed in a comment at the top of the file. Do not
replace them by copying fresh code from the site; several of the changes fix
real bugs.

## Editing content

| What | Where |
| --- | --- |
| Domain, name, tagline, description | `lib/site.ts` |
| Project cards & case studies | `lib/content.ts` |
| Tech stack groups | `lib/tech-stack.tsx` |
| Per-project tech marks | `lib/tech-icons.tsx` |
| Hero code-editor snippets | `lib/code-snippets.ts` |

`lib/site.ts` is the single source for anything that names the site. Metadata,
canonical URL, sitemap, robots and the Open Graph image all read from it — the
domain is deliberately not written out anywhere else.

## Keeping icons off the client

Brand marks come from `@thesvg/react`, which stores every variant of an icon in
one object literal and selects between them at runtime:

```js
const _variants = { default: {...}, mono: {...}, light: {...}, wordmark: {...} };
const _v = _variants[variant] || _variants.default;
```

A bundler cannot tree-shake that, so importing a single mark pulls in all of its
variants — the React mark alone is 75 KB. Importing them into a **client**
component put 323 KB of unused path data into the first-load bundle.

So the marks are rendered in server components and passed down as already-built
nodes:

- `components/orbit-mark.tsx` → `components/tech-orbit.tsx`
- `components/sections/hero.tsx` → `components/code-editor.tsx`
- `components/sections/currently-building.tsx` → `…-view.tsx`

Adding `import { Something } from "@thesvg/react"` to any file marked
`"use client"` undoes this and costs roughly 90 KB gzip. Render it in the server
parent and pass it as a prop instead.

## Build

```bash
bun run build
bun run start
```

Every route prerenders as static content, including the sitemap, robots.txt and
the Open Graph image.
