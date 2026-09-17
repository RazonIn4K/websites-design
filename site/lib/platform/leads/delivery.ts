import {
  listRetryableLeads,
  readLead,
  updateLeadDelivery,
} from "@/lib/platform/leads/store";
import type { StoredLead } from "@/lib/platform/types";

const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [30_000, 120_000, 600_000, 1_800_000, 3_600_000];

export interface DeliveryResult {
  ok: boolean;
  status?: number;
  error?: string;
}

/**
 * Attempt webhook delivery for a stored lead.
 * Owner on silent failure: RazonWorks ops (see MANAGED_PUBLISH.md).
 */
export async function deliverLead(lead: StoredLead): Promise<DeliveryResult> {
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    return { ok: false, error: "LEAD_WEBHOOK_URL unset" };
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEAD_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.LEAD_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        ...lead.payload,
        leadId: lead.id,
        siteId: lead.siteId,
        revisionId: lead.revisionId,
        hostname: lead.hostname,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { ok: false, status: res.status, error: `webhook HTTP ${res.status}` };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function attemptDelivery(siteId: string, leadId: string): Promise<StoredLead | null> {
  const lead = readLead(siteId, leadId);
  if (!lead) return null;

  const attempts = lead.deliveryAttempts + 1;
  const result = await deliverLead(lead);

  if (result.ok) {
    return updateLeadDelivery(siteId, leadId, {
      deliveryStatus: "delivered",
      deliveryAttempts: attempts,
      lastDeliveryError: undefined,
      nextRetryAt: null,
    });
  }

  if (attempts >= MAX_ATTEMPTS) {
    console.error(
      `[lead] DEAD site=${siteId} lead=${leadId} attempts=${attempts} error=${result.error} owner=razonworks-ops`,
    );
    return updateLeadDelivery(siteId, leadId, {
      deliveryStatus: "dead",
      deliveryAttempts: attempts,
      lastDeliveryError: result.error,
      nextRetryAt: null,
    });
  }

  const delay = BACKOFF_MS[Math.min(attempts - 1, BACKOFF_MS.length - 1)] ?? 3_600_000;
  const nextRetryAt = new Date(Date.now() + delay).toISOString();
  console.error(
    `[lead] FAILED site=${siteId} lead=${leadId} attempt=${attempts} retryAt=${nextRetryAt} error=${result.error} owner=razonworks-ops`,
  );
  return updateLeadDelivery(siteId, leadId, {
    deliveryStatus: "failed",
    deliveryAttempts: attempts,
    lastDeliveryError: result.error,
    nextRetryAt,
  });
}

/** Process retry queue for one site (hook for cron / operator). */
export async function processLeadRetries(siteId: string): Promise<number> {
  const due = listRetryableLeads(siteId);
  let n = 0;
  for (const lead of due) {
    await attemptDelivery(siteId, lead.id);
    n += 1;
  }
  return n;
}
