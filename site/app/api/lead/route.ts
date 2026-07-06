/**
 * Decoupled lead-capture endpoint.
 *
 * Accepts contact/reservation submissions and forwards a normalized payload to
 * an automated deal pipeline. Point LEAD_WEBHOOK_URL at an n8n webhook, a Cloud
 * Run service, or a FastAPI endpoint. If it is unset, the lead is logged and
 * accepted so the form works out-of-the-box in demo mode.
 *
 * Multi-tenant: the submitting site sends its own business identity in the body
 * so leads route to the correct tenant (not a hardcoded business).
 */

export const runtime = "nodejs";

interface LeadInput {
  name?: string;
  email?: string;
  phone?: string;
  partySize?: string;
  date?: string;
  message?: string;
  lang?: string;
  business?: { name?: string; city?: string; state?: string };
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function POST(request: Request) {
  let body: LeadInput;
  try {
    body = (await request.json()) as LeadInput;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";

  // Require a name plus at least one usable contact channel.
  if (name.length < 2) {
    return Response.json({ ok: false, error: "A name is required." }, { status: 422 });
  }
  if (!email && !phone) {
    return Response.json(
      { ok: false, error: "Provide an email or phone number." },
      { status: 422 },
    );
  }
  if (email && !isEmail(email)) {
    return Response.json({ ok: false, error: "Invalid email address." }, { status: 422 });
  }

  const lead = {
    source: "website",
    business: {
      name: body.business?.name?.trim() || "Unknown",
      city: body.business?.city?.trim() || "",
      state: body.business?.state?.trim() || "",
    },
    contact: { name, email, phone },
    reservation: {
      partySize: body.partySize?.trim() ?? "",
      date: body.date?.trim() ?? "",
    },
    message: body.message?.trim() ?? "",
    locale: body.lang === "es" ? "es" : "en",
    receivedAt: new Date().toISOString(),
    meta: {
      userAgent: request.headers.get("user-agent") ?? "",
      referer: request.headers.get("referer") ?? "",
    },
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;

  if (!webhook) {
    // Demo mode: no pipeline wired up yet. Accept and log.
    console.info("[lead] (demo mode — set LEAD_WEBHOOK_URL to forward)", JSON.stringify(lead));
    return Response.json({ ok: true, mode: "demo" });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEAD_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.LEAD_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(lead),
      // Don't hang the user's request on a slow pipeline.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error("[lead] webhook responded", res.status);
      return Response.json(
        { ok: false, error: "Pipeline rejected the lead." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true, mode: "forwarded" });
  } catch (err) {
    console.error("[lead] webhook error", err);
    return Response.json(
      { ok: false, error: "Could not reach the pipeline." },
      { status: 502 },
    );
  }
}
