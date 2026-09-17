/**
 * Lead persistence port for the managed pilot.
 * File-backed today (`./store`); Postgres/Payload should implement the same
 * function surface later without changing `/api/lead`.
 */
export {
  createLeadId,
  persistLead,
  readLead,
  listLeadsForSite,
  updateLeadDelivery,
  listRetryableLeads,
} from "./store";
