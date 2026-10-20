"use client";

import type { CSSProperties } from "react";
import { MotionConfig } from "motion/react";
import { LanguageProvider } from "@/components/LanguageProvider";
import type { SiteContent } from "@/lib/content";
import type { SiteLayout } from "@/lib/clients";

/**
 * surface:"ink" dark register. Merged into the tenant's INLINE style because a
 * stylesheet [data-surface="ink"] var swap loses the cascade to the inline
 * theme palette (which is why the lever was inert for every themed client).
 * Surfaces derive from the tenant's own --color-primary via color-mix, so each
 * dark site is tinted toward its brand rather than one shared charcoal.
 */
const INK_SURFACE_VARS: Record<string, string> = {
  "--color-bg": "color-mix(in srgb, var(--color-primary) 5%, #131010)",
  "--color-surface": "color-mix(in srgb, var(--color-primary) 8%, #1B1717)",
  "--color-surface-alt": "color-mix(in srgb, var(--color-primary) 11%, #241F1F)",
  "--color-ink": "#F5F0EA",
  "--color-ink-soft": "#BAB0A6",
  "--color-line": "color-mix(in srgb, var(--color-primary) 14%, #3B3430)",
};

/**
 * Per-site providers. `themeVars` overrides the Tailwind v4 color/font CSS
 * variables for this subtree, so a single component tree renders any client's
 * brand by swapping the `--color-*` / `--font-display` tokens.
 */
export function Providers({
  site,
  slug,
  emojis,
  themeVars,
  blur,
  layout,
  managedSiteId,
  children,
}: {
  site: SiteContent;
  slug: string;
  emojis?: string[];
  themeVars?: Record<string, string>;
  blur?: Record<string, string>;
  layout?: SiteLayout;
  managedSiteId?: string;
  children: React.ReactNode;
}) {
  const vars =
    layout?.surface === "ink" ? { ...themeVars, ...INK_SURFACE_VARS } : themeVars;

  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider
        site={site}
        slug={slug}
        emojis={emojis}
        blur={blur}
        layout={layout}
        managedSiteId={managedSiteId}
      >
        <div
          className="site-root min-h-dvh bg-bg text-ink"
          style={vars as CSSProperties}
          data-archetype={layout?.archetype}
          data-edge={layout?.edge}
          data-surface={layout?.surface}
          data-tone={layout?.tone}
        >
          {children}
        </div>
      </LanguageProvider>
    </MotionConfig>
  );
}
