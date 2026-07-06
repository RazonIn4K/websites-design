"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { A11Y } from "@/lib/a11y";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";
import { Star, ChevronLeft } from "@/components/icons";

const EYEBROW = { en: "Reviews", es: "Reseñas" };

function Stars({ label }: { label: string }) {
  return (
    <div className="flex gap-1 text-accent" role="img" aria-label={label}>
      {Array.from({ length: 5 }).map((_, s) => (
        <Star key={s} className="h-5 w-5" />
      ))}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full gradient-brand font-display text-lg font-black text-white">
      {name.charAt(0)}
    </span>
  );
}

export function Testimonials() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const items = t.testimonials.items;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: number) => setI((p) => (p + dir + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    if (paused || reduce) return;
    // The carousel is lg:hidden — don't run the timer where it isn't shown.
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) return;
    const id = setInterval(() => setI((p) => (p + 1) % items.length), 5500);
    return () => clearInterval(id);
  }, [paused, reduce, items.length]);

  const active = items[i];

  return (
    <section className="section noise-overlay bg-surface-alt">
      <div className="container-max">
        <SectionHeader eyebrow={EYEBROW[lang]} heading={t.testimonials.heading} />

        {/* Desktop: staggered 3-up pull-quote grid */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {items.map((q, idx) => (
            <Reveal
              key={idx}
              delay={idx * 0.1}
              className={`hover-lift rounded-2xl bg-bg p-8 shadow-card ${idx === 1 ? "lg:-mt-4" : ""}`}
            >
              <span aria-hidden className="block select-none font-display text-7xl leading-[0.6] text-primary/15">“</span>
              <div className="mt-2"><Stars label={A11Y[lang].ratingStars} /></div>
              <blockquote className="mt-4 font-display text-xl italic leading-snug text-ink">{q.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <Avatar name={q.name} />
                <span>
                  <span className="block font-display font-bold text-ink">{q.name}</span>
                  <span className="block text-sm text-ink-soft">{q.role}</span>
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>

        {/* Mobile: carousel */}
        <div
          className="relative mx-auto max-w-3xl lg:hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="min-h-[16rem] rounded-2xl bg-bg p-8 shadow-card" aria-live={paused ? "polite" : "off"}>
            <AnimatePresence mode="wait">
              {/* drag-to-swipe (direct manipulation, so not gated on reduced
                  motion); pan-y stays free for page scrolling */}
              <motion.figure
                key={i}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.55}
                onDragStart={() => setPaused(true)}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1);
                  else if (info.offset.x > 60) go(-1);
                }}
                className="cursor-grab touch-pan-y active:cursor-grabbing"
              >
                <Stars label={A11Y[lang].ratingStars} />
                <blockquote className="mt-4 font-display text-2xl font-medium italic leading-snug text-ink">
                  “{active.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <Avatar name={active.name} />
                  <span>
                    <span className="block font-display font-bold text-ink">{active.name}</span>
                    <span className="block text-sm text-ink-soft">{active.role}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => go(-1)}
              aria-label={A11Y[lang].prevTestimonial}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-bg text-ink transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex">
              {items.map((_, d) => (
                // 24px+ hit target (WCAG 2.5.8) around the small visual dot
                <button
                  key={d}
                  onClick={() => setI(d)}
                  aria-label={A11Y[lang].goToTestimonial(d + 1)}
                  aria-current={d === i ? "true" : undefined}
                  className="grid h-6 min-w-6 place-items-center px-0.5"
                >
                  <span
                    aria-hidden
                    className={`block h-2.5 rounded-full transition-all ${d === i ? "w-7 bg-primary" : "w-2.5 bg-line hover:bg-ink-soft"}`}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={() => go(1)}
              aria-label={A11Y[lang].nextTestimonial}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-bg text-ink transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
