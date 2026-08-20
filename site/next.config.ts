import type { NextConfig } from "next";

// Robust, framework-safe security headers applied to every route. (A strict
// CSP is intentionally omitted — it needs per-page nonce work for the inline
// `js` flag + Motion styles; see DEPLOY.md. These headers are safe as-is.)
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats (AVIF, then WebP) for the photo-heavy sites.
    formats: ["image/avif", "image/webp"],
    // Photos are immutable per slug — let the optimizer cache aggressively.
    minimumCacheTTL: 31536000,
  },
  async redirects() {
    // Flagship lives at "/"; keep /sites/flamengo from 404ing (generateStaticParams
    // excludes it + dynamicParams=false). Index already links the card to "/".
    return [{ source: "/sites/flamengo", destination: "/", permanent: false }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Generated photography never changes for a given slug (OG crawlers and
      // the image optimizer fetch these source files directly).
      {
        source: "/img/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
