/**
 * Operator lead retry hook — process queued/failed deliveries for a site.
 * POST { siteId }
 */

import { processLeadRetries } from "@/lib/platform/leads/delivery";
import { listLeadsForSite } from "@/lib/platform/leads/store";
import { getSite } from "@/lib/platform/registry";

export const runtime = "nodejs";

function assertOperator(request: Request): boolean {
  const token = process.env.OPERATOR_PUBLISH_TOKEN;
  if (!token) return false;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const alt = request.headers.get("x-operator-token") ?? "";
  return bearer === token || alt === token;
}

export async function POST(request: Request) {
  if (!process.env.OPERATOR_PUBLISH_TOKEN) {
    return Response.json(
      { ok: false, error: "OPERATOR_PUBLISH_TOKEN unset (needs David)." },
      { status: 503 },
    );
  }
  if (!assertOperator(request)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { siteId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.siteId || !getSite(body.siteId)) {
    return Response.json({ ok: false, error: "Valid siteId required" }, { status: 422 });
  }

  const processed = await processLeadRetries(body.siteId);
  const leads = listLeadsForSite(body.siteId).map((l) => ({
    id: l.id,
    deliveryStatus: l.deliveryStatus,
    deliveryAttempts: l.deliveryAttempts,
    lastDeliveryError: l.lastDeliveryError,
    nextRetryAt: l.nextRetryAt,
  }));

  return Response.json({ ok: true, processed, leads });
}
