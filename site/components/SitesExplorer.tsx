"use client";

import { useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import Image from "next/image";

export interface SiteCard {
  slug: string;
  href: string;
  name: string;
  vertical: string;
  address: string;
  cityState: string;
  category: string;
  design: string;
  themeVars: Record<string, string>;
  blurHero?: string;
}

/**
 * Filterable portfolio explorer for the /sites index — the pitch surface.
 * Client-side chip filters over serialized card data (no fetches); the full
 * grid is server-rendered for the default "All" state, so no-JS still shows
 * everything.
 */
export function SitesExplorer({ items }: { items: SiteCard[] }) {
  const [category, setCategory] = useState("All");
  const [design, setDesign] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.category))).sort()],
    [items],
  );
  const designs = useMemo(
    () => ["All", ...Array.from(new Set(items.map((i) => i.design))).sort()],
    [items],
  );

  const visible = items.filter(
    (i) => (category === "All" || i.category === category) && (design === "All" || i.design === design),
  );

  const chip = (active: boolean) =>
    `shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
      active
        ? "border-primary bg-primary text-white"
        : "border-line bg-surface text-ink-soft hover:border-primary/50 hover:text-ink"
    }`;

  return (
    <>
      <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-3">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:justify-center" role="group" aria-label="Filter by business type">
          {categories.map((c) => (
            <button key={c} aria-pressed={category === c} className={chip(category === c)} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:justify-center" role="group" aria-label="Filter by design system">
          {designs.map((d) => (
            <button key={d} aria-pressed={design === d} className={chip(design === d)} onClick={() => setDesign(d)}>
              {d === "All" ? "All designs" : d}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-ink-soft" role="status">
          {visible.length} of {items.length} sites
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((c, index) => (
          // Real <a> (not next/link): the card→site navigation is a genuine
          // document navigation so the cross-document view transition fires;
          // speculation-rules prerendering (see /sites page) keeps it instant.
          // At click time the card's photo becomes the document's single
          // vt-hero element, which morphs into the destination hero.
          <a
            key={c.slug}
            href={c.href}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              const img = e.currentTarget.querySelector("img");
              if (img) (img.style as CSSProperties & { viewTransitionName?: string }).viewTransitionName = "vt-hero";
            }}
            style={c.themeVars as CSSProperties}
            className="card hover-lift group block overflow-hidden no-underline"
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={`/img/${c.slug}/hero.jpg`}
                alt={c.name}
                fill
                priority={index === 0}
                sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                {...(c.blurHero ? { placeholder: "blur" as const, blurDataURL: c.blurHero } : {})}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <span className="badge-overlay absolute right-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider">
                {c.design}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-xs font-bold uppercase tracking-widest text-white/85">{c.vertical}</p>
                <h2 className="mt-1 font-display text-2xl font-black text-white">{c.name}</h2>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-7 py-5">
              <span className="text-sm text-ink-soft">
                {c.address}, {c.cityState}
              </span>
              <span className="shrink-0 text-sm font-semibold text-primary">View live site →</span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
