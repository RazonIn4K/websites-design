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
2. Persist under `.data/leads/<siteId>/` when writable; on Vercel use `/tmp` then
   in-memory fallback so a read-only FS never blocks webhook delivery. Durable
   store UNKNOWN until Postgres/Payload.
3. Attempt webhook delivery; failures set `deliveryStatus=failed|dead` with `nextRetryAt`.
4. Production-like paths **never** return `{ ok: true, mode: "demo" }`.

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

## Still needs David (live prove)

1. Confirm Vercel env vars are set on this project and **redeploy** the PR branch so they bind
2. Confirm the approved test hostname appears under project Domains (API still shows only `*.vercel.app` aliases) and `MANAGED_DOMAIN_MAP` / `domains.json` maps it → `site_pilot_craft`
3. Prove on that host: lead without webhook fails; with webhook delivers; operator rollback to `rev_001`
4. Commercial plan before selling managed A (still **hobby**)
5. Durable lead store (Payload/Postgres step 3)
6. Review/merge draft PR #3 when 1–3 are green

See also `site/.env.example`.
