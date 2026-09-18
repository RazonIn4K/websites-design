import type { SiteContent } from "@/lib/content";
import type { SiteLayout } from "@/lib/clients";

/** Catalog entry: archetype + default layout levers (not a live customer). */
export interface TemplateRecord {
  id: string;
  name: string;
  archetype: NonNullable<SiteLayout["archetype"]> | "default";
  /** Default layout levers applied when a site is created from this template. */
  layout: SiteLayout;
  /** Demo kit slug used as the JSON content shape reference (not a customer). */
  referenceDemoSlug: string;
  notes?: string;
}

export type SiteStatus = "draft" | "published" | "archived";

/**
 * Mutable site record. Draft content is never served on a customer hostname —
 * only an explicit PublishedRevision is public.
 */
export interface SiteRecord {
  id: string;
  slug: string;
  templateId: string;
  status: SiteStatus;
  /** Operator-facing label (may differ from public business name). */
  displayName: string;
  /** Active public snapshot; null means hostname must 404 / not resolve. */
  activePublishedRevisionId: string | null;
  /** Ordered history of published revision ids (newest last). */
  publishedRevisionIds: string[];
  /**
   * Optional draft kit pointer (JSON path under content/managed/drafts/).
   * Never served on verified customer hostnames.
   */
  draftKitPath?: string;
  createdAt: string;
  updatedAt: string;
}

export type DomainVerification = "pending" | "verified" | "failed";

export interface DomainRecord {
  hostname: string;
  siteId: string;
  verification: DomainVerification;
  /** When false, middleware must not serve this host as production. */
  enabled: boolean;
  notes?: string;
}

/**
 * Immutable published snapshot. Rollback = re-activate a prior revision id.
 * Content is either an inlined SiteContent snapshot or a frozen kit reference
 * plus optional business/copy overrides (JSON kits first).
 */
export interface PublishedRevision {
  id: string;
  siteId: string;
  createdAt: string;
  createdBy: string;
  layout: SiteLayout;
  emojis: string[];
  schemaTypes: string[];
  /** Image/blur slug (may reuse a demo kit until real media exists). */
  assetSlug: string;
  /**
   * Source kit: either a managed kit path or a demo slug reused as shape only.
   * Adapter materializes SiteContent; never serves draftKitPath.
   */
  content: {
    kind: "demo-kit" | "managed-kit";
    /** Demo CLIENTS slug or managed kit folder name. */
    kitRef: string;
    /** Shallow-ish overrides applied after loading the kit (pilot-friendly). */
    overrides?: {
      business?: Partial<SiteContent["business"]>;
      en?: { meta?: Partial<SiteContent["en"]["meta"]> };
      es?: { meta?: Partial<SiteContent["es"]["meta"]> };
    };
  };
  /** Optional note for operators (e.g. "customer approved copy v2"). */
  label?: string;
}

export type LeadDeliveryStatus =
  | "stored"
  | "queued"
  | "delivered"
  | "failed"
  | "dead";

export interface StoredLead {
  id: string;
  siteId: string;
  hostname: string | null;
  revisionId: string | null;
  payload: {
    source: string;
    business: { name: string; city: string; state: string };
    contact: { name: string; email: string; phone: string };
    reservation: { partySize: string; date: string };
    message: string;
    locale: string;
    receivedAt: string;
    meta: { userAgent: string; referer: string };
  };
  deliveryStatus: LeadDeliveryStatus;
  deliveryAttempts: number;
  lastDeliveryError?: string;
  nextRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Resolved public view for the renderer (matches SitePage inputs). */
export interface PublishedContent {
  siteId: string;
  revisionId: string;
  slug: string;
  layout: SiteLayout;
  siteContent: SiteContent;
  themeVars: Record<string, string>;
  emojis: string[];
  schemaTypes: string[];
  assetSlug: string;
  canonicalOrigin: string | null;
}
