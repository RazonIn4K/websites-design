# Managed publish pilot

First managed-platform work packet for `websites-design`.  
Demo catalog at `/sites/<slug>` is unchanged. Managed sites use Template → Site → PublishedRevision + hostname mapping.

## Surfaces

| Path | Role |
| ---- | ---- |
| `/sites/<slug>` | Prospect demos (fleet) |
| `/m/<siteId>` | Managed published revision (also hostname rewrite target) |
| `content/managed/` | Templates, sites, domains, revisions, draft placeholders |
| `/api/lead` | Persist + deliver; no demo-success on production-like paths |
| `/api/operator/publish` | Token-gated new revision (+ optional activate) |
| `/api/operator/rollback` | Activate a prior revision |
| `/api/operator/leads/retry` | Retry failed/queued deliveries for a site |

## ContentAdapter

`site/lib/platform/adapter.ts` → `getPublishedContent({ hostname | siteId | slug })`.

- JSON kits first (`demo-kit` / `managed-kit` refs + overrides).
- Never returns draft kits (`content/managed/drafts/*`).
- Payload can later implement the same read surface.

## Hostname resolution

Uses Next.js `proxy.ts` (renamed from deprecated `middleware`) plus
`domains.json` / optional env:

```bash
MANAGED_DOMAIN_MAP=your.test.host:site_pilot_craft
```

Proxy rewrites verified+enabled hosts to `/m/<siteId>`.

**Vercel project:** `prj_p3yXTA3YM7m6kxdXbuBlhDbOTYAT` (`websites-design`) on team `razs-projects-29d4f2e6` (**hobby**).  
SSO: `all_except_custom_domains` — attach an approved custom host to unlock unauthenticated lead/operator smoke.

## Lead pipeline

1. Resolve site from `Host` (preferred) or managed `siteId`.
2. **Durable store**: Supabase `managed_leads` table (when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set).
   - Local fallbacks: `.data/leads/<siteId>/` when writable; on Vercel use `/tmp` then in-memory so a read-only FS never blocks webhook delivery.
3. Attempt webhook delivery (n8n → Telegram); failures set `deliveryStatus=failed|dead` with `nextRetryAt`.
4. Delivery status is synced to Supabase after each attempt (non-blocking).
5. Production-like paths **never** return `{ ok: true, mode: "demo" }`.

Env:

| Variable | Purpose |
| -------- | ------- |
| `NEXT_PUBLIC_SITE_URL` | Canonical / asset origin |
| `LEAD_WEBHOOK_URL` | Delivery target |
| `LEAD_WEBHOOK_TOKEN` | Optional bearer |
| `LEAD_STORE_DIR` | Override persist root |
| `MANAGED_REQUIRE_DELIVERY=1` | Force fail-closed without webhook |
| `ALLOW_LEAD_DEMO_MODE=1` | Allow log-only demo on production NODE_ENV for `/sites/*` prospect fleet |
| `OPERATOR_PUBLISH_TOKEN` | Publish / rollback / lead retry |
| `MANAGED_DOMAIN_MAP` | `host:siteId` overrides/extends `domains.json` |
| `SUPABASE_URL` | Supabase project URL (durable lead storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server-only, never expose |

## Silent-failure owners

| Concern | Owner |
| ------- | ----- |
| DNS / TLS / Vercel domain attach | **David** (credentials + approved hostname) |
| Lead delivery webhook + retries | **RazonWorks ops** (`owner=razonworks-ops` in logs) |
| Publish / rollback token | **Operator** holding `OPERATOR_PUBLISH_TOKEN` |
| Media cache invalidation after photo swap | Deploy operator per `DEPLOY.md` |

## Pilot site

- Template: `tmpl_craft_services` (craft archetype, `a1-auto` kit shape)
- Site: `site_pilot_craft` / slug `pilot-craft`
- Revisions: `rev_001` (rollback base), `rev_002` (active)
- Local mapping: `pilot.managed.localhost` (verified in `domains.json`)
- Tip (draft PR #3): `ac7d57e` · preview deploy READY

## Rollback (operator)

```bash
curl -X POST "$ORIGIN/api/operator/rollback" \
  -H "Authorization: Bearer $OPERATOR_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"site_pilot_craft","toRevisionId":"rev_001"}'
```

Response includes `durableWriteConfigured: true` when Edge Config is set up.

## Durable active-revision state

Active revision is persisted to **Vercel Edge Config** so that operator rollback is visible across all serverless instances.

### How it works

1. **Write path**: When `/api/operator/rollback` (or `/publish`) activates a revision, it writes to:
   - Process-local overlay (immediate, for the responding instance)
   - Vercel Edge Config (durable, globally replicated in ~50ms)

2. **Read path**: When a page renders, it reads active revision from:
   - Edge Config (if `EDGE_CONFIG` is set) — preferred, cross-instance
   - Process-local overlay (fallback for dev)
   - Committed `sites.json` (cold-start fallback when Edge Config is empty)

3. **Cold start**: New instances always read from Edge Config first; committed JSON is only used when the durable store has no entry for the site.

### Setup on Vercel

1. **Create Edge Config**: Vercel Dashboard → Storage → Create → Edge Config → name it (e.g. `managed-state`).

2. **Link to project**: In the Edge Config settings, link it to `websites-design` project. This auto-populates `GLOBAL_CONFIG` (or `EDGE_CONFIG` on older setups — both work).

3. **Add write credentials** (env vars on Vercel project):

   | Variable | Value | Scope |
   | -------- | ----- | ----- |
   | `GLOBAL_CONFIG` | (auto-linked) | All |
   | `EDGE_CONFIG_ID` | `ecfg_...` from Edge Config settings | All |
   | `VERCEL_API_TOKEN` | API token with write access | Production + Preview |
   | `VERCEL_TEAM_ID` | (optional) Team ID if not hobby | All |

   Note: `EDGE_CONFIG` is a legacy alias for `GLOBAL_CONFIG` — either works for reads.

4. **Redeploy** so the new env vars bind.

### Re-prove rollback works (operator test)

```bash
# Rollback to rev_001 (should show title with "(v1)" or "rollback base")
curl -X POST "https://managed.razonworks.com/api/operator/rollback" \
  -H "Authorization: Bearer $OPERATOR_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"site_pilot_craft","toRevisionId":"rev_001"}'

# Verify durableWriteConfigured: true in response
# Then refresh https://managed.razonworks.com — title should contain "(v1)"

# Restore rev_002
curl -X POST "https://managed.razonworks.com/api/operator/rollback" \
  -H "Authorization: Bearer $OPERATOR_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"site_pilot_craft","toRevisionId":"rev_002"}'

# Refresh — title should be "Pilot Craft Auto — Managed publish pilot"
```

### Fallback behavior

| GLOBAL_CONFIG / EDGE_CONFIG | Behavior |
| --------------------------- | -------- |
| Set | Reads from Edge Config; falls back to sites.json if key missing |
| Unset | Reads from process overlay → sites.json (single-instance only) |

Local dev without Edge Config works as before — rollback is transient per process.

## Durable lead storage (Supabase)

Leads persist to **Supabase** `managed_leads` table so they survive Vercel `/tmp` ephemeral storage and cold starts.

### Supabase project

- **Project**: RazonWorks Managed Leads
- **Project ref**: `sjpmcapkjnzkrymbrdgp`
- **URL**: `https://sjpmcapkjnzkrymbrdgp.supabase.co`
- **Table**: `public.managed_leads` (RLS on, service-role writes only)

### Table schema

| Column | Type | Notes |
| ------ | ---- | ----- |
| `id` | text PK | Lead ID (`lead_xxx`) — same as local StoredLead.id |
| `site_id` | text | Site identifier |
| `hostname` | text | Request hostname |
| `revision_id` | text | Active revision at time of lead |
| `source` | text | Always "website" |
| `business_name` | text | Business name |
| `business_city` | text | Business city |
| `business_state` | text | Business state |
| `contact_name` | text | Lead contact name |
| `contact_email` | text | Lead contact email |
| `contact_phone` | text | Lead contact phone |
| `message` | text | Lead message |
| `locale` | text | `en` or `es` |
| `payload` | jsonb | Full StoredLead.payload |
| `delivery_status` | text | `stored`, `queued`, `delivered`, `failed`, `dead` |
| `received_at` | timestamptz | When lead was received |
| `created_at` | timestamptz | Row creation time |

### Setup on Vercel

1. **Add env vars** (Vercel Dashboard → Project → Settings → Environment Variables):

   | Variable | Value | Scope |
   | -------- | ----- | ----- |
   | `SUPABASE_URL` | `https://sjpmcapkjnzkrymbrdgp.supabase.co` | All |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase Dashboard | Production + Preview |

   **Never** use `NEXT_PUBLIC_` prefix — service role key must stay server-only.

2. **Redeploy** so the new env vars bind.

### Behavior

| Env vars | Behavior |
| -------- | -------- |
| Both set | Leads persist to Supabase after local persist; delivery status synced after webhook |
| Either unset | Logs warning once, continues without Supabase (webhook still works) |

### Re-prove lead storage works

```bash
# Submit a test lead
curl -X POST "$ORIGIN/api/lead" \
  -H "Content-Type: application/json" \
  -H "x-managed-site-id: site_pilot_craft" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "555-1234",
    "message": "Supabase persist test",
    "lang": "en",
    "business": {"name": "Pilot Craft Auto", "city": "Sycamore", "state": "IL"}
  }'

# Response should include supabasePersisted: true (when configured)

# Verify in Supabase (SQL Editor or Table Editor):
SELECT id, site_id, contact_name, contact_email, delivery_status, received_at
FROM managed_leads
ORDER BY received_at DESC
LIMIT 5;
```

### Fallback behavior

If Supabase insert fails:
- Error is logged with `owner=razonworks-ops`
- Lead remains in local `/tmp` + memory store
- Webhook delivery proceeds normally
- Response `supabasePersisted: false`

## Pilot acceptance

Pilot gates PASS on production `https://managed.razonworks.com` → `site_pilot_craft` as of 2026-09-19.

| # | Gate | Result |
| - | ---- | ------ |
| 1 | Custom host attached + serves Pilot Craft | PASS |
| 2 | Domain → site_pilot_craft | PASS |
| 3 | Lead without webhook auth rejected at n8n | PASS |
| 4 | Lead with Bearer accepted at n8n | PASS |
| 5 | Live site lead delivers (mode=delivered) | PASS |
| 6 | Owner Telegram alert | PASS |
| 7 | LEAD_WEBHOOK_TOKEN on Vercel Preview+Production | PASS |
| 8 | Operator rollback API auth (401 without/wrong token) | PASS |
| 9 | Operator rollback API activate (rev toggle + 404 missing) | PASS |
| 10a | Visible content switch after rollback (Global Config) | PASS |
| 10b | Durable Supabase lead persist (PR #6 / `578fd5c`; `lead_mu928r7u_r7jzyi` `supabasePersisted:true`) | PASS |

### Durable infrastructure in production

| Concern | Store | Vercel env vars |
| ------- | ----- | --------------- |
| Active revision | Edge Config `ecfg_n2z91iad0sshv8updg2hb8k6tdxh` | `GLOBAL_CONFIG`, `EDGE_CONFIG_ID`, `VERCEL_API_TOKEN` |
| Lead persistence | Supabase `managed_leads` (`sjpmcapkjnzkrymbrdgp`) | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Lead delivery | n8n `https://34-172-247-12.sslip.io/webhook/managed-leads` | `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_TOKEN` |

Current production deploy: `dpl_7TWKyamChQhXyXcBf5WRGJGsVMHc`.

---

## Remaining (pre-sell)

| Item | Blocker? | Notes |
| ---- | -------- | ----- |
| Commercial Vercel plan | **Yes** | Team `razs-projects-29d4f2e6` is still **hobby**; required before selling managed A |
| Optional Payload / Postgres | No | Future CMS layer; not blocking managed A |

---

## Second managed site: McCabe's Event Venue

First non-pilot customer onboarded to the managed platform.

### Site details

| Field | Value |
| ----- | ----- |
| Site ID | `site_mccabes` |
| Slug | `mccabes` |
| Display name | McCabe's |
| Template | `tmpl_event_venue` (editorial archetype, arcada-theater kit shape) |
| Hostname | `mccabes.razonworks.com` (verified + enabled in `domains.json`) |
| Local test | `mccabes.managed.localhost` |
| Revisions | `rev_001` (rollback base), `rev_002` (active) |

### Business identity

- **Business**: McCabe's Event Venue
- **Address**: 323–333 E Lincoln Highway, DeKalb, IL 60115 (downtown)
- **Phone**: (815) 214-9010
- **Email**: info@dekalbmccabes.com
- **Owner**: David Long / Long Family Management
- **Capacity**: ~8,000 sq ft; up to ~975 standing / ~475 seated
- **Tone**: "DeKalb's #1 Social Center" — nightlife-first (club nights, NIU late nights) plus private events (weddings, reunions, corporate, community)
- **Socials**: Instagram @mccabes_dekalb · Facebook McCabes - DeKalb · Luma https://luma.com/McCabes

### Files added

- `content/managed/templates.json` — added `tmpl_event_venue`
- `content/managed/sites.json` — added `site_mccabes`
- `content/managed/domains.json` — added `mccabes.razonworks.com` + `mccabes.managed.localhost`
- `content/managed/revisions/site_mccabes/rev_001.json` — rollback base
- `content/managed/revisions/site_mccabes/rev_002.json` — active copy
- `content/managed/drafts/site_mccabes/README.json` — draft placeholder
- `lib/platform/registry.ts` — imports for McCabe's revisions

### Prove steps (after deploy)

```bash
# 1. Hostname resolves
curl -I https://mccabes.razonworks.com
# Should return 200 with McCabe's content

# 2. Rollback test
curl -X POST "https://mccabes.razonworks.com/api/operator/rollback" \
  -H "Authorization: Bearer $OPERATOR_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"site_mccabes","toRevisionId":"rev_001"}'
# Title should change to "McCabe's Event Venue (v1)"

# 3. Restore active revision
curl -X POST "https://mccabes.razonworks.com/api/operator/rollback" \
  -H "Authorization: Bearer $OPERATOR_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"site_mccabes","toRevisionId":"rev_002"}'

# 4. Lead submission test
curl -X POST "https://mccabes.razonworks.com/api/lead" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "555-1234",
    "message": "McCabe'\''s lead test",
    "lang": "en",
    "business": {"name": "McCabe'\''s Event Venue", "city": "DeKalb", "state": "IL"}
  }'
# Should return delivered status + supabasePersisted: true
```

### Domain attach (David)

The hostname `mccabes.razonworks.com` needs to be attached to the Vercel project `prj_p3yXTA3YM7m6kxdXbuBlhDbOTYAT` via the dashboard:

1. Vercel Dashboard → Project → Settings → Domains
2. Add `mccabes.razonworks.com`
3. Configure DNS (CNAME to `cname.vercel-dns.com` or A record to Vercel IP)
4. Wait for TLS provisioning

---

## Checklist for adding more sites

For adding additional managed sites without code changes:

- [ ] **Template / site JSON**: create `content/managed/templates/<tmpl_id>.json` (if needed) and add entry to `content/managed/sites.json` with copy overrides
- [ ] **Revisions**: add `content/managed/revisions/site_<slug>/rev_*.json` entries; set `activePublishedRevisionId` in site JSON
- [ ] **Registry import**: add imports for new revisions to `lib/platform/registry.ts`
- [ ] **Domain map**: add `domains.json` entry or extend `MANAGED_DOMAIN_MAP` env; DNS / TLS via David
- [ ] **Vercel env reuse**: same project env vars (`SUPABASE_*`, `LEAD_WEBHOOK_*`, `OPERATOR_*`, Edge Config) — no new secrets needed
- [ ] **Lead prove**: submit lead → verify n8n delivery + Supabase row + Telegram arrival
- [ ] **Rollback prove**: operator rollback to prior revision → visible change → restore

---

See also `site/.env.example`.
