import { getPublishedContentForSiteId } from "@/lib/platform/adapter";
import { ogCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";

/**
 * Per-managed-site OG card. Customer hosts rewrite /opengraph-image → here.
 */
export default async function OgImage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const published = getPublishedContentForSiteId(siteId);
  if (!published) {
    return ogCard({
      name: "RazonWorks",
      shortName: "RW",
      vertical: "Managed site",
      cityState: "",
      vars: {},
      slug: "flamengo",
    });
  }
  const biz = published.siteContent.business;
  return ogCard({
    name: biz.name,
    shortName: biz.shortName,
    vertical: biz.vertical,
    cityState: [biz.city, biz.state].filter(Boolean).join(", "),
    vars: published.themeVars,
    slug: published.assetSlug,
  });
}
