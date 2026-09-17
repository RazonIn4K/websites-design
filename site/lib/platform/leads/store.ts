import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { LeadDeliveryStatus, StoredLead } from "@/lib/platform/types";

/**
 * Lead persistence for the managed pilot.
 *
 * Prefer LEAD_STORE_DIR, then a writable path (`/tmp` on Vercel), then an
 * in-memory fallback so persist failure never blocks webhook delivery.
 * Durable Postgres/Payload remains step 3.
 */

const memoryStore = new Map<string, StoredLead>();

function memoryKey(siteId: string, leadId: string): string {
  return `${siteId}/${leadId}`;
}

function preferredStoreDirs(): string[] {
  if (process.env.LEAD_STORE_DIR) return [process.env.LEAD_STORE_DIR];
  const dirs: string[] = [];
  // Vercel/Lambda: cwd is read-only; /tmp is writable (ephemeral).
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    dirs.push(join("/tmp", "websites-design-leads"));
  }
  dirs.push(join(/*turbopackIgnore: true*/ process.cwd(), ".data", "leads"));
  return dirs;
}

let resolvedStoreDir: string | null | undefined;

/** null => memory-only mode (FS unusable). */
function storeDir(): string | null {
  if (resolvedStoreDir !== undefined) return resolvedStoreDir;
  for (const dir of preferredStoreDirs()) {
    try {
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      // Probe write access.
      const probe = join(dir, `.probe_${process.pid}`);
      writeFileSync(probe, "ok", "utf8");
      try {
        unlinkSync(probe);
      } catch {
        /* ignore */
      }
      resolvedStoreDir = dir;
      return dir;
    } catch {
      /* try next */
    }
  }
  resolvedStoreDir = null;
  return null;
}

/** Test helper — clear FS probe cache + memory. */
export function resetLeadStoreForTests(): void {
  resolvedStoreDir = undefined;
  memoryStore.clear();
}

function siteDir(siteId: string): string | null {
  const root = storeDir();
  if (!root) return null;
  const safe = siteId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return join(root, safe);
}

function ensureDir(path: string) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function leadPath(siteId: string, leadId: string): string | null {
  const dir = siteDir(siteId);
  if (!dir) return null;
  return join(dir, `${leadId}.json`);
}

export function createLeadId(): string {
  return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type PersistBackend = "fs" | "memory";

export function persistLead(lead: StoredLead): { lead: StoredLead; backend: PersistBackend } {
  const path = leadPath(lead.siteId, lead.id);
  if (path) {
    try {
      const dir = siteDir(lead.siteId)!;
      ensureDir(dir);
      const tmp = `${path}.tmp`;
      writeFileSync(tmp, JSON.stringify(lead, null, 2), "utf8");
      renameSync(tmp, path);
      memoryStore.set(memoryKey(lead.siteId, lead.id), lead);
      return { lead, backend: "fs" };
    } catch (err) {
      console.error("[lead] FS persist failed — falling back to memory owner=razonworks-ops", err);
    }
  }
  memoryStore.set(memoryKey(lead.siteId, lead.id), lead);
  return { lead, backend: "memory" };
}

export function readLead(siteId: string, leadId: string): StoredLead | null {
  const mem = memoryStore.get(memoryKey(siteId, leadId));
  if (mem) return mem;

  const path = leadPath(siteId, leadId);
  if (!path || !existsSync(path)) return null;
  const lead = JSON.parse(readFileSync(path, "utf8")) as StoredLead;
  memoryStore.set(memoryKey(siteId, leadId), lead);
  return lead;
}

export function listLeadsForSite(siteId: string): StoredLead[] {
  const byId = new Map<string, StoredLead>();

  for (const [key, lead] of memoryStore) {
    if (key.startsWith(`${siteId}/`)) byId.set(lead.id, lead);
  }

  const dir = siteDir(siteId);
  if (dir && existsSync(dir)) {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json") || f.endsWith(".tmp")) continue;
      try {
        const lead = JSON.parse(readFileSync(join(dir, f), "utf8")) as StoredLead;
        if (!byId.has(lead.id)) byId.set(lead.id, lead);
      } catch {
        /* skip corrupt */
      }
    }
  }

  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
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
  return persistLead(next).lead;
}

/** Leads ready for retry (failed/queued with nextRetryAt <= now). */
export function listRetryableLeads(siteId: string, now = new Date()): StoredLead[] {
  return listLeadsForSite(siteId).filter((l) => {
    if (l.deliveryStatus !== "failed" && l.deliveryStatus !== "queued") return false;
    if (!l.nextRetryAt) return l.deliveryStatus === "queued" || l.deliveryStatus === "failed";
    return new Date(l.nextRetryAt).getTime() <= now.getTime();
  });
}
