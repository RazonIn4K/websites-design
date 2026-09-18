import {
  getDomain,
  getRevision,
  getSite,
  getSiteAsync,
  normalizeHostname,
} from "@/lib/platform/registry";
import type { DomainRecord, PublishedRevision, SiteRecord } from "@/lib/platform/types";

export interface HostResolution {
  hostname: string;
  domain: DomainRecord;
  site: SiteRecord;
  revision: PublishedRevision;
}

/**
 * Hostname → verified Domain → Site → active PublishedRevision.
 * Returns null when the host is unknown, disabled, unverified, or has no
 * active published revision (draft-only sites stay private).
 */
export function resolveHostname(hostname: string | null | undefined): HostResolution | null {
  if (!hostname) return null;
  const host = normalizeHostname(hostname);
  if (!host || host === "localhost" || host === "127.0.0.1") return null;

  const domain = getDomain(host);
  if (!domain || !domain.enabled) return null;
  if (domain.verification !== "verified") return null;

  const site = getSite(domain.siteId);
  if (!site || site.status === "archived") return null;
  if (!site.activePublishedRevisionId) return null;

  const revision = getRevision(site.activePublishedRevisionId);
  if (!revision || revision.siteId !== site.id) return null;

  return { hostname: host, domain, site, revision };
}

/**
 * Async variant that checks durable store for active revision.
 * Use this in SSR/API routes for cross-instance durability on Vercel.
 */
export async function resolveHostnameAsync(
  hostname: string | null | undefined
): Promise<HostResolution | null> {
  if (!hostname) return null;
  const host = normalizeHostname(hostname);
  if (!host || host === "localhost" || host === "127.0.0.1") return null;

  const domain = getDomain(host);
  if (!domain || !domain.enabled) return null;
  if (domain.verification !== "verified") return null;

  const site = await getSiteAsync(domain.siteId);
  if (!site || site.status === "archived") return null;
  if (!site.activePublishedRevisionId) return null;

  const revision = getRevision(site.activePublishedRevisionId);
  if (!revision || revision.siteId !== site.id) return null;

  return { hostname: host, domain, site, revision };
}

/** True when this host is a managed customer mapping (even if draft-empty). */
export function isManagedHostname(hostname: string | null | undefined): boolean {
  if (!hostname) return false;
  const domain = getDomain(normalizeHostname(hostname));
  return Boolean(domain?.enabled);
}
