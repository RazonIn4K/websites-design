import templatesJson from "@/content/managed/templates.json";
import sitesJson from "@/content/managed/sites.json";
import domainsJson from "@/content/managed/domains.json";
import type {
  DomainRecord,
  PublishedRevision,
  SiteRecord,
  TemplateRecord,
} from "@/lib/platform/types";
import { getDurableActiveRevision, isDurableReadConfigured } from "@/lib/platform/durable-state";

/**
 * In-repo managed registry (JSON kits first). Payload can later implement the
 * same read surface without changing the adapter contract.
 *
 * Active revision lookup priority:
 * 1. Vercel Edge Config (durable, cross-instance) — when EDGE_CONFIG is set
 * 2. Process-local overlay (transient, for tests and single-instance dev)
 * 3. Committed sites.json (cold-start fallback)
 *
 * On Vercel, operator rollback writes to Edge Config; every subsequent request
 * reads the durable state, ensuring visible content switch across all instances.
 */

const templates = templatesJson as TemplateRecord[];
const baseSites = sitesJson as SiteRecord[];
const baseDomains = domainsJson as DomainRecord[];

/** Process-local overlays for operator publish/rollback within this instance. */
const siteOverlay = new Map<string, SiteRecord>();
const revisionOverlay = new Map<string, PublishedRevision>();

function cloneSites(): SiteRecord[] {
  return baseSites.map((s) => {
    const over = siteOverlay.get(s.id);
    return over ? { ...over, publishedRevisionIds: [...over.publishedRevisionIds] } : { ...s, publishedRevisionIds: [...s.publishedRevisionIds] };
  });
}

export function listTemplates(): TemplateRecord[] {
  return templates.map((t) => ({ ...t, layout: { ...t.layout } }));
}

export function getTemplate(id: string): TemplateRecord | undefined {
  return listTemplates().find((t) => t.id === id);
}

export function listSites(): SiteRecord[] {
  return cloneSites();
}

export function getSite(id: string): SiteRecord | undefined {
  return cloneSites().find((s) => s.id === id);
}

/**
 * Async site lookup that checks the durable store for the active revision.
 * Use this in SSR/API routes where the extra await is acceptable.
 * Falls back to sites.json when Edge Config is unconfigured or empty.
 */
export async function getSiteAsync(id: string): Promise<SiteRecord | undefined> {
  const base = getSite(id);
  if (!base) return undefined;

  if (isDurableReadConfigured()) {
    const durableRevisionId = await getDurableActiveRevision(id);
    if (durableRevisionId) {
      return {
        ...base,
        activePublishedRevisionId: durableRevisionId,
      };
    }
  }

  return base;
}

export function getSiteBySlug(slug: string): SiteRecord | undefined {
  return cloneSites().find((s) => s.slug === slug);
}

/**
 * Async slug lookup that checks the durable store for the active revision.
 */
export async function getSiteBySlugAsync(slug: string): Promise<SiteRecord | undefined> {
  const base = getSiteBySlug(slug);
  if (!base) return undefined;

  if (isDurableReadConfigured()) {
    const durableRevisionId = await getDurableActiveRevision(base.id);
    if (durableRevisionId) {
      return {
        ...base,
        activePublishedRevisionId: durableRevisionId,
      };
    }
  }

  return base;
}

export function listDomains(): DomainRecord[] {
  // Env overlay: MANAGED_DOMAIN_MAP=hostname:siteId,hostname2:siteId
  const fromEnv = parseDomainMapEnv(process.env.MANAGED_DOMAIN_MAP);
  const merged = new Map<string, DomainRecord>();
  for (const d of baseDomains) merged.set(normalizeHostname(d.hostname), { ...d });
  for (const d of fromEnv) merged.set(normalizeHostname(d.hostname), d);
  return [...merged.values()];
}

export function getDomain(hostname: string): DomainRecord | undefined {
  const host = normalizeHostname(hostname);
  return listDomains().find((d) => normalizeHostname(d.hostname) === host);
}

export function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, "").split(":")[0] ?? "";
}

function parseDomainMapEnv(raw: string | undefined): DomainRecord[] {
  if (!raw?.trim()) return [];
  return raw.split(",").flatMap((pair) => {
    const [hostname, siteId] = pair.split(":").map((s) => s.trim());
    if (!hostname || !siteId) return [];
    return [
      {
        hostname: normalizeHostname(hostname),
        siteId,
        verification: "verified" as const,
        enabled: true,
        notes: "From MANAGED_DOMAIN_MAP env",
      },
    ];
  });
}

/** Load a committed revision JSON (static import map for pilot kits). */
import rev001 from "@/content/managed/revisions/site_pilot_craft/rev_001.json";
import rev002 from "@/content/managed/revisions/site_pilot_craft/rev_002.json";
import mccabesRev001 from "@/content/managed/revisions/site_mccabes/rev_001.json";
import mccabesRev002 from "@/content/managed/revisions/site_mccabes/rev_002.json";

const committedRevisions: PublishedRevision[] = [
  rev001 as PublishedRevision,
  rev002 as PublishedRevision,
  mccabesRev001 as PublishedRevision,
  mccabesRev002 as PublishedRevision,
];

/**
 * Look up a revision by (siteId, revisionId). Revision IDs are only unique
 * within a site, so callers must provide the site context.
 */
export function getRevision(siteId: string, revisionId: string): PublishedRevision | undefined {
  const overlayKey = `${siteId}:${revisionId}`;
  const over = revisionOverlay.get(overlayKey);
  if (over) return over;
  return committedRevisions.find((r) => r.siteId === siteId && r.id === revisionId);
}

export function listRevisionsForSite(siteId: string): PublishedRevision[] {
  const committed = committedRevisions.filter((r) => r.siteId === siteId);
  const extras = [...revisionOverlay.values()].filter((r) => r.siteId === siteId);
  const byRevisionId = new Map<string, PublishedRevision>();
  for (const r of committed) byRevisionId.set(r.id, r);
  for (const r of extras) byRevisionId.set(r.id, r);
  return [...byRevisionId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Mutate site active revision (publish / rollback). In-memory overlay only. */
export function writeSiteOverlay(site: SiteRecord): void {
  siteOverlay.set(site.id, {
    ...site,
    publishedRevisionIds: [...site.publishedRevisionIds],
    updatedAt: new Date().toISOString(),
  });
}

export function writeRevisionOverlay(revision: PublishedRevision): void {
  const overlayKey = `${revision.siteId}:${revision.id}`;
  revisionOverlay.set(overlayKey, revision);
}

/** Test helper — clear overlays between cases. */
export function resetRegistryOverlays(): void {
  siteOverlay.clear();
  revisionOverlay.clear();
}
