import {
  getRevision,
  getSite,
  getSiteAsync,
  getTemplate,
  listRevisionsForSite,
  writeRevisionOverlay,
  writeSiteOverlay,
} from "@/lib/platform/registry";
import {
  setDurableActiveRevision,
  setDurableActiveRevisionWithMock,
  isDurableWriteConfigured,
  getMockActiveRevisions,
} from "@/lib/platform/durable-state";
import type { PublishedRevision, SiteRecord } from "@/lib/platform/types";

export class PublishError extends Error {
  constructor(
    message: string,
    readonly code: "not_found" | "conflict" | "forbidden" | "invalid" | "durable_write_failed",
  ) {
    super(message);
    this.name = "PublishError";
  }
}

export type ActivateResult = {
  site: SiteRecord;
  durableWriteOk: boolean;
};

/**
 * Activate an existing published revision (also used for rollback).
 * Does not touch other tenants or the /sites demo fleet.
 *
 * This is the async version that persists to the durable store (Edge Config)
 * when configured. Use this in API routes.
 *
 * When durable write is configured but fails, throws PublishError with code
 * "durable_write_failed" — the overlay is still updated for the current
 * process but global state may be inconsistent.
 */
export async function activateRevisionAsync(
  siteId: string,
  revisionId: string,
  actor = "operator"
): Promise<ActivateResult> {
  const site = getSite(siteId);
  if (!site) throw new PublishError(`Unknown site ${siteId}`, "not_found");
  const revision = getRevision(siteId, revisionId);
  if (!revision) {
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

  let durableWriteOk = true;
  const durableConfigured = isDurableWriteConfigured();
  const mockActive = getMockActiveRevisions();

  if (durableConfigured || mockActive !== null) {
    const writeResult = mockActive !== null
      ? await setDurableActiveRevisionWithMock(siteId, revisionId)
      : await setDurableActiveRevision(siteId, revisionId);

    if (!writeResult) {
      durableWriteOk = false;
      throw new PublishError(
        `Durable write failed for ${siteId}→${revisionId}; overlay updated but global state may be stale`,
        "durable_write_failed"
      );
    }
  }

  void actor;
  return { site: next, durableWriteOk };
}

/**
 * Sync variant for tests / local dev without durable store.
 * @deprecated Use activateRevisionAsync in production API routes.
 */
export function activateRevision(siteId: string, revisionId: string, actor = "operator"): SiteRecord {
  const site = getSite(siteId);
  if (!site) throw new PublishError(`Unknown site ${siteId}`, "not_found");
  const revision = getRevision(siteId, revisionId);
  if (!revision) {
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

export type RollbackResult = {
  site: SiteRecord;
  durableWriteOk: boolean;
};

/**
 * Roll back to the previous published revision (or a specific prior id).
 * Async version that persists to durable store. Use in API routes.
 *
 * This version uses getSiteAsync to read the durable active revision from
 * Edge Config, avoiding conflicts when the durable state differs from the
 * committed sites.json.
 *
 * Throws PublishError with code "durable_write_failed" if durable write is
 * configured but fails.
 */
export async function rollbackPublicationAsync(
  siteId: string,
  toRevisionId?: string,
  actor = "operator",
): Promise<RollbackResult> {
  const site = await getSiteAsync(siteId);
  if (!site) throw new PublishError(`Unknown site ${siteId}`, "not_found");

  const durableActive = site.activePublishedRevisionId;
  if (!durableActive) {
    throw new PublishError("Site has no active publication to roll back", "invalid");
  }

  let target = toRevisionId;
  if (!target) {
    const ids = site.publishedRevisionIds;
    const idx = ids.indexOf(durableActive);
    if (idx <= 0) {
      throw new PublishError("No prior revision available for rollback", "invalid");
    }
    target = ids[idx - 1];
  }
  if (!target) {
    throw new PublishError("No prior revision available for rollback", "invalid");
  }
  if (target === durableActive) {
    throw new PublishError("Target revision is already active", "conflict");
  }
  const result = await activateRevisionAsync(siteId, target, actor);
  return { site: result.site, durableWriteOk: result.durableWriteOk };
}

/**
 * Sync variant for tests / local dev without durable store.
 * @deprecated Use rollbackPublicationAsync in production API routes.
 */
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

export type CreateRevisionResult = {
  revision: PublishedRevision;
  site: SiteRecord;
  durableWriteOk: boolean;
};

/**
 * Snapshot a new published revision from the site's template + optional
 * overrides (operator-approved). Does not auto-activate unless activate=true.
 * Async version for API routes — persists to durable store when configured.
 *
 * Throws PublishError with code "durable_write_failed" if activate=true and
 * durable write is configured but fails.
 */
export async function createPublishedRevisionAsync(input: {
  siteId: string;
  label?: string;
  activate?: boolean;
  actor?: string;
  overrides?: PublishedRevision["content"]["overrides"];
}): Promise<CreateRevisionResult> {
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

  let durableWriteOk = true;
  if (input.activate) {
    const result = await activateRevisionAsync(site.id, id, input.actor);
    nextSite = result.site;
    durableWriteOk = result.durableWriteOk;
  }

  return { revision, site: nextSite, durableWriteOk };
}

/**
 * Sync variant for tests / local dev without durable store.
 * @deprecated Use createPublishedRevisionAsync in production API routes.
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
