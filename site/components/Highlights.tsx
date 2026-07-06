"use client";

import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";
import { ICONS } from "@/components/icons";
import { A11Y } from "@/lib/a11y";

// Light tones for the non-feature bento cells (the first cell is the feature).
const TONES = [
  { bg: "bg-surface", icon: "bg-primary/10 text-primary" },
  { bg: "bg-surface-alt", icon: "bg-accent/25 text-ink" },
  { bg: "bg-surface", icon: "bg-secondary/12 text-secondary" },
];

export function Highlights() {
  const { t, lang, layout } = useLang();
  const skin = layout.highlights;
  const items = t.highlights;

  // ── Credentials (authority): restrained monochrome trust grid ──
  if (skin === "credentials") {
    return (
      <section id="highlights" className="section container-max">
        <SectionHeader eyebrow={A11Y[lang].highlights} heading={A11Y[lang].whyUs} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((h, i) => {
            const Icon = ICONS[h.icon] ?? ICONS.heart;
            return (
              <Reveal key={h.title} as="article" delay={i * 0.07} className="hover-lift rounded-2xl border border-line bg-surface p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-h3 mt-4 text-primary">{h.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{h.text}</p>
              </Reveal>
            );
          })}
        </div>
      </section>
    );
  }

  // ── Index (editorial): magazine numbered list with hairline rules ──
  if (skin === "index") {
    return (
      <section id="highlights" className="section container-max">
        <SectionHeader eyebrow={A11Y[lang].highlights} heading={A11Y[lang].whyUs} align="left" />
        <ol className="border-t border-line">
          {items.map((h, i) => (
            <Reveal
              key={h.title}
              as="li"
              delay={i * 0.06}
              className="grid items-baseline gap-x-6 gap-y-1 border-b border-line py-7 sm:grid-cols-[3.5rem_1fr] lg:grid-cols-[5rem_1fr_2fr]"
            >
              <span className="font-display text-4xl font-black tabular-nums leading-none text-primary/30">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-h3 text-ink">{h.title}</h3>
              <p className="text-ink-soft sm:col-start-2 lg:col-start-3 lg:row-start-1">{h.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>
    );
  }

  // ── Default: Apple-style asymmetric bento — first card is the feature ──
  return (
    <section id="highlights" className="section container-max">
      <SectionHeader eyebrow={A11Y[lang].highlights} heading={A11Y[lang].whyUs} />
      <div className="bento">
        {items.map((h, i) => {
          const Icon = ICONS[h.icon] ?? ICONS.heart;
          const feature = i === 0;
          const tone = feature
            ? { bg: "gradient-brand text-white", icon: "bg-white/20 text-white" }
            : TONES[(i - 1) % TONES.length];
          const light = tone.bg.includes("text-white");
          return (
            <Reveal
              key={h.title}
              as="article"
              delay={i * 0.08}
              className={`hover-lift noise-overlay relative flex flex-col gap-4 overflow-hidden rounded-2xl p-7 shadow-card ${feature ? "justify-end" : ""} ${tone.bg}`}
            >
              <span aria-hidden className="pointer-events-none absolute right-5 top-2 select-none font-display text-7xl font-black leading-none opacity-10">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`grid h-11 w-11 place-items-center rounded-full ${tone.icon}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className={`wrap-break-word ${feature ? "text-h2" : "text-h3"} ${light ? "text-white" : "text-ink"}`}>{h.title}</h3>
                <span className={`mt-3 block h-px w-8 ${light ? "bg-white/40" : "bg-primary/40"}`} />
              </div>
              <p className={`${feature ? "text-lg" : ""} ${light ? "text-white/85" : "text-ink-soft"}`}>{h.text}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
