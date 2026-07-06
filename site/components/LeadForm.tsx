"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { ArrowRight } from "@/components/icons";

type Status = "idle" | "sending" | "success" | "error";

const field =
  "w-full rounded-lg border border-line bg-bg px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary placeholder:text-ink-soft";

export function LeadForm() {
  const { t, lang, biz } = useLang();
  const f = t.form;
  const [status, setStatus] = useState<Status>("idle");

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
          business: { name: biz.name, city: biz.city, state: biz.state },
        }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form id="lead" onSubmit={onSubmit} aria-busy={status === "sending"} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required aria-label={f.name} placeholder={f.name} autoComplete="name" className={field} />
        <input name="email" type="email" inputMode="email" autoCapitalize="off" autoCorrect="off" spellCheck={false} aria-label={f.email} placeholder={f.email} autoComplete="email" className={field} />
        <input name="phone" type="tel" inputMode="tel" aria-label={f.phone} placeholder={f.phone} autoComplete="tel" className={field} />
        <input name="partySize" aria-label={f.partySize} placeholder={f.partySize} className={field} />
      </div>
      <input name="date" aria-label={f.date} placeholder={f.date} className={field} />
      <textarea name="message" rows={3} aria-label={f.message} placeholder={f.message} className={field} />

      {/* Honeypot (visually hidden, ignored by users) */}
      <input
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
      >
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
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {status === "error" && (
          <motion.p
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
