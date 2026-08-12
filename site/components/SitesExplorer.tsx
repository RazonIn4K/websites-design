"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
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
  /** Corner/shadow register from the tenant's layout — subtle card variation. */
  edge?: "hard" | "crisp";
  /** True for surface:"ink" tenants — the card runs their dark palette. */
  ink?: boolean;
}

/**
 * Filterable portfolio explorer for the /sites index — the pitch surface.
 * Client-side chip filters over serialized card data (no fetches); the full
 * grid is server-rendered for the default "All" state, so no-JS still shows
 * everything. Active filters mirror into the querystring (replaceState) so a
 * filtered view survives reload/share; SSR always renders All/All and the URL
 * is read once post-mount, so there is no hydration mismatch.
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

  // Initialize from the URL once, post-hydration (server markup is All/All).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    const des = params.get("design");
    if (cat && categories.includes(cat)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only URL → state sync after mount
      setCategory(cat);
    }
    if (des && designs.includes(des)) {
      setDesign(des);
    }
  }, [categories, designs]);

  // Reflect active filters into the querystring. The first run is skipped:
  // it fires in the same commit as the URL→state init above, still holding
  // the default All/All, and would wipe a shared link's params before the
  // parsed state lands.
  const syncedOnce = useRef(false);
  useEffect(() => {
    if (!syncedOnce.current) {
      syncedOnce.current = true;
      return;
    }
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (design !== "All") params.set("design", design);
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
    );
  }, [category, design]);

  // Cross-filtered option counts: each chip shows how many sites clicking it
  // would yield GIVEN the other dimension's active filter, so counts never lie.
  const byDesign = design === "All" ? items : items.filter((i) => i.design === design);
  const byCategory = category === "All" ? items : items.filter((i) => i.category === category);
  const visible = byDesign.filter((i) => category === "All" || i.category === category);
  const categoryCount = (c: string) =>
    c === "All" ? byDesign.length : byDesign.filter((i) => i.category === c).length;
  const designCount = (d: string) =>
    d === "All" ? byCategory.length : byCategory.filter((i) => i.design === d).length;

  const chip = (active: boolean) =>
    `shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
      active
        ? "border-primary bg-primary text-white"
        : "border-line bg-surface text-ink-soft hover:border-primary/50 hover:text-ink"
    }`;

  return (
    <>
      <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-3">
        <div className="no-scrollbar chip-rail flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:justify-center" role="group" aria-label="Filter by business type">
          {categories.map((c) => (
            <button key={c} aria-pressed={category === c} className={chip(category === c)} onClick={() => setCategory(c)}>
              {c}
              <span className="ml-1.5 text-xs font-normal tabular-nums opacity-70">{categoryCount(c)}</span>
            </button>
          ))}
        </div>
        <div className="no-scrollbar chip-rail flex items-center gap-2 overflow-x-auto sm:flex-wrap sm:justify-center" role="group" aria-label="Filter by design system">
          {designs.map((d) => (
            <button key={d} aria-pressed={design === d} className={chip(design === d)} onClick={() => setDesign(d)}>
              {d === "All" ? "All designs" : d}
              <span className="ml-1.5 text-xs font-normal tabular-nums opacity-70">{designCount(d)}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-ink-soft" role="status">
          {visible.length} of {items.length} sites
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="mx-auto mt-14 max-w-md text-center">
          <p className="font-display text-lg font-bold text-ink">No sites match those filters.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Try a different combination, or reset to browse all {items.length} sites.
          </p>
          <button
            className="btn btn-ink mt-6"
            onClick={() => {
              setCategory("All");
              setDesign("All");
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
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
                <span
                  className={`shrink-0 text-sm font-semibold text-primary ${c.edge === "hard" ? "uppercase tracking-wide" : ""}`}
                  // On ink cards the raw brand primary can sink into the dark
                  // surface — lighten toward the (near-white) ink, mirroring the
                  // [data-surface="ink"] link rule on the tenant pages.
                  style={c.ink ? { color: "color-mix(in srgb, var(--color-primary) 45%, var(--color-ink))" } : undefined}
                >
                  View concept →
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </>
  );
}
