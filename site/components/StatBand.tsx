"use client";

import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { CountUp } from "@/components/CountUp";

/**
 * Credential stat band shared by About and Story. Two skins, resolved from the
 * tenant's layout tone:
 * - default: boxed card with the brand gradient hairline on top;
 * - calm/editorial: quieter ledger — hairline top/bottom, no gradient, ink values.
 *
 * Values without digits ("Fresh", "Family") get a plain typographic treatment;
 * only genuinely numeric values ("Est. 1987", "50+") route through CountUp.
 */
export function StatBand({ stats }: { stats: { value: string; label: string }[] }) {
  const { layout } = useLang();
  const quiet = layout.tone === "calm" || layout.tone === "editorial";

  const valueCls = `block text-balance break-words font-display text-xl font-black leading-tight sm:text-2xl ${
    quiet ? "text-ink" : "text-primary"
  }`;

  const cells = stats.map((s) => (
    <div key={s.label} className="px-4 py-5 text-center">
      {/\d/.test(s.value) ? (
        <CountUp value={s.value} className={valueCls} />
      ) : (
        <span className={valueCls}>{s.value}</span>
      )}
      <div className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-soft">
        {s.label}
      </div>
    </div>
  ));

  if (quiet) {
    return (
      <Reveal className="mt-12 border-y border-line">
        <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {cells}
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal className="mt-12 overflow-hidden rounded-2xl border border-line bg-bg">
      <div className="h-1 gradient-brand" />
      <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {cells}
      </div>
    </Reveal>
  );
}
