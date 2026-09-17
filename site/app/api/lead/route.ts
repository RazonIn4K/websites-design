/**
 * Lead-capture endpoint (managed-publish hardened).
 *
 * - Site identity from Host → Domain → Site (or verified managed siteId), not
 *   trust-only body business fields.
 * - Persist first; delivery is a separate attempt with retry hooks.
 * - Production-like / managed paths never return { ok: true, mode: "demo" }.
 * - Demo fleet (/sites/* without managed mapping) may still log-only, but the
 *   form UI must not treat that as delivery success.
 */

import { attemptDelivery, deliverLead } from "@/lib/platform/leads/delivery";
import { resolveLeadSite } from "@/lib/platform/leads/identity";
import { createLeadId, persistLead } from "@/lib/platform/leads/store";
import type { StoredLead } from "@/lib/platform/types";

export const runtime = "nodejs";

interface LeadInput {
  name?: string;
  email?: string;
  phone?: string;
  partySize?: string;
  date?: string;
  message?: string;
  lang?: string;
  siteId?: string;
  business?: { name?: string; city?: string; state?: string };
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function requestHostname(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-host");
  const host = forwarded || request.headers.get("host");
  return host;
}

/**
 * 303 back to the page that posted the form, landing on the #lead anchor.
 * Only the referer's path/query are reused (never its origin) so a spoofed
 * cross-origin Referer header cannot turn this into an open redirect.
 */
function redirectBack(request: Request): Response {
  let location = "/#lead";
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      location = `${url.pathname}${url.search}#lead`;
    } catch {
      // Malformed referer — fall through to the root fallback.
    }
  }
  return new Response(null, { status: 303, headers: { Location: location } });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const isFormPost =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");

  let body: LeadInput;

  if (isFormPost) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return redirectBack(request);
    }
    const text = (key: string): string => {
      const v = form.get(key);
      return typeof v === "string" ? v : "";
    };

    if (text("company").trim()) {
      console.info("[lead] honeypot tripped — dropping form submission");
      return redirectBack(request);
    }

    body = {
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      partySize: text("partySize"),
      date: text("date"),
      message: text("message"),
      lang: text("lang"),
      siteId: text("siteId") || undefined,
      business: {
        name: text("businessName"),
        city: text("businessCity"),
        state: text("businessState"),
      },
    };
  } else {
    try {
      body = (await request.json()) as LeadInput;
    } catch {
      return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";

  if (name.length < 2) {
    if (isFormPost) return redirectBack(request);
    return Response.json({ ok: false, error: "A name is required." }, { status: 422 });
  }
  if (!email && !phone) {
    if (isFormPost) return redirectBack(request);
    return Response.json(
      { ok: false, error: "Provide an email or phone number." },
      { status: 422 },
    );
  }
  if (email && !isEmail(email)) {
    if (isFormPost) return redirectBack(request);
    return Response.json({ ok: false, error: "Invalid email address." }, { status: 422 });
  }

  const headerSiteId = request.headers.get("x-managed-site-id");
  const resolved = resolveLeadSite({
    hostname: requestHostname(request),
    bodySiteId: body.siteId || headerSiteId,
    bodyBusiness: body.business,
  });

  if ("error" in resolved) {
    if (isFormPost) return redirectBack(request);
    return Response.json({ ok: false, error: resolved.error }, { status: resolved.status });
  }

  const receivedAt = new Date().toISOString();
  const payload = {
    source: "website",
    business: resolved.business,
    contact: { name, email, phone },
    reservation: {
      partySize: body.partySize?.trim() ?? "",
      date: body.date?.trim() ?? "",
    },
    message: body.message?.trim() ?? "",
    locale: body.lang === "es" ? "es" : "en",
    receivedAt,
    meta: {
      userAgent: request.headers.get("user-agent") ?? "",
      referer: request.headers.get("referer") ?? "",
    },
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  const isDemoTenant = resolved.siteId === "demo";

  // Production-like / managed: never masquerade undelivered as success.
  if (resolved.productionLike && !webhook) {
    console.error(
      "[lead] REJECTED production-like path without LEAD_WEBHOOK_URL owner=razonworks-ops",
      JSON.stringify({ siteId: resolved.siteId, hostname: resolved.hostname }),
    );
    if (isFormPost) return redirectBack(request);
    return Response.json(
      {
        ok: false,
        error: "Lead delivery is not configured for this site.",
        mode: "undelivered",
      },
      { status: 503 },
    );
  }

  // Demo fleet without webhook: log only — client must not show success copy.
  if (isDemoTenant && !webhook) {
    console.info("[lead] (demo mode — set LEAD_WEBHOOK_URL to forward)", JSON.stringify(payload));
    if (isFormPost) return redirectBack(request);
    return Response.json({ ok: true, mode: "demo" });
  }

  // Persist managed (and demo-with-webhook) leads with tenant isolation.
  const now = receivedAt;
  const lead: StoredLead = {
    id: createLeadId(),
    siteId: resolved.siteId,
    hostname: resolved.hostname,
    revisionId: resolved.revisionId,
    payload,
    deliveryStatus: webhook ? "queued" : "stored",
    deliveryAttempts: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Persist with FS → /tmp → memory fallback. Never block webhook delivery on
  // read-only Vercel cwd; still never claim demo-success on prod-like paths.
  const { backend } = persistLead(lead);
  if (backend === "memory") {
    console.warn(
      `[lead] persisted in-memory only (FS unavailable) site=${lead.siteId} lead=${lead.id} owner=razonworks-ops`,
    );
  }

  if (!webhook) {
    // Managed preview without webhook should not reach here (productionLike guard),
    // but keep an honest stored response if ALLOW path exists.
    if (isFormPost) return redirectBack(request);
    return Response.json({
      ok: true,
      mode: "stored",
      leadId: lead.id,
      siteId: lead.siteId,
      persistBackend: backend,
    });
  }

  // Prefer store-backed attempt (updates deliveryStatus); if that cannot load
  // the lead, deliver the in-memory object directly.
  let status = (await attemptDelivery(lead.siteId, lead.id))?.deliveryStatus;
  if (!status) {
    const result = await deliverLead(lead);
    status = result.ok ? "delivered" : "failed";
    if (!result.ok) {
      console.error(
        `[lead] delivery failed without durable store lead=${lead.id} site=${lead.siteId} error=${result.error} owner=razonworks-ops`,
      );
    }
  }

  if (status === "delivered") {
    if (isFormPost) return redirectBack(request);
    return Response.json({
      ok: true,
      mode: "delivered",
      leadId: lead.id,
      siteId: lead.siteId,
      persistBackend: backend,
    });
  }

  // Stored + failed delivery is visible/retryable — do not claim success.
  console.error(
    `[lead] delivery ${status} lead=${lead.id} site=${lead.siteId} owner=razonworks-ops`,
  );
  if (isFormPost) return redirectBack(request);
  return Response.json(
    {
      ok: false,
      error: "Lead accepted for delivery but webhook failed; queued for retry when store allows.",
      mode: "queued",
      leadId: lead.id,
      siteId: lead.siteId,
      deliveryStatus: status,
      persistBackend: backend,
    },
    { status: 502 },
  );
}
