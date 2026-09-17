import { GeistSans } from "geist/font/sans";
import { Press_Start_2P } from "next/font/google";

// Section entrance headings and the 404 page only — a pixel face at body sizes
// is unreadable.
const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel-src",
  display: "swap"
});

/** Class names that expose both font CSS variables; set on <html>. */
export const FONT_VARIABLES = `${GeistSans.variable} ${pixel.variable}`;
