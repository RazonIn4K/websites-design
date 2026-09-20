/**
 * Supabase adapter for durable lead persistence.
 *
 * When SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set, leads are persisted
 * to the managed_leads table in Supabase. This survives Vercel /tmp and cold
 * starts.
 *
 * If env vars are unset, logs a warning once and continues (webhook still works).
 * Service role key is never exposed to the client.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { StoredLead, LeadDeliveryStatus } from "@/lib/platform/types";

let client: SupabaseClient | null = null;
let warnedMissingConfig = false;

function getClient(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (!warnedMissingConfig) {
      console.warn(
        "[lead/supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY unset — durable Supabase persist disabled owner=razonworks-ops"
      );
      warnedMissingConfig = true;
    }
    return null;
  }

  client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return client;
}

export interface SupabasePersistResult {
  ok: boolean;
  error?: string;
}

/**
 * Map StoredLead to managed_leads table row.
 * Uses lead.id as primary key (upsert on conflict does nothing).
 */
function mapLeadToRow(lead: StoredLead): Record<string, unknown> {
  return {
    id: lead.id,
    site_id: lead.siteId,
    hostname: lead.hostname,
    revision_id: lead.revisionId,
    source: lead.payload.source,
    business_name: lead.payload.business.name,
    business_city: lead.payload.business.city,
    business_state: lead.payload.business.state,
    contact_name: lead.payload.contact.name,
    contact_email: lead.payload.contact.email,
    contact_phone: lead.payload.contact.phone,
    message: lead.payload.message,
    locale: lead.payload.locale,
    payload: lead.payload,
    delivery_status: lead.deliveryStatus,
    received_at: lead.payload.receivedAt,
    created_at: lead.createdAt,
  };
}

/**
 * Persist a lead to Supabase managed_leads table.
 *
 * On conflict (same id), does nothing — first write wins.
 * Returns { ok: true } on success, { ok: false, error } on failure.
 */
export async function persistLeadToSupabase(
  lead: StoredLead
): Promise<SupabasePersistResult> {
  const supabase = getClient();
  if (!supabase) {
    return { ok: false, error: "Supabase not configured" };
  }

  try {
    const row = mapLeadToRow(lead);
    const { error } = await supabase
      .from("managed_leads")
      .upsert(row, { onConflict: "id", ignoreDuplicates: true });

    if (error) {
      console.error(
        `[lead/supabase] insert failed lead=${lead.id} site=${lead.siteId} error=${error.message} owner=razonworks-ops`
      );
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[lead/supabase] insert exception lead=${lead.id} site=${lead.siteId} error=${message} owner=razonworks-ops`
    );
    return { ok: false, error: message };
  }
}

/**
 * Update delivery status in Supabase.
 * Called after webhook delivery attempt to sync status.
 */
export async function updateLeadDeliveryInSupabase(
  leadId: string,
  deliveryStatus: LeadDeliveryStatus
): Promise<SupabasePersistResult> {
  const supabase = getClient();
  if (!supabase) {
    return { ok: false, error: "Supabase not configured" };
  }

  try {
    const { error } = await supabase
      .from("managed_leads")
      .update({ delivery_status: deliveryStatus })
      .eq("id", leadId);

    if (error) {
      console.error(
        `[lead/supabase] status update failed lead=${leadId} error=${error.message} owner=razonworks-ops`
      );
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[lead/supabase] status update exception lead=${leadId} error=${message} owner=razonworks-ops`
    );
    return { ok: false, error: message };
  }
}

/**
 * Check if Supabase persist is configured.
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Test helper — reset client and warning flag. */
export function resetSupabaseClientForTests(): void {
  client = null;
  warnedMissingConfig = false;
}
