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

/** Hanging punctuation is Safari-only; every quote also opens with a real
 *  typographic glyph inline, so other engines simply render it in-flow. */
const QUOTE_HANG = "[hanging-punctuation:first]";

/** ONE compact decorative star lockup beside the section header — replaces the
 *  old per-card 5-star rows. Purely decorative (aria-hidden): these are demo
 *  quotes and each site discloses that, so no counts, rating numbers, or
 *  source names are claimed (content-integrity rule). Sits centered in the
 *  header gap: pulled up by half, restored below. */
function StarLockup({ align = "center" }: { align?: "center" | "left" }) {
  return (
    <div
      aria-hidden
      style={STAR_ON_LIGHT}
      className={`-mt-[calc(var(--header-gap)/2)] mb-[calc(var(--header-gap)/2)] flex gap-1.5 ${align === "center" ? "justify-center" : ""}`.trim()}
    >
      {Array.from({ length: 5 }).map((_, s) => (
        <Star key={s} className="h-4 w-4" />
      ))}
    </div>
  );
}

/** Typographic attribution — em-dash, name at 600, role in small caps.
 *  Replaces the monogram Avatar: fake initial-circles next to demo quotes
 *  actively reduce trust, a plain byline doesn't. */
function Attribution({
  name,
  role,
  compact = false,
  className = "",
}: {
  name: string;
  role: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <figcaption className={`flex flex-wrap items-baseline gap-x-2 ${className}`.trim()}>
      <span className={`font-semibold text-ink ${compact ? "text-sm" : ""}`.trim()}>
        <span aria-hidden>{"— "}</span>
        {name}
      </span>
      <span
        className={`tracking-wide text-ink-soft [font-variant-caps:all-small-caps] ${compact ? "text-xs" : "text-sm"}`}
      >
        {role}
      </span>
    </figcaption>
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
        <StarLockup align="left" />
        <div className="grid gap-6 lg:grid-cols-[7fr_5fr] lg:gap-8">
          <Reveal as="figure">
            <blockquote
              className={`font-display text-[length:var(--step-2)] font-medium italic leading-[1.3] text-ink ${QUOTE_HANG}`}
            >
              “{feature.quote}”
            </blockquote>
            <Attribution
              name={feature.name}
              role={feature.role}
              className="mt-6 border-t border-line pt-5"
            />
          </Reveal>
          <div className="flex flex-col justify-center gap-5">
            {rest.map((q, idx) => (
              <Reveal as="figure" key={idx} delay={0.1 + idx * 0.1} className="card-flat p-6">
                <blockquote className={`italic leading-relaxed text-ink ${QUOTE_HANG}`}>
                  “{q.quote}”
                </blockquote>
                <Attribution compact name={q.name} role={q.role} className="mt-4" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Quote wall (craft/energetic): two counter-scrolling rows of stamped
      ticket chips — the hard-edge CSS supplies the border + offset shadow via
      `.shadow-card`; a dashed rule above the byline reads as the stub tear ── */
function Wall() {
  const { t, lang } = useLang();
  const items = t.testimonials.items;
  const row = (list: typeof items, hidden: boolean) => (
    <div aria-hidden={hidden} className="flex shrink-0 gap-4 pr-4">
      {list.map((q, idx) => (
        <figure
          key={idx}
          className="w-[17rem] shrink-0 rounded-xl border border-line bg-bg p-5 shadow-card sm:w-[22rem]"
        >
          <blockquote className={`line-clamp-3 text-sm leading-relaxed text-ink ${QUOTE_HANG}`}>
            “{q.quote}”
          </blockquote>
          <Attribution
            compact
            name={q.name}
            role={q.role}
            className="mt-3 border-t border-dashed border-line pt-3"
          />
        </figure>
      ))}
    </div>
  );
  const reordered = [...items.slice(1), items[0]];
  return (
    <section className="section noise-overlay overflow-x-clip bg-surface-alt">
      <div className="container-max">
        <SectionHeader eyebrow={EYEBROW[lang]} heading={t.testimonials.heading} />
        <StarLockup />
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
        <StarLockup />

        {/* Desktop: aligned 3-up quote grid — quiet flat cards; bylines pin to
            the bottom edge so the em-dash line gives the row its rhythm */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {items.map((q, idx) => (
            <Reveal as="figure" key={idx} delay={idx * 0.1} className="card-flat flex flex-col p-8">
              <blockquote className={`font-display text-xl italic leading-snug text-ink ${QUOTE_HANG}`}>
                “{q.quote}”
              </blockquote>
              <Attribution name={q.name} role={q.role} className="mt-auto pt-6" />
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
          <div className="card-flat min-h-[16rem] p-8" aria-live={paused ? "polite" : "off"}>
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
                <blockquote
                  className={`font-display text-2xl font-medium italic leading-snug text-ink ${QUOTE_HANG}`}
                >
                  “{active.quote}”
                </blockquote>
                <Attribution name={active.name} role={active.role} className="mt-6" />
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
