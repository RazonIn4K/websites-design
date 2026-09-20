/**
 * Lead persistence port for the managed pilot.
 * File-backed locally (`./store`), with optional durable Supabase persist
 * (`./supabase`) when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
 */
export {
  createLeadId,
  persistLead,
  readLead,
  listLeadsForSite,
  updateLeadDelivery,
  listRetryableLeads,
  resetLeadStoreForTests,
} from "./store";

export {
  persistLeadToSupabase,
  updateLeadDeliveryInSupabase,
  isSupabaseConfigured,
  resetSupabaseClientForTests,
} from "./supabase";
