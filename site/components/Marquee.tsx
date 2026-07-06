"use client";

import { useLang } from "@/components/LanguageProvider";
import { Sparkle } from "@/components/icons";

/**
 * Editorial marquee band — a slow scrolling brand ticker built entirely from
 * per-client data. Filled/outline word rhythm; pauses on hover; static under
 * reduced motion.
 */
export function Marquee() {
  const { t, biz } = useLang();
  // t.hero.eyebrow (not biz.vertical): the ticker must follow the active
  // language — vertical is an English-only business field.
  const words = [t.hero.eyebrow, ...t.highlights.map((h) => h.title), `${biz.city}, ${biz.state}`];

  const track = (key: string, hidden: boolean) => (
    <div key={key} className="flex shrink-0 items-center gap-8 px-4" aria-hidden={hidden}>
      {words.map((w, i) => (
        <span key={i} className="flex items-center gap-8">
          <span
            className={`font-display text-3xl font-black italic tracking-tight sm:text-4xl ${
              i % 2 === 1 ? "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.8)]" : "text-white"
            }`}
          >
            {w}
          </span>
          <Sparkle className="h-5 w-5 shrink-0 text-white/70" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="gradient-brand noise-overlay overflow-hidden py-6" aria-hidden="true">
      <div className="marquee-mask flex w-max animate-marquee">
        {track("a", false)}
        {track("b", true)}
      </div>
    </div>
  );
}
