"use client";

import type { CSSProperties } from "react";
import { MotionConfig } from "motion/react";
import { LanguageProvider } from "@/components/LanguageProvider";
import type { SiteContent } from "@/lib/content";
import type { SiteLayout } from "@/lib/clients";

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
  children,
}: {
  site: SiteContent;
  slug: string;
  emojis?: string[];
  themeVars?: Record<string, string>;
  blur?: Record<string, string>;
  layout?: SiteLayout;
  children: React.ReactNode;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <LanguageProvider site={site} slug={slug} emojis={emojis} blur={blur} layout={layout}>
        <div
          className="min-h-dvh bg-bg text-ink"
          style={themeVars as CSSProperties}
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
