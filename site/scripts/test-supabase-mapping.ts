/**
 * Supabase lead mapping verification (no Supabase connection required).
 * Run from site/: `npx tsx scripts/test-supabase-mapping.ts`
 *
 * Tests the lead → managed_leads row mapping logic and exports it for
 * verification against the actual Supabase table schema.
 */

import assert from "node:assert/strict";
import type { StoredLead } from "../lib/platform/types";

/**
 * Mirror of mapLeadToRow from lib/platform/leads/supabase.ts
 * Duplicated here to test mapping without importing the module
 * (which would try to initialize the Supabase client).
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

const EXPECTED_COLUMNS = [
  "id",
  "site_id",
  "hostname",
  "revision_id",
  "source",
  "business_name",
  "business_city",
  "business_state",
  "contact_name",
  "contact_email",
  "contact_phone",
  "message",
  "locale",
  "payload",
  "delivery_status",
  "received_at",
  "created_at",
] as const;

function main() {
  console.log("1. Lead mapping produces all expected columns");

  const sampleLead: StoredLead = {
    id: "lead_test123_abc456",
    siteId: "site_pilot_craft",
    hostname: "pilot.managed.localhost",
    revisionId: "rev_002",
    payload: {
      source: "website",
      business: { name: "Pilot Craft Auto", city: "Sycamore", state: "IL" },
      contact: { name: "Test User", email: "test@example.com", phone: "555-1234" },
      reservation: { partySize: "4", date: "2024-12-15" },
      message: "Testing Supabase persist",
      locale: "en",
      receivedAt: "2024-12-10T10:30:00.000Z",
      meta: { userAgent: "Mozilla/5.0", referer: "https://pilot.managed.localhost/" },
    },
    deliveryStatus: "queued",
    deliveryAttempts: 0,
    createdAt: "2024-12-10T10:30:00.000Z",
    updatedAt: "2024-12-10T10:30:00.000Z",
  };

  const row = mapLeadToRow(sampleLead);

  for (const col of EXPECTED_COLUMNS) {
    assert.ok(col in row, `missing column: ${col}`);
  }
  console.log("   All expected columns present");

  console.log("2. Column values map correctly");
  assert.equal(row.id, "lead_test123_abc456");
  assert.equal(row.site_id, "site_pilot_craft");
  assert.equal(row.hostname, "pilot.managed.localhost");
  assert.equal(row.revision_id, "rev_002");
  assert.equal(row.source, "website");
  assert.equal(row.business_name, "Pilot Craft Auto");
  assert.equal(row.business_city, "Sycamore");
  assert.equal(row.business_state, "IL");
  assert.equal(row.contact_name, "Test User");
  assert.equal(row.contact_email, "test@example.com");
  assert.equal(row.contact_phone, "555-1234");
  assert.equal(row.message, "Testing Supabase persist");
  assert.equal(row.locale, "en");
  assert.equal(row.delivery_status, "queued");
  assert.equal(row.received_at, "2024-12-10T10:30:00.000Z");
  assert.equal(row.created_at, "2024-12-10T10:30:00.000Z");
  console.log("   All values map correctly");

  console.log("3. Payload includes full lead data as JSONB");
  assert.ok(typeof row.payload === "object");
  const payload = row.payload as StoredLead["payload"];
  assert.equal(payload.source, "website");
  assert.equal(payload.business.name, "Pilot Craft Auto");
  assert.equal(payload.contact.email, "test@example.com");
  assert.equal(payload.reservation.partySize, "4");
  assert.equal(payload.meta.userAgent, "Mozilla/5.0");
  console.log("   Payload preserved correctly");

  console.log("4. Null hostname/revisionId handled");
  const leadNoHost: StoredLead = {
    ...sampleLead,
    id: "lead_test_nohost",
    hostname: null,
    revisionId: null,
  };
  const rowNoHost = mapLeadToRow(leadNoHost);
  assert.equal(rowNoHost.hostname, null);
  assert.equal(rowNoHost.revision_id, null);
  console.log("   Null values preserved");

  console.log("5. Spanish locale maps correctly");
  const leadEs: StoredLead = {
    ...sampleLead,
    id: "lead_test_es",
    payload: { ...sampleLead.payload, locale: "es" },
  };
  const rowEs = mapLeadToRow(leadEs);
  assert.equal(rowEs.locale, "es");
  console.log("   Spanish locale works");

  console.log("6. All delivery statuses map correctly");
  const statuses: StoredLead["deliveryStatus"][] = [
    "stored",
    "queued",
    "delivered",
    "failed",
    "dead",
  ];
  for (const status of statuses) {
    const lead: StoredLead = { ...sampleLead, id: `lead_${status}`, deliveryStatus: status };
    const r = mapLeadToRow(lead);
    assert.equal(r.delivery_status, status);
  }
  console.log("   All delivery statuses work");

  console.log("\n7. Sample INSERT for manual Supabase verification:");
  console.log("--------------------------------------------------");
  const insertCols = EXPECTED_COLUMNS.join(", ");
  const insertVals = EXPECTED_COLUMNS.map((col) => {
    const v = row[col];
    if (v === null) return "NULL";
    if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
    if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
    return String(v);
  }).join(", ");
  console.log(`INSERT INTO managed_leads (${insertCols})`);
  console.log(`VALUES (${insertVals});`);
  console.log("--------------------------------------------------");

  console.log("\nAll Supabase mapping checks passed.");
}

main();
