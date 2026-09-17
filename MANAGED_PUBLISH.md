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
MANAGED_DOMAIN_MAP=pilot.example.com:site_pilot_craft
```

Proxy rewrites verified+enabled hosts to `/m/<siteId>`.  
**Live Vercel domain attach:** UNKNOWN project ID — needs David.

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
| `LEAD_WEBHOOK_URL` | Delivery target |
| `LEAD_WEBHOOK_TOKEN` | Optional bearer |
| `LEAD_STORE_DIR` | Override persist root |
| `MANAGED_REQUIRE_DELIVERY=1` | Force fail-closed without webhook |
| `ALLOW_LEAD_DEMO_MODE=1` | Allow log-only demo on production NODE_ENV for `/sites/*` prospect fleet |
| `OPERATOR_PUBLISH_TOKEN` | Publish / rollback / lead retry |

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
- Test host mapping: `pilot.managed.localhost` (local only)

## Rollback (operator)

```bash
curl -X POST "$ORIGIN/api/operator/rollback" \
  -H "Authorization: Bearer $OPERATOR_PUBLISH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"site_pilot_craft","toRevisionId":"rev_001"}'
```

Overlays are process-local until Payload/Postgres; committed `sites.json` is the durable default on cold start.

## Needs David (blocked for live attach)

1. **GitHub:** grant Cursor GitHub App write on `RazonIn4K/websites-design` (cloud install currently only has `razonworks-studio`) so the draft PR can be pushed
2. Approved test hostname + DNS
3. **Vercel:** create/link a project for `websites-design` — as of 2026-09-17 none exists under team `razs-projects-29d4f2e6` (`team_beZmg9993FuuEcaP00QH8Vdy`). Team plan is **hobby** (commercial plan still required for paid managed A)
4. `LEAD_WEBHOOK_URL` (+ token) for real delivery
5. `OPERATOR_PUBLISH_TOKEN` for publish/rollback
6. Whether production demo fleet keeps `ALLOW_LEAD_DEMO_MODE=1` (required if `/sites/*` should still accept log-only leads under `next start` / production)
7. Durable lead store choice (Postgres via Payload step 3 vs other)

See also `site/.env.example`.
