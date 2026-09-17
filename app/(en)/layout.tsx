import type { ReactNode } from "react";
import "../global-styles";
import { SiteDocument } from "@/components/site-document";
import { buildMetadata } from "@/lib/i18n/metadata";

export const metadata = buildMetadata("en");

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
