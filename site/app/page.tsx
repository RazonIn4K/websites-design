import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { SitePage } from "@/components/SitePage";
import { getClient } from "@/lib/clients";
import { getBlur } from "@/lib/blur";

const flamengo = getClient("flamengo")!;
const flamengoImg = `/img/${flamengo.slug}/hero.jpg`;
const conceptTitle = "Illustrative Flamingo Website Concept — Not Owner-Approved";
const conceptDescription =
  "Unapproved illustrative prospect concept created from public information. This is not Flamingo's official website; current ordering remains external at flamingorestaurantdekalb.com.";

export const viewport: Viewport = { themeColor: "#C13A0F" };

export const metadata: Metadata = {
  title: conceptTitle,
  description: conceptDescription,
  alternates: { canonical: "/" },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
  openGraph: {
    title: conceptTitle,
    description: conceptDescription,
    type: "website",
    url: "/",
    locale: "en_US",
    alternateLocale: "es_US",
    siteName: "Illustrative Prospect Concept",
    images: [{ url: flamengoImg, width: 971, height: 607, alt: "Illustrative Flamingo website concept" }],
  },
  twitter: {
    card: "summary_large_image",
    title: conceptTitle,
    description: conceptDescription,
    images: [flamengoImg],
  },
};

export default function Home() {
  return (
    <Providers site={flamengo.site} slug={flamengo.slug} emojis={flamengo.emojis} themeVars={flamengo.themeVars} blur={getBlur(flamengo.slug)} layout={flamengo.layout}>
      <SitePage archetype={flamengo.layout?.archetype} prospectDemo />
    </Providers>
  );
}
