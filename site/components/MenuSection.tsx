"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";
import { TiltFigure } from "@/components/TiltCard";
import type { MenuItem } from "@/lib/content";

const TAG_LABELS: Record<string, { en: string; es: string; cls: string }> = {
  popular: { en: "★ Popular", es: "★ Favorito", cls: "badge-accent" },
  signature: { en: "Signature", es: "Especial", cls: "badge-primary" },
  value: { en: "Great Value", es: "Buen Precio", cls: "badge-veg" },
  fast: { en: "Quick", es: "Rápido", cls: "badge-spicy" },
  guarantee: { en: "Guaranteed", es: "Garantizado", cls: "badge-veg" },
  new: { en: "New", es: "Nuevo", cls: "badge-accent" },
  vegetarian: { en: "Veggie", es: "Vegetariano", cls: "badge-veg" },
  spicy: { en: "Spicy", es: "Picante", cls: "badge-spicy" },
  "house special": { en: "House Special", es: "Especial", cls: "badge-primary" },
};

const FAV_LABEL = { en: "Crowd Favorites", es: "Los Favoritos" };
const SERVICES_FAV_LABEL = { en: "Most Requested", es: "Lo Más Solicitado" };

function Tags({ tags, lang }: { tags: string[]; lang: "en" | "es" }) {
  if (!tags.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const meta = TAG_LABELS[tag];
        return meta ? <span key={tag} className={`badge ${meta.cls}`}>{meta[lang]}</span> : null;
      })}
    </div>
  );
}

function ItemRow({ item, lang, as: Heading = "h3" }: { item: MenuItem; lang: "en" | "es"; as?: "h3" | "h4" }) {
  const tags = item.tags ?? [];
  return (
    <div className="group -mx-3 border-b border-line/60 px-3 py-5 transition-colors last:border-0 hover:bg-surface/50">
      <div className="flex items-baseline">
        <Heading className="font-display text-lg font-bold text-ink">{item.name}</Heading>
        <span aria-hidden className="mx-3 mt-3 flex-1 border-b border-dotted border-line" />
        <span className="font-display text-lg font-black tabular-nums text-primary">{item.price}</span>
      </div>
      <p className="mt-1 max-w-prose text-sm text-ink-soft">{item.desc}</p>
      <Tags tags={tags} lang={lang} />
    </div>
  );
}

// Shelf variant (craft retail): a compact product card with a prominent price
// and attribute chips, laid out in a dense catalog grid.
function ShelfCard({ item, lang }: { item: MenuItem; lang: "en" | "es" }) {
  const tags = item.tags ?? [];
  return (
    <div className="hover-lift flex flex-col rounded-2xl border border-line bg-bg p-5 shadow-card">
      {/* flex-wrap, no shrink-0: in the dense 2–4 col grid the cards get as
          narrow as ~8rem, so a fixed-width price beside a long title overflows
          the card (and widened the page). Wrapping drops the price to its own
          line only when the pair doesn't fit. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
        <h3 className="wrap-break-word font-display text-lg font-bold leading-tight text-ink">{item.name}</h3>
        <span className="font-display text-lg font-black tabular-nums text-primary">{item.price}</span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{item.desc}</p>
      <Tags tags={tags} lang={lang} />
    </div>
  );
}

// Services variant: a card with the price as a chip (handles non-numeric
// strings like "Free Estimate" / "From $50") instead of a dotted price leader.
function ServiceCard({ item, lang }: { item: MenuItem; lang: "en" | "es" }) {
  const tags = item.tags ?? [];
  return (
    <div className="hover-lift rounded-2xl border border-line bg-bg p-6 shadow-card">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-h3 min-w-0 text-ink">{item.name}</h3>
        <span className="badge badge-primary max-w-full shrink-0 self-start whitespace-normal">{item.price}</span>
      </div>
      <p className="mt-2 text-sm text-ink-soft">{item.desc}</p>
      <Tags tags={tags} lang={lang} />
    </div>
  );
}

export function MenuSection() {
  const { t, lang, imgBase, blur, layout } = useLang();
  const services = layout.menuKind === "services";
  const carte = layout.menuKind === "carte";
  const shelf = layout.menuKind === "shelf";
  const categories = t.menu.categories;
  const [active, setActive] = useState(categories[0].id);

  const favorites = categories
    .flatMap((c) => c.items)
    .filter((it) => (it.tags ?? []).includes("popular"))
    .slice(0, 3);

  return (
    <section id="menu" className="section bg-surface-alt">
      <div className="container-max">
        <SectionHeader eyebrow={t.nav.menu} heading={t.menu.heading} sub={t.menu.subheading} />

        {carte ? (
          /* Typeset bill-of-fare: every category stacked, no tabs, paper grain. */
          <div className="noise-overlay rounded-2xl bg-bg p-6 shadow-card sm:p-10">
            <div className="gap-x-14 md:columns-2">
              {categories.map((c) => (
                <div key={c.id} className="mb-9 break-inside-avoid">
                  <div className="mb-4 text-center">
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.22em] text-primary">{c.name}</h3>
                    <span aria-hidden className="mx-auto mt-3 block h-px w-16 bg-line" />
                    {c.blurb && <p className="mt-2 text-sm italic text-ink-soft">{c.blurb}</p>}
                  </div>
                  {c.items.map((item) => (
                    <ItemRow key={item.name} item={item} lang={lang} as="h4" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
        {/* Crowd Favorites — photo strip for food/drink; a typographic trio for
            service businesses (gallery photos rarely match specific services,
            so a numbered card sells the offer better than a mismatched image) */}
        {favorites.length >= 3 && (
          <div className="mb-[var(--header-gap)]">
            <p className="eyebrow mb-5 text-center">{(services ? SERVICES_FAV_LABEL : FAV_LABEL)[lang]}</p>
            {services ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {favorites.map((it, idx) => (
                  <Reveal
                    key={it.name}
                    delay={idx * 0.08}
                    className="hover-lift relative overflow-hidden rounded-2xl border border-line bg-bg p-7 shadow-card"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-1 -top-5 select-none font-display text-[5.5rem] font-black leading-none text-primary/10"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="relative max-w-[80%] font-display text-xl font-black text-ink">{it.name}</h3>
                    <p className="relative mt-2 text-sm text-ink-soft">{it.desc}</p>
                    <span className="badge badge-primary relative mt-4">{it.price}</span>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {favorites.map((it, idx) => (
                  <Reveal key={it.name} delay={idx * 0.08}>
                  {/* pointer-fine 3D tilt replaces hover-lift here (inline Motion
                      transform would fight the CSS hover translate) */}
                  <TiltFigure className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-card">
                    <Image
                      src={`${imgBase}/g${idx + 1}.jpg`}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 30vw, 90vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      {...(blur[`g${idx + 1}`] ? { placeholder: "blur" as const, blurDataURL: blur[`g${idx + 1}`] } : {})}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <span className="badge-overlay absolute right-3 top-3 rounded-full px-3 py-1 font-display text-sm font-black tabular-nums text-white">
                      {it.price}
                    </span>
                    <figcaption className="absolute inset-x-0 bottom-0 p-5">
                      <span className="badge badge-accent">{TAG_LABELS.popular[lang]}</span>
                      <h3 className="mt-2 font-display text-xl font-black text-white">{it.name}</h3>
                    </figcaption>
                  </TiltFigure>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="no-scrollbar flex snap-x-mandatory gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              aria-pressed={active === c.id}
              className={`relative shrink-0 snap-start rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                active === c.id ? "text-white" : "bg-white/70 text-ink-soft hover:text-ink"
              }`}
            >
              {active === c.id && (
                <motion.span
                  layoutId="menuTab"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{c.name}</span>
            </button>
          ))}
        </div>

        {/* Items — every category is rendered (hidden when inactive) so all
            content is present in the SSR HTML and reachable without JS. */}
        <div className={`mt-8 ${services || shelf ? "" : "rounded-2xl bg-bg p-6 shadow-card sm:p-10"}`}>
          {categories.map((c) => (
            <div key={c.id} hidden={c.id !== active} className="motion-safe:animate-rise">
              <div className="mb-4 flex items-center gap-3">
                <span aria-hidden className="h-px w-10 bg-primary" />
                <p className="font-display text-xl font-bold italic text-primary-dark">{c.blurb}</p>
              </div>
              <div
                className={
                  shelf
                    ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                    : services
                      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      : "grid gap-x-12 sm:grid-cols-2"
                }
              >
                {c.items.map((item) =>
                  shelf ? (
                    <ShelfCard key={item.name} item={item} lang={lang} />
                  ) : services ? (
                    <ServiceCard key={item.name} item={item} lang={lang} />
                  ) : (
                    <ItemRow key={item.name} item={item} lang={lang} />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
          </>
        )}
      </div>
    </section>
  );
}
