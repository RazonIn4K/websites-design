import type { MetadataRoute } from "next";
import { CLIENTS } from "@/lib/clients";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/sites`, changeFrequency: "monthly", priority: 0.6 },
    ...CLIENTS.filter((c) => c.slug !== "flamengo").map((c) => ({
      url: `${BASE}/sites/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
