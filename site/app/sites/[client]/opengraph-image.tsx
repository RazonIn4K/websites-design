import { getClient } from "@/lib/clients";
import { ogCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ client: string }> }) {
  const { client } = await params;
  const c = getClient(client)!;
  return ogCard({
    name: c.site.business.name,
    shortName: c.site.business.shortName,
    vertical: c.vertical,
    cityState: `${c.site.business.city}, ${c.site.business.state}`,
    vars: c.themeVars,
    slug: c.slug,
  });
}
