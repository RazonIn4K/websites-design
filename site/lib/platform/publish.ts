import {
  getRevision,
  getSite,
  getTemplate,
  listRevisionsForSite,
  writeRevisionOverlay,
  writeSiteOverlay,
} from "@/lib/platform/registry";
import type { PublishedRevision, SiteRecord } from "@/lib/platform/types";

export class PublishError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "conflict" | "forbidden" | "invalid",
  ) {
    super(message);
    this.name = "PublishError";
  }
}

/**
 * Activate an existing published revision (also used for rollback).
 * Does not touch other tenants or the /sites demo fleet.
 */
export function activateRevision(siteId: string, revisionId: string, actor = "operator"): SiteRecord {
  const site = getSite(siteId);
  if (!site) throw new PublishError(`Unknown site ${siteId}`, "not_found");
  const revision = getRevision(revisionId);
  if (!revision || revision.siteId !== siteId) {
    throw new PublishError(`Revision ${revisionId} not found for site`, "not_found");
  }

  const publishedRevisionIds = site.publishedRevisionIds.includes(revisionId)
    ? site.publishedRevisionIds
    : [...site.publishedRevisionIds, revisionId];

  const next: SiteRecord = {
    ...site,
    status: "published",
    activePublishedRevisionId: revisionId,
    publishedRevisionIds,
    updatedAt: new Date().toISOString(),
  };
  writeSiteOverlay(next);
  void actor;
  return next;
}

/** Roll back to the previous published revision (or a specific prior id). */
export function rollbackPublication(
  siteId: string,
  toRevisionId?: string,
  actor = "operator",
): SiteRecord {
  const site = getSite(siteId);
  if (!site) throw new PublishError(`Unknown site ${siteId}`, "not_found");
  if (!site.activePublishedRevisionId) {
    throw new PublishError("Site has no active publication to roll back", "invalid");
  }

  let target = toRevisionId;
  if (!target) {
    // Step to the revision immediately before the active one in publish order.
    // Do NOT pick "last non-active" — that can re-activate a newer id after
    // one rollback (roll forward).
    const ids = site.publishedRevisionIds;
    const idx = ids.indexOf(site.activePublishedRevisionId);
    if (idx <= 0) {
      throw new PublishError("No prior revision available for rollback", "invalid");
    }
    target = ids[idx - 1];
  }
  if (!target) {
    throw new PublishError("No prior revision available for rollback", "invalid");
  }
  if (target === site.activePublishedRevisionId) {
    throw new PublishError("Target revision is already active", "conflict");
  }
  return activateRevision(siteId, target, actor);
}

/**
 * Snapshot a new published revision from the site's template + optional
 * overrides (operator-approved). Does not auto-activate unless activate=true.
 */
export function createPublishedRevision(input: {
  siteId: string;
  label?: string;
  activate?: boolean;
  actor?: string;
  overrides?: PublishedRevision["content"]["overrides"];
}): { revision: PublishedRevision; site: SiteRecord } {
  const site = getSite(input.siteId);
  if (!site) throw new PublishError(`Unknown site ${input.siteId}`, "not_found");
  const template = getTemplate(site.templateId);
  if (!template) throw new PublishError(`Unknown template ${site.templateId}`, "not_found");

  const id = `rev_${Date.now().toString(36)}`;
  const revision: PublishedRevision = {
    id,
    siteId: site.id,
    createdAt: new Date().toISOString(),
    createdBy: input.actor ?? "operator",
    layout: { ...template.layout },
    emojis: [],
    schemaTypes: [],
    assetSlug: template.referenceDemoSlug,
    content: {
      kind: "demo-kit",
      kitRef: template.referenceDemoSlug,
      overrides: input.overrides,
    },
    label: input.label,
  };
  writeRevisionOverlay(revision);

  let nextSite: SiteRecord = {
    ...site,
    publishedRevisionIds: [...site.publishedRevisionIds, id],
    updatedAt: new Date().toISOString(),
  };
  writeSiteOverlay(nextSite);

  if (input.activate) {
    nextSite = activateRevision(site.id, id, input.actor);
  }

  return { revision, site: nextSite };
}

export function publicationHistory(siteId: string): PublishedRevision[] {
  return listRevisionsForSite(siteId);
}
