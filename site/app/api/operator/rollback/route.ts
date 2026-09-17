/**
 * Operator rollback API — activate a prior PublishedRevision.
 * POST { siteId, toRevisionId? }
 * Requires OPERATOR_PUBLISH_TOKEN.
 */

import { publicationHistory, PublishError, rollbackPublication } from "@/lib/platform/publish";

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

  try {
    const site = rollbackPublication(body.siteId, body.toRevisionId, "operator-api");
    return Response.json({
      ok: true,
      siteId: site.id,
      activePublishedRevisionId: site.activePublishedRevisionId,
      history: publicationHistory(site.id).map((r) => ({
        id: r.id,
        label: r.label,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    if (err instanceof PublishError) {
      const status = err.code === "not_found" ? 404 : err.code === "conflict" ? 409 : 422;
      return Response.json({ ok: false, error: err.message, code: err.code }, { status });
    }
    throw err;
  }
}
