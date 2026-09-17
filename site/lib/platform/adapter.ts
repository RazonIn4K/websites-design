import { getClient } from "@/lib/clients";
import type { SiteContent } from "@/lib/content";
import {
  getRevision,
  getSite,
  getSiteBySlug,
  getTemplate,
} from "@/lib/platform/registry";
import { resolveHostname } from "@/lib/platform/resolve-host";
import type { PublishedContent, PublishedRevision } from "@/lib/platform/types";

/**
 * ContentAdapter — JSON kits first.
 * Returns the public published view only (never draft kits).
 * Demo fleet `/sites/<slug>` continues to use getClient() directly.
 */

function applyOverrides(
  base: SiteContent,
  overrides: PublishedRevision["content"]["overrides"] | undefined,
): SiteContent {
  if (!overrides) return base;
  return {
    business: { ...base.business, ...overrides.business },
    en: {
      ...base.en,
      meta: { ...base.en.meta, ...overrides.en?.meta },
    },
    es: {
      ...base.es,
      meta: { ...base.es.meta, ...overrides.es?.meta },
    },
  };
}

/** Replace leftover demo brand strings so sibling kit names do not leak. */
function scrubDemoBrandNames(content: SiteContent, kit: SiteContent): SiteContent {
  const replacements: [string, string][] = [];
  if (kit.business.name && content.business.name && kit.business.name !== content.business.name) {
    replacements.push([kit.business.name, content.business.name]);
  }
  if (
    kit.business.shortName &&
    content.business.shortName &&
    kit.business.shortName !== content.business.shortName
  ) {
    replacements.push([kit.business.shortName, content.business.shortName]);
  }
  if (!replacements.length) return content;

  const scrubValue = (value: unknown): unknown => {
    if (typeof value === "string") {
      let out = value;
      for (const [from, to] of replacements) out = out.split(from).join(to);
      return out;
    }
    if (Array.isArray(value)) return value.map(scrubValue);
    if (value && typeof value === "object") {
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        next[k] = scrubValue(v);
      }
      return next;
    }
    return value;
  };

  return scrubValue(content) as SiteContent;
}

function materializeRevision(
  revision: PublishedRevision,
  siteSlug: string,
  canonicalOrigin: string | null,
): PublishedContent | null {
  if (revision.content.kind !== "demo-kit" && revision.content.kind !== "managed-kit") {
    return null;
  }

  // Pilot: managed kits reuse demo CLIENTS content shape via kitRef slug.
  const demo = getClient(revision.content.kitRef);
  if (!demo) return null;

  const siteContent = scrubDemoBrandNames(
    applyOverrides(demo.site, revision.content.overrides),
    demo.site,
  );

  return {
    siteId: revision.siteId,
    revisionId: revision.id,
    slug: siteSlug,
    layout: revision.layout,
    siteContent,
    themeVars: demo.themeVars,
    emojis: revision.emojis.length ? revision.emojis : demo.emojis,
    schemaTypes: revision.schemaTypes.length ? revision.schemaTypes : demo.schemaTypes,
    assetSlug: revision.assetSlug || demo.slug,
    canonicalOrigin,
  };
}

export function getPublishedContentByRevisionId(
  revisionId: string,
  opts?: { canonicalOrigin?: string | null },
): PublishedContent | null {
  const revision = getRevision(revisionId);
  if (!revision) return null;
  const site = getSite(revision.siteId);
  if (!site) return null;
  return materializeRevision(revision, site.slug, opts?.canonicalOrigin ?? null);
}

/** Serve only the site's active published revision (draft never included). */
export function getPublishedContentForSiteId(
  siteId: string,
  opts?: { canonicalOrigin?: string | null },
): PublishedContent | null {
  const site = getSite(siteId);
  if (!site?.activePublishedRevisionId) return null;
  if (site.status === "archived") return null;
  return getPublishedContentByRevisionId(site.activePublishedRevisionId, opts);
}

export function getPublishedContentBySlug(
  slug: string,
  opts?: { canonicalOrigin?: string | null },
): PublishedContent | null {
  const site = getSiteBySlug(slug);
  if (!site) return null;
  return getPublishedContentForSiteId(site.id, opts);
}

export function getPublishedContentByHostname(
  hostname: string,
): PublishedContent | null {
  const resolved = resolveHostname(hostname);
  if (!resolved) return null;
  const origin = `https://${resolved.hostname}`;
  return materializeRevision(resolved.revision, resolved.site.slug, origin);
}

/**
 * Lookup by hostname | siteId | managed slug.
 * Does not resolve demo CLIENTS slugs — those stay on /sites/<slug>.
 */
export function getPublishedContent(
  key: { hostname?: string; siteId?: string; slug?: string },
): PublishedContent | null {
  if (key.hostname) {
    const byHost = getPublishedContentByHostname(key.hostname);
    if (byHost) return byHost;
  }
  if (key.siteId) return getPublishedContentForSiteId(key.siteId);
  if (key.slug) return getPublishedContentBySlug(key.slug);
  return null;
}

export function describeTemplate(templateId: string) {
  return getTemplate(templateId);
}
