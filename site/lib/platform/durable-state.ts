/**
 * Durable active-revision state for managed sites.
 *
 * Uses Vercel Edge Config for reads (ultra-low latency global edge) and the
 * Vercel REST API for writes. Falls back to committed sites.json when Edge
 * Config is unconfigured or empty.
 *
 * Env vars (reads):
 *   GLOBAL_CONFIG           — Edge Config connection string (auto-linked by Vercel)
 *   EDGE_CONFIG             — Legacy alias (same behavior)
 *
 * Env vars (writes):
 *   EDGE_CONFIG_ID          — Edge Config ID (ecfg_...) for write ops
 *   VERCEL_API_TOKEN        — Vercel API token for write ops (operator scope)
 *   VERCEL_TEAM_ID          — (optional) Team ID for write ops
 *
 * Key schema in Edge Config:
 *   managed_active_revisions → { [siteId: string]: string } (siteId → revisionId)
 */

import { createClient, type EdgeConfigClient } from "@vercel/global-config";

const EDGE_CONFIG_KEY = "managed_active_revisions";

type ActiveRevisionMap = Record<string, string>;

let cachedClient: EdgeConfigClient | null = null;

function getEdgeConfigConnectionString(): string | undefined {
  return process.env.GLOBAL_CONFIG || process.env.EDGE_CONFIG;
}

function getEdgeConfigClient(): EdgeConfigClient | null {
  const connectionString = getEdgeConfigConnectionString();
  if (!connectionString) return null;
  if (!cachedClient) {
    cachedClient = createClient(connectionString);
  }
  return cachedClient;
}

/**
 * Read active revision for a site from durable store.
 * Returns null if unconfigured, not found, or on error (caller falls back to sites.json).
 */
export async function getDurableActiveRevision(siteId: string): Promise<string | null> {
  try {
    const client = getEdgeConfigClient();
    if (!client) return null;

    const map = await client.get<ActiveRevisionMap>(EDGE_CONFIG_KEY);
    if (!map || typeof map !== "object") return null;

    return map[siteId] ?? null;
  } catch (err) {
    console.warn("[durable-state] getDurableActiveRevision error:", err);
    return null;
  }
}

/**
 * Read all active revisions from durable store.
 * Returns empty object if unconfigured or on error.
 */
export async function getAllDurableActiveRevisions(): Promise<ActiveRevisionMap> {
  try {
    const client = getEdgeConfigClient();
    if (!client) return {};

    const map = await client.get<ActiveRevisionMap>(EDGE_CONFIG_KEY);
    return map && typeof map === "object" ? map : {};
  } catch (err) {
    console.warn("[durable-state] getAllDurableActiveRevisions error:", err);
    return {};
  }
}

/**
 * Write active revision for a site to durable store.
 * Uses direct REST API call to PATCH /v1/global-config/{id}/items.
 * Requires EDGE_CONFIG_ID + VERCEL_API_TOKEN.
 * Returns true on success, false on failure or if write is unconfigured.
 */
export async function setDurableActiveRevision(
  siteId: string,
  revisionId: string
): Promise<boolean> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const apiToken = process.env.VERCEL_API_TOKEN;

  if (!edgeConfigId || !apiToken) {
    console.warn(
      "[durable-state] setDurableActiveRevision: EDGE_CONFIG_ID or VERCEL_API_TOKEN not set"
    );
    return false;
  }

  try {
    const current = await getAllDurableActiveRevisions();
    const updated: ActiveRevisionMap = { ...current, [siteId]: revisionId };

    const teamId = process.env.VERCEL_TEAM_ID;
    const url = new URL(`https://api.vercel.com/v1/global-config/${edgeConfigId}/items`);
    if (teamId) url.searchParams.set("teamId", teamId);

    const response = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            operation: "upsert",
            key: EDGE_CONFIG_KEY,
            value: updated,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[durable-state] setDurableActiveRevision API error: ${response.status} ${text}`
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("[durable-state] setDurableActiveRevision error:", err);
    return false;
  }
}

/**
 * Check if durable store is configured for reads.
 */
export function isDurableReadConfigured(): boolean {
  return Boolean(getEdgeConfigConnectionString());
}

/**
 * Check if durable store is configured for writes.
 */
export function isDurableWriteConfigured(): boolean {
  return Boolean(process.env.EDGE_CONFIG_ID && process.env.VERCEL_API_TOKEN);
}

/**
 * Test helper: mock the Edge Config client for unit tests.
 */
let mockActiveRevisions: ActiveRevisionMap | null = null;

export function setMockActiveRevisions(map: ActiveRevisionMap | null): void {
  mockActiveRevisions = map;
}

export async function getDurableActiveRevisionWithMock(
  siteId: string
): Promise<string | null> {
  if (mockActiveRevisions !== null) {
    return mockActiveRevisions[siteId] ?? null;
  }
  return getDurableActiveRevision(siteId);
}
