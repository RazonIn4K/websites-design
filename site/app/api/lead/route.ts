/**
 * Decoupled lead-capture endpoint.
 *
 * Accepts contact/reservation submissions and forwards a normalized payload to
 * an automated deal pipeline. Point LEAD_WEBHOOK_URL at an n8n webhook, a Cloud
 * Run service, or a FastAPI endpoint. If it is unset, the lead is logged and
 * accepted so the form works out-of-the-box in demo mode.
 *
 * Two content types share one pipeline:
 * - JSON (the hydrated client fetch) — responses are JSON, unchanged contract.
 * - form-encoded / multipart (the no-JS <form action> fallback) — every
 *   outcome answers with a 303 redirect back to the referring page's #lead
 *   anchor, because a static no-JS page has no way to render a response body.
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

    // Honeypot — the no-JS path has no client-side check, so enforce it here.
    // Pretend-accept (redirect back) so bots learn nothing.
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

  // Require a name plus at least one usable contact channel. Form mode answers
  // every validation failure with the same redirect: the static page cannot
  // display a response body, and the browser's built-in validation (required
  // name, type=email) already catches these before a no-JS submit.
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
    if (isFormPost) return redirectBack(request);
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
      if (isFormPost) return redirectBack(request);
      return Response.json(
        { ok: false, error: "Pipeline rejected the lead." },
        { status: 502 },
      );
    }

    if (isFormPost) return redirectBack(request);
    return Response.json({ ok: true, mode: "forwarded" });
  } catch (err) {
    console.error("[lead] webhook error", err);
    if (isFormPost) return redirectBack(request);
    return Response.json(
      { ok: false, error: "Could not reach the pipeline." },
      { status: 502 },
    );
  }
}
