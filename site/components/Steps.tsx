"use client";

import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";

const EYEBROW = {
  process: { en: "How it works", es: "Cómo trabajamos" },
  ritual: { en: "Your visit", es: "Tu visita" },
};

// Opaque alternating tones for deck cards (they overlap while stacking, so
// every card needs a solid fill); the final card lands on the brand gradient.
const DECK_TONES = ["bg-bg", "bg-surface-alt", "bg-bg", "bg-surface-alt"];

/**
 * Numbered step rail — used by the authority "process" and wellness "ritual"
 * flows. Default: static grid (Reveal stagger only). "deck" variant: cards
 * stack on top of each other as you scroll (position:sticky with peeking
 * offsets) — pure layout, so it works without JS and under reduced motion.
 */
export function Steps({ which }: { which: "process" | "ritual" }) {
  const { t, lang, layout } = useLang();
  const block = t[which];
  if (!block || !block.steps?.length) return null;

  if (layout.steps === "deck") {
    const last = block.steps.length - 1;
    return (
      <section id={which} className="section bg-surface">
        <div className="container-max">
          <SectionHeader eyebrow={EYEBROW[which][lang]} heading={block.heading} align="left" />
          <ol className="deck mx-auto max-w-3xl pb-8">
            {block.steps.map((s, i) => {
              const climax = i === last;
              return (
                <li
                  key={s.title}
                  // per-card sticky offset: stacked edges peek out like a hand of cards
                  style={{ top: `calc(5.5rem + ${i} * 1.15rem)` }}
                  className={`noise-overlay relative flex min-h-[19rem] flex-col justify-end overflow-hidden rounded-2xl p-8 shadow-lifted sm:min-h-[21rem] sm:p-10 ${
                    climax ? "gradient-brand" : DECK_TONES[i % DECK_TONES.length]
                  } ${climax ? "" : "border border-line"}`}
                >
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute right-6 top-4 select-none font-display text-8xl font-black leading-none sm:text-9xl ${
                      climax ? "text-white/15" : "text-primary/10"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`font-display text-sm font-black tabular-nums tracking-widest ${climax ? "text-white/80" : "text-primary"}`}>
                    {String(i + 1).padStart(2, "0")} / {String(block.steps.length).padStart(2, "0")}
                  </span>
                  <h3 className={`text-h2 mt-3 ${climax ? "text-white" : "text-ink"}`}>{s.title}</h3>
                  <p className={`mt-3 max-w-xl text-lg ${climax ? "text-white/85" : "text-ink-soft"}`}>{s.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    );
  }

  const cols = block.steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <section id={which} className="section bg-surface">
      <div className="container-max">
        <SectionHeader eyebrow={EYEBROW[which][lang]} heading={block.heading} align="left" />
        <ol className={`grid gap-x-8 gap-y-10 sm:grid-cols-2 ${cols}`}>
          {block.steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.08} className="relative border-t border-line pt-5">
              <span aria-hidden className="font-display text-5xl font-black tabular-nums leading-none text-primary/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-h3 mt-3 text-ink">{s.title}</h3>
              <p className="mt-2 text-ink-soft">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
