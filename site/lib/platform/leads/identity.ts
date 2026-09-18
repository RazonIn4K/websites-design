import { getSite } from "@/lib/platform/registry";
import { isManagedHostname, resolveHostname } from "@/lib/platform/resolve-host";

export interface ResolvedLeadSite {
  siteId: string;
  revisionId: string | null;
  hostname: string | null;
  /** Managed production-like path — must not accept demo-success masquerade. */
  productionLike: boolean;
  business: { name: string; city: string; state: string };
}

/**
 * Server-side site identity for leads.
 * Prefer Host → Domain → Site mapping; never trust body business alone for
 * managed hosts. Body siteId is only accepted when it matches a known managed
 * site and Host is not a conflicting managed mapping.
 */
export function resolveLeadSite(input: {
  hostname: string | null;
  bodySiteId?: string | null;
  bodyBusiness?: { name?: string; city?: string; state?: string };
}): ResolvedLeadSite | { error: string; status: number } {
  const host = input.hostname;
  const managed = host ? resolveHostname(host) : null;

  if (managed) {
    const biz = managed.revision.content.overrides?.business;
    const demoFallback = input.bodyBusiness;
    return {
      siteId: managed.site.id,
      revisionId: managed.revision.id,
      hostname: managed.hostname,
      productionLike: true,
      business: {
        name: biz?.name || managed.site.displayName,
        city: biz?.city || demoFallback?.city?.trim() || "",
        state: biz?.state || demoFallback?.state?.trim() || "",
      },
    };
  }

  if (host && isManagedHostname(host)) {
    // Mapped but no active publication — do not accept leads as if live.
    return { error: "Managed hostname has no active published revision.", status: 503 };
  }

  const bodySiteId = input.bodySiteId?.trim();
  if (bodySiteId) {
    const site = getSite(bodySiteId);
    if (!site) return { error: "Unknown managed siteId.", status: 422 };
    if (!site.activePublishedRevisionId) {
      return { error: "Site has no active publication.", status: 503 };
    }
    // Preview / path-based managed page on shared demo host.
    const requireDelivery =
      process.env.MANAGED_REQUIRE_DELIVERY === "1" || process.env.NODE_ENV === "production";
    return {
      siteId: site.id,
      revisionId: site.activePublishedRevisionId,
      hostname: host,
      productionLike: requireDelivery,
      business: {
        name: site.displayName,
        city: input.bodyBusiness?.city?.trim() || "",
        state: input.bodyBusiness?.state?.trim() || "",
      },
    };
  }

  // Demo fleet path: no managed siteId — identity from body is illustrative only.
  const requireDelivery =
    process.env.MANAGED_REQUIRE_DELIVERY === "1" ||
    (process.env.NODE_ENV === "production" && process.env.ALLOW_LEAD_DEMO_MODE !== "1");

  return {
    siteId: "demo",
    revisionId: null,
    hostname: host,
    productionLike: requireDelivery,
    business: {
      name: input.bodyBusiness?.name?.trim() || "Unknown",
      city: input.bodyBusiness?.city?.trim() || "",
      state: input.bodyBusiness?.state?.trim() || "",
    },
  };
}
