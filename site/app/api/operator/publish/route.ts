/**
 * Operator publish API — token-gated, no public signup.
 * POST { siteId, label?, activate?, overrides? }
 * Requires OPERATOR_PUBLISH_TOKEN (UNKNOWN until David sets it).
 */

import { createPublishedRevision, PublishError } from "@/lib/platform/publish";

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
        error: "OPERATOR_PUBLISH_TOKEN unset — publish disabled (needs David).",
      },
      { status: 503 },
    );
  }
  if (!assertOperator(request)) return unauthorized();

  let body: {
    siteId?: string;
    label?: string;
    activate?: boolean;
    overrides?: Parameters<typeof createPublishedRevision>[0]["overrides"];
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.siteId) {
    return Response.json({ ok: false, error: "siteId required" }, { status: 422 });
  }

  try {
    const result = createPublishedRevision({
      siteId: body.siteId,
      label: body.label,
      activate: body.activate !== false,
      actor: "operator-api",
      overrides: body.overrides,
    });
    return Response.json({
      ok: true,
      revisionId: result.revision.id,
      activePublishedRevisionId: result.site.activePublishedRevisionId,
      siteId: result.site.id,
    });
  } catch (err) {
    if (err instanceof PublishError) {
      const status = err.code === "not_found" ? 404 : err.code === "conflict" ? 409 : 422;
      return Response.json({ ok: false, error: err.message, code: err.code }, { status });
    }
    throw err;
  }
}
