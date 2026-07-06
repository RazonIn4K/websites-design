"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { sectionOrder, type SectionKey } from "@/lib/sections";
import { Phone, MapPin, Instagram, Facebook } from "@/components/icons";

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
  const { t, biz, hasPhone } = useLang();
  return (
    <section className="container-max glow-conic py-8">
      <Reveal className="gradient-brand noise-overlay relative overflow-hidden rounded-3xl px-8 py-16 text-center shadow-lifted sm:px-16">
        <h2 className="text-h2 relative text-white">{t.cta.heading}</h2>
        <p className="relative mx-auto mt-4 max-w-2xl text-lg text-white/90">{t.cta.text}</p>
        <a
          href={hasPhone ? `tel:${biz.phoneHref}` : "#visit"}
          className="btn relative mt-8 bg-white px-8 py-4 text-base font-bold text-primary shadow-card hover:-translate-y-0.5"
        >
          {hasPhone && <Phone className="h-5 w-5" />}
          <span><NowrapPhones text={t.cta.button} /></span>
        </a>
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
    <footer className="bg-ink text-white">
      <div className="container-max grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full gradient-brand font-display text-lg font-black text-white">
              {biz.shortName.charAt(0)}
            </span>
            <span className="font-display text-xl font-black">{biz.name}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-white/70">{t.footer.tagline}</p>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-accent hover:text-accent"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-accent hover:text-accent"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
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
          <h3 className="font-display text-lg font-bold">{t.visit.heading}</h3>
          {hasPhone && (
            <a
              href={`tel:${biz.phoneHref}`}
              className="mt-4 flex items-center gap-2 text-sm text-white/80 no-underline transition-colors hover:text-accent"
            >
              <Phone className="h-4 w-4" />
              {biz.phone}
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
        <div className="container-max flex flex-col items-center justify-between gap-2 pt-5 pb-24 text-xs text-white/50 sm:flex-row lg:pb-5">
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
