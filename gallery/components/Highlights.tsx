"use client";

import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";
import { ICONS } from "@/components/icons";
import { A11Y } from "@/lib/a11y";

// Quiet tones for the non-feature bento cells (the first cell is the photo
// feature). Surface/bg alternation only — no gradient cells; the icon carries
// the color and its voice varies per tenant via CSS on svg[data-icon].
const TONES = [
  { bg: "bg-surface", icon: "text-primary" },
  { bg: "bg-bg", icon: "text-secondary" },
];

export function Highlights() {
  const { t, lang, layout, imgBase, blur } = useLang();
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
              <Reveal key={h.title} as="article" delay={i * 0.07} className="hover-lift card-flat p-6">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="text-h3 mt-4 text-ink">{h.title}</h3>
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
              className="grid items-baseline gap-x-6 gap-y-1 border-b border-line py-5 sm:grid-cols-[3.5rem_1fr] lg:grid-cols-[5rem_1fr_2fr]"
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

  // ── Default: asymmetric bento — first cell is a photo feature, the rest are
  // quiet one-device tiles (icon only; no ordinal watermark, no accent rule) ──
  return (
    <section id="highlights" className="section container-max">
      <SectionHeader eyebrow={A11Y[lang].highlights} heading={A11Y[lang].whyUs} />
      <div className="bento">
        {items.map((h, i) => {
          const Icon = ICONS[h.icon] ?? ICONS.heart;
          if (i === 0) {
            // Feature cell: tenant photo under a dark scrim with white text;
            // brand color is a 2px top rule, not the whole cell.
            return (
              <Reveal
                key={h.title}
                as="article"
                className="hover-lift relative flex min-h-56 flex-col justify-end gap-3 overflow-hidden rounded-2xl p-6 shadow-card"
              >
                <Image
                  src={`${imgBase}/about.jpg`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                  {...(blur.about ? { placeholder: "blur" as const, blurDataURL: blur.about } : {})}
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />
                <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
                <Icon className="relative h-6 w-6 text-white" />
                <h3 className="wrap-break-word relative text-h2 text-white">{h.title}</h3>
                <p className="relative text-lg text-white/85">{h.text}</p>
              </Reveal>
            );
          }
          const tone = TONES[(i - 1) % TONES.length];
          return (
            <Reveal
              key={h.title}
              as="article"
              delay={i * 0.08}
              className={`hover-lift flex flex-col gap-3 overflow-hidden rounded-2xl border border-line p-6 shadow-card ${tone.bg}`}
            >
              <Icon className={`h-6 w-6 ${tone.icon}`} />
              <h3 className="wrap-break-word text-h3 text-ink">{h.title}</h3>
              <p className="text-ink-soft">{h.text}</p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
