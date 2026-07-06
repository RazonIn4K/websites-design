"use client";

import { useLang } from "@/components/LanguageProvider";
import { SectionHeader } from "@/components/SectionHeader";
import { ChevronDown } from "@/components/icons";

const EYEBROW = { en: "Questions", es: "Preguntas" };

/**
 * FAQ as a native <details>/<summary> accordion — zero JavaScript, works with
 * no-JS and forced-reduced-motion, fully keyboard accessible by default.
 */
export function Faq() {
  const { t, lang } = useLang();
  const faq = t.faq;
  if (!faq || !faq.items?.length) return null;

  return (
    <section id="faq" className="section bg-bg">
      <div className="container-max max-w-3xl">
        <SectionHeader eyebrow={EYEBROW[lang]} heading={faq.heading} />
        <div className="border-y border-line">
          {faq.items.map((it, i) => (
            // name="faq" makes the browser keep only one panel open (zero-JS,
            // research-recommended); first item open as a sensible SSR default.
            <details key={i} name="faq" open={i === 0} className="group border-b border-line last:border-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                {it.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="pb-5 pr-9 text-ink-soft">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
