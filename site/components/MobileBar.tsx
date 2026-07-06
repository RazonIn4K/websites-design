"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { Phone } from "@/components/icons";
import { A11Y } from "@/lib/a11y";

/**
 * Persistent mobile action bar — keeps the primary conversions (view menu +
 * order/call/quote) one tap away, a hallmark of modern restaurant/service sites.
 * Hidden on desktop (the nav exposes these once it goes inline at `lg`).
 *
 * Auto-hides once the lead form (`#lead`, falling back to the `#visit` section)
 * is reached, and stays hidden through everything below it (CTA band + footer),
 * so the fixed bar never overlaps the form or collides with the on-screen
 * keyboard — a well-documented sticky-CTA pitfall. Defaults to visible so it
 * still works with no JS; the observer only ever *hides* it. The slide
 * transition is suppressed until the first measurement so a deep-link landing
 * at/below the form snaps to hidden instead of flashing in then sliding away.
 */
export function MobileBar() {
  const { t, biz, hasPhone, lang } = useLang();
  const [hidden, setHidden] = useState(false);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    const target =
      document.getElementById("lead") ?? document.getElementById("visit");
    if (!target) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Hidden once the form is reached AND through everything below it.
        setHidden(entry.isIntersecting || entry.boundingClientRect.top < 0);
        if (!readyRef.current) {
          readyRef.current = true;
          requestAnimationFrame(() => setReady(true));
        }
      },
      { rootMargin: "0px 0px -25% 0px" },
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label={A11Y[lang].quickActions}
      inert={hidden || undefined}
      className={`glass fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line/60 px-3 pt-3 lg:hidden ${
        ready ? "transition-transform duration-300 motion-reduce:transition-none" : ""
      } ${hidden ? "translate-y-full" : "translate-y-0"}`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href="#menu"
        className="flex-1 rounded-full border border-ink/15 bg-white/70 py-3 text-center text-sm font-semibold text-ink no-underline"
      >
        {t.nav.menu}
      </a>
      <a
        href={hasPhone ? `tel:${biz.phoneHref}` : "#visit"}
        // Label-in-Name (WCAG 2.5.3): the accessible name must start with the
        // visible text, so speech-input users can say "Order Now".
        aria-label={hasPhone ? `${t.nav.order} · ${A11Y[lang].callLabel} ${biz.phone}` : undefined}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-center text-sm font-semibold text-white no-underline"
      >
        {hasPhone && <Phone className="h-4 w-4" />}
        {t.nav.order}
      </a>
    </nav>
  );
}
