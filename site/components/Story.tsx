"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";
import { StatBand } from "@/components/StatBand";

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
          {scrolly && (
            /* Caption for the active figure. The content model has no per-chapter
               titles, so this pairs the live chapter ordinal with the localized
               story heading; aria-hidden — it duplicates the section header. */
            <p
              aria-hidden
              className="mt-3 flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wider text-ink-soft"
            >
              <span className="font-display font-black tabular-nums text-primary">
                {String(active + 1).padStart(2, "0")}
              </span>
              {a.heading}
            </p>
          )}
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
                  <span className="font-display text-xs font-bold tabular-nums tracking-widest text-ink-soft">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-lg leading-relaxed text-ink-soft">{p}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <StatBand stats={a.stats} />
        </div>
      </div>
    </section>
  );
}
