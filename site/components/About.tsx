"use client";

import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";
import { CountUp } from "@/components/CountUp";

const COLLAGE = ["about", "g4", "g5", "g6"];

export function About() {
  const { t, imgBase, blur } = useLang();

  return (
    <section id="about" className="section bg-surface">
      <div className="container-max grid items-center gap-12 lg:grid-cols-2">
        {/* Photo collage with clip-reveal */}
        <div className="order-2 grid aspect-square grid-cols-2 grid-rows-2 gap-3 lg:order-1">
          {COLLAGE.map((name, idx) => (
            <Reveal
              key={name}
              delay={idx * 0.07}
              className="reveal-clip hover-lift relative overflow-hidden rounded-2xl shadow-card"
            >
              <Image
                src={`${imgBase}/${name}.jpg`}
                alt=""
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="object-cover"
                {...(blur[name] ? { placeholder: "blur" as const, blurDataURL: blur[name] } : {})}
              />
            </Reveal>
          ))}
        </div>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <SectionHeader eyebrow={t.about.heading} heading={t.about.lead} align="left" />

          <div className="space-y-4">
            {t.about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p
                  className={
                    i === 0
                      ? "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:font-black first-letter:leading-[0.8] first-letter:text-primary"
                      : ""
                  }
                >
                  {p}
                </p>
              </Reveal>
            ))}
          </div>

          {/* Credential stat band */}
          <Reveal className="mt-10 overflow-hidden rounded-2xl border border-line bg-bg">
            <div className="h-1 gradient-brand" />
            <div className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {t.about.stats.map((s) => (
                <div key={s.label} className="px-4 py-5 text-center">
                  <CountUp
                    value={s.value}
                    className="block text-balance break-words font-display text-xl font-black leading-tight text-primary sm:text-2xl"
                  />
                  <div className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-soft">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
