import { NextResponse, type NextRequest } from "next/server";
import { getDomain, normalizeHostname } from "@/lib/platform/registry";

/**
 * Hostname → managed site rewrite scaffolding (Next.js `proxy` convention).
 * Verified+enabled domains rewrite to /m/<siteId> while preserving /sites/*
 * and API routes on the shared demo origin.
 *
 * Live custom-domain attach on Vercel still needs David (project ID UNKNOWN).
 */

const PASSTHROUGH_PREFIXES = ["/sites", "/api", "/_next", "/img", "/favicon", "/robots", "/sitemap"];

export function proxy(request: NextRequest) {
  const hostHeader = request.headers.get("host") ?? "";
  const hostname = normalizeHostname(hostHeader);
  const { pathname } = request.nextUrl;

  if (PASSTHROUGH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
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
  const url = request.nextUrl.clone();
  const suffix = pathname === "/" ? "" : pathname;
  url.pathname = `/m/${domain.siteId}${suffix}`;

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
