import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Providers } from "@/components/Providers";
import { SitePage } from "@/components/SitePage";
import { StructuredData } from "@/components/StructuredData";
import { getBlur } from "@/lib/blur";
import { getPublishedContentForSiteIdAsync } from "@/lib/platform/adapter";
import { getSiteAsync, listSites } from "@/lib/platform/registry";

type Params = Promise<{ siteId: string }>;

/**
 * Managed published site surface.
 * Serves only the active PublishedRevision — draft kits are never loaded here.
 * Demo catalog remains at /sites/<slug>.
 */

export function generateStaticParams() {
  return listSites()
    .filter((s) => s.activePublishedRevisionId)
    .map((s) => ({ siteId: s.id }));
}

export const dynamicParams = false;

export async function generateViewport({ params }: { params: Params }): Promise<Viewport> {
  const { siteId } = await params;
  const published = await getPublishedContentForSiteIdAsync(siteId);
  return { themeColor: published?.themeVars["--color-primary"] ?? "#C13A0F" };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { siteId } = await params;
  const hdrs = await headers();
  const managedHost = hdrs.get("x-managed-hostname");
  const published = await getPublishedContentForSiteIdAsync(siteId, {
    canonicalOrigin: managedHost ? `https://${managedHost}` : null,
  });
  if (!published) return {};

  const canonical = published.canonicalOrigin
    ? published.canonicalOrigin
    : `/m/${siteId}`;

  const assetBase =
    published.canonicalOrigin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  // On a customer host, /opengraph-image is rewritten to this site's OG route.
  const ogImageUrl = published.canonicalOrigin
    ? `${published.canonicalOrigin}/opengraph-image`
    : `${assetBase}/m/${siteId}/opengraph-image`;

  return {
    title: published.siteContent.en.meta.title,
    description: published.siteContent.en.meta.description,
    alternates: { canonical },
    openGraph: {
      title: published.siteContent.en.meta.title,
      description: published.siteContent.en.meta.description,
      type: "website",
      url: canonical,
      locale: "en_US",
      alternateLocale: "es_US",
      siteName: published.siteContent.business.name,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: published.siteContent.en.meta.title,
      description: published.siteContent.en.meta.description,
      images: [ogImageUrl],
    },
  };
}

export default async function ManagedSitePage({ params }: { params: Params }) {
  const { siteId } = await params;
  const site = await getSiteAsync(siteId);
  if (!site?.activePublishedRevisionId) notFound();

  const hdrs = await headers();
  const managedHost = hdrs.get("x-managed-hostname");
  const published = await getPublishedContentForSiteIdAsync(siteId, {
    canonicalOrigin: managedHost ? `https://${managedHost}` : null,
  });
  if (!published) notFound();

  const base =
    published.canonicalOrigin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const pageUrl = published.canonicalOrigin || `${base}/m/${siteId}`;

  return (
    <Providers
      site={published.siteContent}
      slug={published.assetSlug}
      emojis={published.emojis}
      themeVars={published.themeVars}
      blur={getBlur(published.assetSlug)}
      layout={published.layout}
      managedSiteId={published.siteId}
    >
      <StructuredData
        business={published.siteContent.business}
        description={published.siteContent.en.meta.description}
        types={published.schemaTypes}
        url={pageUrl}
        image={`${base}/img/${published.assetSlug}/hero.jpg`}
      />
      <SitePage archetype={published.layout?.archetype} />
    </Providers>
  );
}
