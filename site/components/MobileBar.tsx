"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { Phone } from "@/components/icons";
import { A11Y } from "@/lib/a11y";

/**
 * Persistent mobile action bar — keeps the primary conversions (view menu +
 * call/quote) one tap away, a hallmark of modern restaurant/service sites.
 * Hidden on desktop (the nav exposes these once it goes inline at `lg`).
 * Solid `bg-bg` surface with a top hairline (token classes, so it holds on
 * both light tenants and the dark ink-surface tenants); the primary action is
 * the dominant filled block, the menu anchor a quiet equal-height secondary.
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
      className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-line bg-bg px-3 pt-3 lg:hidden ${
        ready ? "transition-transform duration-300 motion-reduce:transition-none" : ""
      } ${hidden ? "translate-y-full" : "translate-y-0"}`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <a
        href="#menu"
        className="flex-1 rounded-full border border-line py-3 text-center text-sm font-semibold text-ink no-underline"
      >
        {t.nav.menu}
      </a>
      {hasPhone ? (
        <a
          href={`tel:${biz.phoneHref}`}
          // Label-in-Name (WCAG 2.5.3): the visible text (the number) is
          // contained in the accessible name, so speech-input users can say
          // exactly what they see.
          aria-label={`${A11Y[lang].callLabel} ${biz.phone}`}
          className="inline-flex flex-[1.7] items-center justify-center gap-2 rounded-full bg-primary py-3 text-center text-sm font-semibold text-white no-underline"
        >
          <Phone className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{biz.phone}</span>
        </a>
      ) : (
        <a
          href="#lead"
          className="inline-flex flex-[1.7] items-center justify-center gap-2 rounded-full bg-primary py-3 text-center text-sm font-semibold text-white no-underline"
        >
          {t.nav.order}
        </a>
      )}
    </nav>
  );
}
