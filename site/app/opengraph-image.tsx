import { getClient } from "@/lib/clients";
import { ogCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";

/** The root route serves the flagship (flamengo). */
export default async function OgImage() {
  const c = getClient("flamengo")!;
  return ogCard({
    name: c.site.business.name,
    shortName: c.site.business.shortName,
    vertical: c.vertical,
    cityState: `${c.site.business.city}, ${c.site.business.state}`,
    vars: c.themeVars,
    slug: c.slug,
  });
}
