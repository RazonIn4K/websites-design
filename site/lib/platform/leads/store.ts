import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { LeadDeliveryStatus, StoredLead } from "@/lib/platform/types";

/**
 * Lead persistence for the managed pilot.
 *
 * File store under LEAD_STORE_DIR (default site/.data/leads) — durable on a
 * single long-lived Node process; on Vercel serverless the filesystem is
 * ephemeral (UNKNOWN durable target until Postgres/Payload). Failures stay
 * visible via deliveryStatus + lastDeliveryError regardless of backend.
 */

function storeDir(): string {
  if (process.env.LEAD_STORE_DIR) return process.env.LEAD_STORE_DIR;
  // Scope NFT tracing to .data/leads only (not whole project cwd).
  return join(/*turbopackIgnore: true*/ process.cwd(), ".data", "leads");
}

function siteDir(siteId: string): string {
  // Tenant isolation: one directory per siteId (never mixed with demo fleet).
  const safe = siteId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return join(storeDir(), safe);
}

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function leadPath(siteId: string, leadId: string): string {
  return join(siteDir(siteId), `${leadId}.json`);
}

export function createLeadId(): string {
  return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function persistLead(lead: StoredLead): StoredLead {
  const dir = siteDir(lead.siteId);
  ensureDir(dir);
  const tmp = leadPath(lead.siteId, lead.id) + ".tmp";
  const final = leadPath(lead.siteId, lead.id);
  writeFileSync(tmp, JSON.stringify(lead, null, 2), "utf8");
  renameSync(tmp, final);
  return lead;
}

export function readLead(siteId: string, leadId: string): StoredLead | null {
  const path = leadPath(siteId, leadId);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as StoredLead;
}

export function listLeadsForSite(siteId: string): StoredLead[] {
  const dir = siteDir(siteId);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.endsWith(".tmp"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as StoredLead)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function updateLeadDelivery(
  siteId: string,
  leadId: string,
  patch: {
    deliveryStatus: LeadDeliveryStatus;
    deliveryAttempts?: number;
    lastDeliveryError?: string;
    nextRetryAt?: string | null;
  },
): StoredLead | null {
  const lead = readLead(siteId, leadId);
  if (!lead) return null;
  const next: StoredLead = {
    ...lead,
    deliveryStatus: patch.deliveryStatus,
    deliveryAttempts: patch.deliveryAttempts ?? lead.deliveryAttempts,
    lastDeliveryError: patch.lastDeliveryError,
    nextRetryAt: patch.nextRetryAt === null ? undefined : (patch.nextRetryAt ?? lead.nextRetryAt),
    updatedAt: new Date().toISOString(),
  };
  return persistLead(next);
}

/** Leads ready for retry (failed/queued with nextRetryAt <= now). */
export function listRetryableLeads(siteId: string, now = new Date()): StoredLead[] {
  return listLeadsForSite(siteId).filter((l) => {
    if (l.deliveryStatus !== "failed" && l.deliveryStatus !== "queued") return false;
    if (!l.nextRetryAt) return l.deliveryStatus === "queued" || l.deliveryStatus === "failed";
    return new Date(l.nextRetryAt).getTime() <= now.getTime();
  });
}
