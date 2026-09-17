import type { ReactNode } from "react";
import "../global-styles";
import { SiteDocument } from "@/components/site-document";
import { buildMetadata } from "@/lib/i18n/metadata";

export const metadata = buildMetadata("id");

export default function IndonesianLayout({ children }: { children: ReactNode }) {
  return <SiteDocument locale="id">{children}</SiteDocument>;
}
