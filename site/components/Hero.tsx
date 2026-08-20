"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { CountUp } from "@/components/CountUp";
import { ArrowRight, Phone, Sparkle, Star, MapPin } from "@/components/icons";
import type { SiteLayout } from "@/lib/clients";

/** Cross-document morph target: the /sites card image names itself vt-hero at
 *  click time, and this (the only vt-hero in the destination document) is what
 *  it morphs into. */
const vtHero = { viewTransitionName: "vt-hero" } as const;

/** Accent-line treatment for the second headline line, varied by tenant scope
 *  so 72 sites stop sharing one italic fingerprint:
 *  - edge "hard" (craft/industrial): solid `text-accent`, no italic — pairs
 *    with stacked uppercase lines (the scope CSS already flattens
 *    text-gradient-accent to the same solid for these tenants);
 *  - archetype "authority" (light pages only): quiet professional — secondary
 *    color, weight 600, no italic (wght re-declared inline because
 *    font-variation-settings inherits resolved from .text-display's 900);
 *  - everything else keeps the italic serif accent (food/wellness/editorial). */
function heroAccent(layout: SiteLayout, dark: boolean): { className: string; style?: CSSProperties } {
  if (layout.edge === "hard") return { className: "text-accent" };
  if (layout.archetype === "authority" && !dark) {
    return {
      className: "font-semibold text-secondary",
      style: { fontVariationSettings: '"opsz" 144, "wght" 600' },
    };
  }
  return { className: `display-accent font-[500] italic ${dark ? "text-gradient-accent" : "text-primary"}` };
}

/** Compact decorative stars-plus-badge lockup. The glyph row is aria-hidden —
 *  the adjacent localized badge text carries the meaning (no invented counts). */
function StarLockup({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  const { t } = useLang();
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden className="flex text-accent">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5" />
        ))}
      </span>
      <span className={`font-medium ${dark ? "text-white" : "text-ink"}`}>{t.hero.badge}</span>
    </span>
  );
}

/** Typographic proof mark over the hero photo seam — an opaque ink chip with
 *  an accent hairline (badge-overlay recipe: solid fill, no backdrop blur).
 *  The stat `value` is a short number on some tenants ("100%") but a phrase on
 *  most ("Walk-Ins", "Dogs · Cats · Small Pets"), so size by length + constrain
 *  width and let long values wrap. Desktop only, decorative. */
function StatMark({ stat, position, delay }: { stat: { value: string; label: string }; position: string; delay: string }) {
  const big = String(stat.value).length <= 6;
  return (
    <div
      aria-hidden
      className={`animate-rise pointer-events-none absolute z-10 hidden max-w-[13.5rem] rounded-r-md border-l-2 border-accent bg-black/70 py-2.5 pr-4 pl-4 lg:block ${position}`}
      style={{ animationDelay: delay }}
    >
      <CountUp value={stat.value} className={`block font-display font-black leading-tight text-white text-balance ${big ? "text-2xl" : "text-base"}`} />
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/80">{stat.label}</div>
    </div>
  );
}

/** Shared hero copy stack: eyebrow → h1 (+scoped accent line) → lead → CTA row
 *  → proof row. One composition, per-branch knobs only — every branch except
 *  feast (which splits the stack around its photo band) renders this. */
function HeroCopy({
  dark = false,
  center = false,
  proof = "city",
  className = "",
}: {
  /** Rendered over a darkened photo (full-bleed hero) — white type register. */
  dark?: boolean;
  /** Center alignment (centered full-bleed variant). */
  center?: boolean;
  /** Trailing proof item after the stars lockup. */
  proof?: "city" | "eyebrow" | "none";
  className?: string;
}) {
  const { t, biz, hasPhone, layout } = useLang();
  const hard = layout.edge === "hard";
  const reserveHref = hasPhone ? `tel:${biz.phoneHref}` : "#visit";
  const accent = heroAccent(layout, dark);
  const focusDark = dark ? " focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" : "";
  const rule = <span className={`hidden h-4 w-px sm:block ${dark ? "bg-white/25" : "bg-line"}`} />;
  return (
    <div className={`${center ? "mx-auto text-center" : ""} ${className}`}>
      <span className={`${dark ? "eyebrow-on-dark" : "eyebrow"} mb-4 inline-flex animate-rise items-center gap-2`} style={{ animationDelay: "0ms" }}>
        <Sparkle className="h-3.5 w-3.5" />
        {t.hero.eyebrow}
      </span>
      {/* Hard-edge tenants: stacked uppercase lines, tighter leading (inline —
          .text-display is unlayered CSS, so a leading-* utility can't win). */}
      <h1
        className={`text-display ${dark ? "text-white" : "text-ink"} ${hard ? "uppercase" : ""}`}
        style={hard ? { lineHeight: 0.88 } : undefined}
      >
        <span className="block animate-rise" style={{ animationDelay: "60ms" }}>{t.hero.title}</span>
        <span className={`block animate-rise ${accent.className}`} style={{ animationDelay: "150ms", ...accent.style }}>
          {t.hero.titleAccent}
        </span>
      </h1>
      <p
        className={dark ? `mt-5 max-w-xl animate-rise text-lg text-white/90 ${center ? "mx-auto" : ""}` : "text-lead mt-5 animate-rise"}
        style={{ animationDelay: "260ms" }}
      >
        {t.hero.subtitle}
      </p>
      <div className={`mt-6 flex flex-wrap items-center gap-3 animate-rise ${center ? "justify-center" : ""}`} style={{ animationDelay: "360ms" }}>
        <a href="#menu" className={`btn btn-primary group text-base${focusDark}`}>
          {t.hero.ctaPrimary}
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
        <a href={reserveHref} className={`btn ${dark ? "btn-ghost" : "btn-ink"} text-base${focusDark}`}>
          {hasPhone && <Phone className="h-5 w-5" />}
          {t.hero.ctaSecondary}
        </a>
      </div>
      {proof !== "none" && (
        <div
          className={`mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 animate-rise text-sm ${dark ? "text-white/85" : "text-ink-soft"} ${center ? "justify-center" : ""}`}
          style={{ animationDelay: "480ms" }}
        >
          <StarLockup dark={dark} />
          {proof === "city" && (
            <>
              {rule}
              <span className="hidden items-center gap-1.5 sm:flex">
                <MapPin className={`h-4 w-4 ${dark ? "" : "text-primary"}`} />
                {biz.city}, {biz.state}
              </span>
            </>
          )}
          {proof === "eyebrow" && (
            <>
              {rule}
              <span className="hidden font-medium sm:inline">{t.hero.eyebrow}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Hero() {
  const { t, biz, hasPhone, imgBase, blur, layout } = useLang();
  // Craft/authority default to split so trades never fall back to restaurant full-bleed.
  const variant =
    layout.hero ??
    (layout.archetype === "craft" || layout.archetype === "authority" ? "split" : "left");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const yCopy = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const yMid = useTransform(scrollYProgress, [0, 1], ["0%", "7%"]);
  const ySlow = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);

  const blurProps = blur.hero ? { placeholder: "blur" as const, blurDataURL: blur.hero } : {};
  const blurFor = (k: string) => (blur[k] ? { placeholder: "blur" as const, blurDataURL: blur[k] } : {});

  // ── Editorial split: photo beside a typeset copy panel. Photo stretches to
  //    copy height on lg — no hollow band under a short headline. ──
  if (variant === "editorial") {
    return (
      <section ref={ref} id="top" className="relative w-full">
        <div className="grid lg:grid-cols-2">
          <div className="gradient-mesh-anim order-2 flex flex-col justify-center bg-surface px-6 py-12 sm:px-12 lg:order-1 lg:px-14 lg:py-14">
            <HeroCopy className="relative max-w-xl" />
          </div>
          <div className="relative order-1 min-h-[36vh] overflow-hidden lg:order-2 lg:min-h-[18rem]">
            <motion.div style={{ y: reduce ? 0 : yImg }} className="absolute inset-x-0 top-0 h-[110%] lg:h-[115%]">
              <Image src={`${imgBase}/hero.jpg`} alt={`${biz.name} — ${t.hero.eyebrow}`} fill priority style={vtHero} sizes="(min-width:1024px) 50vw, 100vw" className="animate-kenburns object-cover" {...blurProps} />
            </motion.div>
          </div>
        </div>
        {/* Proof marks over the photo's inner edge (lg only) — kept past the
            50% seam so they never reach the copy panel's headline/CTAs. */}
        {t.about?.stats?.[0] && <StatMark stat={t.about.stats[0]} position="left-[51%] top-[18%]" delay="560ms" />}
        {t.about?.stats?.[1] && <StatMark stat={t.about.stats[1]} position="bottom-[15%] left-[57%]" delay="680ms" />}
      </section>
    );
  }

  // ── Collage (playful retail): layered polaroid photo stack over a breathing
  //    mesh, ghost display type behind, depth via three parallax speeds ──
  if (variant === "collage") {
    return (
      <section ref={ref} id="top" className="gradient-mesh-anim relative w-full overflow-x-clip bg-bg">
        <div className="container-max grid items-center gap-6 pt-14 pb-10 lg:grid-cols-2 lg:gap-8 lg:pt-16">
          <HeroCopy className="relative z-10 max-w-xl" />

          {/* Layered photo stack: ghost type at the back, then three polaroids
              at three parallax speeds — nearest moves most. Decorative photos
              carry empty alt; the composition is described by the copy column. */}
          <div className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[26rem] lg:max-w-[28rem]">
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
              <StatMark stat={t.about.stats[0]} position="bottom-[10%] left-[2%]" delay="620ms" />
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
        <div className="container-max grid items-center gap-6 pt-14 pb-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pt-16">
          <HeroCopy className="relative z-10 max-w-xl" />

          <div className="relative mx-auto w-full max-w-[20rem] sm:max-w-[22rem]">
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
            {t.about?.stats?.[0] && <StatMark stat={t.about.stats[0]} position="-left-8 bottom-14" delay="560ms" />}
          </div>
        </div>
      </section>
    );
  }

  // ── Feast (type-forward casual food): giant centered display type hanging
  //    into a full-width photo band, glass action card layered on the seam.
  //    The copy stack splits around the photo band, so this branch composes
  //    its own heading (accent treatment still shared via heroAccent). ──
  if (variant === "feast") {
    const accent = heroAccent(layout, false);
    const reserveHref = hasPhone ? `tel:${biz.phoneHref}` : "#visit";
    return (
      <section ref={ref} id="top" className="relative w-full overflow-x-clip bg-bg">
        <div className="container-max relative z-10 pt-16 text-center sm:pt-20">
          <span className="eyebrow mb-3 inline-flex animate-rise items-center gap-2" style={{ animationDelay: "0ms" }}>
            <Sparkle className="h-3.5 w-3.5" />
            {t.hero.eyebrow}
          </span>
          <h1 className="text-display mx-auto max-w-4xl text-ink">
            <span className="block animate-rise" style={{ animationDelay: "60ms" }}>{t.hero.title}</span>
            {/* the accent line hangs down into the photo band below */}
            <span
              className={`relative z-10 -mb-[0.4em] block animate-rise [text-shadow:0_2px_16px_color-mix(in_srgb,var(--color-bg)_80%,transparent)] ${accent.className}`}
              style={{ animationDelay: "150ms", ...accent.style }}
            >
              {t.hero.titleAccent}
            </span>
          </h1>
        </div>

        {/* band height + card overlap tuned so the action card's CTAs sit fully
            above the fold on 800-900px-tall desktops (re-critique regression) */}
        <div className="relative mt-0 h-[28vh] min-h-[14rem] w-full overflow-hidden sm:h-[32vh]">
          <motion.div style={{ y: reduce ? 0 : yImg }} className="absolute inset-x-0 top-0 h-[112%]">
            <Image src={`${imgBase}/hero.jpg`} alt={`${biz.name} — ${t.hero.eyebrow}`} fill priority style={vtHero} sizes="100vw" className="animate-kenburns object-cover" {...blurProps} />
          </motion.div>
          {/* eased fade from the page background so the hanging accent stays
              legible without a hard gradient edge (re-critique v2) */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg via-bg/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
          {t.about?.stats?.[0] && <StatMark stat={t.about.stats[0]} position="right-[6%] top-[30%]" delay="560ms" />}
        </div>

        {/* Solid action card pulled up over the photo's bottom edge (the fleet
            de-glassed in v3 — frosted panels over food photos read washed);
            tight bottom padding so no dead band sits between card and next
            section */}
        <div className="container-max relative z-10 -mt-16 pb-4 sm:-mt-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-2xl border border-line bg-bg/95 px-6 py-5 text-center shadow-card animate-rise sm:px-10" style={{ animationDelay: "320ms" }}>
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
            <StarLockup className="text-sm" />
          </div>
        </div>
      </section>
    );
  }

  // ── Split (authority/craft): copy + contained photo. Photo column stretches
  //    to the copy height on lg so neither side leaves a hollow band. ──
  if (variant === "split") {
    return (
      <section ref={ref} id="top" className="relative w-full bg-bg">
        <div className="container-max grid gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-14">
          <HeroCopy className="max-w-xl lg:py-2" proof="eyebrow" />
          <div className="relative min-h-[20rem] lg:min-h-[18rem]">
            <motion.figure
              style={{ y: reduce ? 0 : yImg }}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line shadow-lifted lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
            >
              <Image src={`${imgBase}/hero.jpg`} alt={`${biz.name} — ${t.hero.eyebrow}`} fill priority style={vtHero} sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" {...blurProps} />
            </motion.figure>
            {/* Proof marks break the seam for foreground depth (existing stat data, desktop only). */}
            {t.about?.stats?.[0] && <StatMark stat={t.about.stats[0]} position="-left-6 top-10" delay="560ms" />}
            {t.about?.stats?.[1] && <StatMark stat={t.about.stats[1]} position="bottom-6 -right-4" delay="680ms" />}
          </div>
        </div>
      </section>
    );
  }

  // ── Full-bleed (default): left or centered copy over the photo ──
  const centered = variant === "centered";
  return (
    <section ref={ref} id="top" className="relative min-h-[var(--hero-min)] w-full overflow-hidden">
      <motion.div style={{ y: reduce ? 0 : yImg }} className="absolute inset-x-0 top-0 h-[112%]">
        <Image src={`${imgBase}/hero.jpg`} alt={`${biz.name} — ${t.hero.eyebrow}`} fill priority style={vtHero} sizes="100vw" className="animate-kenburns object-cover" {...blurProps} />
      </motion.div>
      {/* Two-layer scrim (was a 5-rectangle stack): one flat darken for overall
          legibility + one bottom-up gradient for the CTA/proof zone, then the
          final blend into the page background. */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-bg" />

      <motion.div
        style={{ y: reduce ? 0 : yCopy }}
        className="container-max relative z-10 flex min-h-[var(--hero-min)] flex-col justify-center pt-16 pb-20 sm:pt-20 sm:pb-24"
      >
        <HeroCopy
          dark
          center={centered}
          proof="none"
          className={`[text-shadow:0_2px_18px_rgba(0,0,0,0.45)] ${centered ? "max-w-3xl" : "max-w-2xl"}`}
        />
      </motion.div>

      {/* Proof strip set directly on the darkened bottom zone — typographic,
          hairline-ruled, no glass panel. */}
      <div className="absolute inset-x-0 bottom-0 z-10 hidden sm:block">
        <div className="container-max pb-10">
          <div
            className={`flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/25 pt-4 text-sm text-white/90 animate-rise [text-shadow:0_1px_12px_rgba(0,0,0,0.55)] ${centered ? "justify-center text-center" : ""}`}
            style={{ animationDelay: "560ms" }}
          >
            <StarLockup dark />
            <span className="hidden h-4 w-px bg-white/25 md:block" />
            <span className="hidden font-medium md:inline">{t.hero.eyebrow}</span>
            <span className="hidden h-4 w-px bg-white/25 lg:block" />
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
