"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { sectionOrder, type SectionKey } from "@/lib/sections";
import { A11Y } from "@/lib/a11y";
import { Phone, MapPin } from "@/components/icons";

/** Phone numbers inside a label must never wrap mid-number — the longer
 *  Spanish "Llamar al (815) 895-8585" was splitting as "895-" / "8585". */
function NowrapPhones({ text }: { text: string }) {
  const parts = text.split(/(\(\d{3}\)\s?\d{3}-\d{4})/);
  return (
    <>
      {parts.map((p, i) =>
        /^\(\d{3}\)/.test(p) ? (
          <span key={i} className="whitespace-nowrap">{p}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function CtaBand() {
  const { t, biz, hasPhone, lang } = useLang();
  return (
    <section className="container-max py-8">
      <Reveal className="cta-card gradient-brand noise-overlay relative overflow-hidden rounded-3xl px-8 py-10 text-center shadow-lifted sm:px-14 sm:py-12">
        <h2 className="text-h2 relative text-white">{t.cta.heading}</h2>
        <p className="relative mx-auto mt-4 max-w-2xl text-lg text-white/90">{t.cta.text}</p>
        {hasPhone ? (
          /* The number itself is the CTA: a display-scale tel: link. The small
             callLabel overline lives inside the anchor, so the accessible name
             reads "Call (815) 895-8585" straight from the content — no
             aria-label needed, and Label-in-Name holds by construction. */
          <a
            href={`tel:${biz.phoneHref}`}
            className="group relative mt-8 inline-block text-white no-underline"
          >
            <span className="block text-sm font-bold tracking-[0.18em] uppercase text-white/75">
              {A11Y[lang].callLabel}
            </span>
            <span
              className="font-display mt-3 block leading-none transition-opacity duration-200 group-hover:opacity-80"
              // 8.5vw ≈ step-4 at 390px and rides up to the step-5 cap on
              // desktop; the vw term guarantees the nowrap number (~7.5em wide)
              // stays inside the card's padding at every QA viewport.
              style={{
                fontSize: "clamp(2rem, 8.5vw, var(--step-5))",
                fontWeight: 700,
                fontVariationSettings: '"opsz" 96, "wght" 700',
              }}
            >
              <NowrapPhones text={biz.phone} />
            </span>
          </a>
        ) : (
          <a
            href="#lead"
            className="btn btn-lg relative mt-8 bg-white font-bold text-primary shadow-card hover:-translate-y-0.5"
          >
            {t.cta.button}
          </a>
        )}
      </Reveal>
    </section>
  );
}

export function Footer() {
  const { t, biz, hasPhone, layout } = useLang();
  const present = new Set<SectionKey>(sectionOrder(layout.archetype));
  const links = (
    [
      { href: "#menu", label: t.nav.menu, key: "menu" },
      { href: "#about", label: t.nav.about, key: "about" },
      { href: "#gallery", label: t.nav.gallery, key: "gallery" },
      { href: "#visit", label: t.nav.visit, key: "visit" },
    ] as { href: string; label: string; key: SectionKey }[]
  ).filter((l) => present.has(l.key) || (l.key === "about" && present.has("story")));

  return (
    // overflow-hidden crops the statement wordmark's spill (its nowrap width
    // can exceed the viewport — never let it introduce horizontal scroll)
    <footer className="overflow-hidden bg-ink text-white">
      {/* Statement wordmark leads the footer as the sign-off device — sized so
          any shortName spans ~the full width. marginBottom:0 overrides the
          stylesheet's bottom-edge crop offset, which only applies when the
          word sits at the footer's bottom edge. */}
      <div aria-hidden className="statement pt-12">
        <span
          className="statement-word font-display"
          style={{
            fontSize: `min(${(150 / Math.max(biz.shortName.length, 4)).toFixed(2)}vw, 13rem)`,
            marginBottom: 0,
          }}
        >
          {biz.shortName}
        </span>
      </div>

      <div className="container-max grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl font-bold">{biz.shortName}</p>
          <p className="mt-3 max-w-xs text-sm text-white/70">{t.footer.tagline}</p>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold">{t.footer.quickLinks}</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="link-underline text-white/70 no-underline transition-colors hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold">{t.footer.hoursTitle}</h3>
          <dl className="mt-4 space-y-1.5 text-sm">
            {t.visit.hours.map((h) => (
              <div key={h.day} className="flex justify-between gap-3">
                <dt className="text-white/60">{h.day}</dt>
                {/* nowrap + tabular so "9:00 PM" never orphans its meridiem */}
                <dd className="whitespace-nowrap text-white/80 tabular-nums">{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold">{t.visit.heading}</h3>
          {hasPhone && (
            <a
              href={`tel:${biz.phoneHref}`}
              className="mt-4 flex items-center gap-2 text-sm text-white/80 no-underline transition-colors hover:text-accent"
            >
              <Phone className="h-4 w-4 shrink-0" />
              <NowrapPhones text={biz.phone} />
            </a>
          )}
          <p className="mt-3 flex items-start gap-2 text-sm text-white/70">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {biz.address}, {biz.city}, {biz.state} {biz.zip}
            </span>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        {/* pb-24 clears the fixed MobileBar (visible < lg, e.g. with JS off) */}
        <div className="container-max flex flex-col items-center justify-between gap-2 pt-4 pb-24 text-xs text-white/50 sm:flex-row lg:pb-4">
          <span>{t.footer.rights}</span>
          <div className="flex items-center gap-4">
            <span>{t.footer.demoNote ?? "Demo site · Prices illustrative"}</span>
            <Link href="/sites" className="text-white/60 no-underline transition-colors hover:text-accent">
              {t.footer.allSites ?? "All generated sites →"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
