"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { A11Y } from "@/lib/a11y";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";
import { Star, ChevronLeft } from "@/components/icons";

const EYEBROW = { en: "Reviews", es: "Reseñas" };

/** Stars on LIGHT cards: raw accent tokens are tuned for dark-photo overlays
 *  and can wash out on cream surfaces (tails/victory audit) — mixing toward
 *  ink guarantees presence on any palette. */
const STAR_ON_LIGHT = { color: "color-mix(in srgb, var(--color-accent) 55%, var(--color-ink))" };

function Stars({ label, size = "h-5 w-5" }: { label: string; size?: string }) {
  return (
    <div className="flex gap-1" style={STAR_ON_LIGHT} role="img" aria-label={label}>
      {Array.from({ length: 5 }).map((_, s) => (
        <Star key={s} className={size} />
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

/* ── Spotlight (editorial/authority/wellness): one oversized pull-quote
      carries the section; the other voices support from the side ── */
function Spotlight() {
  const { t, lang } = useLang();
  const [feature, ...rest] = t.testimonials.items;
  return (
    <section className="section noise-overlay bg-surface-alt">
      <div className="container-max">
        <SectionHeader eyebrow={EYEBROW[lang]} heading={t.testimonials.heading} align="left" />
        <div className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <Reveal>
            <span aria-hidden className="block select-none font-display text-[7rem] leading-[0.45] text-primary/15 sm:text-[9rem]">
              “
            </span>
            <blockquote className="font-display text-[clamp(1.6rem,3vw,2.5rem)] font-medium italic leading-[1.28] text-ink">
              {feature.quote}
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4 border-t border-line pt-6">
              <Avatar name={feature.name} />
              <span>
                <span className="block font-display font-bold text-ink">{feature.name}</span>
                <span className="block text-sm text-ink-soft">{feature.role}</span>
              </span>
              <span className="ml-auto"><Stars label={A11Y[lang].ratingStars} size="h-4 w-4" /></span>
            </figcaption>
          </Reveal>
          <div className="flex flex-col justify-center gap-5">
            {rest.map((q, idx) => (
              <Reveal key={idx} delay={0.1 + idx * 0.1} className="rounded-2xl border border-line bg-bg p-6 shadow-card">
                <Stars label={A11Y[lang].ratingStars} size="h-4 w-4" />
                <blockquote className="mt-3 italic leading-relaxed text-ink">{q.quote}</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <Avatar name={q.name} />
                  <span>
                    <span className="block text-sm font-bold text-ink">{q.name}</span>
                    <span className="block text-xs text-ink-soft">{q.role}</span>
                  </span>
                </figcaption>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Quote wall (craft/energetic): two counter-scrolling rows of quote chips —
      rhymes with the marquee ribbons these archetypes already run ── */
function Wall() {
  const { t, lang } = useLang();
  const items = t.testimonials.items;
  const row = (list: typeof items, hidden: boolean) => (
    <div aria-hidden={hidden} className="flex shrink-0 gap-4 pr-4">
      {list.map((q, idx) => (
        <figure key={idx} className="w-[17rem] shrink-0 rounded-xl border border-line bg-bg p-5 shadow-card sm:w-[22rem]">
          <Stars label={A11Y[lang].ratingStars} size="h-3.5 w-3.5" />
          <blockquote className="mt-2 line-clamp-3 text-sm italic leading-relaxed text-ink">“{q.quote}”</blockquote>
          <figcaption className="mt-3 text-xs font-bold text-ink">
            {q.name} <span className="font-normal text-ink-soft">· {q.role}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
  const reordered = [...items.slice(1), items[0]];
  return (
    <section className="section noise-overlay overflow-x-clip bg-surface-alt">
      <div className="container-max">
        <SectionHeader eyebrow={EYEBROW[lang]} heading={t.testimonials.heading} />
      </div>
      {/* mask lives on the fixed-width wrapper, NOT the translating w-max
          track — on the track it scrolls away with the chips and the
          viewport's left edge hard-slices them */}
      <div className="marquee-mask overflow-x-clip">
        <div className="flex w-max animate-marquee">
          {row(items, false)}
          {row(items, true)}
          {row(items, true)}
          {row(items, true)}
        </div>
      </div>
      <div className="marquee-mask mt-4 overflow-x-clip">
        <div className="flex w-max animate-marquee [animation-direction:reverse]">
          {row(reordered, true)}
          {row(reordered, true)}
          {row(reordered, true)}
          {row(reordered, true)}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const { t, lang, layout } = useLang();
  const reduce = useReducedMotion();
  const items = t.testimonials.items;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  // Skin resolves from the archetype so the fleet differentiates automatically;
  // layout.reviews overrides per client.
  const skin =
    layout.reviews ??
    (["editorial", "authority", "wellness"].includes(layout.archetype ?? "")
      ? "spotlight"
      : layout.edge === "hard"
        ? "wall"
        : "grid");

  const go = useCallback(
    (dir: number) => setI((p) => (p + dir + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    if (paused || reduce || skin !== "grid") return;
    // The carousel is lg:hidden — don't run the timer where it isn't shown.
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) return;
    const id = setInterval(() => setI((p) => (p + 1) % items.length), 5500);
    return () => clearInterval(id);
  }, [paused, reduce, items.length, skin]);

  if (skin === "spotlight") return <Spotlight />;
  if (skin === "wall") return <Wall />;

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
