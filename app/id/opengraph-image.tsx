import { ogAlt, renderOgImage } from "@/lib/og";

export const alt = ogAlt("id");
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage("id");
}
