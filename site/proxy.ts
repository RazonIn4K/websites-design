import { NextResponse, type NextRequest } from "next/server";
import { getDomain, normalizeHostname } from "@/lib/platform/registry";

/**
 * Hostname → managed site rewrite scaffolding (Next.js `proxy` convention).
 * Verified+enabled domains rewrite to /m/<siteId> while preserving /sites/*
 * and API routes on the shared demo origin.
 *
 * Live custom-domain attach on Vercel still needs David (project ID UNKNOWN).
 *
 * ## Hostname isolation
 *
 * Managed CLIENT hostnames (mccabes.razonworks.com, sanjuan.razonworks.com, …)
 * must NOT expose the demo factory portfolio at /sites or /sites/*. This keeps
 * client demos clean and avoids confusing business owners.
 *
 * The factory remains fully available on:
 *   - websites-design.vercel.app (and Vercel preview URLs)
 *   - managed.razonworks.com (platform pilot / RazonWorks demo host)
 *   - localhost (local dev)
 *
 * Implementation: if a verified managed domain resolves to a siteId OTHER than
 * the platform pilot, requests to /sites or /sites/* return 404.
 */

const PASSTHROUGH_PREFIXES = ["/api", "/_next", "/img", "/favicon", "/robots", "/sitemap"];

/** Routes that expose the demo factory portfolio — blocked on client managed hosts. */
const PORTFOLIO_PREFIXES = ["/sites"];

/** Platform pilot siteId — this managed host still exposes the factory for sell demos. */
const PLATFORM_PILOT_SITE_ID = "site_pilot_craft";

/** Metadata/icon routes that must map to /m/<siteId>/… on customer hosts (not flagship). */
const MANAGED_META_PATHS = new Set([
  "/opengraph-image",
  "/twitter-image",
  "/icon",
  "/apple-icon",
]);

/** Check if path matches portfolio routes that should be blocked on client managed hosts. */
function isPortfolioPath(pathname: string): boolean {
  return PORTFOLIO_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(request: NextRequest) {
  const hostHeader = request.headers.get("host") ?? "";
  const hostname = normalizeHostname(hostHeader);
  const { pathname } = request.nextUrl;

  if (PASSTHROUGH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // Hostname isolation: block portfolio routes on managed CLIENT hosts.
  // Allow portfolio on the platform pilot and non-managed hosts (Vercel preview, localhost).
  if (isPortfolioPath(pathname)) {
    const domain = getDomain(hostname);
    if (domain?.enabled && domain.verification === "verified" && domain.siteId !== PLATFORM_PILOT_SITE_ID) {
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  // Already on the managed path — attach site header for downstream APIs.
  const managedPath = pathname.match(/^\/m\/([^/]+)/);
  if (managedPath) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-managed-site-id", managedPath[1]);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const domain = getDomain(hostname);
  if (!domain?.enabled || domain.verification !== "verified") {
    return NextResponse.next();
  }

  // Customer hostname: serve managed site at `/` (and nested paths) via rewrite.
  // Meta image routes rewrite to /m/<siteId>/opengraph-image (dedicated route).
  const url = request.nextUrl.clone();
  if (pathname === "/" ) {
    url.pathname = `/m/${domain.siteId}`;
  } else if (MANAGED_META_PATHS.has(pathname) || pathname.startsWith("/opengraph-image")) {
    url.pathname = `/m/${domain.siteId}${pathname}`;
  } else {
    url.pathname = `/m/${domain.siteId}${pathname}`;
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-managed-site-id", domain.siteId);
  requestHeaders.set("x-managed-hostname", hostname);

  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Skip static assets; still run for pages + HTML navigations.
     */
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
