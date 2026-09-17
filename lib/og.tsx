import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";
import { SITE_HOST, SITE_LOCATION, SITE_NAME } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

// Comma, not a dash — the tagline already contains an em-dash, and joining
// with a second one reads as a broken string in screen-reader output.
export function ogAlt(locale: Locale): string {
  return `${SITE_NAME}, ${getDictionary(locale).meta.tagline}`;
}

/**
 * The card that renders when the link is pasted into LinkedIn, WhatsApp, Slack
 * or X, in one language. Generated at build time rather than shipped as a
 * static PNG so the name and domain can never drift from lib/site.ts.
 *
 * Fonts are read off disk as raw buffers because Satori — the renderer behind
 * ImageResponse — does not read CSS and cannot use next/font. It accepts TTF,
 * OTF and WOFF but *not* WOFF2, which is why the .woff build of JetBrains Mono
 * is picked here while the site itself loads .woff2.
 *
 * Satori implements flexbox only, so every container sets an explicit display.
 * It also has no text-overflow handling: anything too wide simply wraps and
 * quietly breaks the row's alignment, which is why the single-line items carry
 * flexShrink: 0 and nowrap rather than relying on the row being wide enough.
 */
export async function renderOgImage(locale: Locale): Promise<ImageResponse> {
  const { tagline, ogSpecialties } = getDictionary(locale).meta;
  const [sans, mono] = await Promise.all([
    readFile(
      join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Medium.ttf"),
    ),
    readFile(
      join(
        process.cwd(),
        "node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff",
      ),
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090b",
          padding: "72px 80px",
          fontFamily: "Geist",
          // the site's own top hairline, so the card reads as the same surface
          borderTop: "6px solid #5b8def",
        }}
      >
        {/* Mark + host on the left, location opposite it */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 14,
                background: "#5b8def",
                color: "#08090b",
                fontFamily: "JetBrains Mono",
                fontSize: 38,
              }}
            >
              {">"}
            </div>
            <div
              style={{
                display: "flex",
                marginLeft: 22,
                fontFamily: "JetBrains Mono",
                fontSize: 26,
                color: "#edeef0",
                whiteSpace: "nowrap",
              }}
            >
              {SITE_HOST}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexShrink: 0,
              fontFamily: "JetBrains Mono",
              fontSize: 22,
              color: "#8b919b",
              whiteSpace: "nowrap",
            }}
          >
            {SITE_LOCATION}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              lineHeight: 1.1,
              color: "#edeef0",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontFamily: "JetBrains Mono",
              fontSize: 32,
              color: "#9ca3af",
              whiteSpace: "nowrap",
            }}
          >
            {tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {ogSpecialties.map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                flexShrink: 0,
                marginRight: 16,
                padding: "10px 20px",
                borderRadius: 999,
                border: "1px solid #1f2228",
                background: "#101114",
                fontFamily: "JetBrains Mono",
                fontSize: 20,
                color: "#9ca3af",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geist", data: sans, style: "normal", weight: 500 },
        { name: "JetBrains Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
