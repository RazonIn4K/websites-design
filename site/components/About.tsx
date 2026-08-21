"use client";

import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";
import { StatBand } from "@/components/StatBand";

/** Refined (calm/editorial) collage: one tall anchor + two supporting tiles. */
const COLLAGE_REFINED = ["about", "g4", "g5"];

export function About() {
  const { t, imgBase, blur, layout } = useLang();
  const refined = layout.tone === "calm" || layout.tone === "editorial";
  const first = t.about.paragraphs[0] ?? "";
  // Drop cap only when the opener starts like a sentence — a leading numeral
  // or an all-caps mark ("A-1…") floats a broken glyph instead of a flourish.
  // Letter + space still qualifies ("A DeKalb institution…").
  const dropCap = /^[A-Za-z](?=[a-z]|\s)/.test(first);

  const tile = (name: string, idx: number, cls: string, sizes: string) => (
    <Reveal
      key={name}
      delay={idx * 0.07}
      className={`reveal-clip hover-lift relative overflow-hidden rounded-2xl shadow-card ${cls}`}
    >
      <Image
        src={`${imgBase}/${name}.jpg`}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
        {...(blur[name] ? { placeholder: "blur" as const, blurDataURL: blur[name] } : {})}
      />
    </Reveal>
  );

  return (
    <section id="about" className="section bg-surface">
      <div className="container-max grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Photo collage with clip-reveal */}
        {refined ? (
          /* Shorter than square so short copy doesn't sit beside a hollow void */
          <div className="order-2 grid aspect-[5/4] max-h-[24rem] w-full grid-cols-3 grid-rows-2 gap-2.5 lg:order-1 lg:max-h-[28rem]">
            {tile(COLLAGE_REFINED[0], 0, "col-span-2 row-span-2", "(min-width: 1024px) 30vw, 60vw")}
            {tile(COLLAGE_REFINED[1], 1, "", "(min-width: 1024px) 15vw, 30vw")}
            {tile(COLLAGE_REFINED[2], 2, "", "(min-width: 1024px) 15vw, 30vw")}
          </div>
        ) : (
          /* Asymmetric pair: dominant portrait + overlapping square (capped height) */
          <div className="relative order-2 lg:order-1">
            {tile("about", 0, "aspect-[4/5] max-h-[32rem] w-full", "(min-width: 1024px) 40vw, 92vw")}
            {tile(
              "g4",
              1,
              "ml-auto mt-3 aspect-square w-1/2 lg:absolute lg:-bottom-6 lg:-right-4 lg:mt-0 lg:w-2/5",
              "(min-width: 1024px) 16vw, 46vw",
            )}
          </div>
        )}

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <SectionHeader eyebrow={t.about.heading} heading={t.about.lead} align="left" />

          <div className="space-y-3">
            {t.about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <p
                  className={
                    i === 0 && dropCap
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
          <StatBand stats={t.about.stats} />
        </div>
      </div>
    </section>
  );
}
