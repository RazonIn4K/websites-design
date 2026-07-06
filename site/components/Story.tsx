"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";
import { CountUp } from "@/components/CountUp";

/**
 * Editorial provenance spread: a photo that pins (position: sticky) while the
 * story chapters scroll past it. Pure-CSS sticky — degrades to a stacked column
 * on mobile / where sticky is unsupported, never broken. Reuses About copy.
 * Keeps id="about" so the nav anchor resolves.
 *
 * "scrolly" variant: the pinned panel crossfades between photos as each
 * chapter scrolls into view (IntersectionObserver + opacity only). The first
 * image is server-rendered visible, so no-JS and reduced-motion readers always
 * see a photo; the observer is enhancement-only.
 */
export function Story() {
  const { t, imgBase, blur, layout } = useLang();
  const a = t.about;
  const scrolly = layout.story === "scrolly";
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);

  const images = scrolly ? ["about", "g4", "g5"] : ["about"];

  useEffect(() => {
    if (!scrolly || reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = chapterRefs.current.indexOf(e.target as HTMLDivElement);
            if (idx >= 0) setActive(Math.min(idx, images.length - 1));
          }
        }
      },
      // middle band of the viewport decides the active chapter
      { rootMargin: "-40% 0px -40% 0px" },
    );
    for (const el of chapterRefs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, [scrolly, reduce, images.length]);

  return (
    <section id="about" className="section bg-surface">
      <div className="container-max grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal as="figure" className="reveal-clip relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lifted">
            {images.map((img, i) => (
              <motion.div
                key={img}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: reduce ? (i === 0 ? 1 : 0) : active === i ? 1 : 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{ zIndex: i === active ? 1 : 0 }}
              >
                <Image
                  src={`${imgBase}/${img}.jpg`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                  {...(blur[img] ? { placeholder: "blur" as const, blurDataURL: blur[img] } : {})}
                />
              </motion.div>
            ))}
            {scrolly && (
              <div aria-hidden className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                {images.map((img, i) => (
                  <span
                    key={img}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      active === i ? "w-6 bg-white" : "w-2.5 bg-white/45"
                    }`}
                  />
                ))}
              </div>
            )}
          </Reveal>
        </div>

        <div>
          <SectionHeader eyebrow={a.heading} heading={a.lead} align="left" />
          <div className="space-y-10">
            {a.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.08} className="border-l-2 border-primary/25 pl-6">
                <div
                  ref={(el) => {
                    chapterRefs.current[i] = el;
                  }}
                >
                  <span className="font-display text-sm font-black tabular-nums tracking-widest text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-lg leading-relaxed text-ink-soft">{p}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 grid grid-cols-1 divide-y divide-line rounded-2xl border border-line bg-bg sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {a.stats.map((s) => (
              <div key={s.label} className="px-4 py-5 text-center">
                <CountUp
                  value={s.value}
                  className="block text-balance break-words font-display text-xl font-black leading-tight text-primary sm:text-2xl"
                />
                <div className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-soft">{s.label}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
