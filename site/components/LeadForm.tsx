"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { ArrowRight } from "@/components/icons";

type Status = "idle" | "sending" | "success" | "error" | "demo";

const field =
  "w-full rounded-lg border border-line bg-bg px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary placeholder:text-ink-soft";

const label = "text-sm font-medium text-ink";

export function LeadForm() {
  const { t, lang, biz, layout, managedSiteId } = useLang();
  const f = t.form;
  const [status, setStatus] = useState<Status>("idle");
  const dateRef = useRef<HTMLInputElement>(null);
  // Services/trades remap partySize to free-text context (vehicle, legal matter, etc.)
  const freeTextContext = layout.menuKind === "services";

  // `min` comes from the visitor's local clock, applied post-mount: rendering
  // it on the server would bake in the server's date (timezone drift +
  // hydration mismatch). No-JS visitors get an unconstrained date picker.
  useEffect(() => {
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
    dateRef.current?.setAttribute("min", today);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    // Honeypot — bots fill hidden fields; humans don't.
    if (data.get("company")) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          partySize: data.get("partySize"),
          date: data.get("date"),
          message: data.get("message"),
          lang,
          siteId: managedSiteId,
          business: { name: biz.name, city: biz.city, state: biz.state },
        }),
      });
      const body = (await res.json().catch(() => null)) as {
        ok?: boolean;
        mode?: string;
      } | null;
      // Demo fleet may still respond mode=demo — never show the success copy.
      if (res.ok && body?.ok === true && body.mode === "demo") {
        setStatus("demo");
        form.reset();
        return;
      }
      const accepted =
        res.ok &&
        body?.ok === true &&
        (body.mode === "forwarded" ||
          body.mode === "queued" ||
          body.mode === "stored" ||
          body.mode === "delivered");
      if (!accepted) throw new Error("not delivered");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      id="lead"
      action="/api/lead"
      method="post"
      onSubmit={onSubmit}
      aria-busy={status === "sending"}
      aria-describedby={status === "error" ? "lead-form-hint" : undefined}
      className="flex flex-col gap-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-name" className={label}>
            {f.name}
          </label>
          <input id="lead-name" name="name" required autoComplete="name" className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-email" className={label}>
            {f.email}
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            inputMode="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="email@example.com"
            autoComplete="email"
            className={field}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-phone" className={label}>
            {f.phone}
          </label>
          <input id="lead-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-partySize" className={label}>
            {f.partySize}
          </label>
          <input
            id="lead-partySize"
            name="partySize"
            {...(freeTextContext
              ? { type: "text" as const, autoComplete: "off" }
              : { inputMode: "numeric" as const, pattern: "[0-9]*" })}
            className={field}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-date" className={label}>
          {f.date}
        </label>
        <input id="lead-date" ref={dateRef} name="date" type="date" className={field} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="lead-message" className={label}>
          {f.message}
        </label>
        <textarea id="lead-message" name="message" rows={3} className={field} />
      </div>

      {/* No-JS parity: tenant identity + locale travel with the form-encoded
          POST. The JS path sends the same values from context in the JSON body. */}
      <input type="hidden" name="lang" value={lang} />
      {managedSiteId ? <input type="hidden" name="siteId" value={managedSiteId} /> : null}
      <input type="hidden" name="businessName" value={biz.name} />
      <input type="hidden" name="businessCity" value={biz.city} />
      <input type="hidden" name="businessState" value={biz.state} />

      {/* Honeypot (visually hidden, ignored by users) */}
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <button type="submit" disabled={status === "sending"} className="btn btn-primary mt-1 justify-center">
        {status === "sending" ? f.sending : f.submit}
        {status !== "sending" && <ArrowRight className="h-5 w-5" />}
      </button>

      {/* Persistent polite live region so success is announced on insertion. */}
      <div role="status" aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {status === "success" && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-secondary/30 bg-secondary/15 px-4 py-3 text-sm font-medium text-ink"
            >
              {f.success}
            </motion.p>
          )}
          {status === "demo" && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium text-ink"
            >
              Demo only — this inquiry was not delivered to a pipeline. Set LEAD_WEBHOOK_URL for real delivery.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {status === "error" && (
          <motion.p
            id="lead-form-hint"
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-ink"
          >
            {f.error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* full-strength ink-soft: the /80 tint dipped under 4.5:1 on some palettes */}
      <p className="text-xs text-ink-soft">{f.consent}</p>
    </form>
  );
}
