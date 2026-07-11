"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { CountUp } from "@/components/CountUp";
import { ArrowRight, Phone, Sparkle, Star, MapPin } from "@/components/icons";

/** Cross-document morph target: the /sites card image names itself vt-hero at
 *  click time, and this (the only vt-hero in the destination document) is what
 *  it morphs into. */
const vtHero = { viewTransitionName: "vt-hero" } as const;

/** Floating glass proof chip over the hero photo seam. The stat `value` is a
 *  short number on some tenants ("100%") but a phrase on most ("Walk-Ins",
 *  "Dogs · Cats · Small Pets"), so size by length + constrain width and let
 *  long values wrap as a clean tag instead of overflowing. Desktop only. */
function StatChip({ stat, position, delay }: { stat: { value: string; label: string }; position: string; delay: string }) {
  const big = String(stat.value).length <= 6;
  return (
    <div
      aria-hidden
      className={`glass animate-rise pointer-events-none absolute z-10 hidden max-w-[13.5rem] rounded-2xl px-5 py-4 text-center shadow-lifted lg:block ${position}`}
      // ~95% opaque fill so the value/label keep AA contrast over any tenant photo
      // (the translucent .glass alone can dip under 4.5:1 on a dark photo seam).
      style={{ animationDelay: delay, background: "color-mix(in srgb, var(--color-bg) 95%, transparent)" }}
    >
      <CountUp value={stat.value} className={`block font-display font-black leading-tight text-primary text-balance ${big ? "text-3xl" : "text-lg"}`} />
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">{stat.label}</div>
    </div>
  );
}

export function Hero() {
  const { t, biz, hasPhone, imgBase, blur, layout } = useLang();
  const variant = layout.hero ?? "left";
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const yCopy = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const yMid = useTransform(scrollYProgress, [0, 1], ["0%", "7%"]);
  const ySlow = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);

  const blurProps = blur.hero ? { placeholder: "blur" as const, blurDataURL: blur.hero } : {};
  const blurFor = (k: string) => (blur[k] ? { placeholder: "blur" as const, blurDataURL: blur[k] } : {});
  const reserveHref = hasPhone ? `tel:${biz.phoneHref}` : "#visit";
  const stars = (
    <span className="flex text-accent" role="img" aria-label={t.hero.badge}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4" />
      ))}
    </span>
  );

  // ── Editorial split: full-height photo beside a typeset copy panel ──
  if (variant === "editorial") {
    return (
      <section ref={ref} id="top" className="relative w-full">
        <div className="grid min-h-dvh lg:grid-cols-2">
          <div className="gradient-mesh-anim order-2 flex flex-col justify-center bg-surface px-6 py-20 sm:px-12 lg:order-1 lg:px-16">
            <div className="relative max-w-xl">
              <span className="eyebrow mb-5 inline-flex animate-rise items-center gap-2" style={{ animationDelay: "0ms" }}>
                <Sparkle className="h-3.5 w-3.5" />
                {t.hero.eyebrow}
              </span>
              <h1 className="text-display text-ink">
                <span className="block animate-rise" style={{ animationDelay: "60ms" }}>{t.hero.title}</span>
                <span className="display-accent block animate-rise font-[500] italic text-primary" style={{ animationDelay: "150ms" }}>
                  {t.hero.titleAccent}
                </span>
              </h1>
              <p className="text-lead mt-6 animate-rise" style={{ animationDelay: "260ms" }}>{t.hero.subtitle}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3 animate-rise" style={{ animationDelay: "360ms" }}>
                <a href="#menu" className="btn btn-primary group text-base">
                  {t.hero.ctaPrimary}
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <a href={reserveHref} className="btn btn-ink text-base">
                  {hasPhone && <Phone className="h-5 w-5" />}
                  {t.hero.ctaSecondary}
                </a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 animate-rise text-sm text-ink-soft" style={{ animationDelay: "480ms" }}>
                <span className="flex items-center gap-2">{stars}<span className="font-medium text-ink">{t.hero.badge}</span></span>
                <span className="hidden h-4 w-px bg-line sm:block" />
                <span className="hidden items-center gap-1.5 sm:flex"><MapPin className="h-4 w-4 text-primary" />{biz.city}, {biz.state}</span>
              </div>
            </div>
          </div>
          <div className="relative order-1 min-h-[44vh] overflow-hidden lg:order-2 lg:min-h-dvh">
            <motion.div style={{ y: reduce ? 0 : yImg }} className="absolute inset-x-0 top-0 h-[110%]">
              <Image src={`${imgBase}/hero.jpg`} alt={`${biz.name} — ${t.hero.eyebrow}`} fill priority style={vtHero} sizes="(min-width:1024px) 50vw, 100vw" className="animate-kenburns object-cover" {...blurProps} />
            </motion.div>
          </div>
        </div>
        {/* Floating proof chips over the photo's inner edge (lg only) — kept past
            the 50% seam so they never reach the copy panel's headline/CTAs. */}
        {t.about?.stats?.[0] && <StatChip stat={t.about.stats[0]} position="left-[51%] top-[18%]" delay="560ms" />}
        {t.about?.stats?.[1] && <StatChip stat={t.about.stats[1]} position="bottom-[15%] left-[57%]" delay="680ms" />}
      </section>
    );
  }

  // ── Collage (playful retail): layered polaroid photo stack over a breathing
  //    mesh, ghost display type behind, depth via three parallax speeds ──
  if (variant === "collage") {
    return (
      <section ref={ref} id="top" className="gradient-mesh-anim relative w-full overflow-x-clip bg-bg">
        <div className="container-max grid min-h-dvh items-center gap-12 pt-28 pb-20 lg:grid-cols-2 lg:gap-10">
          <div className="relative z-10 max-w-xl">
            <span className="eyebrow mb-5 inline-flex animate-rise items-center gap-2" style={{ animationDelay: "0ms" }}>
              <Sparkle className="h-3.5 w-3.5" />
              {t.hero.eyebrow}
            </span>
            <h1 className="text-display text-ink">
              <span className="block animate-rise" style={{ animationDelay: "60ms" }}>{t.hero.title}</span>
              <span className="display-accent block animate-rise font-[500] italic text-primary" style={{ animationDelay: "150ms" }}>
                {t.hero.titleAccent}
              </span>
            </h1>
            <p className="text-lead mt-6 animate-rise" style={{ animationDelay: "260ms" }}>{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-rise" style={{ animationDelay: "360ms" }}>
              <a href="#menu" className="btn btn-primary group text-base">
                {t.hero.ctaPrimary}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href={reserveHref} className="btn btn-ink text-base">
                {hasPhone && <Phone className="h-5 w-5" />}
                {t.hero.ctaSecondary}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 animate-rise text-sm text-ink-soft" style={{ animationDelay: "480ms" }}>
              <span className="flex items-center gap-2">{stars}<span className="font-medium text-ink">{t.hero.badge}</span></span>
              <span className="hidden h-4 w-px bg-line sm:block" />
              <span className="hidden items-center gap-1.5 sm:flex"><MapPin className="h-4 w-4 text-primary" />{biz.city}, {biz.state}</span>
            </div>
          </div>

          {/* Layered photo stack: ghost type at the back, then three polaroids
              at three parallax speeds — nearest moves most. Decorative photos
              carry empty alt; the composition is described by the copy column. */}
          <div className="relative mx-auto aspect-square w-full max-w-[26rem] sm:max-w-[30rem] lg:max-w-[34rem]">
            {/* ghost word lives inside a fade-masked, overflow-hidden wrapper the
                width of the stack — long phrases fade out INSIDE the wrapper
                instead of hard-clipping at the viewport edge (re-critique v2) */}
            <div aria-hidden className="ghost-fade absolute inset-x-0 top-[2%] flex justify-center overflow-hidden">
              <span
                className="ghost-word animate-rise whitespace-nowrap text-[clamp(3.5rem,8vw,7rem)]"
                style={{ animationDelay: "200ms" }}
              >
                {t.hero.titleAccent}
              </span>
            </div>
            <motion.figure
              style={{ y: reduce ? 0 : ySlow }}
              className="polaroid absolute left-0 top-[14%] z-10 w-[60%] rotate-[-4deg] animate-rise"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[inherit]">
                <Image src={`${imgBase}/hero.jpg`} alt={`${biz.name} — ${t.hero.eyebrow}`} fill priority style={vtHero} sizes="(min-width:1024px) 20rem, 60vw" className="object-cover" {...blurProps} />
              </div>
            </motion.figure>
            <motion.figure
              style={{ y: reduce ? 0 : yMid, animationDelay: "320ms" }}
              className="polaroid absolute right-0 top-[6%] z-20 w-[42%] rotate-[5deg] animate-rise"
            >
              <div className="relative aspect-square overflow-hidden rounded-[inherit]">
                <Image src={`${imgBase}/g4.jpg`} alt="" fill sizes="(min-width:1024px) 14rem, 42vw" className="object-cover" {...blurFor("g4")} />
              </div>
            </motion.figure>
            <motion.figure
              style={{ y: reduce ? 0 : yImg, animationDelay: "440ms" }}
              className="polaroid absolute bottom-[2%] right-[6%] z-30 w-[38%] rotate-[-7deg] animate-rise"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-[inherit]">
                <Image src={`${imgBase}/g5.jpg`} alt="" fill sizes="(min-width:1024px) 13rem, 38vw" className="object-cover" {...blurFor("g5")} />
              </div>
            </motion.figure>
            {t.about?.stats?.[0] && (
              <StatChip stat={t.about.stats[0]} position="bottom-[10%] left-[2%]" delay="620ms" />
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── Arch (boutique/garden/sweet retail): copy beside an arch-framed photo
  //    with ghost type behind it — a soft, ornamental register ──
  if (variant === "arch") {
    return (
      <section ref={ref} id="top" className="gradient-mesh-anim relative w-full overflow-x-clip bg-bg">
        <div className="container-max grid min-h-dvh items-center gap-12 pt-28 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="relative z-10 max-w-xl">
            <span className="eyebrow mb-5 inline-flex animate-rise items-center gap-2" style={{ animationDelay: "0ms" }}>
              <Sparkle className="h-3.5 w-3.5" />
              {t.hero.eyebrow}
            </span>
            <h1 className="text-display text-ink">
              <span className="block animate-rise" style={{ animationDelay: "60ms" }}>{t.hero.title}</span>
              <span className="display-accent block animate-rise font-[500] italic text-primary" style={{ animationDelay: "150ms" }}>
                {t.hero.titleAccent}
              </span>
            </h1>
            <p className="text-lead mt-6 animate-rise" style={{ animationDelay: "260ms" }}>{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-rise" style={{ animationDelay: "360ms" }}>
              <a href="#menu" className="btn btn-primary group text-base">
                {t.hero.ctaPrimary}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href={reserveHref} className="btn btn-ink text-base">
                {hasPhone && <Phone className="h-5 w-5" />}
                {t.hero.ctaSecondary}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 animate-rise text-sm text-ink-soft" style={{ animationDelay: "480ms" }}>
              <span className="flex items-center gap-2">{stars}<span className="font-medium text-ink">{t.hero.badge}</span></span>
              <span className="hidden h-4 w-px bg-line sm:block" />
              <span className="hidden items-center gap-1.5 sm:flex"><MapPin className="h-4 w-4 text-primary" />{biz.city}, {biz.state}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[24rem] sm:max-w-[26rem]">
            <span
              aria-hidden
              className="ghost-word ghost-fade absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 animate-rise text-[clamp(3rem,6vw,5rem)]"
              style={{ animationDelay: "200ms" }}
            >
              {biz.shortName}
            </span>
            <motion.figure
              style={{ y: reduce ? 0 : yMid }}
              className="relative animate-rise overflow-hidden rounded-t-[999px] rounded-b-3xl border-[6px] border-bg shadow-lifted ring-1 ring-line"
            >
              <div className="relative aspect-[3/4]">
                <Image src={`${imgBase}/hero.jpg`} alt={`${biz.name} — ${t.hero.eyebrow}`} fill priority style={vtHero} sizes="(min-width:1024px) 24rem, 88vw" className="object-cover" {...blurProps} />
              </div>
            </motion.figure>
            {t.about?.stats?.[0] && <StatChip stat={t.about.stats[0]} position="-left-8 bottom-14" delay="560ms" />}
          </div>
        </div>
      </section>
    );
  }

  // ── Feast (type-forward casual food): giant centered display type hanging
  //    into a full-width photo band, glass action card layered on the seam ──
  if (variant === "feast") {
    return (
      <section ref={ref} id="top" className="relative w-full overflow-x-clip bg-bg">
        <div className="container-max relative z-10 pt-24 text-center sm:pt-28">
          <span className="eyebrow mb-5 inline-flex animate-rise items-center gap-2" style={{ animationDelay: "0ms" }}>
            <Sparkle className="h-3.5 w-3.5" />
            {t.hero.eyebrow}
          </span>
          <h1 className="text-display mx-auto max-w-4xl text-ink">
            <span className="block animate-rise" style={{ animationDelay: "60ms" }}>{t.hero.title}</span>
            {/* the accent line hangs down into the photo band below */}
            <span className="display-accent relative z-10 -mb-[0.4em] block animate-rise font-[500] italic text-primary [text-shadow:0_2px_16px_color-mix(in_srgb,var(--color-bg)_80%,transparent)]" style={{ animationDelay: "150ms" }}>
              {t.hero.titleAccent}
            </span>
          </h1>
        </div>

        {/* band height + card overlap tuned so the action card's CTAs sit fully
            above the fold on 800-900px-tall desktops (re-critique regression) */}
        <div className="relative mt-0 h-[38vh] min-h-[16rem] w-full overflow-hidden sm:h-[42vh]">
          <motion.div style={{ y: reduce ? 0 : yImg }} className="absolute inset-x-0 top-0 h-[112%]">
            <Image src={`${imgBase}/hero.jpg`} alt={`${biz.name} — ${t.hero.eyebrow}`} fill priority style={vtHero} sizes="100vw" className="animate-kenburns object-cover" {...blurProps} />
          </motion.div>
          {/* eased fade from the page background so the hanging accent stays
              legible without a hard gradient edge (re-critique v2) */}
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-bg via-bg/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
          {t.about?.stats?.[0] && <StatChip stat={t.about.stats[0]} position="right-[6%] top-[30%]" delay="560ms" />}
        </div>

        {/* glass action card pulled up over the photo's bottom edge; tight
            bottom padding so no dead band sits between card and next section */}
        <div className="container-max relative z-10 -mt-20 pb-4 sm:-mt-28">
          <div className="glass mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl px-6 py-6 text-center animate-rise sm:px-10" style={{ animationDelay: "320ms" }}>
            <p className="max-w-xl text-ink-soft">{t.hero.subtitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="#menu" className="btn btn-primary group text-base">
                {t.hero.ctaPrimary}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href={reserveHref} className="btn btn-ink text-base">
                {hasPhone && <Phone className="h-5 w-5" />}
                {t.hero.ctaSecondary}
              </a>
            </div>
            <span className="flex items-center gap-2 text-sm text-ink-soft">{stars}<span className="font-medium text-ink">{t.hero.badge}</span></span>
          </div>
        </div>
      </section>
    );
  }

  // ── Split (authority): copy on light + photo in a contained bordered panel ──
  if (variant === "split") {
    return (
      <section ref={ref} id="top" className="relative w-full bg-bg">
        <div className="container-max grid min-h-dvh items-center gap-10 py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="max-w-xl">
            <span className="eyebrow mb-5 inline-flex animate-rise items-center gap-2" style={{ animationDelay: "0ms" }}>
              <Sparkle className="h-3.5 w-3.5" />
              {t.hero.eyebrow}
            </span>
            <h1 className="text-display text-ink">
              <span className="block animate-rise" style={{ animationDelay: "60ms" }}>{t.hero.title}</span>
              <span className="display-accent block animate-rise font-[500] italic text-primary" style={{ animationDelay: "150ms" }}>
                {t.hero.titleAccent}
              </span>
            </h1>
            <p className="text-lead mt-6 animate-rise" style={{ animationDelay: "260ms" }}>{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-rise" style={{ animationDelay: "360ms" }}>
              <a href="#menu" className="btn btn-primary group text-base">
                {t.hero.ctaPrimary}
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a href={reserveHref} className="btn btn-ink text-base">
                {hasPhone && <Phone className="h-5 w-5" />}
                {t.hero.ctaSecondary}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 animate-rise text-sm text-ink-soft" style={{ animationDelay: "480ms" }}>
              <span className="flex items-center gap-2">{stars}<span className="font-medium text-ink">{t.hero.badge}</span></span>
              <span className="hidden h-4 w-px bg-line sm:block" />
              <span className="hidden font-medium sm:inline">{t.hero.eyebrow}</span>
            </div>
          </div>
          <div className="relative">
            <motion.figure
              style={{ y: reduce ? 0 : yImg }}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line shadow-lifted"
            >
              <Image src={`${imgBase}/hero.jpg`} alt={`${biz.name} — ${t.hero.eyebrow}`} fill priority style={vtHero} sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" {...blurProps} />
            </motion.figure>
            {/* Floating proof chips break the seam for foreground depth (existing stat data, desktop only). */}
            {t.about?.stats?.[0] && <StatChip stat={t.about.stats[0]} position="-left-6 top-10" delay="560ms" />}
            {t.about?.stats?.[1] && <StatChip stat={t.about.stats[1]} position="-bottom-6 -right-6" delay="680ms" />}
          </div>
        </div>
      </section>
    );
  }

  // ── Full-bleed (default): left or centered copy over the photo ──
  const centered = variant === "centered";
  return (
    <section ref={ref} id="top" className="relative min-h-dvh w-full overflow-hidden">
      <motion.div style={{ y: reduce ? 0 : yImg }} className="absolute inset-x-0 top-0 h-[112%]">
        <Image src={`${imgBase}/hero.jpg`} alt={`${biz.name} — ${t.hero.eyebrow}`} fill priority style={vtHero} sizes="100vw" className="animate-kenburns object-cover" {...blurProps} />
      </motion.div>
      <div className="absolute inset-0 bg-black/40 sm:hidden" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" />
      {centered ? (
        <div className="absolute inset-0 bg-black/50" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-bg" />

      <motion.div
        style={{ y: reduce ? 0 : yCopy }}
        className="container-max relative z-10 flex min-h-dvh flex-col justify-center pt-24 pb-40"
      >
        <div className={`[text-shadow:0_2px_18px_rgba(0,0,0,0.45)] ${centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}`}>
          <span className="eyebrow-on-dark mb-5 inline-flex animate-rise items-center gap-2" style={{ animationDelay: "0ms" }}>
            <Sparkle className="h-3.5 w-3.5" />
            {t.hero.eyebrow}
          </span>
          <h1 className="text-display text-white">
            <span className="block animate-rise" style={{ animationDelay: "60ms" }}>{t.hero.title}</span>
            <span className="text-gradient-accent display-accent block animate-rise font-[500] italic" style={{ animationDelay: "150ms" }}>
              {t.hero.titleAccent}
            </span>
          </h1>
          <p className={`mt-6 max-w-xl animate-rise text-lg text-white/90 ${centered ? "mx-auto" : ""}`} style={{ animationDelay: "260ms" }}>
            {t.hero.subtitle}
          </p>
          <div className={`mt-8 flex flex-wrap items-center gap-3 animate-rise ${centered ? "justify-center" : ""}`} style={{ animationDelay: "360ms" }}>
            <a href="#menu" className="btn btn-primary group text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {t.hero.ctaPrimary}
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href={reserveHref} className="btn btn-ghost text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {hasPhone && <Phone className="h-5 w-5" />}
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-10 hidden sm:block">
        <div className="container-max pb-8">
          <div
            className={`glass-dark flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl px-6 py-4 text-sm text-white animate-rise ${centered ? "justify-center text-center" : ""}`}
            style={{ animationDelay: "560ms" }}
          >
            <span className="flex items-center gap-2">{stars}<span className="font-medium">{t.hero.badge}</span></span>
            <span className="hidden h-4 w-px bg-white/20 md:block" />
            <span className="hidden font-medium md:inline">{t.hero.eyebrow}</span>
            <span className="hidden h-4 w-px bg-white/20 lg:block" />
            <span className="hidden items-center gap-1.5 lg:flex">
              <MapPin className="h-4 w-4" />
              {biz.address}, {biz.city}, {biz.state}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
