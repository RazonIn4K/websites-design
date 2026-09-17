"use client";

import { createContext, useContext, useEffect, useState, useCallback, useTransition } from "react";
import { flushSync } from "react-dom";
import {
  type Lang,
  type LangContent,
  type Business,
  type SiteContent,
  DEFAULT_EMOJIS,
} from "@/lib/content";
import type { SiteLayout } from "@/lib/clients";

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: LangContent;
  biz: Business;
  emojis: string[];
  hasPhone: boolean;
  /** Image base path for this client: `/img/<slug>`. */
  imgBase: string;
  /** LQIP blur placeholders keyed by image name (hero, about, g1..g6). */
  blur: Record<string, string>;
  /** Per-client layout variant flags (empty = default composition). */
  layout: SiteLayout;
  /** Managed site id when rendering /m/<siteId> (not demo /sites/*). */
  managedSiteId?: string;
}

const Ctx = createContext<LanguageCtx | null>(null);

const STORAGE_KEY = "lbg:lang";

export function LanguageProvider({
  site,
  slug,
  emojis = DEFAULT_EMOJIS,
  blur = {},
  layout = {},
  managedSiteId,
  children,
}: {
  site: SiteContent;
  slug: string;
  emojis?: string[];
  blur?: Record<string, string>;
  layout?: SiteLayout;
  managedSiteId?: string;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = useState<Lang>("en");
  // The language switch re-renders the entire bilingual tree; mark it a
  // transition so the click handler stays responsive (protects INP) and the
  // big re-render is interruptible.
  const [, startTransition] = useTransition();

  // Hydrate preference from localStorage / browser language after mount.
  // Initial render stays "en" on both server and client to avoid a hydration
  // mismatch; the stored/browser preference is applied once, post-mount.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    const initial: Lang =
      stored === "en" || stored === "es"
        ? stored
        : navigator.language?.toLowerCase().startsWith("es")
          ? "es"
          : "en";
    if (initial !== "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only preference sync after mount
      setLangState(initial);
    }
  }, []);

  // Keep <html lang> and storage in sync.
  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  // Language switch: where the View Transition API is available (Baseline
  // 2025) the whole bilingual re-render crossfades as one smooth swap —
  // flushSync inside startViewTransition is the documented pattern (the DOM
  // must be final when the callback resolves). Falls back to the interruptible
  // useTransition path (INP-safe) elsewhere and under reduced motion.
  const applyLang = useCallback(
    (update: () => void) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!document.startViewTransition || reduce || document.hidden) {
        startTransition(update);
        return;
      }
      document.startViewTransition(() => {
        flushSync(update);
      });
    },
    [],
  );
  const setLang = useCallback((l: Lang) => applyLang(() => setLangState(l)), [applyLang]);
  const toggle = useCallback(
    () => applyLang(() => setLangState((p) => (p === "en" ? "es" : "en"))),
    [applyLang],
  );

  const t = site[lang];
  const biz = site.business;

  return (
    <Ctx.Provider
      value={{
        lang,
        setLang,
        toggle,
        t,
        biz,
        emojis,
        hasPhone: Boolean(biz.phone),
        imgBase: `/img/${slug}`,
        blur,
        layout,
        managedSiteId,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useLang(): LanguageCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within <LanguageProvider>");
  return ctx;
}
