import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { SitePage } from "@/components/SitePage";
import { StructuredData } from "@/components/StructuredData";
import { getClient } from "@/lib/clients";
import { getBlur } from "@/lib/blur";

const flamengo = getClient("flamengo")!;
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const flamengoImg = `/img/${flamengo.slug}/hero.jpg`;

export const viewport: Viewport = { themeColor: "#C13A0F" };

export const metadata: Metadata = {
  title: flamengo.site.en.meta.title,
  description: flamengo.site.en.meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: flamengo.site.en.meta.title,
    description: flamengo.site.en.meta.description,
    type: "website",
    url: "/",
    locale: "en_US",
    alternateLocale: "es_US",
    siteName: flamengo.site.business.name,
    images: [{ url: flamengoImg, width: 971, height: 607, alt: flamengo.site.business.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: flamengo.site.en.meta.title,
    description: flamengo.site.en.meta.description,
    images: [flamengoImg],
  },
};

export default function Home() {
  return (
    <Providers site={flamengo.site} slug={flamengo.slug} emojis={flamengo.emojis} themeVars={flamengo.themeVars} blur={getBlur(flamengo.slug)} layout={flamengo.layout}>
      <StructuredData
        business={flamengo.site.business}
        description={flamengo.site.en.meta.description}
        types={flamengo.schemaTypes}
        url={BASE}
        image={`${BASE}${flamengoImg}`}
      />
      <SitePage archetype={flamengo.layout?.archetype} />
    </Providers>
  );
}
