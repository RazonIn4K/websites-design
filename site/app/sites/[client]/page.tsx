import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Providers } from "@/components/Providers";
import { SitePage } from "@/components/SitePage";
import { StructuredData } from "@/components/StructuredData";
import { CLIENTS, getClient } from "@/lib/clients";
import { getBlur } from "@/lib/blur";

type Params = Promise<{ client: string }>;

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function generateStaticParams() {
  // Flamengo lives at "/"; don't also emit /sites/flamengo.
  return CLIENTS.filter((c) => c.slug !== "flamengo").map((c) => ({ client: c.slug }));
}

export const dynamicParams = false;

export async function generateViewport({ params }: { params: Params }): Promise<Viewport> {
  const { client } = await params;
  const c = getClient(client);
  return { themeColor: c?.themeVars["--color-primary"] ?? "#C13A0F" };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { client } = await params;
  const c = getClient(client);
  if (!c) return {};
  const path = `/sites/${c.slug}`;
  // OG/Twitter images come from the opengraph-image.tsx file convention
  // (branded per-client cards) — no explicit images here so it isn't overridden.
  return {
    title: c.site.en.meta.title,
    description: c.site.en.meta.description,
    alternates: { canonical: path },
    openGraph: {
      title: c.site.en.meta.title,
      description: c.site.en.meta.description,
      type: "website",
      url: path,
      locale: "en_US",
      alternateLocale: "es_US",
      siteName: c.site.business.name,
    },
    twitter: {
      card: "summary_large_image",
      title: c.site.en.meta.title,
      description: c.site.en.meta.description,
    },
  };
}

export default async function ClientSitePage({ params }: { params: Params }) {
  const { client } = await params;
  const c = getClient(client);
  if (!c) notFound();

  return (
    <Providers site={c.site} slug={c.slug} emojis={c.emojis} themeVars={c.themeVars} blur={getBlur(c.slug)} layout={c.layout}>
      <StructuredData
        business={c.site.business}
        description={c.site.en.meta.description}
        types={c.schemaTypes}
        url={`${BASE}/sites/${c.slug}`}
        image={`${BASE}/img/${c.slug}/hero.jpg`}
      />
      <SitePage archetype={c.layout?.archetype} />
    </Providers>
  );
}
