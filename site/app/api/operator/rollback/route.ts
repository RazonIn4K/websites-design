/**
 * Operator rollback API — activate a prior PublishedRevision.
 * POST { siteId, toRevisionId? }
 * Requires OPERATOR_PUBLISH_TOKEN.
 *
 * Uses async rollback that persists to Vercel Edge Config when configured,
 * ensuring the active revision is durable across serverless instances.
 *
 * Response includes:
 * - durableWriteConfigured: true if Edge Config write env vars are present
 * - durableWriteOk: true if write succeeded OR write intentionally skipped (unconfigured)
 *
 * Note: Edge Config propagation to all edge locations takes ~15 seconds.
 */

import { publicationHistory, PublishError, rollbackPublicationAsync } from "@/lib/platform/publish";
import { isDurableWriteConfigured } from "@/lib/platform/durable-state";

export const runtime = "nodejs";

function unauthorized() {
  return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

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
      {
        ok: false,
        error: "OPERATOR_PUBLISH_TOKEN unset — rollback disabled (needs David).",
      },
      { status: 503 },
    );
  }
  if (!assertOperator(request)) return unauthorized();

  let body: { siteId?: string; toRevisionId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.siteId) {
    return Response.json({ ok: false, error: "siteId required" }, { status: 422 });
  }

  const durableWriteConfigured = isDurableWriteConfigured();

  try {
    const result = await rollbackPublicationAsync(body.siteId, body.toRevisionId, "operator-api");
    return Response.json({
      ok: true,
      siteId: result.site.id,
      activePublishedRevisionId: result.site.activePublishedRevisionId,
      durableWriteConfigured,
      durableWriteOk: result.durableWriteOk,
      history: publicationHistory(result.site.id).map((r) => ({
        id: r.id,
        label: r.label,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    if (err instanceof PublishError) {
      const isDurableFailure = err.code === "durable_write_failed";
      const status = err.code === "not_found" ? 404
        : err.code === "conflict" ? 409
        : isDurableFailure ? 503
        : 422;
      return Response.json({
        ok: false,
        error: err.message,
        code: err.code,
        durableWriteConfigured,
        durableWriteOk: false,
      }, { status });
    }
    throw err;
  }
}
